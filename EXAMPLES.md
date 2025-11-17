# LLM Task Scheduler - Usage Examples

This document provides detailed examples of how to use the LLM Task Scheduler extension for various use cases.

## Example 1: Monitor Stock Prices

**Use Case**: Track stock prices and get AI-powered analysis every hour.

**Configuration**:
```
Task Name: Stock Price Monitor
Task Type: API Call
Description: Analyze the stock price data and provide insights on trends, notable changes, and recommendations

API Endpoint: https://api.example.com/stocks/AAPL/quote
Method: GET

LLM Provider: OpenAI
Model: gpt-4

Schedule Type: Interval
Interval: 1 hour
```

**Expected Output**: The LLM will analyze the stock data and provide insights like trend analysis, support/resistance levels, and potential trading signals.

---

## Example 2: Daily Website Content Changes

**Use Case**: Monitor a competitor's website for content changes.

**Configuration**:
```
Task Name: Competitor Website Monitor
Task Type: Web Scraping
Description: Compare today's content with previous content and highlight any significant changes, new features, or updates

Target URL: https://competitor.com/products

LLM Provider: Anthropic
Model: claude-3-opus-20240229

Schedule Type: Recurring
Pattern: Daily
Time: 08:00
```

**Expected Output**: Daily summary of content changes, new products, pricing updates, or feature announcements.

---

## Example 3: Social Media Sentiment Analysis

**Use Case**: Scrape social media posts and analyze sentiment about your brand.

**Configuration**:
```
Task Name: Brand Sentiment Analysis
Task Type: Web Scraping
Description: Analyze the sentiment of posts mentioning our brand. Categorize as positive, negative, or neutral, and identify key themes or concerns

Target URL: https://twitter.com/search?q=YourBrand

LLM Provider: OpenAI
Model: gpt-4-turbo

Schedule Type: Interval
Interval: 2 hours
```

**Expected Output**: Sentiment breakdown, key themes, trending topics, and potential PR issues.

---

## Example 4: Automated Research Assistant

**Use Case**: Research a topic by gathering information from multiple sources.

**Configuration**:
```
Task Name: AI Research Weekly
Task Type: Custom Workflow
Description: Synthesize the information from all sources and create a comprehensive weekly report on AI developments, organized by category (breakthroughs, products, research, policy)

Workflow Config:
{
  "steps": [
    {
      "name": "arxiv_papers",
      "type": "http",
      "url": "https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&max_results=10",
      "method": "GET"
    },
    {
      "name": "tech_news",
      "type": "http",
      "url": "https://news.ycombinator.com/api",
      "method": "GET"
    }
  ]
}

LLM Provider: Anthropic
Model: claude-3-opus-20240229

Schedule Type: Recurring
Pattern: Weekly
Time: 09:00
```

**Expected Output**: Comprehensive weekly report with categorized AI news, research summaries, and trend analysis.

---

## Example 5: API Health Monitoring

**Use Case**: Monitor API health and get intelligent alerts.

**Configuration**:
```
Task Name: API Health Monitor
Task Type: API Call
Description: Analyze the API health metrics. If response time is above 500ms or error rate is above 1%, provide a detailed analysis and potential causes. Otherwise, confirm everything is healthy

API Endpoint: https://api.yourservice.com/health
Method: GET

LLM Provider: OpenAI
Model: gpt-3.5-turbo

Schedule Type: Interval
Interval: 5 minutes
```

**Expected Output**: Health status confirmation or detailed alert with potential causes and recommendations.

---

## Example 6: Content Aggregation

**Use Case**: Aggregate content from multiple blogs and create a daily digest.

**Configuration**:
```
Task Name: Tech Blog Digest
Task Type: Custom Workflow
Description: Create a curated daily digest with the 5 most important or interesting stories. Include a brief summary of each and explain why it matters

Workflow Config:
{
  "steps": [
    {
      "name": "blog1",
      "type": "http",
      "url": "https://blog1.com/rss",
      "method": "GET"
    },
    {
      "name": "blog2",
      "type": "http",
      "url": "https://blog2.com/rss",
      "method": "GET"
    },
    {
      "name": "blog3",
      "type": "http",
      "url": "https://blog3.com/rss",
      "method": "GET"
    }
  ]
}

LLM Provider: Anthropic
Model: claude-3-sonnet-20240229

Schedule Type: Recurring
Pattern: Daily
Time: 07:00
```

