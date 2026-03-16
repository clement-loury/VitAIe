import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src="/logo.png" alt="VitAIe" width={36} height={36} className="rounded-xl" />
        <span className="font-bold text-xl text-[#1C1C2E]">VitAIe</span>
      </Link>

      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-card rounded-2xl border border-gray-100",
            headerTitle: "text-[#1C1C2E] font-bold",
            formButtonPrimary:
              "bg-[#5B2D8E] hover:bg-[#4a2478] rounded-xl text-sm font-medium",
            footerActionLink: "text-[#5B2D8E] hover:text-[#4a2478]",
          },
        }}
      />
    </div>
  );
}
