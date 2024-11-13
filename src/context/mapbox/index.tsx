// React imports
import { useState, useRef, useContext, createContext } from 'react';

// App imports
import * as Locations from './locations';

const MapboxContext: React.Context<any> = createContext(null);

export const useMapbox = () => {
	return (
		useContext(MapboxContext)
	)
}
// Alternative style
// "mapbox://styles/hvoking/cm1h7n1kp01ed01pd24g689ob"

export const MapboxProvider = ({children}: any) => {
	const mapRef = useRef<any>();
	const [ basemap, setBasemap ] = useState("mapbox://styles/mapbox/dark-v11");
	const [ viewport, setViewport ] = useState(Locations.initialViewState);

	return (
		<MapboxContext.Provider value={{
			mapRef,
			basemap, setBasemap,
			viewport, setViewport,
		}}>
			{children}
		</MapboxContext.Provider>
	)
}

MapboxContext.displayName = "MapboxContext";