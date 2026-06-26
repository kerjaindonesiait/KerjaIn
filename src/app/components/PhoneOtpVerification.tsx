import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { api } from "../../lib/api";

type Props = {
  phone: string;
  verified: boolean;
  onVerified: () => void;
  onReset: () => void;
  disabled?: boolean;
};

export function PhoneOtpVerification({ phone, verified, onVerified, onReset, disabled }: Props) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const phoneReady = phone.replace(/\D/g, "").length >= 8;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    setSent(false);
    setCode("");
    setError(null);
    setDevCode(null);
  }, [phone]);

  const sendOtp = async () => {
    if (!phoneReady || disabled) return;
    setSending(true);
    setError(null);
    setDevCode(null);
    try {
      const res = await api.sendPhoneOtp(phone);
      setSent(true);
      setCooldown(60);
      if (res.devCode) setDevCode(res.devCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async (value: string) => {
    setCode(value);
    if (value.length !== 6 || verifying) return;
    setVerifying(true);
    setError(null);
    try {
      await api.verifyPhoneOtp(phone, value);
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kode OTP salah");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 text-[13px] text-[#166534]">
        <CheckCircle size={16} className="shrink-0" />
        <span className="font-semibold">Nomor WhatsApp terverifikasi</span>
        <button type="button" onClick={onReset} className="ml-auto text-[12px] font-bold text-[#1D4196] hover:underline">
          Ubah nomor
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4">
      <p className="text-[13px] font-bold text-[#172E4D]">Verifikasi nomor WhatsApp</p>
      <p className="text-[12px] text-[#58708D]">
        Kami kirim kode 6 digit ke WhatsApp <span className="font-semibold text-[#172E4D]">+62{phone}</span>
      </p>

      {!sent ? (
        <button
          type="button"
          onClick={sendOtp}
          disabled={!phoneReady || sending || disabled || cooldown > 0}
          className="w-full bg-[#172E4D] hover:opacity-90 disabled:bg-[#D8E2F0] disabled:text-[#7890AA] text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : null}
          {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : "Kirim kode via WhatsApp"}
        </button>
      ) : (
        <>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={verifyOtp} disabled={verifying}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-11 w-11 border-2 border-[#D8E2F0] rounded-lg bg-white text-[#172E4D] font-bold"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {verifying && (
            <p className="text-center text-[12px] text-[#58708D] flex items-center justify-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Memverifikasi…
            </p>
          )}
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || cooldown > 0}
            className="w-full text-[12px] font-bold text-[#1D4196] hover:underline disabled:opacity-50"
          >
            {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : "Kirim ulang kode"}
          </button>
          {devCode && (
            <p className="text-[11px] text-[#7890AA] text-center">
              Dev OTP: <span className="font-mono font-bold text-[#172E4D]">{devCode}</span>
            </p>
          )}
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 text-[12px] text-red-600">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
