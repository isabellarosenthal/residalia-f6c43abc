import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#D9A441" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Altura Cloud" },
      { title: "Altura Cloud — Administración de condominios y CRM inmobiliario" },
      { name: "description", content: "Plataforma unificada de administración de condominios y CRM inmobiliario para Centroamérica." },
      { property: "og:title", content: "Altura Cloud — Administración de condominios y CRM inmobiliario" },
      { name: "twitter:title", content: "Altura Cloud — Administración de condominios y CRM inmobiliario" },
      { property: "og:description", content: "Plataforma unificada de administración de condominios y CRM inmobiliario para Centroamérica." },
      { name: "twitter:description", content: "Plataforma unificada de administración de condominios y CRM inmobiliario para Centroamérica." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1b328cfd-1a75-40a0-82a4-b60f0c73a3e2/id-preview-c0420488--4483652c-7696-4809-9096-aeebc66abb7e.lovable.app-1780106634884.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1b328cfd-1a75-40a0-82a4-b60f0c73a3e2/id-preview-c0420488--4483652c-7696-4809-9096-aeebc66abb7e.lovable.app-1780106634884.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#173B7A", color: "#F8FAFC", borderRadius: "12px" },
            success: { iconTheme: { primary: "#166534", secondary: "#fff" } },
            error: { iconTheme: { primary: "#be185d", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
