import logoSrc from "../../../logo/KerjaIn.png";
import logoDarkSrc from "../../../logo/Kerjain White Pink.png";
import logoTukangSrc from "../../../logo/KerjaIn-tukang-outlined.png";
import { cn } from "./ui/utils";

type BrandLogoProps = {
  className?: string;
  imgClassName?: string;
  variant?: "default" | "dark" | "tukang";
  withPlate?: boolean;
};

export function BrandLogo({
  className,
  imgClassName,
  variant = "default",
  withPlate = false,
}: BrandLogoProps) {
  const src =
    variant === "dark" ? logoDarkSrc : variant === "tukang" ? logoTukangSrc : logoSrc;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center",
        withPlate && "rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-white/30",
        className
      )}
    >
      <img
        src={src}
        alt="KerjaIn"
        className={cn("h-8 w-auto object-contain", imgClassName)}
      />
    </span>
  );
}
