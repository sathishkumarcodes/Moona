import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity, Target, Wallet } from 'lucide-react';
import { 
  mockPortfolio, 
  mockInvestments, 
  mockSPYComparison, 
  mockPerformanceHistory, 
  mockAllocation, 
  mockSectorAllocation,
  mockMonthlyContributions 
} from '../mock';
import InvestmentList from './InvestmentList';
import SPYComparison from './SPYComparison';
import PerformanceChart from './PerformanceChart';
import PieChart from './PieChart';
import ContributionChart from './ContributionChart';
import AssetBreakdownChart from './AssetBreakdownChart';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
              <p className="text-gray-600 mt-1">Track your stocks and crypto investments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(mockPortfolio.totalValue)}
              </div>
              <div className={`text-sm flex items-center mt-1 ${getChangeColor(mockPortfolio.dailyChange)}`}>
                {mockPortfolio.dailyChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {formatCurrency(Math.abs(mockPortfolio.dailyChange))} ({formatPercent(mockPortfolio.dailyChangePercent)}) today
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
              <PieChart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(mockPortfolio.totalCost)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Initial investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Gain/Loss</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getChangeColor(mockPortfolio.totalGainLoss)}`}>
                {formatCurrency(mockPortfolio.totalGainLoss)}
              </div>
              <Badge variant="outline" className={getChangeBgColor(mockPortfolio.totalGainLoss)}>
                <span className={getChangeColor(mockPortfolio.totalGainLoss)}>
                  {formatPercent(mockPortfolio.totalGainLossPercent)}
                </span>
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assets</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockInvestments.length}</div>
              <div className="text-sm text-gray-600 mt-1">
                {mockInvestments.filter(inv => inv.type === 'stock').length} stocks, {' '}
                {mockInvestments.filter(inv => inv.type === 'crypto').length} crypto
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="investments">Holdings</TabsTrigger>
            <TabsTrigger value="spy-comparison">vs SPY</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart data={mockPerformanceHistory} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockInvestments
                      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                      .slice(0, 5)
                      .map((investment) => (
                        <div key={investment.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{investment.symbol}</div>
                            <div className="text-sm text-gray-600">{investment.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(investment.totalValue)}</div>
                            <div className={`text-sm ${getChangeColor(investment.gainLoss)}`}>
                              {formatPercent(investment.gainLossPercent)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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