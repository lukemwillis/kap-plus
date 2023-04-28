import { Image, SkeletonCircle, Flex } from "@chakra-ui/react";
import { createAvatar } from "@dicebear/avatars";
import * as identiconStyle from "@dicebear/avatars-identicon-sprites";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Contract, Provider, utils } from "koilib";
import nftAbiJson from "../contract/abi/nft-abi.json";

export type LinkObject = {
  key: string;
  value: string;
};

export type ProfileObject = {
  avatar_contract_id?: string;
  avatar_token_id?: string;
  name?: string;
  bio?: string;
  theme?: string;
  links?: LinkObject[];
};

interface AvatarProps {
  profile?: ProfileObject;
  size: string;
  address: string;
}

export const nftAbi: Abi = {
  koilib_types: nftAbiJson.types,
  ...nftAbiJson,
};

function Avatar({ size, address, profile }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    setHasError(false);
    const fetchAvatar = async () => {
      if (profile?.avatar_contract_id && profile.avatar_token_id) {
        setAvatarLoading(true);

        const nftContract = new Contract({
          id: profile.avatar_contract_id,
          abi: nftAbi,
          provider: new Provider([process.env.NEXT_PUBLIC_KOINOS_RPC_URL!]),
        });

        const { result: nftResult } = await nftContract!.functions.uri({});

        if (nftResult?.value) {
          const uri = normalizeIpfsUris(nftResult.value as string);
          try {
            const metadata = await fetch(`${uri}/${profile.avatar_token_id}`);
            const { image } = await metadata.json();
            const imageSrc = normalizeIpfsUris(image);
            setAvatarSrc(imageSrc);
            setAvatarLoading(false);
          } catch (error) {
            setAvatarMessage("error loading avatar");
            setAvatarLoading(false);
          }
        } else {
          setAvatarMessage("error loading avatar");
          setAvatarLoading(false);
        }
      } else {
        setAvatarMessage("no avatar set");
        setAvatarLoading(false);
      }
    };
    fetchAvatar();
  }, [
    profile?.avatar_contract_id,
    profile?.avatar_token_id,
    address,
    setHasError,
  ]);

  if (avatarLoading) {
    return <SkeletonCircle height={size} width={size} />;
  } else if (!hasError && avatarSrc) {
    return (
      <Image
        fallback={<SkeletonCircle height={size} width={size} flexShrink="0" />}
        src={avatarSrc}
        width={size}
        height={size}
        borderRadius="50%"
        borderWidth="1px"
        overflow="hidden"
        alt="KAP Account Avatar"
        onError={() => {
          setHasError(true);
          setAvatarMessage("error loading avatar");
        }}
      />
    );
  } else {
    const identicon = createAvatar(identiconStyle, { seed: address });

    return (
      <div
        style={{
          width: size,
          height: size,
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: identicon }}
          style={{
            display: "block",
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: "0",
            background: "white",
          }}
        />
        <Flex
          position="absolute"
          width={size}
          height={size}
          borderRadius="50%"
          justifyContent="center"
          alignItems="center"
          background="blackAlpha.800"
          color="white"
        >
          {avatarMessage}
        </Flex>
      </div>
    );
  }
}

export default dynamic(() => Promise.resolve(Avatar), {
  ssr: false,
});

function normalizeIpfsUris(uri: string) {
  let result = uri;
  if (uri.startsWith("ipfs://")) {
    const path = uri.indexOf("/", 7);
    if (path > -1) {
      result =
        "https://" +
        uri.substring(7, path) +
        ".ipfs.nftstorage.link" +
        uri.substring(path);
    } else {
      result = "https://" + uri.substring(7) + ".ipfs.nftstorage.link";
    }
  }
  return result;
}
