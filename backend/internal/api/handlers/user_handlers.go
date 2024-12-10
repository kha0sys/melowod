package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/kha0sys/melowod/internal/application"
	"github.com/kha0sys/melowod/internal/domain/user"
)

type UserHandlers struct {
	userService *application.UserService
}

func NewUserHandlers(userService *application.UserService) *UserHandlers {
	return &UserHandlers{
		userService: userService,
	}
}

func (h *UserHandlers) CreateUser(w http.ResponseWriter, r *http.Request) {
	var userReq user.User
	if err := json.NewDecoder(r.Body).Decode(&userReq); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.userService.CreateUser(r.Context(), &userReq); err != nil {
		if err == application.ErrUserAlreadyExists {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *UserHandlers) GetUser(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "userId is required", http.StatusBadRequest)
		return
	}

	userData, err := h.userService.GetUser(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if userData == nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(userData)
}

func (h *UserHandlers) GetUserStats(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "userId is required", http.StatusBadRequest)
		return
	}

	stats, err := h.userService.GetUserStats(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if stats == nil {
		http.Error(w, "user stats not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(stats)
}

func (h *UserHandlers) GetGlobalRanking(w http.ResponseWriter, r *http.Request) {
	users, err := h.userService.GetGlobalRanking(r.Context(), 100)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(users)
}

func (h *UserHandlers) GetBoxRanking(w http.ResponseWriter, r *http.Request) {
	boxName := r.URL.Query().Get("box")
	if boxName == "" {
		http.Error(w, "box name is required", http.StatusBadRequest)
		return
	}

	users, err := h.userService.GetBoxRanking(r.Context(), boxName, 100)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(users)
}
