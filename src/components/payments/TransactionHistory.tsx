//src/components/payments/TransactionHistory.tsx
import React from "react";
import { ArrowDownToLine, ArrowRightLeft, ArrowUpFromLine } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Transaction } from "../../types";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const getStatusVariant = (status: Transaction["status"]) => {
  if (status === "completed") return "success";
  if (status === "failed") return "error";
  return "warning";
};

const getTypeIcon = (type: Transaction["type"]) => {
  if (type === "deposit") return <ArrowDownToLine size={18} />;
  if (type === "withdraw") return <ArrowUpFromLine size={18} />;
  return <ArrowRightLeft size={18} />;
};

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
}) => {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500">No transactions yet.</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              {getTypeIcon(transaction.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 capitalize">
                  {transaction.type}
                </h3>

                <Badge variant={getStatusVariant(transaction.status) as any} size="sm">
                  {transaction.status}
                </Badge>

                <Badge variant="secondary" size="sm">
                  {transaction.provider}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {transaction.currency} {transaction.amount.toFixed(2)}
              </p>

              {transaction.note && (
                <p className="text-xs text-gray-500 mt-1">
                  {transaction.note}
                </p>
              )}

              {transaction.fromUser && (
                <p className="text-xs text-gray-500 mt-1">
                  From: {transaction.fromUser.name}
                </p>
              )}

              {transaction.toUser && (
                <p className="text-xs text-gray-500 mt-1">
                  To: {transaction.toUser.name}
                </p>
              )}

              {transaction.failureReason && (
                <p className="text-xs text-error-600 mt-1">
                  Reason: {transaction.failureReason}
                </p>
              )}

              <div className="text-xs text-gray-400 mt-2">
                <p>Reference: {transaction.reference}</p>
                <p>{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};