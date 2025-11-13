import { useState, useMemo } from "react";
import { Product } from "../types/product.types";

export function useProducts(initialProducts: Product[]) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        !q ||
        [p.name, p.productCode, p.productType]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
    );
  }, [products, search]);

  const paged = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const toggleRow = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectAll = (checkedAll: boolean) => {
    const newChecked: Record<string, boolean> = {};
    if (checkedAll) products.forEach((p) => (newChecked[p.id] = true));
    setChecked(newChecked);
  };

  return {
    products,
    setProducts,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    filtered,
    paged,
    checked,
    toggleRow,
    selectAll,
  };
}
