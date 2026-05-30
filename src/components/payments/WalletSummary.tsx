//src/components/payments/WalletSummary.tsx

import React from "react";
import { CreditCard, Wallet } from "lucide-react";
import { Card, CardBody } from "../ui/Card";

interface WalletSummaryProps {
  balance: number;
  currency: string;
  transactionCount: number;
}

export const WalletSummary: React.FC<WalletSummaryProps> = ({
  balance,
  currency,
  transactionCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-50">
              <Wallet size={24} className="text-primary-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {currency} {balance.toFixed(2)}
              </h3>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-success-50">
              <CreditCard size={24} className="text-success-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Stripe Mode</p>
              <h3 className="text-lg font-semibold text-gray-900">
                Sandbox / Test
              </h3>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div>
            <p className="text-sm text-gray-500">Transactions</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {transactionCount}
            </h3>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};