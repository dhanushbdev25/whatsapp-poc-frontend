# Services Documentation

## Overview

This document describes all services available in the application and how to use them.

## Logger Service

### Location
`src/services/logger/`

### Usage

```typescript
import { logger, logApiError } from '@services/logger/logger.service';

// Basic logging
logger.debug('Debug message', { context: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);

// API error logging
logApiError(error, { url, statusCode });
```

### Configuration

Log level is controlled by `VITE_LOG_LEVEL` environment variable:
- `debug`: All logs
- `info`: Info, warn, and error logs
- `warn`: Warn and error logs
- `error`: Error logs only

## Notification Service

### Location
`src/services/notifications/`

### Usage

```typescript
import { useNotification } from '@hooks/useNotification';

function MyComponent() {
  const notification = useNotification();

  // Show notifications
  notification.success('Operation successful');
  notification.error('Operation failed', 'Error');
  notification.warning('Warning message');
  notification.info('Information message');

  // Custom notification
  notification.show({
    type: 'success',
    title: 'Custom Title',
    message: 'Custom message',
    duration: 3000
  });
}
```

### Provider Setup

The `NotificationProvider` must wrap your app (already set up in `App.tsx`).

## Loading Service

### Location
`src/services/loading/`

### Quick Start

**The simplest way:** Just use `BackdropLoader` - it automatically shows/hides based on API calls and global loading state!

```typescript
import BackdropLoader from '@components/third-party/BackdropLoader';

function MyComponent() {
  // Just render it - it automatically shows for global loading
  return (
    <>
      <MyContent />
      <BackdropLoader /> {/* Shows automatically during API calls */}
    </>
  );
}
```

**API calls automatically trigger loading** - no manual code needed! The `baseApi.ts` automatically manages global loading state for all RTK Query API calls.

### Manual Loading Control

#### Method 1: Using the Hook (Simple)

```typescript
import { useLoading } from '@hooks/useLoading';

function MyComponent() {
  const { startLoading, stopLoading, isLoading } = useLoading();

  const handleAction = async () => {
    const loadingId = startLoading('global'); // Start loading
    try {
      await performAction();
    } finally {
      stopLoading(loadingId); // Always stop loading
    }
  };

  return <div>{isLoading && <p>Loading...</p>}</div>;
}
```

#### Method 2: Using withLoading Helper (Easiest)

```typescript
import { withLoading } from '@services/loading/loading.utils';

function MyComponent() {
  const handleAction = async () => {
    // Automatically handles start/stop loading
    const result = await withLoading(
      () => performAction(),
      'global',
      'Loading data...'
    );
  };
}
```

#### Method 3: Using useEffect with Automatic Cleanup

```typescript
import { useLoading } from '@hooks/useLoading';

function MyComponent() {
  const { useLoadingState } = useLoading();

  useEffect(() => {
    // Automatically stops when component unmounts
    return useLoadingState('global', 'Loading...');
  }, []);
}
```

### Loading Types & Components

#### 1. Global Loading (Full-screen overlay)

**Use case:** API calls, page loads, major operations

```typescript
// Method 1: Automatic (API calls)
// Just use BackdropLoader - it's automatic for RTK Query calls

// Method 2: Manual
const { startLoading, stopLoading } = useLoading();
const id = startLoading('global', 'Loading data...');
// ... do work
stopLoading(id);

// Method 3: Component
import { GlobalLoader } from '@components/common/loading/GlobalLoader';
<GlobalLoader /> // Shows automatically when global loading is active
```

#### 2. Inline Loading (Within content area)

**Use case:** Loading specific sections, tables, lists

```typescript
import { InlineLoader } from '@components/common/loading/InlineLoader';

function DataTable() {
  const { startLoading, stopLoading, isInlineLoading } = useLoading();

  const loadData = async () => {
    const id = startLoading('inline', 'Loading table data...');
    try {
      await fetchTableData();
    } finally {
      stopLoading(id);
    }
  };

  return (
    <div>
      {isInlineLoading && <InlineLoader message="Loading table..." />}
      <Table data={data} />
    </div>
  );
}
```

#### 3. Button Loading (Button-specific)

**Use case:** Form submissions, action buttons

