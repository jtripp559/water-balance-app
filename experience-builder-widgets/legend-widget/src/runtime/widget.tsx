/** @jsx jsx */
import { React, AllWidgetProps, jsx, css } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { IMConfig } from '../config';
import { useState, useRef, useEffect } from 'react';
import Legend from '@arcgis/core/widgets/Legend';

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config, useMapWidgetIds } = props;
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [legendWidget, setLegendWidget] = useState<Legend>(null);
  const legendContainerRef = useRef<HTMLDivElement>(null);

  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
    }
  };

  const initializeLegendWidget = () => {
    if (!jimuMapView || !legendContainerRef.current) return;

    // Clean up existing legend widget
    if (legendWidget) {
      legendWidget.destroy();
    }

    // Create new legend widget
    const legend = new Legend({
      view: jimuMapView.view,
      container: legendContainerRef.current,
      style: config?.legendStyle || 'classic',
      respectLayerVisibility: true,
      hideLayersNotInCurrentView: true
    });

    setLegendWidget(legend);
  };

  useEffect(() => {
    if (jimuMapView) {
      initializeLegendWidget();
    }

    return () => {
      if (legendWidget) {
        legendWidget.destroy();
      }
    };
  }, [jimuMapView]);

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
    
    .legend-container {
      padding: 16px;
    }
    
    .legend-widget-container {
      width: 100%;
    }
    
    .legend-widget-container .esri-legend {
      background: transparent !important;
    }
    
    .legend-widget-container .esri-legend__layer {
      margin-bottom: 16px !important;
    }
    
    .legend-widget-container .esri-legend__layer-title {
      font-size: 14px !important;
      font-weight: 600 !important;
      color: #333 !important;
      margin-bottom: 8px !important;
    }
    
    .legend-widget-container .esri-legend__layer-cell {
      padding: 4px 0 !important;
    }
    
    .legend-widget-container .esri-legend__layer-cell-info {
      font-size: 12px !important;
      color: #555 !important;
    }
    
    .legend-widget-container .esri-legend__service {
      margin-bottom: 8px !important;
    }
    
    .no-map-message {
      padding: 16px;
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    .no-layers-message {
      padding: 16px;
      text-align: center;
      color: #666;
      font-style: italic;
      background: #f9f9f9;
      border-radius: 4px;
      margin: 16px;
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
            <h3 className="widget-title">Legend</h3>
          </div>
          <div className="no-map-message">
            Please connect this widget to a Map widget to display the legend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={styles}>
      <div className="widget-container">
        {config?.showTitle !== false && (
          <div className="widget-header">
            <h3 className="widget-title">{config?.widgetTitle || 'Legend'}</h3>
            {config?.widgetSubtitle && (
              <p className="widget-subtitle">{config.widgetSubtitle}</p>
            )}
          </div>
        )}
        
        <div className="legend-container">
          <div 
            className="legend-widget-container"
            ref={legendContainerRef}
          />
          
          {config?.showInstructions !== false && (
            <div className="instructions">
              The legend shows symbology for all visible layers in the map. 
              Turn layers on/off using the Layer Switcher widget to see different legend items.
            </div>
          )}
        </div>
        
        {/* Hidden map component for legend functionality */}
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