import axios from 'axios';

import { GldasLayersInfo, GldasLayersInfoDEV } from './config';
import { GldasLayerName } from '../../types';

import IPoint from 'esri/geometry/Point';

export interface GldasIdentifyTaskResultItem {
    date: Date;
    value: number;
};

export type GldasIdentifyTaskResults = {
    [key in GldasLayerName]?: GldasIdentifyTaskResultItem[]
};

export type GldasIdentifyTaskResultsByMonth = {
    [key in GldasLayerName]?: GldasIdentifyTaskResultItem[][]
};

const GldasLayerNames = Object.keys(GldasLayersInfo) as GldasLayerName[];

let timeExtentForGldasLayers:Date[] = [];

/* const LayersInfo = location.host === 'livingatlasdev.arcgis.com' 
    ? GldasLayersInfoDEV 
    : GldasLayersInfo; */
const LayersInfo = location.host === 'livingatlas.arcgis.com' 
    ? GldasLayersInfoDEV 
    : GldasLayersInfo;

export const getTimeExtent = async(): Promise<Date[]>=>{
    console.log('getTimeExtent');
    const url = LayersInfo['Snowpack'].url + '/multiDimensionalInfo?f=json';
    console.log('url:',url);

    try {
        const response = await axios.get(url);

        const values: number[] = (
            response.data && 
            response.data.multidimensionalInfo && 
            response.data.multidimensionalInfo.variables && 
            response.data.multidimensionalInfo.variables[0] && 
            response.data.multidimensionalInfo.variables[0].dimensions && 
            response.data.multidimensionalInfo.variables[0].dimensions[0] && 
            response.data.multidimensionalInfo.variables[0].dimensions[0].values
        ) 
        ? response.data.multidimensionalInfo.variables[0].dimensions[0].values
        : [];

        timeExtentForGldasLayers = values.map((d:number)=>{
            return new Date(d);
        });

        return timeExtentForGldasLayers;

    } catch(err){
        console.log('failed to queryMultiDimensionalInfo', err);
        console.error('failed to queryMultiDimensionalInfo', err);
    }

    return [];
};

