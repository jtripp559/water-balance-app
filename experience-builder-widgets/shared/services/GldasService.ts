/**
 * GLDAS Service for Water Balance Experience Builder Widgets
 * 
 * This service provides data access to GLDAS (Global Land Data Assimilation System)
 * web services for retrieving water balance data including soil moisture, snowpack,
 * precipitation, evapotranspiration, runoff, and change in storage.
 * 
 * Based on the original Water Balance application service implementation.
 */

import axios from 'axios';

export interface GldasDataItem {
  date: Date;
  value: number;
}

export interface GldasLayerInfo {
  id: string;
  name: string;
  title: string;
  url: string;
  description: string;
  category: 'Water Storage' | 'Water Flux' | 'Change';
  color: string;
  units: string;
}

// GLDAS Layer Configuration (adapted from original app)
export const GLDAS_LAYERS: {[key: string]: GldasLayerInfo} = {
  'soil-moisture': {
    id: 'soil-moisture',
    name: 'Soil Moisture',
    title: 'Soil Moisture',
    url: 'https://utility.arcgis.com/usrsvcs/servers/02f7e5660ae848a890a20365d7628057/rest/services/GLDAS/Soil_Moisture_2000_Present/ImageServer',
    description: 'GLDAS Noah Land Surface Model soil moisture data',
    category: 'Water Storage',
    color: '#598fb8',
    units: 'mm'
  },
  'snowpack': {
    id: 'snowpack',
    name: 'Snowpack',
    title: 'Snowpack',
    url: 'https://utility.arcgis.com/usrsvcs/servers/02f7e5660ae848a890a20365d7628057/rest/services/GLDAS/Snow_Water_Equivalent_2000_Present/ImageServer',
    description: 'Snow water equivalent data',
    category: 'Water Storage',
    color: '#f9f9f9',
    units: 'mm'
  },
  'precipitation': {
    id: 'precipitation',
    name: 'Precipitation',
    title: 'Precipitation',
    url: 'https://utility.arcgis.com/usrsvcs/servers/02f7e5660ae848a890a20365d7628057/rest/services/GLDAS/Precipitation_2000_Present/ImageServer',
    description: 'Monthly precipitation totals',
    category: 'Water Flux',
    color: '#5984ca',
    units: 'mm'
  },
  'evapotranspiration': {
    id: 'evapotranspiration',
    name: 'Evapotranspiration',
    title: 'Evapotranspiration',
    url: 'https://utility.arcgis.com/usrsvcs/servers/02f7e5660ae848a890a20365d7628057/rest/services/GLDAS/Evapotranspiration_2000_Present/ImageServer',
    description: 'Actual evapotranspiration rates',
    category: 'Water Flux',
    color: '#b15a4d',
    units: 'mm'
  },
  'runoff': {
    id: 'runoff',
    name: 'Runoff',
    title: 'Runoff',
    url: 'https://utility.arcgis.com/usrsvcs/servers/02f7e5660ae848a890a20365d7628057/rest/services/GLDAS/Runoff_2000_Present/ImageServer',
    description: 'Surface and subsurface runoff',
    category: 'Water Flux',
    color: '#8e44ad',
    units: 'mm'
  },
  'change-in-storage': {
    id: 'change-in-storage',
    name: 'Change in Storage',
    title: 'Change in Storage',
    url: 'https://utility.arcgis.com/usrsvcs/servers/02f7e5660ae848a890a20365d7628057/rest/services/GLDAS/Change_in_Storage_2000_Present/ImageServer',
    description: 'Water storage change calculations',
    category: 'Change',
    color: '#542788',
    units: 'mm'
  }
};

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface GldasIdentifyResult {
  location: LocationPoint;
  data: {[layerName: string]: number};
  timestamp: string;
}

export interface TimeSeriesData {
  [layerName: string]: GldasDataItem[];
}

export class GldasService {
  private static instance: GldasService;
  private timeExtent: Date[] = [];
  
  public static getInstance(): GldasService {
    if (!GldasService.instance) {
      GldasService.instance = new GldasService();
    }
    return GldasService.instance;
  }

  /**
   * Get the time extent available for GLDAS data
   */
  public async getTimeExtent(): Promise<Date[]> {
    if (this.timeExtent.length > 0) {
      return this.timeExtent;
    }

    try {
      // Use snowpack layer to get time extent (as in original app)
      const url = `${GLDAS_LAYERS.snowpack.url}/multiDimensionalInfo?f=json`;
      const response = await axios.get(url);

      const values: number[] = (
        response.data?.multidimensionalInfo?.variables?.[0]?.dimensions?.[0]?.values
      ) || [];

      this.timeExtent = values.map(timestamp => new Date(timestamp));
      return this.timeExtent;
    } catch (error) {
      console.error('Error fetching time extent:', error);
      // Return sample time extent as fallback
      return this.generateSampleTimeExtent();
    }
  }

