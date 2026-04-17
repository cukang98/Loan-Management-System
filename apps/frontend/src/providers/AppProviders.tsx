'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export type Locale = 'zh' | 'en';

const LOCALE_KEY = 'ck_loan_locale';

export const LocaleContext = React.createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: 'zh', setLocale: () => {} });

export const useLocale = () => React.useContext(LocaleContext);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh');
  const [messages, setMessages] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const stored = (localStorage.getItem(LOCALE_KEY) as Locale) || 'zh';
    setLocale(stored);
  }, []);

  useEffect(() => {
    import(`@/messages/${locale}.json`).then((m) => setMessages(m.default));
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  const antLocale = locale === 'zh' ? zhCN : enUS;

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ConfigProvider
          locale={antLocale}
          theme={{
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 8,
              fontFamily:
                locale === 'zh'
                  ? '"PingFang SC", "Microsoft YaHei", sans-serif'
                  : 'Inter, sans-serif',
            },
          }}
        >
          <AntApp>
            <AuthProvider>
              <LocaleContext.Provider value={{ locale, setLocale }}>
                {children}
              </LocaleContext.Provider>
            </AuthProvider>
          </AntApp>
        </ConfigProvider>
      </NextIntlClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
