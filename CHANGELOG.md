# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-11

### Added

#### Core Features
- MCP server implementation with stdio transport
- Task scheduler with in-memory storage
- Support for one-time scheduled tasks
- Support for recurring tasks with cron expressions
- 11 MCP tools for task and agent management
- Integration with rtrvr.ai web agent

#### Task Management Tools
- `create_scheduled_task` - Create new scheduled tasks
- `list_tasks` - List all or filtered tasks by status
- `get_task` - Retrieve task details by ID
- `update_task` - Update existing task properties
- `delete_task` - Delete a task permanently
- `execute_task` - Execute a task immediately
- `cancel_task` - Cancel scheduled task execution
- `get_upcoming_tasks` - Get next N scheduled tasks

#### rtrvr.ai Integration Tools
- `rtrvr_query_agent` - Send queries to rtrvr.ai agent
- `rtrvr_get_status` - Check rtrvr.ai agent status
- `rtrvr_schedule_web_action` - Schedule web automation actions

#### Type Safety
- Zod schemas for runtime validation
- TypeScript strict mode enabled
- Type definitions for all components
- Input validation for all tools

#### Scheduling
- Cron-based recurring tasks using node-cron
- setTimeout-based one-time tasks
- Automatic task status updates
- Task execution via rtrvr.ai client

#### Developer Experience
- TypeScript configuration with source maps
- ESLint configuration with TypeScript support
- Prettier formatting configuration
- Watch mode for development
- Build scripts

#### Documentation
- Comprehensive README with features and examples
- USAGE.md with detailed usage guide
- ARCHITECTURE.md with technical details
- CONTRIBUTING.md with contribution guidelines
- QUICKSTART.md for quick setup
- PROJECT_SUMMARY.md with project overview
- Example usage in examples/ directory
- MCP client configuration examples

#### Deployment
- Dockerfile for containerization
- Docker ignore file
- Environment variable configuration
- Test server script

#### Configuration
- Example environment file (.env.example)
- MCP client configuration (mcp-config.json)
- Git ignore rules
- Docker ignore rules

### Technical Details

#### Dependencies
- @modelcontextprotocol/sdk: ^0.5.0
- node-cron: ^3.0.3
- axios: ^1.6.2
- zod: ^3.22.4

#### DevDependencies
- TypeScript: ^5.3.3
- ESLint: ^8.55.0
- Prettier: ^3.1.1
- @typescript-eslint packages: ^6.13.2

#### Project Structure
```
src/
├── index.ts          - MCP server (~535 lines)
├── scheduler.ts      - Task scheduler (~135 lines)
├── rtrvr-client.ts   - HTTP client (~110 lines)
└── types.ts          - Type definitions (~60 lines)
```

### Design Decisions

#### In-Memory Storage
- Chosen for simplicity in v1.0
- Suitable for development and testing
- Documented limitation in README
- Future enhancement: database integration

#### Stdio Transport
- Standard MCP communication method
- Compatible with all MCP clients
- No HTTP server overhead
- Ideal for local development

#### Zod Validation
- Runtime type safety
- Better error messages
- Schema-based validation
- Consistent with TypeScript types

#### Cron Expression Support
- Standard cron syntax
- Widely understood format
- Flexible scheduling options
- Validation included

### Known Limitations

- Tasks stored in memory (lost on restart)
- No task history or execution logs
- No retry logic for failed tasks
- No authentication or authorization
- No distributed scheduling
- No webhook notifications
- No task dependencies
- Single timezone (UTC)

### Security Notes

- API keys via environment variables
- No secrets in code or repository
- Warning in docs about production security
- Recommendations for secure deployment

### License

- MIT License included
- Open source and permissive
- Commercial use allowed

---

## [Unreleased]

### Planned Features

#### High Priority
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Task execution history
- [ ] Retry logic with exponential backoff
- [ ] Authentication and authorization
- [ ] Health check endpoint

#### Medium Priority
- [ ] Web UI for task management
- [ ] Webhook notifications
- [ ] Task dependencies and workflows
- [ ] Time zone support
- [ ] Bulk operations

#### Low Priority
- [ ] Distributed scheduling
- [ ] Metrics and monitoring
- [ ] Task templates
- [ ] Advanced filtering

### Future Enhancements

- Unit and integration tests
- Performance optimizations
- Memory usage improvements
- Better error messages
- Structured logging
- API versioning
- Migration system

---

## Version History

### Version 1.0.0 - Initial Release
- First stable release
- Core task scheduling functionality
- rtrvr.ai integration
- Comprehensive documentation
- Ready for development/testing

---

## Notes

### Version Numbering
- **Major**: Breaking changes
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, no new features

### Release Process
1. Update CHANGELOG.md
2. Update version in package.json
3. Run tests (when available)
4. Build and verify
5. Tag release
6. Publish to npm (future)

### Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute changes.
