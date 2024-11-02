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
	const [ satellitePaths, setSatellitePaths ] = useState<any>({ "satellite1": [], "satellite2": []	});

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

	    setSatellitePaths((prevPaths: any) => {
			const updatedPaths = { ...prevPaths };
			updatedPaths[satelliteId] = [
				...updatedPaths[satelliteId],
				[normalizeLongitude(satlongitude), satlatitude]
			];
			return updatedPaths;
		});

	    // Split the path to handle 180-degree crossing
	    const segments = splitPolyline(satellitePaths[satelliteId]);
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

	const fetchAndUpdateData = () => {
	    fetch('http://localhost:5000/get_satellite_positions')
	        .then(response => response.json())
	        .then(data => {
	            if (!data.error) {
	                const positions1 = data.satellite1;
	                const positions2 = data.satellite2;

	                // Update paths for both satellites
	                if (positions1.length > 0) {
	                    updateAnimatedPath(positions1, 'satellite1', '#FF0000');
	                }
	                if (positions2.length > 0) {
	                    updateAnimatedPath(positions2, 'satellite2', '#0000FF');
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