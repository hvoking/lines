// App imports
import { Maps } from './maps';
import { Wrapper } from './wrapper';
import './styles.scss';

// Context imports
import { MainProvider } from '../context';

export const Main = () => (
  <MainProvider>
    <Wrapper>
        <Maps/>
    </Wrapper>
  </MainProvider>
)

Main.displayName="Main";