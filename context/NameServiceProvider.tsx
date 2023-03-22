import React, { useContext, createContext, useMemo } from "react";
import { Contract, utils } from "koilib";
import { useAccount } from "./AccountProvider";
import namerserviceAbi from "../contract/abi/nameservice-abi.json";
import { Abi } from "koilib/lib/interface";
import { useBoolean, useToast } from "@chakra-ui/react";

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
  getName: (name: string) => Promise<NameObject | undefined>;
  getNames: () => Promise<{ names: NameObject[] } | undefined>;
};

export const NameServiceContext = createContext<NameServiceContextType>({
  getOwner: async () => undefined,
  getName: async () => undefined,
  getNames: async () => undefined,
});

export const useNameService = () => useContext(NameServiceContext);

export const NameServiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const { address, provider, signer } = useAccount();

  const { getOwner, getName, getNames } = useMemo(() => {
    const nameService = new Contract({
      id: process.env.NEXT_PUBLIC_NAME_SERVICE_ADDR,
      abi,
      provider,
      signer,
    });

    return {
      getOwner: async (name: string) => {
        const buffer = new TextEncoder().encode(name);
        const token_id = "0x" + utils.toHexString(buffer);
        const { result } = await nameService!.functions.owner_of<{ value: string }>({
          token_id
        });
        return result;
      },
      getName: async (name: string) => {
        const { result } = await nameService!.functions.get_name<NameObject>({
          name,
        });
        return result;
      },
      getNames: async () => {
        const { result } = await nameService!.functions.get_names<{
          names: NameObject[];
        }>({
          owner: address,
          nameOffset: "",
          descending: false,
          limit: 100,
        });
        return result;
      },
    };
  }, [
    address,
    provider,
    signer,
  ]);

  return (
    <NameServiceContext.Provider
      value={{
        getOwner,
        getName,
        getNames,
      }}
    >
      {children}
    </NameServiceContext.Provider>
  );
};
