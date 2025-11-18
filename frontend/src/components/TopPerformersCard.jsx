import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const TopPerformersCard = ({ topPerformers }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (!topPerformers || topPerformers.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-gray-600" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No performance data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2 text-gray-600" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 border-b border-gray-200 pb-2">
            <div>Symbol</div>
            <div>Name</div>
            <div className="text-right">Return %</div>
            <div className="text-right">Value</div>
          </div>

          {/* Rows */}
          {topPerformers.slice(0, 5).map((performer, idx) => {
            const returnPct = performer.return_percent || performer.gain_loss_percent || 0;
            const isPositive = returnPct >= 0;
            const value = performer.total_value || performer.current_value || 0;

            return (
              <div
                key={idx}
                className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 last:border-0 text-sm hover:bg-gray-50 rounded transition-colors"
              >
                <div className="font-semibold text-gray-900">{performer.symbol}</div>
                <div className="text-gray-700 truncate">{performer.name || performer.symbol}</div>
                <div className={`text-right font-medium flex items-center justify-end gap-1 ${
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercent(returnPct)}
                </div>
                <div className="text-right text-gray-700 font-medium">{formatCurrency(value)}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformersCard;

