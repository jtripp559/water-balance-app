import * as React from 'react';

import { GldasLayerName } from '../../types';
import {
    UIConfig
} from '../../AppConfig';

interface MenuItemData {
    value: GldasLayerName;
};

const Data: MenuItemData[] = [
    {
        value: 'Soil Moisture'
    },
    {
        value: 'Snowpack'
    },
    {
        value: 'Precipitation'
    },
    {
        value: 'Evapotranspiration'
    },
    {
        value: 'Runoff'
    },
    {
        value: 'Change in Storage'
    }
];

interface Props {
    activeLayer: GldasLayerName;
    onChange?: (val:GldasLayerName)=>void;
};

const LayerSwitcher:React.FC<Props> = ({
    activeLayer,
    onChange
})=>{

    const calciteSelectRef = React.useRef<any>()

    React.useEffect(()=>{
        calciteSelectRef.current.addEventListener('calciteSelectChange', (evt:any)=>{
            onChange(evt.target.value)
        })
    }, [])

    return (
        <div
            style={{
                position: 'absolute',
                top: '65px',
                left: '60px',
                width: '198px',
                zIndex: 5
            }}
        >
            <calcite-select
                ref={calciteSelectRef}
                scale="s"
                style={{
                    '--calcite-color-background': UIConfig['theme-color-dark-blue'],
                    '--calcite-color-text-1': '#fff',
                    '--calcite-color-border-1': UIConfig['theme-color-dark-blue']
                } as any}
            >
                {
                    Data.map(d=>{
                        return (
                            <calcite-option 
                                key={d.value} 
                                value={d.value}
                                selected={d.value === activeLayer}
                            >
                                {d.value}
                            </calcite-option>
                        )
                    })
                }
            </calcite-select>
        </div>
    );
};

export default LayerSwitcher;