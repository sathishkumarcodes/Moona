import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const AssetClassBreakdown = ({ holdings }) => {
  const [isExpanded, setIsExpanded] = useState(true);

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

  const formatAssetTypeName = (type) => {
    const names = {
      'stock': 'Stocks',
      'stocks': 'Stocks',
      'crypto': 'Crypto',
      'cryptocurrency': 'Crypto',
      'roth_ira': 'Roth IRA',
      'roth ira': 'Roth IRA',
      'etf': 'ETF',
      'bond': 'Bonds',
      '401k': '401(k)',
      '529': '529 Plan',
      'child_roth': "Child's Roth IRA",
      'childs_roth': "Child's Roth IRA",
      'hsa': 'HSA',
      'traditional_ira': 'Traditional IRA',
      'sep_ira': 'SEP IRA',
      'other': 'Other'
    };
    const normalized = type?.toLowerCase().replace(/\s+/g, '_');
    return names[normalized] || type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getAssetTypeColor = (assetType) => {
    const normalized = assetType?.toLowerCase().replace(/\s+/g, '_');
    const colors = {
      'stock': '#059669',
      'stocks': '#059669',
      'crypto': '#dc2626',
      'cryptocurrency': '#dc2626',
      'roth_ira': '#7c3aed',
      'roth ira': '#7c3aed',
      'etf': '#3b82f6',
      'bond': '#f59e0b',
      '401k': '#10b981',
      '529': '#06b6d4',
      'child_roth': '#a855f7',
      'childs_roth': '#a855f7',
      'hsa': '#f97316',
      'traditional_ira': '#6366f1',
      'sep_ira': '#8b5cf6',
      'other': '#6b7280'
    };
    return colors[normalized] || colors['other'];
  };

  // Calculate breakdown by asset class
  const assetClassData = useMemo(() => {
    if (!holdings || holdings.length === 0) return [];

    const breakdown = {};

    holdings.forEach(holding => {
      const assetType = (holding.type || 'other').toLowerCase();
      const normalizedType = assetType === 'cryptocurrency' ? 'crypto' : 
                            assetType === 'stocks' ? 'stock' : 
                            assetType === 'roth ira' ? 'roth_ira' : assetType;

      if (!breakdown[normalizedType]) {
        breakdown[normalizedType] = {
          assetType: normalizedType,
          investment: 0,
          currentValue: 0,
          gainLoss: 0
        };
      }

      const investment = holding.total_cost || 0;
      const currentValue = holding.total_value || 0;
      const gainLoss = currentValue - investment;

      breakdown[normalizedType].investment += investment;
      breakdown[normalizedType].currentValue += currentValue;
      breakdown[normalizedType].gainLoss += gainLoss;
    });

    // Convert to array and calculate percentages
    return Object.values(breakdown)
      .map(item => ({
        ...item,
        percentageGain: item.investment > 0 
          ? ((item.gainLoss / item.investment) * 100) 
          : 0
      }))
      .sort((a, b) => b.currentValue - a.currentValue); // Sort by current value descending
  }, [holdings]);

  if (!holdings || holdings.length === 0 || assetClassData.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Asset Class Breakdown</h3>
          <span className="text-sm text-gray-500 font-normal">
            ({assetClassData.length} {assetClassData.length === 1 ? 'class' : 'classes'})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Asset Class</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost Basis</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Current Value</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Gain/Loss</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Percentage Gain</th>
                </tr>
              </thead>
              <tbody>
                {assetClassData.map((item, index) => {
                  const isPositive = item.gainLoss >= 0;
                  const GainIcon = isPositive ? TrendingUp : TrendingDown;
                  
                  return (
                    <tr
                      key={item.assetType}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                        index === assetClassData.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getAssetTypeColor(item.assetType) }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {formatAssetTypeName(item.assetType)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.investment)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.currentValue)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <GainIcon className={`h-4 w-4 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`} />
                          <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(item.gainLoss)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatPercent(item.percentageGain)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AssetClassBreakdown;

