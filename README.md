# TradeNifty Pro - Institutional Derivatives Engine 🚀

Advanced real-time algorithmic trading terminal for NIFTY 50 and BANK NIFTY derivatives with AI sentiment co-pilot, order flow DOM ladders, institutional shark block tapes, multi-charts, and Python-driven backtesting.

## ✨ Core Pillars & Features

1. **Live Option Chain & Analytics:**
   - Real-time strike PCR, Max Pain, ATM Straddle pricing, and Delta/Gamma/Vega/Theta Greeks.
   - Shark indicators (`🦈 SHARK WALL` / `🦈 SHARK SUPPORT`) tracking whale call/put open interest.

2. **Order Flow & Shark Block Tape:**
   - 4-column institutional layout with DOM order ladder, express scalper, and whale block trade tracking.
   - Intelligent market close freezing and live tick synchronizer.

3. **Multi-Charts (Synced Layouts):**
   - Lightweight Charts powering synchronized 1-minute candlestick feeds.
   - 2-Chart (NIFTY 50 & BANK NIFTY), 4-Chart, and 8-Chart dynamic grid layouts with 20 EMA and synchronized time ranges.

4. **Gemini AI Market Intelligence & Sentiments:**
   - 6-Pillar institutional reasoning engine: Technicals (VWAP, EMA), Derivatives (PCR, Shark Walls), Order Flow (CVD), FII/DII Net Flows, India VIX, and live financial news feed.
   - Zero-key neural fallback mode + Google AI Studio key integration.

5. **Eye-Soft UI Themes:**
   - 5 distinct themes designed for minimal fatigue:
     - Bloomberg Pro (Dark)
     - Matrix Cyberpunk
     - Nordic Frost Oceanic (Ultra Eye-Care Slate)
     - Tokyo Velvet Obsidian (Deep Night Eye-Care)
     - Warm Paper & Matcha Sepia (Zero-Glare Day Mode)

6. **Python-Driven Backtesting:**
   - Custom historical date selector analyzing past trading sessions with net P&L, win rate, and profit factor.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd Tradenifty

# Run Python Backend Server
python backend_server.py
```
Open `http://127.0.0.1:5000` in any web browser.
