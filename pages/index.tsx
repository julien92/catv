import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import Criteria, { CriteriaValue } from "../components/criteria";
import Graph from "../components/graph";
import Transactions from "../components/transactions";

import { useEffect, useMemo, useState } from "react";
import { validateAddress, ValidationResult } from "@taquito/utils";
import { useRouter } from "next/router";
import Image from "next/image";
import fetchTransactionTree from "../tzkt/fetchTransactionTree";
import { Wallet } from "../model/wallet";
import moment from "moment";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();
  const { address, depth, limit, from, to } = useRouter().query;
  const criteria: CriteriaValue = useMemo(
    () => ({
      address: (address as string) || "",
      depth: parseInt(depth as string) || 1,
      limit: parseInt(limit as string) || 20,
      from: from
        ? new Date(from as string)
        : moment().subtract(1, "years").toDate(),
      to: to ? new Date(to as string) : new Date(),
    }),
    [address, depth, limit, from, to]
  );

  useEffect(() => {
    if (validateAddress(criteria.address) !== ValidationResult.VALID) return;
    if (criteria.depth < 1 || criteria.depth > 10) return;
    if (criteria.limit < 1) return;
    if (criteria.from > criteria.to) return;

    /* TODO Cancel fetch on criteria change */
    fetchTransactionTree(
      [{ address: criteria.address } as Wallet],
      criteria.from,
      criteria.to,
      criteria.depth,
      criteria.limit
    ).then((transactions) => {
      setTransactions(transactions);
    });
  }, [criteria]);

  const handleCriteriaChange = ({
    address,
    depth,
    limit,
    from,
    to,
  }: CriteriaValue) => {
    if (depth < 0 || depth > 10) return;
    if (limit < 0) return;
    router.push(
      `/?address=${address}&depth=${depth}&limit=${limit}&from=${from.toISOString()}&to=${to.toISOString()}`
    );
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
        <div>
          Powered by TzKT API{" "}
          <a href="https://tzkt.io" target="_blank" rel="noreferrer">
            tzkt.io
          </a>
        </div>
      </footer>
    </>
  );
}
