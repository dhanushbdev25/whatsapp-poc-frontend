import { createApi } from '@reduxjs/toolkit/query/react';
import { rawBaseQuery } from '../baseApi';

export const ordersApi = createApi(
	{
		reducerPath: 'OrdersApi',
		baseQuery: rawBaseQuery,
		tagTypes: ['Orders', 'Orders'],
		endpoints: (builder) => ({
			getAllOrders: builder.query<any[], void>({
				query: () => ({ url: '/orders/postAuth/fetchAllOrders', method: 'GET' }),
				transformResponse: (response: any) => response?.data || [],
				providesTags: [{ type: "Orders", id: "LIST" }],

			}),
			getOrderById: builder.query<any, any>({
				query: (ID) => ({ url: `orders/postAuth/${ID}/get-order-details`, method: 'GET' }),
				transformResponse: (response: any) => response.data,
				providesTags: (_res, _err, id) => [{ type: 'Orders', id }],
			}),

		}),
	});


export const {
	useGetOrderByIdQuery,
	useGetAllOrdersQuery
} = ordersApi;
