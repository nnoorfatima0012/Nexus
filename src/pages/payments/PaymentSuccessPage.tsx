//src/pages/payments/PaymentSuccessPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { confirmStripeCheckoutSession } from "../../services/paymentService";

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isConfirming, setIsConfirming] = useState(true);
  const [message, setMessage] = useState("Confirming Stripe payment...");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setMessage("Stripe session ID is missing.");
        setIsConfirming(false);
        return;
      }

      try {
        const data = await confirmStripeCheckoutSession(sessionId);
        setMessage(data.message || "Payment confirmed successfully.");
        toast.success("Wallet updated successfully");
      } catch (error: any) {
        setMessage(
          error.response?.data?.message || "Failed to confirm Stripe payment.",
        );
        toast.error("Payment confirmation failed");
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [sessionId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex items-center gap-2">
          <CheckCircle size={22} className="text-success-600" />
          <h1 className="text-xl font-bold text-gray-900">Payment Success</h1>
        </CardHeader>

        <CardBody className="space-y-4">
          <p className="text-gray-600">{message}</p>

          {isConfirming && (
            <p className="text-sm text-gray-500">
              Please wait while we update your wallet.
            </p>
          )}

          <Link to="/payments">
            <Button>Back to Payments</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
};