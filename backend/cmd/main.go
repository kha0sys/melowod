package main

import (
	"context"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/kha0sys/melowod/config"
	"github.com/kha0sys/melowod/internal/api/handlers"
	"github.com/kha0sys/melowod/internal/application"
	"github.com/kha0sys/melowod/internal/infrastructure/firestore"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found")
	}

	// Initialize Firebase
	app, err := config.InitializeFirebase()
	if err != nil {
		log.Fatalf("Error initializing app: %v\n", err)
	}

	// Initialize Firestore client
	client, err := app.Firestore(context.Background())
	if err != nil {
		log.Fatalf("Error initializing Firestore client: %v\n", err)
	}
	defer client.Close()

	// Initialize repositories
	wodRepo := firestore.NewWodRepository(client)
	userRepo := firestore.NewUserRepository(client)

	// Initialize services
	wodService := application.NewWodService(wodRepo, userRepo)
	userService := application.NewUserService(userRepo)

	// Initialize handlers
	wodHandlers := handlers.NewWodHandlers(wodService)
	userHandlers := handlers.NewUserHandlers(userService)

	// Set up WOD routes
	http.HandleFunc("/api/wods", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			wodHandlers.CreateDailyWod(w, r)
		case http.MethodGet:
			wodHandlers.GetWodByDate(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/wods/results", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			wodHandlers.SubmitWodResult(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/wods/leaderboard", wodHandlers.GetLeaderboard)

	// Set up User routes
	http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			userHandlers.CreateUser(w, r)
		case http.MethodGet:
			userHandlers.GetUser(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/users/stats", userHandlers.GetUserStats)
	http.HandleFunc("/api/rankings/global", userHandlers.GetGlobalRanking)
	http.HandleFunc("/api/rankings/box", userHandlers.GetBoxRanking)

	// Start server
	log.Println("MeloWOD backend server started on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Error starting server: %v\n", err)
	}
}