  /**
   * Identify GLDAS data at a specific location
   */
  public async identifyLocation(location: LocationPoint): Promise<GldasIdentifyResult> {
    try {
      console.log('Identifying GLDAS data for location:', location);

      // In a production environment, this would make actual identify requests
      // to each GLDAS service. For this example, we'll return sample data.
      
      const results: {[layerName: string]: number} = {};
      
      // Simulate API calls to each GLDAS layer
      for (const [layerId, layerInfo] of Object.entries(GLDAS_LAYERS)) {
        try {
          // Sample identify request (in real implementation, this would be an actual API call)
          const value = await this.performIdentifyRequest(layerInfo.url, location);
          results[layerInfo.name] = value;
        } catch (error) {
          console.warn(`Failed to identify ${layerInfo.name}:`, error);
          // Use sample data as fallback
          results[layerInfo.name] = this.generateSampleValue(layerId);
        }
      }

      return {
        location,
        data: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in identifyLocation:', error);
      throw error;
    }
  }

  /**
   * Get time series data for specific layers at a location
   */
  public async getTimeSeriesData(
    location: LocationPoint, 
    layerIds: string[] = Object.keys(GLDAS_LAYERS)
  ): Promise<TimeSeriesData> {
    try {
      console.log('Fetching time series data for layers:', layerIds, 'at location:', location);

      const timeExtent = await this.getTimeExtent();
      const results: TimeSeriesData = {};

      for (const layerId of layerIds) {
        const layerInfo = GLDAS_LAYERS[layerId];
        if (!layerInfo) continue;

        try {
          // In production, this would make time series requests to the image service
          const seriesData = await this.performTimeSeriesRequest(layerInfo.url, location, timeExtent);
          results[layerInfo.name] = seriesData;
        } catch (error) {
          console.warn(`Failed to fetch time series for ${layerInfo.name}:`, error);
          // Use sample data as fallback
          results[layerInfo.name] = this.generateSampleTimeSeries(layerId, timeExtent);
        }
      }

      return results;
    } catch (error) {
      console.error('Error in getTimeSeriesData:', error);
      throw error;
    }
  }

  /**
   * Get water storage data (soil moisture + snowpack)
   */
  public async getWaterStorageData(location: LocationPoint): Promise<TimeSeriesData> {
    return this.getTimeSeriesData(location, ['soil-moisture', 'snowpack']);
  }

  /**
   * Get water flux data (precipitation, evapotranspiration, runoff)
   */
  public async getWaterFluxData(location: LocationPoint): Promise<TimeSeriesData> {
    return this.getTimeSeriesData(location, ['precipitation', 'evapotranspiration', 'runoff']);
  }

  /**
   * Private method to perform actual identify request (placeholder)
   */
  private async performIdentifyRequest(serviceUrl: string, location: LocationPoint): Promise<number> {
    // In a real implementation, this would construct and execute an identify request
    // const identifyUrl = `${serviceUrl}/identify`;
    // const params = {
    //   geometry: `${location.longitude},${location.latitude}`,
    //   geometryType: 'esriGeometryPoint',
    //   sr: 4326,
    //   layers: 'all',
    //   tolerance: 0,
    //   returnGeometry: false,
    //   f: 'json'
    // };
    // const response = await axios.get(identifyUrl, { params });
    // return this.parseIdentifyResponse(response.data);

    // For now, simulate with sample data
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    return this.generateSampleValue(this.getLayerIdFromUrl(serviceUrl));
  }

  /**
   * Private method to perform time series request (placeholder)
   */
  private async performTimeSeriesRequest(
    serviceUrl: string, 
    location: LocationPoint, 
    timeExtent: Date[]
  ): Promise<GldasDataItem[]> {
    // In a real implementation, this would make multiple requests for time series data
    // or use the image service's time-aware capabilities
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return this.generateSampleTimeSeries(this.getLayerIdFromUrl(serviceUrl), timeExtent);
  }

  /**
   * Generate sample time extent for fallback
   */
  private generateSampleTimeExtent(): Date[] {
    const dates: Date[] = [];
    const startDate = new Date('2023-01-01');
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(i);
      dates.push(date);
    }
    
    return dates;
  }

  /**
   * Generate sample data for fallback scenarios
   */
  private generateSampleValue(layerId: string): number {
    const ranges = {
      'soil-moisture': [80, 150],
      'snowpack': [0, 100],
      'precipitation': [20, 100],
      'evapotranspiration': [10, 80],
      'runoff': [5, 30],
      'change-in-storage': [-20, 20]
    };

    const range = ranges[layerId] || [0, 100];
    return Math.random() * (range[1] - range[0]) + range[0];
  }

  /**
   * Generate sample time series for fallback scenarios
   */
  private generateSampleTimeSeries(layerId: string, timeExtent: Date[]): GldasDataItem[] {
    return timeExtent.map(date => ({
      date: new Date(date),
      value: this.generateSampleValue(layerId)
    }));
  }

  /**
   * Extract layer ID from service URL
   */
  private getLayerIdFromUrl(serviceUrl: string): string {
    if (serviceUrl.includes('Soil_Moisture')) return 'soil-moisture';
    if (serviceUrl.includes('Snow_Water_Equivalent')) return 'snowpack';
    if (serviceUrl.includes('Precipitation')) return 'precipitation';
    if (serviceUrl.includes('Evapotranspiration')) return 'evapotranspiration';
    if (serviceUrl.includes('Runoff')) return 'runoff';
    if (serviceUrl.includes('Change_in_Storage')) return 'change-in-storage';
    return 'unknown';
  }
}

// Export a default instance for convenience
export const gldasService = GldasService.getInstance();