import Image from "next/image";

export function SpringsLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/the-springs-logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full bg-white object-contain shadow-sm"
    />
  );
}
