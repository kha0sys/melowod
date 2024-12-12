package firebase

import (
    "context"
    "fmt"

    firebase "firebase.google.com/go"
    "firebase.google.com/go/auth"
    "cloud.google.com/go/firestore"
    "google.golang.org/api/option"
)

type FirebaseClient struct {
    app *firebase.App
    auth *auth.Client
    firestore *firestore.Client
}

func NewFirebaseClient() (*FirebaseClient, error) {
    ctx := context.Background()
    
    // Inicializar Firebase
    opt := option.WithCredentialsFile("infrastructure/firebase/credentials/serviceAccountKey.json")
    app, err := firebase.NewApp(ctx, nil, opt)
    if err != nil {
        return nil, fmt.Errorf("error initializing firebase: %v", err)
    }

    // Inicializar Auth
    auth, err := app.Auth(ctx)
    if err != nil {
        return nil, fmt.Errorf("error initializing auth: %v", err)
    }

    // Inicializar Firestore
    firestore, err := app.Firestore(ctx)
    if err != nil {
        return nil, fmt.Errorf("error initializing firestore: %v", err)
    }

    return &FirebaseClient{
        app: app,
        auth: auth,
        firestore: firestore,
    }, nil
}

func (f *FirebaseClient) Auth() *auth.Client {
    return f.auth
}

func (f *FirebaseClient) Firestore() *firestore.Client {
    return f.firestore
}

// Close cierra las conexiones
func (f *FirebaseClient) Close() error {
    if err := f.firestore.Close(); err != nil {
        return fmt.Errorf("error closing firestore: %v", err)
    }
    return nil
}
