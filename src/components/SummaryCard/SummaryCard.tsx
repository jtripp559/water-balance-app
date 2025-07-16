import * as React from 'react';
import { format } from 'date-fns';

import {
    GldasIdentifyTaskResults,
    GldasIdentifyTaskResultsByMonth
} from '../../services/GLDAS/GLDAS';

import {
    TimeExtentItem
} from '../App/App';
import { UIConfig } from '../../AppConfig';

import {
    average
} from '../../utils';

interface Props {
    data: GldasIdentifyTaskResults;
    gldasDataByMonth: GldasIdentifyTaskResultsByMonth;
    timeExtentItem: TimeExtentItem;
}

const SummaryCard:React.FC<Props> = ({
    data,
    gldasDataByMonth,
    timeExtentItem,
})=>{

    const saveDataAsCsv = ()=>{

        const keys = Object.keys(data);
        const headers = ['Time', ...keys.map(key=>key + ' (mm)')];
        const allDates = data.Precipitation.map(d=>d.date);

        let str = "data:text/csv;charset=utf-8,";

        // set csv headers
        str += headers.join(',');
        str += '\r\n';

        for(let i = 0, len = allDates.length; i < len; i++){

            const gldasValues = keys.map((key)=>{
                const d = data as any
                return d[key][i].value
            })

            const rowStr = [
                format(allDates[i], 'MM/dd/u'),
                ...gldasValues
            ].join(',');

            str += rowStr + '\r\n';
        }

        const link = document.createElement('a');
        link.download = 'water-balance-data.csv';
        link.href = encodeURI(str);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTitle = ()=>{
        const { date } = timeExtentItem;
        return (
            <calcite-text scale="l" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                { format(date, UIConfig["active-date-format-pattern"])}
            </calcite-text>
        );
    };

    const getTable = ()=>{
        const { index } = timeExtentItem;

        const tableData = [
            { label: 'Precipitation', value: data.Precipitation[index].value, color: UIConfig["precipitation-color"] },
            { label: 'Runoff', value: data.Runoff[index].value, color: UIConfig["water-flux-line-color"] },
            { label: 'Evapotranspiration', value: data.Evapotranspiration[index].value, color: UIConfig["water-flux-line-color"] },
            { label: 'Soil Moisture', value: data["Soil Moisture"][index].value, color: UIConfig["soil-moisture-color"] },
            { label: 'Snowpack', value: data.Snowpack[index].value, color: '#fafafa' }
        ];

        return (
            <div style={{ fontSize: '0.875rem' }}>
                {tableData.map((item, index) => (
                    <div key={index} style={{ 
                        borderBottom: '1px solid rgba(255,255,255,.5)',
                        padding: '0.05rem 0',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <calcite-text scale="s">{item.label}</calcite-text>
                        <calcite-text scale="s" style={{ fontWeight: 600, color: item.color }}>
                            {item.value} mm
                        </calcite-text>
                    </div>
                ))}
            </div>
        );
    };

    const getDescription = ()=>{
        const { index, date } = timeExtentItem;
        const monthIndex = date.getMonth();
        const changeInStorageVal = data["Change in Storage"][index].value;
        
        const soilMoistureValue = data["Soil Moisture"][index].value;
        const soilMoisture4SelectedMonth  = gldasDataByMonth["Soil Moisture"][monthIndex].map(d=>d.value);
        const avgSoilMoisture4SelectedMonth = average(soilMoisture4SelectedMonth);
        const pctDiffSoilMoistureFromAve = ((soilMoistureValue - avgSoilMoisture4SelectedMonth) / avgSoilMoisture4SelectedMonth * 100);
        const pctDiffRounded = +Math.abs(pctDiffSoilMoistureFromAve).toFixed(0);
        const compare2Avg = pctDiffRounded === 0 
            ? 'about the average'
            : `${pctDiffRounded}% ${pctDiffSoilMoistureFromAve >= 0 ? 'above' : 'below'} average`;

        return (
            <calcite-text scale="s" style={{ margin: '0.5rem 0' }}>
                <span style={{ 
                    fontWeight: 'bold',
                    color: changeInStorageVal >= 0 ? UIConfig["precipitation-color"] : UIConfig["water-flux-line-color"]
                }}>
                    {changeInStorageVal} mm
                </span> of water was {changeInStorageVal >= 0 ? 'recharged into' : 'depleted from'} storage this month. Total soil moisture is{' '}
                <span style={{
                    fontWeight: 'bold',
                    color: pctDiffSoilMoistureFromAve >= 0 ? UIConfig["precipitation-color"] : UIConfig["water-flux-line-color"]
                }}>
                    {compare2Avg}
                </span> for {format(date, 'MMMM')}.
            </calcite-text>
        );
    };

    const getDownloadLink = ()=>{
        return (
            <calcite-text scale="s" style={{ margin: 0 }}>
                <calcite-button 
                    appearance="transparent"
                    scale="s"
                    onClick={saveDataAsCsv}
                    style={{ padding: 0, '--calcite-color-text-1': '#0079c1' } as any}
                >
                    Download
                </calcite-button> water balance data as CSV
            </calcite-text>
        );
    };

    return data && gldasDataByMonth && timeExtentItem ? (
        <calcite-card style={{ width: '230px', flexGrow: 0, flexShrink: 0, marginRight: '10px' }}>
            { getTitle() }
            { getTable() }
            { getDescription() }
            { getDownloadLink() }
        </calcite-card>
    ) : null;
};

export default SummaryCard;