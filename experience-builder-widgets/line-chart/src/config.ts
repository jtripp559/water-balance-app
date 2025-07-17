import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  // Data source configuration
  useCustomDataSource?: boolean;
  customApiEndpoint?: string;
  
  // Chart configuration
  chartTitle?: string;
  chartSubtitle?: string;
  defaultSelectedSeries?: string[];
  showControls?: boolean;
  
  // Styling configuration
  lineColors?: {[key: string]: string};
  chartWidth?: number;
  chartHeight?: number;
  showDataPoints?: boolean;
  curveType?: 'linear' | 'monotone' | 'step';
  
  // Location configuration (for data fetching)
  defaultLatitude?: number;
  defaultLongitude?: number;
  
  // Time range configuration
  timeRangeStart?: string;
  timeRangeEnd?: string;
}

export type IMConfig = ImmutableObject<Config>;