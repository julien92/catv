import Head from "next/head";
import styles from "../styles/Home.module.css";
import Criteria, { CriteriaValue } from "../components/criteria";
import Graph from "../components/graph";
import Transactions from "../components/transactions";

import { useCallback, useEffect, useMemo, useState } from "react";
import { validateAddress, ValidationResult } from "@taquito/utils";
import { useRouter } from "next/router";
import Image from "next/image";
import { Wallet, WalletType } from "../model/wallet";
import moment from "moment";
import getTransactions from "../fetcher/data-fetcher";
import { CircularProgress } from "@mui/material";
import { style } from "@mui/system";

const useFetchTransactions = () => {
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ( //TODO FIXME ADD CROSSCHAIN COMPATIBILITY
        false && (validateAddress(criteria.address) !== ValidationResult.VALID)) return;
    if (criteria.depth < 1 || criteria.depth > 10) return;
    if (criteria.limit < 1) return;
    if (criteria.from > criteria.to) return;

    /* TODO Cancel fetch on criteria change */

    setIsLoading(true);
    getTransactions(
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
    ({ address, depth, limit, from, to }: CriteriaValue) => {
      if (depth < 0 || depth > 10) return;
      if (limit < 0) return;

      const nextUrl = `/?address=${address}&depth=${depth}&limit=${limit}&from=${from.toISOString()}&to=${to.toISOString()}`;

      if (
          // FIXME CROSSCHAIN COMPATIBLITY
          false && validateAddress(address) !== ValidationResult.VALID) {
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
          Powered by TzKT API{" "}
          <a href="https://tzkt.io" target="_blank" rel="noreferrer">
            tzkt.io
          </a>
        </div>
      </footer>
    </>
  );
}
