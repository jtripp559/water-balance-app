import * as React from 'react';

import {
    UIConfig
} from '../../AppConfig';

interface Props {
    isLoading?: boolean;
    isMobile?: boolean;
    children: React.ReactNode;
}

const BottomPanel:React.FC<Props> = ({
    isLoading,
    isMobile,
    children
})=>{

    const getLoader = ()=>{
        return (
            <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}>
                <calcite-loader label="loading" />
            </div>
        );
    }

    const getContent = ()=>{
        return isLoading 
            ? getLoader()
            : children;
    }

    return (
        <calcite-panel
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: `${UIConfig["bottom-panel-height"]}px`,
                boxShadow: '0 -5px 5px -5px rgba(0,0,0,.4)',
                '--calcite-color-background': UIConfig["theme-color-light-blue"],
                display: 'flex',
                padding: '0.75rem'
            } as any}
        >
            { getContent() }
        </calcite-panel>
    );
};

export default BottomPanel;