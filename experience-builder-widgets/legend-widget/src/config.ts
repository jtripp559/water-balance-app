import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  // Legend configuration
  legendStyle?: 'classic' | 'card';
  respectLayerVisibility?: boolean;
  hideLayersNotInCurrentView?: boolean;
  
  // UI configuration
  showTitle?: boolean;
  showInstructions?: boolean;
  widgetTitle?: string;
  widgetSubtitle?: string;
  
  // Display configuration
  maxHeight?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export type IMConfig = ImmutableObject<Config>;