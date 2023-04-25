import {
  Box,
  Button,
  Flex,
  IconButton,
  Link,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import Avatar from "../components/Avatar";
import { useEffect, useState } from "react";
import { AddIcon, EmailIcon } from "@chakra-ui/icons";
import {
  FaGlobe,
  FaGithub,
  FaDiscord,
  FaTwitter,
  FaRedditAlien,
  FaTelegramPlane,
  FaEthereum,
  FaBitcoin,
} from "react-icons/fa";
import { Contract, Provider, utils } from "koilib";
import { Abi } from "koilib/lib/interface";
import profileAbiJson from "../contract/abi/profile-abi.json";
import nftAbiJson from "../contract/abi/nft-abi.json";
import { useNameService } from "../context/NameServiceProvider";
import { NextPage } from "next";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import Head from "next/head";

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

const profileAbi: Abi = {
  koilib_types: profileAbiJson.types,
  ...profileAbiJson,
};

export const nftAbi: Abi = {
  koilib_types: nftAbiJson.types,
  ...nftAbiJson,
};

export enum SocialKeys {
  WEBSITE = "website",
  EMAIL = "email",
  GITHUB = "github",
  TWITTER = "twitter",
  REDDIT = "reddit",
  DISCORD = "discord",
  TELEGRAM = "telegram",
  ETH = "eth",
  BTC = "btc",
}

export const ICONS = {
  [SocialKeys.WEBSITE]: <FaGlobe />,
  [SocialKeys.EMAIL]: <EmailIcon />,
  [SocialKeys.GITHUB]: <FaGithub />,
  [SocialKeys.TWITTER]: <FaTwitter />,
  [SocialKeys.REDDIT]: <FaRedditAlien />,
  [SocialKeys.DISCORD]: <FaDiscord />,
  [SocialKeys.TELEGRAM]: <FaTelegramPlane />,
  [SocialKeys.ETH]: <FaEthereum />,
  [SocialKeys.BTC]: <FaBitcoin />,
};

const Profile: NextPage = () => {
  const {
    query: { name },
  } = useRouter();
  const { getOwner } = useNameService();
  const [address, setAddress] = useState("");
  const [profile, setProfile] = useState<ProfileObject>();
  const [isThemeLight, setIsThemeLight] = useState(true);
  const [nameFound, setNameFound] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(true);
  const theme = profile?.theme || "fff";

  useEffect(() => {
    const profileContract = new Contract({
      id: process.env.NEXT_PUBLIC_PROFILE_ADDR,
      abi: profileAbi,
      provider: new Provider([process.env.NEXT_PUBLIC_KOINOS_RPC_URL!]),
    });

    const fetchProfile = async () => {
      if (typeof name !== "string") return;
      const ownerResult = await getOwner(name);
      if (ownerResult) {
        setAddress(ownerResult.value);
        const { result: profileResult } =
          await profileContract!.functions.get_profile<ProfileObject>({
            address: ownerResult.value,
          });
        setProfile(profileResult || {});

        if (profileResult?.theme) {
          setIsThemeLight(isThemeColorLight(profileResult.theme));
        }

        if (
          profileResult?.avatar_contract_id &&
          profileResult.avatar_token_id
        ) {
          const nftContract = new Contract({
            id: profileResult.avatar_contract_id,
            abi: nftAbi,
            provider: new Provider([process.env.NEXT_PUBLIC_KOINOS_RPC_URL!]),
          });

          const { result: nftResult } = await nftContract!.functions.uri({});

          if (nftResult?.value) {
            const uri = normalizeIpfsUris(nftResult.value as string);
            try {
              const metadata = await fetch(
                `${uri}/${profileResult.avatar_token_id}`
              );
              const { image } = await metadata.json();
              const imageSrc = normalizeIpfsUris(image);
              setAvatarSrc(imageSrc);
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
      } else {
        setNameFound(false);
      }
    };
    fetchProfile();
  }, [name]);

  useEffect(() => {
    if (!!profile || !nameFound) {
      window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || "", {
        page_path: window.location.pathname,
      });
    }
  }, [profile, nameFound]);

  return (
    <>
      <Head>
        <title>{profile?.name || name || "Loading..."} | KAP+</title>
      </Head>
      <Skeleton
        isLoaded={!!profile || !nameFound}
        borderRadius="0"
        width="100%"
        height="100%"
      >
        <Flex
          background={`#${theme}`}
          color={isThemeLight ? "gray.800" : "white"}
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          height="100%"
          direction="column"
        >
          <Box height="3.5em" />
          {!nameFound ? (
            <Text>Name not found</Text>
          ) : !profile?.name &&
            !profile?.theme &&
            !profile?.bio &&
            !profile?.links &&
            !profile?.avatar_contract_id &&
            !profile?.avatar_token_id ? (
            <Flex direction="column" gap="3">
              <Text>Owner has not set up their profile</Text>
              <Button
                as={Link}
                href={`https://koinosblocks.com/address/${address}`}
                target="_blank"
              >
                View Address on Koinosblocks
              </Button>
            </Flex>
          ) : (
            <Stack
              alignItems="center"
              maxWidth="30em"
              margin="0 auto"
              gap="2"
              padding="8"
            >
              <SkeletonCircle
                width="12em"
                height="12em"
                isLoaded={!avatarLoading}
              >
                <Avatar size="12em" src={avatarSrc} address={address} message={avatarMessage} />
              </SkeletonCircle>
              <Text fontSize="4xl" lineHeight="1">
                {profile?.name || "No Name Set"}
              </Text>
              <Text textAlign="center">{profile?.bio}</Text>
              <Flex
                gap="2"
                flexWrap="wrap"
                justifyContent="center"
                maxWidth="20em"
              >
                {profile?.links?.map(({ key, value }) => {
                  let link;
                  switch (key) {
                    case SocialKeys.BTC:
                      link = `https://blockstream.info/address/${value}`;
                      break;
                    case SocialKeys.ETH:
                      link = `https://etherscan.io/address/${value}`;
                      break;
                    case SocialKeys.EMAIL:
                      link = `mailto:${value}`;
                      break;
                    case SocialKeys.WEBSITE:
                      link = `https://${value}`;
                      break;
                    case SocialKeys.GITHUB:
                      link = `https://github.com/${value}`;
                      break;
                    case SocialKeys.REDDIT:
                      link = `https://reddit.com/u/${value}`;
                      break;
                    case SocialKeys.DISCORD:
                      link = `https://discord.com/users/${value}`;
                      break;
                    case SocialKeys.TELEGRAM:
                      link = `https://t.me/${value}`;
                      break;
                    case SocialKeys.TWITTER:
                      link = `https://twitter.com/${value}`;
                      break;
                  }
                  return (
                    <IconButton
                      as={Link}
                      aria-label={key}
                      key={key}
                      icon={ICONS[key as SocialKeys]}
                      variant="outline"
                      size="lg"
                      color={isThemeLight ? "gray.800" : "white"}
                      borderRadius="50%"
                      borderColor={
                        isThemeLight ? "blackAlpha.400" : "whiteAlpha.400"
                      }
                      _hover={{
                        background: isThemeLight
                          ? "blackAlpha.200"
                          : "whiteAlpha.200",
                      }}
                      href={link}
                      target="_blank"
                    />
                  );
                })}
              </Flex>
            </Stack>
          )}

          <Flex
            justifyContent="center"
            width="100%"
            padding="4"
            alignItems="center"
            flexWrap="wrap"
            gap="2"
            color={isThemeLight ? "gray.600" : "gray.200"}
            fontSize="xs"
          >
            <Flex
              flex="1"
              justifyContent="start"
              order={{ base: 2, md: 1 }}
              width="auto"
            >
              <Text whiteSpace="nowrap">
                &copy; {new Date().getFullYear()} Top Level Accounts, Inc.
              </Text>
            </Flex>
            <Flex
              flex="1"
              justifyContent="center"
              order={{ base: 1, md: 2 }}
              flexBasis={{ base: "100%", md: "1" }}
            >
              <Text>
                Powered by{" "}
                <Link target="_blank" href="https://kap.domains">
                  <Logo size="4em" light={isThemeLight} />
                </Link>
              </Text>
            </Flex>
            <Flex flex="1" justifyContent="end" order="3">
              <IconButton
                as={Link}
                href="https://twitter.com/kapdomains"
                aria-label="KAP Twitter"
                icon={<FaTwitter />}
                variant="link"
                color={isThemeLight ? "gray.600" : "gray.100"}
              />
            </Flex>
          </Flex>
        </Flex>
      </Skeleton>
    </>
  );
};

function isThemeColorLight(hexcolor: string) {
  let rs, gs, bs;
  if (hexcolor.length === 6) {
    rs = hexcolor.substring(0, 2);
    gs = hexcolor.substring(2, 4);
    bs = hexcolor.substring(4);
  } else if (hexcolor.length === 3) {
    rs = hexcolor.substring(0, 1).repeat(2);
    gs = hexcolor.substring(1, 2).repeat(2);
    bs = hexcolor.substring(2).repeat(2);
  } else {
    return false;
  }
  const r = parseInt(rs, 16);
  const g = parseInt(gs, 16);
  const b = parseInt(bs, 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
}

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

export default Profile;