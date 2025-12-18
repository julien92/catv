import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Transaction } from "../../model/transaction";
import { WalletType } from "../../model/wallet";
import { buildGraph, Graph, NodeGraph } from "./graph";
import styles from "./styles.module.css";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface Props {
  transactions: Transaction[];
  rootAddress: string;
}

// Color scheme - Finance Theme
const colors = {
  root: "#00D4AA",
  exchange: "#F59E0B",
  smartContract: "#3B82F6",
  default: "#6B7280",
  link: "rgba(0, 212, 170, 0.2)",
  linkArrow: "rgba(0, 212, 170, 0.4)",
  particle: "#00D4AA",
  background: "#000000",
  nodeFill: "#0A0A0A",
};

const strokeStyleByWalletType: Map<WalletType, string> = new Map([
  [WalletType.Exchange, colors.exchange],
  [WalletType.SmartContract, colors.smartContract],
]);

const onNodeClick = (node: NodeGraph) => {
  window.open(node.displayUrl, "_blank");
};

const nodeLabel = (node: any) => {
  return node.alias || `${node.id.slice(0, 8)}...${node.id.slice(-6)}`;
};

const nodeCanvasObject =
  (imageMap: Record<string, HTMLImageElement>) =>
  (node: any, canvasContext: CanvasRenderingContext2D) => {
    const size = node.isRootAddress ? 8 : 6;

    canvasContext.save();
    canvasContext.beginPath();
    canvasContext.arc(node.x, node.y, size, 0, Math.PI * 2, true);

    // Determine stroke color
    let strokeColor = colors.default;
    if (node.isRootAddress) {
      strokeColor = colors.root;
    } else if (strokeStyleByWalletType.has(node.walletType)) {
      strokeColor = strokeStyleByWalletType.get(node.walletType)!;
    }

    // Draw glow for root node
    if (node.isRootAddress) {
      canvasContext.shadowColor = colors.root;
      canvasContext.shadowBlur = 15;
    }

    canvasContext.strokeStyle = strokeColor;
    canvasContext.lineWidth = node.isRootAddress ? 3 : 2;
    canvasContext.stroke();

    canvasContext.shadowBlur = 0;
    canvasContext.closePath();
    canvasContext.clip();

    // Fill background
    canvasContext.fillStyle = colors.nodeFill;
    canvasContext.fillRect(node.x - size, node.y - size, size * 2, size * 2);

    // Draw avatar if available
    if (imageMap[node.id]) {
      canvasContext.fillStyle = "transparent";
      canvasContext.drawImage(
        imageMap[node.id],
        node.x - size,
        node.y - size,
        size * 2,
        size * 2
      );
    }

    canvasContext.restore();
  };

const linkColor = () => colors.link;
const arrowColor = () => colors.linkArrow;

// Legend component
const Legend = () => (
  <div className={styles.legend}>
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ background: colors.root, boxShadow: `0 0 8px ${colors.root}` }} />
      <span>Root Address</span>
    </div>
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ background: colors.exchange }} />
      <span>Exchange</span>
    </div>
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ background: colors.smartContract }} />
      <span>Contract</span>
    </div>
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ background: colors.default }} />
      <span>Wallet</span>
    </div>
  </div>
);

// Controls component
const Controls = ({ onZoomIn, onZoomOut, onReset }: { onZoomIn: () => void; onZoomOut: () => void; onReset: () => void }) => (
  <div className={styles.controls}>
    <button className={styles.controlBtn} onClick={onZoomIn} title="Zoom In">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
      </svg>
    </button>
    <button className={styles.controlBtn} onClick={onZoomOut} title="Zoom Out">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M8 11h6" />
      </svg>
    </button>
    <button className={styles.controlBtn} onClick={onReset} title="Reset View">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  </div>
);

export default function Graphs({ transactions, rootAddress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [graph, setGraph] = useState<Graph>({ nodes: [], links: [] });

  // Handle responsive sizing
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({
        width,
        height: Math.max(350, height - 60), // Account for legend/controls
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  useEffect(() => {
    if (!transactions) return;
    setGraph(buildGraph(transactions, rootAddress));
  }, [transactions, rootAddress]);

  // Center graph on root node after loading
  useEffect(() => {
    if (graphRef.current && graph.nodes.length > 0 && typeof graphRef.current.zoomToFit === 'function') {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [graph]);

  const imageMap = useMemo(() => {
    const map = {};

    transactions.forEach((transaction) => {
      if (transaction.sender.address && !map[transaction.sender.address]) {
        map[transaction.sender.address] = new Image();
        map[transaction.sender.address].src = transaction.sender.avatarUrl;
      }
      if (transaction.target.address && !map[transaction.target.address]) {
        map[transaction.target.address] = new Image();
        map[transaction.target.address].src = transaction.target.avatarUrl;
      }
    });

    return map;
  }, [transactions]);

  const handleZoomIn = useCallback(() => {
    if (graphRef.current && typeof graphRef.current.zoom === 'function') {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.3, 300);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (graphRef.current && typeof graphRef.current.zoom === 'function') {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.3, 300);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
      graphRef.current.zoomToFit(400, 50);
    }
  }, []);

  const hasData = transactions.length > 0;

  return (
    <div ref={containerRef} className={styles.graphWrapper}>
      {!hasData ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="3" />
              <circle cx="5" cy="6" r="2" />
              <circle cx="19" cy="6" r="2" />
              <circle cx="5" cy="18" r="2" />
              <circle cx="19" cy="18" r="2" />
              <path d="M12 9V6.5a2.5 2.5 0 0 0-2.5-2.5H7M12 9V6.5a2.5 2.5 0 0 1 2.5-2.5H17M12 15v2.5a2.5 2.5 0 0 1-2.5 2.5H7M12 15v2.5a2.5 2.5 0 0 0 2.5 2.5H17" />
            </svg>
          </div>
          <p className={styles.emptyText}>Transaction Graph</p>
          <p className={styles.emptySubtext}>
            Enter a wallet address to visualize the flow of transactions
          </p>
        </div>
      ) : (
        <>
          <Legend />
          <Controls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />
          <ForceGraph2D
            ref={graphRef}
            graphData={graph}
            nodeId="id"
            nodeLabel={nodeLabel}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor={colors.background}
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkDirectionalParticles={3}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.003}
            linkDirectionalParticleColor={() => colors.particle}
            linkColor={linkColor}
            linkDirectionalArrowColor={arrowColor}
            linkWidth={1.5}
            linkCurvature={0.1}
            nodeCanvasObject={nodeCanvasObject(imageMap)}
            onNodeClick={onNodeClick}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.25}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            minZoom={0.5}
            maxZoom={8}
          />
        </>
      )}
    </div>
  );
}
