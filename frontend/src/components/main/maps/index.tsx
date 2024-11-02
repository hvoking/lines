// Context imports
import { useMapbox } from '../../context/mapbox';

// Third-party imports
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const Maps = () => {
  const { mapRef, basemap, viewport } = useMapbox();

  return (
    <Map
      ref={mapRef}
      mapStyle={basemap}
      initialViewState={viewport} 
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
    >
    </Map>
  );
}

Maps.displayName="Maps";