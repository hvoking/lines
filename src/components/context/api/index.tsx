// App imports
import { SatelliteApiProvider } from './satellite';

export const ApiProvider = ({children}: any) => {
  return (
    <SatelliteApiProvider>
      {children}
    </SatelliteApiProvider>
  )
}

ApiProvider.displayName="ApiProvider";