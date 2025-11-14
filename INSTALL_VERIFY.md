# Installation Verification Checklist

Use this checklist to verify the LLM Task Scheduler extension is installed correctly.

## Step 1: Load Extension

- [ ] Open Chrome/Edge browser
- [ ] Navigate to `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top right)
- [ ] Click "Load unpacked"
- [ ] Select this project directory
- [ ] Extension appears in list
- [ ] Extension icon (⏰) visible in toolbar

**If any issues**: Check that all required files are present (run `./validate.sh`)

## Step 2: Open Extension

- [ ] Click extension icon in toolbar
- [ ] Popup window opens (600x400px)
- [ ] Header displays "LLM Task Scheduler"
- [ ] Four tabs visible: Tasks, Create Task, Logs, Settings
- [ ] No console errors (press F12 in popup to check)

**If popup doesn't open**: Check browser console for errors

## Step 3: Verify UI

### Tasks Tab
- [ ] "Scheduled Tasks" heading visible
- [ ] "Refresh" button present
- [ ] Empty state message: "No tasks scheduled..."

### Create Task Tab
- [ ] All form fields visible:
  - [ ] Task Name
  - [ ] Task Type dropdown
  - [ ] Task Description
  - [ ] LLM Provider dropdown
  - [ ] Model field
  - [ ] Schedule Type dropdown
  - [ ] Enable checkbox
- [ ] "Create Task" button present

### Logs Tab
- [ ] "Execution Logs" heading visible
- [ ] "Clear Logs" button present
- [ ] Empty state message: "No execution logs yet."

### Settings Tab
- [ ] Three provider sections: OpenAI, Anthropic, Local Model
- [ ] API key input fields visible
- [ ] Default model fields visible
- [ ] General settings (Max Retries, Timeout)
- [ ] "Save Settings" button present

**If UI is broken**: Check styles/popup.css exists

## Step 4: Configure Settings

- [ ] Go to Settings tab
- [ ] Enter an API key (OpenAI, Anthropic, or Local endpoint)
- [ ] Click "Save Settings"
- [ ] Success message appears: "Settings saved successfully!"
- [ ] Close popup
- [ ] Reopen popup
- [ ] Go to Settings
- [ ] API key still present (persistence works)

**If settings don't persist**: Check Chrome storage permissions in manifest.json

## Step 5: Create Test Task

- [ ] Go to Create Task tab
- [ ] Fill in minimal required fields:
  ```
  Name: Test Task
  Type: Web Scraping
  Description: Test description
  URL: https://example.com
  LLM Provider: [Your configured provider]
  Schedule: Interval, 5 minutes
  Enable: ✓
  ```
- [ ] Click "Create Task"
- [ ] Success message appears
- [ ] Automatically switches to Tasks tab
- [ ] New task appears in list
- [ ] Task shows "Enabled" status

**If task creation fails**: Check background.js for errors in console

## Step 6: Test Task Execution

- [ ] In Tasks tab, find your test task
- [ ] Click the "Run Now" button (▶️)
- [ ] Message appears: "Task execution started!"
- [ ] Wait 10-30 seconds (LLM processing time)
- [ ] Go to Logs tab
- [ ] New log entry appears
- [ ] Log shows timestamp, task name, and status

**If execution fails**: 
- Check Logs for error message
- Verify API key is valid
- Check network connectivity
- Check browser console for errors

## Step 7: Verify Task Management

- [ ] Go to Tasks tab
- [ ] Click pause button (⏸️) on your task
- [ ] Status changes to "Disabled"
- [ ] Click play button (▶️)
- [ ] Status changes back to "Enabled"
- [ ] Click delete button (🗑️)
- [ ] Confirmation dialog appears
- [ ] Click OK
- [ ] Task removed from list

**If management buttons don't work**: Check popup.js for errors

## Step 8: Verify Background Processing

- [ ] Create a task with 2-minute interval
- [ ] Close the popup completely
- [ ] Wait 2 minutes
- [ ] Open popup
- [ ] Go to Logs tab
- [ ] New log entry from scheduled execution

**If scheduled execution doesn't work**: 
- Check Chrome alarms permission in manifest.json
- Check background.js alarm listener

## Quick Validation Script

Run the included validation script:

```bash
./validate.sh
```

Should output:
```
✅ All validation checks passed!
```

## Troubleshooting Common Issues

### Issue: Extension won't load
**Solutions**:
- Check manifest.json is valid JSON
- Verify all required files exist
- Check Chrome version (needs recent version for Manifest V3)

### Issue: Popup is blank
**Solutions**:
- Check console for JavaScript errors
- Verify popup.html exists
- Check popup.js syntax

### Issue: Tasks don't execute
**Solutions**:
- Verify API key is configured
- Check network connectivity
- Review error in Logs tab
- Check background.js in extension service worker console

### Issue: UI looks broken
**Solutions**:
- Verify styles/popup.css exists
- Check for CSS loading errors in console
- Clear browser cache and reload extension

### Issue: Can't access certain websites
**Solutions**:
- Some sites block automated access
- Check if site loads normally in browser
- Try a different website
- Check CORS policies

## System Requirements

- **Browser**: Chrome 88+, Edge 88+, or Brave (Chromium-based)
- **Operating System**: Windows, macOS, or Linux
- **Internet**: Required for LLM API calls
- **API Key**: At least one LLM provider account

## Files Checklist

Run `ls -la` in project directory. Should see:

- [x] manifest.json
- [x] background.js
- [x] popup.html
- [x] popup.js
- [x] content.js
- [x] styles/popup.css
- [x] icons/icon16.png
- [x] icons/icon48.png
- [x] icons/icon128.png

## Success Criteria

✅ **Extension Verified Successfully** if:

1. Extension loads without errors
2. All UI tabs render correctly
3. Settings can be saved and persist
4. Tasks can be created
5. "Run Now" executes task successfully
6. Logs display execution results
7. Task management (enable/disable/delete) works
8. Scheduled tasks execute automatically

## Next Steps After Verification

1. Read [QUICKSTART.md](QUICKSTART.md) for usage guide
2. Review [EXAMPLES.md](EXAMPLES.md) for inspiration
3. Check [README.md](README.md) for full documentation
4. Start creating your own tasks!

## Getting Help

If verification fails:
1. Check console errors (F12)
2. Review error messages in Logs tab
3. Consult TESTING.md for detailed tests
4. Check browser version compatibility
5. Open an issue with error details

---

**Installation verified? Start scheduling tasks with AI! 🚀**
