
import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import DashCodeLogo from '@/components/dascode-logo';
const config: DocsThemeConfig = {
  logo: (
    <span className=" inline-flex gap-2.5 items-center">
      <DashCodeLogo className="  text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
      <span className="  text-lg font-bold text-default ">APT</span>
    </span>
  ),
  project: {
    link: "https://github.com/shuding/nextra",
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href="/dashboard" target="_blank">
        🎉 APT
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://github.com/Kelll31" target="_blank">
          kelll31
        </a>
        .
      </span>
    ),
  },
  themeSwitch: {
    useOptions() {
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System', // Add this line
      };
    },
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – APT",
    };
  },
};

export default config