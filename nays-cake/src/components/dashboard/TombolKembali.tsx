"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function TombolKembali({ label = "Kembali" }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4"
    >
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  );
}
