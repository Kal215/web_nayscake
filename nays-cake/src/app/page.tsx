import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { AboutSection } from "@/components/landing/about-section";
import { ProductsSection } from "@/components/landing/products-section";
import { Footer } from "@/components/landing/footer";
import { prisma } from "@/lib/prisma";

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { supplier: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.sellingPrice),
    stock: 0, // Will be calculated from stock entries
    supplier: product.supplier.name,
    imageUrl: product.imageUrl,
  }));
}

async function getStats() {
  const [products, suppliers] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } }),
  ]);

  return {
    products,
    suppliers,
    customers: 1000, // Default value
  };
}

export default async function HomePage() {
  const products = await getProducts();
  const stats = await getStats();

  return (
    <main className="min-h-screen">
      <HeroSection />
      <StatsSection stats={stats} />
      <AboutSection />
      <ProductsSection initialProducts={products} />
      <Footer />
    </main>
  );
}
