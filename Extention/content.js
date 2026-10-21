// ==========================================================================
// TradeNifty Pro - TradingView Institutional Overlay Engine v1.2
// Dynamic Auto-Tracking, Zoom/Pan Synchronization & On-Chart Trade Plotter
// ==========================================================================

(() => {
  if (window.__TRADENIFTY_TV_INJECTED_V12__) return;
  window.__TRADENIFTY_TV_INJECTED_V12__ = true;

  // Suppress benign context invalidation errors during hot reload
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('Extension context invalidated')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  console.log('%c[TradeNifty Pro]%c TV Auto-Tracking & Position Engine Online', 'background:#00f0ff;color:#000;font-weight:bold;padding:2px 6px;border-radius:3px;', 'color:#00f0ff;font-weight:bold;');

  let config = {
    serverUrl: 'http://127.0.0.1:5000',
    showSharkLines: true,
    showOiBands: true,
    showSignalHud: true,
    showAxisBadges: true,
    showPositionBox: true,
    showOptionDrawer: false,
    refreshIntervalMs: 2500,
    soundAlerts: true
  };

  let marketState = null;
  let hudElement = null;
  let svgOverlay = null;
  let axisBadgesContainer = null;
  let positionLayer = null;
  let optionDrawerElement = null;
  let refreshTimer = null;
  let lastSignalContract = null;

  // Real-Time Scale Calibration State (y = m * price + c)
  let scaleCalibration = {
    m: null,
    c: null,
    lastUpdate: 0,
    nativeCoordinates: {}
  };

  // Initialize
  init();

  async function init() {
    await loadSettings();
    createOverlayDOM();
    setupDraggableHUD();
    setupTradingViewInteractionListeners();
    setupMainWorldMessageBridge();
    startDataSync();
    startAnimationTrackingLoop();
  }

  function isExtensionValid() {
    try {
      return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  function loadSettings() {
    return new Promise((resolve) => {
      if (!isExtensionValid()) {
        resolve();
        return;
      }
      try {
        chrome.runtime.sendMessage({ action: 'GET_SETTINGS' }, (res) => {
          if (chrome.runtime?.lastError) {
            resolve();
            return;
          }
          if (res && res.success && res.settings) {
            config = { ...config, ...res.settings };
          }
          resolve();
        });
      } catch (e) {
        resolve();
      }
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

    // 3. Auto-Drawn Position Box Layer (TradingView Native Style)
    if (!document.getElementById('tradenifty-position-layer')) {
      positionLayer = document.createElement('div');
      positionLayer.id = 'tradenifty-position-layer';
      document.body.appendChild(positionLayer);
    }

    // 4. Floating HUD Box
    if (!document.getElementById('tradenifty-tv-hud')) {
      hudElement = document.createElement('div');
      hudElement.id = 'tradenifty-tv-hud';
      
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
            <button class="tn-btn-toggle active" id="tnTglPosBox">Trade Box: ON</button>
            <button class="tn-btn-toggle active" id="tnTglBadges">Axis: ON</button>
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
        renderAllChartOverlays();
      });

      document.getElementById('tnTglPosBox')?.addEventListener('click', (e) => {
        config.showPositionBox = !config.showPositionBox;
        e.target.classList.toggle('active', config.showPositionBox);
        e.target.textContent = `Trade Box: ${config.showPositionBox ? 'ON' : 'OFF'}`;
        if (positionLayer) {
          positionLayer.style.display = config.showPositionBox ? 'block' : 'none';
        }
        renderAllChartOverlays();
      });

      document.getElementById('tnTglBadges')?.addEventListener('click', (e) => {
        config.showAxisBadges = !config.showAxisBadges;
        e.target.classList.toggle('active', config.showAxisBadges);
        e.target.textContent = `Axis: ${config.showAxisBadges ? 'ON' : 'OFF'}`;
        if (axisBadgesContainer) {
          axisBadgesContainer.style.display = config.showAxisBadges ? 'block' : 'none';
        }
        renderAllChartOverlays();
      });
    }

    // 5. Compact Option Chain Drawer
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
          <tbody id="tnDrawerBody"></tbody>
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
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;

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
        try {
          localStorage.setItem('__tn_tv_hud_pos', JSON.stringify({
            x: hudElement.offsetLeft,
            y: hudElement.offsetTop
          }));
        } catch (err) {}
      }
    }
  }

  // --- Real-Time Data Sync ---
  function startDataSync() {
    fetchData();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fetchData, config.refreshIntervalMs);
  }

  async function fetchData() {
    const url = `${config.serverUrl.replace(/\/+$/, '')}/api/market-data`;

    // 1. Direct fetch attempt for zero latency and extension-context-invalidation immunity
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        marketState = data;
        updateHUD();
        requestNativePriceCoordinates();
        renderAllChartOverlays();
        renderOptionDrawerRows();
        setConnectionStatus(true);
        return;
      }
    } catch (e) {}

    // 2. Extension background worker fallback
    if (!isExtensionValid()) {
      if (refreshTimer) clearInterval(refreshTimer);
      return;
    }

    try {
      chrome.runtime.sendMessage({
        action: 'FETCH_MARKET_DATA',
        serverUrl: config.serverUrl
      }, (response) => {
        if (chrome.runtime?.lastError) {
          setConnectionStatus(false);
          return;
        }
        if (response && response.success && response.data) {
          marketState = response.data;
          updateHUD();
          requestNativePriceCoordinates();
          renderAllChartOverlays();
          renderOptionDrawerRows();
          setConnectionStatus(true);
        } else {
          if (response && response.fallbackData) {
            marketState = response.fallbackData;
            updateHUD();
            renderAllChartOverlays();
          }
          setConnectionStatus(false);
        }
      });
    } catch (err) {
      if (!isExtensionValid() && refreshTimer) {
        clearInterval(refreshTimer);
      }
    }
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

  // --- Message Bridge to inject.js (MAIN World) ---
  function setupMainWorldMessageBridge() {
    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data) return;

      if (event.data.type === 'TN_TV_PRICES_RESULT') {
        const results = event.data.results || [];
        results.forEach(item => {
          scaleCalibration.nativeCoordinates[item.price] = item.y;
        });
        scaleCalibration.lastUpdate = Date.now();
        renderAllChartOverlays();
      }

      if (event.data.type === 'TN_TV_CHART_INTERACTION') {
        calibratePriceScale();
        renderAllChartOverlays();
      }
    });
  }

  function requestNativePriceCoordinates() {
    if (!marketState) return;

    const pricesToQuery = [];
    if (marketState.spot) pricesToQuery.push(marketState.spot);
    if (marketState.derivatives?.maxPain) pricesToQuery.push(marketState.derivatives.maxPain);
    if (marketState.derivatives?.atmStrike) pricesToQuery.push(marketState.derivatives.atmStrike);

    const chain = marketState.chain || [];
    chain.forEach(r => {
      if (r.strike) pricesToQuery.push(r.strike);
    });

    const sig = marketState.signal;
    if (sig) {
      if (sig.spotStopLoss) pricesToQuery.push(sig.spotStopLoss);
      if (sig.spotTarget) pricesToQuery.push(sig.spotTarget);
      if (sig.strike) pricesToQuery.push(sig.strike);
    }

    window.postMessage({
      type: 'TN_CALC_TV_PRICES',
      prices: [...new Set(pricesToQuery)]
    }, '*');
  }

  // --- Dynamic TradingView Scale Resolver (Continuous Calibrator) ---
  function setupTradingViewInteractionListeners() {
    // Listen to wheel (zoom) and pointer (drag/pan) across document
    window.addEventListener('wheel', () => {
      calibratePriceScale();
      renderAllChartOverlays();
    }, { passive: true });

    ['pointerdown', 'pointermove', 'pointerup', 'touchmove'].forEach(evt => {
      window.addEventListener(evt, () => {
        calibratePriceScale();
        renderAllChartOverlays();
      }, { passive: true });
    });

    window.addEventListener('resize', () => {
      calibratePriceScale();
      renderAllChartOverlays();
    });
  }

  function startAnimationTrackingLoop() {
    let lastM = null;
    let lastC = null;

    function loop() {
      calibratePriceScale();
      if (scaleCalibration.m !== lastM || scaleCalibration.c !== lastC) {
        lastM = scaleCalibration.m;
        lastC = scaleCalibration.c;
        renderAllChartOverlays();
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // Calibrate y = m * price + c from visible TradingView DOM scale elements
  function calibratePriceScale() {
    // 1. Check if we have native coordinates from inject.js
    const nativeEntries = Object.entries(scaleCalibration.nativeCoordinates);
    if (nativeEntries.length >= 2) {
      const p1 = parseFloat(nativeEntries[0][0]);
      const y1 = nativeEntries[0][1];
      const p2 = parseFloat(nativeEntries[1][0]);
      const y2 = nativeEntries[1][1];
      if (Math.abs(p2 - p1) > 20 && Math.abs(y2 - y1) > 5) {
        scaleCalibration.m = (y2 - y1) / (p2 - p1);
        scaleCalibration.c = y1 - (scaleCalibration.m * p1);
        return;
      }
    }

    // 2. High-precision DOM scanning of TradingView's right price scale
    const priceAxisContainer = document.querySelector('table.chart-markup-table tr td:last-child') ||
                               document.querySelector('div[class*="price-axis"]') ||
                               document.querySelector('div[class*="priceAxis"]');

    if (!priceAxisContainer) return;

    const detectedPoints = [];

    // Scan all text elements in the price axis
    const elements = priceAxisContainer.querySelectorAll('div, span');
    elements.forEach(el => {
      const txt = (el.innerText || el.textContent || '').trim();
      if (!txt) return;

      // Extract price (e.g. "22,739.20" or "22800.00")
      const cleaned = txt.replace(/,/g, '');
      const match = cleaned.match(/\b(2[0-9]{4}(?:\.\d{1,2})?|[1-9][0-9]{4}(?:\.\d{1,2})?)\b/);
      if (match) {
        const price = parseFloat(match[1]);
        if (price >= 15000 && price <= 60000) {
          const rect = el.getBoundingClientRect();
          if (rect.height >= 8 && rect.height <= 45 && rect.top >= 40 && rect.bottom <= window.innerHeight - 30) {
            detectedPoints.push({
              price,
              y: rect.top + (rect.height / 2)
            });
          }
        }
      }
    });

    if (detectedPoints.length >= 2) {
      // Sort by price
      detectedPoints.sort((a, b) => a.price - b.price);
      const lowest = detectedPoints[0];
      const highest = detectedPoints[detectedPoints.length - 1];

      if (highest.price - lowest.price >= 50 && Math.abs(lowest.y - highest.y) >= 20) {
        scaleCalibration.m = (highest.y - lowest.y) / (highest.price - lowest.price);
        scaleCalibration.c = lowest.y - (scaleCalibration.m * lowest.price);
        scaleCalibration.lastUpdate = Date.now();
      }
    }
  }

  // Calculate pixel Y coordinate for any given price with auto-tracking
  function priceToScreenY(price, bounds) {
    if (scaleCalibration.m !== null && scaleCalibration.c !== null) {
      return (scaleCalibration.m * price) + scaleCalibration.c;
    }

    // Fallback: estimate within chart bounds if scale not yet calibrated
    if (marketState && marketState.spot && bounds) {
      const halfRange = 350;
      const minP = marketState.spot - halfRange;
      const maxP = marketState.spot + halfRange;
      const pct = (price - minP) / (maxP - minP);
      return bounds.top + bounds.height - (pct * bounds.height);
    }

    return null;
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
    let maxCeStrike = 0, maxCeOi = 0;
    let maxPeStrike = 0, maxPeOi = 0;

    chain.forEach(r => {
      if (r.ce?.oi > maxCeOi) { maxCeOi = r.ce.oi; maxCeStrike = r.strike; }
      if (r.pe?.oi > maxPeOi) { maxPeOi = r.pe.oi; maxPeStrike = r.strike; }
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

      if (config.soundAlerts && sig.contract && sig.contract !== lastSignalContract) {
        lastSignalContract = sig.contract;
        playAlertBeep();
      }
    }
  }

  // --- Render Chart Overlays: Ray Lines, Position Box, Axis Badges ---
  function renderAllChartOverlays() {
    if (!marketState) return;

    const bounds = getTradingViewChartBounds();
    if (!bounds) return;

    renderChartRayLines(bounds);
    renderAutoPositionBox(bounds);
    renderAxisStickyBadges(bounds);
  }

  // 1. Draw In-Chart Ray Lines & In-Chart Labels
  function renderChartRayLines(bounds) {
    if (!svgOverlay) return;

    svgOverlay.setAttribute('width', window.innerWidth);
    svgOverlay.setAttribute('height', window.innerHeight);

    if (!config.showSharkLines) {
      svgOverlay.innerHTML = '';
      return;
    }

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

    let svgHtml = '';
    const lineX1 = bounds.left;
    const lineX2 = bounds.left + bounds.width;

    const drawRay = (price, cls, labelTxt, labelCls) => {
      const y = priceToScreenY(price, bounds);
      if (y !== null && y >= bounds.top && y <= bounds.top + bounds.height) {
        svgHtml += `
          <line x1="${lineX1}" y1="${y}" x2="${lineX2}" y2="${y}" class="tn-chart-line ${cls}" />
          <g transform="translate(${lineX1 + 15}, ${y})">
            <rect x="0" y="-10" width="${labelTxt.length * 6.5 + 16}" height="20" rx="4" fill="rgba(8,12,22,0.85)" stroke="currentColor" class="${labelCls}" stroke-width="1"></rect>
            <text x="8" y="4" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#fff">${labelTxt}</text>
          </g>
        `;
      }
    };

    if (maxCeStrike) drawRay(maxCeStrike, 'tn-line-shark-res', `🦈 SHARK RES: ${maxCeStrike} (${maxCeOi}L CE)`, 'tn-shark-wall-ce');
    if (maxPeStrike) drawRay(maxPeStrike, 'tn-line-shark-sup', `🦈 SHARK SUP: ${maxPeStrike} (${maxPeOi}L PE)`, 'tn-shark-support-pe');
    if (maxPain) drawRay(maxPain, 'tn-line-max-pain', `🎯 MAX PAIN: ${maxPain}`, 'max-pain');
    if (atmStrike) drawRay(atmStrike, 'tn-line-atm', `⚡ ATM STRIKE: ${atmStrike}`, 'atm');

    svgOverlay.innerHTML = svgHtml;
  }

  // 2. Auto-Drawn Long / Short Position Box on Chart
  function renderAutoPositionBox(bounds) {
    if (!positionLayer) return;

    if (!config.showPositionBox || !marketState.signal) {
      positionLayer.innerHTML = '';
      return;
    }

    const sig = marketState.signal;
    const isPe = sig.actionType === 'BUY_PE' || (sig.action && sig.action.includes('PUT'));

    // Compute entry, target, and stop loss price levels
    const spot = marketState.spot || 22800;
    const entryPrice = sig.strike || spot;
    const targetPrice = sig.spotTarget || (isPe ? entryPrice - 200 : entryPrice + 200);
    const stopPrice = sig.spotStopLoss || (isPe ? entryPrice + 250 : entryPrice - 250);

    const yEntry = priceToScreenY(entryPrice, bounds);
    const yTarget = priceToScreenY(targetPrice, bounds);
    const yStop = priceToScreenY(stopPrice, bounds);

    if (yEntry === null || yTarget === null || yStop === null) {
      positionLayer.innerHTML = '';
      return;
    }

    // Anchor position box to recent candles (right section of chart canvas)
    const boxWidth = Math.min(320, Math.max(220, bounds.width * 0.32));
    const boxRight = bounds.left + bounds.width - 20;
    const boxLeft = boxRight - boxWidth;

    // Target Zone and Stop Loss Zone dimensions
    const targetTop = Math.min(yEntry, yTarget);
    const targetHeight = Math.abs(yTarget - yEntry);

    const stopTop = Math.min(yEntry, yStop);
    const stopHeight = Math.abs(yStop - yEntry);

    // Live P&L calculation
    const currentDiff = isPe ? (entryPrice - spot) : (spot - entryPrice);
    const liveProfitPerLot = currentDiff * 50;
    const isProfitable = liveProfitPerLot >= 0;
    const pnlSign = isProfitable ? '+' : '';

    positionLayer.innerHTML = `
      <div class="tn-pos-box" style="left:${boxLeft}px;width:${boxWidth}px;top:0;bottom:0;">
        <!-- Target Profit Zone (Green) -->
        <div class="tn-pos-zone target-zone" style="top:${targetTop}px;height:${Math.max(16, targetHeight)}px;">
          <span class="zone-label">🎯 TARGET: ${targetPrice.toFixed(1)}</span>
          <span class="zone-label" style="font-weight:900;">${isPe ? 'PE TP' : 'CE TP'}: ₹${(sig.target1 || 0).toFixed(2)} (+35%)</span>
        </div>

        <!-- Stop Loss Zone (Red) -->
        <div class="tn-pos-zone stop-zone" style="top:${stopTop}px;height:${Math.max(16, stopHeight)}px;">
          <span class="zone-label">🛑 STOP LOSS: ${stopPrice.toFixed(1)}</span>
          <span class="zone-label" style="font-weight:900;">${isPe ? 'PE SL' : 'CE SL'}: ₹${(sig.stopLoss || 0).toFixed(2)} (-28%)</span>
        </div>

        <!-- Center Entry Banner -->
        <div class="tn-pos-entry-bar" style="top:${yEntry}px;">
          <div class="tn-entry-tag-left">
            <span class="tn-entry-pill ${isPe ? 'pe' : 'ce'}">${isPe ? '🔻 BUY PUT' : '🔺 BUY CALL'}</span>
            <span>${sig.contract || 'NIFTY CONTRACT'}</span>
          </div>
          <div class="tn-live-pnl-pill ${isProfitable ? '' : 'neg'}">
            ${pnlSign}₹${liveProfitPerLot.toFixed(0)} (${pnlSign}${currentDiff.toFixed(1)} pts)
          </div>
        </div>
      </div>
    `;
  }

  // 3. Render Right Price Axis Sticky Badges
  function renderAxisStickyBadges(bounds) {
    if (!axisBadgesContainer || !config.showAxisBadges) return;

    let badgesHtml = '';
    const addStickyBadge = (price, label, cls) => {
      const y = priceToScreenY(price, bounds);
      if (y !== null && y >= bounds.top && y <= bounds.top + bounds.height) {
        badgesHtml += `
          <div class="tn-price-badge ${cls}" style="top:${y}px;">
            <span>${label}:</span> <b>${price}</b>
          </div>
        `;
      }
    };

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

    if (maxCe) addStickyBadge(maxCe, '🦈 RES', 'shark-res');
    if (maxPe) addStickyBadge(maxPe, '🦈 SUP', 'shark-sup');
    if (maxPain) addStickyBadge(maxPain, '🎯 PAIN', 'max-pain');
    if (atm) addStickyBadge(atm, '⚡ ATM', 'atm-strike');
    if (sig?.spotTarget) addStickyBadge(sig.spotTarget, '🎯 TP', 'signal-tp');
    if (sig?.spotStopLoss) addStickyBadge(sig.spotStopLoss, '🛑 SL', 'signal-sl');

    axisBadgesContainer.innerHTML = badgesHtml;
  }

  // --- Compact Option Chain Drawer Rendering ---
  function renderOptionDrawerRows() {
    const tbody = document.getElementById('tnDrawerBody');
    if (!tbody || !marketState || !marketState.chain) return;

    const spot = marketState.spot || 0;
    const atm = marketState.derivatives?.atmStrike || Math.round(spot / 50) * 50;
    
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

  // --- Helper: Read TradingView Chart Bounds ---
  function getTradingViewChartBounds() {
    const chartWidget = document.querySelector('div[class*="chart-container"]') || 
                        document.querySelector('div[class*="chart-gui-wrapper"]') ||
                        document.querySelector('table.chart-markup-table tr td:nth-child(2)') ||
                        document.querySelector('.layout__area--center');

    if (!chartWidget) {
      return {
        left: 60,
        top: 50,
        width: window.innerWidth - 120,
        height: window.innerHeight - 100
      };
    }

    const rect = chartWidget.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height - 30 // exclude bottom time axis
    };
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
