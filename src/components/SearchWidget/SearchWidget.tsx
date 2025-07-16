import * as React from 'react';
import IPoint from '@arcgis/core/geometry/Point';

interface Props {
    onSelect: (location:IPoint)=>void;
    mapView?: any
}

const SearchWidget:React.FC<Props> = ({
    onSelect,
    mapView = null
}: Props)=>{

    React.useEffect(()=>{
        if(mapView){
            // Find the search widget in the map view
            const searchWidget = mapView.ui.find((component: any) => {
                return component.label === 'Search' || component.declaredClass === 'esri.widgets.Search';
            });

            if (searchWidget) {
                searchWidget.on('search-complete', (evt: any) => {
                    const geometry = evt?.results[0]?.results[0]?.feature?.geometry as IPoint;
                    if (geometry) {
                        onSelect(geometry);
                    }
                });
            }
        }
    }, [ mapView, onSelect ])

    return null;
};

export default SearchWidget;