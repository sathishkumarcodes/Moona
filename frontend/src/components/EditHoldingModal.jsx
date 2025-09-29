import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Edit3, Save, DollarSign } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EditHoldingModal = ({ holding, open, onClose, onHoldingUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shares: '',
    avg_cost: '',
    sector: '',
    platform: ''
  });
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (holding && open) {
      setFormData({
        name: holding.name || '',
        shares: holding.shares?.toString() || '',
        avg_cost: holding.avg_cost?.toString() || '',
        sector: holding.sector || '',
        platform: holding.platform || ''
      });
      
      // Load platforms for the holding's type
      if (holding.type) {
        loadPlatforms(holding.type);
      }
    }
  }, [holding, open]);

  const loadPlatforms = async (assetType) => {
    try {
      const response = await axios.get(`${API}/holdings/platforms/${assetType}`, {
        withCredentials: true
      });
      setAvailablePlatforms(response.data.platforms || []);
    } catch (error) {
      console.error('Error loading platforms:', error);
      setAvailablePlatforms([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePreview = () => {
    if (!formData.shares || !formData.avg_cost || !holding) return null;

    const shares = parseFloat(formData.shares);
    const avgCost = parseFloat(formData.avg_cost);
    const currentPrice = holding.current_price;

    const totalCost = shares * avgCost;
    const totalValue = shares * currentPrice;
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

    if (!formData.name || !formData.shares || !formData.avg_cost) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        shares: parseFloat(formData.shares),
        avg_cost: parseFloat(formData.avg_cost),
        sector: formData.sector || null,
        platform: formData.platform || null
      };

      const response = await axios.put(`${API}/holdings/${holding.id}`, payload, {
        withCredentials: true
      });

      toast({
        title: "Holding Updated",
        description: `Successfully updated ${holding.symbol}`,
      });

      onClose();

      // Notify parent component
      if (onHoldingUpdated) {
        onHoldingUpdated(response.data);
      }

    } catch (error) {
      toast({
        title: "Failed to Update Holding",
        description: error.response?.data?.detail || "An error occurred while updating the holding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const preview = calculatePreview();

  if (!holding) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            Edit {holding.symbol}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Price Display */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${holding.current_price?.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Symbol</p>
                  <p className="text-lg font-bold text-gray-900">{holding.symbol}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company/Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shares">Shares/Units *</Label>
                <Input
                  id="shares"
                  type="number"
                  step="0.00000001"
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
                  value={formData.avg_cost}
                  onChange={(e) => handleInputChange('avg_cost', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector (Optional)</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform/Account</Label>
              <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
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
          </div>

          {/* Updated Preview */}
          {preview && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">Updated Investment Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-semibold">${preview.totalCost.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      Change: ${(preview.totalCost - holding.total_cost).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="font-semibold">${preview.totalValue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      Change: ${(preview.totalValue - holding.total_value).toFixed(2)}
                    </p>
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHoldingModal;