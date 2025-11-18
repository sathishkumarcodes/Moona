import React from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';

const QuickInsightsRow = ({ portfolioSummary, holdings }) => {
  if (!portfolioSummary || !holdings || holdings.length === 0) {
    return null;
  }

  const insights = [];

  // Outstanding Returns
  const highPerformers = holdings.filter(h => {
    const returnPct = h.return_percent || h.gain_loss_percent || 0;
    return returnPct > 25;
  });
  if (highPerformers.length > 0) {
    insights.push({
      icon: TrendingUp,
      color: 'emerald',
      title: 'Outstanding Returns',
      message: `${highPerformers.length} holding${highPerformers.length > 1 ? 's are' : ' is'} up more than 25% this quarter.`
    });
  }

  // Concentration Alert
  if (portfolioSummary.currentValue > 0) {
    const sortedHoldings = [...holdings].sort((a, b) => {
      const valA = a.total_value || a.current_value || 0;
      const valB = b.total_value || b.current_value || 0;
      return valB - valA;
    });
    const top3Value = sortedHoldings.slice(0, 3).reduce((sum, h) => {
      return sum + (h.total_value || h.current_value || 0);
    }, 0);
    const top3Percent = (top3Value / portfolioSummary.currentValue) * 100;
    
    if (top3Percent > 40) {
      insights.push({
        icon: AlertTriangle,
        color: 'amber',
        title: 'Concentration Alert',
        message: `Top 3 holdings = ${top3Percent.toFixed(0)}% of portfolio value.`
      });
    }
  }

  // Diversification
  const assetTypes = new Set(holdings.map(h => h.type || h.asset_type).filter(Boolean));
  const sectors = new Set(holdings.map(h => h.sector).filter(Boolean));
  if (assetTypes.size > 0 || sectors.size > 0) {
    insights.push({
      icon: Target,
      color: 'blue',
      title: 'Diversification',
      message: `You're exposed to ${sectors.size || assetTypes.size} ${sectors.size > 0 ? 'sectors' : 'asset types'} and ${assetTypes.size} asset class${assetTypes.size > 1 ? 'es' : ''}.`
    });
  }

  if (insights.length === 0) {
    return null;
  }

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      amber: 'bg-amber-50 border-amber-200 text-amber-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.slice(0, 3).map((insight, idx) => {
        const Icon = insight.icon;
        return (
          <Card key={idx} className={`${getColorClasses(insight.color)} border shadow-sm rounded-xl`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 text-${insight.color}-600`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1">{insight.title}</h4>
                  <p className="text-xs leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickInsightsRow;

