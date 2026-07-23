import Header from "@/app/(navigation)/Header";
import Footer from "@/components/Footer";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-14 min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
