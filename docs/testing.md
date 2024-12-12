# Testing Guide
================

## Unit Testing
-------------

### Component Testing
-------------------

#### Button Component

```typescript
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    render(<Button variant="primary" onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

#### WodCard Component

```typescript
describe('WodCard', () => {
  const mockWod = {
    id: '1',
    type: WodType.AMRAP,
    description: 'Test WOD'
  };

  it('displays WOD information', () => {
    render(<WodCard wod={mockWod} />);
    expect(screen.getByText('Test WOD')).toBeInTheDocument();
  });

  it('handles score submission', async () => {
    const onScoreSubmit = jest.fn();
    render(<WodCard wod={mockWod} onScoreSubmit={onScoreSubmit} />);
    
    await userEvent.type(screen.getByRole('textbox'), '100');
    await userEvent.click(screen.getByText('Submit'));
    
    expect(onScoreSubmit).toHaveBeenCalledWith(100);
  });
});
```

### Hook Testing
----------------

#### useWod Hook

```typescript
describe('useWod', () => {
  it('loads WOD data', async () => {
    const { result } = renderHook(() => useWod('test-id'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.wod).toBeDefined();
  });

  it('handles errors', async () => {
    // Mock API error
    server.use(
      rest.get('/api/wods/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useWod('test-id'));
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

## Integration Testing
---------------------

### API Integration
------------------

#### WOD Creation Flow

```typescript
describe('WOD Creation Flow', () => {
  it('creates WOD successfully', async () => {
    const { result } = renderHook(() => useWodCreation());
    
    act(() => {
      result.current.createWod({
        type: WodType.AMRAP,
        description: 'Test WOD',
        duration: 20
      });
    });

    await waitFor(() => {
      expect(result.current.success).toBe(true);
    });

    // Verify Firestore
    const doc = await getDoc(doc(db, 'wods', result.current.wodId));
    expect(doc.exists()).toBe(true);
  });
});
```

### User Flow Testing
---------------------

#### Authentication Flow

```typescript
describe('Authentication Flow', () => {
  it('registers and logs in user', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    // Register
    await act(async () => {
      await auth.createUserWithEmailAndPassword(email, password);
    });

    // Login
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.login(email, password);
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

## E2E Testing
--------------

### Cypress Tests
-----------------

#### WOD Submission Flow

```typescript
describe('WOD Submission', () => {
  beforeEach(() => {
    cy.login();
  });

  it('submits WOD score successfully', () => {
    cy.visit('/wods/active');
    cy.get('[data-testid="score-input"]').type('100');
    cy.get('[data-testid="submit-score"]').click();
    
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Score submitted successfully');
    
    cy.get('[data-testid="leaderboard"]')
      .should('contain', '100');
  });
});
```

#### User Profile Flow

```typescript
describe('User Profile', () => {
  beforeEach(() => {
    cy.login();
  });

  it('updates user profile', () => {
    cy.visit('/profile');
    cy.get('[data-testid="edit-profile"]').click();
    cy.get('[data-testid="name-input"]').clear().type('New Name');
    cy.get('[data-testid="save-profile"]').click();
    
    cy.get('[data-testid="profile-name"]')
      .should('contain', 'New Name');
  });
});
```

## Performance Testing
---------------------

### Load Testing
----------------

#### API Endpoints

```typescript
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  const res = http.get('http://localhost:3000/api/wods');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

### Component Performance

```typescript
describe('WodCard Performance', () => {
  it('renders efficiently', async () => {
    const startTime = performance.now();
    
    render(<WodCard wod={mockWod} />);
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Test Coverage
----------------

### Coverage Requirements

* Components: 90% coverage
* Hooks: 95% coverage
* Utils: 100% coverage
* API Integration: 85% coverage

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Coverage thresholds
jest.config.js:
{
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
