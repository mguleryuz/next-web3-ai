import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <main className="flex w-full max-w-3xl flex-col items-center gap-12 sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={25}
          priority
        />
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-foreground">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js"
              className="font-medium text-foreground hover:text-foreground/80 underline underline-offset-4"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn"
              className="font-medium text-foreground hover:text-foreground/80 underline underline-offset-4"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground/10 border border-foreground/30 px-5 text-foreground backdrop-blur-sm transition-all hover:bg-foreground/20 md:w-[180px]"
            href="https://vercel.com/new?utm_source=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-xl border border-foreground/20 px-5 text-muted-foreground transition-all hover:bg-foreground/10 hover:text-foreground md:w-[180px]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
