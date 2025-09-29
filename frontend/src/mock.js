// Mock data for investment dashboard

export const mockPortfolio = {
  totalValue: 125480.50,
  totalCost: 100000.00,
  totalGainLoss: 25480.50,
  totalGainLossPercent: 25.48,
  dailyChange: 1250.30,
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
  }
];

export const mockSPYComparison = {
  portfolioValue: 125480.50,
  portfolioInvested: 100000.00,
  portfolioReturn: 25.48,
  
  spyValue: 118500.00,
  spyInvested: 100000.00,
  spyReturn: 18.50,
  
  outperformance: 6.98,
  absoluteDifference: 6980.50
};

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