package config

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

type FirebaseConfig struct {
	Type                    string `json:"type"`
	ProjectID              string `json:"project_id"`
	PrivateKeyID           string `json:"private_key_id"`
	PrivateKey             string `json:"private_key"`
	ClientEmail            string `json:"client_email"`
	ClientID               string `json:"client_id"`
	AuthURI                string `json:"auth_uri"`
	TokenURI               string `json:"token_uri"`
	AuthProviderX509CertURL string `json:"auth_provider_x509_cert_url"`
	ClientX509CertURL      string `json:"client_x509_cert_url"`
}

func InitializeFirebase() (*firebase.App, error) {
	// Check if service account file exists
	if _, err := os.Stat("config/serviceAccountKey.json"); err == nil {
		opt := option.WithCredentialsFile("config/serviceAccountKey.json")
		app, err := firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			return nil, fmt.Errorf("error initializing app with file: %v", err)
		}
		return app, nil
	}

	// If file doesn't exist, try to use environment variables
	config := &FirebaseConfig{
		Type:                    "service_account",
		ProjectID:              "melowod-ebadd",
		PrivateKeyID:           os.Getenv("FIREBASE_PRIVATE_KEY_ID"),
		PrivateKey:             os.Getenv("FIREBASE_PRIVATE_KEY"),
		ClientEmail:            "firebase-adminsdk-5qm1n@melowod-ebadd.iam.gserviceaccount.com",
		ClientID:               "112360202696965026100",
		AuthURI:                "https://accounts.google.com/o/oauth2/auth",
		TokenURI:               "https://oauth2.googleapis.com/token",
		AuthProviderX509CertURL: "https://www.googleapis.com/oauth2/v1/certs",
		ClientX509CertURL:      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-5qm1n%40melowod-ebadd.iam.gserviceaccount.com",
	}

	credJSON, err := json.Marshal(config)
	if err != nil {
		return nil, fmt.Errorf("error marshaling config: %v", err)
	}

	opt := option.WithCredentialsJSON(credJSON)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app with env vars: %v", err)
	}

	return app, nil
}
