"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/products/ImageUploadField";
import OptionSelect from "@/components/products/OptionSelect";
import ProductFormField from "@/components/products/ProductFormField";
import ProductSavedCard from "@/components/products/ProductSavedCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractApiError } from "@/lib/api/apiError";
import { CONDITION_OPTIONS, CURRENCY_OPTIONS, DEFAULT_FORM_VALUES } from "@/lib/products/productConstants";
import { createProductRequest } from "@/lib/products/productApi";
import { productSchema } from "@/lib/products/productSchema";
import type {
  ProductFieldName,
  ProductFormInput,
  ProductInput,
  ProductRecord,
} from "@/lib/products/productTypes";

/** Form for adding an eBay product listing. Validation rules live in productSchema. */
export default function ProductForm() {
  const [savedProduct, setSavedProduct] = useState<ProductRecord | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const imageUrl = watch("imageUrl");
  const imageError = errors.imageUrl?.message ?? errors.imageFileId?.message;

  // The schema transforms values (e.g. price -> cents); the server re-validates the raw
  // strings with the same schema, so we send getValues() rather than the parsed output.
  async function onSubmit(): Promise<void> {
    try {
      const product = await createProductRequest(getValues());
      setSavedProduct(product);
      reset(DEFAULT_FORM_VALUES);
      toast.success("Product saved");
    } catch (error) {
      const apiError = extractApiError(error);
      if (apiError.fieldErrors) {
        for (const [fieldName, message] of Object.entries(apiError.fieldErrors)) {
          setError(fieldName as ProductFieldName, { message });
        }
        toast.error("Please fix the highlighted fields.");
        return;
      }
      toast.error(apiError.message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <AnimatePresence mode="wait">
        {savedProduct ? (
          <ProductSavedCard
            key="saved"
            product={savedProduct}
            onAddAnother={() => setSavedProduct(null)}
          />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackagePlus className="size-5" />
                  Add product
                </CardTitle>
                <CardDescription>Enter the details of your eBay listing.</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <ProductFormField id="title" label="Listing title" error={errors.title?.message}>
                    <Input id="title" aria-invalid={Boolean(errors.title)} {...register("title")} />
                  </ProductFormField>

                  <ProductFormField id="imageName" label="Image name" error={errors.imageName?.message}>
                    <Input id="imageName" aria-invalid={Boolean(errors.imageName)} {...register("imageName")} />
                  </ProductFormField>

                  <ImageUploadField
                    imageUrl={imageUrl}
                    error={imageError}
                    onUploaded={(image) => {
                      setValue("imageUrl", image.url, { shouldValidate: true });
                      setValue("imageFileId", image.fileId, { shouldValidate: true });
                    }}
                    onRemoved={() => {
                      setValue("imageUrl", "");
                      setValue("imageFileId", "");
                    }}
                  />

                  <ProductFormField id="description" label="Description" error={errors.description?.message}>
                    <Textarea
                      id="description"
                      rows={5}
                      aria-invalid={Boolean(errors.description)}
                      {...register("description")}
                    />
                  </ProductFormField>

                  <ProductFormField id="category" label="Category" error={errors.category?.message}>
                    <Input id="category" aria-invalid={Boolean(errors.category)} {...register("category")} />
                  </ProductFormField>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProductFormField id="condition" label="Condition" error={errors.condition?.message}>
                      <Controller
                        name="condition"
                        control={control}
                        render={({ field }) => (
                          <OptionSelect
                            id="condition"
                            value={field.value}
                            options={CONDITION_OPTIONS}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </ProductFormField>

                    <ProductFormField id="currency" label="Currency" error={errors.currency?.message}>
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <OptionSelect
                            id="currency"
                            value={field.value}
                            options={CURRENCY_OPTIONS}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </ProductFormField>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <ProductFormField id="price" label="Price" error={errors.price?.message}>
                      <Input
                        id="price"
                        inputMode="decimal"
                        aria-invalid={Boolean(errors.price)}
                        {...register("price")}
                      />
                    </ProductFormField>

                    <ProductFormField id="shippingCost" label="Shipping cost" error={errors.shippingCost?.message}>
                      <Input
                        id="shippingCost"
                        inputMode="decimal"
                        aria-invalid={Boolean(errors.shippingCost)}
                        {...register("shippingCost")}
                      />
                    </ProductFormField>

                    <ProductFormField id="quantity" label="Quantity" error={errors.quantity?.message}>
                      <Input
                        id="quantity"
                        inputMode="numeric"
                        aria-invalid={Boolean(errors.quantity)}
                        {...register("quantity")}
                      />
                    </ProductFormField>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {isSubmitting ? "Saving…" : "Save product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}