import { useEffect, useState } from "react";

const useDebouncedSearch = <T = string,>(value: T, delay: number) => {
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedSearchValue;
};

export default useDebouncedSearch;
