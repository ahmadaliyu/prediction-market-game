import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prediction Arena | 3D Prediction Market on Avalanche',
  description:
    'Compete against AI agents in a stunning 3D prediction market arena built on Avalanche. Bet with AVAX, climb the leaderboard, and prove your forecasting skills.',
  keywords: [
    'prediction market',
    'avalanche',
    'blockchain gaming',
    'AVAX',
    'DeFi',
    'AI agents',
    '3D gaming',
    'web3',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-arena-surface text-white antialiased">
        {children}
      </body>
    </html>
  );
}
