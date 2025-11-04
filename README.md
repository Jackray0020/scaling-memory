# MFI-RSI Combined TradingView Indicator

A custom TradingView Pine Script indicator that combines Money Flow Index (MFI) and Relative Strength Index (RSI) into a single, easy-to-use indicator panel.

## Features

- **Dual Indicators**: Displays both MFI and RSI on the same panel for easy comparison
- **Configurable Periods**: Customize the calculation period for both MFI and RSI (default: 14)
- **Color Customization**: Choose your own colors for each indicator line
- **Reference Levels**: Includes horizontal lines at key levels (30, 50, 70)
- **Visual Zones**: Subtle background coloring for overbought (>70) and oversold (<30) zones
- **Built-in Alerts**: Alert conditions for overbought/oversold crossovers

## Indicators Explained

### Money Flow Index (MFI)
The Money Flow Index is a momentum indicator that uses price and volume data to identify overbought or oversold conditions. It's often called "volume-weighted RSI" because it incorporates volume into its calculation.

- **Range**: 0 to 100
- **Overbought**: Above 70
- **Oversold**: Below 30
- **Calculation**: Based on typical price (H+L+C)/3 multiplied by volume

### Relative Strength Index (RSI)
The RSI is a momentum oscillator that measures the speed and magnitude of price changes to identify overbought or oversold conditions.

- **Range**: 0 to 100
- **Overbought**: Above 70
- **Oversold**: Below 30
- **Calculation**: Based on average gains vs. average losses over the specified period

## Installation on TradingView

1. Open TradingView and navigate to the chart where you want to add the indicator
2. Click on "Pine Editor" at the bottom of the screen
3. Copy the contents of `mfi_rsi_indicator.pine`
4. Paste the code into the Pine Editor
5. Click "Add to Chart" or "Save" and then add to your chart

## Configuration Options

The indicator offers several customizable settings:

- **MFI Period** (default: 14): The lookback period for MFI calculation
- **RSI Period** (default: 14): The lookback period for RSI calculation
- **MFI Color** (default: Blue): Color of the MFI line
- **RSI Color** (default: Orange): Color of the RSI line

## Interpreting the Indicator

### Basic Signals

1. **Overbought Conditions** (>70):
   - When either or both indicators are above 70, the asset may be overbought
   - Consider this a potential sell signal or profit-taking opportunity
   - When both MFI and RSI are overbought together, the signal is stronger

2. **Oversold Conditions** (<30):
   - When either or both indicators are below 30, the asset may be oversold
   - Consider this a potential buy signal or entry opportunity
   - When both MFI and RSI are oversold together, the signal is stronger

3. **Divergence**:
   - When MFI and RSI move in opposite directions, it may indicate market uncertainty
   - If price makes a new high but indicators don't confirm, it may signal weakness

4. **Midline (50)**:
   - Crossing above 50 can indicate bullish momentum
   - Crossing below 50 can indicate bearish momentum

### Advanced Usage

- **Confirmation**: Use both indicators together for confirmation of trends
- **Volume Context**: MFI provides volume-weighted perspective that RSI doesn't
- **Alerts**: Set up alerts for when indicators cross key levels (30, 50, 70)

## Alerts

The indicator includes built-in alert conditions:

- MFI crosses above 70 (Overbought)
- MFI crosses below 30 (Oversold)
- RSI crosses above 70 (Overbought)
- RSI crosses below 30 (Oversold)
- Both indicators above 70 (Strong Overbought)
- Both indicators below 30 (Strong Oversold)

To use alerts:
1. Right-click on the indicator
2. Select "Add Alert"
3. Choose your desired alert condition
4. Configure notification preferences

## File Structure

```
/
├── mfi_rsi_indicator.pine    # The Pine Script indicator code
└── README.md                  # This documentation file
```

## Technical Details

- **Pine Script Version**: 5
- **Indicator Type**: Oscillator (displayed in separate panel)
- **Overlay**: False (displays below the main chart)
- **Calculation**: Real-time updates with each new bar

## Best Practices

1. **Don't rely on a single indicator**: Always use multiple forms of analysis
2. **Consider the timeframe**: Indicators work differently on different timeframes
3. **Backtest**: Test the indicator on historical data before using it for live trading
4. **Risk Management**: Always use proper stop-losses and position sizing
5. **Context matters**: Consider overall market conditions and trend direction

## Support and Contributions

This is an open-source indicator. Feel free to modify and customize it to suit your trading style.

## Disclaimer

This indicator is for educational and informational purposes only. It should not be considered financial advice. Always do your own research and consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.

## License

MIT License - Feel free to use and modify as needed.
