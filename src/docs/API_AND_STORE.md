# API and Store Documentation

## Table of Contents

1. [Overview](#overview)
2. [Store Architecture](#store-architecture)
3. [API Layer Architecture](#api-layer-architecture)
4. [Creating New API Endpoints](#creating-new-api-endpoints)
5. [Using API Hooks in Components](#using-api-hooks-in-components)
6. [Zod Validation Guide](#zod-validation-guide)
7. [Error Handling](#error-handling)
8. [Data Transformation](#data-transformation)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

---

## Overview

The application uses **Redux Toolkit Query (RTK Query)** for API management and **Redux Toolkit** for state management. The architecture is designed to:

- **Centralize error handling** - All errors are handled automatically
- **Transform backend responses** - Backend format is automatically converted to RTK Query format
- **Manage loading states** - Global loading is automatic for all API calls
- **Track performance** - All API calls are automatically monitored
- **Handle authentication** - Token refresh is automatic on 401 errors

---

## Store Architecture

### Store Configuration

The Redux store is configured in `src/store/store.ts`:

```typescript
import { isDevelopment } from '../config/env';

export const store = configureStore({
  reducer: appReducer,
  devTools: isDevelopment(),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat([authApi.middleware, sessionApi.middleware, rtkQueryErrorLogger])
});
```

### Key Components

1. **Reducers**: Manage application state (configured in `appReducer`)
2. **RTK Query APIs**: Handle API calls (`authApi`, `sessionApi`, etc.)
3. **Error Middleware**: Centralized error handling (`rtkQueryErrorLogger`)

### Using the Store

```typescript
import { useAppDispatch, useAppSelector } from '@store/store';

// In a component
function MyComponent() {
  const dispatch = useAppDispatch();
  const someState = useAppSelector(state => state.someReducer.someValue);
  
  // Dispatch actions
  dispatch(someAction());
}
```

---

## API Layer Architecture

### Base API Query

The base API query (`src/store/api/baseApi.ts`) provides:

- ✅ **Automatic token refresh** on 401 errors
- ✅ **Response transformation** from backend format to RTK Query format
- ✅ **Performance tracking** for all API calls
- ✅ **Loading state management** (global loading)
- ✅ **Error logging** for debugging

### Backend Response Format

The backend returns responses in this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field1": ["Error 1", "Error 2"],
    "field2": ["Error 3"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Data Transformation

The `baseApi.ts` automatically transforms backend responses:

1. **Success responses**: Extracts `data` field → `response.data` contains the actual data
2. **Error responses**: Converts to RTK Query error format → Handled by error middleware

**Before transformation:**
```typescript
// Backend returns
{ success: true, data: { id: "123", name: "John" } }
```

**After transformation (what you get in components):**
```typescript
// Component receives
{ id: "123", name: "John" }
```

---

## Creating New API Endpoints

### Step 1: Create API File

Create a new file in `src/store/api/[feature]/[feature].api.ts`:

```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseApi';
import { z } from 'zod/v4';
import { logger } from '@services/logger/logger.service';

// ✅ Always define Zod schemas first (not interfaces)
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// Infer TypeScript type from schema
export type User = z.infer<typeof userSchema>;

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQuery, // Uses baseApi for automatic transformation
  tagTypes: ['User'], // For cache invalidation
  endpoints: builder => ({
    // Query example (GET request)
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      // ✅ Always validate with Zod using safeParse
      transformResponse: (response: unknown) => {
        // Response is already transformed by baseApi (just data)
        // Validate with Zod for runtime type safety
        const parsed = z.array(userSchema).safeParse(response);
        if (!parsed.success) {
          logger.error('User list validation failed', parsed.error, { response });
          throw new Error('Invalid user list response structure');
        }
        return parsed.data;
      },
      providesTags: ['User'] // Cache tag
    }),

    // Mutation example (POST/PUT/DELETE)
    createUser: builder.mutation<User, { name: string; email: string }>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User'], // Invalidate cache after mutation
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        if (!parsed.success) {
          logger.error('Create user validation failed', parsed.error, { response });
          throw new Error('Invalid create user response structure');
        }
        return parsed.data;
      }
    }),

    // GET with parameters
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        if (!parsed.success) {
          logger.error('User validation failed', parsed.error, { response, userId: id });
          throw new Error('Invalid user response structure');
        }
        return parsed.data;
      }
    }),

    // PUT mutation
    updateUser: builder.mutation<User, { id: string; name: string; email: string }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    }),

    // DELETE mutation
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    })
  })
});
```

### Step 2: Export Hooks

```typescript
// Export hooks for use in components
export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation
} = usersApi;
```

### Step 3: Add to Store

Add the API middleware to `src/store/store.ts`:

```typescript
import { usersApi } from './api/users/users.api';

export const store = configureStore({
  // ... other config
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat([
      authApi.middleware,
      sessionApi.middleware,
      usersApi.middleware, // Add your new API
      rtkQueryErrorLogger
    ])
});
```

### Step 4: Use in Components

See [Using API Hooks in Components](#using-api-hooks-in-components) section below.

---

## Using API Hooks in Components

### Query Hooks (GET requests)

**Basic Usage:**
```typescript
import { useGetUsersQuery } from '@store/api/users/users.api';

function UsersList() {
  const { data, isLoading, error, refetch } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <div>
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

**With Parameters:**
```typescript
import { useGetUserByIdQuery } from '@store/api/users/users.api';

function UserDetails({ userId }: { userId: string }) {
  const { data, isLoading, error } = useGetUserByIdQuery(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return <div>{data?.name}</div>;
}
```

**With Options:**
```typescript
const { data, isLoading, error } = useGetUsersQuery(undefined, {
  skip: !shouldFetch, // Skip query conditionally
  pollingInterval: 5000, // Poll every 5 seconds
  refetchOnMountOrArgChange: true, // Refetch on mount
  refetchOnReconnect: true // Refetch on reconnect
});
```

### Mutation Hooks (POST/PUT/DELETE)

**Basic Usage:**
```typescript
import { useCreateUserMutation } from '@store/api/users/users.api';

function CreateUserForm() {
  const [createUser, { isLoading, error, isSuccess }] = useCreateUserMutation();

  const handleSubmit = async (formData: { name: string; email: string }) => {
    try {
      const result = await createUser(formData).unwrap();
      // result contains the transformed data
      console.log('User created:', result);
    } catch (error) {
      // Error is automatically handled by middleware
      // But you can handle it here if needed
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
      {isSuccess && <div>User created successfully!</div>}
    </form>
  );
}
```

**Optimistic Updates:**
```typescript
const [updateUser] = useUpdateUserMutation();

const handleUpdate = async () => {
  await updateUser({
    id: '123',
    name: 'New Name',
    email: 'new@email.com'
  }).unwrap();
};
```

### Advanced Query Options

```typescript
// Conditional query
const { data } = useGetUserByIdQuery(userId, {
  skip: !userId, // Don't query if userId is falsy
});

// Polling
const { data } = useGetUsersQuery(undefined, {
  pollingInterval: 30000, // Poll every 30 seconds
});

// Cache behavior
const { data } = useGetUsersQuery(undefined, {
  refetchOnMountOrArgChange: false, // Don't refetch on mount
  refetchOnReconnect: false, // Don't refetch on reconnect
  keepUnusedDataFor: 60, // Keep cached data for 60 seconds
});
```

---

## Zod Validation Guide

### Why Use Zod?

Zod provides **runtime type safety** - it validates data at runtime, not just compile time. This ensures:
- ✅ Data matches expected structure
- ✅ Type safety at runtime
- ✅ Better error messages
- ✅ Type inference from schemas

### Core Pattern

**Always use this pattern for API responses:**

```typescript
import { z } from 'zod/v4';
import { logger } from '@services/logger/logger.service';

// 1. Define schema (not interface)
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// 2. Infer type from schema
export type User = z.infer<typeof userSchema>;

// 3. Validate in transformResponse
transformResponse: (response: unknown) => {
  const parsed = userSchema.safeParse(response);
  
  if (!parsed.success) {
    logger.error('Validation failed', parsed.error, { response });
    throw new Error('Invalid response structure');
  }
  
  return parsed.data; // Type-safe validated data
}
```

### Key Rules

1. **Always use `safeParse()`** - Never use `parse()` (it throws)
2. **Always check `parsed.success`** - Handle validation failures
3. **Always log errors** - Include context for debugging
4. **Always throw on failure** - Let RTK Query handle the error
5. **Always return `parsed.data`** - Use validated data

### Common Patterns

#### Single Object

```typescript
transformResponse: (response: unknown) => {
  const parsed = userSchema.safeParse(response);
  if (!parsed.success) {
    logger.error('User validation failed', parsed.error, { response });
    throw new Error('Invalid user response structure');
  }
  return parsed.data;
}
```

#### Array

```typescript
transformResponse: (response: unknown) => {
  const parsed = z.array(userSchema).safeParse(response);
  if (!parsed.success) {
    logger.error('User list validation failed', parsed.error, { response });
    throw new Error('Invalid user list response structure');
  }
  return parsed.data;
}
```

#### Nested Objects

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string()
});

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  address: addressSchema.optional()
});
```

#### Optional Fields

```typescript
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  createdAt: z.string().datetime().optional()
});
```

### Error Logging

Always log validation errors with context:

```typescript
if (!parsed.success) {
  logger.error('Validation failed', parsed.error, {
    response,        // Original response
    endpoint: '/users', // API endpoint
    userId: id       // Any relevant context
  });
  throw new Error('Invalid response structure');
}
```

### Complete Example

```typescript
import { z } from 'zod/v4';
import { logger } from '@services/logger/logger.service';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime().optional()
});

export type User = z.infer<typeof userSchema>;

export const usersApi = createApi({
  endpoints: builder => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: unknown) => {
        const parsed = z.array(userSchema).safeParse(response);
        if (!parsed.success) {
          logger.error('User list validation failed', parsed.error, {
            response,
            endpoint: '/users'
          });
          throw new Error('Invalid user list response structure');
        }
        return parsed.data;
      }
    })
  })
});
```

---

## Error Handling

### Automatic Error Handling

**All errors are handled automatically** by the `rtkQueryErrorLogger` middleware in `store.ts`:

1. ✅ **Logs errors** to the logger service
2. ✅ **Shows notifications** to users
3. ✅ **Handles 401 errors** - Automatically logs out user
4. ✅ **Formats validation errors** - Shows field-specific errors

### Error Flow

```
API Call → baseApi.ts (transforms) → RTK Query → rtkQueryErrorLogger middleware
                                                      ↓
                                    Logs + Shows Notification + Handles 401
```

### Error Response Format

When an error occurs, the backend returns:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email is invalid"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

The middleware automatically:
- Extracts the error message
- Shows validation errors if present
- Logs the error for debugging
- Handles 401 by logging out the user

### Manual Error Handling (Optional)

If you need custom error handling:

```typescript
const [createUser, { error }] = useCreateUserMutation();

const handleSubmit = async () => {
  try {
    await createUser(data).unwrap();
  } catch (error) {
    // Error is already logged and shown by middleware
    // But you can add custom handling here
    if (error.status === 400) {
      // Handle specific error
    }
  }
};
```

### Error Types

```typescript
import type { ErrorResponse } from '@types/api.types';

// ErrorResponse structure
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>; // Validation errors
  timestamp: string;
}
```

---

## Data Transformation

### Why Transformation?

The backend wraps all responses in a `{ success, data, message, timestamp }` format, but RTK Query expects:
- Success: Just the data
- Error: Error object with status

### How It Works

The `baseApi.ts` automatically transforms responses:

**Backend Response:**
```json
{
  "success": true,
  "data": { "id": "123", "name": "John" },
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**After Transformation (what components receive):**
```typescript
{ id: "123", name: "John" }
```

### Transformation Process

1. **Check if response is backend format** (`success` field exists)
2. **If `success: true`**: Extract `data` field
3. **If `success: false`**: Convert to RTK Query error format
4. **Return transformed response** to RTK Query

### Example: Real API Call

```typescript
// Backend returns:
{
  success: true,
  data: {
    users: [
      { id: "1", name: "John" },
      { id: "2", name: "Jane" }
    ]
  },
  message: "Users retrieved successfully",
  timestamp: "2024-01-01T00:00:00Z"
}

// Component receives:
{
  users: [
    { id: "1", name: "John" },
    { id: "2", name: "Jane" }
  ]
}
```

---

## Best Practices

### 1. Use baseQuery for All APIs

Always use `baseQuery` from `baseApi.ts` - it provides automatic:
- Token refresh
- Error handling
- Performance tracking
- Loading management

```typescript
// ✅ Good
export const myApi = createApi({
  baseQuery: baseQuery,
  // ...
});

// ❌ Bad - Don't use rawBaseQuery unless you have a specific reason
export const myApi = createApi({
  baseQuery: rawBaseQuery,
  // ...
});
```

### 2. Use Zod Schemas Instead of Interfaces

**Always use Zod schemas** for type safety and runtime validation. Infer TypeScript types from schemas:

```typescript
import { z } from 'zod/v4';

// ✅ Good - Use Zod schema and infer type
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// Infer TypeScript type from schema
export type User = z.infer<typeof userSchema>;

export const usersApi = createApi({
  endpoints: builder => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: unknown) => {
        const parsed = z.array(userSchema).safeParse(response);
        if (!parsed.success) {
          throw new Error('Invalid response structure');
        }
        return parsed.data;
      }
    })
  })
});
```

```typescript
// ❌ Bad - Don't use interfaces for API responses
export interface User {
  id: string;
  name: string;
  email: string;
}
```

### 3. Use Cache Tags

Use cache tags for automatic cache invalidation:

```typescript
export const usersApi = createApi({
  tagTypes: ['User'],
  endpoints: builder => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User']
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User'] // Automatically refetches getUsers
    })
  })
});
```

### 4. Handle Loading States

Loading is automatic for API calls, but you can check it:

```typescript
const { data, isLoading } = useGetUsersQuery();

if (isLoading) return <LoadingSpinner />;
```

### 5. Error Handling: Catch Blocks Are Optional

**Errors are automatically handled by middleware** - notifications are shown, errors are logged, and 401 errors trigger logout. You don't need catch blocks unless you need custom handling.

#### When You DON'T Need Catch Blocks

```typescript
// ✅ Good - No catch needed, middleware handles everything
const [createUser] = useCreateUserMutation();

const handleSubmit = async () => {
  // Error handling is automatic - notification shown, logged, etc.
  await createUser(data).unwrap();
};
```

#### When You DO Need Catch Blocks

Only use catch blocks when you need **custom logic** beyond what middleware provides:

```typescript
// ✅ Good - Custom error handling for specific cases
const [createUser] = useCreateUserMutation();

const handleSubmit = async () => {
  try {
    const result = await createUser(data).unwrap();
    // Custom success logic (e.g., redirect, form reset)
    navigate(`/users/${result.id}`);
    resetForm();
  } catch (error) {
    // Middleware already:
    // - Logged the error
    // - Showed notification
    // - Handled 401 (logout)
    
    // Custom handling only if needed:
    if (error.status === 409) {
      // Handle conflict specifically (e.g., show different message)
      setConflictError(true);
    }
    // Don't duplicate error notification - middleware already did it
  }
};
```

#### Mutation Hook with Error State

If you just need to check error state without custom handling:

```typescript
// ✅ Good - Check error state without catch block
const [createUser, { error, isError }] = useCreateUserMutation();

// Error is already handled by middleware
// Just check state if needed for UI
{isError && <div>Creation failed (error already shown via notification)</div>}
```

#### Summary

- **No catch block needed** - Middleware handles errors automatically
- **Use catch block** - Only if you need custom logic (redirect, form reset, specific error handling)
- **Don't duplicate** - Never show error notifications in catch blocks (middleware does this)
- **Check error state** - Use `{ error, isError }` from hook if you need to check error state in UI

### 6. Use Zod for Validation (Required)

**Always use Zod schemas with `safeParse` for validation** in `transformResponse`. This provides runtime type safety and ensures data matches expected structure.

#### Correct Zod Validation Pattern

```typescript
import { z } from 'zod/v4';
import { logger } from '@services/logger/logger.service';

// Define schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

// Infer type from schema
export type User = z.infer<typeof userSchema>;

export const usersApi = createApi({
  endpoints: builder => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: unknown) => {
        // Always use safeParse - never use parse()
        const parsed = z.array(userSchema).safeParse(response);
        
        if (!parsed.success) {
          // Log validation error with details
          logger.error('User list validation failed', parsed.error, {
            response,
            errors: parsed.error.errors
          });
          throw new Error('Invalid user list response structure');
        }
        
        // Return validated data
        return parsed.data;
      }
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        
        if (!parsed.success) {
          logger.error('User validation failed', parsed.error, {
            response,
            userId: id
          });
          throw new Error('Invalid user response structure');
        }
        
        return parsed.data;
      }
    }),

    createUser: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data
      }),
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        
        if (!parsed.success) {
          logger.error('Create user validation failed', parsed.error, {
            response
          });
          throw new Error('Invalid create user response structure');
        }
        
        return parsed.data;
      }
    })
  })
});
```

#### Key Points for Zod Validation

1. **Always use `safeParse()`** - Never use `parse()` as it throws exceptions
2. **Check `parsed.success`** - Always check the success flag
3. **Log errors** - Log validation errors with context for debugging
4. **Throw on failure** - Throw an error if validation fails
5. **Return `parsed.data`** - Use the validated data from `parsed.data`

#### Example: Nested Schema Validation

```typescript
import { z } from 'zod/v4';

