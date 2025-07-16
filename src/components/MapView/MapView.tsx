import * as React from 'react';
import IPoint from '@arcgis/core/geometry/Point';

import {
    MapConfig,
    UIConfig
} from '../../AppConfig';

interface Props {
    paddingBottom: number;
    onClickHandler?: (mapPoint:IPoint)=>void;
    children?: React.ReactNode;
};

const MapView:React.FC<Props> = ({
    paddingBottom,
    onClickHandler,
    children
}: Props)=>{

    const arcgisMapRef = React.useRef<any>();
    const [mapView, setMapView] = React.useState<any>(null);

    React.useEffect(() => {
        const mapComponent = arcgisMapRef.current;
        
        if (mapComponent) {
            mapComponent.addEventListener('arcgisViewReadyChange', (event: any) => {
                if (event.detail) {
                    const view = mapComponent.view;
                    setMapView(view);
                    
                    // Add click handler
                    if (onClickHandler) {
                        view.on('click', (event: any) => {
                            onClickHandler(event.mapPoint);
                        });
                    }
                }
            });
        }
    }, [onClickHandler]);

    return (
        <>
            <arcgis-map
                ref={arcgisMapRef}
                item-id={MapConfig["web-map-id"]}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: paddingBottom || 0,
                    width: '100%',
                    paddingTop: `${UIConfig["top-nav-height"]}px`
                }}
            >
                <arcgis-search 
                    position="top-right"
                    popup-enabled="false"
                    result-graphic-enabled="false"
                />
            </arcgis-map>
            
            { 
                React.Children.map(children, (child)=>{
                    return React.cloneElement(child as React.ReactElement<any>, {
                        mapView,
                    });
                }) 
            }
        </>
    );
};

export default MapView;