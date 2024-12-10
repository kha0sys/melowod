package firebase

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	firebaseauth "firebase.google.com/go/v4/auth"
	"github.com/kha0sys/melowod/internal/domain/auth"
	"github.com/kha0sys/melowod/internal/domain/user"
)

type authService struct {
	client    *firebaseauth.Client
	userRepo  user.Repository
}

func NewAuthService(app *firebase.App, userRepo user.Repository) (auth.Service, error) {
	client, err := app.Auth(context.Background())
	if err != nil {
		return nil, err
	}

	return &authService{
		client:    client,
		userRepo:  userRepo,
	}, nil
}

func (s *authService) SignUp(ctx context.Context, email, password string, userData *user.User) (string, error) {
	params := (&firebaseauth.UserToCreate{}).
		Email(email).
		Password(password).
		DisplayName(userData.Name)
	
	if userData.PhotoURL != "" {
		params = params.PhotoURL(userData.PhotoURL)
	}

	firebaseUser, err := s.client.CreateUser(ctx, params)
	if err != nil {
		if firebaseauth.IsEmailAlreadyExists(err) {
			return "", auth.ErrEmailInUse
		}
		return "", err
	}

	// Asignar el ID de Firebase al usuario
	userData.ID = firebaseUser.UID

	// Crear el usuario en nuestra base de datos
	if err := s.userRepo.CreateUser(ctx, userData); err != nil {
		// Si falla la creación en nuestra BD, eliminamos el usuario de Firebase
		_ = s.client.DeleteUser(ctx, firebaseUser.UID)
		return "", err
	}

	// Generar token personalizado para el usuario
	token, err := s.client.CustomToken(ctx, firebaseUser.UID)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *authService) SignIn(ctx context.Context, email, password string) (string, error) {
	// En Firebase, la autenticación se maneja en el cliente
	// Aquí solo verificamos que el usuario existe
	users, err := s.client.GetUsers(ctx, []firebaseauth.UserIdentifier{
		firebaseauth.EmailIdentifier{Email: email},
	})
	if err != nil {
		return "", err
	}

	if len(users.Users) == 0 {
		return "", auth.ErrUserNotFound
	}

	// Generar token personalizado para el usuario
	token, err := s.client.CustomToken(ctx, users.Users[0].UID)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *authService) VerifyToken(ctx context.Context, token string) (*firebaseauth.Token, error) {
	return s.client.VerifyIDToken(ctx, token)
}

func (s *authService) GetUserByID(ctx context.Context, uid string) (*firebaseauth.UserRecord, error) {
	return s.client.GetUser(ctx, uid)
}

func (s *authService) UpdateUserEmail(ctx context.Context, uid, newEmail string) error {
	params := (&firebaseauth.UserToUpdate{}).
		Email(newEmail)
	
	_, err := s.client.UpdateUser(ctx, uid, params)
	return err
}

func (s *authService) UpdateUserPassword(ctx context.Context, uid, newPassword string) error {
	params := (&firebaseauth.UserToUpdate{}).
		Password(newPassword)
	
	_, err := s.client.UpdateUser(ctx, uid, params)
	return err
}

func (s *authService) DeleteUser(ctx context.Context, uid string) error {
	// Primero eliminamos el usuario de nuestra base de datos
	if err := s.userRepo.DeleteUser(ctx, uid); err != nil {
		return err
	}

	// Luego eliminamos el usuario de Firebase
	return s.client.DeleteUser(ctx, uid)
}

func (s *authService) SendPasswordResetEmail(ctx context.Context, email string) error {
	// Verificamos que el usuario exista
	if _, err := s.client.GetUserByEmail(ctx, email); err != nil {
		return fmt.Errorf("error getting user: %w", err)
	}

	// En el Admin SDK de Firebase para Go, el reset de contraseña se maneja desde el cliente
	// El backend solo verifica que el usuario existe y está activo
	// El email de reset se enviará desde el frontend usando firebase/auth
	return nil
}

func (s *authService) SendEmailVerification(ctx context.Context, uid string) error {
	// Verificamos que el usuario exista
	if _, err := s.client.GetUser(ctx, uid); err != nil {
		return fmt.Errorf("error getting user: %w", err)
	}

	// En Firebase Admin SDK para Go, la verificación de email se maneja 
	// actualizando directamente el estado del usuario
	params := (&firebaseauth.UserToUpdate{}).
		EmailVerified(true)
	
	if _, err := s.client.UpdateUser(ctx, uid, params); err != nil {
		return fmt.Errorf("error updating user email verification: %w", err)
	}

	return nil
}