// Nested schemas
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string()
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  address: addressSchema.optional()
});

export type User = z.infer<typeof userSchema>;

// In transformResponse
transformResponse: (response: unknown) => {
  const parsed = userSchema.safeParse(response);
  if (!parsed.success) {
    logger.error('User validation failed', parsed.error, { response });
    throw new Error('Invalid user response structure');
  }
  return parsed.data;
}
```

#### Example: Array Validation

```typescript
// For array responses
transformResponse: (response: unknown) => {
  const parsed = z.array(userSchema).safeParse(response);
  if (!parsed.success) {
    logger.error('User list validation failed', parsed.error, { response });
    throw new Error('Invalid user list response structure');
  }
  return parsed.data;
}
```

#### Example: Optional Fields

```typescript
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(), // Optional field
  createdAt: z.string().datetime().optional()
});
```

### 7. Use Conditional Queries

Skip queries when data isn't needed:

```typescript
const { data } = useGetUserByIdQuery(userId, {
  skip: !userId // Don't query if userId is missing
});
```

---

## Examples

### Complete Example: Users API

**1. Create API file** (`src/store/api/users/users.api.ts`):

```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseApi';
import { z } from 'zod/v4';
import { logger } from '@services/logger/logger.service';

// Define Zod schemas (not interfaces)
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

