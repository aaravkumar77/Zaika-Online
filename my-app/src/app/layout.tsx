import type { Metadata } from "next";
import "./styles/globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "Zaika Online",
  description: "Fresh restaurant discovery and food ordering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <ToastProvider />
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Chatbot />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
