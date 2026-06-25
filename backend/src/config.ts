import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/auth/google/callback",
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID ?? "",
    appSecret: process.env.FACEBOOK_APP_SECRET ?? "",
    redirectUri: process.env.FACEBOOK_REDIRECT_URI ?? "http://localhost:3000/auth/facebook/callback",
  },
  email: {
    from: process.env.EMAIL_FROM ?? "KerjaIn <onboarding@resend.dev>",
    resendApiKey: process.env.RESEND_API_KEY ?? "",
  },
};
