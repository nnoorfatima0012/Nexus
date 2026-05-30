//src/services/paymentService.ts
import API from "./api";
import { Transaction, Wallet } from "../types";

export const getWallet = async (): Promise<{
  success: boolean;
  wallet: Wallet;
}> => {
  const response = await API.get("/payments/wallet");
  return response.data;
};

export const getTransactions = async (): Promise<{
  success: boolean;
  count: number;
  transactions: Transaction[];
}> => {
  const response = await API.get("/payments/transactions");
  return response.data;
};

export const createStripeCheckoutSession = async (payload: {
  amount: number;
  note?: string;
}): Promise<{
  success: boolean;
  message: string;
  checkoutUrl: string;
  sessionId: string;
  transaction: Transaction;
}> => {
  const response = await API.post(
    "/payments/stripe/create-checkout-session",
    payload,
  );

  return response.data;
};

export const confirmStripeCheckoutSession = async (
  sessionId: string,
): Promise<{
  success: boolean;
  message: string;
  paymentStatus: string;
  wallet: Wallet;
  transaction: Transaction;
}> => {
  const response = await API.get(
    `/payments/stripe/confirm-session/${sessionId}`,
  );

  return response.data;
};

export const withdrawFunds = async (payload: {
  amount: number;
  note?: string;
}) => {
  const response = await API.post("/payments/withdraw", payload);
  return response.data;
};

export const transferFunds = async (payload: {
  amount: number;
  toUser: string;
  note?: string;
}) => {
  const response = await API.post("/payments/transfer", payload);
  return response.data;
};