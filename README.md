# Frontend Skeleton

A production-ready React + TypeScript frontend skeleton built with Vite, featuring authentication, role-based access control, dynamic routing, and a modern UI using Material-UI.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or **pnpm** / **yarn**)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create a .env file in the root directory
   # See Environment Variables section below for required variables
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 📁 Architecture Overview

### Project Structure

```
src/
├── assets/              # Static assets (images, icons)
├── common/              # Shared types and enums
├── components/          # Reusable React components
│   ├── common/         # Common UI components
│   │   ├── loading/     # Loading components
│   │   └── performance/ # Performance components
│   ├── table/          # Table components
│   └── third-party/    # Third-party integrations
├── config/             # Configuration files
│   └── env.ts          # Environment variables with validation
├── constants/          # Application constants
│   ├── api.constants.ts
│   ├── app.constants.ts
│   ├── ui.constants.ts
│   └── error.constants.ts
├── contexts/           # React contexts (Role management)
├── hooks/              # Custom React hooks
├── layouts/            # Layout components (Main, Minimal)
│   └── MainLayout/     # Main application layout with sidebar
│       └── Drawer/     # Navigation drawer components
├── pages/              # Page components
│   ├── authentication/ # Login/auth pages
│   ├── business/       # Business logic pages
│   └── general/       # General pages (404, errors)
├── routes/             # Route configuration
│   ├── screenList.ts   # Screen/module configuration
│   └── screenHelpers.ts # Route helper functions
├── schemas/            # Zod validation schemas
│   ├── api.schemas.ts
│   ├── auth.schemas.ts
│   ├── session.schemas.ts
│   └── common.schemas.ts
├── services/           # Core services
│   ├── logger/         # Error logging service
│   ├── notifications/  # Notification service
│   ├── loading/        # Loading state management
│   └── performance/   # Performance monitoring
├── store/              # Redux store configuration
│   ├── api/            # RTK Query API definitions
│   └── reducers/       # Redux reducers
├── themes/             # MUI theme configuration
│   ├── overrides/      # Component theme overrides
│   └── palette.ts      # Color palette definitions
├── types/              # TypeScript type definitions
│   ├── api.types.ts
│   ├── common.types.ts
│   ├── error.types.ts
│   ├── notification.types.ts
│   └── loading.types.ts
└── utils/              # Utility functions
```

### Key Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI) 7** - Component library
- **Redux Toolkit** - State management
- **RTK Query** - API data fetching
- **React Router v7** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Azure MSAL** - Microsoft authentication
- **Day.js** - Date manipulation

### Core Features

#### 1. **Authentication & Authorization**

- JWT-based authentication with automatic token refresh
- Azure AD integration (MSAL)
- Role-based access control (RBAC)
- Permission-based route protection
- Session management with cookie storage

#### 2. **Dynamic Routing**

- Permission-based route generation
- Lazy-loaded components
- Hierarchical navigation structure
- Automatic route guards
- Dynamic sidebar menu generation

#### 3. **State Management**

- Redux Toolkit for global state
- RTK Query for API calls
- Automatic 401 handling with token refresh
- Cached session data

#### 4. **UI/UX**

- Responsive Material-UI design
- Customizable theme system
- Component library with common patterns
- Loading states and error boundaries
- Breadcrumb navigation

### Authentication Flow

1. User attempts to access protected route
2. `useAuthRoutes` hook checks for authentication token
3. If no token → redirects to login page
4. If token exists → fetches user session context
5. Session includes user roles and permissions
6. Routes are dynamically generated based on permissions
7. Sidebar navigation filtered by permissions

### Route Configuration

Routes are configured in `src/routes/screenList.ts`:

```typescript
export const mainModuleConfigs: MainModuleConfig[] = [
	{
		text: 'Module Name',
		icon: DashboardIcon,
		order: 0,
		submodules: [
			{
				icon: DashboardIcon,
				text: 'Screen Name',
				path: 'screen-path',
				element: imports.screenComponent,
				permission: 'PERMISSION_NAME', // Required permission
				isInitial: true, // Initial route
				order: 1,
				showInSidebar: true
			}
		]
	}
];
```

