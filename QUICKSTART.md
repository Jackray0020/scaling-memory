# Quick Start Guide

Get up and running with LLM Task Scheduler in 5 minutes!

## Installation

1. **Load the Extension**
   ```
   - Open Chrome/Edge
   - Go to chrome://extensions/
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select this directory
   ```

2. **Verify Installation**
   - Look for the extension icon (⏰) in your browser toolbar
   - Click it to open the popup

## First-Time Setup

### Configure Your LLM Provider

1. Click the extension icon
2. Go to **Settings** tab
3. Enter your API key for at least one provider:

   **OpenAI**:
   - Get key from: https://platform.openai.com/api-keys
   - Enter key in "OpenAI API Key" field
   - Default model: `gpt-4`

   **Anthropic**:
   - Get key from: https://console.anthropic.com/
   - Enter key in "Anthropic API Key" field
   - Default model: `claude-3-opus-20240229`

   **Local Model** (optional):
   - Install Ollama: https://ollama.ai
   - Run: `ollama serve`
   - Endpoint: `http://localhost:11434/api/generate`
   - Model name: `llama2` (or any model you've pulled)

4. Click **Save Settings**

## Create Your First Task

### Example: Daily News Summary

1. Go to **Create Task** tab

2. Fill in the form:
   ```
   Task Name: Daily Tech News
   Task Type: Web Scraping
   Description: Summarize the top 5 stories from this page
   Target URL: https://news.ycombinator.com
   LLM Provider: OpenAI
   Model: gpt-4
   Schedule Type: Recurring
   Pattern: Daily
   Time: 09:00
   Enable task immediately: ✓
   ```

3. Click **Create Task**

4. Go to **Tasks** tab to see your new task

5. Test it immediately by clicking the **▶️ Run Now** button

6. Check **Logs** tab to see the result

## Understanding Task Types

### Web Scraping
- Scrapes content from any website
- LLM processes the scraped data
- Use for: news summaries, price monitoring, content tracking

### Data Collection
- Similar to web scraping but focused on structured data
- Use for: extracting specific information from pages

### API Call
- Makes HTTP requests to APIs
- LLM analyzes the response
- Use for: API monitoring, data analysis, integrations

### Custom Workflow
- Multi-step processes defined in JSON
- Combines multiple API calls
- Use for: complex data pipelines, multi-source analysis

## Schedule Types Explained

### Simple Interval
- Run every X minutes/hours/days
- Example: Every 30 minutes
- Best for: Frequent monitoring

### Cron Expression
- Advanced scheduling using cron syntax
- Example: `*/15 * * * *` (every 15 minutes)
- Best for: Complex patterns

### Recurring Pattern
- Daily, weekly, or monthly at specific time
- Example: Daily at 9:00 AM
- Best for: Regular reports

### One-time
- Runs once at specified date/time
- Example: Tomorrow at 2:00 PM
- Best for: Scheduled one-off tasks

## Tips for Success

### Writing Good Task Descriptions

❌ **Bad**: "Tell me about the page"

✅ **Good**: "Analyze this page and provide:
1. Main topic summary (2-3 sentences)
2. Key points (bullet list)
3. Any important dates or numbers
4. Overall sentiment (positive/negative/neutral)"

### Testing Tasks

1. Always test with **Run Now** before scheduling
2. Check the logs to verify output
3. Adjust your description based on results
4. Start with longer intervals while testing

### Managing API Costs

- Start with small intervals (hourly, not every 5 minutes)
- Use cheaper models for testing (gpt-3.5-turbo)
- Monitor your API usage on provider dashboards
- Disable tasks when not needed

## Common Use Cases

### 1. Morning Briefing
```
Task: Daily News Digest
Type: Web Scraping
Schedule: Daily at 7:00 AM
Description: Create a morning briefing with top stories
```

### 2. Price Monitoring
```
Task: Track Competitor Prices
Type: Web Scraping
Schedule: Every 6 hours
Description: List all product prices and alert if any dropped
```

### 3. API Health Check
```
Task: Monitor API Status
Type: API Call
Schedule: Every 5 minutes
Description: Check API health and alert if issues detected
```

### 4. Social Media Monitoring
```
Task: Brand Sentiment
Type: Web Scraping
Schedule: Every 2 hours
Description: Analyze mentions and summarize sentiment
```

### 5. GitHub Activity
```
Task: Repo Updates
Type: API Call
Schedule: Daily at 6:00 PM
Description: Summarize commits, PRs, and issues
```

## Troubleshooting

### "Task not running"
- Check if task is enabled (green badge)
- Verify API key in Settings
- Look at Logs for error messages

### "API error" in logs
- Verify API key is correct
- Check you have API credits/quota
- Try with a different model

### "Web scraping failed"
- Check if URL is accessible in browser
- Some sites block automated access
- Try a different website

### "No data collected"
- Verify the URL/API endpoint
- Check if website structure changed
- Review logs for detailed error

## Next Steps

1. ✅ Create your first task
2. ✅ Test it with "Run Now"
3. ✅ Check the logs
4. ✅ Create 2-3 more tasks
5. ✅ Explore the examples in EXAMPLES.md
6. ✅ Customize for your needs

## Getting Help

- Read the full [README.md](README.md)
- Check [EXAMPLES.md](EXAMPLES.md) for inspiration
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to add features
- Open an issue if you find bugs

## Quick Reference: Cron Expressions

```
*/5  * * * *   Every 5 minutes
0    * * * *   Every hour
0    */6 * * * Every 6 hours
0    9 * * *   Daily at 9 AM
0    9 * * 1   Every Monday at 9 AM
0    0 1 * *   First day of month
```

## Resource Links

- **OpenAI**: https://platform.openai.com/
- **Anthropic**: https://console.anthropic.com/
- **Ollama**: https://ollama.ai/
- **Cron Expression Builder**: https://crontab.guru/

---

🎉 **You're all set!** Start creating tasks and automating with LLM power!
