import type { LinkProps as NextLinkProps } from "next/link";
import type { ReactNode } from "react";

import { default as NextLink } from "next/link";

interface Props
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, NextLinkProps {
  children: ReactNode;
  href: string;
}

export function Link({ children, href, ...props }: Props) {
  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  );
}
