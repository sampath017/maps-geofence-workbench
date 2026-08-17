import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jarvis Route Editor & Geofence Workbench',
  description:
    'Visual GPS route editor and geofence verification tool for Jarvis simulation and telemetry.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text antialiased select-none">{children}</body>
    </html>
  );
}
