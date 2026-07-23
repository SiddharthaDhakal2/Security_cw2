import type { ReactNode } from "react";
import Header from "../(navigation)/Header";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-white pt-16">
        {children}
      </main>
    </>
  );
}
