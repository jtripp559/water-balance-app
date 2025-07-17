/** @jsx jsx */
import { React, AllWidgetProps, jsx, css, MessageManager, MessageType } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { IMConfig } from '../config';
import { useState, useRef, useEffect } from 'react';
import Search from '@arcgis/core/widgets/Search';
import Point from '@arcgis/core/geometry/Point';

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config, useMapWidgetIds, id } = props;
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [searchWidget, setSearchWidget] = useState<Search>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
    }
  };

  const initializeSearchWidget = () => {
    if (!jimuMapView || !searchContainerRef.current) return;

    // Clean up existing search widget
    if (searchWidget) {
      searchWidget.destroy();
    }

    // Create new search widget
    const search = new Search({
      view: jimuMapView.view,
      container: searchContainerRef.current,
      popupEnabled: false,
      resultGraphicEnabled: true,
      searchAllEnabled: false,
      includeDefaultSources: true,
      locationEnabled: true,
      searchTerm: '',
      autoSelect: true,
      maxResults: 6,
      maxSuggestions: 6,
      minSuggestCharacters: 2,
      suggestionsEnabled: true,
      goToOverride: (view, goToParams) => {
        // Custom go-to behavior
        const target = goToParams.target;
        
        if (target && target.geometry) {
          const geometry = target.geometry;
          let mapPoint: Point;

          if (geometry.type === 'point') {
            mapPoint = geometry as Point;
          } else if (geometry.extent) {
            mapPoint = geometry.extent.center as Point;
          }

          if (mapPoint) {
            // Zoom to the location
            view.goTo({
              center: mapPoint,
              zoom: config?.zoomLevel || 12
            });

            // Publish the selected location to other widgets
            MessageManager.getInstance().publishMessage({
              type: MessageType.DataRecordSetChange,
              widgetId: id,
              dataRecordSets: [{
                id: 'search-location',
                name: 'Search Location',
                records: [{
                  location: {
                    latitude: mapPoint.latitude,
                    longitude: mapPoint.longitude
                  },
                  address: target.name || 'Selected Location',
                  timestamp: new Date().toISOString()
                }]
              }]
            });

            // Trigger map click event if configured
            if (config?.triggerMapClick) {
              setTimeout(() => {
                jimuMapView.view.emit('click', {
                  mapPoint: mapPoint,
                  x: view.width / 2,
                  y: view.height / 2,
                  button: 0,
                  buttons: 1,
                  type: 'click',
                  stopPropagation: () => {},
                  timestamp: Date.now(),
                  native: null
                });
              }, 500);
            }
          }
        }

        return Promise.resolve();
      }
    });

    // Set up event handlers
    search.on('search-complete', (event) => {
      console.log('Search completed:', event);
      
      if (event.results && event.results.length > 0) {
        const firstResult = event.results[0];
        if (firstResult.results && firstResult.results.length > 0) {
          const result = firstResult.results[0];
          const feature = result.feature;
          
          if (feature && feature.geometry) {
            const geometry = feature.geometry;
            let mapPoint: Point;

            if (geometry.type === 'point') {
              mapPoint = geometry as Point;
            } else if (geometry.extent) {
              mapPoint = geometry.extent.center as Point;
            }

            if (mapPoint) {
              // Publish search result
              MessageManager.getInstance().publishMessage({
                type: MessageType.DataRecordSetChange,
                widgetId: id,
                dataRecordSets: [{
                  id: 'search-result',
                  name: 'Search Result',
                  records: [{
                    location: {
                      latitude: mapPoint.latitude,
                      longitude: mapPoint.longitude
                    },
                    address: result.name || 'Search Result',
                    score: result.feature.attributes?.Score || 100,
                    timestamp: new Date().toISOString()
                  }]
                }]
              });
            }
          }
        }
      }
    });

    search.on('search-clear', () => {
      console.log('Search cleared');
      // Clear any published data
      MessageManager.getInstance().publishMessage({
        type: MessageType.DataRecordSetChange,
        widgetId: id,
        dataRecordSets: []
      });
    });

    setSearchWidget(search);
  };

  useEffect(() => {
    if (jimuMapView) {
      initializeSearchWidget();
    }

    return () => {
      if (searchWidget) {
        searchWidget.destroy();
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
    
    .search-container {
      padding: 16px;
    }
    
    .search-widget-container {
      width: 100%;
    }
    
    .search-widget-container .esri-search {
      width: 100% !important;
    }
    
    .search-widget-container .esri-search__input {
      width: 100% !important;
      border-radius: 4px !important;
      border: 1px solid #ccc !important;
      font-size: 14px !important;
      padding: 8px 12px !important;
    }
    
    .search-widget-container .esri-search__input:focus {
      border-color: #0079c1 !important;
      outline: none !important;
      box-shadow: 0 0 0 2px rgba(0, 121, 193, 0.2) !important;
    }
    
    .search-widget-container .esri-search__submit-button {
      background-color: #0079c1 !important;
      border-color: #0079c1 !important;
    }
    
    .search-widget-container .esri-search__submit-button:hover {
      background-color: #005a8b !important;
      border-color: #005a8b !important;
    }
    
    .search-widget-container .esri-search__sources-button {
      border-color: #ccc !important;
    }
    
    .search-widget-container .esri-search__suggestions-menu {
      border: 1px solid #ccc !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
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
    
    .no-map-message {
      padding: 16px;
      text-align: center;
      color: #666;
      font-style: italic;
    }
  `;

  if (!useMapWidgetIds || useMapWidgetIds.length === 0) {
    return (
      <div css={styles}>
        <div className="widget-container">
          <div className="widget-header">
            <h3 className="widget-title">Location Search</h3>
          </div>
          <div className="no-map-message">
            Please connect this widget to a Map widget to enable search functionality.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={styles}>
      <div className="widget-container">
        <div className="widget-header">
          <h3 className="widget-title">Location Search</h3>
          <p className="widget-subtitle">Find places and addresses</p>
        </div>
        
        <div className="search-container">
          <div 
            className="search-widget-container"
            ref={searchContainerRef}
          />
          
          <div className="instructions">
            <strong>How to use:</strong><br/>
            • Type an address, place name, or coordinates<br/>
            • Select from the suggestions that appear<br/>
            • The map will zoom to your selection<br/>
            • Click the map to query water balance data
          </div>
        </div>
        
        {/* Hidden map component for search functionality */}
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