### Adding New Screens

1. **Create the page component** in `src/pages/business/`
2. **Add lazy import** in `src/routes/screenList.ts`:
   ```typescript
   export const imports = {
   	newScreen: Loadable(lazy(() => import('../pages/business/NewScreen')))
   };
   ```
3. **Add to module config** in `mainModuleConfigs`
4. **Set appropriate permission** string

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables

| Variable                | Description                                | Example                                |
| ----------------------- | ------------------------------------------ | -------------------------------------- |
| `VITE_APP_NAME`         | Application name displayed in UI           | `My Application`                       |
| `API_BASE_URL`          | Backend API base URL (with trailing slash) | `https://api.example.com/web/`         |
| `API_BASE_URL_PRE_AUTH` | Pre-authentication API base URL            | `https://api.example.com/`             |
| `VITE_AZURE_CLIENT_ID`  | Azure AD Application (Client) ID           | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### Optional Variables

| Variable                             | Description                              | Default                            |
| ------------------------------------ | ---------------------------------------- | ---------------------------------- |
| `REDIRECT_URI`                       | OAuth redirect URI                       | `http://localhost:5173/auth/login` |
| `NODE_ENV`                           | Environment mode                         | `development`                      |
| `ANALYZE`                            | Enable bundle analyzer                   | `false`                            |
| `VITE_ENABLE_ANALYTICS`              | Enable analytics tracking                | `false`                            |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | Enable performance monitoring            | `true`                             |
| `VITE_LOG_LEVEL`                     | Logging level (debug, info, warn, error) | `info`                             |

### Example `.env` File

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# Application Configuration
VITE_APP_NAME=My Application
API_BASE_URL=http://localhost:8000/web/
API_BASE_URL_PRE_AUTH=http://localhost:8000/
REDIRECT_URI=http://localhost:5173/auth/login

# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-azure-client-id-here

# Environment
NODE_ENV=development

# Feature Flags (Optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_LOG_LEVEL=info
```

**Note:** Copy `.env.example` to `.env` and update the values for your environment.

### Environment Variables in Vite

All environment variables prefixed with `VITE_` are exposed to the client-side code. Access them using:

```typescript
process.env.VITE_APP_NAME;
```

Non-prefixed variables (like `API_BASE_URL`) are available through Vite's `EnvironmentPlugin` configured in `vite.config.ts`.

## 📦 Available Scripts

| Script                  | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start development server                             |
| `npm run build`         | Build for production                                 |
| `npm run build:analyze` | Build with bundle analyzer                           |
| `npm run preview`       | Preview production build                             |
| `npm run lint`          | Run ESLint                                           |
| `npm run lint-fix`      | Fix ESLint errors automatically                      |
| `npm run pretty`        | Format code with Prettier                            |
| `npm run pretty:check`  | Check code formatting                                |
| `npm run check-all`     | Run all checks (lint, format, type, build, security) |

## 🎨 Theming

The application uses Material-UI's theming system with custom configurations:

- **Theme location**: `src/themes/`
- **Color palette**: Uses `@ant-design/colors` for consistent color schemes
- **Component overrides**: Located in `src/themes/overrides/`
- **Customization**: Modify `src/themes/palette.ts` and `src/themes/theme/index.ts`

## 🔒 Security Features

- JWT token stored in httpOnly cookies (configured in backend)
- Automatic token refresh on 401 responses
- CSRF protection via SameSite cookies
- XSS protection through React's built-in escaping
- Permission-based access control

## 🧪 Code Quality

The project includes:

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **TypeScript** - Type checking

### Pre-commit Hooks

Before each commit:

- ESLint auto-fixes
- Prettier formatting

Before each push:

- TypeScript type checking
- ESLint validation
- Prettier check
- Production build verification

## 📝 API Integration

### RTK Query Setup

API endpoints are defined in `src/store/api/`:

```typescript
// Example API endpoint
export const exampleApi = createApi({
	reducerPath: 'exampleApi',
	baseQuery: baseQuery,
	endpoints: builder => ({
		getData: builder.query<DataType, void>({
			query: () => '/api/endpoint'
		})
	})
});
```

### Base API Configuration

- **Automatic 401 handling**: Token refresh on authentication errors
- **Base URL**: Configured via `API_BASE_URL` environment variable
- **Credentials**: Cookies included in requests

## 🚢 Deployment

### Docker

A `Dockerfile` is included for containerized deployment.

### Build Output

Production builds are optimized with:

- Code minification (Terser)
- Tree shaking
- Code splitting
- Asset optimization
- Source map generation (optional)

### Bundle Analysis

Run `npm run build:analyze` to generate a bundle analysis report.

## 🛠️ Services & Utilities

### Error Logging Service

Centralized error logging with multiple log levels and context information:

```typescript
import { logger } from '@services/logger/logger.service';

