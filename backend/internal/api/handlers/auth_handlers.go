package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/kha0sys/melowod/internal/domain/auth"
	"github.com/kha0sys/melowod/internal/domain/user"
)

type SignUpRequest struct {
	Email     string     `json:"email"`
	Password  string     `json:"password"`
	UserData  user.User  `json:"userData"`
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

type AuthHandlers struct {
	authService auth.Service
}

func NewAuthHandlers(authService auth.Service) *AuthHandlers {
	return &AuthHandlers{
		authService: authService,
	}
}

func (h *AuthHandlers) SignUp(w http.ResponseWriter, r *http.Request) {
	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	token, err := h.authService.SignUp(r.Context(), req.Email, req.Password, &req.UserData)
	if err != nil {
		switch err {
		case auth.ErrEmailInUse:
			http.Error(w, err.Error(), http.StatusConflict)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(AuthResponse{Token: token})
}

func (h *AuthHandlers) SignIn(w http.ResponseWriter, r *http.Request) {
	var req SignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	token, err := h.authService.SignIn(r.Context(), req.Email, req.Password)
	if err != nil {
		switch err {
		case auth.ErrInvalidCredentials, auth.ErrUserNotFound:
			http.Error(w, err.Error(), http.StatusUnauthorized)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(AuthResponse{Token: token})
}

func (h *AuthHandlers) SendPasswordReset(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.authService.SendPasswordResetEmail(r.Context(), req.Email); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandlers) SendEmailVerification(w http.ResponseWriter, r *http.Request) {
	uid := r.Header.Get("X-User-ID") // Asumiendo que el middleware de auth añade este header
	if uid == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.authService.SendEmailVerification(r.Context(), uid); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
