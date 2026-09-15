import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { AboutSection } from "@/components/landing/about-section";
import { ProductsSection } from "@/components/landing/products-section";
import { Footer } from "@/components/landing/footer";
import { prisma } from "@/lib/prisma";
import { inventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

async function getProducts() {
  const stock = await inventory();
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
    stock: stock.get(product.id) || 0,
    supplier: product.supplier.name,
    imageUrl: product.imageUrl,
  }));
}

async function getStats() {
  const [products, suppliers, customers] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.order.groupBy({ by: ["customerPhone"], where: { customerPhone: { not: null } } }),
  ]);

  return {
    products,
    suppliers,
    customers: customers.length,
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
