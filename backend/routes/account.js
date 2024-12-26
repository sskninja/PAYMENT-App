const express = require("express");
const authMiddleware = require("../middleware");
const { Account, User } = require("../db");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      userId: req.userId,
    });

    const user = await User.findOne({
      _id: req.userId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.json({
      balance: account.balance,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { to, amount } = req.body;

    // Find the sender's account
    const account = await Account.findOne({ userId: req.userId }).session(
      session
    );
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Insufficient Balance" });
    }

    // Find the recipient's account
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Invalid Account" });
    }

    // Update the balances
    await Account.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { balance: -amount } },
      { session }
    );

    await Account.findOneAndUpdate(
      { userId: to },
      { $inc: { balance: amount } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    res.json({ msg: "Transfer Successful" });
  } catch (error) {
    // Abort the transaction in case of error
    res.status(500).json({ msg: "Transfer Failed", error: error.message });
    await session.abortTransaction();
  } finally {
    // End the session
    session.endSession();
  }
});

module.exports = router;
