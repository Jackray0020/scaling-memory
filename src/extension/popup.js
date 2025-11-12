const API_URL = 'http://localhost:3000/api';

const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

document.getElementById('refresh-market').addEventListener('click', loadMarketData);
document.getElementById('refresh-news').addEventListener('click', loadNewsData);

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    const cached = await getCachedData(endpoint);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function getCachedData(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}

async function setCachedData(key, data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: data }, resolve);
  });
}

async function loadMarketData() {
  const container = document.getElementById('market-list');
  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = await fetchData('/market?limit=10');
    await setCachedData('/market', data);
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty">No market data available.<br>Make sure the backend is running.</div>';
      return;
    }

    container.innerHTML = data.map(item => {
      const market = item.data;
      const changeClass = market.change >= 0 ? 'positive' : 'negative';
      const changeSymbol = market.change >= 0 ? '▲' : '▼';
      
      return `
        <div class="market-item">
          <div class="symbol">${market.symbol}</div>
          <div class="price">$${market.price.toFixed(2)}</div>
          <div class="change ${changeClass}">
            ${changeSymbol} ${market.change.toFixed(2)} (${market.changePercent.toFixed(2)}%)
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = `<div class="empty">Unable to load data.<br>Error: ${error.message}</div>`;
  }
}

async function loadNewsData() {
  const container = document.getElementById('news-list');
  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = await fetchData('/news?limit=15');
    await setCachedData('/news', data);
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty">No news available.<br>Make sure the backend is running.</div>';
      return;
    }

    container.innerHTML = data.map(item => {
      const news = item.data;
      const time = new Date(news.publishedAt).toLocaleString();
      
      return `
        <div class="news-item">
          <a href="${news.url}" target="_blank" class="news-title">${news.title}</a>
          <div class="news-time">${time}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = `<div class="empty">Unable to load news.<br>Error: ${error.message}</div>`;
  }
}

loadMarketData();
