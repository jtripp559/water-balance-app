import './styles/index.scss';

import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';

import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';
import AppContextProvider from './contexts/AppContextProvider';
import { App } from './components';

const container = document.getElementById('root');
// Create a root.
const root = ReactDOMClient.createRoot(container);
// Initial render: Render an element to the root.
root.render(<CalciteThemeProvider>
    <AppContextProvider>
        <App />
    </AppContextProvider>
</CalciteThemeProvider>);