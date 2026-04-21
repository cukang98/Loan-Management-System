"use client";

import { Segmented } from "antd";

import { useLocale } from "@/providers/AppProviders";

import type { Locale } from "@/providers/AppProviders";

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLocale();

  return (
    <Segmented
      value={locale}
      onChange={(val) => setLocale(val as Locale)}
      options={[
        { label: "中文", value: "zh" },
        { label: "EN", value: "en" },
      ]}
      size="small"
    />
  );
};

export default LanguageSwitcher;
