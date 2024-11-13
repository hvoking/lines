// App imports
import { Logo } from './logo';
import './styles.scss';

export const Header = () => {
	return (
		<div className="wrapper-header">
			<Logo/>
		</div>
	)
}

Header.displayName="Header"