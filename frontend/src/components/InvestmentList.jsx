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
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  // Get unique platforms for filtering
  const uniquePlatforms = [...new Set(investments?.map(inv => inv.platform).filter(Boolean))].sort();

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

  const handleDelete = async (investment) => {
    if (!window.confirm(`Are you sure you want to delete ${investment.symbol}?`)) {
      return;
    }

    setDeletingId(investment.id);
    try {
      await axios.delete(`${API}/holdings/${investment.id}`, {
        withCredentials: true
      });

      toast({
        title: "Holding Deleted",
        description: `Successfully deleted ${investment.symbol} from your portfolio`,
      });

      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.detail || "Failed to delete holding",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInvestments = investments
    .filter(investment => {
      const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investment.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || investment.type === filterType;
      const matchesPlatform = filterPlatform === 'all' || investment.platform === filterPlatform;
      return matchesSearch && matchesType && matchesPlatform;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.total_value - a.total_value;
        case 'gainLoss':
          return b.gain_loss_percent - a.gain_loss_percent;
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
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {uniquePlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
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
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                          {investment.type.toUpperCase().replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{investment.name}</p>
                      <p className="text-xs text-gray-500">{investment.sector}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Shares/Units</p>
                      <p className="font-medium">{investment.shares}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Price</p>
                      <p className="font-medium">{formatCurrency(investment.current_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Value</p>
                      <p className="font-semibold">{formatCurrency(investment.total_value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gain/Loss</p>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${getChangeColor(investment.gain_loss)}`}>
                          {formatCurrency(investment.gain_loss)}
                        </span>
                        <Badge variant="outline" className={getChangeBgColor(investment.gain_loss)}>
                          <span className={`flex items-center ${getChangeColor(investment.gain_loss)}`}>
                            {investment.gain_loss >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {formatPercent(investment.gain_loss_percent)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => onEdit && onEdit(investment)}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(investment)}
                            disabled={deletingId === investment.id}
                            className="flex items-center space-x-2 cursor-pointer text-red-600 hover:text-red-700"
                          >
                            {deletingId === investment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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