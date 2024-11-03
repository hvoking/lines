// Context imports
import { useSatelliteApi } from '../../../context/api/satellite';

// Third-party imports
import { Source, Layer, LayerProps } from 'react-map-gl';
import * as turf from '@turf/turf'

export const Line = () => {
    const { satelliteData } = useSatelliteApi();

    if (satelliteData.length < 2) return;

    const marksLayer: LayerProps = {
        id: 'line-layer',
        type: 'line',
        source: 'line-footprint',
        paint: {
            'line-color': 'rgba(255, 255, 0, 1)', // Change color to see if it renders
            'line-width': 10, // Use a smaller width
        },
    };

    const coordinates = satelliteData.map((geometry: any) => geometry);

    const geojson = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates,
                },
            },
        ],
    };

    return (
        <Source id="line-footprint" type="geojson" data={geojson}>
            <Layer {...marksLayer} />
        </Source>
    );
};

Line.displayName = "Line";