"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function BitcoinPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [rsi, setRsi] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch current price
      const priceRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const priceData = await priceRes.json();
      setPrice(priceData.bitcoin.usd);

      // Fetch market chart data for RSI calculation
      const chartRes = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=14"
      );
      const chartData = await chartRes.json();
      const prices = chartData.prices.map((p: [number, number]) => p[1]);

      // Simple RSI calculation
      const gains: number[] = [];
      const losses: number[] = [];
      for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains.push(change);
        else losses.push(-change);
      }
      const avgGain =
        gains.reduce((a, b) => a + b, 0) / (gains.length || 1);
      const avgLoss =
        losses.reduce((a, b) => a + b, 0) / (losses.length || 1);
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - 100 / (1 + rs);
      setRsi(rsiValue);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const renderArrow = () => {
    if (rsi === null) return null;
    if (rsi >= 70) return <ArrowDown className="text-red-500 size-6" />;
    if (rsi <= 30) return <ArrowUp className="text-green-500 size-6" />;
    return null;
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      {loading ? (
        <span className="text-muted-foreground">Loading...</span>
      ) : (
        <>
          <span className="text-3xl font-bold">
            ${price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          {renderArrow()}
        </>
      )}
    </div>
  );
}
