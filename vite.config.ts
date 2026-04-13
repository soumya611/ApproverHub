import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || "https://localhost:44303/";

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy) => {
            (proxy as { on: (e: string, h: (...a: unknown[]) => void) => void }).on('proxyReq', (_p: unknown, req: unknown) => {
              console.log('Sending Request to the Target:', (req as { method?: string; url?: string }).method, (req as { url?: string }).url);
            });
            (proxy as { on: (e: string, h: (...a: unknown[]) => void) => void }).on('proxyRes', (proxyRes: unknown, req: unknown) => {
              console.log('Received Response from the Target:', (proxyRes as { statusCode?: number }).statusCode, (req as { url?: string }).url);
            });
          },
        },
      },
    },
  };
});
