# Arquitectura de MeloWOD

## Visión General

MeloWOD sigue una arquitectura limpia (Clean Architecture) con una clara separación de responsabilidades:

```plaintext
/
├── frontend/           # Aplicación Next.js
│   └── src/
│       ├── domain/          # Modelos y lógica de negocio
│       ├── application/     # Casos de uso
│       ├── infrastructure/  # Servicios externos
│       └── components/      # Componentes React
├── functions/          # Firebase Cloud Functions
│   └── src/
│       ├── domain/         # Entidades y reglas de negocio
│       │   └── entities/   # Definiciones de tipos
│       ├── application/    # Lógica de aplicación
│       │   └── wod/        # Servicios relacionados con WODs
│       └── infrastructure/ # Implementaciones concretas
```

## Servicios Principales

### WodService

Maneja toda la lógica relacionada con los entrenamientos (WODs):

- Creación y gestión de WODs
- Registro de resultados
- Actualización de estadísticas de usuario
- Gestión de rankings y puntuaciones

#### Flujo de Datos

1. El usuario completa un WOD
2. Se registra el resultado en Firestore
3. El trigger `onWodResultCreated` se activa
4. Se actualizan las estadísticas del usuario
5. Se recalculan los rankings si es necesario

## Patrones de Diseño

### Domain-Driven Design (DDD)

- Entidades claramente definidas (Wod, WodResult)
- Servicios de dominio para lógica de negocio
- Value Objects para conceptos inmutables

### Event-Driven Architecture

- Uso de Firestore triggers para reaccionar a cambios
- Actualizaciones asíncronas de estadísticas
- Notificaciones en tiempo real

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
