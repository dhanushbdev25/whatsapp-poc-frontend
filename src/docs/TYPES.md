# Type System Documentation

## Overview

This document describes the TypeScript type system used throughout the application.

## Type Definitions

### API Types

Located in `src/types/api.types.ts`:

- `ApiResponse<T>`: Generic API response wrapper
- `PaginatedResponse<T>`: Paginated API response
- `ApiError`: API error structure
- `RtkQueryError`: RTK Query error type

### Common Types

Located in `src/types/common.types.ts`:

- `Result<T, E>`: Result type for success/error handling
- `Optional<T, K>`: Make specific keys optional
- `Nullable<T>`: Type or null
- `Maybe<T>`: Type, null, or undefined
- `DateRange`: Date range type
- `SortOrder`: 'asc' | 'desc'

### Error Types

Located in `src/types/error.types.ts`:

- `ErrorCategory`: Error categorization
- `ErrorSeverity`: Error severity levels
- `ErrorInfo`: Structured error information
- `ApiErrorDetails`: API error details
- `ValidationError`: Validation error structure

### Notification Types

Located in `src/types/notification.types.ts`:

- `NotificationType`: 'success' | 'error' | 'warning' | 'info'
- `NotificationPosition`: Notification position
- `NotificationConfig`: Notification configuration
- `Notification`: Notification instance

### Loading Types

Located in `src/types/loading.types.ts`:

- `LoadingType`: 'global' | 'inline' | 'button' | 'overlay'
- `LoadingState`: Loading state structure
- `LoadingService`: Loading service interface
- `LoadingContextValue`: Loading context value

## Zod Schemas

Located in `src/schemas/`:

Schemas provide runtime validation and type inference:

```typescript
import { sessionDataSchema, type SessionData } from '@schemas/session.schemas';

// Validate and infer type
const result = sessionDataSchema.safeParse(data);
if (result.success) {
  const sessionData: SessionData = result.data;
}
```

## Type Inference

Types are automatically inferred from Zod schemas:

```typescript
import { loginResponseSchema } from '@schemas/auth.schemas';
import type { LoginResponse } from '@schemas/auth.schemas';

// LoginResponse type is inferred from loginResponseSchema
```

## Type Safety Best Practices

1. **Use Zod schemas** for runtime validation
2. **Infer types** from schemas when possible
3. **Use type guards** for runtime type checking
4. **Export types** from schema files
5. **Document complex types** with JSDoc comments

