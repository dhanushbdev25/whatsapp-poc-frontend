# Architecture Overview

## Project Structure

```
src/
├── config/              # Configuration files
│   └── env.ts           # Environment variables with validation
├── constants/           # Application constants
│   ├── api.constants.ts
│   ├── app.constants.ts
│   ├── ui.constants.ts
│   └── error.constants.ts
├── types/               # TypeScript type definitions
│   ├── api.types.ts
│   ├── common.types.ts
│   ├── error.types.ts
│   ├── notification.types.ts
│   └── loading.types.ts
├── schemas/             # Zod validation schemas
│   ├── api.schemas.ts
│   ├── auth.schemas.ts
│   ├── session.schemas.ts
│   └── common.schemas.ts
├── services/            # Core services
│   ├── logger/          # Error logging service
│   ├── notifications/   # Notification service
│   ├── loading/         # Loading state management
│   └── performance/     # Performance monitoring
├── components/          # React components
│   └── common/          # Common UI components
├── hooks/               # Custom React hooks
├── store/               # Redux store and API
└── utils/               # Utility functions
```

## Core Services

### Logger Service

Provides centralized error logging with:
- Multiple log levels (debug, info, warn, error)
- Context information (user, route, timestamp)
- Console and optional remote logging

### Notification Service

Toast notification system replacing SweetAlert2:
- Success, error, warning, and info notifications
- Auto-dismiss with configurable duration
- Stack management for multiple notifications

### Loading Service

Centralized loading state management:
- Global, inline, button, and overlay loading states
- Loading queue management
- Automatic state management

### Performance Monitor

Tracks application performance:
- Page load times
- API response times
- Component render times
- Web Vitals (LCP, FID, CLS)

## State Management

- **Redux Toolkit**: Global state management
- **RTK Query**: API data fetching and caching
- **React Context**: Loading and notification state

## Type Safety

- **TypeScript**: Full type coverage
- **Zod**: Runtime validation for API responses
- **Type inference**: Types derived from Zod schemas

## Error Handling

- Error boundaries for React components
- Centralized error logging
- User-friendly error notifications
- Automatic error categorization

