/** @jsx jsx */
import { React, AllWidgetProps, jsx, css, MessageManager, MessageType } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { IMConfig } from '../config';
import { useState, useEffect } from 'react';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';

// GLDAS Layer definitions (adapted from original app)
interface GldasLayerInfo {
  id: string;
  name: string;
  title: string;
  description: string;
  category: 'Water Storage' | 'Water Flux' | 'Change';
  color: string;
}

const gldasLayers: GldasLayerInfo[] = [
  {
    id: 'soil-moisture',
    name: 'Soil Moisture',
    title: 'Soil Moisture',
    description: 'GLDAS Noah Land Surface Model soil moisture data',
    category: 'Water Storage',
    color: '#598fb8'
  },
  {
    id: 'snowpack',
    name: 'Snowpack',
    title: 'Snowpack',
    description: 'Snow water equivalent data',
    category: 'Water Storage',
    color: '#f9f9f9'
  },
  {
    id: 'precipitation',
    name: 'Precipitation',
    title: 'Precipitation',
    description: 'Monthly precipitation totals',
    category: 'Water Flux',
    color: '#5984ca'
  },
  {
    id: 'evapotranspiration',
    name: 'Evapotranspiration',
    title: 'Evapotranspiration',
    description: 'Actual evapotranspiration rates',
    category: 'Water Flux',
    color: '#b15a4d'
  },
  {
    id: 'runoff',
    name: 'Runoff',
    title: 'Runoff',
    description: 'Surface and subsurface runoff',
    category: 'Water Flux',
    color: '#8e44ad'
  },
  {
    id: 'change-in-storage',
    name: 'Change in Storage',
    title: 'Change in Storage',
    description: 'Water storage change calculations',
    category: 'Change',
    color: '#542788'
  }
];

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config, useMapWidgetIds, id } = props;
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [mapLayers, setMapLayers] = useState<Collection<Layer>>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('soil-moisture');
  const [layerVisibility, setLayerVisibility] = useState<{[key: string]: boolean}>({});

  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
      setMapLayers(jmv.view.map.layers);
      
      // Initialize layer visibility state
      const visibility: {[key: string]: boolean} = {};
      jmv.view.map.layers.forEach(layer => {
        const layerInfo = gldasLayers.find(gl => 
          layer.title?.includes(gl.title) || layer.id?.includes(gl.id)
        );
        if (layerInfo) {
          visibility[layerInfo.id] = layer.visible;
        }
      });
      setLayerVisibility(visibility);
    }
  };

  const handleLayerSelect = (layerId: string) => {
    setSelectedLayer(layerId);
    
    const layerInfo = gldasLayers.find(layer => layer.id === layerId);
    if (layerInfo) {
      // Publish selected layer information to other widgets
      MessageManager.getInstance().publishMessage({
        type: MessageType.DataRecordSetChange,
        widgetId: id,
        dataRecordSets: [{
          id: 'selected-layer',
          name: 'Selected Layer',
          records: [{
            layerId: layerId,
            layerName: layerInfo.name,
            layerTitle: layerInfo.title,
            category: layerInfo.category,
            color: layerInfo.color,
            description: layerInfo.description,
            timestamp: new Date().toISOString()
          }]
        }]
      });
    }
  };

  const handleLayerVisibilityToggle = (layerId: string) => {
    if (!jimuMapView || !mapLayers) return;

    const newVisibility = !layerVisibility[layerId];
    
    // Find and toggle the corresponding map layer
    mapLayers.forEach(layer => {
      const layerInfo = gldasLayers.find(gl => 
        layer.title?.includes(gl.title) || layer.id?.includes(gl.id)
      );
      if (layerInfo && layerInfo.id === layerId) {
        layer.visible = newVisibility;
      }
    });

    // Update local state
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: newVisibility
    }));

    // Publish visibility change
    const layerInfo = gldasLayers.find(layer => layer.id === layerId);
    if (layerInfo) {
      MessageManager.getInstance().publishMessage({
        type: MessageType.DataRecordSetChange,
        widgetId: id,
        dataRecordSets: [{
          id: 'layer-visibility-change',
          name: 'Layer Visibility Change',
          records: [{
            layerId: layerId,
            layerName: layerInfo.name,
            visible: newVisibility,
            timestamp: new Date().toISOString()
          }]
        }]
      });
    }
  };

  const groupedLayers = gldasLayers.reduce((groups, layer) => {
    const category = layer.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(layer);
    return groups;
  }, {} as {[key: string]: GldasLayerInfo[]});

  const styles = css`
    .widget-container {
      width: 100%;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .widget-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #f5f5f5;
      border-radius: 4px 4px 0 0;
    }
    
    .widget-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .widget-subtitle {
      font-size: 12px;
      color: #666;
      margin: 4px 0 0 0;
    }
    
    .layer-groups {
      padding: 16px;
    }
    
    .layer-group {
      margin-bottom: 20px;
    }
    
    .layer-group:last-child {
      margin-bottom: 0;
    }
    
    .group-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 4px;
    }
    
    .layer-item {
      display: flex;
      align-items: center;
      padding: 8px;
      margin-bottom: 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .layer-item:hover {
      background-color: #f5f5f5;
    }
    
    .layer-item.selected {
      background-color: #e3f2fd;
      border: 1px solid #0079c1;
    }
    
    .layer-item.disabled {
      opacity: 0.5;
    }
    
    .layer-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      margin-right: 8px;
      border: 1px solid #ccc;
    }
    
    .layer-info {
      flex: 1;
      margin-right: 8px;
    }
    
    .layer-name {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }
    
    .layer-description {
      font-size: 11px;
      color: #666;
      line-height: 1.3;
    }
    
    .layer-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .visibility-toggle {
      width: 20px;
      height: 20px;
      border: 1px solid #ccc;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      background: white;
    }
    
    .visibility-toggle.visible {
      background-color: #0079c1;
      color: white;
      border-color: #0079c1;
    }
    
    .select-button {
      padding: 4px 8px;
      font-size: 11px;
      border: 1px solid #0079c1;
      background: white;
      color: #0079c1;
      border-radius: 3px;
      cursor: pointer;
    }
    
    .select-button:hover {
      background-color: #0079c1;
      color: white;
    }
    
    .select-button.selected {
      background-color: #0079c1;
      color: white;
    }
    
    .no-map-message {
      padding: 16px;
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    .instructions {
      margin-top: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }
  `;

  if (!useMapWidgetIds || useMapWidgetIds.length === 0) {
    return (
      <div css={styles}>
        <div className="widget-container">
          <div className="widget-header">
            <h3 className="widget-title">Layer Switcher</h3>
          </div>
          <div className="no-map-message">
            Please connect this widget to a Map widget to control layer visibility.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={styles}>
      <div className="widget-container">
        <div className="widget-header">
          <h3 className="widget-title">{config?.widgetTitle || 'Layer Switcher'}</h3>
          <p className="widget-subtitle">Toggle GLDAS water balance layers</p>
        </div>
        
        <div className="layer-groups">
          {Object.entries(groupedLayers).map(([category, layers]) => (
            <div key={category} className="layer-group">
              <div className="group-title">{category}</div>
              {layers.map(layer => (
                <div 
                  key={layer.id}
                  className={`layer-item ${selectedLayer === layer.id ? 'selected' : ''}`}
                  onClick={() => handleLayerSelect(layer.id)}
                >
                  <div 
                    className="layer-color"
                    style={{ backgroundColor: layer.color }}
                  />
                  <div className="layer-info">
                    <div className="layer-name">{layer.name}</div>
                    <div className="layer-description">{layer.description}</div>
                  </div>
                  <div className="layer-controls">
                    <div 
                      className={`visibility-toggle ${layerVisibility[layer.id] ? 'visible' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLayerVisibilityToggle(layer.id);
                      }}
                      title={layerVisibility[layer.id] ? 'Hide layer' : 'Show layer'}
                    >
                      {layerVisibility[layer.id] ? '✓' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          <div className="instructions">
            <strong>How to use:</strong><br/>
            • Click a layer to select it for chart widgets<br/>
            • Use the checkbox to show/hide layers on the map<br/>
            • Selected layer data will be used by connected chart widgets
          </div>
        </div>
        
        {/* Hidden map component for layer control */}
        <div style={{ display: 'none' }}>
          <JimuMapViewComponent
            useMapWidgetId={useMapWidgetIds?.[0]}
            onActiveViewChange={onActiveViewChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Widget;