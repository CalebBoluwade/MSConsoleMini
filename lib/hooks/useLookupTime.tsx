import { useSearchParams } from "next/navigation";

export const useLookupTime = () => {
  const searchParams = useSearchParams();
  const lookup = searchParams.get("lookup");

  return {
    lookupTime: lookup ? parseInt(lookup) : undefined,
  };
};
