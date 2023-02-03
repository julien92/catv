import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import Criteria, { CriteriaValue } from "../components/criteria";
import Graph from "../components/graph";
import Transactions from "../components/transactions";

import { useEffect, useMemo, useState } from "react";
import fetchTransactionTree, { Wallet } from "../tzkt/fetchTransactionTree";
import { validateAddress, ValidationResult } from "@taquito/utils";
import { useRouter } from "next/router";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();
  const { address, depth, limit } = useRouter().query;
  const criteria = useMemo(
    () => ({
      address: (address as string) || "",
      depth: parseInt(depth as string) || 1,
      limit: parseInt(limit as string) || 20,
    }),
    [address, depth, limit]
  );

  useEffect(() => {
    if (validateAddress(address as string) !== ValidationResult.VALID) return;
    const _depth = parseInt(depth as string);
    if (_depth < 1 || _depth > 10) return;

    const _limit = parseInt(limit as string);
    if (_limit < 1) return;

    fetchTransactionTree(
      [{ address: address } as Wallet],
      new Date("2020-01-01T00:00:00Z"),
      new Date(),
      _depth,
      _limit
    ).then((transactions) => {
      setTransactions(transactions);
    });
  }, [address, depth, limit]);

  const handleCriteriaChange = ({ address, depth, limit }: CriteriaValue) => {
    if (depth < 0 || depth > 10) return;
    if (limit < 0) return;
    router.push(`/?address=${address}&depth=${depth}&limit=${limit}`);
  };

  return (
    <>
      <Head>
        <title>CATV</title>
        <meta name="description" content="Crypto Analyzer Transaction Viewer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div className={styles.header}>
          <Image src="tezos_logo.svg" alt="logo" width={60} height={60} />
          <div className={styles.separator}>-</div>
          <div>CATV</div>
        </div>
      </header>
      <div className={styles.container}>
        <Criteria value={criteria} onChange={handleCriteriaChange} />
        <Graph transactions={transactions} rootAddress={address as string} />
        <Transactions transactions={transactions} />
      </div>
      <footer className={styles.footer}>
        <div />
      </footer>
    </>
  );
}
