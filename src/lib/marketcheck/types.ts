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

export type McSearchResult = {
  ok: true;
  numFound: number;
  listings: McListingCard[];
  radius: number;
  zip: string;
  query: { year: string; make: string; model: string };
  cached: boolean;
  medianPrice: number | null;
};

export type McSearchError = {
  ok: false;
  error: string;
  code?: "missing_key" | "bad_request" | "upstream" | "empty";
};
