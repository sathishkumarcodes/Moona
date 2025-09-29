import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, TrendingUp, TrendingDown, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InvestmentList = ({ investments, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('value');

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

  const filteredInvestments = investments
    .filter(investment => {
      const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investment.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || investment.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue;
        case 'gainLoss':
          return b.gainLossPercent - a.gainLossPercent;
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle>Investment Holdings</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stock">Stocks</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="roth_ira">Roth IRA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">By Value</SelectItem>
                <SelectItem value="gainLoss">By Gain/Loss</SelectItem>
                <SelectItem value="symbol">By Symbol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredInvestments.map((investment) => (
            <div
              key={investment.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">
                        {investment.symbol.substring(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{investment.symbol}</h3>
                      <Badge variant="outline" className="text-xs">
                        {investment.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{investment.name}</p>
                    <p className="text-xs text-gray-500">{investment.sector}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Shares/Units</p>
                    <p className="font-medium">{investment.shares}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Price</p>
                    <p className="font-medium">{formatCurrency(investment.currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="font-semibold">{formatCurrency(investment.totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Gain/Loss</p>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getChangeColor(investment.gainLoss)}`}>
                        {formatCurrency(investment.gainLoss)}
                      </span>
                      <Badge variant="outline" className={getChangeBgColor(investment.gainLoss)}>
                        <span className={`flex items-center ${getChangeColor(investment.gainLoss)}`}>
                          {investment.gainLoss >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {formatPercent(investment.gainLossPercent)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvestments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No investments found matching your criteria.</p>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentList;