"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, FileDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CONDITION_LABELS } from "@/lib/products/productConstants";
import { formatMoney } from "@/lib/products/format";
import type { ProductRecord } from "@/lib/products/productTypes";

interface ProductSavedCardProps {
  product: ProductRecord;
  onAddAnother: () => void;
}

/** Confirmation shown after a product is saved, with a PDF download of its details. */
export default function ProductSavedCard({ product, onAddAnother }: ProductSavedCardProps) {
  async function handleDownloadPdf() {
    try {
      // Loaded on demand so jsPDF is not part of the initial page bundle.
      const { downloadProductPdf } = await import("@/lib/pdf/productPdf");
      downloadProductPdf(product);
    } catch {
      toast.error("Could not generate the PDF.");
    }
  }

  const details: ReadonlyArray<readonly [string, string]> = [
    ["Price", formatMoney(product.priceInCents, product.currency)],
    ["Shipping", formatMoney(product.shippingCostInCents, product.currency)],
    ["Quantity", String(product.quantity)],
    ["Condition", CONDITION_LABELS[product.condition]],
    ["Category", product.category],
    ["Listing ID", product.id],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            Product saved
          </CardTitle>
          <CardDescription>{product.title}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-md border">
            <Image
              src={product.imageUrl}
              alt={product.imageName}
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="break-all font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button type="button" onClick={handleDownloadPdf}>
            <FileDown className="size-4" />
            Download PDF
          </Button>
          <Button type="button" variant="outline" onClick={onAddAnother}>
            <Plus className="size-4" />
            Add another
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}