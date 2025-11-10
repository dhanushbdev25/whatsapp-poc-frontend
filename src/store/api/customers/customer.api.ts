// src/store/api/customerApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { rawBaseQuery } from '../baseApi';

export interface Customer {
	customerID: number;
	name: string;
	email: string;
	phone?: string;
	gender?: string;
	address?: string;
	state?: string;
	pincode?: string;
	isActive: boolean;
	notificationPreferences?: {
		orderUpdates: boolean;
		loyaltyRewards: boolean;
		promotionalMessages: boolean;
	};
}

export interface UpdateCustomerBody {
	name?: string;
	email?: string;
	phone?: string;
	gender?: string;
	address?: string;
	state?: string;
	pincode?: string;
	notificationPreferences?: {
		orderUpdates?: boolean;
		loyaltyRewards?: boolean;
		promotionalMessages?: boolean;
	};
}

export const customerApi = createApi(
	{
		reducerPath: 'customerApi',
		baseQuery: rawBaseQuery,
		tagTypes: ['Customers', 'Customer'],
		endpoints: (builder) => ({
			getAllCustomers: builder.query<any[], void>({
				query: () => ({ url: 'customers', method: 'GET' }),
				transformResponse: (response: any) => response?.data || [],
				providesTags: [{ type: "Customers", id: "LIST" }],

			}),

			createCustomer: builder.mutation<
				any,
				any
			>({
				query: ({ data, userId }) => ({
					url: `customers?userId=${userId}`,
					method: "POST",
					body: data,
				}),
				transformResponse: (response: any) => response.data,
				invalidatesTags: [{ type: "Customers", id: "LIST" }],
			}),
			getCustomerById: builder.query<Customer, number>({
				query: (customerID) => ({ url: `customers/${customerID}`, method: 'GET' }),
				transformResponse: (response: any) => response.data, // ✅ HERE
				providesTags: (_res, _err, id) => [{ type: 'Customer', id }],
			}),
			getOrderById: builder.query<Customer, number>({
				query: (ID) => ({ url: `customers/order/${ID}`, method: 'GET' }),
				transformResponse: (response: any) => response.data, // ✅ HERE
				providesTags: (_res, _err, id) => [{ type: 'Customer', id }],
			}),

			updateCustomer: builder.mutation<
				Customer,
				{ customerID: any; data: UpdateCustomerBody }
			>({
				query: ({ customerID, data }) => ({
					url: `customers/${customerID}`,
					method: 'PATCH',
					body: data,
				}),
				transformResponse: (response: any) => response.data, // ✅ HERE
				invalidatesTags: (_res, _err, { customerID }) => [
					{ type: 'Customer', id: customerID },
					{ type: 'Customers', id: 'LIST' },
				],
			}),

			deleteCustomer: builder.mutation<{ message: string }, string>({
				query: (customerID) => ({ url: `customers/${customerID}`, method: 'DELETE' }),
				transformResponse: (response: any) => response.data ?? response, // ✅ HERE
				invalidatesTags: (_res, _err, id) => [
					{ type: 'Customer', id },
					{ type: 'Customers', id: 'LIST' },
				],
			}),

			downloadCustomersTemplate: builder.query<Blob, void>({
				query: () => ({
					url: 'customers/template',
					method: 'GET',
					// tell fetchBaseQuery to return a Blob instead of JSON
					responseHandler: async (response) => await response.blob(),
				}),
			}),

			// ------- NEW: BULK UPLOAD -------
			// POST /api/customers/bulk-upload (multipart/form-data; field name: "file")
			bulkUploadCustomers: builder.mutation<
				{ message?: string; data?: unknown },
				{ file: File; userId?: string }
			>({
				query: ({ file, userId }) => {
					const form = new FormData();
					form.append('file', file);
					const u = userId ? `?userId=${encodeURIComponent(userId)}` : '';
					return {
						url: `customers/bulk-upload${u}`,
						method: 'POST',
						body: form,
					};
				},
				transformResponse: (response: any) => response,
				invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
			}),

		}),
	});


export const {
	useGetAllCustomersQuery,
	useGetCustomerByIdQuery,
	useUpdateCustomerMutation,
	useDeleteCustomerMutation,
	useCreateCustomerMutation,
	useLazyDownloadCustomersTemplateQuery,
	useBulkUploadCustomersMutation

} = customerApi;
