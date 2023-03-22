import "../styles/globals.css";
import "@fontsource/poppins";
import type { AppProps } from "next/app";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { AccountProvider } from "../context/AccountProvider";
import theme from "../styles/theme";
import Head from "next/head";
import { NameServiceProvider } from "../context/NameServiceProvider";
import { ProfileProvider } from "../context/ProfileProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AccountProvider>
        <NameServiceProvider>
          <ProfileProvider>
            <Head>
              <title>KAP</title>
              <meta
                name="viewport"
                content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0"
              />
              <link
                href="favicon.ico"
                rel="icon"
                media="(prefers-color-scheme: light)"
              />
              <link
                href="favicon-inverse.ico"
                rel="icon"
                media="(prefers-color-scheme: dark)"
              />
            </Head>
            <Flex
              margin="auto"
              height="100%"
              width="100%"
              direction="column"
            >
              <main style={{ flex: 1, display: "flex" }}>
                <Component {...pageProps} />
              </main>
            </Flex>
          </ProfileProvider>
        </NameServiceProvider>
      </AccountProvider>
    </ChakraProvider>
  );
}

export default MyApp;
