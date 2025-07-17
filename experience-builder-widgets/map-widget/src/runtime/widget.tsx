/** @jsx jsx */
import { React, AllWidgetProps, jsx, css, MessageManager, MessageType } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { IMConfig } from '../config';
import { useState, useRef, useEffect } from 'react';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

// Sample GLDAS layer service (adapted from original app)
class GldasService {
  private static baseUrl = 'https://utility.arcgis.com/usrsvcs/servers/';
  
  static async identifyLocation(mapPoint: Point): Promise<any> {
    try {
      console.log('Identifying GLDAS data for location:', mapPoint);
      
      // In a real implementation, this would make actual identify requests to GLDAS services
      // For now, return sample data
      const sampleResult = {
        location: {
          latitude: mapPoint.latitude,
          longitude: mapPoint.longitude
        },
        data: {
          'Soil Moisture': 125.5,
          'Snowpack': 45.2,
          'Precipitation': 67.8,
          'Evapotranspiration': 42.1,
          'Runoff': 18.3
        },
        timestamp: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return sampleResult;
    } catch (error) {
      console.error('Error identifying GLDAS data:', error);
      return null;
    }
  }
}

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config, useMapWidgetIds, id } = props;
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [queryLocation, setQueryLocation] = useState<Point>(null);
  const [identifyResults, setIdentifyResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const graphicsRef = useRef<Graphic[]>([]);

  // Default web map ID for water balance (from original app)
  const defaultWebMapId = config?.webMapId || 'fccbb69d8644430894d3cefc50102dd9';

  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
      
      // Set up click handler for the map
      jmv.view.on('click', handleMapClick);
    }
  };

  const handleMapClick = async (event: any) => {
    if (!jimuMapView) return;

    const mapPoint = event.mapPoint as Point;
    setQueryLocation(mapPoint);
    setLoading(true);
    setError(null);

    try {
      // Clear previous graphics
      clearLocationGraphics();

      // Add click location graphic
      addLocationGraphic(mapPoint);

      // Identify GLDAS data at the clicked location
      const results = await GldasService.identifyLocation(mapPoint);
      
      if (results) {
        setIdentifyResults(results);
        
        // Publish message to other widgets with the identify results
        MessageManager.getInstance().publishMessage({
          type: MessageType.DataRecordSetChange,
          widgetId: id,
          dataRecordSets: [{
            id: 'gldas-identify-results',
            name: 'GLDAS Identify Results',
            records: [results]
          }]
        });
      } else {
        setError('Failed to retrieve data for this location');
      }
    } catch (err) {
      setError('Error querying location data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLocationGraphic = (mapPoint: Point) => {
    if (!jimuMapView) return;

    const symbol = new SimpleMarkerSymbol({
      style: 'circle',
      color: [207, 34, 171, 0.8], // Pink color from original app
      size: 12,
      outline: {
        color: [255, 255, 255, 0.7],
        width: 2
      }
    });

    const graphic = new Graphic({
      geometry: mapPoint,
      symbol: symbol
    });

    jimuMapView.view.graphics.add(graphic);
    graphicsRef.current.push(graphic);
  };

  const clearLocationGraphics = () => {
    if (!jimuMapView) return;

    graphicsRef.current.forEach(graphic => {
      jimuMapView.view.graphics.remove(graphic);
    });
    graphicsRef.current = [];
  };

  const formatValue = (value: number): string => {
    return value.toFixed(1);
  };

  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(4);
  };

  const styles = css`
    .widget-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: white;
    }
    
    .map-container {
      width: 100%;
      height: 100%;
      min-height: 400px;
    }
    
    .info-panel {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.95);
      padding: 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      max-width: 300px;
      z-index: 1000;
    }
    
    .info-panel h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 8px;
    }
    
    .location-info {
      margin-bottom: 12px;
      font-size: 12px;
      color: #666;
    }
    
    .data-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
    }
    
    .data-label {
      font-size: 13px;
      color: #555;
    }
    
    .data-value {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      text-align: right;
    }
    
    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 16px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1001;
    }
    
    .error-message {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(211, 47, 47, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1001;
    }
    
    .instructions {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
    }
    
    .close-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .close-button:hover {
      color: #333;
    }
  `;

  return (
    <div css={styles}>
      <div className="widget-container">
        <div className="map-container">
          <JimuMapViewComponent
            useMapWidgetId={useMapWidgetIds?.[0]}
            onActiveViewChange={onActiveViewChange}
          />
        </div>

        {loading && (
          <div className="loading-indicator">
            <div>Querying location data...</div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {identifyResults && !loading && (
          <div className="info-panel">
            <button 
              className="close-button"
              onClick={() => {
                setIdentifyResults(null);
                clearLocationGraphics();
              }}
              title="Close"
            >
              ×
            </button>
            
            <h3>GLDAS Data</h3>
            
            <div className="location-info">
              Lat: {formatCoordinate(identifyResults.location.latitude)}<br/>
              Lon: {formatCoordinate(identifyResults.location.longitude)}
            </div>
            
            <div className="data-grid">
              <span className="data-label">Soil Moisture:</span>
              <span className="data-value">{formatValue(identifyResults.data['Soil Moisture'])} mm</span>
              
              <span className="data-label">Snowpack:</span>
              <span className="data-value">{formatValue(identifyResults.data['Snowpack'])} mm</span>
              
              <span className="data-label">Precipitation:</span>
              <span className="data-value">{formatValue(identifyResults.data['Precipitation'])} mm</span>
              
              <span className="data-label">Evapotranspiration:</span>
              <span className="data-value">{formatValue(identifyResults.data['Evapotranspiration'])} mm</span>
              
              <span className="data-label">Runoff:</span>
              <span className="data-value">{formatValue(identifyResults.data['Runoff'])} mm</span>
            </div>
          </div>
        )}

        <div className="instructions">
          Click on the map to query GLDAS water balance data
        </div>
      </div>
    </div>
  );
};

export default Widget;