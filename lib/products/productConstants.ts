import type { ProductFormInput } from "@/lib/products/productTypes";

export const PRODUCT_CONDITIONS = ["new", "like_new", "used", "for_parts"] as const;
export const PRODUCT_CURRENCIES = ["USD", "EUR", "GBP", "PKR"] as const;

export const CONDITION_LABELS: Record<(typeof PRODUCT_CONDITIONS)[number], string> = {
  new: "New",
  like_new: "Like new",
  used: "Used",
  for_parts: "For parts or not working",
};

export const CONDITION_OPTIONS = PRODUCT_CONDITIONS.map((value) => ({
  value,
  label: CONDITION_LABELS[value],
}));

export const CURRENCY_OPTIONS = PRODUCT_CURRENCIES.map((value) => ({ value, label: value }));

export const IMAGE_NAME_MAX_LENGTH = 100;
export const TITLE_MAX_LENGTH = 80; // matches eBay's listing title limit
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const CATEGORY_MAX_LENGTH = 60;
export const QUANTITY_MIN = 1;
export const QUANTITY_MAX = 10_000;
export const MONEY_MAX_MAJOR_UNITS = 1_000_000;
export const CENTS_PER_MAJOR_UNIT = 100;

/** Accepts "19", "19.9" or "19.99": no negatives, at most two decimals. */
export const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
export const WHOLE_NUMBER_PATTERN = /^\d+$/;
export const IMAGE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export const DEFAULT_FORM_VALUES: ProductFormInput = {
  imageName: "",
  imageUrl: "",
  imageFileId: "",
  title: "",
  description: "",
  category: "",
  condition: "new",
  currency: "USD",
  price: "",
  shippingCost: "0",
  quantity: "1",
};