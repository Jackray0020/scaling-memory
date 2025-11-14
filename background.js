const ALARM_PREFIX = 'task_';

chrome.runtime.onInstalled.addListener(() => {
  console.log('LLM Task Scheduler installed');
  initializeStorage();
});

async function initializeStorage() {
  const result = await chrome.storage.local.get(['tasks', 'logs', 'settings']);
  
  if (!result.tasks) {
    await chrome.storage.local.set({ tasks: [] });
  }
  
  if (!result.logs) {
    await chrome.storage.local.set({ logs: [] });
  }
  
  if (!result.settings) {
    await chrome.storage.local.set({ 
      settings: {
        openai: { apiKey: '', defaultModel: 'gpt-4' },
        anthropic: { apiKey: '', defaultModel: 'claude-3-opus-20240229' },
        local: { endpoint: '', modelName: '' },
        general: { maxRetries: 3, timeout: 60 }
      }
    });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender).then(sendResponse);
  return true;
});

async function handleMessage(request, sender) {
  switch (request.action) {
    case 'createTask':
      return await createTask(request.task);
    case 'getTasks':
      return await getTasks();
    case 'toggleTask':
      return await toggleTask(request.taskId);
    case 'deleteTask':
      return await deleteTask(request.taskId);
    case 'runTaskNow':
      return await runTaskNow(request.taskId);
    case 'getLogs':
      return await getLogs();
    case 'clearLogs':
      return await clearLogs();
    case 'collectData':
      return await collectDataFromPage(sender.tab.id, request.selectors);
    default:
      return { error: 'Unknown action' };
  }
}

async function createTask(task) {
  const result = await chrome.storage.local.get('tasks');
  const tasks = result.tasks || [];
  
  tasks.push(task);
  await chrome.storage.local.set({ tasks });
  
  if (task.enabled) {
    await scheduleTask(task);
  }
  
  await addLog({
    taskId: task.id,
    taskName: task.name,
    status: 'success',
    message: 'Task created successfully',
    timestamp: new Date().toISOString()
  });
  
  return { success: true };
}

async function getTasks() {
  const result = await chrome.storage.local.get('tasks');
  return { tasks: result.tasks || [] };
}

async function toggleTask(taskId) {
  const result = await chrome.storage.local.get('tasks');
  const tasks = result.tasks || [];
  
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { error: 'Task not found' };
  }
  
  task.enabled = !task.enabled;
  await chrome.storage.local.set({ tasks });
  
  if (task.enabled) {
    await scheduleTask(task);
  } else {
    await unscheduleTask(task);
  }
  
  return { success: true };
}

async function deleteTask(taskId) {
  const result = await chrome.storage.local.get('tasks');
  const tasks = result.tasks || [];
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return { error: 'Task not found' };
  }
  
  const task = tasks[taskIndex];
  await unscheduleTask(task);
  
  tasks.splice(taskIndex, 1);
  await chrome.storage.local.set({ tasks });
  
  return { success: true };
}

async function runTaskNow(taskId) {
  const result = await chrome.storage.local.get('tasks');
  const tasks = result.tasks || [];
  
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { error: 'Task not found' };
  }
  
  await executeTask(task);
  return { success: true };
}

async function scheduleTask(task) {
  const alarmName = ALARM_PREFIX + task.id;
  
  await chrome.alarms.clear(alarmName);
  
  let delayInMinutes = 0;
  
  if (task.scheduleType === 'interval') {
    delayInMinutes = convertToMinutes(task.intervalValue, task.intervalUnit);
    await chrome.alarms.create(alarmName, {
      delayInMinutes: delayInMinutes,
      periodInMinutes: delayInMinutes
    });
  } else if (task.scheduleType === 'cron') {
    const nextRun = calculateNextCronRun(task.cronExpression);
    if (nextRun) {
      delayInMinutes = (nextRun.getTime() - Date.now()) / (1000 * 60);
      await chrome.alarms.create(alarmName, {
        when: nextRun.getTime()
      });
      task.nextRun = nextRun.toISOString();
    }
  } else if (task.scheduleType === 'recurring') {
    const nextRun = calculateNextRecurringRun(task.recurringPattern, task.recurringTime);
    if (nextRun) {
      delayInMinutes = (nextRun.getTime() - Date.now()) / (1000 * 60);
      await chrome.alarms.create(alarmName, {
        when: nextRun.getTime()
      });
      task.nextRun = nextRun.toISOString();
    }
  } else if (task.scheduleType === 'once') {
    const runTime = new Date(task.onceDateTime);
    if (runTime > new Date()) {
      await chrome.alarms.create(alarmName, {
        when: runTime.getTime()
      });
      task.nextRun = runTime.toISOString();
    }
  }
  
  const result = await chrome.storage.local.get('tasks');
  const tasks = result.tasks || [];
  const taskIndex = tasks.findIndex(t => t.id === task.id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = task;
    await chrome.storage.local.set({ tasks });
  }
}

async function unscheduleTask(task) {
  const alarmName = ALARM_PREFIX + task.id;
  await chrome.alarms.clear(alarmName);
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith(ALARM_PREFIX)) {
    const taskId = alarm.name.substring(ALARM_PREFIX.length);
    const result = await chrome.storage.local.get('tasks');
    const tasks = result.tasks || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.enabled) {
      await executeTask(task);
      
      if (task.scheduleType === 'cron' || task.scheduleType === 'recurring') {
        await scheduleTask(task);
      } else if (task.scheduleType === 'once') {
        task.enabled = false;
        await chrome.storage.local.set({ tasks });
      }
    }
  }
});

