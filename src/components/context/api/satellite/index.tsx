// React imports
import { useState, useEffect, useContext, createContext } from 'react';

// App imports
import { normalizeLongitude, splitPolyline } from './utils';

// Context imports
import { useMapbox } from '../../mapbox';

const SatelliteApiContext: React.Context<any> = createContext(null)

export const useSatelliteApi = () => {
	return (useContext(SatelliteApiContext))
}

export const SatelliteApiProvider = ({children}: any) => {
	const { mapRef } = useMapbox();
	const [ satellitePaths, setSatellitePaths ] = useState<any>([]);
	const [ currentPosition, setCurrentPosition ] = useState<any>(null);

	const updateAnimatedPath = (newPositions: any, satelliteId: any, color: any) => {
		const mapCurrent = mapRef.current;
		if (!mapCurrent) return;

		const map = mapCurrent.getMap();

	    // Normalize and add the new position to the path
	    const latestPosition = newPositions[newPositions.length - 1];
	    const { satlatitude, satlongitude } = latestPosition;
	    const currentPoint = [ normalizeLongitude(satlongitude), satlatitude ];
	    setSatellitePaths((prevPaths: any) => [...prevPaths, currentPoint]);

	    // Split the path to handle 180-degree crossing
	    const segments = splitPolyline(satellitePaths);

	    const lineFeatures = segments.map((segment: any) => ({
	        'type': 'Feature',
	        'geometry': {
	            'type': 'LineString',
	            'coordinates': segment
	        }
	    }));

	    // Create the point feature for the latest position
	    const pointFeature = {
	        'type': 'Feature',
	        'geometry': {
	            'type': 'Point',
	            'coordinates': [ satlongitude, satlatitude ]
	        },
	        'properties': {
	            'color': color
	        }
	    };

	    // If the source does not exist, create it
	    if (!map.getSource(satelliteId)) {
	        map.addSource(satelliteId, {
	            'type': 'geojson',
	            'data': {
	                'type': 'FeatureCollection',
	                'features': []
	            }
	        });

	        // Add a line layer for the path
	        map.addLayer({
	            'id': satelliteId + '-line-layer',
	            'type': 'line',
	            'source': satelliteId,
	            'paint': {
	                'line-color': color,
	                'line-width': 2
	            }
	        });

	        // Add a small circle layer for the latest position
	        map.addLayer({
	            'id': satelliteId + '-point-layer',
	            'type': 'circle',
	            'source': satelliteId,
	            'filter': ['==', '$type', 'Point'],
	            'paint': {
	                'circle-color': color,
	                'circle-radius': 4,
	                'circle-stroke-width': 1,
	                'circle-stroke-color': '#ffffff'
	            }
	        });
	    }

	    // Update the source data to include the latest path and point
	    map.getSource(satelliteId).setData({
	        'type': 'FeatureCollection',
	        'features': [...lineFeatures, pointFeature]
	    });
	};

	const sat_id = 39084;
	const destination_lat = 40.4207;
    const destination_lon = -3.7070;
    const total_future_time = 5940

	const fetchAndUpdateData = async () => {
		const url = `
		    ${process.env.REACT_APP_API_URL}/
		    sats_api
		    ?sat_id=${sat_id}
		    &destination_lat=${destination_lat}
		    &destination_lon=${destination_lon}
		    &total_future_time=${total_future_time}
		`.replace(/\s/g, '');
	    
	    const res = await fetch(url);
	    const receivedData = await res.json();
	    updateAnimatedPath(receivedData.positions, 'satellite1', '#FF0000');
	};

	useEffect(() => {
        fetchAndUpdateData();
        const intervalId = setInterval(fetchAndUpdateData, 15000);
        return () => clearInterval(intervalId);
    }, []);

	return (
		<SatelliteApiContext.Provider value={{ fetchAndUpdateData }}>
			{children}
		</SatelliteApiContext.Provider>
	)
}

SatelliteApiContext.displayName = "SatelliteApiContext";