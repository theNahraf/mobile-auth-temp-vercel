import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import MobileWrapper from '@/components/MobileWrapper';

export const metadata = {
  title: 'Aakash Aggregators — Financial Services',
  description:
    'Mutual Funds, Insurance, Loans & NPS — Expert Advice at Your Fingertips. NISM Certified Advisor with 1400+ satisfied clients.',
  keywords:
    'mutual fund, SIP, insurance, loan, ITR, NPS, financial advisor, Delhi, Aakash Aggregators',
  authors: [{ name: 'Aakash Aggregators' }],
  openGraph: {
    title: 'Aakash Aggregators — Financial Services',
    description:
      'Your trusted financial advisory app powered by NISM Certified Advisor Mr. Vaneet Bansal.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <MobileWrapper>
                {children}
              </MobileWrapper>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
