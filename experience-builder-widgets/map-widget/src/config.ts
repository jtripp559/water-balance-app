import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  // Map configuration
  webMapId?: string;
  
  // Query configuration
  enableClickToQuery?: boolean;
  showQueryResults?: boolean;
  queryResultsPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  // Data source configuration
  useCustomGldasEndpoint?: boolean;
  customGldasEndpoint?: string;
  
  // Styling configuration
  queryLocationSymbolColor?: string;
  queryLocationSymbolSize?: number;
  infoPanelBackground?: string;
  
  // Messaging configuration
  publishQueryResults?: boolean;
  outputDataName?: string;
}

export type IMConfig = ImmutableObject<Config>;