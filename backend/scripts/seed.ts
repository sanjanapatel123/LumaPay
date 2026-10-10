import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Wallet from "../src/models/Wallet";

async function seedUsers(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas");

    const users = [
      {
        name: "Test User One",
        email: "user1@example.com",
        password: "UserOne@123",
      },
      {
        name: "Test User Two",
        email: "user2@example.com",
        password: "UserTwo@123",
      },
    ];

    for (const userData of users) {
      let user = await User.findOne({
        email: userData.email,
      });

      if (!user) {
        const passwordHash = await bcrypt.hash(userData.password, 12);

        user = await User.create({
          name: userData.name,
          email: userData.email,
          passwordHash,
        });

        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }

      await Wallet.updateOne(
        { userId: user._id },
        { $setOnInsert: { balancePaise: 0 } },
        { upsert: true },
      );

      console.log(`Wallet ready: ${user.email}`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedUsers();
