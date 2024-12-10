package auth

import (
	"context"
	"errors"

	"firebase.google.com/go/v4/auth"
	"github.com/kha0sys/melowod/internal/domain/user"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound      = errors.New("user not found")
	ErrEmailInUse        = errors.New("email already in use")
)

type Service interface {
	SignUp(ctx context.Context, email, password string, userData *user.User) (string, error)
	SignIn(ctx context.Context, email, password string) (string, error)
	VerifyToken(ctx context.Context, token string) (*auth.Token, error)
	GetUserByID(ctx context.Context, uid string) (*auth.UserRecord, error)
	UpdateUserEmail(ctx context.Context, uid, newEmail string) error
	UpdateUserPassword(ctx context.Context, uid, newPassword string) error
	DeleteUser(ctx context.Context, uid string) error
	SendPasswordResetEmail(ctx context.Context, email string) error
	SendEmailVerification(ctx context.Context, uid string) error
}
