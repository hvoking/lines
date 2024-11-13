// React imports
import { useState, useEffect, useContext, createContext } from 'react';

// Context imports
import { useMapbox } from '../../mapbox';

const SatelliteApiContext: React.Context<any> = createContext(null)

export const useSatelliteApi = () => {
	return (useContext(SatelliteApiContext))
}

const normalizeLongitude = (longitude: any) => {
    return ((longitude + 180) % 360 + 360) % 360 - 180;
};


export const SatelliteApiProvider = ({children}: any) => {
	const { mapRef } = useMapbox();
	const [ satelliteData, setSatelliteData ] = useState<any>([]);

	const updateAnimatedPath = (newPositions: any, satelliteId: any, color: any) => {
		const mapCurrent = mapRef.current;
		if (!mapCurrent) return;

		const map = mapCurrent.getMap();

	    // Normalize and add the new position to the path
	    const latestPosition = newPositions[newPositions.length - 1];
	    const { satlatitude, satlongitude } = latestPosition;
	    const currentPoint = [ normalizeLongitude(satlongitude), satlatitude ];
	    setSatelliteData((prevPaths: any) => [...prevPaths, currentPoint]);
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
		<SatelliteApiContext.Provider value={{ satelliteData }}>
			{children}
		</SatelliteApiContext.Provider>
	)
}

SatelliteApiContext.displayName = "SatelliteApiContext";