export const createUserDtoSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

// Infer TypeScript types from schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserDtoSchema>;

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQuery,
  tagTypes: ['User'],
  endpoints: builder => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response: unknown) => {
        const parsed = z.array(userSchema).safeParse(response);
        if (!parsed.success) {
          logger.error('User list validation failed', parsed.error, { response });
          throw new Error('Invalid user list response structure');
        }
        return parsed.data;
      }
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        if (!parsed.success) {
          logger.error('User validation failed', parsed.error, { response, userId: id });
          throw new Error('Invalid user response structure');
        }
        return parsed.data;
      }
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        if (!parsed.success) {
          logger.error('Create user validation failed', parsed.error, { response });
          throw new Error('Invalid create user response structure');
        }
        return parsed.data;
      }
    }),
    updateUser: builder.mutation<User, { id: string } & CreateUserDto>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
      transformResponse: (response: unknown) => {
        const parsed = userSchema.safeParse(response);
        if (!parsed.success) {
          logger.error('Update user validation failed', parsed.error, { response, userId: id });
          throw new Error('Invalid update user response structure');
        }
        return parsed.data;
      }
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    })
  })
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} = usersApi;
```

**2. Add to store** (`src/store/store.ts`):

```typescript
import { usersApi } from './api/users/users.api';

