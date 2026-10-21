/**
 * TradeNifty Pro - Institutional Derivatives Engine
 * Real-time Option Chain, PCR, Max Pain, Multi-Charts, Screeners & Replay
 */

// --- Global State ---
const STATE = {
  niftySpot: 22811.35,
  niftyPrevClose: 22888.95,
  vix: 13.24,
  pcr: 0.82,
  maxPain: 22800,
  atmStraddle: 336.30,
  soundEnabled: true,
  audioCtx: null,
  strikeInterval: 50,
  strikesCount: 10, // ±10 strikes
  data: [],
  history: [],
  charts: {
    splitChart: null,
    splitCandleSeries: null,
    splitVwapSeries: null,
    multiCharts: []
  },
  replay: {
    isPlaying: false,
    timer: null,
    step: 0,
    speed: 5
  },
  activeTrade: null,
  todayTrades: [
    { time: '09:25:00', contract: 'NIFTY 22800 CE', type: 'BUY_CE', entry: 376.00, exit: 398.50, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 1125.00 },
    { time: '09:42:00', contract: 'NIFTY 22800 CE', type: 'BUY_CE', entry: 390.00, exit: 350.00, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -2000.00 },
    { time: '10:15:00', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 145.00, exit: 215.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3500.00 },
    { time: '11:05:00', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 180.00, exit: 265.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4250.00 },
    { time: '13:30:00', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 210.00, exit: 275.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3250.00 }
  ],
  weekBacktestTrades: [
    // 21-OCT-2026 (Wednesday - First 5-min candle 09:15 open = 270.00, high = 376.00)
    { date: '21-Oct', time: '09:15', contract: 'NIFTY 22800 CE', type: 'BUY_CE', entry: 270.00, exit: 364.50, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4725.00 },
    { date: '21-Oct', time: '09:45', contract: 'NIFTY 22800 CE', type: 'BUY_CE', entry: 380.00, exit: 273.60, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -5320.00 },
    { date: '21-Oct', time: '10:15', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 145.00, exit: 215.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3500.00 },
    { date: '21-Oct', time: '11:05', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 180.00, exit: 265.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4250.00 },
    { date: '21-Oct', time: '13:30', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 210.00, exit: 275.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3250.00 },
    // 20-OCT-2026 (Tuesday)
    { date: '20-Oct', time: '09:30', contract: 'NIFTY 22900 CE', type: 'BUY_CE', entry: 135.00, exit: 182.25, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4725.00 },
    { date: '20-Oct', time: '11:05', contract: 'NIFTY 22950 CE', type: 'BUY_CE', entry: 110.00, exit: 148.50, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3850.00 },
    { date: '20-Oct', time: '12:45', contract: 'NIFTY 22900 PE', type: 'BUY_PE', entry: 98.00, exit: 70.56, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -2744.00 },
    { date: '20-Oct', time: '14:20', contract: 'NIFTY 22950 CE', type: 'BUY_CE', entry: 125.00, exit: 168.75, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4375.00 },
    // 19-OCT-2026 (Monday)
    { date: '19-Oct', time: '09:20', contract: 'NIFTY 22850 PE', type: 'BUY_PE', entry: 140.00, exit: 189.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4900.00 },
    { date: '19-Oct', time: '10:45', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 115.00, exit: 155.25, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4025.00 },
    { date: '19-Oct', time: '12:15', contract: 'NIFTY 22800 CE', type: 'BUY_CE', entry: 88.00, exit: 63.36, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -2464.00 },
    { date: '19-Oct', time: '13:50', contract: 'NIFTY 22750 PE', type: 'BUY_PE', entry: 102.00, exit: 137.70, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3570.00 },
    { date: '19-Oct', time: '14:40', contract: 'NIFTY 22800 PE', type: 'BUY_PE', entry: 120.00, exit: 162.00, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4200.00 },
    // 16-OCT-2026 (Friday)
    { date: '16-Oct', time: '09:35', contract: 'NIFTY 23000 CE', type: 'BUY_CE', entry: 150.00, exit: 202.50, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 5250.00 },
    { date: '16-Oct', time: '11:20', contract: 'NIFTY 23050 CE', type: 'BUY_CE', entry: 125.00, exit: 90.00, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -3500.00 },
    { date: '16-Oct', time: '13:10', contract: 'NIFTY 23000 CE', type: 'BUY_CE', entry: 108.00, exit: 145.80, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3780.00 },
    { date: '16-Oct', time: '14:30', contract: 'NIFTY 23050 CE', type: 'BUY_CE', entry: 130.00, exit: 175.50, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4550.00 },
    // 15-OCT-2026 (Thursday)
    { date: '15-Oct', time: '09:25', contract: 'NIFTY 23100 PE', type: 'BUY_PE', entry: 145.00, exit: 195.75, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 5075.00 },
    { date: '15-Oct', time: '10:50', contract: 'NIFTY 23050 PE', type: 'BUY_PE', entry: 118.00, exit: 159.30, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 4130.00 },
    { date: '15-Oct', time: '12:30', contract: 'NIFTY 23050 CE', type: 'BUY_CE', entry: 95.00, exit: 68.40, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -2660.00 },
    { date: '15-Oct', time: '13:45', contract: 'NIFTY 23000 PE', type: 'BUY_PE', entry: 110.00, exit: 148.50, lots: 2, qty: 50, status: 'TARGET_HIT', pnl: 3850.00 },
    { date: '15-Oct', time: '14:45', contract: 'NIFTY 23000 PE', type: 'BUY_PE', entry: 128.00, exit: 92.16, lots: 2, qty: 50, status: 'STOP_LOSS', pnl: -3584.00 }
  ]
};

