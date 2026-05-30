//rc/pages/payments/PaymentsPage.tsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { PaymentForm } from "../../components/payments/PaymentForm";
import { TransactionHistory } from "../../components/payments/TransactionHistory";
import { WalletSummary } from "../../components/payments/WalletSummary";
import { getTransactions, getWallet } from "../../services/paymentService";
import { Transaction, Wallet } from "../../types";
import { Button } from "../../components/ui/Button";

export const PaymentsPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPayments = async () => {
    try {
      setIsLoading(true);

      const [walletData, transactionsData] = await Promise.all([
        getWallet(),
        getTransactions(),
      ]);

      setWallet(walletData.wallet);
      setTransactions(transactionsData.transactions || []);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">
            Manage Stripe deposits, withdrawals, transfers, and transaction history.
          </p>
        </div>

        <Button variant="outline" onClick={loadPayments}>
          Refresh
        </Button>
      </div>

      <WalletSummary
        balance={wallet?.balance || 0}
        currency={wallet?.currency || "USD"}
        transactionCount={transactions.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Payment Actions
            </h2>
          </CardHeader>

          <CardBody>
            <PaymentForm onUpdated={loadPayments} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Transaction History
            </h2>
            {isLoading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </CardHeader>

          <CardBody>
            <TransactionHistory transactions={transactions} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};