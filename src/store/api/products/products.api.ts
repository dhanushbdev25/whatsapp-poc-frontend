import { createApi } from "@reduxjs/toolkit/query/react";
import { rawBaseQuery } from "../baseApi";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: rawBaseQuery,
  tagTypes: ["Products", "Product"],

  endpoints: (builder) => ({
    // ✅ Get all products
    getAllProducts: builder.query<any[], void>({
      query: () => ({
        url: "/products",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    // ✅ Create product
    createProduct: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data.data,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    // ✅ Get product by ID
    getProductById: builder.query<any, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: (_res, _err, id) => [{ type: "Product", id }],
    }),

    // ✅ Update product
    updateProduct: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => response,
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // ✅ Delete product
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response?.data ?? response,
      invalidatesTags: (_res, _err, id) => [
        { type: "Product", id },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
