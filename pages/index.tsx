import type { NextPage } from "next";
import { Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";

const Home: NextPage = () => {
  useEffect(() => {
    window.location.href = "https://kap.domains";
  }, []);

  return (
    <Flex
      width="100%"
      alignItems="center"
      justifyContent="center"
      direction="column"
      gap="8"
    >
      <Text>Redirecting to https://kap.domains...</Text>
    </Flex>
  );
};

export default Home;