logger.debug('Debug message', { context: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

**Configuration**: Set `VITE_LOG_LEVEL` environment variable (debug, info, warn, error)

### Notification Service

Toast notification system replacing SweetAlert2:

```typescript
import { useNotification } from '@hooks/useNotification';

const notification = useNotification();
notification.success('Operation successful');
notification.error('Operation failed', 'Error');
```

**Features**: Auto-dismiss, stack management, multiple notification types

### Loading Service

Centralized loading state management:

```typescript
import { useLoading } from '@hooks/useLoading';

const { startLoading, stopLoading, isLoading } = useLoading();
const loadingId = startLoading('global', 'Loading...');
// ... perform action
stopLoading(loadingId);
```

**Types**: global, inline, button, overlay

### Performance Monitoring

Track application performance metrics:

```typescript
import { usePerformance } from '@hooks/usePerformance';

const perf = usePerformance();
const measureId = perf.startMeasure('operation');
// ... perform operation
const duration = perf.endMeasure(measureId);
```

**Features**: Page load tracking, API response times, Web Vitals (LCP, FID, CLS)

**Configuration**: Set `VITE_ENABLE_PERFORMANCE_MONITORING` environment variable

## 📋 Type System

The application uses a comprehensive type system:

- **Type Definitions**: Located in `src/types/` - API, common, error, notification, and loading types
- **Zod Schemas**: Located in `src/schemas/` - Runtime validation with type inference
- **Type Safety**: All API responses validated with Zod schemas

For detailed type documentation, see [TYPES.md](src/docs/TYPES.md)

## 🔍 Error Handling

Comprehensive error handling system:

- **Error Logging**: All errors logged with context (user, route, timestamp)
- **Error Notifications**: User-friendly error notifications
- **Error Boundaries**: React error boundaries for component-level error handling
- **API Error Handling**: Automatic error logging and notification

For detailed error handling guide, see [SERVICES.md](src/docs/SERVICES.md)

## 📊 Performance Monitoring

Performance monitoring is built-in and tracks:

- Page load times
- API response times
- Component render times (optional)
- Web Vitals (LCP, FID, CLS)

Enable/disable via `VITE_ENABLE_PERFORMANCE_MONITORING` environment variable.

For detailed performance guide, see [SERVICES.md](src/docs/SERVICES.md)

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Azure MSAL Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Zod Documentation](https://zod.dev/)

## 📖 Documentation

Comprehensive documentation is available in `src/docs/`:

- [API.md](src/docs/API.md) - API documentation
- [ARCHITECTURE.md](src/docs/ARCHITECTURE.md) - Architecture overview
- [SERVICES.md](src/docs/SERVICES.md) - Services documentation
- [TYPES.md](src/docs/TYPES.md) - Type system documentation
- [CONTRIBUTING.md](src/docs/CONTRIBUTING.md) - Contribution guidelines

## 🤝 Contributing

1. Follow the existing code style
2. Run `npm run check-all` before committing
3. Write meaningful commit messages
4. Update documentation as needed
5. See [CONTRIBUTING.md](src/docs/CONTRIBUTING.md) for detailed guidelines
