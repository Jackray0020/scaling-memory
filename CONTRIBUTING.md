# Contributing to LLM Task Scheduler

Thank you for your interest in contributing to the LLM Task Scheduler Chrome Extension! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Chrome version
- Extension version
- Screenshots (if applicable)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (if you have ideas)
- Examples of similar features in other tools

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**: `git commit -m "Add feature: description"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/llm-task-scheduler.git
   cd llm-task-scheduler
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

3. Make your changes and reload the extension to test

## Code Style Guidelines

### JavaScript

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### HTML

- Use semantic HTML5 elements
- Maintain proper indentation
- Use meaningful IDs and classes

### CSS

- Use BEM naming convention for classes
- Keep selectors specific but not overly nested
- Use CSS variables for colors and common values
- Maintain consistent spacing

## Testing

Before submitting a PR:

1. **Manual Testing**:
   - Test all task types (web scraping, API calls, custom workflows)
   - Test all schedule types (interval, cron, recurring, once)
   - Test all LLM providers (at least 2)
   - Test enable/disable functionality
   - Test task deletion
   - Test "Run Now" functionality
   - Test settings save/load
   - Test error handling

2. **Edge Cases**:
   - Invalid inputs
   - Network failures
   - API errors
   - Invalid cron expressions
   - Empty data

3. **Browser Testing**:
   - Test in Chrome (latest version)
   - Test extension reload
   - Test storage persistence

## Adding New Features

### Adding a New Task Type

1. Update `popup.html`:
   - Add option to `<select id="taskType">`
   - Add any new input fields needed

2. Update `popup.js`:
   - Add handling in `updateTaskTypeFields()`
   - Add data collection in `handleCreateTask()`

3. Update `background.js`:
   - Add execution logic in `executeTask()`
   - Create new function like `performYourTaskType()`

4. Update documentation:
   - Add examples to `EXAMPLES.md`
   - Update `README.md`

### Adding a New LLM Provider

1. Update `popup.html`:
   - Add provider to settings section
   - Add provider to `<select id="llmProvider">`

2. Update `background.js`:
   - Add provider handling in `callLLM()`
   - Create new function like `callYourProvider()`

3. Update `README.md`:
   - Document API integration
   - Add configuration instructions

### Adding a New Schedule Type

1. Update `popup.html`:
   - Add option to `<select id="scheduleType">`
   - Add input fields for configuration

2. Update `popup.js`:
   - Add handling in `updateScheduleTypeFields()`
   - Add data collection in `handleCreateTask()`

3. Update `background.js`:
   - Add logic in `scheduleTask()`
   - Create calculation function if needed

## Pull Request Guidelines

### PR Title

Use clear, descriptive titles:
- ✅ "Add support for Google Gemini API"
- ✅ "Fix cron expression parsing for monthly schedules"
- ✅ "Improve error messages for API failures"
- ❌ "Update code"
- ❌ "Fix bug"

### PR Description

Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots (for UI changes)
- Breaking changes (if any)

### Example PR Description

```markdown
## Description
Adds support for Google Gemini API as an LLM provider.

## Motivation
Users want to use Google's Gemini models for task execution.

## Changes
- Added Gemini API configuration in settings
- Implemented `callGemini()` function in background.js
- Added Gemini to provider dropdown
- Updated documentation

## Testing
1. Configure Gemini API key in settings
2. Create a task with Gemini as provider
3. Run the task and verify LLM response
4. Check error handling with invalid API key

## Screenshots
[Add screenshots of new settings UI]

## Breaking Changes
None
```

## Code Review Process

1. Maintainer reviews code
2. Automated checks run (if configured)
3. Feedback provided
4. Changes requested (if needed)
5. Approval and merge

## Best Practices

### Security

- Never commit API keys or secrets
- Validate all user inputs
- Sanitize data before storage
- Use HTTPS for all API calls
- Follow Chrome extension security guidelines

### Performance

- Minimize background script activity
- Use efficient selectors for web scraping
- Implement proper error handling
- Clean up resources (tabs, listeners)

### User Experience

- Provide clear error messages
- Show loading states
- Validate inputs before submission
- Give feedback on actions
- Keep UI responsive

### Maintainability

- Write self-documenting code
- Add comments for complex logic
- Keep functions small
- Use meaningful names
- Follow DRY principle

## Community Guidelines

- Be respectful and constructive
- Help others in discussions
- Share knowledge and experiences
- Follow the code of conduct
- Give credit where due

## Questions?

If you have questions:
- Check existing issues
- Read the documentation
- Create a discussion thread
- Tag maintainers if urgent

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the extension description

Thank you for contributing! 🎉
