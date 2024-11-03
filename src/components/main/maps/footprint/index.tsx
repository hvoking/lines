// Context imports
import { useSatelliteApi } from '../../../context/api/satellite';

// Third-party imports
import { Source, Layer, LayerProps } from 'react-map-gl';
import * as turf from '@turf/turf'

export const Footprint = () => {
    const { satelliteData } = useSatelliteApi();

    const marksLayer: LayerProps = {
        id: 'footprint-layer',
        type: 'fill',
        source: 'footprint',
        paint: {
            'fill-color': 'rgb(255, 0, 0)',
            'fill-opacity': 1,
        },
    };

    const geojson = {
        type: 'FeatureCollection',
        features: satelliteData.map((geometry: any) => turf.circle(geometry, 5))
    };

    return (
        <Source id="footprint" type="geojson" data={geojson}>
            <Layer {...marksLayer} />
        </Source>
    );
};

Footprint.displayName = "Footprint";