import type { ImgHTMLAttributes } from "react";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  quality?: number | string;
}

export function Image({
  fill,
  priority,
  quality,
  className,
  style,
  ...props
}: ImageProps) {
  const combinedClassName = fill
    ? `absolute inset-0 size-full object-cover ${className ?? ""}`
    : className;

  return (
    <img
      {...props}
      alt={props.alt}
      loading={priority ? "eager" : "lazy"}
      className={combinedClassName}
      style={style}
    />
  );
}
