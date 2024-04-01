import styles from './layout.module.scss';
import '@/global.scss';
import Providers from '@/lib/Providers';
import React from 'react';
import Redirecter from '@/components/utilities/Redirecter';
import AutoLogin from '@/components/utilities/AutoLogin';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'EtuUTT - Bêta',
  description: 'Site étudiant de l\'UTT',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <Providers>
        <Redirecter />
        <AutoLogin />
        <body>
          <Navbar />
          <div className={styles.page}>{children}</div>
        </body>
      </Providers>
    </html>
  );
}
