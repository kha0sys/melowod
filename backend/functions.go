package main

import (
	"context"
	"log"
	"net/http"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
	"github.com/kha0sys/melowod/config"
	"github.com/kha0sys/melowod/internal/api/handlers"
	"github.com/kha0sys/melowod/internal/api/middleware"
	"github.com/kha0sys/melowod/internal/application"
	"github.com/kha0sys/melowod/internal/infrastructure/firebase"
	"github.com/kha0sys/melowod/internal/infrastructure/firestore"
)

var (
	wodHandlers  *handlers.WodHandlers
	userHandlers *handlers.UserHandlers
	authHandlers *handlers.AuthHandlers
	authMiddleware *middleware.AuthMiddleware
)

func init() {
	// Initialize Firebase
	app, err := config.InitializeFirebase()
	if err != nil {
		log.Fatalf("Error initializing Firebase: %v\n", err)
	}

	// Initialize Firestore client
	client, err := app.Firestore(context.Background())
	if err != nil {
		log.Fatalf("Error initializing Firestore: %v\n", err)
	}

	// Initialize repositories
	wodRepo := firestore.NewWodRepository(client)
	userRepo := firestore.NewUserRepository(client)

	// Initialize services
	wodService := application.NewWodService(wodRepo, userRepo)
	userService := application.NewUserService(userRepo)
	authService, err := firebase.NewAuthService(app, userRepo)
	if err != nil {
		log.Fatalf("Error initializing Auth service: %v\n", err)
	}

	// Initialize handlers
	wodHandlers = handlers.NewWodHandlers(wodService)
	userHandlers = handlers.NewUserHandlers(userService)
	authHandlers = handlers.NewAuthHandlers(authService)
	authMiddleware = middleware.NewAuthMiddleware(authService)

	// Register HTTP functions
	functions.HTTP("SignUp", authHandlers.SignUp)
	functions.HTTP("SignIn", authHandlers.SignIn)
	functions.HTTP("SendPasswordReset", authHandlers.SendPasswordReset)
	functions.HTTP("SendEmailVerification", 
		authMiddleware.RequireAuth(authHandlers.SendEmailVerification))

	functions.HTTP("CreateDailyWod", 
		authMiddleware.RequireAuth(CreateDailyWod))
	functions.HTTP("GetWodByDate", GetWodByDate)
	functions.HTTP("SubmitWodResult", 
		authMiddleware.RequireAuth(SubmitWodResult))
	functions.HTTP("GetLeaderboard", GetLeaderboard)
	functions.HTTP("CreateUser", CreateUser)
	functions.HTTP("GetUser", 
		authMiddleware.RequireAuth(GetUser))
	functions.HTTP("GetUserStats", 
		authMiddleware.RequireAuth(GetUserStats))
	functions.HTTP("GetGlobalRanking", GetGlobalRanking)
	functions.HTTP("GetBoxRanking", GetBoxRanking)
}

func CreateDailyWod(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	wodHandlers.CreateDailyWod(w, r)
}

func GetWodByDate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	wodHandlers.GetWodByDate(w, r)
}

func SubmitWodResult(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	wodHandlers.SubmitWodResult(w, r)
}

func GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	wodHandlers.GetLeaderboard(w, r)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userHandlers.CreateUser(w, r)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userHandlers.GetUser(w, r)
}

func GetUserStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userHandlers.GetUserStats(w, r)
}

func GetGlobalRanking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userHandlers.GetGlobalRanking(w, r)
}

func GetBoxRanking(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	userHandlers.GetBoxRanking(w, r)
}
