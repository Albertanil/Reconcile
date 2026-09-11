import type { Metadata } from 'next';
import '@frontend/index.css';
import { ApplicationProvider } from '@/context/ApplicationContext';

export const metadata: Metadata = {
  title: 'Reconcile — Department of Interpersonal Affairs',
  description: 'Apology Verification Bureau — Official Remorse Assessment System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApplicationProvider>
          {children}
        </ApplicationProvider>
      </body>
    </html>
  );
}
