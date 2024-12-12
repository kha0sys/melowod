# Components Documentation

## Atomic Design Structure

### Atoms

#### Button
Basic button component with variants.

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  children,
  onClick,
  disabled
}) => {
  // Implementation
};
```

#### Input
Text input component with validation.

```typescript
interface InputProps {
  type: 'text' | 'number' | 'email';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}
```

### Molecules

#### ScoreInput
Component for entering WOD scores.

```typescript
interface ScoreInputProps {
  wodType: WodType;
  onSubmit: (score: number) => void;
  initialValue?: number;
}
```

#### WodTimer
Timer component for WODs.

```typescript
interface WodTimerProps {
  duration: number;
  type: 'countdown' | 'stopwatch';
  onComplete?: () => void;
}
```

### Organisms

#### WodCard
Complete WOD display with interactions.

```typescript
interface WodCardProps {
  wod: Wod;
  onScoreSubmit?: (score: number) => void;
  onShare?: () => void;
}
```

#### LeaderBoard
Display rankings and scores.

```typescript
interface LeaderBoardProps {
  wodId: string;
  limit?: number;
  userHighlight?: string;
}
```

### Templates

#### DashboardLayout
Main layout for dashboard pages.

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}
```

## Custom Hooks

### useWod
Hook for WOD operations.

```typescript
interface UseWodResult {
  wod: Wod | null;
  loading: boolean;
  error: Error | null;
  submitScore: (score: number) => Promise<void>;
  updateWod: (data: Partial<Wod>) => Promise<void>;
}

const useWod = (wodId: string): UseWodResult => {
  // Implementation
};
```

### useAuth
Authentication hook.

```typescript
interface UseAuthResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}
```

## State Management

### User State
```typescript
interface UserState {
  currentUser: User | null;
  preferences: UserPreferences;
  notifications: Notification[];
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reducers implementation
  }
});
```

### WOD State
```typescript
interface WodState {
  currentWod: Wod | null;
  wodList: Wod[];
  filters: WodFilters;
  loading: boolean;
}

const wodSlice = createSlice({
  name: 'wod',
  initialState,
  reducers: {
    // Reducers implementation
  }
});
```

## Utility Functions

### Score Calculations
```typescript
const calculateWodScore = (
  type: WodType,
  value: number,
  scaling: ScalingFactor
): number => {
  // Implementation
};
```

### Time Formatting
```typescript
const formatTime = (seconds: number): string => {
  // Implementation
};
```

## Error Handling

### Error Boundaries
```typescript
class WodErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  // Implementation
}
```

### Error Components
```typescript
interface ErrorMessageProps {
  error: Error;
  retry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  retry
}) => {
  // Implementation
};
```
