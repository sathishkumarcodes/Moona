import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const DailyInsightCard = ({ date }) => {
  const [insight, setInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsight = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = date ? { date } : {};
      const response = await axios.get(`${API}/api/insights/daily`, {
        params,
        withCredentials: true,
        timeout: 15000
      });
      setInsight(response.data);
    } catch (err) {
      console.error('Error fetching daily insight:', err);
      setError(err.response?.data?.detail || 'Failed to load insight');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [date]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-gray-600">Analyzing your portfolio...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
            <Button
              onClick={fetchInsight}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insight) {
    return null;
  }

  const isPositive = insight.changePct >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const bgGradient = isPositive 
    ? 'from-emerald-50 via-green-50 to-teal-50' 
    : 'from-red-50 via-orange-50 to-amber-50';
  const borderColor = isPositive ? 'border-emerald-200' : 'border-red-200';

  return (
    <Card className={`bg-gradient-to-br ${bgGradient} ${borderColor} shadow-md hover:shadow-lg transition-all duration-300 card-hover rounded-xl`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center text-gray-900 mb-2">
              <div className={`p-2 rounded-lg mr-3 ${isPositive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <Lightbulb className={`w-5 h-5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
              <span className="text-xl font-bold">Daily Portfolio Insight</span>
            </CardTitle>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${isPositive ? 'bg-emerald-100' : 'bg-red-100'} flex-shrink-0`}>
            <span className={`text-sm font-bold ${changeColor}`}>
              {formatPercent(insight.changePct)}
            </span>
            <span className={`text-xs ml-2 ${changeColor} opacity-75`}>
              {formatCurrency(insight.changeValue)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lead Sentence */}
        <div>
          <p className="text-lg font-semibold text-gray-900 mb-3">
            {insight.headline}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {insight.details}
          </p>
        </div>

        {/* Key Drivers - Compact Format */}
        {insight.keyDrivers && insight.keyDrivers.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/30">
            <div className="flex flex-wrap gap-3">
              {insight.keyDrivers.slice(0, 3).map((driver, idx) => {
                const isPositiveDriver = driver.includes('+');
                const parts = driver.split(':');
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/40"
                  >
                    <span className="text-xs font-semibold text-gray-700">
                      {parts[0]}
                    </span>
                    <span className={`text-xs font-bold ${
                      isPositiveDriver ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {parts[1]?.trim()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attribution Summary - Compact */}
        {insight.attribution && (
          <div className="flex items-center gap-4 pt-3 border-t border-white/30 text-xs">
            {insight.attribution.topGainers && insight.attribution.topGainers.length > 0 && (
              <div>
                <span className="text-gray-600">Top Gainer: </span>
                <span className="font-semibold text-emerald-600">
                  {insight.attribution.topGainers[0].symbol}
                </span>
              </div>
            )}
            {insight.attribution.topLosers && insight.attribution.topLosers.length > 0 && (
              <div>
                <span className="text-gray-600">Top Loser: </span>
                <span className="font-semibold text-red-600">
                  {insight.attribution.topLosers[0].symbol}
                </span>
              </div>
            )}
            {insight.attribution.concentration && (
              <div>
                <span className="text-gray-600">Concentration: </span>
                <span className="font-semibold text-gray-700">
                  {insight.attribution.concentration.topHoldingPct?.toFixed(0) || 0}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/60 hover:bg-white/80 border-white/50 text-gray-700 rounded-lg"
            onClick={() => {
              // Future: Open detailed insights modal
              console.log('Explain more clicked');
            }}
          >
            <span>Explain More</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyInsightCard;

