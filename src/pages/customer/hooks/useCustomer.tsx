import { useGetCustomerByIdQuery } from "../../../store/api/customers/customer.api";
import { Customer } from "../types/customers.type";

export function useCustomerById(id: number) {
  const { data, isLoading, error }: any = useGetCustomerByIdQuery(id);
  console.log(data, 'aaaaaaaaaaaaa');

  const dataDetails = data?.data;
  return {
    data,
    isLoading,
    error,
  };
}