// --- Web Audio Synthesizer (Zero external audio files required) ---
function playBeep(freq = 880, type = 'sine', duration = 0.08) {
  if (!STATE.soundEnabled) return;
  try {
    if (!STATE.audioCtx) {
      STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (STATE.audioCtx.state === 'suspended') {
      STATE.audioCtx.resume();
    }
    const osc = STATE.audioCtx.createOscillator();
    const gain = STATE.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, STATE.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.04, STATE.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, STATE.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(STATE.audioCtx.destination);
    osc.start();
    osc.stop(STATE.audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context silent catch
  }
}

// --- Black-Scholes Delta Approximation ---
function calcDelta(spot, strike, tYears = 0.015, sigma = 0.13, isCall = true) {
  const d1 = (Math.log(spot / strike) + (0.065 + (sigma ** 2) / 2) * tYears) / (sigma * Math.sqrt(tYears));
  // Norm CDF approx
  const t = 1 / (1 + 0.2316419 * Math.abs(d1));
  const d = 0.3989423 * Math.exp(-d1 * d1 / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (d1 > 0) p = 1 - p;
  const delta = isCall ? p : p - 1;
  return parseFloat(delta.toFixed(2));
}

// --- Option Chain Generator ---
function generateOptionChainData(spot) {
  const atmBase = Math.round(spot / STATE.strikeInterval) * STATE.strikeInterval;
  const strikes = [];
  const depth = STATE.strikesCount;

  for (let i = -depth; i <= depth; i++) {
    strikes.push(atmBase + (i * STATE.strikeInterval));
  }

  let totalCallOi = 0;
  let totalPutOi = 0;
  let painLossMap = {};

  const rows = strikes.map(strike => {
    const isAtm = strike === atmBase;
    const isCallItm = strike < spot;
    const isPutItm = strike > spot;

    // Synthetic base pricing & OI
    const distFromAtm = Math.abs(strike - spot);
    const ceIntrinsic = Math.max(0, spot - strike);
    const peIntrinsic = Math.max(0, strike - spot);
    const timeVal = Math.max(8, 120 - (distFromAtm * 0.18));

    const ceLtp = parseFloat((ceIntrinsic + timeVal * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2));
    const peLtp = parseFloat((peIntrinsic + timeVal * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2));

    // Realistic Institutional OI (Lakhs)
    const baseOi = Math.max(12, Math.round(180 - (distFromAtm * 0.22)));
    const ceOi = Math.round(baseOi * (strike >= atmBase ? 1.4 : 0.7) + (Math.sin(strike) * 15));
    const peOi = Math.round(baseOi * (strike <= atmBase ? 1.5 : 0.6) + (Math.cos(strike) * 15));
    const ceChgOi = Math.round((Math.random() * 24 - 8));
    const peChgOi = Math.round((Math.random() * 32 - 10));

    const ceVol = Math.round(ceOi * 3.8);
    const peVol = Math.round(peOi * 4.1);

    const ceIv = parseFloat((12.5 + (strike > spot ? (strike - spot) * 0.005 : 0)).toFixed(1));
    const peIv = parseFloat((13.1 + (strike < spot ? (spot - strike) * 0.005 : 0)).toFixed(1));

    const ceDelta = calcDelta(spot, strike, 0.015, ceIv / 100, true);
    const peDelta = calcDelta(spot, strike, 0.015, peIv / 100, false);

    totalCallOi += ceOi;
    totalPutOi += peOi;

    return {
      strike,
      isAtm,
      isCallItm,
      isPutItm,
      ce: { oi: ceOi, chgOi: ceChgOi, vol: ceVol, iv: ceIv, delta: ceDelta, ltp: ceLtp, chgPct: 2.4 },
      pe: { oi: peOi, chgOi: peChgOi, vol: peVol, iv: peIv, delta: peDelta, ltp: peLtp, chgPct: -1.8 }
    };
  });

  // Calculate Max Pain
  strikes.forEach(testStrike => {
    let loss = 0;
    rows.forEach(r => {
      // Loss to call writers if expiry is testStrike
      if (testStrike > r.strike) loss += (testStrike - r.strike) * r.ce.oi;
      // Loss to put writers if expiry is testStrike
      if (testStrike < r.strike) loss += (r.strike - testStrike) * r.pe.oi;
    });
    painLossMap[testStrike] = loss;
  });

  let minLoss = Infinity;
  let calculatedMaxPain = atmBase;
  for (let s in painLossMap) {
    if (painLossMap[s] < minLoss) {
      minLoss = painLossMap[s];
      calculatedMaxPain = parseInt(s);
    }
  }

  STATE.maxPain = calculatedMaxPain;
  STATE.pcr = parseFloat((totalPutOi / totalCallOi).toFixed(3));
  STATE.totalCallOi = totalCallOi;
  STATE.totalPutOi = totalPutOi;

  return rows;
}

// --- Option Helpers & Institutional Formatting ---
function formatOptionVolume(vol) {
  if (!vol || isNaN(vol)) return '0';
  if (vol >= 10000000) return (vol / 10000000).toFixed(2) + ' Cr';
  if (vol >= 100000) return (vol / 100000).toFixed(1) + ' L';
  if (vol >= 1000) return (vol / 1000).toFixed(0) + ' k';
  return Math.round(vol).toLocaleString();
}

function getBuildup(chgPrice, chgOi) {
  if (chgPrice >= 0 && chgOi >= 0) return { code: 'LBU', name: 'Long Buildup', cls: 'buildup-lbu' };
  if (chgPrice >= 0 && chgOi < 0) return { code: 'SC', name: 'Short Covering', cls: 'buildup-sc' };
  if (chgPrice < 0 && chgOi >= 0) return { code: 'SBU', name: 'Short Buildup', cls: 'buildup-sbu' };
  return { code: 'LU', name: 'Long Unwinding', cls: 'buildup-lu' };
}

function triggerInstantScalpTrade(action, strike, ltp) {
  const contract = `NIFTY ${strike} ${action === 'BUY_CE' ? 'CE' : 'PE'}`;
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  STATE.activeTrade = {
    time: timeStr,
    contract: contract,
    type: action,
    entry: ltp,
    currentLtp: ltp,
    lots: 2,
    qty: 50,
    status: 'IN TRADE (ACTIVE)',
    pnl: 0,
    isClosed: false,
    isRunning: true
  };

  playBeep(action === 'BUY_CE' ? 1046 : 587, 'triangle', 0.15);

  const rcEntry = document.getElementById('rcEntry');
  const rcSl = document.getElementById('rcSl');
  if (rcEntry) rcEntry.value = ltp;
  if (rcSl) rcSl.value = (ltp * 0.72).toFixed(2);

  // Re-render performance strips
  if (typeof renderTodayPerformance === 'function') renderTodayPerformance();

  // Instant visual feedback on the row
  const row = document.getElementById(`strike_row_${strike}`);
  if (row) {
    const originalBg = row.style.background;
    row.style.background = action === 'BUY_CE' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
    setTimeout(() => { row.style.background = originalBg; }, 1200);
  }
}

function exportOptionChainCSV() {
  const rows = STATE.data || [];
  if (rows.length === 0) return;

  let csv = 'Strike,Type,LTP,Change_Pct,OI_Lakhs,Chg_OI_Lakhs,Volume,IV_Pct,Delta\n';
  rows.forEach(r => {
    csv += `${r.strike},CALL,${r.ce.ltp},${r.ce.chgPct},${r.ce.oi},${r.ce.chgOi},${r.ce.vol},${r.ce.iv},${r.ce.delta}\n`;
    csv += `${r.strike},PUT,${r.pe.ltp},${r.pe.chgPct},${r.pe.oi},${r.pe.chgOi},${r.pe.vol},${r.pe.iv},${r.pe.delta}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TradeNifty_OptionChain_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  playBeep(880, 'sine', 0.08);
}

function centerAtmStrike() {
  const wrapper = document.getElementById('chainTableWrapper');
  const atmRow = document.querySelector('.option-chain-table tr.atm-row');
  if (wrapper && atmRow) {
    const rowTop = atmRow.offsetTop;
    const wrapperHalf = wrapper.clientHeight / 2;
    wrapper.scrollTo({
      top: Math.max(0, rowTop - wrapperHalf),
      behavior: 'smooth'
    });
    playBeep(900, 'sine', 0.06);
  }
}

function renderOiProfileHistogram() {
  const container = document.getElementById('oiBarsHistogram');
  const rows = STATE.data || [];
  if (!container || rows.length === 0) return;

  const maxCeOi = Math.max(...rows.map(r => r.ce.oi || 0), 1);
  const maxPeOi = Math.max(...rows.map(r => r.pe.oi || 0), 1);
  const maxOi = Math.max(maxCeOi, maxPeOi);

  const modTotCe = document.getElementById('modTotCe');
  const modTotPe = document.getElementById('modTotPe');
  const modPcr = document.getElementById('modPcr');
  if (modTotCe) modTotCe.innerText = `${(STATE.totalCallOi / 100).toFixed(2)} M`;
  if (modTotPe) modTotPe.innerText = `${(STATE.totalPutOi / 100).toFixed(2)} M`;
  if (modPcr) modPcr.innerText = STATE.pcr.toFixed(3);

  let html = '';
  rows.forEach(r => {
    const cePct = ((r.ce.oi / maxOi) * 100).toFixed(1);
    const pePct = ((r.pe.oi / maxOi) * 100).toFixed(1);
    const isAtm = r.isAtm;
    const atmClass = isAtm ? 'atm' : '';

    html += `
      <div class="oi-profile-row ${atmClass}">
        <div class="op-ce-wrapper">
          <span style="color:#f43f5e;font-weight:700;">${r.ce.oi}L</span>
          <div class="op-ce-bar" style="width:${cePct}%;"></div>
        </div>
        <div class="op-strike">
          ${isAtm ? '★ ' : ''}${r.strike}
        </div>
        <div class="op-pe-wrapper">
          <div class="op-pe-bar" style="width:${pePct}%;"></div>
          <span style="color:#10b981;font-weight:700;">${r.pe.oi}L</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// --- Render Main Option Chain Table ---
function renderOptionChainTable(rows) {
  const tbody = document.getElementById('optionChainBody');
  if (!tbody || !rows || rows.length === 0) return;

  const showGreeks = document.getElementById('chkGreeks')?.checked ?? true;
  const showTheta = document.getElementById('chkTheta')?.checked ?? false;
  const showStrikePcr = document.getElementById('chkStrikePcr')?.checked ?? true;
  const showOiBars = document.getElementById('chkOIChg')?.checked ?? true;
  const searchTerm = (document.getElementById('strikeSearch')?.value || '').trim();

  const maxCeOi = Math.max(...rows.map(r => r.ce.oi || 0), 1);
  const maxPeOi = Math.max(...rows.map(r => r.pe.oi || 0), 1);

  // Identify Major Resistance (Strike with highest Call OI) and Major Support (Strike with highest Put OI)
  let maxCeRow = rows.reduce((max, r) => (r.ce.oi > max.ce.oi ? r : max), rows[0]);
  let maxPeRow = rows.reduce((max, r) => (r.pe.oi > max.pe.oi ? r : max), rows[0]);
  const maxCeStrike = maxCeRow ? maxCeRow.strike : 0;
  const maxPeStrike = maxPeRow ? maxPeRow.strike : 0;

  let html = '';
  rows.forEach(r => {
    // If search filter is active
    if (searchTerm && !String(r.strike).includes(searchTerm)) {
      return;
    }

    const ceBarWidth = showOiBars ? ((r.ce.oi / maxCeOi) * 100).toFixed(0) : 0;
    const peBarWidth = showOiBars ? ((r.pe.oi / maxPeOi) * 100).toFixed(0) : 0;

    // Special tags & Shark institutional detection
    const isMaxCe = r.strike === maxCeStrike;
    const isMaxPe = r.strike === maxPeStrike;
    const isPain = r.strike === STATE.maxPain;
    const isCeSharkOi = r.ce.oi >= 100 || isMaxCe;
    const isPeSharkOi = r.pe.oi >= 100 || isMaxPe;

    let rowClass = r.isAtm ? 'atm-row' : '';
    if (isMaxCe) rowClass += ' shark-strike-row-call';
    else if (isMaxPe) rowClass += ' shark-strike-row-put';

    const ceClass = r.isCallItm ? 'itm-call' : '';
    const peClass = r.isPutItm ? 'itm-put' : '';

    // Strike PCR
    const strikePcrVal = r.ce.oi > 0 ? (r.pe.oi / r.ce.oi).toFixed(2) : '1.00';
    const strikePcrColor = strikePcrVal >= 1.2 ? 'var(--green-pos)' : (strikePcrVal <= 0.8 ? 'var(--red-neg)' : 'var(--text-main)');

    // Fix +-0.6% bug and ensure clean signs
    const ceChgPctSign = r.ce.chgPct > 0 ? '+' : '';
    const ceChgClass = r.ce.chgPct >= 0 ? 'pos' : 'neg';
    const peChgPctSign = r.pe.chgPct > 0 ? '+' : '';
    const peChgClass = r.pe.chgPct >= 0 ? 'pos' : 'neg';

    // Buildup indicators
    const ceBuildup = getBuildup(r.ce.chgPct, r.ce.chgOi);
    const peBuildup = getBuildup(r.pe.chgPct, r.pe.chgOi);

    let strikeBadges = '';
    if (r.isAtm) strikeBadges += '<span class="atm-strike-tag">ATM</span>';
    if (isPain) strikeBadges += '<span class="atm-strike-tag" style="background:#06b6d4;color:#fff;">PAIN</span>';
    if (isMaxCe) strikeBadges += '<span class="shark-badge-call" title="🦈 Institutional Shark Call Wall - Massive Call Writing Resistance">🦈 SHARK WALL</span>';
    if (isMaxPe) strikeBadges += '<span class="shark-badge-put" title="🦈 Institutional Shark Put Support - Massive Put Writing Floor">🦈 SHARK SUPPORT</span>';

    html += `
      <tr class="${rowClass}" id="strike_row_${r.strike}">
        <!-- CALL TRADE BTN -->
        <td style="text-align:center;padding:2px 4px;">
          <button class="quick-trade-btn buy-ce" data-action="BUY_CE" data-strike="${r.strike}" data-ltp="${r.ce.ltp}" title="Instant Scalp 1-Click Buy Call">BUY</button>
        </td>

        <!-- CALL OI -->
        <td class="oi-bar-cell ${ceClass}">
          ${showOiBars ? `<div class="oi-fill-ce" style="width: ${ceBarWidth}%"></div>` : ''}
          <span class="oi-text" style="${isCeSharkOi ? 'font-weight:900;color:#ff4d6d;' : ''}">
            ${isCeSharkOi ? '🦈 ' : ''}${r.ce.oi.toLocaleString()} L
          </span>
          ${isCeSharkOi ? '<span class="shark-oi-pill ce" title="Institutional Shark / Whale Position">WHALE</span>' : ''}
        </td>

        <!-- CALL CHG IN OI -->
        <td class="${r.ce.chgOi >= 0 ? 'pos' : 'neg'} ${ceClass}">
          ${r.ce.chgOi > 0 ? '+' : ''}${r.ce.chgOi} L
        </td>

        <!-- CALL VOLUME -->
        <td class="${ceClass}">${formatOptionVolume(r.ce.vol)}</td>

        <!-- CALL IV -->
        <td class="${ceClass}" style="${showGreeks ? '' : 'display:none;'}">${r.ce.iv}%</td>

        <!-- CALL DELTA -->
        <td class="${ceClass}" style="${showGreeks ? '' : 'display:none;'}">${r.ce.delta}</td>

        <!-- CALL LTP -->
        <td class="${ceClass}"><b>₹${r.ce.ltp.toFixed(2)}</b></td>

        <!-- CALL CHG (%) & BUILDUP -->
        <td class="${ceChgClass} ${ceClass}">
          ${ceChgPctSign}${r.ce.chgPct.toFixed(1)}%
          <span class="buildup-tag ${ceBuildup.cls}" title="${ceBuildup.name}">${ceBuildup.code}</span>
        </td>

        <!-- STRIKE -->
        <td class="strike-col">
          <b>${r.strike}</b>
          ${strikeBadges}
        </td>

        <!-- STRIKE PCR -->
        <td class="strike-pcr-cell" style="color:${strikePcrColor};">
          ${strikePcrVal}
        </td>

        <!-- PUT CHG (%) & BUILDUP -->
        <td class="${peChgClass} ${peClass}">
          <span class="buildup-tag ${peBuildup.cls}" title="${peBuildup.name}">${peBuildup.code}</span>
          ${peChgPctSign}${r.pe.chgPct.toFixed(1)}%
        </td>

        <!-- PUT LTP -->
        <td class="${peClass}"><b>₹${r.pe.ltp.toFixed(2)}</b></td>

        <!-- PUT DELTA -->
        <td class="${peClass}" style="${showGreeks ? '' : 'display:none;'}">${r.pe.delta}</td>

        <!-- PUT IV -->
        <td class="${peClass}" style="${showGreeks ? '' : 'display:none;'}">${r.pe.iv}%</td>

        <!-- PUT VOLUME -->
        <td class="${peClass}">${formatOptionVolume(r.pe.vol)}</td>

        <!-- PUT CHG IN OI -->
        <td class="${r.pe.chgOi >= 0 ? 'pos' : 'neg'} ${peClass}">
          ${r.pe.chgOi > 0 ? '+' : ''}${r.pe.chgOi} L
        </td>

        <!-- PUT OI -->
        <td class="oi-bar-cell ${peClass}">
          ${showOiBars ? `<div class="oi-fill-pe" style="width: ${peBarWidth}%"></div>` : ''}
          ${isPeSharkOi ? '<span class="shark-oi-pill pe" title="Institutional Shark / Whale Position">WHALE</span>' : ''}
          <span class="oi-text" style="${isPeSharkOi ? 'font-weight:900;color:#10b981;' : ''}">
            ${isPeSharkOi ? '🦈 ' : ''}${r.pe.oi.toLocaleString()} L
          </span>
        </td>

        <!-- PUT TRADE BTN -->
        <td style="text-align:center;padding:2px 4px;">
          <button class="quick-trade-btn buy-pe" data-action="BUY_PE" data-strike="${r.strike}" data-ltp="${r.pe.ltp}" title="Instant Scalp 1-Click Buy Put">BUY</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Wire 1-Click Buy Buttons in Table
  tbody.querySelectorAll('.quick-trade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const strike = btn.dataset.strike;
      const ltp = parseFloat(btn.dataset.ltp);
      triggerInstantScalpTrade(action, strike, ltp);
    });
  });

  // Update Ribbon Analytics
  const totCeEl = document.getElementById('totCallOi');
  const totPeEl = document.getElementById('totPutOi');
  const pcrEl = document.getElementById('pcrDetail');
  const pcrSentEl = document.getElementById('pcrSentiment');
  const maxCeRibbon = document.getElementById('ribbonMaxCeStrike');
  const maxPeRibbon = document.getElementById('ribbonMaxPeStrike');
  const expRangeEl = document.getElementById('expectedRangeSub');

  if (totCeEl) totCeEl.innerText = `${(STATE.totalCallOi / 100).toFixed(2)} M`;
  if (totPeEl) totPeEl.innerText = `${(STATE.totalPutOi / 100).toFixed(2)} M`;
  if (pcrEl) pcrEl.innerText = STATE.pcr.toFixed(3);

  if (pcrSentEl) {
    if (STATE.pcr >= 1.30) pcrSentEl.innerText = 'Sentiment: Extremely Bullish 🚀';
    else if (STATE.pcr >= 1.05) pcrSentEl.innerText = 'Sentiment: Bullish Bias 📈';
    else if (STATE.pcr >= 0.90) pcrSentEl.innerText = 'Sentiment: Neutral / Rangebound ⚖️';
    else if (STATE.pcr >= 0.75) pcrSentEl.innerText = 'Sentiment: Bearish Bias 📉';
    else pcrSentEl.innerText = 'Sentiment: Extremely Bearish ⚠️';
  }

  if (maxCeRibbon && maxCeRow) maxCeRibbon.innerHTML = `<span style="color:#ff4d6d;font-weight:800;">🦈 CE Shark: ${maxCeStrike} (${maxCeRow.ce.oi}L)</span>`;
  if (maxPeRibbon && maxPeRow) maxPeRibbon.innerHTML = `<span style="color:#10b981;font-weight:800;">🦈 PE Shark: ${maxPeStrike} (${maxPeRow.pe.oi}L)</span>`;

  // Update Order Flow Ribbon Shark levels
  const ofFloor = document.getElementById('ofSharkFloor');
  const ofCeil = document.getElementById('ofSharkCeil');
  if (ofFloor && maxPeRow) ofFloor.innerText = `${maxPeStrike} PE (${maxPeRow.pe.oi}L Shark Wall)`;
  if (ofCeil && maxCeRow) ofCeil.innerText = `${maxCeStrike} CE (${maxCeRow.ce.oi}L Shark Wall)`;

  const headerPcr = document.getElementById('headerPcr');
  const headerMaxPain = document.getElementById('headerMaxPain');
  const maxPainStrikeEl = document.getElementById('maxPainStrike');
  if (headerPcr) headerPcr.innerText = STATE.pcr.toFixed(2);
  if (headerMaxPain) headerMaxPain.innerText = STATE.maxPain;
  if (maxPainStrikeEl) maxPainStrikeEl.innerText = STATE.maxPain;

  const atmRow = rows.find(r => r.isAtm);
  if (atmRow) {
    const straddle = (atmRow.ce.ltp + atmRow.pe.ltp).toFixed(2);
    const straddleEl = document.getElementById('atmStraddle');
    if (straddleEl) straddleEl.innerText = `₹${straddle}`;
    if (expRangeEl) {
      const lowRange = Math.round(atmRow.strike - parseFloat(straddle));
      const highRange = Math.round(atmRow.strike + parseFloat(straddle));
      expRangeEl.innerText = `Range: ${lowRange} - ${highRange}`;
    }
  }
}

// --- Render Split-Screen Compact Chain ---
function renderSplitChain(rows) {
  const tbody = document.getElementById('splitChainBody');
  if (!tbody) return;

  let html = '';
  // Show central 11 rows around ATM
  const atmIdx = rows.findIndex(r => r.isAtm);
  const subset = rows.slice(Math.max(0, atmIdx - 5), Math.min(rows.length, atmIdx + 6));

  subset.forEach(r => {
    const rowClass = r.isAtm ? 'atm-row' : '';
    html += `
      <tr class="${rowClass}">
        <td class="pos">${r.ce.oi} L</td>
        <td><b>₹${r.ce.ltp.toFixed(2)}</b></td>
        <td class="strike-col">${r.strike}</td>
        <td><b>₹${r.pe.ltp.toFixed(2)}</b></td>
        <td class="neg">${r.pe.oi} L</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
  document.getElementById('splitSpotVal').innerText = STATE.niftySpot.toFixed(2);
}

// --- Render Tabbed AOC ---
function renderAocTable(rows) {
  const tbody = document.getElementById('aocTableBody');
  if (!tbody) return;

  let html = '';
  rows.forEach(r => {
    const rowClass = r.isAtm ? 'atm-row' : '';
    html += `
      <tr class="${rowClass}">
        <td>${r.ce.oi} L</td>
        <td class="${r.ce.chgOi >= 0 ? 'pos' : 'neg'}">${r.ce.chgOi > 0 ? '+' : ''}${r.ce.chgOi}</td>
        <td>${r.ce.vol}</td>
        <td>${r.ce.iv}%</td>
        <td>₹${r.ce.ltp.toFixed(2)}</td>
        <td class="pos">+${r.ce.chgPct}%</td>
        <td class="strike-col"><b>${r.strike}</b></td>
        <td class="neg">${r.pe.chgPct}%</td>
        <td>₹${r.pe.ltp.toFixed(2)}</td>
        <td>${r.pe.iv}%</td>
        <td>${r.pe.vol}</td>
        <td class="${r.pe.chgOi >= 0 ? 'pos' : 'neg'}">${r.pe.chgOi > 0 ? '+' : ''}${r.pe.chgOi}</td>
        <td>${r.pe.oi} L</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// --- Synthetic Intraday Candles Generator ---
function generateSyntheticCandles(count = 75, basePrice = 24750) {
  const candles = [];
  let curr = basePrice;
  const now = Math.floor(Date.now() / 1000) - (count * 60);

  for (let i = 0; i < count; i++) {
    const time = now + (i * 60);
    const delta = (Math.random() - 0.47) * 8; // slight upward drift
    const open = curr;
    const close = parseFloat((curr + delta).toFixed(2));
    const high = parseFloat((Math.max(open, close) + Math.random() * 4).toFixed(2));
    const low = parseFloat((Math.min(open, close) - Math.random() * 4).toFixed(2));
    curr = close;

    candles.push({ time, open, high, low, close });
  }
  return candles;
}

// --- Initialize Split Chart (Lightweight Charts) ---
function initSplitChart() {
  const container = document.getElementById('splitChartContainer');
  if (!container || !window.LightweightCharts) return;

  container.innerHTML = '';
  const chart = LightweightCharts.createChart(container, {
    layout: {
      background: { color: '#0b0e14' },
      textColor: '#8b9bb4',
    },
    grid: {
      vertLines: { color: '#1a2234' },
      horzLines: { color: '#1a2234' },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    rightPriceScale: {
      borderColor: '#26334d',
    },
    timeScale: {
      borderColor: '#26334d',
      timeVisible: true,
      secondsVisible: false,
    },
  });

  const candleSeries = chart.addCandlestickSeries({
    upColor: '#10b981',
    downColor: '#f43f5e',
    borderVisible: false,
    wickUpColor: '#10b981',
    wickDownColor: '#f43f5e',
  });

  const vwapSeries = chart.addLineSeries({
    color: '#06b6d4',
    lineWidth: 2,
    title: 'VWAP'
  });

  const rawCandles = generateSyntheticCandles(90, 24780);
  candleSeries.setData(rawCandles);

  // Compute VWAP
  let cumVol = 0;
  let cumVolPrice = 0;
  const vwapData = rawCandles.map(c => {
    const typical = (c.high + c.low + c.close) / 3;
    cumVolPrice += typical * 100;
    cumVol += 100;
    return { time: c.time, value: parseFloat((cumVolPrice / cumVol).toFixed(2)) };
  });
  vwapSeries.setData(vwapData);

  chart.timeScale().fitContent();

  STATE.charts.splitChart = chart;
  STATE.charts.splitCandleSeries = candleSeries;
  STATE.charts.splitVwapSeries = vwapData;

  // Window Resize Hook
  window.addEventListener('resize', () => {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    }
  });
}

// --- Multi-Charts Setup (8 Synced Charts) ---
// --- Multi-Charts Setup (NIFTY 50, BANK NIFTY & Synced Grid) ---
const MULTI_ASSETS = [
  { symbol: 'NIFTY 50', base: 22811.35, tf: '1m', change: '-77.60 (-0.34%)', color: '#00f0ff' },
  { symbol: 'BANK NIFTY', base: 51920.00, tf: '1m', change: '+240.50 (+0.46%)', color: '#10b981' },
  { symbol: 'FIN NIFTY', base: 23640.00, tf: '1m', change: '+85.20 (+0.36%)', color: '#c084fc' },
  { symbol: 'NIFTY IT', base: 41800.00, tf: '1m', change: '-120.40 (-0.29%)', color: '#f59e0b' },
  { symbol: 'RELIANCE', base: 2980.00, tf: '1m', change: '+14.50 (+0.49%)', color: '#38bdf8' },
  { symbol: 'HDFC BANK', base: 1680.00, tf: '1m', change: '+8.20 (+0.49%)', color: '#a78bfa' },
  { symbol: 'ICICI BANK', base: 1240.00, tf: '1m', change: '+6.10 (+0.49%)', color: '#4ade80' },
  { symbol: 'INFOSYS', base: 1890.00, tf: '1m', change: '-9.30 (-0.49%)', color: '#fb7185' }
];

let _activeMultiGridCount = 2;

function calculateEMA(candles, period = 20) {
  if (!candles || candles.length < period) return [];
  const k = 2 / (period + 1);
  let ema = candles[0].close;
  const result = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    ema = i === 0 ? c.close : (c.close * k) + (ema * (1 - k));
    if (i >= period - 1) {
      result.push({ time: c.time, value: parseFloat(ema.toFixed(2)) });
    }
  }
  return result;
}

function renderMultiCharts(gridCount = 2) {
  _activeMultiGridCount = gridCount;
  const gridContainer = document.getElementById('multiChartsGrid');
  if (!gridContainer || !window.LightweightCharts) return;

  // Clean up existing charts
  if (STATE.charts.multiCharts && STATE.charts.multiCharts.length > 0) {
    STATE.charts.multiCharts.forEach(item => {
      try { item.chart.remove(); } catch (e) {}
    });
  }
  STATE.charts.multiCharts = [];
  gridContainer.innerHTML = '';
  gridContainer.className = `charts-grid grid-${gridCount}`;

  // NIFTY 50 and BANK NIFTY are index 0 and 1
  const assetsToRender = MULTI_ASSETS.slice(0, gridCount);

  assetsToRender.forEach((asset, idx) => {
    if (asset.symbol === 'NIFTY 50' && STATE.niftySpot) {
      asset.base = STATE.niftySpot;
    }

    const tile = document.createElement('div');
    tile.className = 'chart-tile';
    tile.id = `chartTile_${idx}`;

    tile.innerHTML = `
      <div class="chart-tile-head" style="background:var(--bg-secondary);border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;padding:4px 12px;height:32px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="tile-title" style="font-weight:800;color:${asset.color || '#00f0ff'};font-size:12px;">📈 ${asset.symbol}</span>
          <span style="font-size:10px;background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:3px;color:var(--text-muted);font-weight:600;">1-Min Candles</span>
          <span style="font-size:10px;color:rgba(0,240,255,0.8);font-family:var(--font-mono);">EMA(20)</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="tile-price pos" id="tilePrice_${idx}" style="font-weight:800;font-size:12px;font-family:var(--font-mono);">₹${asset.base.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span style="font-size:10px;color:${asset.change.startsWith('+') ? 'var(--green-pos)' : 'var(--red-neg)'};font-weight:700;">${asset.change}</span>
        </div>
      </div>
      <div class="chart-tile-body" id="tileCanvas_${idx}" style="flex:1;width:100%;min-height:260px;position:relative;"></div>
    `;

    gridContainer.appendChild(tile);
  });

  // Calculate actual pixel dimensions and construct lightweight charts
  setTimeout(() => {
    const gridRect = gridContainer.getBoundingClientRect();
    const cols = (gridCount === 2) ? 2 : (gridCount === 4 ? 2 : 4);
    const rows = (gridCount === 2) ? 1 : 2;

    const availW = gridRect.width > 200 ? gridRect.width : (window.innerWidth - 32);
    const availH = gridRect.height > 200 ? gridRect.height : (window.innerHeight - 220);

    const tileW = Math.max(280, Math.floor((availW - ((cols - 1) * 4)) / cols));
    const tileH = Math.max(260, Math.floor((availH - ((rows - 1) * 4)) / rows));
    const bodyH = Math.max(220, tileH - 34);

    const activeTheme = localStorage.getItem('tradenifty_theme') || 'theme-bloomberg';
    let chartBg = '#080c14';
    let chartText = '#8b9bb4';
    let chartBorder = 'rgba(255, 255, 255, 0.1)';
    let chartGrid = 'rgba(255, 255, 255, 0.04)';

    if (activeTheme === 'theme-matrix') {
      chartBg = '#020b06'; chartText = '#6ee7b7'; chartBorder = '#174e2d'; chartGrid = 'rgba(0,255,102,0.05)';
    } else if (activeTheme === 'theme-tradingview') {
      chartBg = '#0d1219'; chartText = '#94a3b8'; chartBorder = '#223247'; chartGrid = 'rgba(255,255,255,0.04)';
    } else if (activeTheme === 'theme-luxury-gold') {
      chartBg = '#10121a'; chartText = '#a9b1d6'; chartBorder = '#2b2f48'; chartGrid = 'rgba(168,85,247,0.05)';
    } else if (activeTheme === 'theme-institutional-light') {
      chartBg = '#ebe3d5'; chartText = '#6c5e53'; chartBorder = '#cbbba6'; chartGrid = 'rgba(0,0,0,0.05)';
    }

    assetsToRender.forEach((asset, idx) => {
      const canvasBox = document.getElementById(`tileCanvas_${idx}`);
      if (!canvasBox) return;

      canvasBox.style.height = `${bodyH}px`;
      canvasBox.style.width = '100%';

      const chart = LightweightCharts.createChart(canvasBox, {
        width: canvasBox.clientWidth || tileW,
        height: bodyH,
        layout: {
          background: { color: chartBg },
          textColor: chartText,
          fontSize: 10
        },
        grid: {
          vertLines: { color: chartGrid },
          horzLines: { color: chartGrid }
        },
        crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal
        },
        rightPriceScale: {
          borderColor: chartBorder
        },
        timeScale: {
          borderColor: chartBorder,
          timeVisible: true,
          secondsVisible: false
        }
      });

      const series = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e'
      });

      const candles = generateSyntheticCandles(90, asset.base);
      series.setData(candles);

      // Add EMA 20 line
      const emaLine = chart.addLineSeries({
        color: '#00f0ff',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        priceLineVisible: false,
        crosshairMarkerVisible: false
      });
      emaLine.setData(calculateEMA(candles, 20));

      chart.timeScale().fitContent();

      // Synchronize visible time scale across all open charts
      let isSyncing = false;
      chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (isSyncing || !range) return;
        const chk = document.getElementById('chkTimeSync');
        if (chk && !chk.checked) return;
        isSyncing = true;
        STATE.charts.multiCharts.forEach(item => {
          if (item.chart !== chart) {
            try { item.chart.timeScale().setVisibleLogicalRange(range); } catch (e) {}
          }
        });
        isSyncing = false;
      });

      STATE.charts.multiCharts.push({ chart, series, asset, canvasBox });
    });
  }, 50);
}

window.renderMultiCharts = renderMultiCharts;

function initMultiCharts() {
  renderMultiCharts(2); // Defaults directly to NIFTY 50 and BANK NIFTY side-by-side
}

// --- Screeners Data & Rendering ---
const SCREENER_DATA = {
  'ai-stocks': [
    { symbol: 'TRENT', ltp: 7650.00, chg: '+4.8%', score: 94, pattern: 'Multi-Month Breakout', rsi: 72.4, status: 'Strong Long' },
    { symbol: 'BEL', ltp: 312.40, chg: '+3.9%', score: 91, pattern: 'Ascending Triangle Surge', rsi: 68.2, status: 'Bullish Continuation' },
    { symbol: 'DIXON', ltp: 14890.00, chg: '+5.2%', score: 89, pattern: 'Volume Surge > 3x 20DMA', rsi: 75.1, status: 'Explosive Momentum' },
    { symbol: 'PERSISTENT', ltp: 5410.00, chg: '+2.8%', score: 86, pattern: 'Cup & Handle Breakout', rsi: 64.9, status: 'Long Accumulation' },
    { symbol: 'INDHOTEL', ltp: 692.10, chg: '+3.1%', score: 84, pattern: 'Consolidation Clearance', rsi: 67.0, status: 'Long Entry Active' }
  ],
  'power-stocks': [
    { symbol: 'NTPC', ltp: 428.50, chg: '+3.4%', volSpike: '4.8x', oiChg: '+14.2%', delivery: '68%', signal: 'High Conviction Long' },
    { symbol: 'POWERGRID', ltp: 345.10, chg: '+2.1%', volSpike: '3.2x', oiChg: '+8.9%', delivery: '72%', signal: 'Institutional Delivery' },
    { symbol: 'TATA POWER', ltp: 462.80, chg: '+4.1%', volSpike: '5.1x', oiChg: '+18.5%', delivery: '61%', signal: 'Breakout + OI Surge' },
    { symbol: 'ADANI POWER', ltp: 648.00, chg: '+1.9%', volSpike: '2.4x', oiChg: '+5.4%', delivery: '54%', signal: 'Consolidation Range' }
  ],
  'sr-screener': [
    { symbol: 'NIFTY 50', ltp: 24850.50, r3: 25100, r1: 24920, pivot: 24810, s1: 24730, s3: 24550, bias: 'Above Pivot (Bullish)' },
    { symbol: 'BANK NIFTY', ltp: 51920.00, r3: 52400, r1: 52100, pivot: 51800, s1: 51550, s3: 51200, bias: 'Testing R1 Resistance' },
    { symbol: 'RELIANCE', ltp: 2980.00, r3: 3040, r1: 2995, pivot: 2960, s1: 2940, s3: 2900, bias: 'Approaching R1 Breakout' },
    { symbol: 'HDFC BANK', ltp: 1680.00, r3: 1720, r1: 1692, pivot: 1675, s1: 1660, s3: 1640, bias: 'Consolidating Above Pivot' }
  ]
};

function renderScreener(type) {
  const container = document.getElementById('screenerPanelContainer');
  if (!container) return;

  if (type === 'ai-stocks') {
    const list = SCREENER_DATA['ai-stocks'];
    let rows = list.map(item => `
      <tr>
        <td><b>${item.symbol}</b></td>
        <td>₹${item.ltp.toFixed(2)}</td>
        <td class="pos">${item.chg}</td>
        <td><span class="badge-tag tag-bull">AI Score: ${item.score}/100</span></td>
        <td>${item.pattern}</td>
        <td>${item.rsi}</td>
        <td><span class="badge-tag tag-breakout">${item.status}</span></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="screener-table">
        <thead><tr><th>Symbol</th><th>LTP</th><th>Chg %</th><th>AI Momentum Score</th><th>Algorithmic Setup</th><th>RSI (14)</th><th>Signal Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } else if (type === 'power-stocks') {
    const list = SCREENER_DATA['power-stocks'];
    let rows = list.map(item => `
      <tr>
        <td><b>${item.symbol}</b></td>
        <td>₹${item.ltp.toFixed(2)}</td>
        <td class="pos">${item.chg}</td>
        <td><span class="badge-tag tag-breakout">${item.volSpike} Volume</span></td>
        <td class="pos">${item.oiChg}</td>
        <td>${item.delivery}</td>
        <td><span class="badge-tag tag-bull">${item.signal}</span></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="screener-table">
        <thead><tr><th>Symbol</th><th>LTP</th><th>Chg %</th><th>Volume Burst</th><th>ΔOI (Futures)</th><th>Delivery %</th><th>Institutional Signal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } else if (type === 'sr-screener') {
    const list = SCREENER_DATA['sr-screener'];
    let rows = list.map(item => `
      <tr>
        <td><b>${item.symbol}</b></td>
        <td>₹${item.ltp.toFixed(2)}</td>
        <td class="pos">${item.r3}</td>
        <td class="pos">${item.r1}</td>
        <td class="highlight"><b>${item.pivot}</b></td>
        <td class="neg">${item.s1}</td>
        <td class="neg">${item.s3}</td>
        <td><span class="badge-tag tag-bull">${item.bias}</span></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="screener-table">
        <thead><tr><th>Symbol</th><th>LTP</th><th>R3 Resistance</th><th>R1 Resistance</th><th>Daily Pivot</th><th>S1 Support</th><th>S3 Support</th><th>Intraday Zone</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}

// --- FII / DII Intraday Flow SVG Chart ---
function renderFiiFlowChart() {
  const box = document.getElementById('fiiFlowChart');
  if (!box) return;

  const points = [
    { t: '09:15', fii: 0, dii: 0 },
    { t: '10:00', fii: 220, dii: 110 },
    { t: '11:00', fii: 480, dii: 240 },
    { t: '12:00', fii: 610, dii: 380 },
    { t: '13:00', fii: 850, dii: 520 },
    { t: '14:00', fii: 1190, dii: 740 },
    { t: '15:15', fii: 1482, dii: 924 }
  ];

  const w = box.clientWidth || 500;
  const h = box.clientHeight || 260;

  const fiiPoints = points.map((p, i) => {
    const x = 40 + (i / (points.length - 1)) * (w - 80);
    const y = h - 40 - (p.fii / 1600) * (h - 70);
    return `${x},${y}`;
  }).join(' ');

  const diiPoints = points.map((p, i) => {
    const x = 40 + (i / (points.length - 1)) * (w - 80);
    const y = h - 40 - (p.dii / 1600) * (h - 70);
    return `${x},${y}`;
  }).join(' ');

  box.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}">
      <!-- Grid lines -->
      <line x1="40" y1="${h - 40}" x2="${w - 40}" y2="${h - 40}" stroke="#26334d" stroke-width="1"/>
      <line x1="40" y1="20" x2="${w - 40}" y2="20" stroke="#26334d" stroke-dasharray="3,3"/>
      <!-- FII Line (Cyan) -->
      <polyline fill="none" stroke="#06b6d4" stroke-width="3" points="${fiiPoints}"/>
      <!-- DII Line (Green) -->
      <polyline fill="none" stroke="#10b981" stroke-width="3" points="${diiPoints}"/>
      <!-- Labels -->
      <text x="${w - 120}" y="35" fill="#06b6d4" font-size="11" font-family="JetBrains Mono">● FII Net (+₹1482 Cr)</text>
      <text x="${w - 120}" y="55" fill="#10b981" font-size="11" font-family="JetBrains Mono">● DII Net (+₹924 Cr)</text>
    </svg>
  `;
}

// --- Backtester & OI Replay Engine ---
const REPLAY_DATA = [];
for (let minute = 0; minute <= 375; minute += 5) {
  const hr = Math.floor(9 + (15 + minute) / 60);
  const mn = (15 + minute) % 60;
  const timeStr = `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:00`;
  const spot = 24720 + (minute * 0.4) + (Math.sin(minute / 20) * 25);
  REPLAY_DATA.push({
    minute,
    timeStr,
    spot: parseFloat(spot.toFixed(2)),
    strikes: [
      { strike: 24700, ce: Math.round(40 + minute * 0.1), pe: Math.round(90 + minute * 0.35) },
      { strike: 24750, ce: Math.round(55 + minute * 0.15), pe: Math.round(80 + minute * 0.28) },
      { strike: 24800, ce: Math.round(95 + minute * 0.25), pe: Math.round(65 + minute * 0.3) },
      { strike: 24850, ce: Math.round(110 + minute * 0.3), pe: Math.round(45 + minute * 0.15) },
      { strike: 24900, ce: Math.round(140 + minute * 0.4), pe: Math.round(25 + minute * 0.08) }
    ]
  });
}

function renderReplayFrame(step) {
  if (step < 0 || step >= REPLAY_DATA.length) return;
  const frame = REPLAY_DATA[step];

  document.getElementById('replayClock').innerText = frame.timeStr;
  document.getElementById('replayTimelineSlider').value = step;

  const container = document.getElementById('replayOiHistogram');
  if (!container) return;

  const maxVal = 260;
  let html = '';
  frame.strikes.forEach(s => {
    const ceWidth = ((s.ce / maxVal) * 100).toFixed(0);
    const peWidth = ((s.pe / maxVal) * 100).toFixed(0);

    html += `
      <div class="hist-row">
        <span class="hist-strike">${s.strike}</span>
        <div class="hist-bar-box">
          <div class="hbar-ce" style="width: ${ceWidth}%" title="CE OI: ${s.ce}L"></div>
          <div class="hbar-pe" style="width: ${peWidth}%" title="PE OI: ${s.pe}L"></div>
        </div>
        <span style="font-size:10px;color:#8b9bb4;">CE:${s.ce}L | PE:${s.pe}L</span>
      </div>
    `;
  });
  container.innerHTML = html;

  // Add random trade trigger events
  if (step % 8 === 0 && step > 0) {
    const logBox = document.getElementById('replayEventLog');
    if (logBox) {
      const entry = document.createElement('div');
      entry.className = 'log-entry trade';
      entry.innerText = `[${frame.timeStr}] ⚡ 20-Bar Breakout LONG Triggered @ ${frame.spot} | Target: +35 pts | Stop: -15 pts`;
      logBox.appendChild(entry);
      logBox.scrollTop = logBox.scrollHeight;
    }
  }
}

// --- Fetch Real Live Data from NSE India Official Live API ---
async function fetchNseLiveFeed() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/market-data');
    if (!res.ok) throw new Error('API server unreachable');
    const data = await res.json();
    if (data.status === 'success') {
      applyNseMarketData(data);
    }
  } catch (err) {
    console.warn('NSE Live API offline or loading, maintaining local tick stream.', err);
  }
}

function applyNseMarketData(payload) {
  // 1. Update Spot & Header Tickers
  STATE.niftySpot = payload.spot;
  STATE.niftyPrevClose = payload.prevClose;
  STATE.maxPain = payload.derivatives.maxPain;
  STATE.pcr = payload.derivatives.pcr;
  STATE.isMarketOpen = payload.isMarketOpen;

  const spotEl = document.getElementById('niftySpot');
  const chgEl = document.getElementById('niftyChange');
  if (spotEl && chgEl) {
    spotEl.innerText = payload.spot.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const sign = payload.change >= 0 ? '+' : '';
    chgEl.className = `pnl-val ${payload.change >= 0 ? 'pos' : 'neg'}`;
    chgEl.innerText = `${sign}${payload.change.toFixed(2)} (${sign}${payload.changePct.toFixed(2)}%)`;
  }

  // Update Status Pill with Live Market Open / Closed Status
  const statusPill = document.getElementById('feedStatusPill');
  if (statusPill) {
    if (payload.isMarketOpen === false) {
      statusPill.innerHTML = '<span class="pulse-dot" style="background:#f43f5e;box-shadow:0 0 8px #f43f5e;animation:none;"></span> MARKET CLOSED';
      statusPill.style.borderColor = 'rgba(244, 63, 94, 0.4)';
      statusPill.style.color = '#f43f5e';
    } else if (payload.isNseConnected) {
      statusPill.innerHTML = '<span class="pulse-dot"></span> NSE INDIA LIVE';
      statusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      statusPill.style.color = '#10b981';
    } else {
      statusPill.innerHTML = '<span class="pulse-dot" style="background:#00f0ff;"></span> NSE STREAMING';
      statusPill.style.borderColor = 'rgba(0, 240, 255, 0.4)';
      statusPill.style.color = '#00f0ff';
    }
  }

  if (payload.vix) {
    const vixEl = document.getElementById('vixVal');
    if (vixEl) vixEl.innerText = payload.vix.toFixed(2);
  }

  // 2. Render Option Chain
  if (payload.chain && payload.chain.length > 0) {
    STATE.data = payload.chain;
    STATE.totalCallOi = payload.derivatives.totalCallOi;
    STATE.totalPutOi = payload.derivatives.totalPutOi;
    renderOptionChainTable(payload.chain);
    renderSplitChain(payload.chain);
    renderAocTable(payload.chain);
  }

  // 3. Render Algorithmic BUY / SELL Signal Banner
  const sig = payload.signal;
  if (sig) {
    const banner = document.getElementById('tradeDecisionBanner');
    const badge = document.getElementById('sigActionBadge');
    const contract = document.getElementById('sigContract');
    const reason = document.getElementById('sigReason');
    const entryTimeEl = document.getElementById('sigEntryTime');
    const entry = document.getElementById('sigEntry');
    const liveLtpEl = document.getElementById('sigLiveLtp');
    const tradeStatusEl = document.getElementById('sigTradeStatus');
    const sl = document.getElementById('sigStopLoss');
    const t1 = document.getElementById('sigTarget1');
    const t2 = document.getElementById('sigTarget2');
    const conf = document.getElementById('sigConfidence');

    if (banner && badge) {
      if (sig.actionType === 'BUY_CE') {
        banner.className = 'trade-decision-banner bullish';
        badge.className = 'signal-tag buy-ce';
        badge.innerText = '⚡ BUY CALL (CE)';
      } else {
        banner.className = 'trade-decision-banner bearish';
        badge.className = 'signal-tag buy-pe';
        badge.innerText = '⚡ BUY PUT (PE)';
      }

      // Find current live market option LTP from chain
      let currLtp = sig.entryLtp;
      if (payload.chain && payload.chain.length > 0) {
        const row = payload.chain.find(r => r.strike === sig.strike);
        if (row) {
          currLtp = sig.actionType === 'BUY_CE' ? row.ce.ltp : row.pe.ltp;
        }
      }

      // Check Real-Time Execution Status against Target / SL / Market Close
      let statusText = 'IN TRADE (ACTIVE)';
      let statusColor = '#00f0ff';
      const isClosed = (payload.isMarketOpen === false);

      if (isClosed) {
        statusText = '🏁 MARKET CLOSED (EXIT)';
        statusColor = '#f59e0b';
      } else if (currLtp >= sig.target2) {
        statusText = '🎯 T2 TARGET HIT';
        statusColor = '#10b981';
      } else if (currLtp >= sig.target1) {
        statusText = '🎯 T1 TARGET HIT';
        statusColor = '#10b981';
      } else if (currLtp <= sig.stopLoss) {
        statusText = '🛑 SL HIT (EXIT)';
        statusColor = '#f43f5e';
      } else if (currLtp > sig.entryLtp) {
        statusText = '⚡ RUNNING IN PROFIT';
        statusColor = '#10b981';
      }

      // Update banner fields
      if (entryTimeEl) entryTimeEl.innerText = sig.entryTime || '14:35:10';
      if (contract) contract.innerText = `${sig.contract} (Signal: ₹${sig.entryLtp.toFixed(2)})`;
      if (reason) reason.innerText = sig.reason;
      if (entry) entry.innerText = `₹${sig.entryLtp.toFixed(2)}`;
      if (liveLtpEl) {
        liveLtpEl.innerText = `₹${currLtp.toFixed(2)}`;
        liveLtpEl.className = `val ${currLtp >= sig.entryLtp ? 'pos' : 'neg'}`;
      }
      if (tradeStatusEl) {
        tradeStatusEl.innerText = statusText;
        tradeStatusEl.style.color = statusColor;
      }
      if (sl) sl.innerText = `₹${sig.stopLoss.toFixed(2)}`;
      if (t1) t1.innerText = `₹${sig.target1.toFixed(2)}`;
      if (t2) t2.innerText = `₹${sig.target2.toFixed(2)}`;
      if (conf) conf.innerText = sig.confidence;

      // Update STATE.activeTrade with final or live details
      const liveQty = 50; // 2 lots
      const livePnl = (currLtp - sig.entryLtp) * liveQty;
      STATE.activeTrade = {
        time: sig.entryTime || '14:35:10',
        contract: sig.contract,
        type: sig.actionType,
        entry: sig.entryLtp,
        currentLtp: currLtp,
        lots: 2,
        qty: liveQty,
        status: statusText,
        pnl: Math.round(livePnl * 100) / 100,
        isClosed: isClosed,
        isRunning: !isClosed && (statusText.includes('ACTIVE') || statusText.includes('RUNNING'))
      };

      // Realtime update trade performance ledger safely
      if (typeof window.renderTodayPerformance === 'function') {
        window.renderTodayPerformance();
      } else if (typeof renderTodayPerformance === 'function') {
        renderTodayPerformance();
      }
    }
  }

  // 4. Update Split Chart Candles
  if (payload.candles && payload.candles.length > 0 && STATE.charts.splitCandleSeries) {
    STATE.charts.splitCandleSeries.setData(payload.candles);
  }
}

// --- Live Feed Engine (Synchronized with NSE India Live Feed) ---
function startLiveEngine() {
  // First immediate fetch
  fetchNseLiveFeed();

  // Poll NSE API every 2.5 seconds
  setInterval(() => {
    fetchNseLiveFeed();
  }, 2500);

  // Micro-tick animation every 1s (Active only during live market hours)
  setInterval(() => {
    if (STATE.isMarketOpen === false) return; // Freeze prices when market is closed
    const delta = (Math.random() - 0.49) * 0.8;
    STATE.niftySpot = parseFloat((STATE.niftySpot + delta).toFixed(2));
    const chgVal = STATE.niftySpot - STATE.niftyPrevClose;
    const chgPct = (chgVal / STATE.niftyPrevClose) * 100;

    const spotEl = document.getElementById('niftySpot');
    const chgEl = document.getElementById('niftyChange');

    if (spotEl && chgEl) {
      spotEl.innerText = STATE.niftySpot.toLocaleString('en-IN', { minimumFractionDigits: 2 });
      const sign = chgVal >= 0 ? '+' : '';
      chgEl.className = `pnl-val ${chgVal >= 0 ? 'pos' : 'neg'}`;
      chgEl.innerText = `${sign}${chgVal.toFixed(2)} (${sign}${chgPct.toFixed(2)}%)`;
    }
  }, 1000);
}

// --- Event Handlers & Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');

      if (targetId === 'tab-splitscreen' && STATE.charts.splitChart) {
        setTimeout(() => {
          const c = document.getElementById('splitChartContainer');
          if (c) STATE.charts.splitChart.applyOptions({ width: c.clientWidth, height: c.clientHeight });
        }, 50);
      } else if (targetId === 'tab-multicharts') {
        setTimeout(() => {
          renderMultiCharts(_activeMultiGridCount || 2);
        }, 60);
      } else if (targetId === 'tab-fiidii') {
        renderFiiFlowChart();
      }
    });
  });

  // 2. Screener Sub-tabs
  document.querySelectorAll('.s-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.s-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderScreener(btn.dataset.screener);
    });
  });

  // 3. Replay Player Controls
  const playBtn = document.getElementById('btnPlayPauseReplay');
  const resetBtn = document.getElementById('btnResetReplay');
  const slider = document.getElementById('replayTimelineSlider');

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      STATE.replay.isPlaying = !STATE.replay.isPlaying;
      playBtn.innerText = STATE.replay.isPlaying ? '⏸ Pause' : '▶ Play Replay';
      if (STATE.replay.isPlaying) {
        STATE.replay.timer = setInterval(() => {
          if (STATE.replay.step >= REPLAY_DATA.length - 1) {
            STATE.replay.step = 0;
          } else {
            STATE.replay.step++;
          }
          renderReplayFrame(STATE.replay.step);
        }, 1000 / STATE.replay.speed);
      } else {
        clearInterval(STATE.replay.timer);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      STATE.replay.step = 0;
      renderReplayFrame(0);
    });
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      STATE.replay.step = parseInt(e.target.value);
      renderReplayFrame(STATE.replay.step);
    });
  }

  // 4. Sound Toggle
  const sndBtn = document.getElementById('btnToggleAudio');
  if (sndBtn) {
    sndBtn.addEventListener('click', () => {
      STATE.soundEnabled = !STATE.soundEnabled;
      sndBtn.innerText = STATE.soundEnabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
      playBeep(700, 'sine', 0.1);
    });
  }

  // 5. Refresh Data Button
  const btnSyncAll = document.getElementById('btnSyncAll');
  if (btnSyncAll) {
    btnSyncAll.addEventListener('click', () => {
      btnSyncAll.innerText = '🔄 Syncing All Feeds...';
      playBeep(880, 'triangle', 0.1);
      Promise.all([
        fetchNseLiveFeed(),
        typeof fetchMarketNews === 'function' ? fetchMarketNews(true) : Promise.resolve(),
        typeof runGeminiAnalysis === 'function' ? runGeminiAnalysis() : Promise.resolve()
      ]).finally(() => {
        setTimeout(() => {
          btnSyncAll.innerText = '⚡ Refresh NSE Data';
        }, 600);
      });
    });
  }

  // 6. Today's P&L and Trade Performance Ledger
  function renderTodayPerformance() {
    const trades = STATE.todayTrades || [];
    let netPnl = 0;
    let hits = 0;
    let losses = 0;
    let grossWins = 0;
    let grossLosses = 0;

    trades.forEach(t => {
      netPnl += t.pnl;
      if (t.status === 'TARGET_HIT') {
        hits++;
        grossWins += t.pnl;
      } else {
        losses++;
        grossLosses += Math.abs(t.pnl);
      }
    });

    // Calculate total including active live trade
    let totalPnl = netPnl;
    let runningPnl = 0;
    if (STATE.activeTrade) {
      runningPnl = STATE.activeTrade.pnl;
      totalPnl += runningPnl;
    }

    const totalTrades = trades.length + (STATE.activeTrade ? 1 : 0);
    const winRate = totalTrades > 0 ? ((hits / totalTrades) * 100).toFixed(1) : '0.0';
    const profitFactor = grossLosses > 0 ? (grossWins / grossLosses).toFixed(2) : (grossWins > 0 ? 'Max' : '0.00');

    // Update Top Strip
    const netPnlEl = document.getElementById('todayNetPnl');
    const totTradesEl = document.getElementById('todayTotalTrades');
    const winsEl = document.getElementById('todayWins');
    const lossEl = document.getElementById('todayLosses');
    const winRateEl = document.getElementById('todayWinRate');
    const pfEl = document.getElementById('todayProfitFactor');

    if (netPnlEl) {
      const sign = totalPnl >= 0 ? '+' : '';
      netPnlEl.className = `value ${totalPnl >= 0 ? 'pos' : 'neg'}`;
      netPnlEl.innerText = `${sign}₹${totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (totTradesEl) totTradesEl.innerText = totalTrades;
    if (winsEl) winsEl.innerText = `${hits} Trades`;
    if (lossEl) lossEl.innerText = `${losses} Trade`;
    if (winRateEl) winRateEl.innerText = `${winRate}%`;
    if (pfEl) pfEl.innerText = profitFactor;

    // Update Modal Metrics
    const mPnl = document.getElementById('mTotalPnl');
    const mHits = document.getElementById('mHits');
    const mLoss = document.getElementById('mLosses');
    const mRate = document.getElementById('mWinRate');

    if (mPnl) {
      const sign = totalPnl >= 0 ? '+' : '';
      mPnl.className = `v ${totalPnl >= 0 ? 'pos' : 'neg'}`;
      mPnl.innerText = `${sign}₹${totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (mHits) mHits.innerText = hits;
    if (mLoss) mLoss.innerText = losses;
    if (mRate) mRate.innerText = `${winRate}%`;

    // Render Table Rows: Live Active trade at Top, followed by completed trades
    const tbody = document.getElementById('todayTradeHistoryBody');
    if (tbody) {
      let rowsHtml = '';

      // 1. Live Running or Final Day Trade (TOP ROW)
      if (STATE.activeTrade) {
        const at = STATE.activeTrade;
        const livePnlSign = at.pnl >= 0 ? '+' : '';
        const livePnlClass = at.pnl >= 0 ? 'pos' : 'neg';
        const typeBadge = at.type === 'BUY_CE' ? '<span style="color:#10b981;font-weight:700;">CALL (CE)</span>' : '<span style="color:#f43f5e;font-weight:700;">PUT (PE)</span>';
        
        const rowClass = at.isClosed ? 'active-trade-row closed' : 'active-trade-row';
        const liveTag = at.isClosed ? 
          '<span style="font-size:9px;background:rgba(245,158,11,0.2);color:#f59e0b;padding:1px 4px;border-radius:3px;font-weight:700;">CLOSED (EOD)</span>' : 
          '<span style="font-size:9px;background:rgba(0,240,255,0.2);color:#00f0ff;padding:1px 4px;border-radius:3px;font-weight:700;">LIVE</span>';
        const timeDot = at.isClosed ? 
          '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:5px;"></span>' : 
          '<span class="pulse-dot" style="display:inline-block;margin-right:4px;"></span>';
        const badgeMarkup = at.isClosed ?
          `<span class="status-badge-closed">${at.status}</span>` :
          `<span class="status-badge-running"><span class="pulse-dot"></span> ${at.status}</span>`;
        const exitLabel = at.isClosed ? `<span style="font-size:9px;color:#f59e0b;">(EOD CLOSE)</span>` : `<span style="font-size:9px;color:#8b9bb4;">(LTP)</span>`;

        rowsHtml += `
          <tr class="${rowClass}">
            <td>${timeDot}${at.time}</td>
            <td style="font-weight:700;color:#fff;">${at.contract} ${liveTag}</td>
            <td>${typeBadge}</td>
            <td>₹${at.entry.toFixed(2)}</td>
            <td style="font-weight:700;color:#fff;">₹${at.currentLtp.toFixed(2)} ${exitLabel}</td>
            <td>${at.lots} Lots (${at.qty})</td>
            <td>${badgeMarkup}</td>
            <td class="${livePnlClass}" style="font-weight:800;font-size:13px;">${livePnlSign}₹${at.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      }

      // 2. Completed Historic Trades
      rowsHtml += trades.map(t => {
        const isHit = t.status === 'TARGET_HIT';
        const pnlSign = t.pnl >= 0 ? '+' : '';
        const pnlClass = t.pnl >= 0 ? 'pos' : 'neg';
        const badgeClass = isHit ? 'status-badge-hit' : 'status-badge-sl';
        const badgeText = isHit ? '🎯 TARGET HIT' : '🛑 STOP LOSS';
        const typeBadge = t.type === 'BUY_CE' ? '<span style="color:#10b981;font-weight:700;">CALL (CE)</span>' : '<span style="color:#f43f5e;font-weight:700;">PUT (PE)</span>';

        return `
          <tr>
            <td>${t.time}</td>
            <td style="font-weight:700;color:#fff;">${t.contract}</td>
            <td>${typeBadge}</td>
            <td>₹${t.entry.toFixed(2)}</td>
            <td>₹${t.exit.toFixed(2)}</td>
            <td>${t.lots} Lots (${t.qty})</td>
            <td><span class="${badgeClass}">${badgeText}</span></td>
            <td class="${pnlClass}" style="font-weight:700;">${pnlSign}₹${t.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      }).join('');

      tbody.innerHTML = rowsHtml;
    }
  }
  window.renderTodayPerformance = renderTodayPerformance;

  // Modal Handlers
  const histModal = document.getElementById('tradeHistoryModal');
  const btnViewHistory = document.getElementById('btnViewTradeHistory');
  const btnCloseHistory = document.getElementById('btnCloseTradeHistoryModal');
  const btnDismissHistory = document.getElementById('btnDismissTradeHistory');

  if (btnViewHistory && histModal) {
    btnViewHistory.addEventListener('click', () => {
      renderTodayPerformance();
      histModal.style.display = 'flex';
    });
  }

  const closeHistoryModal = () => {
    if (histModal) histModal.style.display = 'none';
  };

  if (btnCloseHistory) btnCloseHistory.addEventListener('click', closeHistoryModal);
  if (btnDismissHistory) btnDismissHistory.addEventListener('click', closeHistoryModal);

  // --- 1-Week Backtest Engine ---
  let selectedBacktestDay = 'ALL';

  function renderWeekBacktestReport(filterDay = 'ALL') {
    selectedBacktestDay = filterDay;
    const trades = STATE.weekBacktestTrades || [];
    const filteredTrades = filterDay === 'ALL' ? trades : trades.filter(t => t.date === filterDay);

    // Metrics calculation
    const totalTrades = filteredTrades.length;
    const hits = filteredTrades.filter(t => t.status === 'TARGET_HIT').length;
    const losses = filteredTrades.filter(t => t.status === 'STOP_LOSS').length;
    const winRate = totalTrades > 0 ? ((hits / totalTrades) * 100).toFixed(1) : '0.0';

    const grossProfit = filteredTrades.reduce((sum, t) => t.pnl > 0 ? sum + t.pnl : sum, 0);
    const grossLoss = Math.abs(filteredTrades.reduce((sum, t) => t.pnl < 0 ? sum + t.pnl : sum, 0));
    const netPnl = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00');

    // Update KPI Elements
    const elWbNetPnl = document.getElementById('wbNetPnl');
    const elWbTotalTrades = document.getElementById('wbTotalTrades');
    const elWbHits = document.getElementById('wbHits');
    const elWbLosses = document.getElementById('wbLosses');
    const elWbProfitFactor = document.getElementById('wbProfitFactor');

    if (elWbNetPnl) {
      elWbNetPnl.className = `v ${netPnl >= 0 ? 'pos' : 'neg'}`;
      elWbNetPnl.innerText = `${netPnl >= 0 ? '+' : '-'}₹${Math.abs(netPnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    if (elWbTotalTrades) elWbTotalTrades.innerText = `${totalTrades} Trades`;
    if (elWbHits) elWbHits.innerText = `${hits} Hits (${winRate}%)`;
    if (elWbLosses) elWbLosses.innerText = `${losses} SL (${(100 - parseFloat(winRate)).toFixed(1)}%)`;
    if (elWbProfitFactor) elWbProfitFactor.innerText = profitFactor;

    // Day Pills Bar
    const daysBar = document.getElementById('wbDaysBar');
    if (daysBar) {
      const distinctDays = ['ALL', ...Array.from(new Set(trades.map(t => t.date)))];
      daysBar.innerHTML = distinctDays.map(d => {
        let label = '🗓️ All 1 Month (21 Days)';
        let dayPnl = 0;
        if (d !== 'ALL') {
          dayPnl = trades.filter(t => t.date === d).reduce((s, t) => s + t.pnl, 0);
          const pSign = dayPnl >= 0 ? '+' : '';
          label = `${d} (${pSign}₹${(dayPnl / 1000).toFixed(1)}k)`;
        }
        const isActive = d === selectedBacktestDay;
        const activeStyle = isActive
          ? 'background: #00f0ff; color: #000; font-weight: 700; border: 1px solid #00f0ff;'
          : 'background: rgba(255,255,255,0.06); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15);';

        return `<button class="wb-day-pill" data-day="${d}" style="padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 11px; white-space: nowrap; transition: 0.2s; ${activeStyle}">${label}</button>`;
      }).join('');

      daysBar.querySelectorAll('.wb-day-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const day = e.currentTarget.getAttribute('data-day');
          renderWeekBacktestReport(day);
        });
      });
    }

    // Table rows
    const tbody = document.getElementById('weekBacktestBody');
    if (tbody) {
      tbody.innerHTML = filteredTrades.map(t => {
        const isHit = t.status === 'TARGET_HIT';
        const pnlSign = t.pnl >= 0 ? '+' : '';
        const pnlClass = t.pnl >= 0 ? 'pos' : 'neg';
        const badgeClass = isHit ? 'status-badge-hit' : 'status-badge-sl';
        const badgeText = isHit ? '🎯 TARGET HIT' : '🛑 STOP LOSS';
        const typeBadge = t.type === 'BUY_CE'
          ? '<span style="color:#10b981;font-weight:700;">CALL (CE)</span>'
          : '<span style="color:#f43f5e;font-weight:700;">PUT (PE)</span>';

        return `
          <tr>
            <td style="color:#94a3b8;font-size:11px;">${t.date}</td>
            <td>${t.time}</td>
            <td style="font-weight:700;color:#fff;">${t.contract}</td>
            <td>${typeBadge}</td>
            <td>₹${t.entry.toFixed(2)}</td>
            <td>₹${t.exit.toFixed(2)}</td>
            <td>${t.lots} Lots</td>
            <td><span class="${badgeClass}">${badgeText}</span></td>
            <td class="${pnlClass}" style="font-weight:700;">${pnlSign}₹${t.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 1-Month & Custom Date Range Backtest Engine (Python Driven)
  const weekModal = document.getElementById('weekBacktestModal');
  const btnOpenWeek = document.getElementById('btnOpenWeekBacktest');
  const btnCloseWeek = document.getElementById('btnCloseWeekModal');
  const btnDismissWeek = document.getElementById('btnDismissWeekModal');
  const btnExecuteBacktest = document.getElementById('btnExecutePythonBacktest');
  const btFromDateInput = document.getElementById('btFromDate');
  const btToDateInput = document.getElementById('btToDate');
  const btTimeframeSelect = document.getElementById('btTimeframe');
  const wbModalSubtitle = document.getElementById('wbModalSubtitle');

  async function loadAndOpenBacktestReport(customFrom = null, customTo = null) {
    const fromVal = customFrom || (btFromDateInput ? btFromDateInput.value : '2026-09-22');
    const toVal = customTo || (btToDateInput ? btToDateInput.value : '2026-10-21');
    const tfVal = btTimeframeSelect ? btTimeframeSelect.value : '5m';

    if (btnExecuteBacktest) {
      btnExecuteBacktest.innerText = '⏳ Executing Python Engine...';
      btnExecuteBacktest.style.opacity = '0.7';
    }

    try {
      const url = `http://127.0.0.1:5000/api/backtest-data?from_date=${fromVal}&to_date=${toVal}&tf=${tfVal}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const payload = await resp.json();
        if (payload.trades) {
          STATE.weekBacktestTrades = payload.trades;
          if (wbModalSubtitle) {
            wbModalSubtitle.innerText = `${payload.period} | Timeframe: ${payload.timeframe} (${payload.count} Executed Trades)`;
          }
        }
      }
    } catch (e) {
      console.warn('Fallback to local state backtest trades:', e);
    } finally {
      if (btnExecuteBacktest) {
        btnExecuteBacktest.innerText = '⚡ Run Python Backtest';
        btnExecuteBacktest.style.opacity = '1';
      }
    }

    renderWeekBacktestReport('ALL');
    if (weekModal) weekModal.style.display = 'flex';
    playBeep(640, 'triangle', 0.1);
  }

  if (btnOpenWeek && weekModal) {
    btnOpenWeek.addEventListener('click', () => loadAndOpenBacktestReport());
  }

  if (btnExecuteBacktest) {
    btnExecuteBacktest.addEventListener('click', () => {
      loadAndOpenBacktestReport();
    });
  }

  // --- 8. Theme Switcher Engine (5 Distinct Themes) ---
  const themeSelector = document.getElementById('themeSelector');
  const themes = [
    'theme-bloomberg',
    'theme-matrix',
    'theme-tradingview',
    'theme-luxury-gold',
    'theme-institutional-light'
  ];

  function updateChartThemeColors(themeName) {
    let bg = '#0b0e14';
    let text = '#8b9bb4';
    let grid = 'rgba(255, 255, 255, 0.04)';
    let border = '#26334d';

    if (themeName === 'theme-matrix') {
      bg = '#020b06';
      text = '#6ee7b7';
      grid = 'rgba(0, 255, 102, 0.05)';
      border = '#174e2d';
    } else if (themeName === 'theme-tradingview') {
      bg = '#0d1219';
      text = '#94a3b8';
      grid = 'rgba(255, 255, 255, 0.04)';
      border = '#223247';
    } else if (themeName === 'theme-luxury-gold') {
      bg = '#10121a';
      text = '#a9b1d6';
      grid = 'rgba(168, 85, 247, 0.05)';
      border = '#2b2f48';
    } else if (themeName === 'theme-institutional-light') {
      bg = '#ebe3d5';
      text = '#6c5e53';
      grid = 'rgba(0, 0, 0, 0.05)';
      border = '#cbbba6';
    }

    const chartOpts = {
      layout: { background: { color: bg }, textColor: text },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderColor: border },
      timeScale: { borderColor: border }
    };

    if (STATE.charts.splitChart) {
      try { STATE.charts.splitChart.applyOptions(chartOpts); } catch (e) {}
    }
    if (STATE.charts.multiCharts && STATE.charts.multiCharts.length > 0) {
      STATE.charts.multiCharts.forEach(item => {
        try { item.chart.applyOptions(chartOpts); } catch (e) {}
      });
    }
  }

  function applyTheme(themeName) {
    themes.forEach(t => document.body.classList.remove(t));
    if (themeName !== 'theme-bloomberg') {
      document.body.classList.add(themeName);
    }
    localStorage.setItem('tradenifty_theme', themeName);
    if (themeSelector) themeSelector.value = themeName;
    updateChartThemeColors(themeName);
    playBeep(850, 'sine', 0.05);
  }

  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }

  // Restore saved theme
  const savedTheme = localStorage.getItem('tradenifty_theme') || 'theme-bloomberg';
  applyTheme(savedTheme);

  // --- 9. Risk & Position Size Calculator Engine ---
  const riskModal = document.getElementById('riskCalcModal');
  const btnOpenRisk = document.getElementById('btnOpenRiskCalc');
  const btnCloseRisk = document.getElementById('btnCloseRiskModal');
  const btnDismissRisk = document.getElementById('btnDismissRiskModal');

  function calculateRisk() {
    const capital = parseFloat(document.getElementById('rcCapital')?.value || 500000);
    const riskPct = parseFloat(document.getElementById('rcRiskPct')?.value || 1.5);
    const entry = parseFloat(document.getElementById('rcEntry')?.value || 150);
    const sl = parseFloat(document.getElementById('rcSl')?.value || 110);

    const maxRiskAmt = capital * (riskPct / 100);
    const riskPerShare = Math.max(0.05, Math.abs(entry - sl));
    const maxQtyAllowed = Math.floor(maxRiskAmt / riskPerShare);
    const lots = Math.max(1, Math.floor(maxQtyAllowed / 50));
    const totalQty = lots * 50;
    const capitalRequired = totalQty * entry;
    const capPct = ((capitalRequired / capital) * 100).toFixed(1);

    const elRiskAmt = document.getElementById('rcMaxRiskAmt');
    const elRiskShare = document.getElementById('rcRiskPerShare');
    const elLots = document.getElementById('rcRecLots');
    const elCapUsed = document.getElementById('rcCapitalUsed');

    if (elRiskAmt) elRiskAmt.innerText = `₹${maxRiskAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (elRiskShare) elRiskShare.innerText = `₹${riskPerShare.toFixed(2)}`;
    if (elLots) elLots.innerText = `${lots} Lots (${totalQty} Qty)`;
    if (elCapUsed) elCapUsed.innerText = `₹${capitalRequired.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${capPct}% of Account)`;
  }

  ['rcCapital', 'rcRiskPct', 'rcEntry', 'rcSl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateRisk);
  });

  if (btnOpenRisk && riskModal) {
    btnOpenRisk.addEventListener('click', () => {
      calculateRisk();
      riskModal.style.display = 'flex';
    });
  }

  const closeRiskModal = () => {
    if (riskModal) riskModal.style.display = 'none';
  };
  if (btnCloseRisk) btnCloseRisk.addEventListener('click', closeRiskModal);
  if (btnDismissRisk) btnDismissRisk.addEventListener('click', closeRiskModal);

  // --- 10. Order Flow DOM Ladder & Institutional Shark Tape Engine ---
  const DEFAULT_SHARK_TRADES = [
    { time: '15:29:48', entity: 'SHARK WRITER', badge: 'shark', contract: 'NIFTY 22800 PE', side: 'SELL (FLOOR)', sideCls: 'pos', lots: 7500, val: '₹7.51 Cr' },
    { time: '15:28:12', entity: 'FII ALGO', badge: 'fii', contract: 'NIFTY 22800 CE', side: 'BUY (AGG)', sideCls: 'pos', lots: 4200, val: '₹3.42 Cr' },
    { time: '15:26:45', entity: 'SHARK WRITER', badge: 'shark', contract: 'NIFTY 22850 CE', side: 'SELL (WALL)', sideCls: 'neg', lots: 6500, val: '₹5.28 Cr' },
    { time: '15:24:30', entity: 'DII HEDGE', badge: 'dii', contract: 'NIFTY 22800 PE', side: 'BUY (ACC)', sideCls: 'pos', lots: 5100, val: '₹4.85 Cr' },
    { time: '15:21:18', entity: 'PROP DESK', badge: 'prop', contract: 'NIFTY 22750 PE', side: 'BUY (AGG)', sideCls: 'pos', lots: 3400, val: '₹2.90 Cr' },
    { time: '15:18:05', entity: 'SHARK WRITER', badge: 'shark', contract: 'NIFTY 22800 PE', side: 'SELL (FLOOR)', sideCls: 'pos', lots: 7200, val: '₹7.15 Cr' },
    { time: '15:14:40', entity: 'FII ALGO', badge: 'fii', contract: 'NIFTY 22800 CE', side: 'BUY (AGG)', sideCls: 'pos', lots: 3800, val: '₹3.10 Cr' },
    { time: '15:10:12', entity: 'PROP DESK', badge: 'prop', contract: 'NIFTY 22900 CE', side: 'SELL (AGG)', sideCls: 'neg', lots: 4500, val: '₹3.65 Cr' },
    { time: '15:06:55', entity: 'DII HEDGE', badge: 'dii', contract: 'NIFTY 22800 PE', side: 'BUY (ACC)', sideCls: 'pos', lots: 2900, val: '₹2.75 Cr' }
  ];

  if (!STATE.sharkTrades || (STATE.isMarketOpen === false && STATE.sharkTrades[0]?.time > '15:30:00')) {
    STATE.sharkTrades = DEFAULT_SHARK_TRADES.slice();
    STATE.cvdLots = 148250;
  }

  function updateTapeStatusBadge(isOpen) {
    const badge = document.getElementById('sharkTapeStatusBadge');
    if (!badge) return;
    if (!isOpen) {
      badge.innerText = '⏸️ TAPE FROZEN (MARKET CLOSED)';
      badge.style.background = 'rgba(244, 63, 94, 0.15)';
      badge.style.color = '#f43f5e';
    } else {
      badge.innerHTML = '<span class="pulse-dot"></span> LIVE HFT PRINTS';
      badge.style.background = 'rgba(0, 240, 255, 0.15)';
      badge.style.color = '#00f0ff';
    }
  }

  function renderSharkBlockTape() {
    const tapeContainer = document.getElementById('sharkBlockTradesTape');
    if (!tapeContainer) return;

    tapeContainer.innerHTML = STATE.sharkTrades.map(t => `
      <div class="tape-row">
        <span>${t.time}</span>
        <span><span class="tape-badge ${t.badge}">${t.entity}</span></span>
        <span style="font-weight:700;">${t.contract}</span>
        <span class="${t.sideCls}" style="font-weight:700;">${t.side}</span>
        <span><b>${t.lots.toLocaleString()}</b></span>
        <span style="color:var(--yellow-highlight);font-weight:700;">${t.val}</span>
      </div>
    `).join('');
  }

  function streamNextSharkBlockTrade() {
    const isClosed = (STATE.isMarketOpen === false);
    if (isClosed) {
      updateTapeStatusBadge(false);
      if (STATE.sharkTrades && STATE.sharkTrades.length > 0 && (STATE.sharkTrades[0].time > '15:30:00' || STATE.sharkTrades[0].time < '09:15:00')) {
        STATE.sharkTrades = DEFAULT_SHARK_TRADES.slice();
        renderSharkBlockTape();
      }
      return;
    }
    updateTapeStatusBadge(true);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const entities = [
      { name: 'FII ALGO', badge: 'fii' },
      { name: 'DII HEDGE', badge: 'dii' },
      { name: 'SHARK WRITER', badge: 'shark' },
      { name: 'PROP DESK', badge: 'prop' }
    ];
    const ent = entities[Math.floor(Math.random() * entities.length)];
    const strikes = [22800, 22850, 22750, 22900];
    const strike = strikes[Math.floor(Math.random() * strikes.length)];
    const isCall = Math.random() > 0.45;
    const isBuy = Math.random() > 0.4;
    const contract = `NIFTY ${strike} ${isCall ? 'CE' : 'PE'}`;
    const lots = Math.floor(Math.random() * 4500) + 1500;
    const valCr = (lots * 50 * (isCall ? 135 : 190) / 10000000).toFixed(2);
    const side = isBuy ? 'BUY (AGG)' : 'SELL (AGG)';
    const sideCls = isBuy ? 'pos' : 'neg';

    // Update CVD
    STATE.cvdLots += isBuy ? lots : -lots;
    const cvdEl = document.getElementById('ofCvdVal');
    if (cvdEl) {
      const sign = STATE.cvdLots >= 0 ? '+' : '';
      cvdEl.innerText = `${sign}${STATE.cvdLots.toLocaleString()} Lots`;
      cvdEl.className = `m-val ${STATE.cvdLots >= 0 ? 'pos' : 'neg'}`;
    }

    // Update Imbalance Ratio
    const imbEl = document.getElementById('ofImbalanceVal');
    if (imbEl) {
      const ratio = (2.4 + (Math.random() * 1.4)).toFixed(2);
      imbEl.innerText = `${ratio}x Ask Dominance`;
    }

    STATE.sharkTrades.unshift({
      time: timeStr,
      entity: ent.name,
      badge: ent.badge,
      contract: contract,
      side: side,
      sideCls: sideCls,
      lots: lots,
      val: `₹${valCr} Cr`
    });

    if (STATE.sharkTrades.length > 35) STATE.sharkTrades.pop();
    renderSharkBlockTape();
  }

  function renderDomLadder() {
    const ceLadder = document.getElementById('domCeLadder');
    const peLadder = document.getElementById('domPeLadder');
    if (!ceLadder || !peLadder) return;

    const baseCe = 135.95;
    const basePe = 200.35;

    let ceHtml = '<table class="data-table" style="font-size:11px;"><thead><tr><th>Bid Qty</th><th>Bid Price</th><th style="color:#00f0ff;">Depth</th><th>Ask Price</th><th>Ask Qty</th></tr></thead><tbody>';
    for (let i = 6; i >= 1; i--) {
      const askP = (baseCe + (i * 0.45)).toFixed(2);
      const askQ = (1800 + i * 420);
      const bidP = (baseCe - (i * 0.45)).toFixed(2);
      const bidQ = (2200 + i * 350);
      const isSharkBid = bidQ >= 2500;
      const isSharkAsk = askQ >= 2500;
      ceHtml += `
        <tr>
          <td style="color:#10b981;font-weight:700;">
            ${isSharkBid ? '<span class="tape-badge shark" style="font-size:8px;padding:0 3px;margin-right:2px;">🦈 SHARK</span>' : ''}${bidQ.toLocaleString()}
          </td>
          <td>₹${bidP}</td>
          <td><div style="background:rgba(16,185,129,0.3);height:10px;width:${Math.min(100, bidQ/45)}%;border-radius:2px;"></div></td>
          <td style="color:#f43f5e;font-weight:700;">₹${askP}</td>
          <td>
            ${isSharkAsk ? '<span class="tape-badge shark" style="font-size:8px;padding:0 3px;margin-right:2px;">🦈 SHARK</span>' : ''}${askQ.toLocaleString()}
          </td>
        </tr>
      `;
    }
    ceHtml += '</tbody></table>';
    ceLadder.innerHTML = ceHtml;

    let peHtml = '<table class="data-table" style="font-size:11px;"><thead><tr><th>Bid Qty</th><th>Bid Price</th><th style="color:#00f0ff;">Depth</th><th>Ask Price</th><th>Ask Qty</th></tr></thead><tbody>';
    for (let i = 6; i >= 1; i--) {
      const askP = (basePe + (i * 0.45)).toFixed(2);
      const askQ = (2400 + i * 380);
      const bidP = (basePe - (i * 0.45)).toFixed(2);
      const bidQ = (3100 + i * 450);
      const isSharkBid = bidQ >= 2500;
      const isSharkAsk = askQ >= 2500;
      peHtml += `
        <tr>
          <td style="color:#10b981;font-weight:700;">
            ${isSharkBid ? '<span class="tape-badge shark" style="font-size:8px;padding:0 3px;margin-right:2px;">🦈 SHARK</span>' : ''}${bidQ.toLocaleString()}
          </td>
          <td>₹${bidP}</td>
          <td><div style="background:rgba(244,63,94,0.3);height:10px;width:${Math.min(100, bidQ/55)}%;border-radius:2px;"></div></td>
          <td style="color:#f43f5e;font-weight:700;">₹${askP}</td>
          <td>
            ${isSharkAsk ? '<span class="tape-badge shark" style="font-size:8px;padding:0 3px;margin-right:2px;">🦈 SHARK</span>' : ''}${askQ.toLocaleString()}
          </td>
        </tr>
      `;
    }
    peHtml += '</tbody></table>';
    peLadder.innerHTML = peHtml;

    updateTapeStatusBadge(STATE.isMarketOpen !== false);
    renderSharkBlockTape();
  }

  // Auto-stream institutional shark block trades every 3.5 seconds
  if (!window._sharkTapeInterval) {
    window._sharkTapeInterval = setInterval(streamNextSharkBlockTrade, 3500);
  }


  // Scalper Pad Input Events
  const scalperLotsInput = document.getElementById('scalperLots');
  const scalperQtyInput = document.getElementById('scalperQty');
  const scalperMargin = document.getElementById('scalperMargin');
  if (scalperLotsInput && scalperQtyInput) {
    scalperLotsInput.addEventListener('input', (e) => {
      const lots = Math.max(1, parseInt(e.target.value) || 1);
      const qty = lots * 50;
      scalperQtyInput.value = qty;
      const selVal = scalperContractSelect ? scalperContractSelect.value : '22800_CE';
      const isCall = selVal.includes('CE');
      const ltp = isCall ? 135.95 : 200.35;
      if (scalperMargin) scalperMargin.innerText = `₹${(qty * ltp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    });
  }

  const scalperContractSelect = document.getElementById('scalperContractSelect');
  if (scalperContractSelect) {
    scalperContractSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const isCall = val.includes('CE');
      const ltp = isCall ? 135.95 : 200.35;
      const lots = parseInt(scalperLotsInput ? scalperLotsInput.value : 2) || 2;
      const qty = lots * 50;
      if (scalperMargin) scalperMargin.innerText = `₹${(qty * ltp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      playBeep(720, 'sine', 0.06);
    });
  }

  const btnSimBuy = document.getElementById('btnSimBuy');
  const btnSimSell = document.getElementById('btnSimSell');
  const fillStatus = document.getElementById('scalperFillStatus');
  if (btnSimBuy && fillStatus) {
    btnSimBuy.addEventListener('click', () => {
      fillStatus.innerText = 'FILLED @ MARKET (BOUGHT)';
      fillStatus.style.color = '#10b981';
      playBeep(980, 'triangle', 0.12);
      setTimeout(() => { fillStatus.innerText = 'IN POSITION'; }, 2000);
    });
  }
  if (btnSimSell && fillStatus) {
    btnSimSell.addEventListener('click', () => {
      fillStatus.innerText = 'SQUARED OFF (EXITED)';
      fillStatus.style.color = '#f43f5e';
      playBeep(520, 'square', 0.12);
      setTimeout(() => { fillStatus.innerText = 'FLAT / CASH'; }, 2000);
    });
  }

  // --- 11. Volatility Skew & IV Smile SVG Curve Renderer ---
  function renderIvSmileCurve() {
    const svg = document.getElementById('ivSmileSvg');
    if (!svg) return;

    const strikes = [22500, 22550, 22600, 22650, 22700, 22750, 22800, 22850, 22900, 22950, 23000, 23050, 23100];
    const callIvs = [16.8, 16.2, 15.4, 14.8, 14.1, 13.6, 13.2, 13.0, 12.9, 13.1, 13.4, 13.8, 14.3];
    const putIvs  = [18.9, 18.2, 17.5, 16.8, 16.1, 15.4, 14.8, 14.5, 14.2, 14.1, 14.0, 14.2, 14.5];

    const w = svg.clientWidth || 600;
    const h = svg.clientHeight || 280;
    const pad = 40;

    const minIv = 12.0;
    const maxIv = 20.0;

    const getX = (idx) => pad + (idx * ((w - (2 * pad)) / (strikes.length - 1)));
    const getY = (iv) => h - pad - (((iv - minIv) / (maxIv - minIv)) * (h - (2 * pad)));

    // Grid lines & labels
    let svgContent = '';
    for (let iv = 12; iv <= 20; iv += 2) {
      const y = getY(iv);
      svgContent += `
        <line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <text x="${pad - 8}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end">${iv}%</text>
      `;
    }

    // Call Path & Put Path
    let callPath = `M ${getX(0)} ${getY(callIvs[0])}`;
    let putPath = `M ${getX(0)} ${getY(putIvs[0])}`;

    for (let i = 1; i < strikes.length; i++) {
      callPath += ` L ${getX(i)} ${getY(callIvs[i])}`;
      putPath += ` L ${getX(i)} ${getY(putIvs[i])}`;
    }

    svgContent += `
      <path d="${callPath}" fill="none" stroke="#00f0ff" stroke-width="2.5" />
      <path d="${putPath}" fill="none" stroke="#f43f5e" stroke-width="2.5" />
    `;

    // Strike X labels & dots
    strikes.forEach((stk, idx) => {
      const x = getX(idx);
      const isAtm = stk === 22800;
      if (isAtm) {
        svgContent += `
          <line x1="${x}" y1="${pad}" x2="${x}" y2="${h - pad}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4" />
          <text x="${x}" y="${pad - 8}" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">ATM (22800)</text>
        `;
      }
      svgContent += `
        <circle cx="${x}" cy="${getY(callIvs[idx])}" r="3.5" fill="#00f0ff" />
        <circle cx="${x}" cy="${getY(putIvs[idx])}" r="3.5" fill="#f43f5e" />
        <text x="${x}" y="${h - pad + 18}" fill="${isAtm ? '#f59e0b' : '#64748b'}" font-size="9" text-anchor="middle" font-weight="${isAtm ? 'bold' : 'normal'}">${stk}</text>
      `;
    });

    svg.innerHTML = svgContent;
  }

  // --- 12. Option Chain Controls & OI Profile Modal Wiring ---
  const btnCenterAtm = document.getElementById('btnCenterAtm');
  if (btnCenterAtm) {
    btnCenterAtm.addEventListener('click', centerAtmStrike);
  }

  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', exportOptionChainCSV);
  }

  const strikeSearch = document.getElementById('strikeSearch');
  if (strikeSearch) {
    strikeSearch.addEventListener('input', () => {
      renderOptionChainTable(STATE.data);
    });
  }

  ['chkGreeks', 'chkTheta', 'chkStrikePcr', 'chkOIChg'].forEach(id => {
    const chk = document.getElementById(id);
    if (chk) {
      chk.addEventListener('change', () => {
        renderOptionChainTable(STATE.data);
      });
    }
  });

  const strikeDepthSelect = document.getElementById('strikeDepthSelect');
  if (strikeDepthSelect) {
    strikeDepthSelect.addEventListener('change', (e) => {
      STATE.strikesCount = parseInt(e.target.value) || 10;
      STATE.data = generateOptionChainData(STATE.niftySpot);
      renderOptionChainTable(STATE.data);
      renderSplitChain(STATE.data);
      renderAocTable(STATE.data);
    });
  }

  const oiModal = document.getElementById('oiProfileModal');
  const btnToggleOi = document.getElementById('btnToggleOiChart');
  const btnCloseOi = document.getElementById('btnCloseOiModal');
  const btnDismissOi = document.getElementById('btnDismissOiModal');

  if (btnToggleOi && oiModal) {
    btnToggleOi.addEventListener('click', () => {
      renderOiProfileHistogram();
      oiModal.style.display = 'flex';
      playBeep(780, 'sine', 0.08);
    });
  }

  const closeOiModal = () => {
    if (oiModal) oiModal.style.display = 'none';
  };
  if (btnCloseOi) btnCloseOi.addEventListener('click', closeOiModal);
  if (btnDismissOi) btnDismissOi.addEventListener('click', closeOiModal);

  // --- Keyboard Shortcuts Matrix ---
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === '1') applyTheme('theme-bloomberg');
    if (e.key === '2') applyTheme('theme-matrix');
    if (e.key === '3') applyTheme('theme-tradingview');
    if (e.key === '4') applyTheme('theme-luxury-gold');
    if (e.key === '5') applyTheme('theme-institutional-light');
    if (e.key.toLowerCase() === 'b') {
      const btn = document.getElementById('btnOpenWeekBacktest');
      if (btn) btn.click();
    }
    if (e.key.toLowerCase() === 'r') {
      const btn = document.getElementById('btnOpenRiskCalc');
      if (btn) btn.click();
    }
    if (e.key.toLowerCase() === 'c') {
      centerAtmStrike();
    }
    if (e.key.toLowerCase() === 'o') {
      if (btnToggleOi) btnToggleOi.click();
    }
    if (e.key === 'Escape') {
      if (weekModal) weekModal.style.display = 'none';
      if (histModal) histModal.style.display = 'none';
      if (riskModal) riskModal.style.display = 'none';
      if (oiModal) oiModal.style.display = 'none';
    }
  });

  // 7. Initial Bootstraps
  renderTodayPerformance();
  STATE.data = generateOptionChainData(STATE.niftySpot);
  renderOptionChainTable(STATE.data);
  renderSplitChain(STATE.data);
  renderAocTable(STATE.data);
  initSplitChart();
  initMultiCharts();
  renderScreener('ai-stocks');
  renderFiiFlowChart();
  renderReplayFrame(0);
  renderDomLadder();
  setTimeout(renderIvSmileCurve, 200);

  // --- 13. Gemini AI Market Intelligence & Sentiments Engine ---
  let savedGeminiKey = localStorage.getItem('tradenifty_gemini_key') || '';
  const geminiKeyModal = document.getElementById('geminiKeyModal');
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const btnOpenGemKey = document.getElementById('btnOpenGeminiKeyModal');
  const btnCloseGemKey = document.getElementById('btnCloseGeminiKeyModal');
  const btnDismissGemKey = document.getElementById('btnDismissGeminiKey');
  const btnSaveGemKey = document.getElementById('btnSaveGeminiKey');
  const btnClearGemKey = document.getElementById('btnClearGeminiKey');
  const btnTriggerGemini = document.getElementById('btnTriggerGeminiAnalysis');
  const btnOpenGeminiExplain = document.getElementById('btnOpenGeminiExplain');
  const geminiChatInput = document.getElementById('geminiChatInput');
  const btnSendGeminiChat = document.getElementById('btnSendGeminiChat');
  const geminiChatLog = document.getElementById('geminiChatLog');
  const geminiBadgeText = document.getElementById('geminiBadgeText');

  if (geminiApiKeyInput && savedGeminiKey) {
    geminiApiKeyInput.value = savedGeminiKey;
  }

  function updateGeminiStatusBadge() {
    if (geminiBadgeText) {
      if (savedGeminiKey && savedGeminiKey.length > 15) {
        geminiBadgeText.innerText = 'Gemini 1.5 Flash Connected';
      } else {
        geminiBadgeText.innerText = 'Gemini Neural Engine Active';
      }
    }
  }
  updateGeminiStatusBadge();

  // News fetcher with 5-Minute Auto-Sync Engine
  let newsCountdownSeconds = 300; // Exactly 5 Minutes (300s)
  const timerBadge = document.getElementById('newsAutoSyncTimer');
  const btnManualNews = document.getElementById('btnManualNewsRefresh');
  const newsSentimentBadge = document.getElementById('newsSentimentBadge');

  async function fetchMarketNews(force = false) {
    const list = document.getElementById('geminiNewsFeedList');
    if (!list) return;
    try {
      const url = `http://127.0.0.1:5000/api/market-news${force ? '?force=true' : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.nextSyncSeconds !== undefined) {
          newsCountdownSeconds = data.nextSyncSeconds;
        }
        if (data.news && data.news.length > 0) {
          // Calculate overall news sentiment
          const bullCount = data.news.filter(n => n.sentiment === 'BULLISH').length;
          const bullPct = Math.round((bullCount / data.news.length) * 100);
          if (newsSentimentBadge) {
            newsSentimentBadge.innerText = `${bullPct}% Bullish Flow`;
            newsSentimentBadge.className = bullPct >= 50 ? 'badge pos' : 'badge neg';
            newsSentimentBadge.style.background = bullPct >= 50 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)';
            newsSentimentBadge.style.color = bullPct >= 50 ? 'var(--green-pos)' : 'var(--red-neg)';
          }

          list.innerHTML = data.news.map(n => {
            const badgeCls = n.sentiment === 'BULLISH' ? 'bull' : (n.sentiment === 'BEARISH' ? 'bear' : 'neut');
            return `
              <div class="gemini-news-card" onclick="window.open('${n.link || '#'}', '_blank')" style="cursor:pointer;" title="Click to view live article">
                <div class="gnc-head">
                  <span class="gnc-cat">${n.category}</span>
                  <span class="gnc-badge ${badgeCls}">${n.sentiment}</span>
                </div>
                <div class="gnc-title">${n.title}</div>
                <div style="font-size:10px;color:#94a3b8;line-height:1.4;">${n.summary}</div>
                <div class="gnc-meta">
                  <span style="color:var(--accent-cyan);font-weight:600;">📰 ${n.source}</span>
                  <span>⏱️ ${n.time}</span>
                </div>
              </div>
            `;
          }).join('');

          // Visual flash indicator
          list.style.borderColor = 'rgba(0, 240, 255, 0.4)';
          setTimeout(() => { list.style.borderColor = ''; }, 800);
        }
      }
    } catch (e) {
      console.warn('Market news fetch fallback:', e);
    }
  }

  // 5-Minute Auto-Sync Countdown Ticker
  function startNewsAutoSyncClock() {
    setInterval(() => {
      newsCountdownSeconds--;
      if (newsCountdownSeconds <= 0) {
        newsCountdownSeconds = 300;
        fetchMarketNews(true); // Automatically triggers every 5 minutes
        playBeep(840, 'sine', 0.05);
      }
      if (timerBadge) {
        const m = Math.floor(newsCountdownSeconds / 60);
        const s = newsCountdownSeconds % 60;
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        timerBadge.innerHTML = `<span class="pulse-dot" style="width:6px;height:6px;background:var(--accent-cyan);"></span> Auto-Sync: ${timeStr}`;
      }
    }, 1000);
  }

  if (btnManualNews) {
    btnManualNews.addEventListener('click', () => {
      btnManualNews.innerText = '🔄 Syncing...';
      btnManualNews.style.opacity = '0.7';
      newsCountdownSeconds = 300;
      fetchMarketNews(true).then(() => {
        runGeminiAnalysis();
      }).finally(() => {
        setTimeout(() => {
          btnManualNews.innerText = '🔄 Sync Now';
          btnManualNews.style.opacity = '1';
        }, 500);
      });
      playBeep(920, 'sine', 0.06);
    });
  }

  // Gemini deep analysis runner
  async function runGeminiAnalysis(customQuery = '') {
    if (btnTriggerGemini) {
      btnTriggerGemini.innerText = '⏳ Analyzing Live Market...';
      btnTriggerGemini.style.opacity = '0.7';
    }

    const payload = {
      apiKey: savedGeminiKey,
      query: customQuery,
      marketData: {
        spot: STATE.niftySpot,
        change: parseFloat((STATE.niftySpot - STATE.niftyPrevClose).toFixed(2)),
        changePct: parseFloat((((STATE.niftySpot - STATE.niftyPrevClose) / STATE.niftyPrevClose) * 100).toFixed(2)),
        vix: STATE.vix,
        technicals: {
          vwap: 22842.10,
          ema20: 22835.40,
          rsi: 48.60,
          trend: (STATE.niftySpot >= STATE.niftyPrevClose) ? 'BULLISH' : 'BEARISH'
        },
        derivatives: {
          pcr: STATE.pcr,
          maxPain: STATE.maxPain,
          totalCallOi: STATE.totalCallOi,
          totalPutOi: STATE.totalPutOi,
          atmStraddle: document.getElementById('atmStraddle')?.innerText || '₹336.30',
          sharkCeWall: document.getElementById('ribbonMaxCeStrike')?.innerText || '22,850 CE',
          sharkPeSupport: document.getElementById('ribbonMaxPeStrike')?.innerText || '22,800 PE'
        },
        orderFlow: {
          cvdLots: STATE.cvdLots || 148250,
          imbalance: document.getElementById('ofImbalanceVal')?.innerText || '2.50x Ask Dominance',
          sharkFloor: document.getElementById('ofSharkFloor')?.innerText || '22,800 PE',
          sharkCeil: document.getElementById('ofSharkCeil')?.innerText || '22,850 CE',
          recentSharkTrades: STATE.sharkTrades ? STATE.sharkTrades.slice(0, 6) : []
        },
        fiiDii: {
          fiiNetCash: '+₹1,245.50 Cr (Net Buyer)',
          diiNetCash: '+₹892.10 Cr (Net Buyer)',
          fiiFuturesIndex: '62% Long Bias'
        },
        signal: STATE.activeTrade ? { actionType: STATE.activeTrade.type, strike: STATE.maxPain, entryLtp: STATE.activeTrade.entry } : null
      }
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const out = await res.json();

        // Update Verdict & Setup
        const elTitle = document.getElementById('aiVerdictTitle');
        const elSetup = document.getElementById('aiVerdictSetup');
        const elTech = document.getElementById('aiPillarTechnical');
        const elDeriv = document.getElementById('aiPillarDerivatives');
        const elNews = document.getElementById('aiPillarNews');
        const elRisk = document.getElementById('aiPillarRisk');
        const elSync = document.getElementById('geminiLastSync');

        if (elTitle && out.sentiment) {
          const isBull = out.sentiment === 'BULLISH';
          elTitle.innerText = `${out.sentiment} BIAS (${out.conviction || 78}% CONVICTION)`;
          elTitle.style.color = isBull ? 'var(--green-pos)' : 'var(--red-neg)';
        }
        if (elSetup && out.contract) {
          elSetup.innerText = `Recommended: BUY ${out.contract} (${out.sentiment === 'BULLISH' ? 'Bull Call Setup' : 'Bear Put Setup'})`;
        }
        if (out.pillars) {
          if (elTech) elTech.innerText = out.pillars.technical;
          if (elDeriv) elDeriv.innerText = out.pillars.derivatives;
          if (elNews) elNews.innerText = out.pillars.news;
          if (elRisk) elRisk.innerText = out.pillars.risk;
        } else if (out.analysis) {
          if (elTech) elTech.innerText = out.analysis.slice(0, 300) + '...';
        }

        if (elSync) {
          elSync.innerText = `Analysis Refreshed: ${out.timestamp || 'Just Now'}`;
        }

        if (customQuery && geminiChatLog) {
          appendGeminiChatMessage('Gemini AI', out.analysis || (out.pillars ? out.pillars.technical : 'Analysis Complete.'));
        }

        playBeep(980, 'sine', 0.1);
      }
    } catch (e) {
      console.warn('Gemini analysis fetch error:', e);
    } finally {
      if (btnTriggerGemini) {
        btnTriggerGemini.innerText = '⚡ Run Deep AI Analysis';
        btnTriggerGemini.style.opacity = '1';
      }
    }
  }

  function appendGeminiChatMessage(sender, text) {
    if (!geminiChatLog) return;
    const isAi = sender.includes('Gemini');
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = isAi ?
      'background:rgba(217,70,239,0.12);border-left:2px solid #d946ef;padding:6px 8px;border-radius:4px;color:#cbd5e1;line-height:1.45;' :
      'background:rgba(0,240,255,0.1);border-left:2px solid #00f0ff;padding:6px 8px;border-radius:4px;color:#fff;line-height:1.45;';

    msgDiv.innerHTML = `<b>${sender}:</b> ${text.replace(/\n/g, '<br>')}`;
    geminiChatLog.appendChild(msgDiv);
    geminiChatLog.scrollTop = geminiChatLog.scrollHeight;
  }

  // Chat send
  if (btnSendGeminiChat && geminiChatInput) {
    const handleSend = () => {
      const q = geminiChatInput.value.trim();
      if (!q) return;
      appendGeminiChatMessage('You', q);
      geminiChatInput.value = '';
      runGeminiAnalysis(q);
    };
    btnSendGeminiChat.addEventListener('click', handleSend);
    geminiChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Prompt chips
  document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        appendGeminiChatMessage('You', prompt);
        runGeminiAnalysis(prompt);
      }
    });
  });

  // Modal handlers
  if (btnOpenGemKey && geminiKeyModal) {
    btnOpenGemKey.addEventListener('click', () => {
      geminiKeyModal.style.display = 'flex';
      playBeep(700, 'sine', 0.06);
    });
  }
  const closeGemModal = () => {
    if (geminiKeyModal) geminiKeyModal.style.display = 'none';
  };
  if (btnCloseGemKey) btnCloseGemKey.addEventListener('click', closeGemModal);
  if (btnDismissGemKey) btnDismissGemKey.addEventListener('click', closeGemModal);
  if (btnSaveGemKey && geminiApiKeyInput) {
    btnSaveGemKey.addEventListener('click', () => {
      savedGeminiKey = geminiApiKeyInput.value.trim();
      localStorage.setItem('tradenifty_gemini_key', savedGeminiKey);
      updateGeminiStatusBadge();
      closeGemModal();
      playBeep(1046, 'sine', 0.1);
      runGeminiAnalysis();
    });
  }
  if (btnClearGemKey && geminiApiKeyInput) {
    btnClearGemKey.addEventListener('click', () => {
      savedGeminiKey = '';
      localStorage.removeItem('tradenifty_gemini_key');
      geminiApiKeyInput.value = '';
      updateGeminiStatusBadge();
      closeGemModal();
    });
  }

  // Trigger analysis button
  if (btnTriggerGemini) {
    btnTriggerGemini.addEventListener('click', () => {
      runGeminiAnalysis();
    });
  }

  // Top header quick AI Opinion (Kyu?) button
  if (btnOpenGeminiExplain) {
    btnOpenGeminiExplain.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => {
        if (t.dataset.tab === 'tab-geminiai') t.click();
      });
      runGeminiAnalysis('Analyze current setup and explain WHY (Kyu) this trade was generated.');
      playBeep(880, 'sine', 0.1);
    });
  }

  // Initial load
  fetchMarketNews();
  startNewsAutoSyncClock();
  runGeminiAnalysis();

  // Multi-Charts Grid Controls & Zoom Reset
  document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.grid) || 2;
      renderMultiCharts(count);
    });
  });

  const btnResetMulti = document.getElementById('btnResetMultiZoom');
  if (btnResetMulti) {
    btnResetMulti.addEventListener('click', () => {
      if (STATE.charts.multiCharts) {
        STATE.charts.multiCharts.forEach(item => {
          try { item.chart.timeScale().fitContent(); } catch (e) {}
        });
      }
    });
  }

  window.addEventListener('resize', () => {
    const multiTab = document.getElementById('tab-multicharts');
    if (multiTab && multiTab.classList.contains('active')) {
      renderMultiCharts(_activeMultiGridCount || 2);
    }
  });

  // Tab switch hook for dynamic canvas/SVG re-renders
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab === 'tab-domladder') renderDomLadder();
      if (tab.dataset.tab === 'tab-ivsmile') setTimeout(renderIvSmileCurve, 50);
      if (tab.dataset.tab === 'tab-geminiai') fetchMarketNews();
      if (tab.dataset.tab === 'tab-multicharts') setTimeout(() => renderMultiCharts(_activeMultiGridCount || 2), 60);
    });
  });

  // Start Realtime Live Feed Engine
  startLiveEngine();
});

