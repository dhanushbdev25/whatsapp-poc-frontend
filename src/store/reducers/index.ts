import { combineReducers, AnyAction } from 'redux';
import { authApi } from '../api/auth/auth.api';
import { LOGOUT, AuthActionTypes } from './actions';
import { sessionApi } from '../api/auth/session.api';
import TokenStorage from '../../utils/TokenStorage';
import { customerApi } from '../api/customers/customer.api';
import { ordersApi } from '../api/orders/orders.api';
import { productApi } from '../api/products/products.api';

const rootReducer = combineReducers({
	[authApi.reducerPath]: authApi.reducer,
	[sessionApi.reducerPath]: sessionApi.reducer,
	[customerApi.reducerPath]: customerApi.reducer,
	[ordersApi.reducerPath]: ordersApi.reducer,
	[productApi.reducerPath]: productApi.reducer,


});

// Handle the LOGOUT action
const appReducer = (state: ReturnType<typeof rootReducer> | undefined, action: AnyAction) => {
	if (action.type === LOGOUT) {
		TokenStorage.clearTokens();
		state = undefined;
	}
	return rootReducer(state, action as AuthActionTypes);
};

export default appReducer;
