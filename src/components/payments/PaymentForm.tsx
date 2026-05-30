//src/components/payments/PaymentForm.tsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDownToLine, ArrowRightLeft, ArrowUpFromLine } from "lucide-react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { User } from "../../types";
import {
  createStripeCheckoutSession,
  transferFunds,
  withdrawFunds,
} from "../../services/paymentService";
import { getEntrepreneurs, getInvestors } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

interface PaymentFormProps {
  onUpdated: () => void;
}

type PaymentTab = "deposit" | "withdraw" | "transfer";

export const PaymentForm: React.FC<PaymentFormProps> = ({ onUpdated }) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<PaymentTab>("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [toUser, setToUser] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data =
          user?.role === "entrepreneur"
            ? await getInvestors()
            : await getEntrepreneurs();

        setUsers(data.users || []);
      } catch {
        toast.error("Failed to load transfer users");
      }
    };

    loadUsers();
  }, [user?.role]);

  const resetForm = () => {
    setAmount("");
    setNote("");
    setToUser("");
  };

  const validateAmount = () => {
    const finalAmount = Number(amount);

    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return null;
    }

    return finalAmount;
  };

  const handleDeposit = async () => {
    const finalAmount = validateAmount();
    if (!finalAmount) return;

    try {
      setIsSubmitting(true);

      const data = await createStripeCheckoutSession({
        amount: finalAmount,
        note: note || "Stripe sandbox wallet deposit",
      });

      toast.success("Redirecting to Stripe Checkout");
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create Stripe session",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const finalAmount = validateAmount();
    if (!finalAmount) return;

    try {
      setIsSubmitting(true);

      await withdrawFunds({
        amount: finalAmount,
        note: note || "Mock withdrawal",
      });

      toast.success("Withdrawal completed");
      resetForm();
      onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    const finalAmount = validateAmount();
    if (!finalAmount) return;

    if (!toUser) {
      toast.error("Please select a receiver");
      return;
    }

    try {
      setIsSubmitting(true);

      await transferFunds({
        amount: finalAmount,
        toUser,
        note: note || "Wallet transfer",
      });

      toast.success("Transfer completed");
      resetForm();
      onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (activeTab === "deposit") handleDeposit();
    if (activeTab === "withdraw") handleWithdraw();
    if (activeTab === "transfer") handleTransfer();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={activeTab === "deposit" ? "primary" : "outline"}
          size="sm"
          leftIcon={<ArrowDownToLine size={16} />}
          onClick={() => setActiveTab("deposit")}
        >
          Deposit
        </Button>

        <Button
          type="button"
          variant={activeTab === "withdraw" ? "primary" : "outline"}
          size="sm"
          leftIcon={<ArrowUpFromLine size={16} />}
          onClick={() => setActiveTab("withdraw")}
        >
          Withdraw
        </Button>

        <Button
          type="button"
          variant={activeTab === "transfer" ? "primary" : "outline"}
          size="sm"
          leftIcon={<ArrowRightLeft size={16} />}
          onClick={() => setActiveTab("transfer")}
        >
          Transfer
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount"
          type="number"
          min="1"
          step="0.01"
          placeholder="25"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />

        {activeTab === "transfer" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receiver
            </label>
            <select
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select user</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.role}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Note"
          placeholder={
            activeTab === "deposit"
              ? "Stripe sandbox deposit"
              : activeTab === "withdraw"
              ? "Withdrawal note"
              : "Transfer note"
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
          fullWidth
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          {activeTab === "deposit"
            ? "Continue to Stripe Checkout"
            : activeTab === "withdraw"
            ? "Withdraw Funds"
            : "Transfer Funds"}
        </Button>

        {activeTab === "deposit" && (
          <p className="text-xs text-gray-500">
            You will be redirected to Stripe test checkout. Use card
            4242 4242 4242 4242 with any future expiry and CVC.
          </p>
        )}
      </form>
    </div>
  );
};