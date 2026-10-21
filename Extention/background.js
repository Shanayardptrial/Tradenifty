// TradeNifty Pro - TradingView Institutional Background Service Worker

const DEFAULT_SETTINGS = {
  serverUrl: 'http://127.0.0.1:5000',
  showSharkLines: true,
  showOiBands: true,
  showSignalHud: true,
  showAxisBadges: true,
  showOptionDrawer: true,
  refreshIntervalMs: 2500,
  soundAlerts: true
};

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
    chrome.storage.local.set(stored);
  });
});

// Cache for market data
let lastMarketData = null;
let lastFetchTimestamp = 0;

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FETCH_MARKET_DATA') {
    handleFetchMarketData(request.serverUrl || 'http://127.0.0.1:5000')
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => {
        sendResponse({ 
          success: false, 
          error: err.message, 
          fallbackData: lastMarketData 
        });
      });
    return true; // Keep message channel open for asynchronous sendResponse
  }

  if (request.action === 'GET_SETTINGS') {
    chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
      sendResponse({ success: true, settings });
    });
    return true;
  }

  if (request.action === 'SAVE_SETTINGS') {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

async function handleFetchMarketData(serverUrl) {
  const url = `${serverUrl.replace(/\/+$/, '')}/api/market-data`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    lastMarketData = data;
    lastFetchTimestamp = Date.now();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
