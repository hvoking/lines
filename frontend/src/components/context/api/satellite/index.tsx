// React imports
import { useState, useEffect, useContext, createContext } from 'react';

// Context imports
import { useMapbox } from '../../mapbox';

const SatelliteApiContext: React.Context<any> = createContext(null)

export const useSatelliteApi = () => {
	return (useContext(SatelliteApiContext))
}

export const SatelliteApiProvider = ({children}: any) => {
	const { mapRef } = useMapbox();
	const [ satellitePaths, setSatellitePaths ] = useState<any>([]);

	const normalizeLongitude = (longitude: any) => {
	    return ((longitude + 180) % 360 + 360) % 360 - 180;
	};

	const splitPolyline = (coordinates: any) => {
	    const segments = [];
	    let currentSegment: any = [];

	    coordinates.forEach(([lon, lat]: any) => {
	        if (currentSegment.length === 0) {
	            currentSegment.push([lon, lat]);
	        } else {
	            const lastLon = currentSegment[currentSegment.length - 1][0];
	            if (Math.abs(lon - lastLon) > 180) {
	                segments.push(currentSegment);
	                currentSegment = [[ lon, lat ]];
	            } else {
	                currentSegment.push([ lon, lat ]);
	            }
	        }
	    });

	    if (currentSegment.length > 0) {
	        segments.push(currentSegment);
	    }

	    return segments;
	};

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

	const destination_lat = 40.4207;
    const destination_lon = -3.7070;
    const sat_id = 39084;
    const total_future_time = 5940

	const fetchAndUpdateData = () => {
		const url = `
		    ${process.env.REACT_APP_API_URL}/
		    sats_api
		    ?sat_id=${sat_id}
		    &destination_lat=${destination_lat}
		    &destination_lon=${destination_lon}
		    &total_future_time=${total_future_time}
		`.replace(/\s/g, '');
	    
	    fetch(url)
	        .then(response => response.json())
	        .then(data => {
	            if (!data.error) {
	                const positions1 = data.positions;

	                // Update paths for both satellites
	                if (positions1.length > 0) {
	                    updateAnimatedPath(positions1, 'satellite1', '#FF0000');
	                }
	            } else {
	                console.error(data.error);
	            }
	        })
	        .catch(error => console.error('Error fetching satellite positions:', error));
	};

	// Start updating data periodically
	fetchAndUpdateData();
	setInterval(fetchAndUpdateData, 15300);

	return (
		<SatelliteApiContext.Provider value={{ fetchAndUpdateData }}>
			{children}
		</SatelliteApiContext.Provider>
	)
}

SatelliteApiContext.displayName = "SatelliteApiContext";