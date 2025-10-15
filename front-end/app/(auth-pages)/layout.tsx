import Image from "next/image";
import bg from "@/assets/background.png";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {/* Background image */}
      <Image
        src={bg}
        alt="Background"
        fill
        className="object-cover absolute -z-10"
        priority
      />
      {/* Content */}
      {children}
    </main>
  );
}
