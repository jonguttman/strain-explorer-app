"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImageProps = {
  src: string;
  alt: string;
  initials: string;
};

export function ProductImage({ src, alt, initials }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-6xl font-bold text-[#d3c3a2]">{initials}</span>
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        onError={() => setHasError(true)}
      />
      {/* Fallback initials behind image */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <span className="text-6xl font-bold text-[#d3c3a2]">{initials}</span>
      </div>
    </>
  );
}

