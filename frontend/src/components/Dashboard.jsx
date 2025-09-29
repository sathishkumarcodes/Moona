import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Activity, Target, Wallet, Plus, RefreshCw } from 'lucide-react';
import { 
  mockSPYComparison, 
  mockMonthlyContributions 
} from '../mock';
import InvestmentList from './InvestmentList';
import SPYComparison from './SPYComparison';
import PerformanceChart from './PerformanceChart';
import PieChart from './PieChart';
import ContributionChart from './ContributionChart';
import AssetBreakdownChart from './AssetBreakdownChart';
import AddHoldingModal from './AddHoldingModal';
import EditHoldingModal from './EditHoldingModal';
import holdingsService from '../services/holdingsService';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [holdings, setHoldings] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const { toast } = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (value) => {
    return value >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getChangeBgColor = (value) => {
    return value >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formatCurrency(mockPortfolio.totalValue)}
              </div>
              <div className={`text-sm flex items-center mt-2 ${getChangeColor(mockPortfolio.dailyChange)}`}>
                {mockPortfolio.dailyChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {formatCurrency(Math.abs(mockPortfolio.dailyChange))} ({formatPercent(mockPortfolio.dailyChangePercent)}) today
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <PieChartIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formatCurrency(mockPortfolio.totalCost)}
              </div>
              <p className="text-sm text-gray-600 mt-2">Initial investment</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Gain/Loss</CardTitle>
              <div className={`p-2 rounded-lg ${mockPortfolio.totalGainLoss >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getChangeColor(mockPortfolio.totalGainLoss)}`}>
                {formatCurrency(mockPortfolio.totalGainLoss)}
              </div>
              <Badge variant="outline" className={`mt-2 ${getChangeBgColor(mockPortfolio.totalGainLoss)} border-0 font-semibold`}>
                <span className={getChangeColor(mockPortfolio.totalGainLoss)}>
                  {formatPercent(mockPortfolio.totalGainLossPercent)}
                </span>
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assets</CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{mockInvestments.length}</div>
              <div className="text-sm text-gray-600 mt-2">
                {mockInvestments.filter(inv => inv.type === 'stock').length} stocks, {' '}
                {mockInvestments.filter(inv => inv.type === 'crypto').length} crypto, {' '}
                {mockInvestments.filter(inv => inv.type === 'roth_ira').length} roth ira
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Analytics</TabsTrigger>
            <TabsTrigger value="allocation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Allocation</TabsTrigger>
            <TabsTrigger value="investments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">Holdings</TabsTrigger>
            <TabsTrigger value="spy-comparison" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-200">vs SPY</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-xl">
                  <CardTitle className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg mr-3">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    Portfolio Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <PerformanceChart data={mockPerformanceHistory} />
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-xl">
                  <CardTitle className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {mockInvestments
                      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                      .slice(0, 6)
                      .map((investment) => (
                        <div key={investment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700">
                                {investment.symbol.substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{investment.symbol}</div>
                              <div className="text-xs text-gray-600 capitalize">{investment.type.replace('_', ' ')}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{formatCurrency(investment.totalValue)}</div>
                            <div className={`text-xs flex items-center ${getChangeColor(investment.gainLoss)}`}>
                              {investment.gainLoss >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {formatPercent(investment.gainLossPercent)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Asset Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stocks</span>
                      <span className="font-medium">{mockInvestments.filter(i => i.type === 'stock').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Crypto</span>
                      <span className="font-medium">{mockInvestments.filter(i => i.type === 'crypto').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Roth IRA</span>
                      <span className="font-medium">{mockInvestments.filter(i => i.type === 'roth_ira').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Best Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const best = mockInvestments.sort((a, b) => b.gainLossPercent - a.gainLossPercent)[0];
                    return (
                      <div>
                        <div className="font-semibold">{best.symbol}</div>
                        <div className="text-sm text-gray-600">{best.name}</div>
                        <div className="text-lg font-bold text-emerald-600 mt-1">
                          +{formatPercent(best.gainLossPercent)}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Monthly Avg</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(mockMonthlyContributions.reduce((sum, item) => sum + item.amount, 0) / mockMonthlyContributions.length)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">contribution</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Asset Type Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AssetBreakdownChart data={mockPerformanceHistory} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Monthly Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContributionChart data={mockMonthlyContributions} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Portfolio vs SPY Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={mockPerformanceHistory} showComparison={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2" />
                    Asset Type Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart data={mockAllocation} size={250} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Sector Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart data={mockSectorAllocation} size={250} />
                </CardContent>
              </Card>
            </div>

            {/* Allocation Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Asset Type</h4>
                    <div className="space-y-2">
                      {mockAllocation.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: item.color }}
                            />
                            {item.type}
                          </span>
                          <span className="font-medium">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Profile</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>High Risk (Crypto)</span>
                        <span className="font-medium">41.56%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Risk (Stocks)</span>
                        <span className="font-medium">25.43%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Risk (ETFs)</span>
                        <span className="font-medium">31.41%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Diversification</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Assets</span>
                        <span className="font-medium">{mockInvestments.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sectors</span>
                        <span className="font-medium">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Largest Holding</span>
                        <span className="font-medium">17.75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentList investments={mockInvestments} />
          </TabsContent>

          <TabsContent value="spy-comparison">
            <SPYComparison comparison={mockSPYComparison} performanceData={mockPerformanceHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;