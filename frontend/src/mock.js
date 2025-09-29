// Mock data for investment dashboard

export const mockPortfolio = {
  totalValue: 185680.50,
  totalCost: 150000.00,
  totalGainLoss: 35680.50,
  totalGainLossPercent: 23.79,
  dailyChange: 1850.30,
  dailyChangePercent: 1.01
};

export const mockInvestments = [
  // Stocks
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    shares: 50,
    avgCost: 145.30,
    currentPrice: 182.52,
    totalValue: 9126.00,
    totalCost: 7265.00,
    gainLoss: 1861.00,
    gainLossPercent: 25.62,
    sector: 'Technology'
  },
  {
    id: 2,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'stock',
    shares: 25,
    avgCost: 120.45,
    currentPrice: 142.38,
    totalValue: 3559.50,
    totalCost: 3011.25,
    gainLoss: 548.25,
    gainLossPercent: 18.21,
    sector: 'Technology'
  },
  {
    id: 3,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'stock',
    shares: 30,
    avgCost: 185.60,
    currentPrice: 208.80,
    totalValue: 6264.00,
    totalCost: 5568.00,
    gainLoss: 696.00,
    gainLossPercent: 12.50,
    sector: 'Automotive'
  },
  {
    id: 4,
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    shares: 40,
    avgCost: 315.25,
    currentPrice: 378.85,
    totalValue: 15154.00,
    totalCost: 12610.00,
    gainLoss: 2544.00,
    gainLossPercent: 20.17,
    sector: 'Technology'
  },
  {
    id: 5,
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    type: 'stock',
    shares: 15,
    avgCost: 420.80,
    currentPrice: 875.30,
    totalValue: 13129.50,
    totalCost: 6312.00,
    gainLoss: 6817.50,
    gainLossPercent: 108.02,
    sector: 'Technology'
  },
  // Crypto
  {
    id: 6,
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    shares: 0.5,
    avgCost: 45000.00,
    currentPrice: 67500.00,
    totalValue: 33750.00,
    totalCost: 22500.00,
    gainLoss: 11250.00,
    gainLossPercent: 50.00,
    sector: 'Cryptocurrency'
  },
  {
    id: 7,
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    shares: 8,
    avgCost: 2800.00,
    currentPrice: 3650.00,
    totalValue: 29200.00,
    totalCost: 22400.00,
    gainLoss: 6800.00,
    gainLossPercent: 30.36,
    sector: 'Cryptocurrency'
  },
  {
    id: 8,
    symbol: 'SOL',
    name: 'Solana',
    type: 'crypto',
    shares: 100,
    avgCost: 95.50,
    currentPrice: 142.30,
    totalValue: 14230.00,
    totalCost: 9550.00,
    gainLoss: 4680.00,
    gainLossPercent: 48.95,
    sector: 'Cryptocurrency'
  },
  // Roth IRA Investments
  {
    id: 9,
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    type: 'roth_ira',
    shares: 120,
    avgCost: 185.60,
    currentPrice: 245.80,
    totalValue: 29496.00,
    totalCost: 22272.00,
    gainLoss: 7224.00,
    gainLossPercent: 32.44,
    sector: 'ETF'
  },
  {
    id: 10,
    symbol: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    type: 'roth_ira',
    shares: 80,
    avgCost: 52.30,
    currentPrice: 58.75,
    totalValue: 4700.00,
    totalCost: 4184.00,
    gainLoss: 516.00,
    gainLossPercent: 12.34,
    sector: 'ETF'
  },
  {
    id: 11,
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    type: 'roth_ira',
    shares: 150,
    avgCost: 76.20,
    currentPrice: 74.85,
    totalValue: 11227.50,
    totalCost: 11430.00,
    gainLoss: -202.50,
    gainLossPercent: -1.77,
    sector: 'ETF'
  },
  {
    id: 12,
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    type: 'roth_ira',
    shares: 35,
    avgCost: 285.40,
    currentPrice: 368.90,
    totalValue: 12911.50,
    totalCost: 9989.00,
    gainLoss: 2922.50,
    gainLossPercent: 29.25,
    sector: 'ETF'
  }
];

export const mockSPYComparison = {
  portfolioValue: 185680.50,
  portfolioInvested: 150000.00,
  portfolioReturn: 23.79,
  
  spyValue: 177750.00,
  spyInvested: 150000.00,
  spyReturn: 18.50,
  
  outperformance: 5.29,
  absoluteDifference: 7930.50
};

export const mockAllocation = [
  { type: 'Stocks', value: 47229.50, percentage: 25.43, color: '#059669' },
  { type: 'Crypto', value: 77180.00, percentage: 41.56, color: '#dc2626' },
  { type: 'Roth IRA', value: 58335.00, percentage: 31.41, color: '#7c3aed' },
  { type: 'Cash', value: 2936.00, percentage: 1.58, color: '#6b7280' }
];

export const mockSectorAllocation = [
  { sector: 'Technology', value: 35669.00, percentage: 19.21, color: '#3b82f6' },
  { sector: 'Cryptocurrency', value: 77180.00, percentage: 41.56, color: '#dc2626' },
  { sector: 'ETF', value: 58335.00, percentage: 31.41, color: '#7c3aed' },
  { sector: 'Automotive', value: 6264.00, percentage: 3.37, color: '#059669' },
  { sector: 'Cash', value: 2936.00, percentage: 1.58, color: '#6b7280' },
  { sector: 'Other', value: 5296.50, percentage: 2.85, color: '#f59e0b' }
];

export const mockPerformanceHistory = [
  { date: '2024-01-01', portfolio: 100000, spy: 100000 },
  { date: '2024-02-01', portfolio: 102500, spy: 101200 },
  { date: '2024-03-01', portfolio: 108200, spy: 103800 },
  { date: '2024-04-01', portfolio: 112800, spy: 106500 },
  { date: '2024-05-01', portfolio: 118500, spy: 109200 },
  { date: '2024-06-01', portfolio: 115200, spy: 107800 },
  { date: '2024-07-01', portfolio: 121800, spy: 112300 },
  { date: '2024-08-01', portfolio: 119600, spy: 110500 },
  { date: '2024-09-01', portfolio: 125480, spy: 118500 }
];