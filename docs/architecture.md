# Arquitectura de MeloWOD

## Visión General

MeloWOD sigue una arquitectura limpia y modular, separando claramente las responsabilidades entre frontend, backend y funciones en la nube.

## Estructura de Capas

### Frontend (Next.js)

```plaintext
frontend/
├── domain/          # Modelos y lógica de negocio
├── application/     # Casos de uso
└── infrastructure/  # Implementaciones externas
```

#### Domain Layer

* Contiene las entidades principales (User, WOD, Score)
* Define interfaces de repositorios
* Implementa reglas de negocio core

#### Application Layer

* Implementa casos de uso específicos
* Maneja la lógica de la aplicación
* Coordina entre domain e infrastructure

#### Infrastructure Layer

* Implementa interfaces del dominio
* Maneja la comunicación con Firebase
* Gestiona el estado de la aplicación

### Backend (Go)

```plaintext
backend/
├── domain/          # Entidades y reglas
├── usecase/         # Lógica de aplicación
└── interface/       # APIs y controladores
```

### Cloud Functions

```plaintext
functions/
├── auth/           # Autenticación
├── wods/           # Lógica de WODs
└── gamification/   # Sistema de puntos
```

## Patrones de Diseño

### Repository Pattern

```typescript
interface WodRepository {
  getById(id: string): Promise<Wod>;
  save(wod: Wod): Promise<void>;
  delete(id: string): Promise<void>;
  list(filters: WodFilters): Promise<Wod[]>;
}
```

### Factory Pattern

```typescript
class WodFactory {
  static create(type: WodType, data: WodData): Wod {
    switch (type) {
      case WodType.AMRAP:
        return new AmrapWod(data);
      case WodType.ForTime:
        return new ForTimeWod(data);
      default:
        throw new Error('Invalid WOD type');
    }
  }
}
```

## Flujos de Datos

### Creación de WOD

1. Usuario ingresa datos del WOD
2. Validación en frontend
3. Creación en Firestore
4. Trigger de Cloud Function
5. Actualización de rankings

### Sistema de Puntuación

1. Usuario registra score
2. Validación de datos
3. Cálculo de puntos
4. Actualización de rankings
5. Notificación a usuarios