**Expected Output**: Curated digest with top 5 stories, summaries, and context.

---

## Example 7: E-commerce Price Tracking

**Use Case**: Track prices on e-commerce sites and get alerts on deals.

**Configuration**:
```
Task Name: Price Tracker
Task Type: Web Scraping
Description: Extract all product prices and compare with historical data. Alert me if any product has dropped by more than 10%. Identify the best deals

Target URL: https://example-store.com/category/electronics

LLM Provider: OpenAI
Model: gpt-4

Schedule Type: Interval
Interval: 6 hours
```

**Expected Output**: Price change alerts, best deals, and savings opportunities.

---

## Example 8: Job Posting Analyzer

**Use Case**: Monitor job boards for relevant positions.

**Configuration**:
```
Task Name: Job Board Monitor
Task Type: Web Scraping
Description: Find all software engineering positions that match these criteria: Remote, Senior level, Python/JavaScript, $150k+. Rank them by fit and highlight the most interesting opportunities

Target URL: https://jobs.example.com/search?q=software+engineer

LLM Provider: Anthropic
Model: claude-3-opus-20240229

Schedule Type: Recurring
Pattern: Daily
Time: 10:00
```

**Expected Output**: Curated list of relevant jobs, ranked by fit with key details highlighted.

---

## Example 9: Weather-Based Insights

**Use Case**: Get weather data and personalized recommendations.

**Configuration**:
```
Task Name: Daily Weather Insights
Task Type: API Call
Description: Provide a brief weather summary and personalized recommendations for the day (what to wear, whether to bring an umbrella, good day for outdoor activities, etc.)

API Endpoint: https://api.weather.com/v1/location/USNY0996/observations.json
Method: GET

LLM Provider: OpenAI
Model: gpt-3.5-turbo

Schedule Type: Recurring
Pattern: Daily
Time: 06:00
```

**Expected Output**: Weather summary with personalized recommendations.

---

## Example 10: GitHub Repository Monitor

**Use Case**: Track activity on GitHub repositories you care about.

**Configuration**:
```
Task Name: GitHub Activity Monitor
Task Type: API Call
Description: Summarize the recent activity on this repository. Highlight important commits, new issues, merged PRs, and any security alerts

API Endpoint: https://api.github.com/repos/owner/repo/events
Method: GET

LLM Provider: Anthropic
Model: claude-3-sonnet-20240229

Schedule Type: Recurring
Pattern: Daily
Time: 18:00
```

**Expected Output**: Daily summary of repository activity with important changes highlighted.

---

## Advanced Workflow Example

**Use Case**: Complex multi-step data pipeline with LLM analysis.

**Configuration**:
```
Task Name: Market Intelligence Pipeline
Task Type: Custom Workflow
Description: Create a comprehensive market intelligence report. Include: 1) Competitor analysis, 2) Industry trends, 3) Customer sentiment, 4) Strategic recommendations

Workflow Config:
{
  "steps": [
    {
      "name": "competitor_news",
      "type": "http",
      "url": "https://newsapi.org/v2/everything?q=competitor&apiKey=YOUR_KEY",
      "method": "GET"
    },
    {
      "name": "industry_data",
      "type": "http",
      "url": "https://api.example.com/industry/tech/trends",
      "method": "GET"
    },
    {
      "name": "sentiment_data",
      "type": "http",
      "url": "https://api.example.com/sentiment/brand",
      "method": "GET"
    },
    {
      "name": "market_metrics",
      "type": "http",
      "url": "https://api.example.com/market/metrics",
      "method": "GET"
    }
  ]
}

LLM Provider: OpenAI
Model: gpt-4

Schedule Type: Recurring
Pattern: Weekly
Time: 09:00
```

**Expected Output**: Comprehensive market intelligence report with data-driven recommendations.

---

## Example 7: AI-Powered Content Summarization with Google Gemini

**Use Case**: Summarize news articles from multiple sources using Google Gemini.

**Configuration**:
```
Task Name: Daily News Summarizer
Task Type: Web Scraping
Description: Read and summarize the main news stories from these sources. Focus on key events, impact analysis, and important trends. Provide a concise summary in bullet points.

Target URL: https://news.example.com/tech

LLM Provider: Google Gemini
Model: gemini-pro

Schedule Type: Recurring
Pattern: Daily
Time: 07:00
```

