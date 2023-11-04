import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import heroMinaLogo from "../../public/assets/hero-mina-logo.svg";
import arrowRightSmall from "../../public/assets/arrow-right-small.svg";
import { Mina, fetchAccount } from "o1js";
import { Add } from "../../../contracts/build/src/";

interface SendTransactionArgs {
  transaction: any;
  feePayer?: {
    fee?: number;
    memo?: string;
  };
}

export default function Home() {
  const [shortAddress, setShortAddress] = useState<string>();
  const [zkApp, setZkApp] = useState<Add>();

  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        const w = window as any;
        let accounts;

        try {
          // Accounts is an array of string Mina addresses.
          accounts = await w.mina.requestAccounts();

          // Show first 6 and last 4 characters of user's Mina account.
          setShortAddress(
            `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
          );
        } catch (err: any) {
          // If the user has a wallet installed but has not created an account, an
          // exception will be thrown. Consider showing "not connected" in your UI.
          console.log(err.message);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { Mina, PublicKey } = await import("o1js");
      const { Add } = await import("../../../contracts/build/src/");

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      const zkAppAddress =
        "B62qqHBiDQPaZFkgtTAHtwQqRm81cc9sZ8TbiD5C3sm3dy8JP9ximXT";
      // This should be removed once the zkAppAddress is updated.
      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
        );
      }

      await fetchAccount({ publicKey: zkAppAddress });
      const zkApp = new Add(PublicKey.fromBase58(zkAppAddress));
      setZkApp(zkApp);
    })();
  }, []);

  const btnAction = async () => {
    if (typeof window !== "undefined") {
      const w = window as any;
      if (!zkApp) {
        alert("no zkApp");
        return;
      }

      try {

        const tx = await Mina.transaction(() => {
          zkApp.update();
        });

        await tx.prove();

        const SendTransactionArgs: SendTransactionArgs = {
          transaction: tx.toJSON(),
          feePayer: {
            fee: 0.1,
            memo: "zk",
          },
        };
        const { hash } = await w.mina.sendTransaction(SendTransactionArgs);

        console.log(hash);
      } catch (err: any) {
        // You may want to show the error message in your UI to the user if the transaction fails.
        console.log(err.message);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <button onClick={btnAction}>DO SOMETHING</button>
      </main>
    </>
  );
}
