import { Image, SkeletonCircle, Flex } from "@chakra-ui/react";
import { createAvatar } from "@dicebear/avatars";
import * as identiconStyle from "@dicebear/avatars-identicon-sprites";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface AvatarProps {
  src?: string;
  size: string;
  address: string;
  message?: string;
}

function Avatar({ src, size, address, message }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) {
      setHasError(false);
    }
  }, [src, address, setHasError, hasError]);

  if (!hasError && src) {
    return (
      <Image
        fallback={<SkeletonCircle height={size} width={size} flexShrink="0" />}
        src={src}
        width={size}
        height={size}
        borderRadius="50%"
        borderWidth="1px"
        overflow="hidden"
        alt="KAP Account Avatar"
        onError={() => setHasError(true)}
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
          {message}
        </Flex>
      </div>
    );
  }
}

export default dynamic(() => Promise.resolve(Avatar), {
  ssr: false,
});
