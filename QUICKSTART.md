# Quick Start Guide

Get the MCP Time Schedule Server running in 5 minutes!

## Prerequisites

- Node.js v20 or higher
- npm (comes with Node.js)
- rtrvr.ai API key (optional for testing)

## Installation

### 1. Clone or Download the Repository

```bash
cd mcp-time-schedule-server
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- @modelcontextprotocol/sdk - MCP protocol implementation
- node-cron - Task scheduling
- axios - HTTP client
- zod - Data validation
- TypeScript and development tools

### 3. Configure Environment (Optional)

```bash
cp .env.example .env
```

Edit `.env` and add your rtrvr.ai credentials:

```env
RTRVR_API_URL=https://api.rtrvr.ai
RTRVR_API_KEY=your_actual_api_key_here
```

**Note**: The server will start without credentials, but rtrvr.ai features won't work.

### 4. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Running the Server

### Standalone Test

```bash
node test-server.js
```

This starts the server in test mode. Press Ctrl+C to stop.

### With MCP Client

#### Claude Desktop

1. Open Claude Desktop configuration:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add server configuration:

```json
{
  "mcpServers": {
    "time-schedule": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-time-schedule-server/dist/index.js"],
      "env": {
        "RTRVR_API_URL": "https://api.rtrvr.ai",
        "RTRVR_API_KEY": "your_api_key"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. Look for "time-schedule" in available tools

#### Cline (VS Code Extension)

1. Open Cline settings
2. Add to MCP servers configuration
3. Use the same configuration format as above
4. Reload VS Code

## First Task

Once connected, try these with your AI assistant:

### Example 1: Create a Simple Task

**Say to your AI:**
> "Create a task to remind me about the team meeting tomorrow at 3 PM"

### Example 2: Schedule a Recurring Task

**Say to your AI:**
> "Schedule a daily backup task to run every day at 2 AM"

### Example 3: List Tasks

**Say to your AI:**
> "Show me all my pending tasks"

### Example 4: Check Upcoming Tasks

**Say to your AI:**
> "What are my next 5 scheduled tasks?"

## Verify Installation

### Check Build

```bash
ls dist/
# Should show: index.js, scheduler.js, rtrvr-client.js, types.js (and .d.ts files)
```

### Check Dependencies

```bash
npm list --depth=0
# Should show all dependencies installed
```

### Run Linter

```bash
npm run lint
# Should pass with only warnings about 'any' types
```

## Common Issues

### Issue: "Cannot find module"

**Solution**: Run `npm install` again

### Issue: "Command not found: node"

**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Permission denied"

**Solution**: 
```bash
chmod +x test-server.js
# Or run with: node test-server.js
```

### Issue: Server starts but tools don't appear

**Solution**:
1. Check the absolute path in MCP config
2. Verify the path points to `dist/index.js` (not `src/index.js`)
3. Restart your MCP client
4. Check client logs for errors

### Issue: Tasks not executing

**Solution**:
1. Verify RTRVR_API_KEY is set correctly
2. Check scheduled time is in the future
3. For cron, validate expression at https://crontab.guru
4. Check server logs for errors

## Next Steps

### Learn More
- Read [USAGE.md](USAGE.md) for detailed examples
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Browse [examples/](examples/) for code samples

### Customize
- Modify task schemas in `src/types.ts`
- Add custom tools in `src/index.ts`
- Extend scheduler logic in `src/scheduler.ts`
- Enhance rtrvr.ai integration in `src/rtrvr-client.ts`

### Contribute
- Read [CONTRIBUTING.md](CONTRIBUTING.md)
- Report issues on GitHub
- Submit pull requests
- Share your use cases

## Development Mode

For active development:

```bash
# Terminal 1: Watch and rebuild on changes
npm run dev

# Terminal 2: Test your changes
node test-server.js
```

## Production Deployment

**Warning**: This version uses in-memory storage and is not production-ready.

For production:
1. Add database persistence (PostgreSQL/MongoDB)
2. Implement authentication
3. Add health checks
4. Set up monitoring
5. Configure log aggregation
6. Add rate limiting

See [ARCHITECTURE.md](ARCHITECTURE.md) for enhancement ideas.

## Getting Help

- 📖 Documentation in this repository
- 🐛 Issues on GitHub
- 💬 Discussions for questions
- 📧 Contact maintainers

## Success Checklist

- [x] Node.js v20+ installed
- [x] Dependencies installed (`npm install`)
- [x] Project built (`npm run build`)
- [x] `.env` configured (optional)
- [x] MCP client configured
- [x] Server connects successfully
- [x] Tools appear in AI assistant
- [x] First task created

🎉 **Congratulations!** You're ready to use the MCP Time Schedule Server!

## Quick Reference

```bash
# Install
npm install

# Build
npm run build

# Run
npm start

# Test
node test-server.js

# Develop
npm run dev

# Check
npm run lint
npm run format
```

## Cron Cheat Sheet

```
*/5 * * * *   Every 5 minutes
0 * * * *     Every hour
0 0 * * *     Daily at midnight
0 9 * * 1-5   Weekdays at 9 AM
0 0 1 * *     First of month
```

## Example Commands for AI

Try saying:
- "Create a daily task to check emails at 9 AM"
- "Schedule a weekly report every Monday at 10 AM"
- "List all my pending tasks"
- "Show me upcoming tasks"
- "Execute task [id] immediately"
- "Cancel task [id]"
- "Query rtrvr.ai agent about [something]"

Ready to schedule! 🚀
