"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import {
  OLYMPIA_ACTIVATION_BLOCK,
  AVG_BLOCK_TIME_SECONDS,
  type CountdownStatus,
} from "@/lib/olympia-countdown";
import { useBlockStats } from "@/lib/hooks/use-block-stats";

export function CountdownBanner() {
  const { data: blockStats } = useBlockStats();

  const currentBlock = blockStats?.currentBlock ?? null;

  const status: CountdownStatus = useMemo(() => {
    if (OLYMPIA_ACTIVATION_BLOCK === null) return "tbd";
    if (currentBlock !== null && currentBlock >= OLYMPIA_ACTIVATION_BLOCK)
      return "activated";
    return "pending";
  }, [currentBlock]);

  const initialSeconds = useMemo(() => {
    if (
      status !== "pending" ||
      OLYMPIA_ACTIVATION_BLOCK === null ||
      currentBlock === null
    )
      return null;
    return (OLYMPIA_ACTIVATION_BLOCK - currentBlock) * AVG_BLOCK_TIME_SECONDS;
  }, [status, currentBlock]);

  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  const tick = useCallback(() => {
    setRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, tick]);

  if (status === "tbd") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-brand-green/30 bg-brand-green/5 px-4 py-3">
        <Clock className="h-4 w-4 text-brand-green" />
        <span className="text-sm text-text-muted">
          The Mordor Testnet and Ethereum Classic Mainnet activation blocks will be announced on the Olympia Upgrade core developers call.{" "}
          <a
            href="https://olympiadao.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green transition hover:opacity-80"
          >
            Learn more →
          </a>
        </span>
      </div>
    );
  }

  if (status === "activated") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border-brand bg-brand-green-subtle px-4 py-3">
        <span className="text-sm font-medium text-brand-green">
          Olympia is Live — BaseFee revenue is now flowing to the treasury.
        </span>
      </div>
    );
  }

  if (remaining === null) return null;

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-brand-treasury/30 bg-brand-treasury/5 px-4 py-3">
      <Clock className="h-4 w-4 text-brand-treasury" />
      <span className="text-sm font-medium text-brand-treasury">
        Olympia in
      </span>
      <span className="font-mono text-sm text-brand-treasury">
        {days}d {String(hours).padStart(2, "0")}h{" "}
        {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
      </span>
      <a
        href="https://olympiadao.org/upgrade"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto text-xs text-brand-treasury transition hover:opacity-80"
      >
        Upgrade guide →
      </a>
    </div>
  );
}
