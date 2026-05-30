//server/src/modules/payments/payment.controller.js
const Stripe = require("stripe");

const Wallet = require("./wallet.model");
const Transaction = require("./transaction.model");
const User = require("../users/user.model");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const populateTransaction = [
  { path: "fromUser", select: "name email role avatarUrl" },
  { path: "toUser", select: "name email role avatarUrl" },
];

const generateReference = (prefix = "TXN") => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const normalizeAmount = (amount) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  return Math.round(parsedAmount * 100) / 100;
};

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      currency: "USD",
    });
  }

  return wallet;
};

const completeStripeDeposit = async (transactionId, stripeSession) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    return null;
  }

  if (transaction.status === "completed") {
    return transaction;
  }

  if (transaction.status === "failed") {
    return transaction;
  }

  const wallet = await getOrCreateWallet(transaction.toUser);

  wallet.balance = Math.round((wallet.balance + transaction.amount) * 100) / 100;
  await wallet.save();

  transaction.status = "completed";
  transaction.stripeSessionId = stripeSession.id || transaction.stripeSessionId;
  transaction.stripePaymentIntentId =
    stripeSession.payment_intent || transaction.stripePaymentIntentId;
  await transaction.save();

  return transaction;
};

const getWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id);

    return res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get wallet",
      error: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
    })
      .populate(populateTransaction)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get transactions",
      error: error.message,
    });
  }
};

const createStripeCheckoutSession = async (req, res) => {
  try {
    const { amount, note } = req.body;

    const finalAmount = normalizeAmount(amount);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid deposit amount is required",
      });
    }

    const wallet = await getOrCreateWallet(req.user._id);

    const transaction = await Transaction.create({
      type: "deposit",
      amount: finalAmount,
      currency: wallet.currency,
      status: "pending",
      provider: "stripe",
      fromUser: null,
      toUser: req.user._id,
      note: note || "Stripe sandbox deposit",
      reference: generateReference("DEP"),
    });

    const amountInCents = Math.round(finalAmount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: wallet.currency.toLowerCase(),
            product_data: {
              name: "Nexus Wallet Deposit",
              description: transaction.note,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payments/cancel`,
      metadata: {
        transactionId: transaction._id.toString(),
        userId: req.user._id.toString(),
        type: "wallet_deposit",
      },
    });

    transaction.stripeSessionId = session.id;
    await transaction.save();

    return res.status(201).json({
      success: true,
      message: "Stripe checkout session created",
      checkoutUrl: session.url,
      sessionId: session.id,
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create Stripe checkout session",
      error: error.message,
    });
  }
};

const confirmStripeCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const transactionId = session.metadata?.transactionId;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction metadata missing from Stripe session",
      });
    }

    const transaction = await Transaction.findById(transactionId).populate(
      populateTransaction
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.toUser?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to confirm this transaction",
      });
    }

    if (session.payment_status === "paid") {
      await completeStripeDeposit(transactionId, session);
    }

    const wallet = await getOrCreateWallet(req.user._id);
    const updatedTransaction = await Transaction.findById(transactionId).populate(
      populateTransaction
    );

    return res.status(200).json({
      success: true,
      message:
        session.payment_status === "paid"
          ? "Stripe payment confirmed"
          : "Stripe payment is not paid yet",
      paymentStatus: session.payment_status,
      wallet,
      transaction: updatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to confirm Stripe checkout session",
      error: error.message,
    });
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount, note } = req.body;

    const finalAmount = normalizeAmount(amount);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid withdrawal amount is required",
      });
    }

    const wallet = await getOrCreateWallet(req.user._id);

    const transaction = await Transaction.create({
      type: "withdraw",
      amount: finalAmount,
      currency: wallet.currency,
      status: "pending",
      provider: "paypal_mock",
      fromUser: req.user._id,
      toUser: null,
      note: note || "Mock withdrawal",
      reference: generateReference("WDR"),
    });

    if (wallet.balance < finalAmount) {
      transaction.status = "failed";
      transaction.failureReason = "Insufficient wallet balance";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        wallet,
        transaction,
      });
    }

    wallet.balance = Math.round((wallet.balance - finalAmount) * 100) / 100;
    await wallet.save();

    transaction.status = "completed";
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id).populate(
      populateTransaction
    );

    return res.status(200).json({
      success: true,
      message: "Withdrawal completed successfully",
      wallet,
      transaction: populatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Withdrawal failed",
      error: error.message,
    });
  }
};

const transfer = async (req, res) => {
  try {
    const { amount, toUser, note } = req.body;

    const finalAmount = normalizeAmount(amount);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid transfer amount is required",
      });
    }

    if (!toUser) {
      return res.status(400).json({
        success: false,
        message: "Receiver user is required",
      });
    }

    if (toUser === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot transfer money to yourself",
      });
    }

    const receiver = await User.findById(toUser).select("-password");

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver user not found",
      });
    }

    const senderWallet = await getOrCreateWallet(req.user._id);
    const receiverWallet = await getOrCreateWallet(toUser);

    const transaction = await Transaction.create({
      type: "transfer",
      amount: finalAmount,
      currency: senderWallet.currency,
      status: "pending",
      provider: "wallet",
      fromUser: req.user._id,
      toUser,
      note: note || "Wallet transfer",
      reference: generateReference("TRF"),
    });

    if (senderWallet.balance < finalAmount) {
      transaction.status = "failed";
      transaction.failureReason = "Insufficient wallet balance";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        wallet: senderWallet,
        transaction,
      });
    }

    senderWallet.balance =
      Math.round((senderWallet.balance - finalAmount) * 100) / 100;

    receiverWallet.balance =
      Math.round((receiverWallet.balance + finalAmount) * 100) / 100;

    await senderWallet.save();
    await receiverWallet.save();

    transaction.status = "completed";
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id).populate(
      populateTransaction
    );

    return res.status(200).json({
      success: true,
      message: "Transfer completed successfully",
      wallet: senderWallet,
      transaction: populatedTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Transfer failed",
      error: error.message,
    });
  }
};

const stripeWebhook = async (req, res) => {
  let event;

  try {
    const signature = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const transactionId = session.metadata?.transactionId;

      if (transactionId && session.payment_status === "paid") {
        await completeStripeDeposit(transactionId, session);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const transactionId = session.metadata?.transactionId;

      if (transactionId) {
        const transaction = await Transaction.findById(transactionId);

        if (transaction && transaction.status === "pending") {
          transaction.status = "failed";
          transaction.failureReason = "Stripe checkout session expired";
          await transaction.save();
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({
      received: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

module.exports = {
  getWallet,
  getTransactions,
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  withdraw,
  transfer,
  stripeWebhook,
};