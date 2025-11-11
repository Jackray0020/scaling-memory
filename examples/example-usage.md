# Example Usage

This document provides practical examples of using the MCP Time Schedule Server with rtrvr.ai integration.

## Basic Task Creation

### Create a One-Time Task

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Send welcome email",
    "description": "Send welcome email to new user",
    "scheduledTime": "2024-12-20T10:00:00Z",
    "metadata": {
      "userId": "user123",
      "template": "welcome",
      "email": "user@example.com"
    }
  }
}
```

### Create a Recurring Daily Task

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Daily backup",
    "description": "Backup all user data",
    "cronExpression": "0 3 * * *",
    "recurring": true,
    "metadata": {
      "backupType": "full",
      "destination": "s3://backups/"
    }
  }
}
```

### Create a Weekly Report

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Weekly sales report",
    "description": "Generate and send weekly sales report",
    "cronExpression": "0 9 * * 1",
    "recurring": true,
    "metadata": {
      "reportType": "sales",
      "period": "weekly",
      "recipients": ["sales@example.com", "management@example.com"]
    }
  }
}
```

## Task Management

### List All Tasks

```json
{
  "tool": "list_tasks",
  "arguments": {}
}
```

### List Tasks by Status

```json
{
  "tool": "list_tasks",
  "arguments": {
    "status": "pending"
  }
}
```

### Get Task Details

```json
{
  "tool": "get_task",
  "arguments": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Update a Task

```json
{
  "tool": "update_task",
  "arguments": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated task title",
    "cronExpression": "0 10 * * *",
    "metadata": {
      "priority": "high"
    }
  }
}
```

### Execute Task Immediately

```json
{
  "tool": "execute_task",
  "arguments": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Cancel a Task

```json
{
  "tool": "cancel_task",
  "arguments": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Delete a Task

```json
{
  "tool": "delete_task",
  "arguments": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Get Upcoming Tasks

```json
{
  "tool": "get_upcoming_tasks",
  "arguments": {
    "limit": 5
  }
}
```

## rtrvr.ai Integration

### Query the Web Agent

```json
{
  "tool": "rtrvr_query_agent",
  "arguments": {
    "query": "What's the current status of the automation pipeline?"
  }
}
```

### Get Agent Status

```json
{
  "tool": "rtrvr_get_status",
  "arguments": {}
}
```

### Schedule a Web Action

```json
{
  "tool": "rtrvr_schedule_web_action",
  "arguments": {
    "action": "scrape_website",
    "parameters": {
      "url": "https://example.com",
      "selectors": ["#price", ".availability"],
      "format": "json"
    },
    "scheduledTime": "2024-12-20T15:00:00Z"
  }
}
```

## Advanced Use Cases

### E-commerce Price Monitoring

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Monitor competitor prices",
    "description": "Check competitor prices every hour",
    "cronExpression": "0 * * * *",
    "recurring": true,
    "metadata": {
      "action": "price_check",
      "competitors": [
        "https://competitor1.com/product/123",
        "https://competitor2.com/product/456"
      ],
      "alertThreshold": 0.9
    }
  }
}
```

### Social Media Posting

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Post daily update",
    "description": "Post daily update to social media",
    "cronExpression": "0 12 * * *",
    "recurring": true,
    "metadata": {
      "action": "social_post",
      "platforms": ["twitter", "linkedin"],
      "contentType": "daily_tip"
    }
  }
}
```

### Data Collection

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Collect analytics data",
    "description": "Collect and aggregate analytics data",
    "cronExpression": "*/30 * * * *",
    "recurring": true,
    "metadata": {
      "action": "collect_data",
      "sources": ["google_analytics", "mixpanel", "amplitude"],
      "metrics": ["users", "sessions", "conversions"]
    }
  }
}
```

### Maintenance Window

```json
{
  "tool": "create_scheduled_task",
  "arguments": {
    "title": "Database maintenance",
    "description": "Run database optimization and cleanup",
    "cronExpression": "0 2 * * 0",
    "recurring": true,
    "metadata": {
      "action": "maintenance",
      "tasks": ["vacuum", "reindex", "cleanup"],
      "database": "production"
    }
  }
}
```

## Cron Schedule Reference

| Expression | Description | Example Use |
|------------|-------------|-------------|
| `*/5 * * * *` | Every 5 minutes | Frequent monitoring |
| `0 * * * *` | Every hour | Hourly checks |
| `0 */2 * * *` | Every 2 hours | Bi-hourly tasks |
| `0 9 * * *` | Daily at 9 AM | Morning reports |
| `0 0 * * *` | Daily at midnight | End-of-day tasks |
| `0 9 * * 1` | Mondays at 9 AM | Weekly meetings |
| `0 0 1 * *` | 1st of month at midnight | Monthly billing |
| `0 0 * * 0` | Sundays at midnight | Weekly backups |

## Error Handling

### Handle Task Execution Failure

When a task fails, its status is automatically updated to "failed". You can query failed tasks:

```json
{
  "tool": "list_tasks",
  "arguments": {
    "status": "failed"
  }
}
```

Then retry the task:

```json
{
  "tool": "execute_task",
  "arguments": {
    "id": "failed-task-id"
  }
}
```

Or update and reschedule:

```json
{
  "tool": "update_task",
  "arguments": {
    "id": "failed-task-id",
    "status": "pending",
    "scheduledTime": "2024-12-21T10:00:00Z"
  }
}
```
