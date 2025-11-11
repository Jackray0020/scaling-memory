# Contributing to MCP Time Schedule Server

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/mcp-time-schedule-server.git
   cd mcp-time-schedule-server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the Project**
   ```bash
   npm run build
   ```

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the `src/` directory

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Test your changes:
   ```bash
   npm run build
   node test-server.js
   ```

### Code Style

- Follow the existing TypeScript style
- Use Prettier for formatting: `npm run format`
- Run ESLint: `npm run lint`
- Use meaningful variable and function names
- Add comments for complex logic

### Type Safety

- Enable strict TypeScript checking
- Use proper type annotations
- Avoid `any` types when possible
- Use Zod schemas for runtime validation

## Testing

Currently, the project uses manual testing. We welcome contributions to add:

- Unit tests (Jest or Vitest)
- Integration tests
- End-to-end tests

Example test structure:

```typescript
describe('TaskScheduler', () => {
  it('should create a task', () => {
    // Test implementation
  });
});
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if adding features
   - Add examples to examples/
   - Update ARCHITECTURE.md if changing structure

2. **Ensure Code Quality**
   - Run `npm run lint`
   - Run `npm run format`
   - Build successfully: `npm run build`

3. **Write Clear Commit Messages**
   ```
   feat: add support for task priorities
   fix: handle timezone correctly in scheduling
   docs: update installation instructions
   refactor: simplify task execution logic
   ```

4. **Submit Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots/examples if relevant

## Areas for Contribution

### High Priority

- **Persistent Storage**: Add database support (PostgreSQL, MongoDB, Redis)
- **Testing**: Add comprehensive test suite
- **Error Handling**: Improve error messages and recovery
- **Documentation**: More examples and use cases

### Feature Ideas

- Task dependencies and workflows
- Web UI for task management
- Webhook notifications
- Retry logic for failed tasks
- Task history and analytics
- Time zone support
- Task templates
- Bulk operations
- Search and filtering
- Task priorities
- Task tags/categories

### Technical Improvements

- Performance optimization
- Memory usage optimization
- Better logging (structured logging)
- Metrics and monitoring (Prometheus)
- Health check endpoint
- Graceful shutdown handling
- Configuration validation
- API versioning

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

### What We Look For

- **Correctness**: Code works as intended
- **Quality**: Well-structured and maintainable
- **Testing**: Adequate test coverage
- **Documentation**: Changes are documented
- **Style**: Follows project conventions

## Reporting Bugs

### Before Submitting

- Check existing issues
- Verify it's reproducible
- Collect relevant information

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Node.js version:
- OS:
- MCP Client:

**Additional Context**
Logs, screenshots, etc.
```

## Feature Requests

We welcome feature requests! Please:

1. Check existing issues/PRs
2. Explain the use case
3. Describe the proposed solution
4. Consider alternatives

### Feature Request Template

```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives**
Other approaches considered

**Additional Context**
Examples, mockups, etc.
```

## Security Issues

**Do not** open public issues for security vulnerabilities.

Instead:
1. Email details to [security contact]
2. Allow time for fix before disclosure
3. We'll acknowledge and work on fix

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review example code

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing others' private information

## Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Credited in commit messages

Thank you for contributing! 🎉
