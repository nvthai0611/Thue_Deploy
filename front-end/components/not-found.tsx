import Image from "next/image";
import notFound from "@/assets/not-found.png";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Image
        src={notFound}
        alt="Not Found"
        width={440}
        height={440}
        className="mb-6"
        priority
      />
      <h1 className="text-3xl font-bold mb-4 text-destructive">
        404 - Not Found
      </h1>
      <p className="text-muted-foreground mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
      >
        Go Home
      </a>
    </div>
  );
}