export const store = configureStore({
  // ...
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat([
      authApi.middleware,
      sessionApi.middleware,
      usersApi.middleware, // Add this
      rtkQueryErrorLogger
    ])
});
```

**3. Use in component**:

```typescript
import { useGetUsersQuery, useCreateUserMutation } from '@store/api/users/users.api';
import { useNavigate } from 'react-router-dom';

function UsersPage() {
  const navigate = useNavigate();
  const { data: users, isLoading } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const handleCreate = async () => {
    // No catch block needed - middleware handles errors automatically
    // Only use catch if you need custom logic (e.g., redirect)
    try {
      const newUser = await createUser({
        name: 'John Doe',
        email: 'john@example.com'
      }).unwrap();
      
      // Custom success logic (optional)
      navigate(`/users/${newUser.id}`);
    } catch (error) {
      // Middleware already handled:
      // - Error logged
      // - Notification shown
      // - 401 handled (logout)
      
      // Only add custom logic if needed
      // Don't show error notification (middleware already did)
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreate} disabled={isCreating}>
        Create User
      </button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Example: Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { useCreateUserMutation } from '@store/api/users/users.api';
import { useNavigate } from 'react-router-dom';

function CreateUserForm() {
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserDto>();

  const onSubmit = async (data: CreateUserDto) => {
    // No catch block needed - middleware handles all errors
    // Only use catch if you need custom logic (e.g., form reset, redirect)
    try {
      const result = await createUser(data).unwrap();
      
      // Custom success logic (optional)
      reset(); // Reset form on success
      navigate(`/users/${result.id}`); // Redirect to user page
    } catch (error) {
      // Middleware already:
      // - Logged error
      // - Showed notification (including validation errors)
      // - Handled 401 (logout)
      
      // Only add custom logic if needed
      // Example: Keep form open if specific error
      // Don't show error notification (middleware already did)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: true })}
        placeholder="Name"
      />
      {errors.name && <span>Name is required</span>}

      <input
        {...register('email', { required: true })}
        placeholder="Email"
      />
      {errors.email && <span>Email is required</span>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## Summary

- ✅ **Store**: Centralized Redux store with error middleware
- ✅ **API Layer**: RTK Query with automatic transformation
- ✅ **Error Handling**: Automatic via middleware
- ✅ **Loading**: Automatic for all API calls
- ✅ **Type Safety**: TypeScript types throughout
- ✅ **Cache Management**: Automatic with tags
- ✅ **Performance**: Automatic tracking

All you need to do is:
1. Create API endpoints using `baseQuery`
2. Export hooks
3. Add to store middleware
4. Use hooks in components

Everything else is automatic! 🚀

