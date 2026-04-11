import LedgerList from "@/components/ledger-list";
import { checkUserSession } from "@/lib/validation-utils";

export default async function HomePage() {
  const user = await checkUserSession();

  return (
    <div className="flex flex-col gap-6 p-8">
      <p className="text-lg font-bold">Welcome back, {user.email}</p>
      <LedgerList />
    </div>
  );
}
