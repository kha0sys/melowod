# Development Guide

## Setup Development Environment

### Prerequisites
- Node.js 18+
- Go 1.19+
- Firebase CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/melowod.git
cd melowod
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Functions
cd ../functions
npm install
```

3. Set up environment variables:
```bash
# Frontend
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

4. Start development servers:
```bash
# Frontend
npm run dev

# Firebase emulators
firebase emulators:start
```

## Code Style Guide

### TypeScript Guidelines

1. Use TypeScript strict mode
2. Define interfaces for all data structures
3. Use enums for fixed sets of values
4. Implement proper error handling

#### Example
```typescript
interface WodData {
  type: WodType;
  description: string;
  movements: string[];
}

enum WodType {
  AMRAP = 'AMRAP',
  FOR_TIME = 'FOR_TIME',
  EMOM = 'EMOM'
}

class WodService {
  async createWod(data: WodData): Promise<Result<Wod, Error>> {
    try {
      // Validation
      if (!this.isValidWodData(data)) {
        return Err(new ValidationError('Invalid WOD data'));
      }

      // Processing
      const wod = await this.wodRepository.create(data);
      return Ok(wod);
    } catch (error) {
      return Err(error as Error);
    }
  }
}
```

### React Component Guidelines

1. Use functional components with hooks
2. Implement proper prop types
3. Keep components small and focused
4. Use custom hooks for reusable logic

#### Example
```typescript
interface WodCardProps {
  wod: Wod;
  onComplete?: (score: number) => void;
}

export const WodCard: React.FC<WodCardProps> = ({ wod, onComplete }) => {
  const { user } = useAuth();
  const { submitScore } = useWodScoring();

  const handleScoreSubmit = async (score: number) => {
    await submitScore(wod.id, score);
    onComplete?.(score);
  };

  return (
    <Card>
      <WodHeader type={wod.type} />
      <WodDescription>{wod.description}</WodDescription>
      <ScoreInput onSubmit={handleScoreSubmit} />
    </Card>
  );
};
```

## Testing

### Unit Tests

```typescript
describe('WodService', () => {
  it('should create valid WOD', async () => {
    const service = new WodService(mockRepo);
    const result = await service.createWod(validWodData);
    expect(result.isOk()).toBe(true);
  });

  it('should reject invalid WOD', async () => {
    const service = new WodService(mockRepo);
    const result = await service.createWod(invalidWodData);
    expect(result.isErr()).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('WOD Creation', () => {
  it('should create WOD successfully', () => {
    cy.login(testUser);
    cy.visit('/wods/new');
    cy.fillWodForm(testWodData);
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/wods/');
  });
});
```

## Deployment

### Production Deployment

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

### Staging Deployment

1. Use staging environment:
```bash
firebase use staging
```

2. Deploy to staging:
```bash
firebase deploy --only hosting,functions
```

## Monitoring and Debugging

### Firebase Console

- Monitor function execution
- View logs and errors
- Track performance

### Application Insights

- Track user behavior
- Monitor performance
- Analyze errors

### Logging Guidelines

```typescript
// Use structured logging
logger.info('WOD created', {
  wodId: wod.id,
  type: wod.type,
  userId: user.id
});

// Error logging
logger.error('Failed to create WOD', {
  error: error.message,
  stack: error.stack,
  userId: user.id
});
