import './globals.css';
import type { ReactNode } from 'react';
import ClientShell from './ClientShell';

export const metadata = {
  title: 'MLB Team Draft League',
  description: 'Snake draft of MLB teams with standings tracking'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
