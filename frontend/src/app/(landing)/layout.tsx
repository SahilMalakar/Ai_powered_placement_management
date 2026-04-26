import { NavabarLanding } from "@/components/layout/NavabarLanding";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavabarLanding />
      <main className="flex-1 container mx-auto px-4 md:px-8">
        {children}
      </main>
    </>
  );
}
