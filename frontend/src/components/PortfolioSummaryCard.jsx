import React from 'react';
import { Card, CardContent } from './ui/card';
import { Activity, TrendingUp, DollarSign } from 'lucide-react';

const PortfolioSummaryCard = ({ summary, lastUpdated }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (!summary) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md rounded-xl">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = summary.returnPct >= 0;
  const returnColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const gainLossColor = isPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Total</h1>
            </div>
            <p className="text-sm text-gray-600 mb-3">Complete overview</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Activity className="w-3 h-3" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Right Section - Primary KPIs */}
          <div className="flex-1 lg:flex-none lg:w-auto">
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {/* Total Portfolio Value */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">Portfolio Value</span>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.currentValue)}
                </p>
              </div>

              {/* Total Return % */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">Total Return</span>
                </div>
                <p className={`text-xl lg:text-2xl font-bold ${returnColor}`}>
                  {formatPercent(summary.returnPct)}
                </p>
              </div>

              {/* Total Gain/Loss */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">Gain/Loss</span>
                </div>
                <p className={`text-xl lg:text-2xl font-bold ${gainLossColor}`}>
                  {formatCurrency(summary.gainLoss)}
                </p>
              </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="text-center lg:text-left">
                <p className="text-xs text-gray-500 mb-1">Holdings</p>
                <p className="text-sm font-semibold text-gray-700">{summary.totalHoldings || 0}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xs text-gray-500 mb-1">Best Performer</p>
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {summary.bestPerformer?.name || '—'}
                </p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xs text-gray-500 mb-1">Asset Types</p>
                <p className="text-sm font-semibold text-gray-700">{summary.assetTypeCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummaryCard;

