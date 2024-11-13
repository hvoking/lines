// App imports
import { Maps } from 'components/maps';
import { Wrapper } from 'components/wrapper';
import './styles.scss';

// Context imports
import { MainProvider } from 'context';

export const Main = () => (
  <MainProvider>
    <Wrapper>
        <Maps/>
    </Wrapper>
  </MainProvider>
)

Main.displayName="Main";