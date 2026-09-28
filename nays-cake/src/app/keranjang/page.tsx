import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function KeranjangPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-12 pb-[100px]">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-gray-900 font-semibold mb-2">Keranjang masih kosong</h2>
        <p className="text-gray-500 text-sm mb-6">Yuk, lihat-lihat kue di katalog dan mulai berbelanja!</p>
        <a href="/catalog" className="inline-block bg-black text-white font-semibold px-6 py-3 rounded-xl active:bg-gray-800">
          Lihat Katalog
        </a>
      </div>
    </div>
  );
}
