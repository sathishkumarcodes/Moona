import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3, Activity, Target, Wallet, Plus, RefreshCw, Download, Layers } from 'lucide-react';
// All data now comes from backend - no mock imports needed
import InvestmentList from './InvestmentList';
import SPYComparison from './SPYComparison';
import PerformanceChart from './PerformanceChart';
import PieChart from './PieChart';
import ContributionChart from './ContributionChart';
import AssetBreakdownChart from './AssetBreakdownChart';
import AssetClassBarChart from './AssetClassBarChart';
import PortfolioPieChart from './PortfolioPieChart';
import AddHoldingModal from './AddHoldingModal';
import EditHoldingModal from './EditHoldingModal';
import ImportHoldingsModal from './ImportHoldingsModal';
import MoonaLogo from './MoonaLogo';
import AnimatedMoon from './AnimatedMoon';
import PortfolioSummaryRow from './PortfolioSummaryRow';
import KPICard from './KPICard';
import holdingsService from '../services/holdingsService';
import portfolioService from '../services/portfolioService';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  // Helper function to get asset type color
  const getAssetTypeColor = (assetType) => {
    const colors = {
      'stock': '#059669',
      'stocks': '#059669',
      'crypto': '#dc2626',
      'roth_ira': '#7c3aed',
      'roth ira': '#7c3aed',
      'etf': '#3b82f6',
      'bond': '#f59e0b',
      'other': '#6b7280'
    };
    return colors[assetType?.toLowerCase()] || colors['other'];
  };

  const [selectedTab, setSelectedTab] = useState('overview');
  const [holdings, setHoldings] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [portfolioPerformance, setPortfolioPerformance] = useState(null);
  const [portfolioAllocation, setPortfolioAllocation] = useState(null);
  const [spyComparison, setSpyComparison] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
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
      
      // Load critical data first (holdings and summary), then load analytics in parallel
      // This provides faster initial render
      const [holdingsResult, summaryResult] = await Promise.allSettled([
        holdingsService.getHoldings().catch(err => {
          console.error('Error loading holdings:', err);
          return [];
        }),
        portfolioService.getSummary().catch(err => {
          console.error('Error loading summary:', err);
          return null;
        })
      ]);
      
      // Set critical data immediately for faster UI update
      const loadedHoldings = holdingsResult.status === 'fulfilled' ? holdingsResult.value : [];
      console.log('Dashboard - holdingsResult.status:', holdingsResult.status);
      console.log('Dashboard - loadedHoldings:', loadedHoldings);
      console.log('Dashboard - loadedHoldings.length:', Array.isArray(loadedHoldings) ? loadedHoldings.length : 'not an array');
      console.log('Dashboard - loadedHoldings type:', typeof loadedHoldings);
      
      // Ensure holdings is always an array
      const safeHoldings = Array.isArray(loadedHoldings) ? loadedHoldings : [];
      console.log('Dashboard - safeHoldings.length:', safeHoldings.length);
      setHoldings(safeHoldings);
      
      // Show success message if holdings were loaded
      if (safeHoldings.length > 0) {
        console.log(`✅ Successfully loaded ${safeHoldings.length} holdings`);
      } else if (holdingsResult.status === 'fulfilled') {
        console.warn('⚠️ API returned empty array - no holdings found');
      } else {
        console.error('❌ Failed to load holdings:', holdingsResult.reason);
      }
      
      setPortfolioSummary(summaryResult.status === 'fulfilled' ? summaryResult.value : null);
      
      // Load analytics data in parallel (can load in background)
      const analyticsResults = await Promise.allSettled([
        portfolioService.getPerformance().catch(err => {
          console.error('Error loading performance:', err);
          return null;
        }),
        portfolioService.getAllocation().catch(err => {
          console.error('Error loading allocation:', err);
          return null;
        }),
        portfolioService.getSPYComparison().catch(err => {
          console.error('Error loading SPY comparison:', err);
          return null;
        }),
        portfolioService.getTopPerformers(5).catch(err => {
          console.error('Error loading top performers:', err);
          return [];
        })
      ]);
      
      // Update analytics data
      const [
        performanceResult,
        allocationResult,
        spyResult,
        topPerformersResult
      ] = analyticsResults;
      
      setPortfolioPerformance(performanceResult.status === 'fulfilled' ? performanceResult.value : null);
      setPortfolioAllocation(allocationResult.status === 'fulfilled' ? allocationResult.value : null);
      setSpyComparison(spyResult.status === 'fulfilled' ? spyResult.value : null);
      setTopPerformers(topPerformersResult.status === 'fulfilled' ? topPerformersResult.value : []);
      setLastUpdated(new Date());
      
      // Show error toast only if critical requests failed
      const allResults = [holdingsResult, summaryResult, ...analyticsResults];
      const failedCount = allResults.filter(r => r.status === 'rejected').length;
      if (failedCount === allResults.length) {
        toast({
          title: "Error Loading Data",
          description: "Failed to load portfolio data. Please check your connection and try again.",
          variant: "destructive"
        });
      } else if (failedCount > 0) {
        toast({
          title: "Partial Data Loaded",
          description: `Some data failed to load (${failedCount} of ${allResults.length} requests). Please refresh to retry.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: error.response?.data?.detail || error.message || "Failed to load portfolio data. Please try again.",
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

  // Calculate derived data with safe defaults (for backward compatibility)
  const allocation = holdingsService.calculateAllocation(holdings || []);
  const performanceHistory = portfolioPerformance?.portfolioPerformance || holdingsService.generatePerformanceHistory(holdings || [], portfolioSummary || {});

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
        <div className="flex justify-end items-center gap-3 mb-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">
              Last updated: {lastUpdated.toLocaleTimeString()}
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
          <ImportHoldingsModal onImportComplete={handleHoldingAdded} />
          <AddHoldingModal onHoldingAdded={handleHoldingAdded} />
        </div>

        {/* Header Summary Strip - Common to all tabs */}
        {isLoading ? (
          <div className="mb-6 space-y-4">
            <div className="bg-white rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-4">
            {/* A. Portfolio Summary Row */}
            <PortfolioSummaryRow 
              summary={portfolioSummary ? {
                costBasis: portfolioSummary.costBasis,
                currentValue: portfolioSummary.currentValue,
                gainLoss: portfolioSummary.gainLoss,
                returnPct: portfolioSummary.returnPct
              } : null}
            />

            {/* B. KPI Tiles Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KPICard
                icon={Activity}
                title="Total Holdings"
                value={portfolioSummary?.totalHoldings || 0}
                subtitle="Total Holdings"
                emptyState={portfolioSummary?.totalHoldings === 0 ? "No holdings yet" : null}
              />
              <KPICard
                icon={TrendingUp}
                title="Total Return %"
                value={portfolioSummary ? formatPercent(portfolioSummary.returnPct) : "0.00%"}
                subtitle="Total Return"
                valueColor={portfolioSummary?.returnPct >= 0 ? "text-emerald-600" : portfolioSummary?.returnPct < 0 ? "text-red-600" : "text-gray-600"}
                emptyState={portfolioSummary?.totalHoldings === 0 ? "No return data" : null}
              />
              <KPICard
                icon={Target}
                title="Best Performer"
                value={portfolioSummary?.bestPerformer 
                  ? `${portfolioSummary.bestPerformer.name} (${formatPercent(portfolioSummary.bestPerformer.returnPct)})`
                  : "No holdings yet"}
                subtitle="Best Performer"
                emptyState={portfolioSummary?.totalHoldings === 0 ? "No holdings yet – add your first investment" : null}
              />
              <KPICard
                icon={Layers}
                title="Asset Types"
                value={portfolioSummary?.assetTypeCount || 0}
                subtitle="Asset Types"
                emptyState={portfolioSummary?.assetTypeCount === 0 ? "No asset types" : null}
              />
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
              {/* 1. Asset Breakdown (Left chart) */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="flex items-center text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg mr-3">
                      <PieChartIcon className="w-5 h-5 text-white" />
                    </div>
                    Asset Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {portfolioAllocation?.assetTypeAllocation && portfolioAllocation.assetTypeAllocation.length > 0 ? (
                    <PieChart 
                      data={portfolioAllocation.assetTypeAllocation.map(item => ({
                        type: item.assetType,
                        value: item.value,
                        percentage: item.percentage,
                        color: item.color || getAssetTypeColor(item.assetType)
                      }))}
                      size={280}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No allocation data yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add holdings to see asset breakdown</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* 2. Top Performers (Right panel) */}
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
                  {topPerformers && topPerformers.length > 0 ? (
                  <div className="space-y-4">
                      {topPerformers.map((performer, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700">
                                {performer.symbol?.substring(0, 2) || '--'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{performer.symbol || performer.name}</div>
                              <div className="text-xs text-gray-600">{performer.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{formatCurrency(performer.value || 0)}</div>
                            <div className={`text-xs flex items-center justify-end ${getChangeColor(performer.returnPct || 0)}`}>
                              {performer.returnPct >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {formatPercent(performer.returnPct || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No holdings yet – add your first investment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom row: Best Performer, Monthly Avg Contribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Best Performer (Bottom left card) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Best Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioSummary?.bestPerformer ? (
                        <div>
                      <div className="font-semibold">{portfolioSummary.bestPerformer.name}</div>
                      <div className="text-sm text-gray-600">{portfolioSummary.bestPerformer.symbol}</div>
                      <div className={`text-lg font-bold mt-1 ${getChangeColor(portfolioSummary.bestPerformer.returnPct || 0)}`}>
                        {formatPercent(portfolioSummary.bestPerformer.returnPct || 0)}
                        </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatCurrency(portfolioSummary.bestPerformer.gainLoss || 0)}
                        </div>
                      </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-gray-400">Best Performer</div>
                      <div className="text-sm text-gray-500 mt-1">No holdings yet – add your first investment.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 4. Monthly Avg Contribution (Bottom right card) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Monthly Avg Contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioPerformance?.monthlyContributions && portfolioPerformance.monthlyContributions.length > 0 ? (
                    <>
                  <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          portfolioPerformance.monthlyContributions.reduce((sum, c) => sum + (c.value || 0), 0) / 
                          Math.max(portfolioPerformance.monthlyContributions.length, 1)
                        )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">contribution</div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">$0.00</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Portfolio Percentage Chart */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg mr-3">
                    <PieChartIcon className="w-5 h-5 text-white" />
                  </div>
                  Portfolio Percentage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PortfolioPieChart holdings={holdings} />
              </CardContent>
            </Card>

            {/* 3. Asset Class Breakdown (Bottom full-width chart) */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <CardTitle className="flex items-center text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Asset Class Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AssetClassBarChart holdings={holdings} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Asset Type Allocation (Top left chart) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2" />
                    Asset Type Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioAllocation?.assetTypeAllocation && portfolioAllocation.assetTypeAllocation.length > 0 ? (
                    <PieChart 
                      data={portfolioAllocation.assetTypeAllocation.map(item => ({
                        type: item.assetType,
                        value: item.value,
                        percentage: item.percentage,
                        color: item.assetType === 'stock' ? '#059669' : 
                               item.assetType === 'crypto' ? '#dc2626' : 
                               item.assetType === 'roth_ira' ? '#7c3aed' : '#6b7280'
                      }))} 
                      size={250} 
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No allocation data yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add holdings to see allocation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. Sector Allocation (Top right chart) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Sector Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolioAllocation?.sectorAllocation && portfolioAllocation.sectorAllocation.length > 0 ? (
                    <PieChart 
                      data={portfolioAllocation.sectorAllocation.map((item, index) => {
                        const colors = ['#3b82f6', '#dc2626', '#7c3aed', '#059669', '#f59e0b', '#8b5cf6', '#06b6d4'];
                        return {
                          type: item.sector,
                          value: item.value,
                          percentage: item.percentage,
                          color: colors[index % colors.length]
                        };
                      })} 
                      size={250} 
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No sector data yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add holdings with sectors</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 3. Allocation Summary (Bottom full-width card) */}
            <Card>
              <CardHeader>
                <CardTitle>Allocation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioAllocation?.allocationSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Asset Type</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {portfolioAllocation.allocationSummary.byAssetType || "No asset types"}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Profile</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>High Risk (Crypto)</span>
                          <span className="font-medium">
                            {portfolioAllocation.allocationSummary.riskProfile?.highRisk?.toFixed(2) || '0.00'}%
                          </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium Risk (Stocks)</span>
                          <span className="font-medium">
                            {portfolioAllocation.allocationSummary.riskProfile?.mediumRisk?.toFixed(2) || '0.00'}%
                          </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Risk (ETFs)</span>
                          <span className="font-medium">
                            {portfolioAllocation.allocationSummary.riskProfile?.lowRisk?.toFixed(2) || '0.00'}%
                          </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Diversification</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Assets</span>
                          <span className="font-medium">
                            {portfolioAllocation.allocationSummary.diversification?.totalAssets || 0}
                          </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sectors</span>
                          <span className="font-medium">
                            {portfolioAllocation.allocationSummary.diversification?.sectors || 0}
                          </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Largest Holding</span>
                          <span className="font-medium">
                            {portfolioAllocation.allocationSummary.diversification?.largestHolding?.percentage?.toFixed(2) || '0.00'}%
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No allocation data available</p>
                    <p className="text-xs text-gray-400 mt-1">Add holdings to see allocation summary</p>
                  </div>
                )}
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

          <TabsContent value="spy-comparison" className="space-y-6">
            {/* Summary Cards Row (Three cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Your Portfolio card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Your Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(spyComparison?.portfolioValue || portfolioSummary?.currentValue || 0)}
                  </div>
                  <div className={`text-lg font-semibold mt-2 ${getChangeColor(spyComparison?.portfolioReturnPct || 0)}`}>
                    {formatPercent(spyComparison?.portfolioReturnPct || portfolioSummary?.returnPct || 0)} return
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Invested: {formatCurrency(spyComparison?.portfolioValue ? (spyComparison.portfolioValue / (1 + (spyComparison.portfolioReturnPct || 0) / 100)) : portfolioSummary?.costBasis || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* SPY (S&P 500) card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">SPY (S&P 500)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(spyComparison?.spyValue || 0)}
                  </div>
                  <div className={`text-lg font-semibold mt-2 ${getChangeColor(spyComparison?.spyReturnPct || 0)}`}>
                    {formatPercent(spyComparison?.spyReturnPct || 0)} return
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Invested: {formatCurrency(spyComparison?.spyValue ? (spyComparison.spyValue / (1 + (spyComparison.spyReturnPct || 0) / 100)) : portfolioSummary?.costBasis || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Outperformance card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Outperformance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getChangeColor(spyComparison?.outperformancePct || 0)}`}>
                    {formatPercent(spyComparison?.outperformancePct || 0)}
                  </div>
                  <div className={`text-lg font-semibold mt-2 ${getChangeColor(spyComparison?.outperformanceValue || 0)}`}>
                    {formatCurrency(Math.abs(spyComparison?.outperformanceValue || 0))} {spyComparison?.outperformanceValue >= 0 ? 'ahead' : 'behind'} SPY
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {spyComparison?.outperformancePct >= 0 ? 'Outperforming' : 'Underperforming'} benchmark
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio vs SPY Performance (Middle chart) */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio vs SPY Performance</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Comparison of your portfolio performance against the S&P 500 index over time
                </p>
              </CardHeader>
              <CardContent>
                {portfolioPerformance?.portfolioVsSpy && portfolioPerformance.portfolioVsSpy.length > 0 ? (
                  <>
                    <PerformanceChart 
                      data={portfolioPerformance.portfolioVsSpy.map(p => ({
                        date: p.date,
                        portfolio: p.portfolio,
                        spy: p.spy
                      }))} 
                      showComparison={true} 
                    />
                    <div className="flex justify-center space-x-6 mt-4 text-sm">
                      <span className="text-gray-600">
                        Your Portfolio {formatCurrency(portfolioSummary?.currentValue || 0)}
                      </span>
                      <span className="text-gray-600">
                        SPY {formatCurrency(spyComparison?.spyValue || 0)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No comparison data yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Section (Bottom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* A. Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Initial Investment</span>
                      <span className="font-medium">{formatCurrency(portfolioSummary?.costBasis || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Portfolio Value</span>
                      <span className="font-medium">{formatCurrency(portfolioSummary?.currentValue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">SPY Value</span>
                      <span className="font-medium">{formatCurrency(spyComparison?.spyValue || 0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm font-medium text-gray-900">Difference</span>
                      <span className={`font-medium ${getChangeColor(spyComparison?.outperformanceValue || 0)}`}>
                        {formatCurrency(spyComparison?.outperformanceValue || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* B. Investment Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  {spyComparison ? (
                    <div className="text-sm text-gray-700 space-y-2">
                      {spyComparison.outperformancePct > 0 ? (
                        <>
                          <p>
                            Your portfolio is <strong className="text-emerald-600">outperforming</strong> SPY by {formatPercent(Math.abs(spyComparison.outperformancePct))}.
                          </p>
                          <p>
                            This may indicate strong stock selection and effective portfolio management. Consider maintaining your current strategy while monitoring for any overconcentration risks.
                          </p>
                        </>
                      ) : spyComparison.outperformancePct < 0 ? (
                        <>
                          <p>
                            Your portfolio is <strong className="text-red-600">underperforming</strong> SPY by {formatPercent(Math.abs(spyComparison.outperformancePct))}.
                          </p>
                          <p>
                            Consider reviewing your asset allocation, diversifying across sectors, or evaluating individual holdings that may be dragging performance.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            Your portfolio performance is <strong>aligned</strong> with the S&P 500 benchmark.
                          </p>
                          <p>
                            This suggests your portfolio is tracking market performance. Consider reviewing opportunities for diversification or optimization.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p>Add holdings to see investment insights and analysis.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;