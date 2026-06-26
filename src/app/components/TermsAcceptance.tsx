export const TERMS_PDF_URL = "/syarat-dan-ketentuan-kerjain.pdf";

export function TermsAcceptance({
  checked,
  onChange,
  id = "terms",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 shrink-0 rounded border-[#D8E2F0] accent-[#1D4196] cursor-pointer"
      />
      <span className="text-[12px] text-[#58708D] leading-relaxed">
        Saya telah membaca dan menyetujui{" "}
        <a
          href={TERMS_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#1D4196] font-semibold hover:underline"
        >
          Syarat & Ketentuan
        </a>{" "}
        KerjaIn.
      </span>
    </label>
  );
}
