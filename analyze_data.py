import pandas as pd
import numpy as np

# Load data
df = pd.read_excel('d:/website_nay_integrasi/Stok_Barang.xlsx', sheet_name='Stok Barang')

# Forward fill supplier name
df['Nama'] = df['Nama'].ffill()

print("=" * 60)
print("LAPORAN ANALISIS DATA USAHA NAY'S CAKE")
print("=" * 60)

print("\n" + "=" * 60)
print("1. INFORMASI UMUM DATASET")
print("=" * 60)
print(f"Total baris data: {len(df)}")
print(f"Total kolom: {len(df.columns)}")
print(f"Kolom: {df.columns.tolist()}")

print("\n" + "=" * 60)
print("2. ANALISIS SUPPLIER")
print("=" * 60)
suppliers = df['Nama'].unique()
print(f"Jumlah supplier: {len(suppliers)}")
print("\nDaftar supplier:")
for i, sup in enumerate(suppliers, 1):
    count = len(df[df['Nama'] == sup])
    print(f"  {i}. {sup} ({count} produk)")

print("\n" + "=" * 60)
print("3. ANALISIS PRODUK")
print("=" * 60)
produk = df['Barang'].unique()
print(f"Jumlah produk unik: {len(produk)}")
print("\nDaftar produk:")
for i, p in enumerate(produk, 1):
    print(f"  {i}. {p}")

print("\n" + "=" * 60)
print("4. ANALISIS HARGA")
print("=" * 60)
print("\nHarga Awal (Modal):")
print(f"  Min: {df['Harga Awal'].min()}")
print(f"  Max: {df['Harga Awal'].max()}")
print(f"  Rata-rata: {df['Harga Awal'].mean():.2f}")

print("\nHarga Jual:")
print(f"  Min: {df['Harga Jual'].min()}")
print(f"  Max: {df['Harga Jual'].max()}")
print(f"  Rata-rata: {df['Harga Jual'].mean():.2f}")

print("\nMargin (%):")
print(f"  Min: {df['Margin (%)'].min():.2%}")
print(f"  Max: {df['Margin (%)'].max():.2%}")
print(f"  Rata-rata: {df['Margin (%)'].mean():.2%}")

print("\nKeuntungan per unit:")
print(f"  Min: {df['Keuntungan'].min()}")
print(f"  Max: {df['Keuntungan'].max()}")
print(f"  Rata-rata: {df['Keuntungan'].mean():.2f}")

print("\n" + "=" * 60)
print("5. ANALISIS STOK")
print("=" * 60)
print("\nBarang Masuk:")
print(f"  Total: {df['Barang Masuk'].sum()}")
print(f"  Rata-rata: {df['Barang Masuk'].mean():.2f}")
print(f"  Data tersedia: {df['Barang Masuk'].notna().sum()}")
print(f"  Data kosong: {df['Barang Masuk'].isna().sum()}")

print("\nSisa Barang:")
print(f"  Total: {df['Sisa Barang'].sum()}")
print(f"  Data tersedia: {df['Sisa Barang'].notna().sum()}")
print(f"  Data kosong: {df['Sisa Barang'].isna().sum()}")

print("\nBarang Terjual:")
print(f"  Total: {df['Barang Terjual'].sum()}")
print(f"  Data tersedia: {df['Barang Terjual'].notna().sum()}")
print(f"  Data kosong: {df['Barang Terjual'].isna().sum()}")

print("\n" + "=" * 60)
print("6. PRODUK DUPLIKAT (SAMA PADA MULTIPLE SUPPLIER)")
print("=" * 60)
produk_counts = df['Barang'].value_counts()
duplikat = produk_counts[produk_counts > 1]
print(f"Jumlah produk yang muncul lebih dari 1 kali: {len(duplikat)}")
for prod, count in duplikat.items():
    print(f"\n  '{prod}' - muncul {count}x")
    dup_rows = df[df['Barang'] == prod][['Nama', 'Harga Awal', 'Harga Jual']]
    for _, row in dup_rows.iterrows():
        print(f"    Supplier: {row['Nama']}, Modal: {row['Harga Awal']}, Jual: {row['Harga Jual']}")

print("\n" + "=" * 60)
print("7. KONSISTENSI HARGA")
print("=" * 60)
# Check if same product has different prices from different suppliers
produk_harga = {}
for _, row in df.iterrows():
    prod = row['Barang']
    harga = (row['Harga Awal'], row['Harga Jual'])
    if prod not in produk_harga:
        produk_harga[prod] = []
    produk_harga[prod].append(harga)

inconsistent = []
for prod, harga_list in produk_harga.items():
    unique_harga = set(harga_list)
    if len(unique_harga) > 1:
        inconsistent.append((prod, harga_list))

print(f"Produk dengan harga berbeda dari supplier berbeda: {len(inconsistent)}")
for prod, harga_list in inconsistent:
    print(f"\n  {prod}:")
    for harga in harga_list:
        print(f"    Modal: {harga[0]}, Jual: {harga[1]}")

print("\n" + "=" * 60)
print("8. ANALISIS LAPORAN (TANGGAL?)")
print("=" * 60)
# Check if there's any date column or pattern
print("Kolom dalam dataset:", df.columns.tolist())
print("\nTidak ada kolom tanggal yang terdeteksi.")
print("Kemungkinan laporan harian/bulanan belum terintegrasi dalam data ini.")

print("\n" + "=" * 60)
print("9. SAMPLE DATA (10 DATA PERTAMA)")
print("=" * 60)
print(df.head(10).to_string())

print("\n" + "=" * 60)
print("10. DATA DENGAN STOK (SELURUH DATA)")
print("=" * 60)
stok_data = df[df['Barang Masuk'].notna()]
print(f"Jumlah baris dengan data stok: {len(stok_data)}")
if len(stok_data) > 0:
    print(stok_data.to_string())

print("\n" + "=" * 60)
print("11. REKAP PER SUPPLIER")
print("=" * 60)
for sup in suppliers:
    sup_df = df[df['Nama'] == sup]
    print(f"\n{sup}:")
    print(f"  Jumlah produk: {len(sup_df)}")
    print(f"  Total modal: {sup_df['Harga Awal'].sum()}")
    print(f"  Total harga jual: {sup_df['Harga Jual'].sum()}")