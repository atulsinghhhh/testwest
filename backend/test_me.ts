import mongoose from "mongoose";
import env from "./src/config/env";
import { User } from "./src/models/User";
import { login, me } from "./src/controllers/authController";
import express from "express";

async function run() {
  await mongoose.connect(env.mongoUri);
  
  let userToken = "";
  
  const req = {
    body: {
      email: "P83107",
      password: "Qwertyuiop"
    }
  } as any;
  
  const res = {
    status: (code: number) => ({
      json: (data: any) => {
        console.log("Login Status:", code, "Data:", data);
        if (data.token) userToken = data.token;
      }
    }),
    json: (data: any) => {
      console.log("Login Status: 200, Token:", data.token);
      if (data.token) userToken = data.token;
    }
  } as any;

  await login(req, res);
  
  console.log("Testing /me with token", userToken);
  
  const payload = require("jsonwebtoken").verify(userToken, env.jwtSecret);
  console.log("JWT Payload:", payload);
  
  const meReq = {
    user: await User.findById(payload.userId)
  } as any;
  
  const meRes = {
    status: (code: number) => ({
      json: (data: any) => {
        console.log("Me Status:", code, "Data:", data);
        process.exit(0);
      }
    }),
    json: (data: any) => {
      console.log("Me Status: 200, Role:", data.role);
      process.exit(0);
    }
  } as any;
  
  await me(meReq, meRes);
}
run();
