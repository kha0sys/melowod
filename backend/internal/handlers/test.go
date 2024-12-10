package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"cloud.google.com/go/firestore"
)

type TestHandler struct {
	firestoreClient *firestore.Client
}

func NewTestHandler(client *firestore.Client) *TestHandler {
	return &TestHandler{
		firestoreClient: client,
	}
}

func (h *TestHandler) TestConnection(w http.ResponseWriter, r *http.Request) {
	// Test writing to Firestore
	_, err := h.firestoreClient.Collection("test").Doc("connection").Set(context.Background(), map[string]interface{}{
		"status": "connected",
		"timestamp": firestore.ServerTimestamp,
	})

	response := map[string]string{
		"status": "success",
	}

	if err != nil {
		log.Printf("Error writing to Firestore: %v\n", err)
		response["status"] = "error"
		response["message"] = err.Error()
		w.WriteHeader(http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
