import * as React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { GldasLayerName } from '../../types';
import { TimeExtentItem } from '../App/App';

export const HeaderHeight = 25;

const HeaderDiv = styled.div`
    height: ${HeaderHeight + 'px'};
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
`;

interface Props {
    activeLayer: GldasLayerName;
    timeExtentItem: TimeExtentItem;
};


const Header:React.FC<Props> = ({
    activeLayer,
    timeExtentItem
})=>{

    const getMonthName = ()=>{
        if(!timeExtentItem){
            return null;
        }

        return (
            <div>{format(timeExtentItem.date, 'MMMM')}</div>
        );
    }

    return (
        <HeaderDiv>
            <calcite-text scale="s">
                <span style={{ marginRight: '0.5rem' }}>Trend Analyzer for <span style={{ fontWeight: 'bold' }}>{activeLayer}</span></span>
            </calcite-text>

            { getMonthName() }
        </HeaderDiv>
    )
};

export default Header;