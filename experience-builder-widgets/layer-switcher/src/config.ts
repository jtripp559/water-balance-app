import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  // UI configuration
  showTitle?: boolean;
  widgetTitle?: string;
  widgetSubtitle?: string;
  
  // Layer configuration
  defaultSelectedLayer?: string;
  groupByCategory?: boolean;
  showLayerDescriptions?: boolean;
  
  // Display configuration
  showVisibilityToggles?: boolean;
  showInstructions?: boolean;
  compactMode?: boolean;
  
  // Messaging configuration
  publishLayerSelection?: boolean;
  publishVisibilityChanges?: boolean;
  outputDataName?: string;
}

export type IMConfig = ImmutableObject<Config>;