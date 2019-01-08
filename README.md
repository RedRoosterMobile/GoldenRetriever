# GoldenRetriever

This is a 'long term trading bot' for silver, that would have worked the last 100 years.

It just tells you to buy, hold or sell (physical) silver.

It uses the gold/silver ratio as an indicator.

https://www.macrotrends.net/1441/gold-to-silver-ratio

Historically the ratio is at 1:15. This means you have to put 15 ounces of silver on the table to get one ounce of gold.

- When ratio is above 80, **BUY**
- below 50 or 45 **SELL**, 
- in between **HOLD**.

When you look at the historic silver price, you'll find that when the ratio is low, silver is overvalued. So good to sell.


## Install

`yarn install`

## Run

`node index.js`

## Ideas

Make it run as a cronjob, that writes the value into a text file, and display it's value in your console
