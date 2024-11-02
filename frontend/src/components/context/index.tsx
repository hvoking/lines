// Context imports
import { MapboxProvider } from './mapbox';
import { ApiProvider } from './api';

export const MainProvider = ({ children }: any) => {
	return (
    	<MapboxProvider>
    	<ApiProvider>
			{children}
		</ApiProvider>
		</MapboxProvider>
	)
}

MainProvider.displayName="MainProvider";