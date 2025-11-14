# LLM Task Scheduler Chrome Extension

A powerful Chrome extension that enables users to schedule and automate tasks using any LLM provider (OpenAI, Anthropic, local models) to complete them.

## Features

### Task Types
- **Web Scraping**: Automatically scrape websites and process data with LLMs
- **Data Collection**: Collect structured data from web pages on a schedule
- **API Calls**: Make scheduled API calls and process responses with LLMs
- **Custom Workflows**: Create custom JSON-based workflows with multiple steps

### LLM Provider Support
- **OpenAI**: GPT-4, GPT-3.5, and other OpenAI models
- **Anthropic**: Claude 3 Opus, Sonnet, and Haiku models
- **Local Models**: Support for local LLM endpoints (Ollama, LM Studio, etc.)

### Scheduling Options
- **Simple Intervals**: Run tasks every X minutes, hours, or days
- **Cron Expressions**: Advanced scheduling with cron syntax
- **Recurring Patterns**: Daily, weekly, or monthly schedules
- **One-time Tasks**: Schedule tasks to run once at a specific time

### Additional Features
- Task enable/disable toggle
- Manual task execution
- Comprehensive execution logging
- Error handling with automatic retries
- Persistent storage of tasks and configurations
- Beautiful, intuitive UI

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

### Configuration

1. Click the extension icon to open the popup
2. Navigate to the "Settings" tab
3. Configure your LLM provider(s):
   - **OpenAI**: Enter your API key (starts with `sk-`)
   - **Anthropic**: Enter your API key (starts with `sk-ant-`)
   - **Local Model**: Enter your local endpoint URL and model name
4. Click "Save Settings"

## Usage

### Creating a Task

1. Click the extension icon
2. Go to the "Create Task" tab
3. Fill in the task details:
   - **Task Name**: A descriptive name for your task
   - **Task Type**: Select the type of task (web scraping, API call, etc.)
   - **Task Description**: Describe what you want the LLM to do with the collected data
   - **LLM Provider**: Choose your preferred LLM provider
   - **Model**: Specify the model name (optional, uses default if empty)
   - **Schedule Type**: Choose how often the task should run
4. Click "Create Task"

### Managing Tasks

In the "Tasks" tab, you can:
- **Play/Pause**: Enable or disable a task
- **Run Now**: Execute a task immediately
- **Delete**: Remove a task permanently

### Viewing Logs

The "Logs" tab shows the execution history of all tasks, including:
- Timestamp of execution
- Task name
- Success/error status
- LLM response preview
- Error messages (if any)

## Examples

### Example 1: Daily News Summary

```
Task Name: Daily Tech News
Task Type: Web Scraping
Description: Summarize the top 5 articles on this tech news site
Target URL: https://news.ycombinator.com
LLM Provider: OpenAI
Model: gpt-4
Schedule: Daily at 09:00
```

### Example 2: API Monitoring

```
Task Name: API Health Check
Task Type: API Call
Description: Analyze the API response and alert if any anomalies are detected
API Endpoint: https://api.example.com/health
Method: GET
LLM Provider: Anthropic
Model: claude-3-opus-20240229
Schedule: Every 15 minutes
```

### Example 3: Custom Workflow

```
Task Name: Multi-Source Data Analysis
Task Type: Custom Workflow
Description: Analyze and compare data from multiple sources
Workflow Config:
{
  "steps": [
    {
      "name": "fetch_api_1",
      "type": "http",
      "url": "https://api1.example.com/data",
      "method": "GET"
    },
    {
      "name": "fetch_api_2",
      "type": "http",
      "url": "https://api2.example.com/data",
      "method": "GET"
    }
  ]
}
LLM Provider: Local
Model: llama2
Schedule: Every 6 hours
```

## Architecture

### Manifest V3 Structure

The extension follows Chrome's Manifest V3 requirements:
- **Background Service Worker**: Handles task scheduling, execution, and LLM calls
- **Popup UI**: React-like vanilla JS interface for task management
- **Content Scripts**: Injected into pages for web scraping capabilities
- **Chrome Storage API**: Persistent storage for tasks, logs, and settings
- **Chrome Alarms API**: Reliable task scheduling

### Components

- `manifest.json`: Extension configuration
- `background.js`: Service worker with task scheduler and LLM integration
- `popup.html/js`: User interface for task management
- `content.js`: Content script for web scraping
- `styles/popup.css`: Styling for the popup interface

## API Integration

### OpenAI API

```javascript
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "..."}]
  }
```

### Anthropic API

```javascript
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: YOUR_API_KEY
  anthropic-version: 2023-06-01
  Content-Type: application/json
Body:
  {
    "model": "claude-3-opus-20240229",
    "max_tokens": 4096,
    "messages": [{"role": "user", "content": "..."}]
  }
```

### Local Models (Ollama example)

```javascript
POST http://localhost:11434/api/generate
Headers:
  Content-Type: application/json
Body:
  {
    "model": "llama2",
    "prompt": "...",
    "stream": false
  }
```

## Advanced Features

### Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday=0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Examples:
- `*/5 * * * *` - Every 5 minutes
- `0 9 * * *` - Daily at 9:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM

### Error Handling

The extension includes robust error handling:
- Automatic retry logic (configurable, default: 3 retries)
- Detailed error logging
- Request timeout handling (configurable, default: 60 seconds)
- API error reporting

### Data Privacy

- All data is stored locally in Chrome's storage
- API keys are stored securely in Chrome's local storage
- No data is sent to third parties except the configured LLM providers
- Content scripts only activate when tasks are running

## Troubleshooting

### Tasks Not Running

1. Check that the task is enabled (green status)
2. Verify your LLM provider API key is configured correctly
3. Check the logs for error messages
4. Ensure Chrome is running (extension service workers may sleep)

### API Errors

1. Verify your API key is valid and has sufficient credits
2. Check that the model name is correct
3. Review rate limits for your API provider
4. Check network connectivity

### Web Scraping Issues

1. Ensure the target URL is accessible
2. Check for CORS restrictions
3. Verify the page loads correctly in a browser
4. Some pages may have anti-scraping measures

## Development

### File Structure

```
├── manifest.json           # Extension manifest
├── background.js          # Service worker (scheduler, LLM integration)
├── popup.html            # Popup UI structure
├── popup.js              # Popup UI logic
├── content.js            # Content script for scraping
├── styles/
│   └── popup.css         # Popup styling
├── icons/
│   ├── icon16.png        # 16x16 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

### Adding New Features

To add a new task type:
1. Add the task type to the `taskType` select in `popup.html`
2. Implement the execution logic in `background.js`
3. Update the UI to show/hide relevant fields in `popup.js`

To add a new LLM provider:
1. Add provider configuration in the Settings tab
2. Implement the API call function in `background.js`
3. Add the provider to the `llmProvider` select in `popup.html`

## Security Considerations

- API keys are stored in Chrome's local storage (not synced)
- Content scripts follow the principle of least privilege
- All external requests are made from the background service worker
- User data never leaves the browser except for LLM API calls

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Support

For issues, questions, or feature requests, please open an issue on the repository.
