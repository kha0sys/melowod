# API Documentation

## REST Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}
```

```typescript
interface RegisterResponse {
  userId: string;
  token: string;
}
```

#### POST /api/auth/login
Login existing user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### WODs

#### GET /api/wods
Get list of WODs.

**Query Parameters:**
- `type`: WOD type (AMRAP, ForTime)
- `date`: Date filter
- `limit`: Number of results
- `offset`: Pagination offset

**Response:**
```json
{
  "wods": [
    {
      "id": "string",
      "type": "string",
      "description": "string",
      "movements": ["string"],
      "scoreType": "string"
    }
  ],
  "total": "number"
}
```

### WOD Management

#### POST /api/wods/create
Create a new WOD.

```typescript
interface CreateWodRequest {
  title: string;
  description: string;
  type: WodType;
  duration: number;
  movements: Movement[];
}
```

#### POST /api/wod/create
Create a new WOD.

```typescript
interface CreateWodRequest {
  title: string;
  description: string;
  type: 'amrap' | 'fortime' | 'emom';
  duration: number;
  movements: string[];
}
```

#### POST /api/wod/result
Submit a WOD result.

```typescript
interface WodResult {
  userId: string;
  wodId: string;
  score: number;
  level: 'rx' | 'scaled' | 'beginner';
  mediaUrls?: string[];
  notes?: string;
}
```

## Firebase Collections

### Users Collection

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: timestamp;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}
```

### WODs Collection

```typescript
interface Wod {
  id: string;
  title: string;
  description: string;
  type: 'AMRAP' | 'ForTime';
  duration: number;
  movements: Array<{
    name: string;
    reps: number;
    weight: number;
  }>;
}
```

### Scores Collection

```typescript
interface Score {
  id: string;
  userId: string;
  wodId: string;
  value: number;
  notes: string;
  createdAt: timestamp;
}
```

## Cloud Functions

### Authentication Functions

#### onUserCreated
Triggered when a new user is created.
- Creates user profile
- Sends welcome email
- Sets up default preferences

#### onUserDeleted
Triggered when a user is deleted.
- Removes user data
- Updates related records
- Sends confirmation email

### WOD Functions

#### onWodCreated
Triggered when a new WOD is created.
- Validates WOD data
- Updates leaderboard
- Sends notifications

### Score Functions

#### onScoreSubmit
Triggered when a user submits a score.
- Validates score data
- Updates rankings
- Sends notifications

### Notification Functions

#### sendPushNotification
Sends push notifications to users.
- Handles different notification types
- Manages notification preferences
- Tracks delivery status

## Firestore Triggers

The following Firestore triggers are implemented:

- `onWodResultCreated`: Automatically updates user statistics when a new WOD result is submitted
