# Usage Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your rtrvr.ai credentials:

```env
RTRVR_API_URL=https://api.rtrvr.ai
RTRVR_API_KEY=your_api_key_here
```

### 3. Build the Project

```bash
npm run build
```

### 4. Start the Server

```bash
npm start
```

The MCP server will start and communicate via stdio.

## Integration with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "time-schedule": {
      "command": "node",
      "args": ["/path/to/mcp-time-schedule-server/dist/index.js"],
      "env": {
        "RTRVR_API_URL": "https://api.rtrvr.ai",
        "RTRVR_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Cline (VS Code)

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "time-schedule": {
      "command": "node",
      "args": ["/path/to/mcp-time-schedule-server/dist/index.js"],
      "env": {
        "RTRVR_API_URL": "https://api.rtrvr.ai",
        "RTRVR_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Generic MCP Client

Any MCP client can connect by running:

```bash
node dist/index.js
```

The server communicates via stdin/stdout using the MCP protocol.

## Available Tools

Once connected, your AI assistant will have access to these tools:

### Task Management

- `create_scheduled_task` - Create a new scheduled task
- `list_tasks` - List all tasks
- `get_task` - Get task details
- `update_task` - Update a task
- `delete_task` - Delete a task
- `execute_task` - Execute a task immediately
- `cancel_task` - Cancel a scheduled task
- `get_upcoming_tasks` - Get upcoming tasks

### rtrvr.ai Integration

- `rtrvr_query_agent` - Query the rtrvr.ai agent
- `rtrvr_get_status` - Get agent status
- `rtrvr_schedule_web_action` - Schedule a web action

## Example Conversations

### Creating a Daily Task

**You:** "Create a task to backup the database every day at 2 AM"

**AI:** Uses `create_scheduled_task`:
```json
{
  "title": "Daily database backup",
  "cronExpression": "0 2 * * *",
  "recurring": true,
  "metadata": {
    "action": "backup_database",
    "target": "production"
  }
}
```

### Creating a One-Time Reminder

**You:** "Remind me about the meeting on December 20th at 3 PM"

**AI:** Uses `create_scheduled_task`:
```json
{
  "title": "Meeting reminder",
  "scheduledTime": "2024-12-20T15:00:00Z",
  "description": "Important meeting",
  "recurring": false
}
```

### Listing Pending Tasks

**You:** "What tasks are pending?"

**AI:** Uses `list_tasks`:
```json
{
  "status": "pending"
}
```

### Checking Upcoming Tasks

**You:** "What are my next 5 scheduled tasks?"

**AI:** Uses `get_upcoming_tasks`:
```json
{
  "limit": 5
}
```

## Cron Expression Guide

The `cronExpression` field supports standard cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Examples

| Expression | Description |
|------------|-------------|
| `0 * * * *` | Every hour |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 * * *` | Daily at midnight |
| `0 9 * * 1-5` | Weekdays at 9 AM |
| `0 0 1 * *` | First day of every month |

## Troubleshooting

### Server Won't Start

1. Check that Node.js v20+ is installed: `node --version`
2. Ensure dependencies are installed: `npm install`
3. Verify the build completed: `ls dist/`
4. Check environment variables are set

### Tasks Not Executing

1. Verify rtrvr.ai credentials are correct
2. Check server logs for errors
3. Ensure scheduled time is in the future
4. Validate cron expression syntax

### MCP Client Can't Connect

1. Verify the path to `dist/index.js` is correct
2. Check that the server process has stdio access
3. Review client-specific MCP configuration documentation

## Development

### Watch Mode

For development, run in watch mode:

```bash
npm run dev
```

This will recompile TypeScript files on changes.

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Docker Deployment

### Build Image

```bash
docker build -t mcp-time-schedule-server .
```

### Run Container

```bash
docker run -e RTRVR_API_URL=https://api.rtrvr.ai \
           -e RTRVR_API_KEY=your_key \
           mcp-time-schedule-server
```

Note: Docker deployment requires adapting the stdio transport for your use case, as containers typically run detached.

## API Rate Limits

Be aware of rate limits when scheduling frequent tasks:

- rtrvr.ai API has rate limits (check their documentation)
- Very frequent cron expressions (e.g., `* * * * *` every minute) may cause issues
- Consider batching operations where possible

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Always use `.env` for sensitive data
3. **Task Validation**: Tasks are validated but consider adding additional business logic validation
4. **Rate Limiting**: Implement rate limiting for production use
5. **Access Control**: The server doesn't implement authentication - secure your deployment

## Performance Tips

1. **Memory Management**: Tasks are stored in memory - consider persistence for production
2. **Long-Running Tasks**: The server must stay running for scheduled tasks
3. **Monitoring**: Add health checks and monitoring in production
4. **Logging**: Review logs regularly for failed tasks

## Next Steps

- Review the [Architecture documentation](ARCHITECTURE.md)
- Check out [Example usage](examples/example-usage.md)
- Read the [README](README.md) for feature overview
