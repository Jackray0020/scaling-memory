# MCP Time Schedule Server with rtrvr.ai Integration

A Model Context Protocol (MCP) server for managing scheduled tasks that integrates with rtrvr.ai web agent for automated task execution.

## Features

- **Task Scheduling**: Create one-time and recurring scheduled tasks
- **Cron Support**: Full cron expression support for recurring tasks
- **rtrvr.ai Integration**: Execute tasks using the rtrvr.ai web agent
- **Task Management**: Create, read, update, delete, and cancel tasks
- **Status Tracking**: Monitor task execution status
- **MCP Protocol**: Full support for Model Context Protocol

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure your rtrvr.ai credentials:

```env
RTRVR_API_URL=https://api.rtrvr.ai
RTRVR_API_KEY=your_rtrvr_api_key_here
```

## Build

```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

## MCP Tools

The server provides the following MCP tools:

### Task Management

#### `create_scheduled_task`
Create a new scheduled task.

**Parameters:**
- `title` (required): Task title
- `description` (optional): Task description
- `scheduledTime` (optional): ISO 8601 date-time string
- `cronExpression` (optional): Cron expression for recurring tasks
- `recurring` (optional): Boolean for recurring tasks
- `metadata` (optional): Additional parameters for rtrvr.ai agent

**Example:**
```json
{
  "title": "Daily report generation",
  "description": "Generate and send daily analytics report",
  "cronExpression": "0 9 * * *",
  "recurring": true,
  "metadata": {
    "reportType": "analytics",
    "recipients": ["team@example.com"]
  }
}
```

#### `list_tasks`
List all scheduled tasks, optionally filtered by status.

**Parameters:**
- `status` (optional): Filter by status (pending, running, completed, failed, cancelled)

#### `get_task`
Get details of a specific task.

**Parameters:**
- `id` (required): Task ID

#### `update_task`
Update an existing task.

**Parameters:**
- `id` (required): Task ID
- All other fields are optional and will update the corresponding task properties

#### `delete_task`
Delete a task.

**Parameters:**
- `id` (required): Task ID

#### `execute_task`
Manually execute a task immediately.

**Parameters:**
- `id` (required): Task ID

#### `cancel_task`
Cancel a scheduled task.

**Parameters:**
- `id` (required): Task ID

#### `get_upcoming_tasks`
Get upcoming scheduled tasks.

**Parameters:**
- `limit` (optional): Maximum number of tasks to return (default: 10)

### rtrvr.ai Integration

#### `rtrvr_query_agent`
Query the rtrvr.ai web agent directly.

**Parameters:**
- `query` (required): Query string

#### `rtrvr_get_status`
Get the current status of the rtrvr.ai web agent.

#### `rtrvr_schedule_web_action`
Schedule a web action to be executed by rtrvr.ai.

**Parameters:**
- `action` (required): The web action to perform
- `parameters` (required): Parameters for the action
- `scheduledTime` (required): ISO 8601 date-time string

## Cron Expression Examples

- `0 9 * * *` - Daily at 9:00 AM
- `0 */2 * * *` - Every 2 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 0 1 * *` - Monthly on the 1st at midnight
- `*/5 * * * *` - Every 5 minutes

## Task Status

Tasks can have the following statuses:
- `pending`: Task is scheduled but not yet executed
- `running`: Task is currently being executed
- `completed`: Task completed successfully
- `failed`: Task execution failed
- `cancelled`: Task was cancelled

## Architecture

### Components

- **TaskScheduler**: Manages task lifecycle and scheduling
- **RtrvrClient**: HTTP client for rtrvr.ai API integration
- **MCP Server**: Implements Model Context Protocol for tool exposure

### Task Execution Flow

1. Task is created with schedule information
2. Scheduler sets up execution (cron job or timeout)
3. At scheduled time, task is executed via rtrvr.ai agent
4. Task status is updated based on execution result
5. Recurring tasks are automatically rescheduled

## Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Example Use Cases

### 1. Daily Data Backup
```json
{
  "title": "Backup database",
  "cronExpression": "0 2 * * *",
  "recurring": true,
  "metadata": {
    "action": "backup",
    "target": "production-db"
  }
}
```

### 2. One-time Reminder
```json
{
  "title": "Meeting reminder",
  "scheduledTime": "2024-12-15T14:30:00Z",
  "description": "Quarterly review meeting",
  "metadata": {
    "action": "send_notification",
    "channel": "slack"
  }
}
```

### 3. Periodic Health Check
```json
{
  "title": "System health check",
  "cronExpression": "*/10 * * * *",
  "recurring": true,
  "metadata": {
    "action": "health_check",
    "endpoints": ["api", "database", "cache"]
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
