import 'bootstrap-icons/font/bootstrap-icons.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Spark — Code & Host HTML Sites',
  description: 'A simple platform for students to build, preview, and publish HTML sites.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
