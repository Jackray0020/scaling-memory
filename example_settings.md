# Example Settings for Different Trading Styles

## Scalping Settings (1-5 Minute Charts)
```pine
// Recommended for scalping
macd_fast = 5
macd_slow = 13
macd_signal = 6
mfi_length = 10
mfi_overbought = 75
mfi_oversold = 25
```

## Day Trading Settings (15 Minute - 1 Hour Charts)
```pine
// Default settings (good for day trading)
macd_fast = 12
macd_slow = 26
macd_signal = 9
mfi_length = 14
mfi_overbought = 80
mfi_oversold = 20
```

## Swing Trading Settings (4 Hour - Daily Charts)
```pine
// Recommended for swing trading
macd_fast = 19
macd_slow = 39
macd_signal = 9
mfi_length = 20
mfi_overbought = 85
mfi_oversold = 15
```

## Conservative Settings (Lower Risk)
```pine
// For risk-averse traders
macd_fast = 8
macd_slow = 21
macd_signal = 5
mfi_length = 21
mfi_overbought = 70
mfi_oversold = 30
```

## Aggressive Settings (Higher Frequency)
```pine
// For active traders
macd_fast = 3
macd_slow = 10
macd_signal = 3
mfi_length = 7
mfi_overbought = 90
mfi_oversold = 10
```

## How to Apply These Settings

1. Add the indicator to your chart
2. Click the gear icon (⚙️) next to the indicator name
3. Go to the "Inputs" tab
4. Update the values according to your preferred style
5. Click "OK" to apply changes

## Tips for Choosing Settings

- **Shorter Timeframes**: Use shorter periods for faster signals
- **Longer Timeframes**: Use longer periods for more reliable signals
- **Volatile Markets**: Consider longer periods to reduce noise
- **Trending Markets**: Shorter periods can capture trends earlier
- **Range-bound Markets**: Longer periods help avoid false signals

Remember to backtest any settings changes before using them in live trading!
