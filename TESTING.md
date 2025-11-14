# Testing Guide for LLM Task Scheduler

This document provides comprehensive testing instructions for the LLM Task Scheduler Chrome Extension.

## Pre-Testing Setup

### 1. Install the Extension

1. Open Chrome/Edge browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the project directory
6. Verify extension icon appears in toolbar

### 2. Configure LLM Providers

For testing, you'll need at least one API key:

**Option A: OpenAI** (Recommended for testing)
- Sign up at https://platform.openai.com/
- Create an API key
- Add $5-10 credits for testing

**Option B: Anthropic**
- Sign up at https://console.anthropic.com/
- Create an API key
- Add credits for testing

**Option C: Local Model** (Free, but requires setup)
- Install Ollama from https://ollama.ai
- Run `ollama pull llama2`
- Run `ollama serve`

## Test Suite

### Test 1: Basic Installation

**Objective**: Verify extension loads correctly

**Steps**:
1. Click extension icon in toolbar
2. Popup should open
3. Verify all tabs are visible: Tasks, Create Task, Logs, Settings

**Expected Result**: ✅
- Popup opens without errors
- UI is rendered correctly
- No console errors

---

### Test 2: Settings Configuration

**Objective**: Save and load settings

**Steps**:
1. Click extension icon
2. Go to Settings tab
3. Enter OpenAI API key
4. Set default model to "gpt-3.5-turbo"
5. Click "Save Settings"
6. Close popup
7. Open popup again
8. Go to Settings tab

**Expected Result**: ✅
- Success message shows after saving
- Settings persist after reopening
- API key is still present

---

### Test 3: Create Web Scraping Task

**Objective**: Create and test a web scraping task

**Steps**:
1. Go to "Create Task" tab
2. Fill in:
   - Name: "Test News Scraper"
   - Type: Web Scraping
   - Description: "Extract and summarize the main headlines from this page"
   - URL: https://news.ycombinator.com
   - LLM Provider: OpenAI
   - Model: gpt-3.5-turbo
   - Schedule: Interval
   - Interval: 5 minutes
   - Enable: ✓
3. Click "Create Task"
4. Go to Tasks tab
5. Find your new task
6. Click "Run Now" (▶️)
7. Wait 10-30 seconds
8. Go to Logs tab

**Expected Result**: ✅
- Task created successfully
- Task appears in Tasks list with "Enabled" status
- After "Run Now", log entry appears
- Log shows success status
- LLM response is visible in log

---

### Test 4: Create API Call Task

**Objective**: Test API call functionality

**Steps**:
1. Go to "Create Task" tab
2. Fill in:
   - Name: "Test API Call"
   - Type: API Call
   - Description: "Analyze this data and provide insights"
   - API Endpoint: https://api.github.com/repos/microsoft/vscode
   - Method: GET
   - LLM Provider: OpenAI
   - Schedule: Once
   - Date/Time: [5 minutes from now]
3. Click "Create Task"
4. Wait for scheduled time
5. Check Logs tab

**Expected Result**: ✅
- Task executes at scheduled time
- API data is fetched
- LLM processes the data
- Result appears in logs

---

### Test 5: Create Custom Workflow

**Objective**: Test custom workflow with multiple steps

**Steps**:
1. Go to "Create Task" tab
2. Fill in:
   - Name: "Test Workflow"
   - Type: Custom Workflow
   - Description: "Combine and analyze data from both sources"
   - Workflow Config:
     ```json
     {
       "steps": [
         {
           "name": "github_api",
           "type": "http",
           "url": "https://api.github.com/repos/nodejs/node",
           "method": "GET"
         }
       ]
     }
     ```
   - LLM Provider: OpenAI
   - Schedule: Interval - 10 minutes
3. Click "Create Task"
4. Click "Run Now"
5. Check Logs

**Expected Result**: ✅
- Workflow executes successfully
- All steps complete
- LLM receives combined data
- Result logged

---

### Test 6: Task Management

**Objective**: Test enable/disable/delete functionality

**Steps**:
1. Go to Tasks tab
2. Find a task
3. Click pause button (⏸️) to disable
4. Verify status changes to "Disabled"
5. Click play button (▶️) to enable
6. Verify status changes to "Enabled"
7. Click delete button (🗑️)
8. Confirm deletion
9. Verify task is removed from list

**Expected Result**: ✅
- Toggle works correctly
- Status updates immediately
- Delete confirmation appears
- Task is removed after deletion

---

### Test 7: Schedule Types

**Objective**: Test all schedule types

#### Interval Schedule
```
Schedule Type: Interval
Value: 1
Unit: minutes
```
- Create task
- Wait 2 minutes
- Check logs for 2 executions

#### Cron Schedule
```
Schedule Type: Cron
Expression: */5 * * * *
```
- Create task
- Should run every 5 minutes at :00, :05, :10, etc.

#### Recurring Schedule
```
Schedule Type: Recurring
Pattern: Daily
Time: [1 minute from now]
```
- Create task
- Wait for execution
- Check logs

#### One-time Schedule
```
Schedule Type: Once
Date/Time: [2 minutes from now]
```
- Create task
- Wait for execution
- Task should auto-disable after execution

**Expected Result**: ✅ All schedule types work as expected

---

### Test 8: Error Handling

**Objective**: Test error handling and retry logic

#### Test 8a: Invalid API Key
1. Go to Settings
2. Enter invalid OpenAI key: "sk-invalid"
3. Save settings
4. Create and run a task
5. Check logs

**Expected**: Error logged with "API error" message

#### Test 8b: Invalid URL
1. Create web scraping task
2. URL: "https://invalid-url-that-does-not-exist.com"
3. Run task
4. Check logs

