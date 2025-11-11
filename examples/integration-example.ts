import { RtrvrClient } from '../src/rtrvr-client.js';
import { TaskScheduler } from '../src/scheduler.js';
import type { Task } from '../src/types.js';

async function exampleIntegration() {
  const rtrvrClient = new RtrvrClient({
    baseUrl: 'https://api.rtrvr.ai',
    apiKey: process.env.RTRVR_API_KEY,
  });

  const scheduler = new TaskScheduler(rtrvrClient);

  const task: Task = {
    id: crypto.randomUUID(),
    title: 'Check website status',
    description: 'Monitor website availability',
    scheduledTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending',
    recurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      url: 'https://example.com',
      expectedStatus: 200,
      timeout: 10000,
    },
  };

  const createdTask = scheduler.createTask(task);
  console.log('Task created:', createdTask);

  const status = await rtrvrClient.getAgentStatus();
  console.log('rtrvr.ai agent status:', status);

  const allTasks = scheduler.getAllTasks();
  console.log('All tasks:', allTasks);

  const upcomingTasks = scheduler.getUpcomingTasks(5);
  console.log('Upcoming tasks:', upcomingTasks);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  exampleIntegration().catch(console.error);
}

export { exampleIntegration };
