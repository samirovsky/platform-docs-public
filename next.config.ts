/** @type {import('next').NextConfig} */
import createMDX from '@next/mdx';
import path from 'path';
import { NextConfig } from 'next';
import { redirects } from './redirect';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: false,
  },




  rewrites: async () => {
    return [
      {
        source: '/getting-started/introduction',
        destination: '/',
      },
      {
        source: '/api',
        destination: '/api/endpoint/chat',
      },
    ];
  },
  async redirects() {
    return redirects;
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    jsx: true,
    jsxImportSource: 'react',
    remarkPlugins: [
      path.join(process.cwd(), 'src/plugins/remark-audio.mjs'),
      'remark-directive',
      'remark-frontmatter',
      ['remark-mdx-frontmatter', { name: '_fm' }],
      'remark-gfm',
      [path.join(process.cwd(), 'src/plugins/remark-og-metadata.mjs'), { appDocsRoot: 'src/app/(docs)', apiBase: '/api/og' }],
      'remark-heading-id',
      path.join(process.cwd(), 'src/plugins/remark-details.mjs'),
      path.join(process.cwd(), 'src/plugins/remark-admonition.mjs'),
    ],
  },
});
export default withMDX(nextConfig);
