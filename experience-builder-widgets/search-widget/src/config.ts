import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  // Search configuration
  placeholder?: string;
  maxResults?: number;
  maxSuggestions?: number;
  minSuggestCharacters?: number;
  
  // Integration configuration
  triggerMapClick?: boolean;
  zoomLevel?: number;
  
  // Sources configuration
  includeDefaultSources?: boolean;
  locationEnabled?: boolean;
  
  // UI configuration
  showTitle?: boolean;
  showInstructions?: boolean;
  widgetTitle?: string;
  widgetSubtitle?: string;
  
  // Messaging configuration
  publishSearchResults?: boolean;
  outputDataName?: string;
}

export type IMConfig = ImmutableObject<Config>;