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
    [router, criteria.chain]
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
        <title>Scope - Blockchain Transaction Visualizer</title>
        <meta name="description" content="Visualize and analyze blockchain transactions across multiple chains" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <Image src="/scope.png" alt="Scope logo" width={48} height={48} />
            </div>
            <div className={styles.headerTitle}>Scope</div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <Criteria
          value={criteria}
          onChange={onCriteriaChange}
          disabled={isLoading}
        />

        <div className={styles.mainContent}>
          {/* Left Panel - Transactions */}
          <div className={styles.leftPanel}>
            <Transactions transactions={transactions} chain={criteria.chain} />
          </div>

          {/* Right Panel - Graph */}
          <div className={styles.rightPanel}>
            {transactions.length > 0 && (
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Transactions</span>
                  <span className={styles.statValue}>{transactions.length}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Chain</span>
                  <span className={styles.statValue}>{criteria.chain.toUpperCase()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Depth</span>
                  <span className={styles.statValue}>{criteria.depth}</span>
                </div>
              </div>
            )}
            <div className={styles.graphContainer}>
              <Graph transactions={transactions} rootAddress={address as string} />
              <div className={`${styles.loader} ${isLoading ? styles.show : ""}`}>
                <CircularProgress size={48} thickness={4} />
                <span className={styles.loaderText}>Loading transactions...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {criteria.chain === 'tezos' ? (
            <>
              <span>Powered by</span>
              <a href="https://tzkt.io" target="_blank" rel="noreferrer">
                TzKT API
              </a>
            </>
          ) : (
            <>
              <span>Powered by</span>
              <a href="https://etherscan.io" target="_blank" rel="noreferrer">
                Etherscan APIs
              </a>
            </>
          )}
          <span className={styles.footerDivider} />
          <span>Built with Next.js</span>
        </div>
      </footer>
    </>
  );
}
