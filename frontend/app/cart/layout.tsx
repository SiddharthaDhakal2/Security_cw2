import Header from "../(navigation)/Header";
import Footer from "@/components/Footer";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="pt-16 bg-white min-h-screen">{children}</div>
      <Footer />
    </>
  );
}
