// ==========================================================================
// TradeNifty Pro - TradingView Institutional Overlay Engine
// ==========================================================================

(() => {
  if (window.__TRADENIFTY_TV_INJECTED__) return;
  window.__TRADENIFTY_TV_INJECTED__ = true;

  console.log('%c[TradeNifty Pro]%c TradingView Institutional Engine Activated', 'background:#00f0ff;color:#000;font-weight:bold;padding:2px 6px;border-radius:3px;', 'color:#00f0ff;font-weight:bold;');

  let config = {
    serverUrl: 'http://127.0.0.1:5000',
    showSharkLines: true,
    showOiBands: true,
    showSignalHud: true,
    showAxisBadges: true,
    showOptionDrawer: false,
    refreshIntervalMs: 2500,
    soundAlerts: true
  };

  let marketState = null;
  let hudElement = null;
  let svgOverlay = null;
  let axisBadgesContainer = null;
  let optionDrawerElement = null;
  let refreshTimer = null;
  let lastSignalContract = null;

  // Initialize
  init();

  async function init() {
    await loadSettings();
    createOverlayDOM();
    setupDraggableHUD();
    startDataSync();
    setupWindowResizeListener();
  }

  function loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (res) => {
        if (res && res.success && res.settings) {
          config = { ...config, ...res.settings };
        }
        resolve();
      });
    });
  }

  // --- Create DOM Elements ---
  function createOverlayDOM() {
    // 1. Full-Chart SVG Overlay Layer
    if (!document.getElementById('tradenifty-svg-overlay')) {
      svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgOverlay.id = 'tradenifty-svg-overlay';
      document.body.appendChild(svgOverlay);
    }

    // 2. Right Price Axis Badges Container
    if (!document.getElementById('tradenifty-axis-container')) {
      axisBadgesContainer = document.createElement('div');
      axisBadgesContainer.id = 'tradenifty-axis-container';
      axisBadgesContainer.className = 'tn-axis-badge-container';
      document.body.appendChild(axisBadgesContainer);
    }

    // 3. Floating HUD Box
    if (!document.getElementById('tradenifty-tv-hud')) {
      hudElement = document.createElement('div');
      hudElement.id = 'tradenifty-tv-hud';
      
      // Load saved position
      const savedPos = localStorage.getItem('__tn_tv_hud_pos');
      if (savedPos) {
        try {
          const { x, y } = JSON.parse(savedPos);
          hudElement.style.left = `${Math.max(10, Math.min(window.innerWidth - 330, x))}px`;
          hudElement.style.top = `${Math.max(10, Math.min(window.innerHeight - 300, y))}px`;
        } catch (e) {}
      }

      hudElement.innerHTML = `
        <div class="tn-hud-header" id="tnHudDragHeader">
          <div class="tn-brand">
            <span class="tn-logo-pill">TN PRO</span>
            <span>SHARK &amp; OI RADAR</span>
            <span class="tn-status-dot" id="tnStatusDot" title="Live Server Connected"></span>
          </div>
          <div class="tn-header-actions">
            <button class="tn-icon-btn" id="tnBtnSync" title="Force Refresh">⚡</button>
            <button class="tn-icon-btn" id="tnBtnChain" title="Toggle Mini Option Chain">📑</button>
            <button class="tn-icon-btn" id="tnBtnMinimize" title="Minimize/Expand">_</button>
          </div>
        </div>

        <div class="tn-hud-body" id="tnHudBody">
          <!-- Spot & PCR Bar -->
          <div class="tn-spot-bar">
            <div>
              <span style="font-size:10px;color:var(--tn-muted);font-weight:700;">NIFTY SPOT</span>
              <div class="tn-spot-val" id="tnSpotPrice">--</div>
            </div>
            <div style="text-align:right;">
              <span class="tn-pcr-tag" id="tnPcrVal">PCR: --</span>
              <div style="font-size:9px;color:var(--tn-dim);margin-top:2px;" id="tnMarketStatus">NSE Connected</div>
            </div>
          </div>

          <!-- Active Algorithmic Trade Signal -->
          <div class="tn-signal-card" id="tnSignalCard">
            <div class="tn-signal-header">
              <span class="tn-action-badge" id="tnSigAction">CALCULATING</span>
              <span class="tn-confidence" id="tnSigConfidence">--% CONFIDENCE</span>
            </div>
            <div class="tn-contract-title" id="tnSigContract">Analyzing Volatility &amp; OI...</div>
            <div class="tn-signal-grid">
              <div class="tn-sg-item">
                <div class="lbl">TRIGGER</div>
                <div class="val tn-val-entry" id="tnSigEntry">₹0.00</div>
              </div>
              <div class="tn-sg-item">
                <div class="lbl">TARGET 1</div>
                <div class="val tn-val-tp" id="tnSigTarget">₹0.00</div>
              </div>
              <div class="tn-sg-item">
                <div class="lbl">STOP LOSS</div>
                <div class="val tn-val-sl" id="tnSigStop">₹0.00</div>
              </div>
            </div>
          </div>

          <!-- Institutional Shark Wall Radar -->
          <div class="tn-radar-box">
            <div class="tn-box-title">
              <span>🦈 Institutional Walls</span>
              <span id="tnAtmStrikeVal" style="color:var(--tn-gold);">ATM: --</span>
            </div>

            <div class="tn-radar-row">
              <div class="tn-radar-label tn-shark-wall-ce">
                <span>🔴 Shark Resistance</span>
              </div>
              <div class="tn-radar-val">
                <span id="tnSharkCeStrike">--</span>
                <span class="tn-dist-tag" id="tnSharkCeDist">--</span>
              </div>
            </div>

            <div class="tn-radar-row">
              <div class="tn-radar-label tn-shark-support-pe">
                <span>🟢 Shark Support</span>
              </div>
              <div class="tn-radar-val">
                <span id="tnSharkPeStrike">--</span>
                <span class="tn-dist-tag" id="tnSharkPeDist">--</span>
              </div>
            </div>

            <div class="tn-radar-row">
              <div class="tn-radar-label" style="color:#c084fc;">
                <span>🎯 Max Pain Level</span>
              </div>
              <div class="tn-radar-val">
                <span id="tnMaxPainVal">--</span>
              </div>
            </div>
          </div>

          <!-- Controls Strip -->
          <div class="tn-controls-strip">
            <button class="tn-btn-toggle active" id="tnTglLines">Ray Lines: ON</button>
            <button class="tn-btn-toggle active" id="tnTglBadges">Axis: ON</button>
            <button class="tn-btn-toggle active" id="tnTglSignal">Signal: ON</button>
          </div>
        </div>
      `;

      document.body.appendChild(hudElement);

      // Event Listeners for HUD controls
      document.getElementById('tnBtnSync')?.addEventListener('click', fetchData);
      document.getElementById('tnBtnMinimize')?.addEventListener('click', toggleMinimizeHUD);
      document.getElementById('tnBtnChain')?.addEventListener('click', toggleOptionDrawer);
      
      document.getElementById('tnTglLines')?.addEventListener('click', (e) => {
        config.showSharkLines = !config.showSharkLines;
        e.target.classList.toggle('active', config.showSharkLines);
        e.target.textContent = `Ray Lines: ${config.showSharkLines ? 'ON' : 'OFF'}`;
        renderChartPlots();
      });

      document.getElementById('tnTglBadges')?.addEventListener('click', (e) => {
        config.showAxisBadges = !config.showAxisBadges;
        e.target.classList.toggle('active', config.showAxisBadges);
        e.target.textContent = `Axis: ${config.showAxisBadges ? 'ON' : 'OFF'}`;
        if (axisBadgesContainer) {
          axisBadgesContainer.style.display = config.showAxisBadges ? 'block' : 'none';
        }
      });

      document.getElementById('tnTglSignal')?.addEventListener('click', (e) => {
        config.showSignalHud = !config.showSignalHud;
        e.target.classList.toggle('active', config.showSignalHud);
        e.target.textContent = `Signal: ${config.showSignalHud ? 'ON' : 'OFF'}`;
        const card = document.getElementById('tnSignalCard');
        if (card) card.style.display = config.showSignalHud ? 'block' : 'none';
      });
    }

    // 4. Compact Option Chain Drawer
    if (!document.getElementById('tradenifty-option-drawer')) {
      optionDrawerElement = document.createElement('div');
      optionDrawerElement.id = 'tradenifty-option-drawer';
      optionDrawerElement.innerHTML = `
        <div class="tn-drawer-header">
          <span>⚡ INSTANT 7-STRIKE OPTION CHAIN (TRADENIFTY PRO)</span>
          <button class="tn-icon-btn" id="tnBtnCloseDrawer">&times;</button>
        </div>
        <table class="tn-drawer-table">
          <thead>
            <tr>
              <th style="color:#00e5ff;">CE OI</th>
              <th style="color:#00e5ff;">CE LTP</th>
              <th style="text-align:center;color:#facc15;">STRIKE</th>
              <th style="color:#ff5500;">PE LTP</th>
              <th style="color:#ff5500;">PE OI</th>
            </tr>
          </thead>
          <tbody id="tnDrawerBody">
            <!-- Populated via script -->
          </tbody>
        </table>
      `;
      document.body.appendChild(optionDrawerElement);

      document.getElementById('tnBtnCloseDrawer')?.addEventListener('click', () => {
        optionDrawerElement.classList.remove('open');
      });
    }
  }

  function toggleMinimizeHUD() {
    if (hudElement) {
      hudElement.classList.toggle('minimized');
      const btn = document.getElementById('tnBtnMinimize');
      if (btn) btn.textContent = hudElement.classList.contains('minimized') ? '□' : '_';
    }
  }

  function toggleOptionDrawer() {
    if (optionDrawerElement) {
      optionDrawerElement.classList.toggle('open');
      renderOptionDrawerRows();
    }
  }

  // --- Drag & Drop for HUD Window ---
  function setupDraggableHUD() {
    const header = document.getElementById('tnHudDragHeader');
    if (!header || !hudElement) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = hudElement.offsetLeft;
      initialY = hudElement.offsetTop;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = Math.max(10, Math.min(window.innerWidth - hudElement.offsetWidth - 10, initialX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - hudElement.offsetHeight - 10, initialY + dy));
      hudElement.style.left = `${newX}px`;
      hudElement.style.top = `${newY}px`;
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        localStorage.setItem('__tn_tv_hud_pos', JSON.stringify({
          x: hudElement.offsetLeft,
          y: hudElement.offsetTop
        }));
      }
    }
  }

  // --- Real-Time Data Sync ---
  function startDataSync() {
    fetchData();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchData, config.refreshIntervalMs);
  }

  function fetchData() {
    chrome.runtime.sendMessage({
      action: 'FETCH_MARKET_DATA',
      serverUrl: config.serverUrl
    }, (response) => {
      if (response && response.success && response.data) {
        marketState = response.data;
        updateHUD();
        renderChartPlots();
        renderOptionDrawerRows();
        setConnectionStatus(true);
      } else {
        if (response && response.fallbackData) {
          marketState = response.fallbackData;
          updateHUD();
          renderChartPlots();
        }
        setConnectionStatus(false);
      }
    });
  }

  function setConnectionStatus(isOnline) {
    const dot = document.getElementById('tnStatusDot');
    const label = document.getElementById('tnMarketStatus');
    if (dot) {
      dot.className = isOnline ? 'tn-status-dot' : 'tn-status-dot offline';
      dot.title = isOnline ? 'Connected to TradeNifty Engine' : 'Offline / Reconnecting';
    }
    if (label) {
      label.textContent = isOnline ? 'NSE Connected' : 'Reconnecting...';
      label.style.color = isOnline ? 'var(--tn-green)' : 'var(--tn-rose)';
    }
  }

  // --- Update HUD UI ---
  function updateHUD() {
    if (!marketState) return;

    // 1. Spot Price & PCR
    const spot = marketState.spot || 0;
    const spotEl = document.getElementById('tnSpotPrice');
    if (spotEl) {
      const chgSign = (marketState.change || 0) >= 0 ? '+' : '';
      spotEl.innerHTML = `₹${spot.toLocaleString()} <span style="font-size:11px;color:${(marketState.change || 0) >= 0 ? 'var(--tn-green)' : 'var(--tn-rose)'};">${chgSign}${marketState.change || 0} (${marketState.changePct || 0}%)</span>`;
    }

    const pcr = marketState.derivatives?.pcr || 1.0;
    const pcrEl = document.getElementById('tnPcrVal');
    if (pcrEl) {
      pcrEl.textContent = `PCR: ${pcr.toFixed(2)}`;
      pcrEl.style.color = pcr >= 1.1 ? 'var(--tn-green)' : (pcr <= 0.8 ? 'var(--tn-rose)' : 'var(--tn-cyan)');
    }

    // 2. Institutional Shark Walls Calculation
    const chain = marketState.chain || [];
    let maxCeStrike = 0;
    let maxCeOi = 0;
    let maxPeStrike = 0;
    let maxPeOi = 0;

    chain.forEach(r => {
      if (r.ce?.oi > maxCeOi) {
        maxCeOi = r.ce.oi;
        maxCeStrike = r.strike;
      }
      if (r.pe?.oi > maxPeOi) {
        maxPeOi = r.pe.oi;
        maxPeStrike = r.strike;
      }
    });

    const ceDist = maxCeStrike ? maxCeStrike - spot : 0;
    const peDist = maxPeStrike ? maxPeStrike - spot : 0;

    const sharkCeEl = document.getElementById('tnSharkCeStrike');
    const sharkCeDistEl = document.getElementById('tnSharkCeDist');
    if (sharkCeEl) sharkCeEl.textContent = `${maxCeStrike} (${maxCeOi}L)`;
    if (sharkCeDistEl) sharkCeDistEl.textContent = ceDist >= 0 ? `+${ceDist.toFixed(0)} pts` : `${ceDist.toFixed(0)} pts`;

    const sharkPeEl = document.getElementById('tnSharkPeStrike');
    const sharkPeDistEl = document.getElementById('tnSharkPeDist');
    if (sharkPeEl) sharkPeEl.textContent = `${maxPeStrike} (${maxPeOi}L)`;
    if (sharkPeDistEl) sharkPeDistEl.textContent = peDist >= 0 ? `+${peDist.toFixed(0)} pts` : `${peDist.toFixed(0)} pts`;

    const maxPain = marketState.derivatives?.maxPain || 0;
    const painEl = document.getElementById('tnMaxPainVal');
    if (painEl) painEl.textContent = `${maxPain}`;

    const atmStrike = marketState.derivatives?.atmStrike || Math.round(spot / 50) * 50;
    const atmEl = document.getElementById('tnAtmStrikeVal');
    if (atmEl) atmEl.textContent = `ATM: ${atmStrike}`;

    // 3. Trade Signal Card
    const sig = marketState.signal;
    if (sig) {
      const card = document.getElementById('tnSignalCard');
      const actionBadge = document.getElementById('tnSigAction');
      const contractEl = document.getElementById('tnSigContract');
      const confEl = document.getElementById('tnSigConfidence');
      const entryEl = document.getElementById('tnSigEntry');
      const targetEl = document.getElementById('tnSigTarget');
      const stopEl = document.getElementById('tnSigStop');

      const isPe = sig.actionType === 'BUY_PE' || (sig.action && sig.action.includes('PUT'));
      if (card) {
        card.className = isPe ? 'tn-signal-card buy-pe' : 'tn-signal-card';
      }
      if (actionBadge) {
        actionBadge.textContent = sig.action || (isPe ? 'BUY PUT (PE)' : 'BUY CALL (CE)');
      }
      if (contractEl) contractEl.textContent = sig.contract || 'NIFTY ATM';
      if (confEl) confEl.textContent = `${sig.confidence || '85%'} CONFIDENCE`;
      if (entryEl) entryEl.textContent = `₹${(sig.entryLtp || 0).toFixed(2)}`;
      if (targetEl) targetEl.textContent = `₹${(sig.target1 || 0).toFixed(2)}`;
      if (stopEl) stopEl.textContent = `₹${(sig.stopLoss || 0).toFixed(2)}`;

      // Sound notification on new signal
      if (config.soundAlerts && sig.contract && sig.contract !== lastSignalContract) {
        lastSignalContract = sig.contract;
        playAlertBeep();
      }
    }
  }

  // --- Render Chart Canvas Overlays & Price Axis Badges ---
  function renderChartPlots() {
    if (!svgOverlay || !marketState) return;

    // Detect TradingView main chart bounds & price range
    const bounds = getTradingViewChartBounds();
    if (!bounds || !bounds.visibleMinPrice || !bounds.visibleMaxPrice) {
      // Fallback: render anchored right badges based on percentage if exact axis coordinate calculation is adapting
      renderAxisBadgesRelative(bounds);
      return;
    }

    svgOverlay.setAttribute('width', window.innerWidth);
    svgOverlay.setAttribute('height', window.innerHeight);

    // Compute Y coordinate for price
    const getY = (price) => {
      const { top, height, visibleMinPrice, visibleMaxPrice } = bounds;
      const pct = (price - visibleMinPrice) / (visibleMaxPrice - visibleMinPrice);
      return top + height - (pct * height);
    };

    let svgHtml = '';
    const spot = marketState.spot || 0;
    const chain = marketState.chain || [];
    let maxCeStrike = 0, maxCeOi = 0;
    let maxPeStrike = 0, maxPeOi = 0;

    chain.forEach(r => {
      if (r.ce?.oi > maxCeOi) { maxCeOi = r.ce.oi; maxCeStrike = r.strike; }
      if (r.pe?.oi > maxPeOi) { maxPeOi = r.pe.oi; maxPeStrike = r.strike; }
    });

    const maxPain = marketState.derivatives?.maxPain || 0;
    const atmStrike = marketState.derivatives?.atmStrike || 0;
    const sig = marketState.signal;

    if (config.showSharkLines) {
      // 1. Shark Call Resistance Line
      if (maxCeStrike) {
        const y = getY(maxCeStrike);
        if (y >= bounds.top && y <= bounds.top + bounds.height) {
          svgHtml += `<line x1="${bounds.left}" y1="${y}" x2="${bounds.left + bounds.width}" y2="${y}" class="tn-chart-line tn-line-shark-res" />`;
        }
      }

      // 2. Shark Put Support Line
      if (maxPeStrike) {
        const y = getY(maxPeStrike);
        if (y >= bounds.top && y <= bounds.top + bounds.height) {
          svgHtml += `<line x1="${bounds.left}" y1="${y}" x2="${bounds.left + bounds.width}" y2="${y}" class="tn-chart-line tn-line-shark-sup" />`;
        }
      }

      // 3. Max Pain Line
      if (maxPain) {
        const y = getY(maxPain);
        if (y >= bounds.top && y <= bounds.top + bounds.height) {
          svgHtml += `<line x1="${bounds.left}" y1="${y}" x2="${bounds.left + bounds.width}" y2="${y}" class="tn-chart-line tn-line-max-pain" />`;
        }
      }

      // 4. Signal TP and SL Lines
      if (sig && sig.spotTarget) {
        const y = getY(sig.spotTarget);
        if (y >= bounds.top && y <= bounds.top + bounds.height) {
          svgHtml += `<line x1="${bounds.left}" y1="${y}" x2="${bounds.left + bounds.width}" y2="${y}" class="tn-chart-line tn-line-tp" />`;
        }
      }
      if (sig && sig.spotStopLoss) {
        const y = getY(sig.spotStopLoss);
        if (y >= bounds.top && y <= bounds.top + bounds.height) {
          svgHtml += `<line x1="${bounds.left}" y1="${y}" x2="${bounds.left + bounds.width}" y2="${y}" class="tn-chart-line tn-line-sl" />`;
        }
      }
    }

    svgOverlay.innerHTML = svgHtml;
    renderAxisBadgesPrecise(bounds, getY, maxCeStrike, maxPeStrike, maxPain, atmStrike, sig);
  }

  // --- TradingView Price Axis Badges Rendering ---
  function renderAxisBadgesPrecise(bounds, getY, maxCe, maxPe, maxPain, atm, sig) {
    if (!axisBadgesContainer || !config.showAxisBadges) return;

    let badgesHtml = '';
    const spot = marketState.spot || 0;

    const addBadge = (price, label, cls) => {
      const y = getY(price);
      if (y >= bounds.top && y <= bounds.top + bounds.height) {
        badgesHtml += `
          <div class="tn-price-badge ${cls}" style="top:${y}px;">
            <span>${label}:</span> <b>${price}</b>
          </div>
        `;
      }
    };

    if (maxCe) addBadge(maxCe, '🦈 RES', 'shark-res');
    if (maxPe) addBadge(maxPe, '🦈 SUP', 'shark-sup');
    if (maxPain) addBadge(maxPain, '🎯 PAIN', 'max-pain');
    if (atm) addBadge(atm, '⚡ ATM', 'atm-strike');
    if (sig?.spotTarget) addBadge(sig.spotTarget, '🎯 TARGET', 'signal-tp');
    if (sig?.spotStopLoss) addBadge(sig.spotStopLoss, '🛑 SL', 'signal-sl');

    axisBadgesContainer.innerHTML = badgesHtml;
  }

  function renderAxisBadgesRelative(bounds) {
    if (!axisBadgesContainer || !config.showAxisBadges || !marketState) return;

    const chain = marketState.chain || [];
    let maxCe = 0, maxCeOi = 0;
    let maxPe = 0, maxPeOi = 0;
    chain.forEach(r => {
      if (r.ce?.oi > maxCeOi) { maxCeOi = r.ce.oi; maxCe = r.strike; }
      if (r.pe?.oi > maxPeOi) { maxPeOi = r.pe.oi; maxPe = r.strike; }
    });

    const maxPain = marketState.derivatives?.maxPain || 0;
    const atm = marketState.derivatives?.atmStrike || 0;
    const sig = marketState.signal;

    axisBadgesContainer.innerHTML = `
      <div class="tn-price-badge shark-res" style="top:18%;">
        <span>🦈 RES:</span> <b>${maxCe || '--'}</b>
      </div>
      <div class="tn-price-badge max-pain" style="top:38%;">
        <span>🎯 PAIN:</span> <b>${maxPain || '--'}</b>
      </div>
      <div class="tn-price-badge atm-strike" style="top:52%;">
        <span>⚡ ATM:</span> <b>${atm || '--'}</b>
      </div>
      <div class="tn-price-badge shark-sup" style="top:74%;">
        <span>🦈 SUP:</span> <b>${maxPe || '--'}</b>
      </div>
      ${sig?.spotTarget ? `<div class="tn-price-badge signal-tp" style="top:28%;"><span>🎯 TP:</span> <b>${sig.spotTarget}</b></div>` : ''}
      ${sig?.spotStopLoss ? `<div class="tn-price-badge signal-sl" style="top:84%;"><span>🛑 SL:</span> <b>${sig.spotStopLoss}</b></div>` : ''}
    `;
  }

  // --- Compact Option Chain Drawer Rendering ---
  function renderOptionDrawerRows() {
    const tbody = document.getElementById('tnDrawerBody');
    if (!tbody || !marketState || !marketState.chain) return;

    const spot = marketState.spot || 0;
    const atm = marketState.derivatives?.atmStrike || Math.round(spot / 50) * 50;
    
    // Pick 7 strikes around ATM
    const sorted = [...marketState.chain].sort((a, b) => Math.abs(a.strike - atm) - Math.abs(b.strike - atm));
    const selected = sorted.slice(0, 7).sort((a, b) => a.strike - b.strike);

    let html = '';
    selected.forEach(r => {
      const isAtm = r.strike === atm;
      html += `
        <tr class="${isAtm ? 'atm-row' : ''}">
          <td style="color:${r.ce?.oi >= 100 ? '#ff5500' : 'var(--tn-muted)'};font-weight:${r.ce?.oi >= 100 ? '900' : '400'};">${r.ce?.oi || 0} L</td>
          <td style="font-weight:700;">₹${(r.ce?.ltp || 0).toFixed(2)}</td>
          <td class="tn-drawer-strike" style="color:${isAtm ? 'var(--tn-gold)' : '#fff'};">${r.strike}${isAtm ? ' <span style="font-size:9px;">ATM</span>' : ''}</td>
          <td style="font-weight:700;">₹${(r.pe?.ltp || 0).toFixed(2)}</td>
          <td style="color:${r.pe?.oi >= 100 ? '#00e5ff' : 'var(--tn-muted)'};font-weight:${r.pe?.oi >= 100 ? '900' : '400'};">${r.pe?.oi || 0} L</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  // --- Helper: Read TradingView Chart Coordinates & Price Scales ---
  function getTradingViewChartBounds() {
    // Look for TradingView chart container
    const chartWidget = document.querySelector('div[class*="chart-container"]') || 
                        document.querySelector('div[class*="chart-gui-wrapper"]') ||
                        document.querySelector('td.chart-markup-table') ||
                        document.querySelector('.layout__area--center');

    if (!chartWidget) {
      return {
        left: 60,
        top: 50,
        width: window.innerWidth - 120,
        height: window.innerHeight - 100,
        visibleMinPrice: null,
        visibleMaxPrice: null
      };
    }

    const rect = chartWidget.getBoundingClientRect();

    // Try to extract min/max price from TradingView price axis labels
    const priceLabels = Array.from(document.querySelectorAll('div[class*="price-axis"] text, div[class*="priceAxis"] span, [data-name="legend-series-item"]'))
      .map(el => parseFloat(el.textContent.replace(/,/g, '').trim()))
      .filter(val => !isNaN(val) && val > 1000 && val < 100000);

    let minPrice = null;
    let maxPrice = null;
    if (priceLabels.length >= 2) {
      minPrice = Math.min(...priceLabels);
      maxPrice = Math.max(...priceLabels);
    } else if (marketState && marketState.spot) {
      // Extrapolate reasonable visible range around spot
      minPrice = marketState.spot - 400;
      maxPrice = marketState.spot + 400;
    }

    return {
      left: rect.left,
      top: rect.top,
      width: rect.width - 65, // exclude right price margin
      height: rect.height - 30, // exclude bottom time axis
      visibleMinPrice: minPrice,
      visibleMaxPrice: maxPrice
    };
  }

  function setupWindowResizeListener() {
    window.addEventListener('resize', () => {
      renderChartPlots();
    });
  }

  function playAlertBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
    } catch (e) {}
  }
})();
