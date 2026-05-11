import Groq from "groq-sdk";
import env from "./env";

const groq = new Groq({
  apiKey: env.groqApiKey,
});

export default groq;
