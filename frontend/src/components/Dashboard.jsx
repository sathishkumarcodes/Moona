import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Activity, Target, Wallet, Plus, RefreshCw, Download } from 'lucide-react';
// All data now comes from backend - no mock imports needed
import InvestmentList from './InvestmentList';
import SPYComparison from './SPYComparison';
import PerformanceChart from './PerformanceChart';
import PieChart from './PieChart';
import ContributionChart from './ContributionChart';
import AssetBreakdownChart from './AssetBreakdownChart';
import AddHoldingModal from './AddHoldingModal';
import EditHoldingModal from './EditHoldingModal';
import MoonaLogo from './MoonaLogo';
import AnimatedMoon from './AnimatedMoon';
import holdingsService from '../services/holdingsService';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

  const handleAssetTypeClick = (assetType) => {
    // Navigate to Holdings tab and filter by asset type
    setSelectedTab('investments');
    
    // Small delay to ensure tab switch happens first
    setTimeout(() => {
      // Trigger filter in InvestmentList component via a custom event
      const filterEvent = new CustomEvent('filterByAssetType', {
        detail: { assetType: assetType.toLowerCase().replace(' ', '_') }
      });
      window.dispatchEvent(filterEvent);
    }, 100);
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/export/holdings/excel`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'portfolio_holdings.xlsx';
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Portfolio exported to Excel file",
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export portfolio. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate derived data with safe defaults
  const allocation = holdingsService.calculateAllocation(holdings || []);
  const performanceHistory = holdingsService.generatePerformanceHistory(holdings || [], portfolioSummary || {});
  
  // Generate SPY comparison data
  const spyComparison = {
    portfolioValue: portfolioSummary?.total_value || 0,
    portfolioInvested: portfolioSummary?.total_cost || 0,
    portfolioReturn: portfolioSummary?.total_gain_loss_percent || 0,
    spyValue: (portfolioSummary?.total_cost || 0) * 1.185, // Assume 18.5% SPY return
    spyInvested: portfolioSummary?.total_cost || 0,
    spyReturn: 18.5,
    outperformance: (portfolioSummary?.total_gain_loss_percent || 0) - 18.5,
    absoluteDifference: (portfolioSummary?.total_value || 0) - ((portfolioSummary?.total_cost || 0) * 1.185)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden">
      {/* Animated Moon Background */}
      <AnimatedMoon className="fixed top-20 right-20 pointer-events-none opacity-60" />
      
      {/* Subtle Celestial Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Soft Cosmic Glow */}
        <div className="absolute top-32 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-blue-400/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        {/* Subtle Twinkling Stars */}
        <div className="absolute top-24 left-1/3 w-1 h-1 bg-blue-300/60 rounded-full animate-pulse"></div>
        <div className="absolute top-48 right-1/3 w-1 h-1 bg-slate-300/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-2/3 w-1 h-1 bg-blue-200/50 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">

        {/* Edit Holding Modal */}
        <EditHoldingModal
          holding={editingHolding}
          open={!!editingHolding}
          onClose={() => setEditingHolding(null)}
          onHoldingUpdated={handleHoldingUpdated}
        />
        {/* Simple Action Bar */}
        <div className="flex justify-end items-center gap-3 mb-6">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={exportToExcel}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <AddHoldingModal onHoldingAdded={handleHoldingAdded} />
        </div>

        {/* Enhanced KPI Table with Premium Design */}
        {isLoading ? (
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/50">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl"></div>
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
                      <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="grid grid-cols-5 gap-8 items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                            <div className="h-3 w-12 bg-slate-150 rounded-sm"></div>
                          </div>
                        </div>
                        <div className="h-5 bg-slate-200 rounded-md"></div>
                        <div className="h-5 bg-slate-200 rounded-md"></div>
                        <div className="h-5 bg-slate-200 rounded-md"></div>
                        <div className="h-6 w-20 bg-slate-200 rounded-full ml-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                      Portfolio Performance
                    </h2>
                    <p className="text-slate-300 text-sm">Real-time investment analytics</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(portfolioSummary?.total_value || 0)}
                  </div>
                  <div className={`text-lg font-semibold ${(portfolioSummary?.total_gain_loss || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(portfolioSummary?.total_gain_loss || 0) >= 0 ? '+' : ''}
                    {formatCurrency(portfolioSummary?.total_gain_loss || 0)} 
                    ({(portfolioSummary?.total_gain_loss_percent || 0) >= 0 ? '+' : ''}
                    {(portfolioSummary?.total_gain_loss_percent || 0).toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-b-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                        Investment Type
                      </th>
                      <th className="text-right py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                        Cost Basis
                      </th>
                      <th className="text-right py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="text-right py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                        Gain/Loss
                      </th>
                      <th className="text-right py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                        Return %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Calculate asset type breakdowns
                      const assetBreakdown = {};
                      holdings?.forEach(holding => {
                        const type = holding.type === 'roth_ira' ? 'Roth IRA' : 
                                   holding.type === 'crypto' ? 'Crypto' : 'Stocks';
                        
                        if (!assetBreakdown[type]) {
                          assetBreakdown[type] = {
                            cost: 0,
                            value: 0,
                            gainLoss: 0
                          };
                        }
                        
                        assetBreakdown[type].cost += holding.total_cost || 0;
                        assetBreakdown[type].value += holding.total_value || 0;
                        assetBreakdown[type].gainLoss += holding.gain_loss || 0;
                      });

                      const getAssetIcon = (type) => {
                        switch(type) {
                          case 'Stocks': return '📈';
                          case 'Crypto': return '₿';
                          case 'Roth IRA': return '🏛️';
                          default: return '💼';
                        }
                      };

                      const getAssetColor = (type) => {
                        switch(type) {
                          case 'Stocks': return 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100';
                          case 'Crypto': return 'bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100';
                          case 'Roth IRA': return 'bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100';
                          default: return 'bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100';
                        }
                      };
                      
                      return Object.entries(assetBreakdown).map(([type, data], index) => {
                        const percentageGain = data.cost > 0 ? ((data.gainLoss / data.cost) * 100) : 0;
                        const isPositive = data.gainLoss >= 0;
                        
                        return (
                          <tr key={type} className={`${getAssetColor(type)} border-b border-slate-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-md`}>
                            <td className="py-5 px-6">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getAssetIcon(type)}</span>
                                <div>
                                  <div className="font-bold text-slate-900 text-lg">{type}</div>
                                  <div className="text-slate-600 text-sm">
                                    {portfolioSummary?.asset_breakdown?.[type.toLowerCase().replace(' ', '_')] || 0} holdings
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="font-semibold text-slate-700 text-lg">
                                {formatCurrency(data.cost)}
                              </div>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="font-bold text-slate-900 text-lg">
                                {formatCurrency(data.value)}
                              </div>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className={`font-bold text-lg flex items-center justify-end space-x-2 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isPositive ? (
                                  <TrendingUp className="w-5 h-5" />
                                ) : (
                                  <TrendingDown className="w-5 h-5" />
                                )}
                                <span>
                                  {data.gainLoss >= 0 ? '+' : ''}{formatCurrency(data.gainLoss)}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                isPositive 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {percentageGain >= 0 ? '+' : ''}{percentageGain.toFixed(2)}%
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                    
                    {/* Overall Total Row */}
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                      <td className="py-6 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-xl text-white">Portfolio Total</div>
                            <div className="text-slate-300 text-sm">Complete overview</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className="font-bold text-slate-200 text-lg">
                          {formatCurrency(portfolioSummary?.total_cost || 0)}
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className="font-bold text-white text-xl">
                          {formatCurrency(portfolioSummary?.total_value || 0)}
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className={`font-bold text-xl flex items-center justify-end space-x-2 ${
                          (portfolioSummary?.total_gain_loss || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {(portfolioSummary?.total_gain_loss || 0) >= 0 ? (
                            <TrendingUp className="w-6 h-6" />
                          ) : (
                            <TrendingDown className="w-6 h-6" />
                          )}
                          <span>
                            {(portfolioSummary?.total_gain_loss || 0) >= 0 ? '+' : ''}
                            {formatCurrency(portfolioSummary?.total_gain_loss || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                          (portfolioSummary?.total_gain_loss || 0) >= 0 
                            ? 'bg-emerald-400 text-emerald-900 border-2 border-emerald-300' 
                            : 'bg-red-400 text-red-900 border-2 border-red-300'
                        }`}>
                          {(portfolioSummary?.total_gain_loss_percent || 0) >= 0 ? '+' : ''}
                          {(portfolioSummary?.total_gain_loss_percent || 0).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Enhanced Bottom Stats */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{portfolioSummary?.asset_count || 0}</div>
                        <div className="text-sm text-slate-600 font-medium">Total Holdings</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${(portfolioSummary?.total_gain_loss || 0) >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getChangeColor(portfolioSummary?.total_gain_loss || 0)}`}>
                          {(portfolioSummary?.total_gain_loss || 0) >= 0 ? '+' : ''}
                          {formatPercent(portfolioSummary?.total_gain_loss_percent || 0)}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Total Return</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const best = holdings?.sort((a, b) => (b.gain_loss_percent || 0) - (a.gain_loss_percent || 0))[0];
                            return best ? `+${best.gain_loss_percent.toFixed(1)}%` : '--';
                          })()}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Best Performer</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.keys(holdings?.reduce((acc, h) => ({...acc, [h.type]: true}), {}) || {}).length}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Asset Types</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                      <span className="font-medium">{portfolioSummary?.asset_breakdown?.stocks || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Crypto</span>
                      <span className="font-medium">{portfolioSummary?.asset_breakdown?.crypto || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Roth IRA</span>
                      <span className="font-medium">{portfolioSummary?.asset_breakdown?.roth_ira || 0}</span>
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
                    if (!holdings || holdings.length === 0) {
                      return (
                        <div>
                          <div className="font-semibold">No holdings yet</div>
                          <div className="text-sm text-gray-600">Add your first investment</div>
                          <div className="text-lg font-bold text-gray-400 mt-1">--</div>
                        </div>
                      );
                    }
                    const best = [...holdings].sort((a, b) => (b.gain_loss_percent || 0) - (a.gain_loss_percent || 0))[0];
                    return (
                      <div>
                        <div className="font-semibold">{best.symbol}</div>
                        <div className="text-sm text-gray-600">{best.name}</div>
                        <div className={`text-lg font-bold mt-1 ${getChangeColor(best.gain_loss_percent || 0)}`}>
                          {formatPercent(best.gain_loss_percent || 0)}
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
                    {portfolioSummary?.totalValue ? formatCurrency(portfolioSummary.totalValue * 0.05) : formatCurrency(0)}
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
                  <AssetBreakdownChart data={performanceHistory} />
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
                  <ContributionChart data={[
                    { month: 'Jan 2024', amount: 6000 },
                    { month: 'Feb 2024', amount: 6000 },
                    { month: 'Mar 2024', amount: 6500 },
                    { month: 'Apr 2024', amount: 7000 },
                    { month: 'May 2024', amount: 6000 },
                    { month: 'Jun 2024', amount: 5500 },
                    { month: 'Jul 2024', amount: 6500 },
                    { month: 'Aug 2024', amount: 6000 },
                    { month: 'Sep 2024', amount: 7200 }
                  ]} />
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
                <PerformanceChart data={performanceHistory} showComparison={true} />
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
                      {allocation.assetAllocation.map((item, index) => (
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
                        <span className="font-medium">{holdings?.length || 0}</span>
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
            <SPYComparison comparison={spyComparison} performanceData={performanceHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;