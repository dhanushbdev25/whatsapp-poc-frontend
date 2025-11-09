# Theme System Documentation

## Overview

The theme system is a centralized, dynamic, and highly configurable solution for managing application styling. It follows MUI v7 best practices and supports:

- **Dark Mode**: Full support with system preference detection
- **Theme Variants**: Multiple theme presets (default, corporate, modern)
- **Centralized Configuration**: All theme settings in one place
- **TypeScript Support**: Full type safety with theme extensions
- **Performance**: Optimized with proper memoization
- **Persistence**: Theme preferences saved to localStorage

## Architecture

### File Structure

```
src/themes/
├── config/
│   ├── theme.config.ts          # Main configuration interface
│   ├── default.theme.config.ts  # Default theme preset
│   └── theme.variants.ts        # Multiple theme presets
├── types/
│   └── theme.d.ts               # TypeScript theme extensions
├── utils/
│   └── theme.utils.ts           # Theme utility functions
├── overrides/                   # Component overrides
├── palette.ts                   # Palette generator
├── typography.ts                # Typography generator
├── shadows.ts                   # Shadows generator
└── index.tsx                    # Main ThemeProvider
src/contexts/
└── ThemeContext.tsx             # Theme context & state management
```

## Configuration

### Single Config File

All theme settings are centralized in `src/themes/config/theme.config.ts`. This is the **single source of truth** for all theme customizations.

```typescript
export const themeConfig: ThemeConfig = {
  palette: {
    primary: { main: '#0D5FDC' },
    secondary: { main: '#042E70' },
    status: {
      pending: '#FEF8E8',
      accepted: '#48D7B9',
      rejected: '#F9789A'
    }
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    // ... other typography settings
  },
  breakpoints: {
    values: { xs: 0, sm: 768, md: 1024, lg: 1266, xl: 1536 }
  },
  shadows: {
    button: '0 2px #0000000b',
    text: '0 -1px 0 rgb(0 0 0 / 12%)',
    z1: '0px 2px 8px rgba(0, 0, 0, 0.15)'
  },
  shape: {
    borderRadius: 12
  }
};
```

### Adding/Removing Themes

#### Adding a New Theme Variant

1. Open `src/themes/config/theme.variants.ts`
2. Create a new variant object:

```typescript
export const myNewVariant: ThemeConfig = {
  palette: {
    primary: { main: '#YOUR_COLOR' },
    secondary: { main: '#YOUR_COLOR' },
    status: {
      pending: '#YOUR_COLOR',
      accepted: '#YOUR_COLOR',
      rejected: '#YOUR_COLOR'
    }
  },
  // ... other settings
};
```

3. Add it to the `themeVariants` registry:

```typescript
export const themeVariants = {
  default: defaultVariant,
  corporate: corporateVariant,
  modern: modernVariant,
  myNewVariant: myNewVariant  // Add here
};
```

4. Update the `ThemeVariantName` type in `src/contexts/ThemeContext.tsx`:

```typescript
export type ThemeVariantName = 'default' | 'corporate' | 'modern' | 'myNewVariant';
```

#### Removing a Theme Variant

1. Remove the variant from `themeVariants` object in `theme.variants.ts`
2. Remove it from `ThemeVariantName` type in `ThemeContext.tsx`
3. Delete the variant file if it exists separately

## Usage

### Using Theme in Components

#### Basic Usage

```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{ color: theme.palette.primary.main }}>
      Hello World
    </Box>
  );
}
```

#### Using Custom Theme Properties

```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  // Access custom shadows
  const shadow = theme.customShadows.z1;
  
  // Access status colors
  const statusColor = theme.palette.status.pending;
  
  return (
    <Paper sx={{ boxShadow: shadow }}>
      <Chip sx={{ bgcolor: statusColor }} label="Pending" />
    </Paper>
  );
}
```

#### Using Theme Context

```typescript
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { mode, toggleThemeMode, variant, setThemeVariant } = useAppTheme();
  
  return (
    <div>
      <Button onClick={toggleThemeMode}>
        Current: {mode}
      </Button>
      <Button onClick={() => setThemeVariant('corporate')}>
        Switch to Corporate
      </Button>
    </div>
  );
}
```

