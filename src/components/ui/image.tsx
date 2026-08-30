import type { ImageProps } from "next/image";

import NextImage from "next/image";

export function Image({ ...props }: ImageProps) {
  return <NextImage {...props} />;
}