```typescript
import { ButtonLoader } from '@components/common/loading/ButtonLoader';

function SubmitForm() {
  const { startLoading, stopLoading, isButtonLoading } = useLoading();

  const handleSubmit = async () => {
    const id = startLoading('button');
    try {
      await submitForm();
    } finally {
      stopLoading(id);
    }
  };

  return (
    <ButtonLoader
      variant="contained"
      onClick={handleSubmit}
      disabled={isButtonLoading}
    >
      {isButtonLoading ? 'Submitting...' : 'Submit'}
    </ButtonLoader>
  );
}
```

#### 4. Overlay Loading (Container-specific)

**Use case:** Loading within a specific container/component

```typescript
import { LoadingOverlay } from '@components/common/loading/LoadingOverlay';

function DataCard() {
  const { startLoading, stopLoading, isOverlayLoading } = useLoading();

  const loadData = async () => {
    const id = startLoading('overlay', 'Loading card data...');
    try {
      await fetchCardData();
    } finally {
      stopLoading(id);
    }
  };

  return (
    <Box position="relative">
      <LoadingOverlay message="Loading..." />
      <Card>
        <CardContent>Your content here</CardContent>
      </Card>
    </Box>
  );
}
```

### Common Patterns

#### Pattern 1: Multiple Loading States

```typescript
function ComplexComponent() {
  const { startLoading, stopLoading, isGlobalLoading, isInlineLoading } = useLoading();

  const loadPageData = async () => {
    const globalId = startLoading('global');
    try {
      await loadMainData();
    } finally {
      stopLoading(globalId);
    }
  };

  const loadTableData = async () => {
    const inlineId = startLoading('inline');
    try {
      await loadTable();
    } finally {
      stopLoading(inlineId);
    }
  };

  return (
    <>
      <BackdropLoader /> {/* Global */}
      {isInlineLoading && <InlineLoader />} {/* Inline */}
      <TableComponent />
    </>
  );
}
```

#### Pattern 2: Using withLoading for Clean Code

```typescript
import { withLoading } from '@services/loading/loading.utils';

function MyComponent() {
  const loadUserData = async () => {
    const user = await withLoading(
      () => api.getUser(),
      'global',
      'Loading user...'
    );
    return user;
  };

  const saveData = async () => {
    await withLoading(
      () => api.saveData(),
      'button',
      'Saving...'
    );
  };
}
```

#### Pattern 3: Conditional Loading Display

```typescript
function MyComponent() {
  const { isLoading, isGlobalLoading, isButtonLoading } = useLoading();

  return (
    <>
      {/* Global loader - shows for all global loading */}
      <BackdropLoader />
      
      {/* Conditional rendering */}
      {isLoading && <p>Something is loading...</p>}
      
      {/* Button with loading state */}
      <Button disabled={isButtonLoading}>
        {isButtonLoading ? 'Loading...' : 'Submit'}
      </Button>
    </>
  );
}
```

### RTK Query Integration

**RTK Query calls automatically manage global loading** - no manual code needed!

```typescript
import { useGetDataQuery } from '@store/api/data.api';

function MyComponent() {
  // isLoading is automatically managed by RTK Query
  // BackdropLoader will automatically show during the query
  const { data, isLoading } = useGetDataQuery();

  return (
    <>
      <BackdropLoader /> {/* Shows automatically when isLoading is true */}
      {data && <div>{data}</div>}
    </>
  );
}
```

### Provider Setup

The `LoadingProvider` must wrap your app (already set up in `App.tsx`). Make sure `BackdropLoader` or `GlobalLoader` is rendered at the root level.

## Performance Monitor

### Location
`src/services/performance/`

### Usage

```typescript
import { usePerformance } from '@hooks/usePerformance';

function MyComponent() {
  const perf = usePerformance();

  const measureSomething = () => {
    const measureId = perf.startMeasure('my-operation');
    // ... perform operation
    const duration = perf.endMeasure(measureId);
    console.log(`Operation took ${duration}ms`);
  };
}
```

### Web Vitals

```typescript
const { getWebVitals } = usePerformance();
const vitals = getWebVitals();
// { lcp, fid, cls, ttfb, fcp }
```

### Configuration

Controlled by `VITE_ENABLE_PERFORMANCE_MONITORING` environment variable.

