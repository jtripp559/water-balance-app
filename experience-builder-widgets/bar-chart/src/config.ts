import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  // Data source configuration
  useCustomDataSource?: boolean;
  customApiEndpoint?: string;
  
  // Chart configuration
  chartTitle?: string;
  chartSubtitle?: string;
  defaultDataType?: 'Precipitation' | 'Evapotranspiration' | 'Runoff';
  showControls?: boolean;
  
  // Styling configuration
  precipitationColor?: string;
  evapotranspirationColor?: string;
  runoffColor?: string;
  chartWidth?: number;
  chartHeight?: number;
  
  // Location configuration (for data fetching)
  defaultLatitude?: number;
  defaultLongitude?: number;
  
  // Time range configuration
  timeRangeStart?: string;
  timeRangeEnd?: string;
}

export type IMConfig = ImmutableObject<Config>;