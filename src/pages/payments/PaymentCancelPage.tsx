//src/pages/payments/PaymentCancelPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const PaymentCancelPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex items-center gap-2">
          <XCircle size={22} className="text-error-600" />
          <h1 className="text-xl font-bold text-gray-900">Payment Cancelled</h1>
        </CardHeader>

        <CardBody className="space-y-4">
          <p className="text-gray-600">
            Stripe checkout was cancelled. Your wallet was not charged.
          </p>

          <Link to="/payments">
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
};