### Theme Context API

The `ThemeContext` provides:

- `mode`: Current theme mode ('light' | 'dark')
- `theme`: MUI Theme object
- `variant`: Current theme variant ('default' | 'corporate' | 'modern')
- `toggleThemeMode()`: Toggle between light and dark
- `setThemeMode(mode)`: Set theme mode explicitly
- `setThemeVariant(variant)`: Switch theme variant

## Customization

### Changing Colors

Edit `src/themes/config/theme.config.ts`:

```typescript
palette: {
  primary: {
    main: '#YOUR_PRIMARY_COLOR'  // Change here
  },
  secondary: {
    main: '#YOUR_SECONDARY_COLOR'  // Change here
  }
}
```

### Changing Typography

Edit typography settings in the config:

```typescript
typography: {
  fontFamily: "'Your Font', sans-serif",
  htmlFontSize: 16,
  fontWeightBold: 700
}
```

### Changing Breakpoints

Modify breakpoint values:

```typescript
breakpoints: {
  values: {
    xs: 0,
    sm: 640,    // Change here
    md: 768,    // Change here
    lg: 1024,   // Change here
    xl: 1280    // Change here
  }
}
```

### Adding Custom Shadows

Add to config and access via `theme.customShadows`:

```typescript
shadows: {
  button: '0 2px #0000000b',
  text: '0 -1px 0 rgb(0 0 0 / 12%)',
  z1: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  z2: '0px 4px 16px rgba(0, 0, 0, 0.2)'  // Add new shadow
}
```

## Component Overrides

Component overrides are located in `src/themes/overrides/`. Each component has its own file for maintainability.

### Adding Component Overrides

1. Create a new file in `src/themes/overrides/` (e.g., `MyComponent.ts`)
2. Export a function that returns override styles:

```typescript
import { Theme } from '@mui/material/styles';

export default function MyComponent(theme: Theme) {
  return {
    MuiMyComponent: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius
        }
      }
    }
  };
}
```

3. Import and add to `src/themes/overrides/index.ts`:

```typescript
import MyComponent from './MyComponent';

export default function ComponentsOverrides(theme: Theme) {
  return mergeMany(
    // ... existing overrides
    MyComponent(theme)  // Add here
  );
}
```

## Dark Mode

Dark mode is fully supported and automatically adapts:

- Colors adjust based on mode
- Shadows adapt opacity
- Text colors maintain contrast
- Background colors switch appropriately

### Enabling Dark Mode

```typescript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { toggleThemeMode, setThemeMode } = useTheme();
  
  // Toggle
  toggleThemeMode();
  
  // Or set explicitly
  setThemeMode('dark');
}
```

## Performance

The theme system is optimized for performance:

- All theme creation is memoized
- Theme only recreates when mode or variant changes
- Component overrides are cached
- No unnecessary re-renders

## Best Practices

1. **Always use theme values** - Don't hardcode colors, use `theme.palette.primary.main`
2. **Use custom properties** - Extend theme with custom properties for app-specific values
3. **Leverage mode awareness** - Let the theme handle light/dark differences
4. **Centralize changes** - Modify theme config, not individual components
5. **Type safety** - Use TypeScript theme extensions for custom properties

## Troubleshooting

### Theme not updating

- Ensure `ThemeContextProvider` wraps `ThemeCustomization`
- Check that mode/variant changes trigger re-renders
- Verify localStorage permissions

### Type errors

- Ensure `src/themes/types/theme.d.ts` is included in tsconfig
- Check that custom properties are defined in type extensions

### Colors not changing

- Verify config file is imported correctly
- Check that theme variant is set correctly
- Ensure component uses theme values, not hardcoded colors

## Examples

See the following files for examples:

- `src/themes/config/theme.variants.ts` - Theme variant examples
- `src/themes/overrides/` - Component override examples
- `src/contexts/ThemeContext.tsx` - Context usage examples

