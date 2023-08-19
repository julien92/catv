import Head from "next/head";
import styles from "../styles/Home.module.css";
import Criteria, { CriteriaValue } from "../components/criteria";
import Graph from "../components/graph";
import Transactions from "../components/transactions";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Wallet, WalletType } from "../model/wallet";
import moment from "moment";
import getTransactions from "../chains/data-fetcher";
import { CircularProgress } from "@mui/material";

import { Chain } from "../chains/fetcher";
import validateAddress from "../chains/validator";

const useFetchTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();
  const { address, chain, depth, limit, from, to } = useRouter().query;
  const criteria: CriteriaValue = useMemo(
    () => ({
      address: (address as string) || "",
      chain: (chain as Chain) || "tezos",
      depth: parseInt(depth as string) || 1,
      limit: parseInt(limit as string) || 20,
      from: from
        ? new Date(from as string)
        : moment().subtract(1, "years").toDate(),
      to: to ? new Date(to as string) : new Date(),
    }),
    [address, chain, depth, limit, from, to]
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!validateAddress(criteria.chain, criteria.address)) return;
    if (criteria.depth < 1 || criteria.depth > 10) return;
    if (criteria.limit < 1) return;
    if (criteria.from > criteria.to) return;

    /* TODO Cancel fetch on criteria change */

    setIsLoading(true);
    getTransactions(
      criteria.chain,
      [{ address: criteria.address, type: WalletType.User } as Wallet],
      criteria.from,
      criteria.to,
      criteria.depth,
      criteria.limit
    )
      .then((transactions) => {
        setTransactions(transactions);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [criteria]);

  const handleCriteriaChange = useCallback(
    ({ address, chain, depth, limit, from, to }: CriteriaValue) => {
      if (depth < 0 || depth > 10) return;
      if (limit < 0) return;

      const nextUrl = `/?address=${address}&chain=${chain}&depth=${depth}&limit=${limit}&from=${from.toISOString()}&to=${to.toISOString()}`;

      if (!validateAddress(criteria.chain, address)) {
        router.replace(nextUrl);
      } else {
        router.push(nextUrl);
      }
    },
    [router]
  );

  return useMemo(
    () => ({
      criteria,
      onCriteriaChange: handleCriteriaChange,
      transactions,
      isLoading,
    }),
    [criteria, handleCriteriaChange, transactions, isLoading]
  );
};

export default function Home() {
  const { address } = useRouter().query;
  const { criteria, onCriteriaChange, transactions, isLoading } =
    useFetchTransactions();

  return (
    <>
      <Head>
        <title>Scope</title>
        <meta name="description" content="Crypto Analyzer Transaction Viewer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div className={styles.header}>
          {criteria.chain === 'tezos' && (
              <>
                <Image src="tezos_logo.svg" alt="logo" width={60} height={60} />
                <div className={styles.separator}></div>
              </>
          )}
          <div>Scope</div>
        </div>
      </header>
      <div className={styles.container}>
        <Criteria
          value={criteria}
          onChange={onCriteriaChange}
          disabled={isLoading}
        />
        <div className={styles.graphContainer}>
          <Graph transactions={transactions} rootAddress={address as string} />
          <div className={`${styles.loader} ${isLoading ? styles.show : ""}`}>
            <CircularProgress />
          </div>
        </div>
        <Transactions transactions={transactions} />
      </div>
      <footer className={styles.footer}>
        <div>
          {criteria.chain === 'tezos' && (
              <>
                Powered by TzKT API{" "}
                <a href="https://tzkt.io" target="_blank" rel="noreferrer">
                  tzkt.io
                </a>
              </>
          )}
        </div>
      </footer>
    </>
  );
}
