/** @jsx jsx */
import { React, AllWidgetProps, jsx, css } from 'jimu-core';
import { IMConfig } from '../config';
import { useState, useEffect, useRef } from 'react';
import { select, stack, area as d3Area, scaleLinear, scaleTime, extent, max } from 'd3';

// Type definitions adapted from the original app
interface GldasDataItem {
  date: Date;
  value: number;
}

interface WaterStorageData {
  'Soil Moisture': GldasDataItem[];
  'Snowpack': GldasDataItem[];
}

interface CombinedData {
  date: Date;
  'Soil Moisture': number;
  'Snowpack': number;
}

// Sample data for demonstration
const sampleData: WaterStorageData = {
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
  'Snowpack': [
    { date: new Date('2023-01-01'), value: 80 },
    { date: new Date('2023-02-01'), value: 90 },
    { date: new Date('2023-03-01'), value: 85 },
    { date: new Date('2023-04-01'), value: 60 },
    { date: new Date('2023-05-01'), value: 30 },
    { date: new Date('2023-06-01'), value: 10 },
    { date: new Date('2023-07-01'), value: 0 },
    { date: new Date('2023-08-01'), value: 0 },
    { date: new Date('2023-09-01'), value: 5 },
    { date: new Date('2023-10-01'), value: 25 },
    { date: new Date('2023-11-01'), value: 50 },
    { date: new Date('2023-12-01'), value: 75 }
  ]
};

// GLDAS Service integration (adapted from original app)
class GldasService {
  private static baseUrl = 'https://utility.arcgis.com/usrsvcs/servers/';
  
  static async fetchWaterStorageData(location: { latitude: number, longitude: number }): Promise<WaterStorageData> {
    try {
      // In a real implementation, this would make actual API calls to GLDAS services
      // For now, return sample data
      console.log('Fetching GLDAS data for location:', location);
      
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
  const [data, setData] = useState<WaterStorageData>(sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>();
  const containerRef = useRef<HTMLDivElement>();

  // Chart dimensions and margins
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Theme colors (adapted from original app)
  const colors = {
    soilMoisture: '#598fb8',
    snowpack: '#f9f9f9',
    soilMoistureStroke: '#4a7a96',
    snowpackStroke: '#d0d0d0'
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Default location (can be configured via widget settings)
      const location = { latitude: 40.7128, longitude: -74.0060 }; // New York City
      const waterStorageData = await GldasService.fetchWaterStorageData(location);
      setData(waterStorageData);
    } catch (err) {
      setError('Failed to load water storage data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const drawChart = () => {
    if (!data || !svgRef.current) return;

    // Clear previous chart
    select(svgRef.current).selectAll('*').remove();

    // Combine the data
    const combinedData: CombinedData[] = data['Soil Moisture'].map((d, i) => ({
      date: d.date,
      'Soil Moisture': d.value,
      'Snowpack': data.Snowpack[i]?.value || 0
    }));

    // Create scales
    const xScale = scaleTime()
      .domain(extent(combinedData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([0, max(combinedData, d => d['Soil Moisture'] + d['Snowpack']) || 0])
      .nice()
      .range([height, 0]);

    // Create SVG container
    const svg = select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create stack
    const stackGenerator = stack<CombinedData>()
      .keys(['Soil Moisture', 'Snowpack']);

    const series = stackGenerator(combinedData);

    // Create area generator
    const areaGenerator = d3Area<any>()
      .x(d => xScale(d.data.date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    // Draw areas
    g.selectAll('.area')
      .data(series)
      .enter()
      .append('path')
      .attr('class', 'area')
      .attr('d', areaGenerator)
      .attr('fill', d => {
        return d.key === 'Soil Moisture' ? colors.soilMoisture : colors.snowpack;
      })
      .attr('stroke', d => {
        return d.key === 'Soil Moisture' ? colors.soilMoistureStroke : colors.snowpackStroke;
      })
      .attr('stroke-width', 1);

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
      .text('Water Storage (mm)');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Date');

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 20)`);

    const legendData = [
      { name: 'Soil Moisture', color: colors.soilMoisture },
      { name: 'Snowpack', color: colors.snowpack }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.name === 'Soil Moisture' ? colors.soilMoistureStroke : colors.snowpackStroke);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.name);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      drawChart();
    }
  }, [data]);

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
          <h2 className="widget-title">Water Storage</h2>
          <p className="widget-subtitle">Soil Moisture and Snowpack Data</p>
        </div>
        
        {loading && (
          <div className="loading-container">
            <div>Loading water storage data...</div>
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