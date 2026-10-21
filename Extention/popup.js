// TradeNifty Pro - Extension Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const inpServerUrl = document.getElementById('inpServerUrl');
  const btnTestConn = document.getElementById('btnTestConn');
  const chkSharkLines = document.getElementById('chkSharkLines');
  const chkOiBands = document.getElementById('chkOiBands');
  const chkSignalHud = document.getElementById('chkSignalHud');
  const chkAxisBadges = document.getElementById('chkAxisBadges');
  const chkSound = document.getElementById('chkSound');
  const selRefreshRate = document.getElementById('selRefreshRate');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const serverStatusDot = document.getElementById('serverStatusDot');
  const serverStatusText = document.getElementById('serverStatusText');

  // Load existing settings
  chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (res) => {
    if (res && res.settings) {
      const s = res.settings;
      if (s.serverUrl) inpServerUrl.value = s.serverUrl;
      if (s.showSharkLines !== undefined) chkSharkLines.checked = s.showSharkLines;
      if (s.showOiBands !== undefined) chkOiBands.checked = s.showOiBands;
      if (s.showSignalHud !== undefined) chkSignalHud.checked = s.showSignalHud;
      if (s.showAxisBadges !== undefined) chkAxisBadges.checked = s.showAxisBadges;
      if (s.soundAlerts !== undefined) chkSound.checked = s.soundAlerts;
      if (s.refreshIntervalMs) selRefreshRate.value = s.refreshIntervalMs;
    }
    testConnection();
  });

  // Test Connection
  btnTestConn.addEventListener('click', testConnection);

  function testConnection() {
    serverStatusText.textContent = 'Testing...';
    serverStatusDot.className = 'status-dot';

    const url = inpServerUrl.value.trim().replace(/\/+$/, '') + '/api/market-data';
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d && (d.spot || d.status === 'success')) {
          serverStatusDot.className = 'status-dot online';
          serverStatusText.textContent = `Online (Spot: ${d.spot || '--'})`;
          serverStatusText.style.color = '#10b981';
        } else {
          throw new Error('Invalid response');
        }
      })
      .catch(err => {
        serverStatusDot.className = 'status-dot';
        serverStatusText.textContent = 'Offline / Error';
        serverStatusText.style.color = '#f43f5e';
      });
  }

  // Save Settings
  btnSaveSettings.addEventListener('click', () => {
    const updatedSettings = {
      serverUrl: inpServerUrl.value.trim().replace(/\/+$/, ''),
      showSharkLines: chkSharkLines.checked,
      showOiBands: chkOiBands.checked,
      showSignalHud: chkSignalHud.checked,
      showAxisBadges: chkAxisBadges.checked,
      soundAlerts: chkSound.checked,
      refreshIntervalMs: parseInt(selRefreshRate.value, 10)
    };

    chrome.runtime.sendMessage({ action: 'SAVE_SETTINGS', settings: updatedSettings }, () => {
      btnSaveSettings.textContent = 'Saved Successfully! ✓';
      btnSaveSettings.style.background = '#10b981';
      setTimeout(() => {
        btnSaveSettings.textContent = 'Save Settings';
        btnSaveSettings.style.background = '';
      }, 1500);
    });
  });
});