async function executeTask(task) {
  console.log('Executing task:', task.name);
  
  task.lastRun = new Date().toISOString();
  
  const result = await chrome.storage.local.get(['tasks', 'settings']);
  const tasks = result.tasks || [];
  const settings = result.settings || {};
  
  const taskIndex = tasks.findIndex(t => t.id === task.id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = task;
    await chrome.storage.local.set({ tasks });
  }
  
  try {
    let contextData = '';
    
    if (task.type === 'web-scraping' || task.type === 'data-collection') {
      contextData = await performWebScraping(task);
    } else if (task.type === 'api-call') {
      contextData = await performApiCall(task);
    } else if (task.type === 'custom-workflow') {
      contextData = await performCustomWorkflow(task);
    }
    
    const llmResponse = await callLLM(task, contextData, settings);
    
    await addLog({
      taskId: task.id,
      taskName: task.name,
      status: 'success',
      message: `Task executed successfully. LLM response: ${llmResponse.substring(0, 200)}...`,
      timestamp: new Date().toISOString(),
      fullResponse: llmResponse
    });
    
  } catch (error) {
    console.error('Task execution error:', error);
    
    await addLog({
      taskId: task.id,
      taskName: task.name,
      status: 'error',
      message: 'Task execution failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    const maxRetries = settings.general?.maxRetries || 3;
    task.retryCount = (task.retryCount || 0) + 1;
    
    if (task.retryCount < maxRetries) {
      setTimeout(() => executeTask(task), 60000);
    } else {
      task.retryCount = 0;
    }
  }
}

async function performWebScraping(task) {
  try {
    const tab = await chrome.tabs.create({ url: task.targetUrl, active: false });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          title: document.title,
          url: window.location.href,
          text: document.body.innerText.substring(0, 5000),
          html: document.documentElement.outerHTML.substring(0, 10000)
        };
      }
    });
    
    await chrome.tabs.remove(tab.id);
    
    const data = results[0].result;
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Web scraping failed: ${error.message}`);
  }
}

async function performApiCall(task) {
  try {
    const options = {
      method: task.apiMethod || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (task.apiBody && (task.apiMethod === 'POST' || task.apiMethod === 'PUT')) {
      options.body = task.apiBody;
    }
    
    const response = await fetch(task.apiEndpoint, options);
    const data = await response.json();
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

async function performCustomWorkflow(task) {
  try {
    const workflow = task.workflowConfig;
    const results = [];
    
    for (const step of workflow.steps || []) {
      if (step.type === 'http') {
        const response = await fetch(step.url, {
          method: step.method || 'GET',
          headers: step.headers || {},
          body: step.body ? JSON.stringify(step.body) : undefined
        });
        const data = await response.json();
        results.push({ step: step.name, data });
      }
    }
    
    return JSON.stringify(results, null, 2);
  } catch (error) {
    throw new Error(`Custom workflow failed: ${error.message}`);
  }
}

async function callLLM(task, contextData, settings) {
  const provider = task.llmProvider;
  const model = task.llmModel;
  
  const prompt = `${task.description}\n\nContext Data:\n${contextData}`;
  
  if (provider === 'openai') {
    return await callOpenAI(prompt, model, settings.openai);
  } else if (provider === 'anthropic') {
    return await callAnthropic(prompt, model, settings.anthropic);
  } else if (provider === 'local') {
    return await callLocalModel(prompt, model, settings.local);
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function callOpenAI(prompt, model, config) {
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: model || config.defaultModel || 'gpt-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt, model, config) {
  if (!config.apiKey) {
    throw new Error('Anthropic API key not configured');
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || config.defaultModel || 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

async function callLocalModel(prompt, model, config) {
  if (!config.endpoint) {
    throw new Error('Local model endpoint not configured');
  }
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || config.modelName,
      prompt: prompt,
      stream: false
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Local model error: ${error}`);
  }
  
  const data = await response.json();
  return data.response || data.text || JSON.stringify(data);
}

async function getLogs() {
  const result = await chrome.storage.local.get('logs');
  return { logs: result.logs || [] };
}

async function clearLogs() {
  await chrome.storage.local.set({ logs: [] });
  return { success: true };
}

async function addLog(log) {
  const result = await chrome.storage.local.get('logs');
  const logs = result.logs || [];
  
  logs.push(log);
  
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  await chrome.storage.local.set({ logs });
}

function convertToMinutes(value, unit) {
  switch (unit) {
    case 'minutes':
      return value;
    case 'hours':
      return value * 60;
    case 'days':
      return value * 60 * 24;
    default:
      return value;
  }
}

function calculateNextCronRun(cronExpression) {
  try {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression');
    }
    
    const [minute, hour, day, month, weekday] = parts;
    const now = new Date();
    const next = new Date(now);
    
    if (minute !== '*') {
      next.setMinutes(parseInt(minute));
    }
    if (hour !== '*') {
      next.setHours(parseInt(hour));
    }
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  } catch (error) {
    console.error('Cron parsing error:', error);
    return null;
  }
}

function calculateNextRecurringRun(pattern, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date(now);
  
  next.setHours(hours, minutes, 0, 0);
  
  if (pattern === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (pattern === 'weekly') {
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
  } else if (pattern === 'monthly') {
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }
  
  return next;
}
