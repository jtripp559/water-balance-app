/** @jsx jsx */
import { React, AllWidgetProps, jsx, css } from 'jimu-core';
import { IMConfig } from '../config';
import { useState, useEffect, useRef } from 'react';
import { select, scaleBand, scaleLinear, max, min } from 'd3';

// Type definitions adapted from the original app
interface GldasDataItem {
  date: Date;
  value: number;
}

interface WaterFluxData {
  'Precipitation': GldasDataItem[];
  'Evapotranspiration': GldasDataItem[];
  'Runoff': GldasDataItem[];
}

// Sample data for demonstration
const sampleData: WaterFluxData = {
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
  ],
  'Runoff': [
    { date: new Date('2023-01-01'), value: 12 },
    { date: new Date('2023-02-01'), value: 8 },
    { date: new Date('2023-03-01'), value: 15 },
    { date: new Date('2023-04-01'), value: 22 },
    { date: new Date('2023-05-01'), value: 18 },
    { date: new Date('2023-06-01'), value: 14 },
    { date: new Date('2023-07-01'), value: 16 },
    { date: new Date('2023-08-01'), value: 13 },
    { date: new Date('2023-09-01'), value: 18 },
    { date: new Date('2023-10-01'), value: 23 },
    { date: new Date('2023-11-01'), value: 20 },
    { date: new Date('2023-12-01'), value: 17 }
  ]
};

// GLDAS Service integration (adapted from original app)
class GldasService {
  private static baseUrl = 'https://utility.arcgis.com/usrsvcs/servers/';
  
  static async fetchWaterFluxData(location: { latitude: number, longitude: number }): Promise<WaterFluxData> {
    try {
      // In a real implementation, this would make actual API calls to GLDAS services
      // For now, return sample data
      console.log('Fetching GLDAS water flux data for location:', location);
      
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
  const [data, setData] = useState<WaterFluxData>(sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<keyof WaterFluxData>('Precipitation');
  const svgRef = useRef<SVGSVGElement>();
  const containerRef = useRef<HTMLDivElement>();

  // Chart dimensions and margins
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Theme colors (adapted from original app)
  const colors = {
    precipitation: '#5984ca',
    evapotranspiration: '#b15a4d',
    runoff: '#8e44ad'
  };

  const getColorForDataType = (dataType: keyof WaterFluxData): string => {
    switch (dataType) {
      case 'Precipitation': return colors.precipitation;
      case 'Evapotranspiration': return colors.evapotranspiration;
      case 'Runoff': return colors.runoff;
      default: return colors.precipitation;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Default location (can be configured via widget settings)
      const location = { latitude: 40.7128, longitude: -74.0060 }; // New York City
      const waterFluxData = await GldasService.fetchWaterFluxData(location);
      setData(waterFluxData);
    } catch (err) {
      setError('Failed to load water flux data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const drawChart = () => {
    if (!data || !svgRef.current || !data[selectedDataType]) return;

    // Clear previous chart
    select(svgRef.current).selectAll('*').remove();

    const chartData = data[selectedDataType];

    // Create scales
    const xScale = scaleBand()
      .domain(chartData.map(d => d.date.getTime().toString()))
      .range([0, width])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, max(chartData, d => d.value) || 0])
      .nice()
      .range([height, 0]);

    // Create SVG container
    const svg = select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw bars
    g.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.date.getTime().toString()))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('fill', getColorForDataType(selectedDataType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        // Add tooltip on hover
        select(this).attr('opacity', 0.8);
        
        // Create tooltip
        const tooltip = g.append('g').attr('class', 'tooltip');
        
        const rect = tooltip.append('rect')
          .attr('x', xScale(d.date.getTime().toString()) + xScale.bandwidth() / 2 - 40)
          .attr('y', yScale(d.value) - 40)
          .attr('width', 80)
          .attr('height', 30)
          .attr('fill', 'rgba(0,0,0,0.8)')
          .attr('rx', 4);
        
        tooltip.append('text')
          .attr('x', xScale(d.date.getTime().toString()) + xScale.bandwidth() / 2)
          .attr('y', yScale(d.value) - 20)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(`${d.value.toFixed(1)} mm`);
      })
      .on('mouseout', function() {
        select(this).attr('opacity', 1);
        g.select('.tooltip').remove();
      });

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => {
        const date = new Date(parseInt(d));
        return d3.timeFormat('%b')(date);
      }))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

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
      .text(`${selectedDataType} (mm)`);

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Month');
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      drawChart();
    }
  }, [data, selectedDataType]);

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
      gap: 8px;
      align-items: center;
    }
    
    .data-type-selector {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      font-size: 14px;
      cursor: pointer;
    }
    
    .data-type-selector:focus {
      outline: none;
      border-color: #0079c1;
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
  `;

  return (
    <div css={styles}>
      <div className="widget-container" ref={containerRef}>
        <div className="widget-header">
          <h2 className="widget-title">Water Flux</h2>
          <p className="widget-subtitle">Monthly Water Balance Components</p>
        </div>
        
        <div className="controls">
          <label htmlFor="data-type-select">Data Type:</label>
          <select 
            id="data-type-select"
            className="data-type-selector"
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value as keyof WaterFluxData)}
          >
            <option value="Precipitation">Precipitation</option>
            <option value="Evapotranspiration">Evapotranspiration</option>
            <option value="Runoff">Runoff</option>
          </select>
        </div>
        
        {loading && (
          <div className="loading-container">
            <div>Loading water flux data...</div>
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
        
        {!loading && !error && data && (
          <div className="chart-container">
            <svg ref={svgRef}></svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Widget;