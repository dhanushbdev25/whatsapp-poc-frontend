import { combineReducers, AnyAction } from 'redux';
import { authApi } from '../api/auth/auth.api';
import { LOGOUT, AuthActionTypes } from './actions';
import { sessionApi } from '../api/auth/session.api';
import TokenStorage from '../../utils/TokenStorage';
import { customerApi } from '../api/customers/customer.api';

const rootReducer = combineReducers({
	[authApi.reducerPath]: authApi.reducer,
	[sessionApi.reducerPath]: sessionApi.reducer,
	[customerApi.reducerPath]: customerApi.reducer

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
