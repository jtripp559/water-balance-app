/** @jsx jsx */
import { React, AllWidgetProps, jsx, css } from 'jimu-core';
import { IMConfig } from '../config';
import { useState, useEffect, useRef } from 'react';
import { select, scaleLinear, scaleTime, extent, line, curveMonotoneX } from 'd3';

// Type definitions adapted from the original app
interface GldasDataItem {
  date: Date;
  value: number;
}

interface TimeSeriesData {
  [key: string]: GldasDataItem[];
}

// Sample data for demonstration
const sampleData: TimeSeriesData = {
  'Soil Moisture': [
    { date: new Date('2023-01-01'), value: 120 },
    { date: new Date('2023-02-01'), value: 130 },
    { date: new Date('2023-03-01'), value: 115 },
    { date: new Date('2023-04-01'), value: 140 },
    { date: new Date('2023-05-01'), value: 125 },
    { date: new Date('2023-06-01'), value: 110 },
    { date: new Date('2023-07-01'), value: 95 },
    { date: new Date('2023-08-01'), value: 85 },
    { date: new Date('2023-09-01'), value: 100 },
    { date: new Date('2023-10-01'), value: 115 },
    { date: new Date('2023-11-01'), value: 125 },
    { date: new Date('2023-12-01'), value: 135 }
  ],
  'Precipitation': [
    { date: new Date('2023-01-01'), value: 45 },
    { date: new Date('2023-02-01'), value: 38 },
    { date: new Date('2023-03-01'), value: 52 },
    { date: new Date('2023-04-01'), value: 67 },
    { date: new Date('2023-05-01'), value: 78 },
    { date: new Date('2023-06-01'), value: 85 },
    { date: new Date('2023-07-01'), value: 92 },
    { date: new Date('2023-08-01'), value: 88 },
    { date: new Date('2023-09-01'), value: 73 },
    { date: new Date('2023-10-01'), value: 58 },
    { date: new Date('2023-11-01'), value: 42 },
    { date: new Date('2023-12-01'), value: 35 }
  ],
  'Evapotranspiration': [
    { date: new Date('2023-01-01'), value: 15 },
    { date: new Date('2023-02-01'), value: 18 },
    { date: new Date('2023-03-01'), value: 25 },
    { date: new Date('2023-04-01'), value: 42 },
    { date: new Date('2023-05-01'), value: 58 },
    { date: new Date('2023-06-01'), value: 72 },
    { date: new Date('2023-07-01'), value: 78 },
    { date: new Date('2023-08-01'), value: 75 },
    { date: new Date('2023-09-01'), value: 55 },
    { date: new Date('2023-10-01'), value: 35 },
    { date: new Date('2023-11-01'), value: 22 },
    { date: new Date('2023-12-01'), value: 18 }
  ]
};

// GLDAS Service integration (adapted from original app)
class GldasService {
  private static baseUrl = 'https://utility.arcgis.com/usrsvcs/servers/';
  
