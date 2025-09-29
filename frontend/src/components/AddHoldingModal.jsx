import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Plus, Search, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AddHoldingModal = ({ onHoldingAdded }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: '',
    shares: '',
    avg_cost: '',
    sector: '',
    platform: ''
  });
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  
  const { toast } = useToast();

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounced search function
  const debounceSearch = useCallback(
    debounce((symbol) => {
      if (symbol.length >= 2) {
        searchSymbolInternal(symbol);
      }
    }, 300),
    []
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Load platforms when asset type changes
    if (field === 'type' && value) {
      loadPlatforms(value);
    }
    
    // Auto-search as user types symbol
    if (field === 'symbol' && value) {
      debounceSearch(value.toUpperCase());
    }
  };

  const loadPlatforms = async (assetType) => {
    try {
      const response = await axios.get(`${API}/holdings/platforms/${assetType}`, {
        withCredentials: true,
        timeout: 5000  // 5 second timeout
      });
      setAvailablePlatforms(response.data.platforms || []);
    } catch (error) {
      console.error('Error loading platforms:', error);
      setAvailablePlatforms([]);
    }
  };

  const searchSymbolInternal = async (symbol) => {
    if (!symbol.trim()) {
      return;
    }

    setIsSearching(true);
    setCurrentPrice(null);

    try {
      const response = await axios.get(`${API}/holdings/search/${symbol}`, {
        withCredentials: true,
        timeout: 8000  // 8 second timeout for search
      });

      const data = response.data;
      setCurrentPrice(data);
      
      // Auto-fill form fields based on search result
      if (data.name) {
        setFormData(prev => ({
          ...prev,
          name: data.name,
          sector: data.sector || prev.sector
        }));
      }
      
      // Auto-detect asset type
      if (data.symbol && ['BTC', 'ETH', 'SOL', 'ADA'].includes(data.symbol)) {
        setFormData(prev => ({ ...prev, type: 'crypto' }));
        loadPlatforms('crypto');
      } else if (data.current_price && !formData.type) {
        setFormData(prev => ({ ...prev, type: 'stock' }));
        loadPlatforms('stock');
      }

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        toast({
          title: "Search Timeout",
          description: "Search is taking too long. Please try again.",
          variant: "destructive"
        });
      } else {
        console.error('Search error:', error);
        // Don't show error for auto-search, only for manual search
      }
    } finally {
      setIsSearching(false);
    }
  };

  const searchSymbol = async () => {
    if (!formData.symbol.trim()) {
      toast({
        title: "Enter Symbol",
        description: "Please enter a stock or crypto symbol to search",
        variant: "destructive"
      });
      return;
    }

    await searchSymbolInternal(formData.symbol);
  };

  const calculatePreview = () => {
    if (!formData.shares || !formData.avg_cost || !currentPrice) return null;

    const shares = parseFloat(formData.shares);
    const avgCost = parseFloat(formData.avg_cost);
    const currentPriceValue = currentPrice.current_price;

    const totalCost = shares * avgCost;
    const totalValue = shares * currentPriceValue;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;

    return {
      totalCost,
      totalValue,
      gainLoss,
      gainLossPercent
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.name || !formData.type || !formData.shares || !formData.avg_cost || !formData.platform) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including platform",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        type: formData.type,
        shares: parseFloat(formData.shares),
        avg_cost: parseFloat(formData.avg_cost),
        sector: formData.sector || null,
        platform: formData.platform
      };

      const response = await axios.post(`${API}/holdings`, payload, {
        withCredentials: true
      });

      toast({
        title: "Holding Added",
        description: `Successfully added ${formData.symbol} to your portfolio`,
      });

      // Reset form
      setFormData({
        symbol: '',
        name: '',
        type: '',
        shares: '',
        avg_cost: '',
        sector: '',
        platform: ''
      });
      setCurrentPrice(null);
      setAvailablePlatforms([]);
      setOpen(false);

      // Notify parent component
      if (onHoldingAdded) {
        onHoldingAdded(response.data);
      }

    } catch (error) {
      toast({
        title: "Failed to Add Holding",
        description: error.response?.data?.detail || "An error occurred while adding the holding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const preview = calculatePreview();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Holding
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Add New Holding
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol Search */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol *</Label>
            <div className="flex space-x-2">
              <Input
                id="symbol"
                placeholder="Enter stock or crypto symbol (e.g., AAPL, BTC)"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={searchSymbol}
                disabled={isSearching}
                variant="outline"
                className="px-4"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Current Price Display */}
          {currentPrice && (
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${currentPrice.current_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="text-sm font-medium capitalize">{currentPrice.source}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company/Asset Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Apple Inc."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="roth_ira">Roth IRA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Selection */}
          {formData.type && (
            <div className="space-y-2">
              <Label htmlFor="platform">Platform/Account *</Label>
              <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select where this asset is held" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector (Optional)</Label>
              <Input
                id="sector"
                placeholder="e.g., Technology, Healthcare"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shares">Shares/Units *</Label>
              <Input
                id="shares"
                type="number"
                step="0.00000001"
                placeholder="e.g., 10 or 0.5"
                value={formData.shares}
                onChange={(e) => handleInputChange('shares', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg_cost">Average Cost per Share *</Label>
              <Input
                id="avg_cost"
                type="number"
                step="0.01"
                placeholder="e.g., 150.00"
                value={formData.avg_cost}
                onChange={(e) => handleInputChange('avg_cost', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Sector (Optional)</Label>
            <Input
              id="sector"
              placeholder="e.g., Technology, Healthcare"
              value={formData.sector}
              onChange={(e) => handleInputChange('sector', e.target.value)}
            />
          </div>

          {/* Investment Preview */}
          {preview && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Investment Preview
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-semibold">${preview.totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="font-semibold">${preview.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gain/Loss</p>
                    <p className={`font-semibold ${preview.gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {preview.gainLoss >= 0 ? '+' : ''}${preview.gainLoss.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className={`font-semibold ${preview.gainLossPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {preview.gainLossPercent >= 0 ? '+' : ''}{preview.gainLossPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Add Holding
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHoldingModal;