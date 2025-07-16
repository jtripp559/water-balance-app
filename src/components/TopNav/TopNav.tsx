import * as React from 'react';

import {
    UIConfig
} from '../../AppConfig';

interface Props {
    infoIconOnClick: ()=>void;
}

const TopNav:React.FC<Props> = ({
    infoIconOnClick
})=>{
    return (
        <calcite-shell-panel 
            slot="header" 
            position="start"
            style={{
                '--calcite-color-background': UIConfig["theme-color-dark-blue"],
                '--calcite-color-text-1': '#fff',
                height: `${UIConfig["top-nav-height"]}px`,
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem 1rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                zIndex: 5
            } as any}
        >
            <calcite-text scale="l" style={{ color: '#fff', marginRight: '0.75rem', paddingRight: '0.75rem', borderRight: '1px solid rgba(255,255,255,.75)' }}>
                Water Balance App
            </calcite-text>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <calcite-text scale="s" style={{ color: '#fff', display: window.innerWidth > 768 ? 'block' : 'none' }}>
                    Click anywhere on earth to see how the water balance is changing over time
                </calcite-text>

                <calcite-button 
                    appearance="transparent" 
                    icon-start="information" 
                    scale="s"
                    onClick={infoIconOnClick}
                    style={{ '--calcite-color-text-1': '#fff' } as any}
                />
            </div>
        </calcite-shell-panel>
    );
};

export default TopNav;