  static async fetchTimeSeriesData(location: { latitude: number, longitude: number }): Promise<TimeSeriesData> {
    try {
      // In a real implementation, this would make actual API calls to GLDAS services
      // For now, return sample data
      console.log('Fetching GLDAS time series data for location:', location);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return sampleData;
    } catch (error) {
      console.error('Error fetching GLDAS data:', error);
      return sampleData; // Fallback to sample data
    }
  }
}

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const [data, setData] = useState<TimeSeriesData>(sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(['Soil Moisture']);
  const svgRef = useRef<SVGSVGElement>();
  const containerRef = useRef<HTMLDivElement>();

  // Chart dimensions and margins
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Theme colors (adapted from original app)
  const colors = {
    'Soil Moisture': '#598fb8',
    'Precipitation': '#5984ca',
    'Evapotranspiration': '#b15a4d',
    'Snowpack': '#f9f9f9',
    'Runoff': '#8e44ad',
    'Change in Storage': '#542788'
  };

  const getColorForSeries = (seriesName: string): string => {
    return colors[seriesName] || '#666';
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Default location (can be configured via widget settings)
      const location = { latitude: 40.7128, longitude: -74.0060 }; // New York City
      const timeSeriesData = await GldasService.fetchTimeSeriesData(location);
      setData(timeSeriesData);
    } catch (err) {
      setError('Failed to load time series data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeries = (seriesName: string) => {
    setSelectedSeries(prev => {
      if (prev.includes(seriesName)) {
        return prev.filter(s => s !== seriesName);
      } else {
        return [...prev, seriesName];
      }
    });
  };

  const drawChart = () => {
    if (!data || !svgRef.current || selectedSeries.length === 0) return;

    // Clear previous chart
    select(svgRef.current).selectAll('*').remove();

    // Get all data points for scale calculation
    const allData = selectedSeries.flatMap(series => data[series] || []);
    
    if (allData.length === 0) return;

    // Create scales
    const xScale = scaleTime()
      .domain(extent(allData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = scaleLinear()
      .domain(extent(allData, d => d.value) as [number, number])
      .nice()
      .range([height, 0]);

    // Create SVG container
    const svg = select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create line generator
    const lineGenerator = line<GldasDataItem>()
      .curve(curveMonotoneX)
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    // Draw lines for each selected series
    selectedSeries.forEach(seriesName => {
      const seriesData = data[seriesName];
      if (!seriesData) return;

      const color = getColorForSeries(seriesName);

      // Draw shadow line (white stroke)
      g.append('path')
        .datum(seriesData)
        .attr('class', `line-shadow-${seriesName}`)
        .attr('d', lineGenerator)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 4)
        .style('opacity', 0.8);

      // Draw main line
      g.append('path')
        .datum(seriesData)
        .attr('class', `line-${seriesName}`)
        .attr('d', lineGenerator)
        .style('fill', 'none')
        .style('stroke', color)
        .style('stroke-width', 2);

      // Add dots for data points
      g.selectAll(`.dot-${seriesName}`)
        .data(seriesData)
        .enter()
        .append('circle')
        .attr('class', `dot-${seriesName}`)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 3)
        .style('fill', color)
        .style('stroke', '#fff')
        .style('stroke-width', 1)
        .on('mouseover', function(event, d) {
          // Add tooltip on hover
          select(this).attr('r', 5);
          
          // Create tooltip
          const tooltip = g.append('g').attr('class', `tooltip-${seriesName}`);
          
          const rect = tooltip.append('rect')
            .attr('x', xScale(d.date) - 40)
            .attr('y', yScale(d.value) - 40)
            .attr('width', 80)
            .attr('height', 30)
            .attr('fill', 'rgba(0,0,0,0.8)')
            .attr('rx', 4);
          
          tooltip.append('text')
            .attr('x', xScale(d.date))
            .attr('y', yScale(d.value) - 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '12px')
            .text(`${d.value.toFixed(1)} mm`);
        })
        .on('mouseout', function(event, d) {
          select(this).attr('r', 3);
          g.select(`.tooltip-${seriesName}`).remove();
        });
    });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %Y')));

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Value (mm)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Date');

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 200}, 20)`);

    const legendItems = legend.selectAll('.legend-item')
      .data(selectedSeries)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 7)
      .attr('y2', 7)
      .attr('stroke', d => getColorForSeries(d))
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      drawChart();
    }
  }, [data, selectedSeries]);

  const styles = css`
    .widget-container {
      padding: 16px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .widget-header {
      margin-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 8px;
    }
    
    .widget-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .widget-subtitle {
      font-size: 14px;
      color: #666;
      margin: 4px 0 0 0;
    }
    
    .controls {
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    
    .series-toggle {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .series-toggle.selected {
      border-color: #0079c1;
      background-color: #e3f2fd;
    }
    
    .series-toggle:hover {
      background-color: #f5f5f5;
    }
    
    .series-color {
      width: 12px;
      height: 2px;
      border-radius: 1px;
    }
    
    .chart-container {
      width: 100%;
      overflow-x: auto;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: #666;
    }
    
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: #d32f2f;
      text-align: center;
    }
    
    .refresh-button {
      background: #0079c1;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 8px;
    }
    
    .refresh-button:hover {
      background: #005a8b;
    }
    
    .no-data-message {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px;
    }
  `;

  const availableSeries = Object.keys(data);

  return (
    <div css={styles}>
      <div className="widget-container" ref={containerRef}>
        <div className="widget-header">
          <h2 className="widget-title">Water Balance Trends</h2>
          <p className="widget-subtitle">Time Series Analysis</p>
        </div>
        
        <div className="controls">
          <span style={{ fontSize: '14px', fontWeight: '600', marginRight: '8px' }}>
            Data Series:
          </span>
          {availableSeries.map(series => (
            <button
              key={series}
              className={`series-toggle ${selectedSeries.includes(series) ? 'selected' : ''}`}
              onClick={() => toggleSeries(series)}
            >
              <div 
                className="series-color"
                style={{ backgroundColor: getColorForSeries(series) }}
              />
              {series}
            </button>
          ))}
        </div>
        
        {loading && (
          <div className="loading-container">
            <div>Loading time series data...</div>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <div>
              <div>{error}</div>
              <button className="refresh-button" onClick={fetchData}>
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!loading && !error && selectedSeries.length === 0 && (
          <div className="no-data-message">
            Please select at least one data series to display the chart.
          </div>
        )}
        
        {!loading && !error && data && selectedSeries.length > 0 && (
          <div className="chart-container">
            <svg ref={svgRef}></svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Widget;