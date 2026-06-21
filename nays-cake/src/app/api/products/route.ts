import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - Get all products with stock info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const supplier = searchParams.get("supplier") || "";

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (supplier) {
      where.supplier = { name: supplier };
    }

    // Get products with supplier info and calculate current stock
    const products = await prisma.product.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Calculate current stock for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        // Total stock in
        const totalStockIn = await prisma.stockEntry.aggregate({
          where: { productId: product.id },
          _sum: { quantityIn: true },
        });

        // Total sold
        const totalSold = await prisma.saleItem.aggregate({
          where: { productId: product.id },
          _sum: { quantity: true },
        });

        const currentStock =
          (totalStockIn._sum.quantityIn || 0) -
          (totalSold._sum.quantity || 0);

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sellingPrice: Number(product.sellingPrice),
          costPrice: Number(product.costPrice),
          category: product.category,
          supplier: product.supplier.name,
          supplierId: product.supplierId,
          stock: Math.max(0, currentStock),
          minStock: product.minStock,
          isAvailable: currentStock > 0,
          imageUrl: product.imageUrl,
        };
      })
    );

    // Get unique categories
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

    // Get unique suppliers with IDs
    const supplierMap = new Map();
    products.forEach((p) => {
      if (!supplierMap.has(p.supplierId)) {
        supplierMap.set(p.supplierId, {
          id: p.supplierId,
          name: p.supplier.name,
        });
      }
    });
    const suppliers = Array.from(supplierMap.values());

    return NextResponse.json({
      products: productsWithStock,
      categories,
      suppliers,
      total: productsWithStock.length,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, costPrice, sellingPrice, category, supplierId, imageUrl } = body;

    // Validate required fields
    if (!name || !costPrice || !sellingPrice || !supplierId) {
      return NextResponse.json(
        { error: "Name, cost price, selling price, and supplier are required" },
        { status: 400 }
      );
    }

    // Generate a unique slug
    const slug =
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now().toString(36);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        costPrice,
        sellingPrice,
        category,
        supplierId,
        imageUrl,
      },
      include: {
        supplier: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
