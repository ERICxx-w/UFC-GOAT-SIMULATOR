import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UFC GOAT 拼装模拟器',
  description: '跨时代最强选手生成器',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
