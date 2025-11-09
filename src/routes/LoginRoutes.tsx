import { lazy } from 'react';
import Loadable from '../components/common/Loadable';
import MinimalLayout from '../layouts/MinimalLayout';
import { Navigate } from 'react-router-dom';

const Login = Loadable(lazy(() => import('../pages/authentication/Login')));
const ORDERCREATE = Loadable(lazy(() => import('../pages/order/index')));
const ORDERSUCESS = Loadable(lazy(() => import('../pages/order/create/paymentSucess')));
const REDEEMSCANNER = Loadable(lazy(() => import('../pages/redeemscanner/index')));
const VIRTUALTRYON = Loadable(lazy(() => import('../pages/virtualTryOn/index')));

export const LoginRoutes = {
	path: '/',
	element: <MinimalLayout />,
	children: [
		{
			index: true,
			element: <Login />
		},
		{
			path: 'order/:id',
			element: <ORDERCREATE />
		},
		{
			path: 'order/success',
			element: <ORDERSUCESS />
		},
		{
			path: 'redeem/camera/:id',
			element: <REDEEMSCANNER />
		},
		{
			path: 'virtual-try/:id',
			element: <VIRTUALTRYON />
		},
		{
			path: '*',
			element: <Navigate to="/" />
		}
	]
};