**Expected**: Error logged with meaningful message

#### Test 8c: Invalid JSON Workflow
1. Create custom workflow task
2. Invalid JSON in workflow config
3. Try to create task

**Expected**: Error message before task creation

---

### Test 9: Multiple LLM Providers

**Objective**: Test switching between providers

**Steps**:
1. Configure all three providers in Settings
2. Create task with OpenAI
3. Create task with Anthropic
4. Create task with Local model
5. Run each task
6. Verify all work

**Expected Result**: ✅ All providers work independently

---

### Test 10: Data Persistence

**Objective**: Test data survives browser restart

**Steps**:
1. Create 3 tasks
2. Run them to generate logs
3. Close Chrome completely
4. Open Chrome
5. Open extension
6. Check Tasks and Logs tabs

**Expected Result**: ✅
- All tasks still present
- All logs still present
- Settings still saved

---

### Test 11: Long-running Task

**Objective**: Test task scheduled far in future

**Steps**:
1. Create task with interval of 24 hours
2. Verify "Next Run" time is ~24 hours from now
3. Disable and re-enable task
4. Verify "Next Run" time updates

**Expected Result**: ✅ Long intervals handled correctly

---

### Test 12: Concurrent Tasks

**Objective**: Test multiple tasks running simultaneously

**Steps**:
1. Create 5 tasks all scheduled for same time
2. All set to run in 1 minute
3. Wait for execution
4. Check logs

**Expected Result**: ✅
- All tasks execute
- All logs created
- No race conditions
- No data corruption

---

### Test 13: Large Data Handling

**Objective**: Test with large web pages

**Steps**:
1. Create scraping task
2. URL: Large page (e.g., Wikipedia article)
3. Run task
4. Check logs

**Expected Result**: ✅
- Content extracted (may be truncated)
- LLM processes data
- No memory issues
- Result logged

---

### Test 14: Network Failure Recovery

**Objective**: Test behavior with network issues

**Steps**:
1. Create task
2. Disable network/disconnect WiFi
3. Run task
4. Check logs (should show error)
5. Re-enable network
6. Task should retry and succeed

**Expected Result**: ✅ Graceful handling with retry

---

### Test 15: UI Responsiveness

**Objective**: Test UI updates in real-time

**Steps**:
1. Open popup
2. Create task with 1-minute interval
3. Keep popup open
4. Go to Logs tab
5. Wait for task execution
6. Click refresh

**Expected Result**: ✅
- Logs update when refreshed
- UI remains responsive
- No freezing or lag

---

## Performance Testing

### Memory Usage

1. Create 50 tasks
2. Let them run for 1 hour
3. Check Chrome task manager
4. Memory usage should be reasonable (<100MB)

### Storage Usage

1. Generate 1000+ log entries
2. Check storage doesn't grow indefinitely
3. Old logs should be pruned automatically

### CPU Usage

1. Monitor CPU while tasks are running
2. Should be minimal when idle
3. Spikes only during task execution

---

## Browser Compatibility Testing

### Chrome
- Version: Latest stable
- Status: ✅ Primary target

### Edge
- Version: Latest stable
- Status: ✅ Should work (Chromium-based)

### Brave
- Version: Latest stable
- Status: ✅ Should work (Chromium-based)

### Opera
- Version: Latest stable
- Status: ⚠️ May work (Chromium-based, untested)

---

## Known Limitations

1. **Service Worker Lifecycle**: Chrome may unload service worker after 30 seconds of inactivity. Alarms will still fire and wake it up.

2. **CORS Restrictions**: Some websites block cross-origin requests. Content scripts help but some sites still block.

3. **Rate Limits**: Be mindful of LLM API rate limits when testing with short intervals.

4. **Storage Limits**: Chrome's storage.local has ~5MB limit. Should be sufficient for typical use.

5. **Concurrent Executions**: While multiple tasks can run simultaneously, too many at once may cause performance issues.

---

## Automated Testing (Future)

For automated testing, consider:
- Puppeteer for browser automation
- Jest for unit tests
- Mock LLM API responses for testing without costs
- CI/CD integration for continuous testing

---

## Reporting Issues

When reporting bugs, include:
- Chrome version
- Extension version (from manifest.json)
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots
- Sample task configuration

---

## Test Results Template

```
Test Date: ___________
Chrome Version: ___________
Extension Version: 1.0.0

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Basic Installation | ✅/❌ | |
| 2 | Settings Config | ✅/❌ | |
| 3 | Web Scraping | ✅/❌ | |
| 4 | API Call | ✅/❌ | |
| 5 | Custom Workflow | ✅/❌ | |
| 6 | Task Management | ✅/❌ | |
| 7 | Schedule Types | ✅/❌ | |
| 8 | Error Handling | ✅/❌ | |
| 9 | Multiple Providers | ✅/❌ | |
| 10 | Data Persistence | ✅/❌ | |
| 11 | Long-running Task | ✅/❌ | |
| 12 | Concurrent Tasks | ✅/❌ | |
| 13 | Large Data | ✅/❌ | |
| 14 | Network Recovery | ✅/❌ | |
| 15 | UI Responsiveness | ✅/❌ | |

Overall Status: ✅/❌
Additional Notes:
```

---

## Quick Smoke Test (5 minutes)

For quick validation:

1. ✅ Load extension
2. ✅ Open popup - all tabs visible
3. ✅ Configure Settings - save works
4. ✅ Create one task
5. ✅ Run task now
6. ✅ Check logs - see result
7. ✅ Toggle enable/disable
8. ✅ Delete task

If all pass, extension is functional! ✅
