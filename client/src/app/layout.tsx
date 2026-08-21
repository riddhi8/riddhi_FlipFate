import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlipFate — Decentralized Web3 Coin Flip & Fate Oracle',
  description: 'A provably fair Web3 coin flip game, cosmic fate decision oracle, and streak arena built on Stellar Soroban smart contracts.',
  keywords: ['FlipFate', 'Soroban', 'Stellar', 'Web3', 'Coin Flip', 'Crypto Game', 'Provably Fair', 'Oracle', 'DApp'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
