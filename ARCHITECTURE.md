# Architecture

## Overview

The MCP Time Schedule Server is a Model Context Protocol server that provides time-based task scheduling with integration to rtrvr.ai web agent for task execution.

## Components

### 1. MCP Server (`src/index.ts`)

The main entry point that implements the Model Context Protocol server:

- **Responsibilities:**
  - Exposes MCP tools for task management
  - Handles tool invocation requests
  - Validates input using Zod schemas
  - Coordinates between scheduler and rtrvr.ai client

- **Tools Provided:**
  - Task CRUD operations (create, read, update, delete)
  - Task execution and cancellation
  - Task listing and filtering
  - Direct rtrvr.ai agent interaction

### 2. Task Scheduler (`src/scheduler.ts`)

Manages task lifecycle and scheduling logic:

- **Responsibilities:**
  - Store and manage tasks in memory
  - Schedule one-time tasks using setTimeout
  - Schedule recurring tasks using cron expressions
  - Execute tasks at scheduled times
  - Update task status based on execution results
  - Handle task cancellation and deletion

- **Key Methods:**
  - `createTask()`: Creates and schedules a new task
  - `scheduleRecurringTask()`: Sets up cron job for recurring tasks
  - `scheduleOneTimeTask()`: Sets up timeout for one-time tasks
  - `executeTask()`: Executes task via rtrvr.ai client
  - `updateTask()`: Updates task and reschedules if needed
  - `cancelTask()`: Cancels task execution
  - `getUpcomingTasks()`: Returns upcoming scheduled tasks

### 3. rtrvr.ai Client (`src/rtrvr-client.ts`)

HTTP client for interacting with rtrvr.ai web agent API:

- **Responsibilities:**
  - Make HTTP requests to rtrvr.ai API
  - Handle authentication via API key
  - Execute tasks through web agent
  - Query agent for information
  - Check agent status
  - Schedule web actions

- **Key Methods:**
  - `executeTask()`: Execute a task action via the agent
  - `queryAgent()`: Send a query to the agent
  - `getAgentStatus()`: Get current agent status
  - `scheduleWebAction()`: Schedule a web action for future execution

### 4. Type Definitions (`src/types.ts`)

Zod schemas and TypeScript types:

- **Task Types:**
  - `Task`: Complete task object
  - `CreateTask`: Input for creating a task
  - `UpdateTask`: Input for updating a task

- **rtrvr.ai Types:**
  - `RtrvrAgentConfig`: Configuration for rtrvr.ai client
  - `RtrvrAgentTask`: Task payload for rtrvr.ai
  - `RtrvrAgentResponse`: Response from rtrvr.ai API

## Data Flow

### Task Creation Flow

```
User/LLM
   ↓
MCP Client
   ↓
MCP Server (create_scheduled_task)
   ↓
Zod Validation
   ↓
TaskScheduler.createTask()
   ↓
Schedule Setup (cron/setTimeout)
   ↓
Task stored in memory
```

### Task Execution Flow

```
Scheduled Time Reached
   ↓
TaskScheduler.executeTask()
   ↓
RtrvrClient.executeTask()
   ↓
HTTP Request to rtrvr.ai API
   ↓
rtrvr.ai Web Agent
   ↓
Response received
   ↓
Task status updated
   ↓
(If recurring) Reschedule
```

### Query Flow

```
User/LLM
   ↓
MCP Client
   ↓
MCP Server (list_tasks/get_task)
   ↓
TaskScheduler query methods
   ↓
Return task data
   ↓
MCP Client
   ↓
User/LLM
```

## Storage

Currently, all tasks are stored in memory using JavaScript `Map` objects:

- `TaskScheduler.tasks`: Map<string, Task>
- `TaskScheduler.cronJobs`: Map<string, ScheduledTask>

**Implications:**
- Tasks are lost on server restart
- No persistence layer
- Suitable for development and testing
- For production, consider adding a database layer

## Future Enhancements

### 1. Persistent Storage

Add database support for task persistence:
- PostgreSQL for relational storage
- Redis for task queue
- MongoDB for flexible schema

### 2. Task History

Store execution history:
- Execution timestamps
- Success/failure rates
- Error logs
- Performance metrics

### 3. Notifications

Add notification system:
- Email notifications
- Webhook callbacks
- Slack/Discord integration
- Custom notification channels

### 4. Task Dependencies

Support task dependencies:
- Sequential execution
- Conditional execution
- Parallel execution
- DAG-based workflows

### 5. Advanced Scheduling

Enhanced scheduling features:
- Time zones support
- Business hours constraints
- Holiday calendars
- Dynamic scheduling

### 6. Monitoring & Observability

Add monitoring capabilities:
- Prometheus metrics
- Health checks
- Performance monitoring
- Distributed tracing

### 7. Security

Enhance security:
- API key management
- Rate limiting
- Task execution sandboxing
- Audit logging

## Configuration

Configuration is managed through environment variables:

- `RTRVR_API_URL`: Base URL for rtrvr.ai API (default: https://api.rtrvr.ai)
- `RTRVR_API_KEY`: API key for rtrvr.ai authentication

## Error Handling

### Task Execution Errors

- Caught and logged
- Task status set to 'failed'
- Error message stored (in future enhancement)
- Recurring tasks continue to run

### API Errors

- HTTP errors caught and wrapped
- Error details included in response
- Client continues to operate
- Retries not implemented (future enhancement)

### Validation Errors

- Zod schema validation
- Errors returned to MCP client
- Invalid requests rejected early
- Detailed error messages provided

## Performance Considerations

### Memory Usage

- In-memory storage scales with number of tasks
- Each cron job has minimal overhead
- Monitor memory usage in production

### Scheduling Accuracy

- Cron jobs executed by node-cron library
- setTimeout accuracy depends on Node.js event loop
- Consider external scheduler for critical timing

### Concurrency

- Tasks executed sequentially by default
- No concurrent execution limits
- Consider task queue for production use

## Testing

The architecture supports testing at multiple levels:

1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test full MCP flow
4. **Mock rtrvr.ai**: Use mock client for testing

## Deployment

The server can be deployed in various ways:

1. **Standalone**: Run as Node.js process
2. **Docker**: Containerize for easy deployment
3. **Kubernetes**: Deploy with orchestration
4. **Serverless**: Adapt for serverless platforms (with limitations)

Note: Scheduling requires long-running process, so serverless may not be suitable for all use cases.
