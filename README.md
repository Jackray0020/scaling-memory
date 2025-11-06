# TradingView MACD + MFI Indicator

A comprehensive TradingView indicator that combines MACD (Moving Average Convergence Divergence) with MFI (Money Flow Index) for enhanced technical analysis.

## Features

### MACD Component
- **Fast Length**: Default 12-period EMA
- **Slow Length**: Default 26-period EMA  
- **Signal Line**: Default 9-period EMA of MACD line
- **Histogram**: Shows the difference between MACD and Signal lines

### MFI Component
- **MFI Length**: Default 14-period Money Flow Index
- **Overbought Level**: Default 80
- **Oversold Level**: Default 20
- **Visual Zones**: Color-coded overbought/oversold zones

### Combined Signals
The indicator generates four types of signals:

1. **Strong Buy** 🟢: MACD bullish crossover + MFI crosses above oversold (20)
2. **Strong Sell** 🔴: MACD bearish crossover + MFI crosses below overbought (80)
3. **Buy** 🟡: MACD bullish crossover (when MFI not overbought)
4. **Sell** 🟠: MACD bearish crossover (when MFI not oversold)

## How to Use

### Installation
1. Open TradingView chart
2. Click on "Pine Editor" tab
3. Copy the entire `macd_mfi_indicator.pine` content
4. Click "Add to Chart"

### Interpretation

#### MACD Signals
- **MACD Line Above Signal**: Bullish momentum
- **MACD Line Below Signal**: Bearish momentum
- **Histogram Growing**: Momentum strengthening
- **Histogram Shrinking**: Momentum weakening

#### MFI Signals
- **Above 80**: Overbought condition (potential reversal down)
- **Below 20**: Oversold condition (potential reversal up)
- **Divergence**: Price vs MFI trending in opposite directions

#### Combined Analysis
- **Strong Buy/Sell**: Highest probability trades when both indicators confirm
- **Buy/Sell**: Standard MACD signals filtered by MFI extremes
- **Filter**: Use MFI to avoid MACD signals in extreme overbought/oversold conditions

## Customization

### Input Parameters
- **MACD Settings**: Adjust fast/slow/signal periods for different timeframes
- **MFI Settings**: Modify length and overbought/oversold levels
- **Visual Settings**: Colors and display options

### Recommended Settings by Timeframe
- **Scalping (1-5min)**: MACD 5/13/6, MFI 10
- **Day Trading (15min-1hr)**: MACD 12/26/9, MFI 14 (default)
- **Swing Trading (4hr-1D)**: MACD 19/39/9, MFI 20

## Alert Conditions

The indicator supports four alert types:
- Strong Buy Signal
- Strong Sell Signal  
- Buy Signal
- Sell Signal

Set up alerts in TradingView to get notifications when these conditions are met.

## Trading Strategy Tips

1. **Confirmation**: Wait for candle close before entering trades
2. **Volume**: Consider volume analysis for additional confirmation
3. **Support/Resistance**: Use with key price levels
4. **Risk Management**: Always use stop-losses
5. **Multiple Timeframes**: Confirm signals on higher timeframes

## Technical Details

- **Script Version**: Pine Script v5
- **Chart Type**: Non-overlay (separate pane)
- **Default Values**: Standard MACD (12,26,9) and MFI (14) settings
- **Color Coding**: Green for bullish, red for bearish, purple for MFI

## Disclaimer

This indicator is for educational and informational purposes only. Past performance does not guarantee future results. Always do your own research and consider your risk tolerance before trading.
