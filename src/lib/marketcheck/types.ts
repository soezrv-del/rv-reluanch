/** Client-safe MarketCheck listing card (no raw API dump). */
export type McListingCard = {
  id: string;
  heading: string;
  price: number | null;
  miles: number | null;
  msrp: number | null;
  year: number | null;
  make: string;
  model: string;
  trim: string;
  classLabel: string;
  stockNo: string;
  vin: string;
  inventoryType: string;
  distanceMi: number | null;
  city: string;
  state: string;
  dealerName: string;
  dealerPhone: string;
  photoUrl: string | null;
  vdpUrl: string | null;
};

export type McYearRange = { min: number; max: number };

export type McSearchQuery = {
  year: string | null;
  make: string;
  model: string;
  /** Inclusive MarketCheck `year_range` actually sent (or exact year as min=max). */
  yearRange: McYearRange;
  /** Present when inventory was scoped to one lot. */
  dealerId?: string | null;
};

export type McSearchResult = {
  ok: true;
  numFound: number;
  listings: McListingCard[];
  radius: number;
  zip: string;
  query: McSearchQuery;
  cached: boolean;
  medianPrice: number | null;
};

export type McSearchError = {
  ok: false;
  error: string;
  code?: "missing_key" | "bad_request" | "upstream" | "empty";
};

/** Free-tier RV autocomplete fields we proxy. ZIP is numeric — use city for place hints. */
export type McAutocompleteField = "make" | "model" | "city";

export type McAutocompleteTerm = {
  term: string;
  count: number | null;
};

export type McAutocompleteResult = {
  ok: true;
  field: McAutocompleteField;
  input: string;
  terms: McAutocompleteTerm[];
  cached: boolean;
};

export type McDealerCard = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  listingCount: number | null;
  distanceMi: number | null;
  inventoryUrl: string | null;
};

export type McDealersResult = {
  ok: true;
  numFound: number;
  dealers: McDealerCard[];
  radius: number;
  zip: string;
  cached: boolean;
};

/** Full listing — fetch only when the user opens a shortlisted card. */
export type McListingDetail = McListingCard & {
  dealerId: string;
  dealerStreet: string;
  dealerZip: string;
  sellerType: string;
  exteriorColor: string;
  interiorColor: string;
  fuelType: string;
  transmission: string;
  photoUrls: string[];
  description: string;
};

export type McListingResult = {
  ok: true;
  listing: McListingDetail;
  cached: boolean;
};
