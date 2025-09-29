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

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [holdingsData, summaryData] = await Promise.all([
        holdingsService.getHoldings(),
        holdingsService.getPortfolioSummary()
      ]);
      
      setHoldings(holdingsData);
      setPortfolioSummary(summaryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load portfolio data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await loadDashboardData();
      toast({
        title: "Data Refreshed",
        description: "Portfolio data has been updated with latest prices",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed", 
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleHoldingAdded = () => {
    loadDashboardData();
  };

  const handleHoldingUpdated = () => {
    loadDashboardData();
    setEditingHolding(null);
  };

  const handleHoldingDeleted = () => {
    loadDashboardData();
  };

  // Calculate derived data with safe defaults
  const allocation = holdingsService.calculateAllocation(holdings || []);
  const performanceHistory = holdingsService.generatePerformanceHistory(holdings || [], portfolioSummary || {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Edit Holding Modal */}
        <EditHoldingModal
          holding={editingHolding}
          open={!!editingHolding}
          onClose={() => setEditingHolding(null)}
          onHoldingUpdated={handleHoldingUpdated}
        />
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h2>
            <p className="text-gray-600">Manage and track your investments in real-time</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={refreshData}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <AddHoldingModal onHoldingAdded={handleHoldingAdded} />
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
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
                  {formatCurrency(portfolioSummary?.total_value || 0)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Live market prices
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
                  {formatCurrency(portfolioSummary?.total_cost || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">Initial investment</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Gain/Loss</CardTitle>
                <div className={`p-2 rounded-lg ${(portfolioSummary?.total_gain_loss || 0) >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getChangeColor(portfolioSummary?.total_gain_loss || 0)}`}>
                  {formatCurrency(portfolioSummary?.total_gain_loss || 0)}
                </div>
                <Badge variant="outline" className={`mt-2 ${getChangeBgColor(portfolioSummary?.total_gain_loss || 0)} border-0 font-semibold`}>
                  <span className={getChangeColor(portfolioSummary?.total_gain_loss || 0)}>
                    {formatPercent(portfolioSummary?.total_gain_loss_percent || 0)}
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
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{portfolioSummary?.asset_count || 0}</div>
                <div className="text-sm text-gray-600 mt-2">
                  {portfolioSummary?.asset_breakdown?.stocks || 0} stocks, {' '}
                  {portfolioSummary?.asset_breakdown?.crypto || 0} crypto, {' '}
                  {portfolioSummary?.asset_breakdown?.roth_ira || 0} roth ira
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                  <PerformanceChart data={performanceHistory} />
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
                    {(holdings || [])
                      .sort((a, b) => (b.gain_loss_percent || 0) - (a.gain_loss_percent || 0))
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
                            <div className="font-medium text-sm">{formatCurrency(investment.total_value)}</div>
                            <div className={`text-xs flex items-center ${getChangeColor(investment.gain_loss)}`}>
                              {investment.gain_loss >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {formatPercent(investment.gain_loss_percent)}
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
                  <PieChart data={allocation.assetAllocation} size={250} />
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
                  <PieChart data={allocation.sectorAllocation} size={250} />
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
            <InvestmentList 
              investments={holdings || []} 
              onEdit={setEditingHolding}
              onDelete={handleHoldingDeleted}
              isLoading={isLoading}
            />
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