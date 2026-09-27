import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  GitCompare,
  Heart,
  Loader2,
  MapPin,
  MoreHorizontal,
  Store,
  Printer,
  Sparkles,
  Truck,
} from "lucide-react";
import type { RVResult } from "@/lib/rv/catalog";
import {
  estimateMarket,
  floorplansForSelectedYear,
  formatMoney,
  getFloorplansForYear,
  relatedModelsWithFloorplansInYear,
  sourcedFloorplansByYear,
  yearsWithSourcedFloorplans,
  useCatalogReady,
} from "@/lib/rv/catalog";
import {
  bestCalPrice,
  formatActiveCoachChip,
  formatActiveCoachShort,
  snapshotActiveCoach,
} from "@/lib/rv/activeCoach";
import { offerFromFactsReport } from "@/lib/tow/factsTowHandoff";
import {
  getRatingMetadata,
  ratingStars,
} from "@/lib/rv/ratingSystem";
import {
  computeTorqueToWeight,
  formatTorqueWeightBasisChip,
  isSeriesGvwrEstimate,
} from "@/lib/rv/torqueToWeight";
import {
  OWNER_REVIEW_FOOTER,
  formatOwnerReviewScore,
  mapReportRatings,
} from "@/lib/rv/reportRatings";
import { hasConcreteFloorplan } from "@/lib/rv/factsOpen";
import { buildFactsBrochureSpecs } from "@/lib/rv/factsSheet";
import { motorhomeOmits } from "@/lib/rv/brochureSpecs";
import { fetchLotSnapshot } from "@/lib/lot/ownLotPage";
import { registerLotCatalogUnits } from "@/lib/rv/lotCatalogUnits";
import {
  catalogSnapshotFromBrochure,
  displayFromPainted,
  emptySpecFields,
  fetchSpecFieldFallback,
  resolveSharedSpecPaint,
  type SpecFieldFill,
} from "@/lib/rv/specEngine";
import {
  clearWeightField,
  findWeightOverride,
  saveWeightOverride,
} from "@/lib/rv/weightOverrides";
import {
  findPowertrainCorrection,
  sanitizeNarrativeForPin,
} from "@/lib/rv/powertrainCorrections";
import {
  resolveHardPowertrain,
  type PowertrainTrust,
} from "@/lib/rv/livePowertrainGuard";
import {
  formatFactsHorsepower,
  formatFactsTorque,
  omitInventPolicyProse,
} from "@/lib/rv/catalogHonesty";
import {
  findLocalSpecOverride,
  removeLocalSpecOverride,
  saveLocalSpecOverride,
} from "@/lib/rv/localSpecOverrides";
import { getMaintenanceSchedule } from "@/lib/rv/rvTypes";
import { getMockReviews } from "@/lib/rv/rvReviews";
import {
  fetchLiveDossier,
  liveMarketLadder,
  mergeLiveIntoDisplay,
  peekVerifiedDossier,
  refreshCoachDossierCache,
  type LiveDossier,
} from "@/lib/rv/liveDossier";
import { planFactsDossierResearch } from "@/lib/rv/factsDossierGapPlan";
import {
  factsDetailFieldSearching,
  factsDetailSearchingFields,
} from "@/lib/rv/factsDetailGapSpinners";
import {
  CATALOG_ESTIMATE_LABEL,
  LOW_CONFIDENCE_LISTINGS_MESSAGE,
  PUBLIC_SOLD_DISCLAIMER,
  SOLD_COMPS_LABEL,
  compsConfidenceLabel,
  prefersPublicComps,
  resolvePrimaryMarket,
  thinSoldAskUsd,
  type PublicListingComps,
} from "@/lib/rv/publicListingComps";
import {
  isJdPowerMarketSource,
  type JdPowerPublicEstimate,
} from "@/lib/rv/jdPowerPublic";
import { hideRetailHighForDesk } from "@/lib/rv/marketClamp";
import { paintFactsLowDeskMarket } from "@/lib/rv/marketEstimate";
import {
  CATALOG_GAP_LABEL,
  FACTS_MARKET_ERROR_MESSAGE,
  FACTS_MARKET_IDLE_HEADLINE,
  FACTS_MARKET_LOADING_MESSAGE,
  factsMarketAverageCaption,
  factsMarketAverageUsd,
  factsMarketIsThinSample,
  fetchFactsMarketLive,
  type FactsMarketLiveStatus,
} from "@/lib/rv/factsMarketBands";
import { fetchRecallsViaApi } from "@/lib/nhtsa/recalls";
import type { NhtsaComplaint, NhtsaRecall } from "@/lib/nhtsa/recalls";
import { buildReportId, valueFactors } from "@/lib/rv/reportMeta";
import { exportVehicleReport } from "@/lib/rv/exportReport";
import { hydrateShareCoachResult, kitStrengths, lifestylePitch } from "@/lib/rv/shareKit";
import { RvShareKit } from "@/components/rvshare/RvShareKit";
import {
  fetchAutocomplete,
  fetchListingDetail,
  fetchLocalInventory,
  fetchNearbyDealers,
  loadInventoryZip,
  saveInventoryZip,
} from "@/lib/marketcheck/client";
import type {
  McAutocompleteTerm,
  McDealerCard,
  McListingCard,
  McListingDetail,
  McYearRange,
} from "@/lib/marketcheck/types";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  shouldFetchAutocomplete,
} from "@/lib/marketcheck/guards";
import {
  DEFAULT_YEAR_PAD,
  medianListingPrice,
  yearRangeFromCenter,
} from "@/lib/marketcheck/yearRange";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { PullRefreshLayer } from "@/components/shell/PullResetHint";
import { SuiteRaidhoBackdrop } from "@/components/shell/SuitePage";
import { SuiteDisclaimer } from "@/components/shell/SuiteDisclaimer";
import { cn } from "@/lib/utils";
import { findOemFloorplanSpec } from "@/lib/rv/floorplanSpecs";
import { standoutFeatureChips } from "@/lib/rv/catalogFeatureChips";
import { shouldShowRvVideoPrompt } from "@/lib/rv/rvVideos";
import { RvVideoLibraryCard } from "./RvVideoLibraryCard";
import { FactsCollapse } from "./FactsCollapse";
import { FactsMarketBands } from "./FactsMarketBands";
import {
  factsInventoryHeadline,
  factsMoneyHeadline,
  factsOwnerHeadline,
  factsRecallHeadline,
  factsSpecsHeadline,
} from "@/lib/rv/factsCollapse";

/**
 * Vehicle History Report — catalog paints instantly; Live Grok updates soft fields.
 * Phase 1: year-banded powertrain always paints from the selected wizard year.
 * Brochure powertrain pins always win over Live Grok (prevents ISL/V10 hallucinations).
 */
