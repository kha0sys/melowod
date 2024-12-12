# MeloWOD

Una aplicación moderna y eficiente para gestionar y seguir tus WODs (Workout of the Day) usando Firebase. MeloWOD te ayuda a mantener un registro detallado de tus entrenamientos, seguir tu progreso y competir con otros atletas.

## ✨ Características Principales

- **Gestión de WODs**: Crea, edita y programa tus entrenamientos diarios
- **Seguimiento de Progreso**: Registra tus tiempos, pesos y repeticiones
- **Sistema de Gamificación**: Gana puntos y medallas por completar WODs
- **Rankings y Competencia**: Compite con otros usuarios y sube en el ranking
- **Estadísticas Detalladas**: Visualiza tu progreso con gráficos y métricas
- **Modo Offline**: Continúa usando la app sin conexión a internet

## 🎯 Para Quién es MeloWOD

- Atletas de CrossFit y entrenamiento funcional
- Entrenadores que quieren programar WODs para sus atletas
- Boxes y gimnasios que buscan una plataforma de gestión
- Cualquier persona interesada en seguir su progreso fitness

## 📁 Estructura del Proyecto y Arquitectura

```plaintext
/
├── frontend/           # Aplicación Next.js
│   ├── src/
│   │   ├── domain/          # Modelos y lógica de negocio
│   │   ├── application/     # Casos de uso
│   │   ├── infrastructure/  # Servicios externos
│   │   ├── components/      # Componentes React
│   │   │   ├── atoms/      # Componentes básicos
│   │   │   ├── molecules/  # Combinaciones de átomos
│   │   │   ├── organisms/  # Componentes complejos
│   │   │   └── templates/  # Layouts y plantillas
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades y configuraciones
│   │   ├── services/       # Servicios de Firebase
│   │   ├── types/          # Definiciones de tipos
│   │   └── schemas/        # Esquemas de validación
│   └── public/           # Archivos estáticos
│
├── backend/           # API en Go
│   ├── domain/           # Entidades y reglas de negocio
│   ├── usecase/          # Casos de uso
│   ├── interface/        # Controladores y presentadores
│   └── infrastructure/   # Implementaciones concretas
│
├── functions/         # Cloud Functions
│   ├── src/
│   │   ├── auth/         # Funciones de autenticación
│   │   ├── wods/         # Funciones de WODs
│   │   └── gamification/ # Sistema de puntos
│   └── lib/           # Código compartido
│
├── firebase.json     # Configuración de Firebase
├── firestore.rules   # Reglas de seguridad
└── storage.rules     # Reglas de almacenamiento
```

## 🏗️ Arquitectura y Patrones de Diseño

### Clean Architecture

La aplicación sigue los principios de Clean Architecture, separando las responsabilidades en capas:

1. **Capa de Dominio**
   - Entidades de negocio
   - Reglas de negocio
   - Interfaces de repositorios

2. **Capa de Aplicación**
   - Casos de uso
   - DTOs
   - Interfaces de servicios

3. **Capa de Infraestructura**
   - Implementaciones de repositorios
   - Servicios externos
   - Configuraciones

### Patrones de Diseño Implementados

- **Repository Pattern**: Abstracción del acceso a datos
- **Factory Pattern**: Creación de objetos complejos
- **Strategy Pattern**: Comportamientos intercambiables
- **Observer Pattern**: Manejo de eventos y estado
- **Dependency Injection**: Inversión de control

### Principios SOLID

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Uso correcto de herencia
- **Interface Segregation**: Interfaces específicas
- **Dependency Inversion**: Dependencias hacia abstracciones

## 🔥 Servicios de Firebase

### 🔐 Authentication

- Autenticación segura con email/password
- Inicio de sesión con Google y otros proveedores sociales
- Recuperación de contraseña y verificación de email
- Perfiles de usuario personalizables

### 📚 Firestore

- Base de datos NoSQL escalable y en tiempo real
- Reglas de seguridad granulares para proteger datos
- Sistema de caché local para mejor rendimiento
- Sincronización automática entre dispositivos

### 🗄️ Storage

- Almacenamiento seguro de archivos multimedia
- Soporte para imágenes de perfil y videos de WODs
- Límites configurables de tamaño y tipos de archivo
- Limpieza automática de archivos no utilizados

### ⚡ Cloud Functions

- Cálculo automático de puntos y rankings en tiempo real
- Sistema de notificaciones para nuevos WODs y logros
- Generación de estadísticas y reportes personalizados
- Tareas programadas de mantenimiento y optimización

## 🔄 Sistema de Caché y Estado

### Estado Global

- **Redux/Context**: Gestión centralizada del estado
- **Recoil**: Estado atómico para componentes
- **React Query**: Caché y sincronización de datos

### Caché de Datos

```typescript
// Ejemplo de caché con React Query
const { data, isLoading } = useQuery(['wods'], 
  () => fetchWods(),
  {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000 // 30 minutos
  }
);
```

## 🚀 Desarrollo Local

1. Instalar dependencias:

```bash
# Frontend
cd frontend
npm install

# Cloud Functions
cd functions
npm install
```

1. Configurar variables de entorno:

Crear archivo `frontend/.env.local` con las credenciales de Firebase.

1. Iniciar emuladores de Firebase:

```bash
firebase emulators:start
```

1. Iniciar frontend en modo desarrollo:

```bash
cd frontend
npm run dev
```

## 📱 Características de la PWA

- Instalable como aplicación nativa
- Funcionalidad offline completa
- Sincronización en segundo plano
- Notificaciones push
- Actualizaciones automáticas

## 🤝 Contribución

¿Quieres contribuir al proyecto? ¡Genial! Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Envía un pull request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
