package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"melowod/backend/infrastructure/firebase"
	"melowod/backend/internal/application/wod"
	"melowod/backend/internal/domain/model"
	"melowod/backend/internal/infrastructure/repository/firestore"
)

func main() {
	// Inicializar Firebase
	firebaseClient, err := firebase.NewFirebaseClient()
	if err != nil {
		log.Fatalf("Error initializing Firebase: %v\n", err)
	}
	defer firebaseClient.Close()

	// Inicializar repositorio y servicio
	wodRepo := firestore.NewWodRepository(firebaseClient.Firestore())
	wodService := wod.NewService(wodRepo)

	// Crear un router (usando http estandar por ahora)
	mux := http.NewServeMux()

	// Configurar rutas
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Rutas para WODs
	mux.HandleFunc("/api/wods/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			if id := strings.TrimPrefix(r.URL.Path, "/api/wods/"); id != "" {
				wod, err := wodService.GetWod(id)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				json.NewEncoder(w).Encode(wod)
			} else {
				wods, err := wodService.ListWods()
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				json.NewEncoder(w).Encode(wods)
			}
		case http.MethodPost:
			var newWod model.Wod
			if err := json.NewDecoder(r.Body).Decode(&newWod); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := wodService.CreateWod(&newWod); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(newWod)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Configurar el servidor
	server := &http.Server{
		Addr:         ":8080",
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// Canal para manejar el shutdown graceful
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Iniciar el servidor en una goroutine
	go func() {
		log.Printf("Server starting on port 8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v\n", err)
		}
	}()

	// Esperar señal de shutdown
	<-stop

	// Crear contexto con timeout para el shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Intentar shutdown graceful
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Error shutting down server: %v\n", err)
	}

	log.Println("Server stopped gracefully")
}
