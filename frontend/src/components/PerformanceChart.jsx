import React from 'react';

const PerformanceChart = ({ data, showComparison = false }) => {
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
      year: 'numeric'
    });
  };

  // Calculate min and max values for scaling
  const allValues = data.flatMap(d => showComparison ? [d.portfolio, d.spy] : [d.portfolio]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  // Chart dimensions
  const width = 600;
  const height = 300;
  const margin = { top: 20, right: showComparison ? 100 : 50, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

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

  const portfolioPath = generatePath(data.map(d => d.portfolio));
  const spyPath = showComparison ? generatePath(data.map(d => d.spy)) : '';

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

  return (
    <div className="w-full">
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

            {/* Portfolio line */}
            <path
              d={portfolioPath}
              fill="none"
              stroke="#059669"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* SPY line (if showing comparison) */}
            {showComparison && (
              <path
                d={spyPath}
                fill="none"
                stroke="#ea580c"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5,5"
              />
            )}

            {/* Data points */}
            {data.map((item, index) => (
              <g key={index}>
                <circle
                  cx={xScale(index)}
                  cy={yScale(item.portfolio)}
                  r={4}
                  fill="#059669"
                  stroke="white"
                  strokeWidth={2}
                />
                {showComparison && (
                  <circle
                    cx={xScale(index)}
                    cy={yScale(item.spy)}
                    r={3}
                    fill="#ea580c"
                    stroke="white"
                    strokeWidth={2}
                  />
                )}
              </g>
            ))}
          </g>

          {/* Legend */}
          {showComparison && (
            <g transform={`translate(${width - margin.right + 20}, ${margin.top + 20})`}>
              <g>
                <line x1={0} y1={0} x2={20} y2={0} stroke="#059669" strokeWidth={3} />
                <text x={25} y={4} fontSize="12" fill="#374151">Your Portfolio</text>
              </g>
              <g transform="translate(0, 20)">
                <line x1={0} y1={0} x2={20} y2={0} stroke="#ea580c" strokeWidth={2} strokeDasharray="5,5" />
                <text x={25} y={4} fontSize="12" fill="#374151">SPY (S&P 500)</text>
              </g>
            </g>
          )}
        </svg>
      </div>
      
      {/* Current values display */}
      <div className="mt-4 flex justify-center space-x-8 text-sm">
        <div className="text-center">
          <div className="text-emerald-600 font-semibold">Your Portfolio</div>
          <div className="text-gray-900 font-bold">
            {formatCurrency(data[data.length - 1].portfolio)}
          </div>
        </div>
        {showComparison && (
          <div className="text-center">
            <div className="text-orange-600 font-semibold">SPY</div>
            <div className="text-gray-900 font-bold">
              {formatCurrency(data[data.length - 1].spy)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceChart;