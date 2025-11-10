import { lazy, type ComponentType } from 'react';

import PeopleIcon from '@mui/icons-material/People';
// Lazy-loaded components
export const imports = {
	CUSTOMER: lazy(() => import('../pages/customer/index')),
	CUSTOMERVIEW: lazy(() => import('../pages/customer/view/index')),
	CUSTOMERCREATE: lazy(() => import('../pages/customer/create/index')),
	CUSTOMERBULKCREATE: lazy(() => import('../pages/customer/bulk/create/index')),
	ORDERCREATE: lazy(() => import('../pages/order/index')),
	ORDERSUCESS: lazy(() => import('../pages/order/create/paymentSucess')),
	REDEEMSCANNER: lazy(() => import('../pages/redeemscanner/index')),
	REDEEMS: lazy(() => import('../pages/redeemscanner/RedeemLoyaltyPoints')),
	VIRTUALTRYON: lazy(() => import('../pages/virtualTryOn/index')),
	CUSTOMERWHATSUPSENDMESSAGE: lazy(() => import('../pages/WhatsAppMessage/SendMessage/index')),
	CUSTOMERWHATSUPVIEWMESSAGETEMPLATE: lazy(() => import('../pages/WhatsAppMessage/ViewMessage/index')),



};

/**
 * Screen configuration interface
 */
export interface ScreenConfig {
	/** Icon component (only required for sidebar items) */
	icon?: ComponentType<{ fill?: string }>;
	/** Display text for the screen */
	text: string;
	/** Route path */
	path: string;
	/** React component to render */
	element: ComponentType;
	/** Required permission string */
	permission: string;
	/** Whether this is the initial route */
	isInitial?: boolean;
	/** Display order (only required for items that show in sidebar) */
	order?: number;
	/** Whether to show in sidebar */
	showInSidebar?: boolean;
}

/**
 * Main module configuration interface
 */
export interface MainModuleConfig {
	/** Module display text */
	text: string;
	/** Module icon component */
	icon: ComponentType<{ fill?: string }>;
	/** Display order */
	order: number;
	/** Submodules/screens within this module */
	submodules: ScreenConfig[];
}

// Main module configurations with hierarchical structure
// export const mainModuleConfigs: MainModuleConfig[] = [];

export const mainModuleConfigs: MainModuleConfig[] = [
	{
		text: 'Customer',
		icon: PeopleIcon,
		order: 1,
		submodules: [
			{
				icon: PeopleIcon,
				text: 'Customer Home',
				path: '/customer',
				element: imports.CUSTOMER,
				permission: 'CUSTOMER',
				isInitial: true,
				order: 1,
				showInSidebar: true
			},
			{
				icon: PeopleIcon,
				text: 'Customer Home',
				path: 'customer/view',
				element: imports.CUSTOMERVIEW,
				permission: 'CUSTOMERVIEW',
				isInitial: true,
				order: 2,
				showInSidebar: false
			},
			{
				icon: PeopleIcon,
				text: 'Customer Home',
				path: 'customer/create',
				element: imports.CUSTOMERCREATE,
				permission: 'CUSTOMERCREATE',
				isInitial: true,
				order: 3,
				showInSidebar: false
			},
			{
				icon: PeopleIcon,
				text: 'Customer Home',
				path: 'customer/edit',
				element: imports.CUSTOMER,
				permission: 'CUSTOMER',
				isInitial: true,
				order: 3,
				showInSidebar: false
			},
			{
				icon: PeopleIcon,
				text: 'Customer Home',
				path: 'customer/bulk/create',
				element: imports.CUSTOMERBULKCREATE,
				permission: 'CUSTOMER',
				isInitial: true,
				order: 3,
				showInSidebar: false
			},

			{
				icon: PeopleIcon,
				text: 'Order',
				path: 'order/:id',
				element: imports.ORDERCREATE,
				permission: 'ORDERCREATE',
				isInitial: true,
				order: 3,
				showInSidebar: false
			},
			{
				icon: PeopleIcon,
				text: 'Order Home',
				path: 'order/success',
				element: imports.ORDERSUCESS,
				permission: 'ORDERSUCESS',
				isInitial: true,
				order: 3,
				showInSidebar: false
			},
			{
				icon: PeopleIcon,
				text: 'Redeem Loyalty Points',
				path: '/user/:id/add-points/scan',
				// path: 'redeem/clam',
				element: imports.REDEEMS,
				permission: 'REDEEMS',
				isInitial: true,
				order: 3,
				showInSidebar: false
			}
			,
			{
				icon: PeopleIcon,
				text: 'Send Message',
				path: '/send/message',
				element: imports.CUSTOMERWHATSUPSENDMESSAGE,
				permission: 'CUSTOMERWHATSUPSENDMESSAGE',
				isInitial: true,
				order: 3,
				showInSidebar: true
			}
			,
			{
				icon: PeopleIcon,
				text: 'View Message Template',
				path: '/view/message/template',
				element: imports.CUSTOMERWHATSUPVIEWMESSAGETEMPLATE,
				permission: 'VIRTUALTRYON',
				isInitial: true,
				order: 3,
				showInSidebar: true
			}
		]
	}
];

// Flattened screen configurations for backward compatibility and routing
export const screenConfigs: ScreenConfig[] = mainModuleConfigs.flatMap(module => module.submodules);
