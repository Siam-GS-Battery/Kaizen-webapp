# User-Defined Preferred Patterns and Preferences

## React Development Standards

### Component Architecture
- Use functional components with React Hooks exclusively
- Implement proper component composition and reusability
- Follow single responsibility principle for components
- Use React.memo for expensive component optimizations
- Implement proper prop-types or TypeScript interfaces

### State Management
- Use useState and useReducer for local state
- Implement Context API for cross-component state sharing
- Consider React Query for server state management
- Avoid prop drilling beyond 2 levels

### Performance Optimization
- Implement code splitting with React.lazy()
- Use useMemo and useCallback to prevent unnecessary re-renders
- Optimize list rendering with proper keys and virtualization when needed
- Implement proper loading and error states
- Use React DevTools Profiler to identify bottlenecks

### Error Handling
- Implement Error Boundaries for component tree protection
- Provide user-friendly error messages
- Include retry mechanisms for failed operations
- Log errors appropriately for debugging

## Node.js/Express Standards

### API Design
- Follow RESTful conventions
- Implement proper HTTP status codes
- Use middleware for cross-cutting concerns
- Implement request validation and sanitization
- Add rate limiting and security headers

### Error Handling
- Use centralized error handling middleware
- Implement proper error logging
- Return consistent error response format
- Never expose sensitive information in errors

### Database Operations
- Use connection pooling
- Implement proper transaction handling
- Add query optimization and indexing
- Use parameterized queries to prevent SQL injection

## Testing Standards

### Unit Testing
- Minimum 80% code coverage for new features
- Test files colocated with source files (.test.js)
- Use Jest as the testing framework
- Use React Testing Library for component tests
- Mock external dependencies appropriately

### Test Principles
- Test user behavior, not implementation details
- Write descriptive test names
- Follow Arrange-Act-Assert pattern
- Test edge cases and error scenarios
- Ensure tests are deterministic and isolated

### Integration Testing
- Test API endpoints with supertest
- Test database operations with test database
- Test component integration flows
- Validate error handling paths

## Code Quality Standards

### General Principles
- Write self-documenting code
- Add comments only for complex business logic
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions small and focused
- Use meaningful variable and function names

### Code Organization
- Group related functionality together
- Maintain consistent file structure
- Separate concerns (UI, business logic, data)
- Use proper module exports/imports

### Security Best Practices
- Never commit secrets or API keys
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Use HTTPS for all communications
- Keep dependencies updated

## Git Workflow
- Write clear, concise commit messages
- Make atomic commits (one feature/fix per commit)
- Use feature branches for development
- Ensure all tests pass before committing
- Review code before merging to main branch
