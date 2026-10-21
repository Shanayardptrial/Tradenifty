// ==========================================================================
// TradeNifty Pro - TradingView Native Context Bridge (MAIN World)
// ==========================================================================

(() => {
  if (window.__TRADENIFTY_TV_MAIN_INJECTED__) return;
  window.__TRADENIFTY_TV_MAIN_INJECTED__ = true;

  console.log('%c[TradeNifty Pro]%c TV Native Context Bridge Online', 'background:#10b981;color:#000;font-weight:bold;padding:2px 6px;border-radius:3px;', 'color:#10b981;');

  // Find active TradingView chart widget instance
  function getActiveChartWidget() {
    try {
      if (window._exposed_chartWidgetCollection) {
        return window._exposed_chartWidgetCollection.activeChartWidget.value();
      }
      if (window.tvWidget) {
        return window.tvWidget.activeChart();
      }
    } catch (e) {}
    return null;
  }

  // Hook priceToCoordinate using native TradingView engine
  function calculatePriceCoordinates(prices) {
    const chart = getActiveChartWidget();
    if (!chart) return null;

    try {
      const model = chart.model ? chart.model() : chart;
      const mainSeries = model.mainSeries ? model.mainSeries() : null;
      const priceScale = mainSeries && mainSeries.priceScale ? mainSeries.priceScale() : null;

      if (!priceScale || typeof priceScale.priceToCoordinate !== 'function') return null;

      return prices.map(price => ({
        price,
        y: priceScale.priceToCoordinate(price)
      }));
    } catch (e) {
      return null;
    }
  }

  // Listen for coordinate calculation requests from content script
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;

    if (event.data.type === 'TN_CALC_TV_PRICES') {
      const prices = event.data.prices || [];
      const results = calculatePriceCoordinates(prices);

      if (results && results.length > 0) {
        window.postMessage({
          type: 'TN_TV_PRICES_RESULT',
          results,
          timestamp: Date.now()
        }, '*');
      }
    }
  });

  // Observe chart pan/zoom/scroll interactions to broadcast immediate sync triggers
  function setupInteractionObservers() {
    const target = document.querySelector('table.chart-markup-table') || document.body;
    
    ['wheel', 'pointermove', 'touchmove'].forEach(evtName => {
      target.addEventListener(evtName, () => {
        window.postMessage({ type: 'TN_TV_CHART_INTERACTION' }, '*');
      }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupInteractionObservers);
  } else {
    setupInteractionObservers();
  }
})();
