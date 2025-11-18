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
import AssetClassBreakdown from './AssetClassBreakdown';
import OnboardingFlow from './OnboardingFlow';
import BenchmarkComparison from './BenchmarkComparison';
import FutureProjections from './FutureProjections';
import SPYComparisonTab from './SPYComparisonTab';
import MilestoneTracker from './MilestoneTracker';
import QuickInsights from './QuickInsights';
import EngagementStats from './EngagementStats';
import DailyInsightCard from './DailyInsightCard';
import DashboardLayout from './DashboardLayout';
import PortfolioSummaryCard from './PortfolioSummaryCard';
import QuickInsightsRow from './QuickInsightsRow';
import AssetBreakdownCard from './AssetBreakdownCard';
import TopPerformersCard from './TopPerformersCard';
import DashboardTabs from './DashboardTabs';
import holdingsService from '../services/holdingsService';
import portfolioService from '../services/portfolioService';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  // Helper function to get asset type color
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
  const [selectedAssetTypesForSPY, setSelectedAssetTypesForSPY] = useState(new Set());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  // Check if user should see onboarding
  React.useEffect(() => {
    const isNewUser = localStorage.getItem('moona_is_new_user') === 'true';
    const onboardingCompleted = localStorage.getItem('moona_onboarding_completed') === 'true';
    
    if (isNewUser && !onboardingCompleted) {
      setShowOnboarding(true);
      // Clear the new user flag
      localStorage.removeItem('moona_is_new_user');
    }

    // Track account creation date
    if (!localStorage.getItem('moona_account_created')) {
      localStorage.setItem('moona_account_created', Date.now().toString());
    }
  }, []);

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
      
      // Load critical data in parallel with shorter timeouts for faster initial render
      // Holdings and summary can load simultaneously
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

  // Initialize selected asset types when holdings change
  useEffect(() => {
    if (holdings && holdings.length > 0) {
      const availableTypes = getAvailableAssetTypes();
      if (availableTypes.length > 0 && selectedAssetTypesForSPY.size === 0) {
        // Initialize with all asset types selected
        setSelectedAssetTypesForSPY(new Set(availableTypes));
      }
    }
  }, [holdings.length]);

  // Reload SPY comparison when asset types change
  useEffect(() => {
    if (selectedAssetTypesForSPY.size > 0 && holdings.length > 0) {
      loadSPYComparison();
    }
  }, [selectedAssetTypesForSPY.size, holdings.length]);

  const loadSPYComparison = async () => {
    try {
      const result = await portfolioService.getSPYComparison(Array.from(selectedAssetTypesForSPY));
      setSpyComparison(result);
    } catch (error) {
      console.error('Error loading SPY comparison:', error);
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

  // Get available asset types from holdings
  const getAvailableAssetTypes = () => {
    if (!holdings || holdings.length === 0) return [];
    const types = new Set();
    holdings.forEach(h => {
      const type = (h.type || 'other').toLowerCase();
      const normalizedType = type === 'cryptocurrency' ? 'crypto' : 
                            type === 'stocks' ? 'stock' : 
                            type === 'roth ira' ? 'roth_ira' : type;
      types.add(normalizedType);
      if (normalizedType !== type) {
        types.add(type);
      }
    });
    return Array.from(types).sort();
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
    if (names[normalized]) {
      return names[normalized];
    }
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleAssetTypeForSPY = (assetType) => {
    setSelectedAssetTypesForSPY(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetType)) {
        newSet.delete(assetType);
      } else {
        newSet.add(assetType);
      }
      return newSet;
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {showOnboarding && (
        <OnboardingFlow 
          isNewUser={true}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
      
      <DashboardLayout>
        {/* Edit Holding Modal */}
        <EditHoldingModal
          holding={editingHolding}
          open={!!editingHolding}
          onClose={() => setEditingHolding(null)}
          onHoldingUpdated={handleHoldingUpdated}
        />

        {/* Action Bar - Compact */}
        <div className="flex justify-end items-center gap-2 mb-4">
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={exportToExcel}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all rounded-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <ImportHoldingsModal onImportComplete={handleHoldingAdded} />
          <AddHoldingModal onHoldingAdded={handleHoldingAdded} />
        </div>

        {/* 1. Portfolio Summary Bar (Hero KPIs) */}
        {isLoading ? (
          <PortfolioSummaryCard summary={null} lastUpdated={lastUpdated} />
        ) : (
          <PortfolioSummaryCard 
            summary={portfolioSummary ? {
              costBasis: portfolioSummary.costBasis,
              currentValue: portfolioSummary.currentValue,
              gainLoss: portfolioSummary.gainLoss,
              returnPct: portfolioSummary.returnPct,
              totalHoldings: portfolioSummary.totalHoldings,
              bestPerformer: portfolioSummary.bestPerformer,
              assetTypeCount: portfolioSummary.assetTypeCount
            } : null}
            lastUpdated={lastUpdated}
          />
        )}

        {/* 2. Daily Portfolio Insight (Hero Card) */}
        {!isLoading && <DailyInsightCard />}

        {/* 3. Quick Insights Row */}
        {!isLoading && (
          <QuickInsightsRow 
            portfolioSummary={portfolioSummary}
            holdings={holdings}
          />
        )}

        {/* 4. Asset Breakdown + Top Performers (Two-Column Section) */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssetBreakdownCard 
              holdings={holdings}
              portfolioAllocation={portfolioAllocation}
            />
            <TopPerformersCard 
              topPerformers={topPerformers}
            />
          </div>
        )}

        {/* 5. Tabs Section */}
        {!isLoading && (
          <DashboardTabs
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            overviewContent={
              <div className="space-y-6">
                {/* Overview tab - additional content can go here */}
              </div>
            }
            analyticsContent={
              <div className="space-y-6">
                {/* Portfolio Percentage Chart */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                      <PieChartIcon className="w-4 h-4 mr-2 text-gray-600" />
                      Portfolio Percentage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PortfolioPieChart holdings={holdings} />
                  </CardContent>
                </Card>

                {/* Asset Class Performance */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-gray-600" />
                      Asset Class Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AssetClassBarChart holdings={holdings} />
                  </CardContent>
                </Card>
              </div>
            }
            holdingsContent={
              <InvestmentList 
                investments={holdings || []} 
                onEdit={setEditingHolding}
                onDelete={handleHoldingDeleted}
                isLoading={isLoading}
              />
            }
            spyComparisonContent={
              <div className="space-y-6">
                <SPYComparisonTab 
                  portfolioSummary={portfolioSummary}
                  holdings={holdings}
                />
                
                {/* Advanced Benchmark Comparison */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <BenchmarkComparison />
                </div>
              </div>
            }
            futureContent={
              <FutureProjections 
                currentPortfolioValue={portfolioSummary?.currentValue || 0}
              />
            }
          />
        )}
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;