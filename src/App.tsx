import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useRoutes } from 'react-router-dom';

// project import
import ThemeCustomization from './themes';
import ScrollTop from './components/common/ScrollTop';
import { NotificationProvider } from './services/notifications/NotificationProvider';
import { NotificationContainer } from './services/notifications/NotificationContainer';
import { LoadingProvider } from './services/loading/LoadingProvider';

import './App.css';
import { useAuthRoutes } from './hooks/useAuthRoutes';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './config';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
	return (
		<ThemeCustomization>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<MsalProvider instance={msalInstance}>
					<LoadingProvider>
						<NotificationProvider>
							<ScrollTop>
								<Routes />
							</ScrollTop>
							<NotificationContainer />
						</NotificationProvider>
					</LoadingProvider>
				</MsalProvider>
			</LocalizationProvider>
		</ThemeCustomization>
	);
};

const Routes = () => {
	const r = useAuthRoutes();
	return useRoutes(r);
};

export default App;