**Expected Output**: Daily brief with key news stories summarized in easy-to-digest bullet points.

---

## Example 8: Cross-Model Analysis with OpenRouter

**Use Case**: Compare different LLM model outputs for the same data to get diverse perspectives.

**Configuration**:
```
Task Name: Multi-Model Market Analysis
Task Type: API Call
Description: Analyze this market data from multiple perspectives. Provide insights on trends, risks, and opportunities. Consider different analytical approaches.

API Endpoint: https://api.example.com/market/crypto
Method: GET

LLM Provider: OpenRouter
Model: meta-llama/llama-3-70b-instruct

Schedule Type: Interval
Interval: 6 hours
```

**Expected Output**: Diverse analytical insights leveraging OpenRouter's access to multiple high-performance models.

---

## Tips for Writing Effective Task Descriptions

1. **Be Specific**: Clearly state what you want the LLM to do with the data
2. **Provide Context**: Include relevant background information
3. **Set Expectations**: Specify desired output format (bullet points, paragraph, JSON, etc.)
4. **Include Examples**: Show examples of the kind of output you want
5. **Use Action Verbs**: "Analyze", "Summarize", "Compare", "Extract", "Identify"

### Good Description Example:
```
Analyze the stock data and provide:
1. Current price trend (bullish/bearish/neutral)
2. Key support and resistance levels
3. Any notable patterns or signals
4. Brief recommendation (buy/hold/sell with reasoning)

Format the response as a structured report with clear sections.
```

### Poor Description Example:
```
Tell me about the stock
```

---

## Cron Expression Examples

For advanced scheduling, use cron expressions:

- `*/15 * * * *` - Every 15 minutes
- `0 */2 * * *` - Every 2 hours
- `0 9 * * 1-5` - Weekdays at 9 AM
- `0 0 1 * *` - First day of every month at midnight
- `0 12 * * 0` - Every Sunday at noon
- `30 14 * * *` - Every day at 2:30 PM
- `0 6,18 * * *` - Twice daily at 6 AM and 6 PM

---

## Google Gemini Setup

To use Google Gemini:

1. Go to Google AI Studio: https://aistudio.google.com/app/apikey
2. Create a new API key
3. Configure in extension:
   - API Key: Your Gemini API key (starts with `AIza`)
   - Default Model: `gemini-pro` or `gemini-pro-vision`

---

## OpenRouter Setup

To use OpenRouter:

1. Sign up at https://openrouter.ai
2. Generate an API key from your dashboard
3. Configure in extension:
   - API Key: Your OpenRouter API key (starts with `sk-or-`)
   - Default Model: Choose from available models (e.g., `anthropic/claude-3-opus`, `meta-llama/llama-3-70b-instruct`)

---

## Local Model Setup (Ollama)

To use local models with Ollama:

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama2`
3. Start the server: `ollama serve`
4. Configure in extension:
   - Endpoint: `http://localhost:11434/api/generate`
   - Model Name: `llama2`

---

## Best Practices

1. **Start Simple**: Begin with basic tasks and gradually add complexity
2. **Test First**: Use "Run Now" to test tasks before scheduling
3. **Check Logs**: Regularly review logs to ensure tasks are working correctly
4. **API Limits**: Be mindful of API rate limits and costs
5. **Error Handling**: Tasks will auto-retry on failure (up to configured max retries)
6. **Data Privacy**: Remember that scraped data is sent to LLM providers
7. **Timing**: Consider timezone and business hours when scheduling
8. **Resource Usage**: Don't schedule too many tasks simultaneously

---

## Troubleshooting Common Issues

### Issue: Task not executing
- **Solution**: Check if task is enabled, verify API keys, review logs for errors

### Issue: LLM response too short
- **Solution**: Be more specific in your task description, ask for detailed analysis

### Issue: Web scraping fails
- **Solution**: Check URL accessibility, some sites block automated access

### Issue: API rate limit exceeded
- **Solution**: Increase interval between executions, use different API key tier

### Issue: Task runs but no data collected
- **Solution**: Verify URL/API endpoint is correct, check response format
