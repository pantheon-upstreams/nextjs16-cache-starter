import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,

  cacheHandler: path.resolve(__dirname, './cache-handler.mjs'),

  cacheHandlers: {
    remote: path.resolve(__dirname, './cacheHandlers/remote-handler.mjs'),
  },

  cacheMaxMemorySize: 0,
};

export default nextConfig;
