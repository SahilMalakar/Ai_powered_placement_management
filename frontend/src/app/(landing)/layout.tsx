import { Navbar } from "@/components/layout/landing/navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8">
        {children}
      </main>
    </>
  );
}
