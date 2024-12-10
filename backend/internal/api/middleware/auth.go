package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/kha0sys/melowod/internal/domain/auth"
)

type AuthMiddleware struct {
	authService auth.Service
}

func NewAuthMiddleware(authService auth.Service) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		// Extraer el token del header "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.Error(w, "invalid authorization header", http.StatusUnauthorized)
			return
		}

		token := tokenParts[1]

		// Verificar el token
		decodedToken, err := m.authService.VerifyToken(r.Context(), token)
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		// Añadir el ID del usuario al contexto y headers
		ctx := context.WithValue(r.Context(), "user_id", decodedToken.UID)
		r = r.WithContext(ctx)
		r.Header.Set("X-User-ID", decodedToken.UID)

		next(w, r)
	}
}
