import React, { useContext, createContext, useMemo } from "react";
import { Contract, Provider, utils } from "koilib";
import namerserviceAbi from "../contract/abi/nameservice-abi.json";
import { Abi } from "koilib/lib/interface";

const abi: Abi = {
  koilib_types: namerserviceAbi.types,
  ...namerserviceAbi,
};

export type NameObject = {
  name: string;
  domain: string;
  owner: string;
  expiration: string;
  grace_period_end: string;
};

type NameServiceContextType = {
  getOwner: (name: string) => Promise<{ value: string } | undefined>;
};

export const NameServiceContext = createContext<NameServiceContextType>({
  getOwner: async () => undefined,
});

export const useNameService = () => useContext(NameServiceContext);

export const NameServiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const { getOwner } = useMemo(() => {
    const nameService = new Contract({
      id: process.env.NEXT_PUBLIC_NAME_SERVICE_ADDR,
      abi,
      provider: new Provider([process.env.NEXT_PUBLIC_KOINOS_RPC_URL!]),
    });

    return {
      getOwner: async (name: string) => {
        const buffer = new TextEncoder().encode(name);
        const token_id = "0x" + utils.toHexString(buffer);
        const { result } = await nameService!.functions.owner_of<{
          value: string;
        }>({
          token_id,
        });
        return result;
      },
    };
  }, []);

  return (
    <NameServiceContext.Provider
      value={{
        getOwner,
      }}
    >
      {children}
    </NameServiceContext.Provider>
  );
};
