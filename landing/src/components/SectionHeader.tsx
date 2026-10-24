import type { ReactNode } from 'react';

type SectionHeaderProps = {
  id: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
};

export function SectionHeader({ id, kicker, title, children }: SectionHeaderProps) {
  return (
    <header className="lp-section-header">
      <span className="hx-label">{kicker}</span>
      <h2 id={id} className="lp-h2">{title}</h2>
      {children && <p className="lp-lead">{children}</p>}
    </header>
  );
}
