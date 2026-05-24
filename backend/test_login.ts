import mongoose from "mongoose";
import env from "./src/config/env";
import { User } from "./src/models/User";
import { login } from "./src/controllers/authController";
import express from "express";

async function run() {
  await mongoose.connect(env.mongoUri);
  
  const req = {
    body: {
      email: "P83107",
      password: "Qwertyuiop"
    }
  } as any;
  
  const res = {
    status: (code: number) => ({
      json: (data: any) => {
        console.log("Status:", code, "Data:", data);
        process.exit(0);
      }
    }),
    json: (data: any) => {
      console.log("Status: 200, Data:", data);
      process.exit(0);
    }
  } as any;

  await login(req, res);
}
run();
