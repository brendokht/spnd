"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Ledger {
  id: string;
  name: string;
  currency: string;
  transactionCount: number;
  balance: number;
}

//Test component to ensure the ledger schema works and we can fetch data from the API
export default function LedgerList() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLedgers() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ledgers`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );

      if (!res.ok) {
        setError("Failed to fetch ledgers");
        return;
      }

      setLedgers(await res.json());
    }

    fetchLedgers();
  }, []);

  if (error) return <p className="text-sm text-red-500">{error}</p>;

  if (ledgers.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {ledgers.map((ledger) => (
        <li
          key={ledger.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <p className="font-medium">{ledger.name}</p>
            <p className="text-sm text-gray-500">
              {ledger.transactionCount} transaction
              {ledger.transactionCount !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="font-mono font-semibold">
            {ledger.balance >= 0 ? "+" : ""}
            {ledger.balance.toFixed(2)} {ledger.currency}
          </p>
        </li>
      ))}
    </ul>
  );
}
