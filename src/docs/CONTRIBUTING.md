# Contributing Guidelines

## Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use ESLint and Prettier (configured in project)
- Run `npm run lint-fix` before committing

## Type Safety

- Always define types for function parameters and return values
- Use Zod schemas for API response validation
- Infer types from schemas when possible
- Avoid `any` type - use `unknown` if type is truly unknown

## Error Handling

- Use the logger service for all error logging
- Use the notification service for user-facing errors
- Provide meaningful error messages
- Log errors with appropriate context

## API Integration

- Use RTK Query for all API calls
- Validate responses with Zod schemas
- Handle errors appropriately
- Use loading service for async operations

## Testing

- Write unit tests for utilities and services
- Test error handling paths
- Test type validation
- Manual testing in development environment

## Documentation

- Add JSDoc comments to public APIs
- Document complex functions
- Update this documentation when adding features
- Include usage examples in code comments

## Commit Messages

Follow conventional commit format:
- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `refactor: Refactor code`
- `test: Add tests`

## Pull Request Process

1. Create feature branch from main
2. Make changes following guidelines
3. Run `npm run check-all` to verify
4. Update documentation if needed
5. Create pull request with description

