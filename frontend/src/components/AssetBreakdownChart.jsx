import React from 'react';

const AssetBreakdownChart = ({ data, title = "Asset Type Performance" }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Chart dimensions
  const width = 600;
  const height = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate min and max values for scaling
  const allValues = data.flatMap(d => [d.stocks, d.crypto, d.roth_ira]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  // Scale functions
  const xScale = (index) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value) => chartHeight - ((value - minValue + padding) / (valueRange + 2 * padding)) * chartHeight;

  // Generate path data
  const generatePath = (values) => {
    return values.map((value, index) => {
      const x = xScale(index);
      const y = yScale(value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  const stocksPath = generatePath(data.map(d => d.stocks));
  const cryptoPath = generatePath(data.map(d => d.crypto));
  const rothIraPath = generatePath(data.map(d => d.roth_ira));

  // Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const value = minValue + (valueRange * i / tickCount);
    yTicks.push({
      value,
      y: yScale(value)
    });
  }

  const assetTypes = [
    { name: 'Stocks', path: stocksPath, color: '#059669', values: data.map(d => d.stocks) },
    { name: 'Crypto', path: cryptoPath, color: '#dc2626', values: data.map(d => d.crypto) },
    { name: 'Roth IRA', path: rothIraPath, color: '#7c3aed', values: data.map(d => d.roth_ira) }
  ];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="min-w-full">
          {/* Background */}
          <rect width={width} height={height} fill="#fafafa" />
          
          {/* Chart area */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {yTicks.map((tick, index) => (
              <g key={index}>
                <line
                  x1={0}
                  y1={tick.y}
                  x2={chartWidth}
                  y2={tick.y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={-10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatCurrency(tick.value)}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {data.map((item, index) => {
              if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
                return (
                  <text
                    key={index}
                    x={xScale(index)}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {formatDate(item.date)}
                  </text>
                );
              }
              return null;
            })}

            {/* Asset type lines */}
            {assetTypes.map((asset, assetIndex) => (
              <g key={assetIndex}>
                <path
                  d={asset.path}
                  fill="none"
                  stroke={asset.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {asset.values.map((value, index) => (
                  <circle
                    key={index}
                    cx={xScale(index)}
                    cy={yScale(value)}
                    r={3}
                    fill={asset.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </g>
            ))}
          </g>

          {/* Legend */}
          <g transform={`translate(${width - margin.right + 20}, ${margin.top + 20})`}>
            {assetTypes.map((asset, index) => (
              <g key={index} transform={`translate(0, ${index * 25})`}>
                <line x1={0} y1={0} x2={15} y2={0} stroke={asset.color} strokeWidth={2.5} />
                <text x={20} y={4} fontSize="12" fill="#374151">{asset.name}</text>
                <text x={20} y={16} fontSize="10" fill="#6b7280">
                  {formatCurrency(asset.values[asset.values.length - 1])}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AssetBreakdownChart;