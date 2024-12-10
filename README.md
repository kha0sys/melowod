# MeloWOD

Una aplicación para gestionar y seguir tus WODs (Workout of the Day).

## 📁 Estructura del Proyecto

```typescript
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   │   ├── useAuth.ts           # Hook para autenticación
│   │   ├── useFirestore.ts      # Hook para Firestore con caché
│   │   └── useGamification.ts   # Hook para sistema de gamificación
│   ├── lib/             # Utilidades y configuraciones
│   │   ├── firebase/
│   │   │   ├── config.ts        # Configuración unificada de Firebase
│   │   │   └── cache.ts         # Sistema de caché para Firestore
│   │   └── utils.ts             # Utilidades generales
│   ├── services/        # Servicios de la aplicación
│   │   ├── auth/               # Servicios de autenticación
│   │   └── api/                # Servicios de API
│   ├── types/           # Definiciones de tipos TypeScript
│   └── schemas/         # Esquemas de validación
│
backend/
├── cmd/                 # Puntos de entrada
├── internal/           # Código interno
│   ├── core/           # Lógica de negocio
│   ├── infrastructure/ # Implementaciones
│   └── pkg/            # Paquetes compartidos
└── pkg/               # Código compartido
```

## 🔄 Sistema de Caché

La aplicación implementa un sistema de caché eficiente para Firestore:

### Funcionalidades del Caché

- Caché en memoria con tiempo de expiración configurable
- Soporte para documentos individuales y colecciones
- Invalidación selectiva o completa del caché
- Persistencia offline usando IndexedDB
- Hooks personalizados para fácil integración

### Ejemplos de Uso

```typescript
// Obtener un documento con caché
const { data, loading, error } = useFirestoreDoc<Wod>(
  'wods/today',
  { expiresIn: 5 * 60 * 1000 } // 5 minutos
);

// Obtener una colección con caché
const { data, loading, error } = useFirestoreCollection<User>(
  'users',
  [where('active', '==', true)],
  { expiresIn: 10 * 60 * 1000 } // 10 minutos
);
```

## 🔧 Configuración de Firebase

La aplicación utiliza una configuración unificada de Firebase que incluye:

- Authentication
- Firestore con persistencia offline
- Cloud Storage
- Analytics (solo en el cliente)

### Detalles de Configuración

- Configuración centralizada en `src/lib/firebase/config.ts`
- Manejo automático de persistencia offline
- Tipado completo para mejor DX
- Integración con Next.js App Router
