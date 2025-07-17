# Water Balance Experience Builder Widgets

This folder contains ArcGIS Experience Builder Developer Edition widgets that replicate the functionality of the main Water Balance React application. Each widget is designed to be used as a standalone component in Experience Builder applications.

## Available Widgets

### Chart Widgets
- **stacked-area-chart** - Displays water storage data (soil moisture + snowpack) as a stacked area chart
- **bar-chart** - Displays water flux data (precipitation, evapotranspiration, runoff) as bar charts
- **line-chart** - Displays trend data as line charts

### Map and UI Widgets
- **map-widget** - Interactive map displaying GLDAS water balance layers
- **search-widget** - Location search functionality integrated with the map
- **legend-widget** - Dynamic legend for map layers
- **layer-switcher** - Toggle between different GLDAS data layers

## Installation Instructions

### Prerequisites
- ArcGIS Experience Builder Developer Edition 1.13 or later
- Node.js 18+ and npm
- ArcGIS Online organizational account

### Setup Steps

1. **Download Experience Builder Developer Edition**
   ```bash
   # Download from ArcGIS Developers site
   # Extract to your desired location
   ```

2. **Copy Widgets to Experience Builder**
   ```bash
   # Copy each widget folder to your Experience Builder widgets directory
   cp -r experience-builder-widgets/* /path/to/experience-builder/client/your-extensions/widgets/
   ```

3. **Install Widget Dependencies**
   ```bash
   cd /path/to/experience-builder/client/your-extensions/widgets/water-balance-stacked-area-chart
   npm install
   
   # Repeat for each widget
   ```

4. **Register Widgets in Experience Builder**
   - Start Experience Builder in development mode
   - The widgets will appear in the widget panel under "Custom Widgets"

## Widget Configuration

### Data Source Configuration
All chart widgets can connect to:
- **Live GLDAS Web Services** - Real-time data from NASA's GLDAS system
- **Custom Data Sources** - Your own web services or feature layers
- **Sample Data** - Built-in sample data for testing

### Map Widget Configuration
- Set the web map ID (default: Water Balance basemap)
- Configure extent and zoom levels
- Set click behavior for data querying

### Chart Widget Configuration
- Select data layer (Soil Moisture, Snowpack, Precipitation, etc.)
- Configure time range and aggregation
- Customize colors and styling
- Set chart dimensions and responsive behavior

## Live Data Integration

The widgets are pre-configured to connect to the same live data sources used in the main application:

### GLDAS Web Services
- **Soil Moisture**: GLDAS Noah Land Surface Model data
- **Snowpack**: Snow water equivalent data
- **Precipitation**: Monthly precipitation totals
- **Evapotranspiration**: Actual evapotranspiration rates
- **Runoff**: Surface and subsurface runoff
- **Change in Storage**: Water storage change calculations

### API Endpoints
```javascript
// Example configuration for live data
const gldasConfig = {
  baseUrl: 'https://utility.arcgis.com/usrsvcs/servers/.../rest/services/',
  layers: {
    soilMoisture: 'GLDAS/Soil_Moisture_2000_Present/ImageServer',
    snowpack: 'GLDAS/Snow_Water_Equivalent_2000_Present/ImageServer',
    // ... other layers
  }
};
```

## Development Guide

### Adding Custom Data Sources
1. Edit the widget's `src/runtime/widget.tsx`
2. Implement your data service in the `services/` folder
3. Update the widget manifest to include new configuration options

### Customizing Styling
1. Modify the widget's CSS files
2. Update theme variables in `src/runtime/style.css`
3. Use Experience Builder's design system variables when possible

### Testing Widgets
```bash
# Start Experience Builder in development mode
npm start

# Widgets will hot-reload during development
```

## Widget Details

### Stacked Area Chart Widget
- **Purpose**: Visualize water storage components over time
- **Data**: Soil moisture and snowpack data combined
- **Interactions**: Hover tooltips, time scrubbing, zoom controls
- **File**: `stacked-area-chart/`

### Bar Chart Widget
- **Purpose**: Display water flux data as grouped bars
- **Data**: Precipitation, evapotranspiration, and runoff
- **Interactions**: Toggle data series, hover details
- **File**: `bar-chart/`

### Line Chart Widget
- **Purpose**: Show trends and changes over time
- **Data**: Any time-series data from GLDAS
- **Interactions**: Multi-series comparison, trend analysis
- **File**: `line-chart/`

### Map Widget
- **Purpose**: Interactive map with GLDAS layers
- **Features**: Click-to-query, layer switching, legend integration
- **File**: `map-widget/`

### Search Widget
- **Purpose**: Geocoding and location search
- **Integration**: Connects to map widget for location selection
- **File**: `search-widget/`

### Legend Widget
- **Purpose**: Dynamic legend for active map layers
- **Features**: Auto-updates based on visible layers
- **File**: `legend-widget/`

### Layer Switcher Widget
- **Purpose**: Toggle between different GLDAS data layers
- **Features**: Layer visibility control, data type selection
- **File**: `layer-switcher/`

## Troubleshooting

### Common Issues
1. **Widgets not appearing**: Check widget manifest syntax and file paths
2. **Data not loading**: Verify API endpoints and CORS settings
3. **Styling issues**: Ensure CSS files are properly imported
4. **Build errors**: Check TypeScript configuration and dependencies

### Support Resources
- [Experience Builder Developer Guide](https://developers.arcgis.com/experience-builder/)
- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/latest/)
- [Widget Development Samples](https://github.com/Esri/arcgis-experience-builder-sdk-resources)

## License
This project follows the same license as the main Water Balance application.