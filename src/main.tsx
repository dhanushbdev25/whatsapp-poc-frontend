import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './config';

// Redux
import { Provider as ReduxProvider } from 'react-redux';

// Project files
import App from './App';
import { store } from './store/store';
import { performanceMonitor } from './services/performance/performance.service';
import { env } from './config/env';

// Initialize performance monitoring
if (env.VITE_ENABLE_PERFORMANCE_MONITORING) {
	performanceMonitor.mark('app-start');
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
	<React.StrictMode>
		<MsalProvider instance={msalInstance}>
			<ReduxProvider store={store}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ReduxProvider>
		</MsalProvider>
	</React.StrictMode>
);

// Mark app initialization complete
if (env.VITE_ENABLE_PERFORMANCE_MONITORING) {
	performanceMonitor.mark('app-initialized');
	const initTime = performanceMonitor.measure('app-init', 'app-start', 'app-initialized');
	if (initTime) {
		console.log(`App initialization time: ${initTime.toFixed(2)}ms`);
	}
}
