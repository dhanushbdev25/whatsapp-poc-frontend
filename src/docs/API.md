# API Documentation

## Overview

This document provides a quick reference for the API layer. For comprehensive documentation including how to create new endpoints, use hooks in components, and best practices, see **[API_AND_STORE.md](./API_AND_STORE.md)**.

## Quick Links

- 📖 **[Complete API & Store Guide](./API_AND_STORE.md)** - Full documentation with examples

## API Configuration

### Base API Query

The base API query is configured in `src/store/api/baseApi.ts`:

- **Base URL**: Configured via `API_BASE_URL` environment variable
- **Credentials**: Includes cookies for authentication
- **Auto-refresh**: Automatically refreshes token on 401 responses
- **Performance tracking**: Tracks API call durations
- **Error logging**: Logs all API errors

### Environment Variables

- `API_BASE_URL`: Base URL for authenticated API calls (e.g., `http://localhost:8000/web/`)
- `API_BASE_URL_PRE_AUTH`: Base URL for pre-authentication calls (e.g., `http://localhost:8000/`)

## API Services

### Authentication API

Located in `src/store/api/auth/auth.api.ts`:

```typescript
import { useLoginUserMutation, useLogoutUserMutation } from '@store/api/auth/auth.api';

// Login
const [loginUser, { isLoading, error }] = useLoginUserMutation();
const result = await loginUser({ email: 'user@example.com', password: 'password' });

// Logout
const [logoutUser] = useLogoutUserMutation();
await logoutUser();
```

### Session API

Located in `src/store/api/auth/session.api.ts`:

```typescript
import { useSessionContextQuery } from '@store/api/auth/session.api';

const { data, isLoading, error } = useSessionContextQuery(token);
```

## Response Validation

All API responses are validated using Zod schemas:

- **Login/Logout**: Validated with `loginResponseSchema` and `logoutResponseSchema`
- **Session**: Validated with `sessionDataSchema`
- **Errors**: Logged and thrown if validation fails

## Error Handling

API errors are automatically:

1. Logged via the logger service
2. Displayed via notification service
3. Tracked for performance monitoring

401 errors trigger automatic token refresh and logout if refresh fails.

## Performance Monitoring

API calls are automatically tracked for performance:

- Duration measurement
- Success/failure status
- Error logging

Performance metrics can be accessed via the performance monitor service.