export const getGLDASdata = async(queryLocation: IPoint):Promise<{
    identifyResults: GldasIdentifyTaskResults,
    identifyResultsByMonth: GldasIdentifyTaskResultsByMonth
}>=>{
    console.log('entering getGLDASdata');

    if(!timeExtentForGldasLayers || !timeExtentForGldasLayers.length){
        console.log('await getTimeExtent');
        await getTimeExtent();
    }

    // {x:-80.6686631822437,y:40.195471618674176,spatialReference:{wkid:4326}}

    

    const params = {
        geometry: '{x:' + queryLocation.longitude + ',y:' + queryLocation.latitude+'}',
        returnGeometry: 'false',
        returnCatalogItems: 'true',
        renderingRule: {"rasterFunction":"None"},
        geometryType: 'esriGeometryPoint',
        f: 'json'
    };

/*    const params = {
        geometry: {
            x: queryLocation.longitude,
            y: queryLocation.latitude,
            spatialReference: {
                wkid: 4326
            }
        }, //{"x":-9755306.160227587,"y":4549146.018149606,"spatialReference":{"wkid":102100}},
        returnGeometry: 'false',
        returnCatalogItems: 'true',
        renderingRule: {"rasterFunction":"None"},
        geometryType: 'esriGeometryPoint',
        f: 'json'
    }; */
    console.log('params:',params);

    const identifyTasks = GldasLayerNames.map(layerName=>{

        const layerInfo = LayersInfo[layerName];
        console.log('layerName',layerName);
        console.log('layerInfo',layerInfo);
        console.log('layerInfo.url',layerInfo.url);
        console.log('layerInfo.mosaicRule',layerInfo.mosaicRule);

/*        return axios.get(layerInfo.url + '/identify', { 
            params: {
                ...params,
                mosaicRule: layerInfo.mosaicRule
            }
        }); */

        // const fullUrl = layerInfo.url + '/identify' + '?geometry={x:' + queryLocation.longitude + ',y:' + queryLocation.latitude + ',spatialReference:{wkid:4326}}&returnGeometry=false&returnCatalogItems=true&renderingRule={rasterFunction:None}&geometryType=esriGeometryPoint&f=json&mosaicRule={where:%22tag+=+%27Composite%27%22,ascending:false,multidimensionalDefinition:[{variableName:%22Total+Soil+Moisture+0+to+200cm+(mm)%22}]}';

        const fullUrl = layerInfo.url + '/identify' + '?geometry={x:' + queryLocation.longitude + ',y:' + queryLocation.latitude + ',spatialReference:{wkid:4326}}&returnGeometry=false&returnCatalogItems=true&renderingRule={rasterFunction:None}&geometryType=esriGeometryPoint&f=json&' + layerInfo.mosaicRuleExplicit;
        console.log('fullUrl',fullUrl);

        return axios.get(fullUrl);

/*        return axios.get(fullUrl, { 
            params: {
                mosaicRule: layerInfo.mosaicRule
            }
        }); */

    });

    return new Promise((resolve, reject)=>{

        Promise.all(identifyTasks)
        .then((responses)=>{
            console.log('responses:');
            console.log(responses);
            if(responses[0].data && responses[0].data.value === 'NoData'){
                console.log('failed to fetch GLDAS data');
                reject({
                    error: 'failed to fetch GLDAS data'
                });
            }
            
            const identifyResults:GldasIdentifyTaskResults = {}

            console.log('GldasLayerNames:', GldasLayerNames);
            for ( let i = 0, len = responses.length; i < len; i++){
                
                const layerName = GldasLayerNames[i];
                console.log('layerName:',layerName);

                const response = responses[i];
                console.log('response:',response);
                
                console.log('response.data:',response.data);
                console.log('response.data.properties:',response.data.properties);
                console.log('response.data.properties.Values:',response.data.properties.Values);
                console.log('response.data.properties.Values.length:',response.data.properties.Values.length);

                const originalValues:string[]= (
                    response.data &&
                    response.data.properties && 
                    response.data.properties.Values && 
                    response.data.properties.Values.length
                ) 
                ? response.data.properties.Values 
                : null;
                console.log('originalValues:',originalValues);
                console.log('call processGldasResult');
                identifyResults[layerName] = processGldasResult(originalValues);
            }

            const identifyResultsByMonth = groupGldasDataByMonth(identifyResults);
            console.log('identifyResultsByMonth:',identifyResultsByMonth);

            resolve({
                identifyResults,
                identifyResultsByMonth
            });

        })
        .catch(error => { 
            console.log(error.message);
            reject(error.message)
        });
    });
};

const processGldasResult = (values:string[]): GldasIdentifyTaskResultItem[]=>{
    
    let flattedValues:number[] = [];
    
    console.log('values.forEach');
    console.log('values:',values);

    values.forEach(d=>{
        const listOfValues = d.split(' ').map(d=>+d);

        flattedValues = flattedValues.concat(listOfValues);
    });

    console.log('flattedValues:',flattedValues)
    return flattedValues.map((value, index)=>{

        const date = timeExtentForGldasLayers[index];

        const dataItem:GldasIdentifyTaskResultItem = {
            date,
            value
        };

        return dataItem
    });
};

const groupGldasDataByMonth = (data:GldasIdentifyTaskResults)=>{

    const results:GldasIdentifyTaskResultsByMonth = {};

    for(let i = 0, len = timeExtentForGldasLayers.length; i < len ; i++){

        const monthIndex = timeExtentForGldasLayers[i].getMonth();

        console.log('GldasLayerNames.forEach');
        GldasLayerNames.forEach(layerName=>{
            const value = data[layerName][i];

            if(!results[layerName]){
                results[layerName] = [];
            }

            if(!results[layerName][monthIndex]){
                results[layerName][monthIndex] = [];
            }

            results[layerName][monthIndex].push(value);
        })

    };

    return results;
}