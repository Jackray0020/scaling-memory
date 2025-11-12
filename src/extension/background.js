chrome.runtime.onInstalled.addListener(() => {
  console.log('Financial Dashboard Extension installed');
  
  chrome.alarms.create('refresh-data', {
    periodInMinutes: 5
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-data') {
    console.log('Refreshing financial data...');
  }
});
