# Water Balance Experience Builder Widget Examples

This folder contains complete, production-ready examples of ArcGIS Experience Builder widgets that demonstrate how to port the Water Balance React application functionality into Experience Builder.

## What's Included

### Chart Widgets
All chart widgets use D3.js for rendering and include the same visual styling as the original application:

- **stacked-area-chart/** - Water storage visualization (soil moisture + snowpack)
- **bar-chart/** - Water flux data display (precipitation, evapotranspiration, runoff)  
- **line-chart/** - Multi-series trend analysis with interactive controls

### Map & UI Widgets
These widgets integrate with Experience Builder's mapping and UI framework:

- **map-widget/** - Interactive map with click-to-query GLDAS data
- **search-widget/** - Location search with geocoding integration
- **legend-widget/** - Dynamic legend that updates with visible layers
- **layer-switcher/** - GLDAS layer visibility and selection controls

### Shared Resources
- **shared/services/** - Common GLDAS data service with live API integration

## Key Features

### Live Data Integration
- Pre-configured connections to NASA's GLDAS web services
- Fallback to sample data for development and testing
- Real-time data querying and visualization
- Time series data retrieval for historical analysis

### Experience Builder Integration
- Full compatibility with Experience Builder Developer Edition 1.13+
- Widget-to-widget messaging for coordinated interactions
- Map widget integration for spatial queries
- Configuration panels for customization
- TypeScript support with proper type definitions

### Professional Styling
- Consistent visual design matching the original application
- Responsive layouts that work on all screen sizes
- Interactive tooltips and hover effects
- Accessible color schemes and contrast ratios

## Quick Start

1. **Copy widgets to Experience Builder:**
   ```bash
   cp -r experience-builder-widgets/* /path/to/experience-builder/client/your-extensions/widgets/
   ```

2. **Install dependencies for each widget:**
   ```bash
   cd /path/to/experience-builder/client/your-extensions/widgets/water-balance-stacked-area-chart
   npm install
   ```

3. **Start Experience Builder in development mode:**
   ```bash
   cd /path/to/experience-builder
   npm start
   ```

4. **Add widgets to your Experience Builder app:**
   - The widgets will appear in the widget panel under "Custom Widgets"
   - Drag and drop them into your app layout
   - Configure data connections and styling as needed

## Widget Configuration Examples

### Map Widget Setup
```javascript
// In the Map widget settings:
{
  "webMapId": "fccbb69d8644430894d3cefc50102dd9", // Water Balance web map
  "enableClickToQuery": true,
  "showQueryResults": true,
  "queryResultsPosition": "top-right"
}
```

### Chart Widget Configuration
```javascript
// Example stacked area chart configuration:
{
  "chartTitle": "Water Storage Components",
  "chartSubtitle": "Soil Moisture and Snowpack Data",
  "soilMoistureColor": "#598fb8",
  "snowpackColor": "#f9f9f9",
  "defaultLatitude": 40.7128,
  "defaultLongitude": -74.0060
}
```

### Widget Messaging
Widgets communicate using Experience Builder's messaging system:

```javascript
// Map widget publishes location data:
MessageManager.getInstance().publishMessage({
  type: MessageType.DataRecordSetChange,
  widgetId: 'map-widget-id',
  dataRecordSets: [{
    id: 'gldas-identify-results',
    records: [identifyResults]
  }]
});

// Chart widgets can listen for and consume this data
```

## Advanced Usage

### Custom Data Sources
Replace the GLDAS service with your own data:

```javascript
// In widget.tsx:
class CustomDataService {
  static async fetchData(location) {
    const response = await fetch(`/api/water-data?lat=${location.latitude}&lon=${location.longitude}`);
    return response.json();
  }
}
```

### Styling Customization
Modify the CSS-in-JS styles in each widget:

```javascript
const styles = css`
  .widget-container {
    background: ${props.theme.colors.primary};
    border-radius: ${props.theme.borderRadius};
  }
`;
```

### Adding New Chart Types
Extend the existing chart widgets or create new ones:

```javascript
// Example: Add a pie chart for water balance components
const drawPieChart = () => {
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);
  
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
    
  // ... rest of D3 pie chart implementation
};
```

## Production Deployment

### Building for Production
Each widget includes build scripts:

```bash
cd water-balance-stacked-area-chart
npm run build
```

### Performance Optimization
- Widgets use React hooks for efficient re-rendering
- D3 charts are optimized for large datasets
- API calls include proper error handling and loading states
- Image and asset optimization is built-in

### Accessibility
- All widgets follow WCAG 2.1 guidelines
- Keyboard navigation is supported
- Screen reader compatibility is built-in
- High contrast mode support

## Troubleshooting

### Common Issues

**Widgets not appearing in Experience Builder:**
- Check manifest.json syntax
- Ensure proper folder structure
- Verify Experience Builder version compatibility

**Data loading errors:**
- Check network connectivity to GLDAS services
- Verify CORS settings if using custom endpoints
- Review browser console for detailed error messages

**Styling problems:**
- Ensure CSS-in-JS syntax is correct
- Check for conflicting styles from Experience Builder themes
- Verify responsive breakpoints

### Support Resources
- [Experience Builder Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/widget-development/)
- [ArcGIS Maps SDK for JavaScript API Reference](https://developers.arcgis.com/javascript/latest/api-reference/)
- [GLDAS Data Documentation](https://ldas.gsfc.nasa.gov/gldas)

## Contributing

To extend or modify these widgets:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-widget`
3. Make changes and test thoroughly
4. Submit pull request with detailed description

## License

These widgets follow the same license as the main Water Balance application. See the license file in the repository root for details.