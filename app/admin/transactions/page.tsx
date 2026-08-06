import { getAdminTransactions } from "./actions";
import { TransactionsClient } from "./_components/transactions-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Transactions | Admin Panel",
  description: "View and manage all form registration payment transactions, view receipts, and export data.",
};

export default async function AdminTransactionsPage() {
  const result = await getAdminTransactions();
  const transactions = result.data || [];

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-2 py-3 sm:py-6 max-w-8xl">
      <PageHeader
        title="Transactions"
        description="Manage all form registration payment transactions. View receipts and export data."
        showBackButton={false}
      />

      <div className="mt-6 sm:mt-8">
        <TransactionsClient initialTransactions={transactions} />
      </div>
    </div>
  );
}
