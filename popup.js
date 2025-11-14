let currentTab = 'tasks';

document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeTaskForm();
  initializeSettings();
  loadTasks();
  loadLogs();
  loadSettings();
});

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  contents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}Tab`);
  });
  
  currentTab = tabName;
  
  if (tabName === 'tasks') {
    loadTasks();
  } else if (tabName === 'logs') {
    loadLogs();
  }
}

function initializeTaskForm() {
  const form = document.getElementById('createTaskForm');
  const taskType = document.getElementById('taskType');
  const scheduleType = document.getElementById('scheduleType');
  
  taskType.addEventListener('change', updateTaskTypeFields);
  scheduleType.addEventListener('change', updateScheduleTypeFields);
  
  form.addEventListener('submit', handleCreateTask);
  
  document.getElementById('refreshTasksBtn').addEventListener('click', loadTasks);
  document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
}

function updateTaskTypeFields() {
  const taskType = document.getElementById('taskType').value;
  const urlGroup = document.getElementById('urlGroup');
  const apiGroup = document.getElementById('apiGroup');
  const customWorkflowGroup = document.getElementById('customWorkflowGroup');
  
  urlGroup.style.display = 'none';
  apiGroup.style.display = 'none';
  customWorkflowGroup.style.display = 'none';
  
  if (taskType === 'web-scraping' || taskType === 'data-collection') {
    urlGroup.style.display = 'block';
  } else if (taskType === 'api-call') {
    apiGroup.style.display = 'block';
  } else if (taskType === 'custom-workflow') {
    customWorkflowGroup.style.display = 'block';
  }
}

function updateScheduleTypeFields() {
  const scheduleType = document.getElementById('scheduleType').value;
  const intervalGroup = document.getElementById('intervalGroup');
  const cronGroup = document.getElementById('cronGroup');
  const recurringGroup = document.getElementById('recurringGroup');
  const onceGroup = document.getElementById('onceGroup');
  
  intervalGroup.style.display = 'none';
  cronGroup.style.display = 'none';
  recurringGroup.style.display = 'none';
  onceGroup.style.display = 'none';
  
  if (scheduleType === 'interval') {
    intervalGroup.style.display = 'block';
  } else if (scheduleType === 'cron') {
    cronGroup.style.display = 'block';
  } else if (scheduleType === 'recurring') {
    recurringGroup.style.display = 'block';
  } else if (scheduleType === 'once') {
    onceGroup.style.display = 'block';
  }
}

async function handleCreateTask(e) {
  e.preventDefault();
  
  const task = {
    id: generateId(),
    name: document.getElementById('taskName').value,
    type: document.getElementById('taskType').value,
    description: document.getElementById('taskDescription').value,
    llmProvider: document.getElementById('llmProvider').value,
    llmModel: document.getElementById('llmModel').value,
    scheduleType: document.getElementById('scheduleType').value,
    enabled: document.getElementById('taskEnabled').checked,
    createdAt: new Date().toISOString(),
    lastRun: null,
    nextRun: null
  };
  
  if (task.type === 'web-scraping' || task.type === 'data-collection') {
    task.targetUrl = document.getElementById('targetUrl').value;
  } else if (task.type === 'api-call') {
    task.apiEndpoint = document.getElementById('apiEndpoint').value;
    task.apiMethod = document.getElementById('apiMethod').value;
    task.apiBody = document.getElementById('apiBody').value;
  } else if (task.type === 'custom-workflow') {
    try {
      task.workflowConfig = JSON.parse(document.getElementById('workflowConfig').value);
    } catch (e) {
      showMessage('error', 'Invalid workflow configuration JSON');
      return;
    }
  }
  
  if (task.scheduleType === 'interval') {
    task.intervalValue = parseInt(document.getElementById('intervalValue').value);
    task.intervalUnit = document.getElementById('intervalUnit').value;
  } else if (task.scheduleType === 'cron') {
    task.cronExpression = document.getElementById('cronExpression').value;
  } else if (task.scheduleType === 'recurring') {
    task.recurringPattern = document.getElementById('recurringPattern').value;
    task.recurringTime = document.getElementById('recurringTime').value;
  } else if (task.scheduleType === 'once') {
    task.onceDateTime = document.getElementById('onceDateTime').value;
  }
  
  try {
    await chrome.runtime.sendMessage({ action: 'createTask', task });
    showMessage('success', 'Task created successfully!');
    document.getElementById('createTaskForm').reset();
    switchTab('tasks');
  } catch (error) {
    showMessage('error', `Failed to create task: ${error.message}`);
  }
}

async function loadTasks() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTasks' });
    const tasks = response.tasks || [];
    renderTasks(tasks);
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
}

function renderTasks(tasks) {
  const tasksList = document.getElementById('tasksList');
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<p class="empty-state">No tasks scheduled. Create one to get started!</p>';
    return;
  }
  
  tasksList.innerHTML = tasks.map(task => `
    <div class="task-card">
      <div class="task-card-header">
        <div>
          <div class="task-card-title">${escapeHtml(task.name)}</div>
          <span class="task-status ${task.enabled ? 'enabled' : 'disabled'}">
            ${task.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div class="task-card-actions">
          <button onclick="toggleTask('${task.id}')" title="${task.enabled ? 'Disable' : 'Enable'}">
            ${task.enabled ? '⏸️' : '▶️'}
          </button>
          <button onclick="runTaskNow('${task.id}')" title="Run Now">▶️</button>
          <button onclick="deleteTask('${task.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="task-card-info">
        <div><strong>Type:</strong> ${escapeHtml(task.type)}</div>
        <div><strong>LLM:</strong> ${escapeHtml(task.llmProvider)} ${task.llmModel ? `(${escapeHtml(task.llmModel)})` : ''}</div>
        <div><strong>Schedule:</strong> ${formatSchedule(task)}</div>
        ${task.lastRun ? `<div><strong>Last Run:</strong> ${formatDate(task.lastRun)}</div>` : ''}
        ${task.nextRun ? `<div><strong>Next Run:</strong> ${formatDate(task.nextRun)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

window.toggleTask = async function(taskId) {
  try {
    await chrome.runtime.sendMessage({ action: 'toggleTask', taskId });
    loadTasks();
  } catch (error) {
    showMessage('error', `Failed to toggle task: ${error.message}`);
  }
};

window.runTaskNow = async function(taskId) {
  try {
    await chrome.runtime.sendMessage({ action: 'runTaskNow', taskId });
    showMessage('success', 'Task execution started!');
    setTimeout(loadLogs, 1000);
  } catch (error) {
    showMessage('error', `Failed to run task: ${error.message}`);
  }
};

window.deleteTask = async function(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ action: 'deleteTask', taskId });
    loadTasks();
    showMessage('success', 'Task deleted successfully!');
  } catch (error) {
    showMessage('error', `Failed to delete task: ${error.message}`);
  }
};

async function loadLogs() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getLogs' });
    const logs = response.logs || [];
    renderLogs(logs);
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
}

function renderLogs(logs) {
  const logsList = document.getElementById('logsList');
  
  if (logs.length === 0) {
    logsList.innerHTML = '<p class="empty-state">No execution logs yet.</p>';
    return;
  }
  
  logsList.innerHTML = logs.slice().reverse().map(log => `
    <div class="log-entry ${log.status}">
      <div class="log-timestamp">${formatDate(log.timestamp)}</div>
      <div class="log-message">
        <strong>${escapeHtml(log.taskName || 'Unknown Task')}</strong><br>
        ${escapeHtml(log.message)}
        ${log.error ? `<br><span style="color: #c62828;">Error: ${escapeHtml(log.error)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

async function clearLogs() {
  if (!confirm('Are you sure you want to clear all logs?')) {
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ action: 'clearLogs' });
    loadLogs();
    showMessage('success', 'Logs cleared successfully!');
  } catch (error) {
    showMessage('error', `Failed to clear logs: ${error.message}`);
  }
}

function initializeSettings() {
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = result.settings || {};
    
    if (settings.openai) {
      document.getElementById('openaiApiKey').value = settings.openai.apiKey || '';
      document.getElementById('openaiDefaultModel').value = settings.openai.defaultModel || 'gpt-4';
    }
    
    if (settings.anthropic) {
      document.getElementById('anthropicApiKey').value = settings.anthropic.apiKey || '';
      document.getElementById('anthropicDefaultModel').value = settings.anthropic.defaultModel || 'claude-3-opus-20240229';
    }
    
    if (settings.local) {
      document.getElementById('localModelEndpoint').value = settings.local.endpoint || '';
      document.getElementById('localModelName').value = settings.local.modelName || '';
    }
    
    if (settings.general) {
      document.getElementById('maxRetries').value = settings.general.maxRetries || 3;
      document.getElementById('timeout').value = settings.general.timeout || 60;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  const settings = {
    openai: {
      apiKey: document.getElementById('openaiApiKey').value,
      defaultModel: document.getElementById('openaiDefaultModel').value
    },
    anthropic: {
      apiKey: document.getElementById('anthropicApiKey').value,
      defaultModel: document.getElementById('anthropicDefaultModel').value
    },
    local: {
      endpoint: document.getElementById('localModelEndpoint').value,
      modelName: document.getElementById('localModelName').value
    },
    general: {
      maxRetries: parseInt(document.getElementById('maxRetries').value),
      timeout: parseInt(document.getElementById('timeout').value)
    }
  };
  
  try {
    await chrome.storage.local.set({ settings });
    showMessage('success', 'Settings saved successfully!');
  } catch (error) {
    showMessage('error', `Failed to save settings: ${error.message}`);
  }
}

function showMessage(type, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `${type}-message`;
  messageDiv.textContent = message;
  
  const activeTab = document.querySelector('.tab-content.active');
  activeTab.insertBefore(messageDiv, activeTab.firstChild);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

function formatSchedule(task) {
  if (task.scheduleType === 'interval') {
    return `Every ${task.intervalValue} ${task.intervalUnit}`;
  } else if (task.scheduleType === 'cron') {
    return `Cron: ${task.cronExpression}`;
  } else if (task.scheduleType === 'recurring') {
    return `${task.recurringPattern} at ${task.recurringTime}`;
  } else if (task.scheduleType === 'once') {
    return `Once on ${formatDate(task.onceDateTime)}`;
  }
  return 'Unknown';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
