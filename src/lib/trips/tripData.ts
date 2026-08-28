/** Demo + structure data for RvTrips RV GPS */

export type TripCoach = {
  make: string;
  model: string;
  heightFt: number;
  lengthFt: number;
  widthFt: number;
  weightLbs: number;
};

export type TripAlert = {
  id: string;
  severity: "critical" | "caution" | "info";
  kind: string;
  title: string;
  body: string;
};

export type TripCampground = {
  id: string;
  name: string;
  miFromMidpoint: number;
  maxLengthFt: number;
  hasHookups: boolean;
  campspotUrl: string;
};

export type TripStop = {
  id: string;
  label: string;
  subtitle?: string;
};

export type TripRoute = {
  id: string;
  origin: TripStop;
  destination: TripStop;
  miles: number;
  driveHours: number;
  driveMinutes: number;
  alertCount: number;
  engine: string;
};

export const DEFAULT_COACH: TripCoach = {
  make: "American Coach",
  model: "American Dream",
  heightFt: 13.5,
  lengthFt: 45,
  widthFt: 8.5,
  weightLbs: 44000,
};

export const DEMO_ROUTE: TripRoute = {
  id: "west-to-glacier",
  origin: {
    id: "nv-mid",
    label: "Current location",
    subtitle: "I-80 corridor · NV",
  },
  destination: {
    id: "glacier",
    label: "Glacier NP, MT",
    subtitle: "Going-to-the-Sun · RV-aware staging",
  },
  miles: 1035.8,
  driveHours: 21,
  driveMinutes: 27,
  alertCount: 5,
  engine: "REAL ROUTE · OSRM",
};

export const DEMO_ALERTS: TripAlert[] = [
  {
    id: "propane",
    severity: "critical",
    kind: "PROPANE RESTRICTION",
    title: "Propane tanks OFF in tunnels",
    body: "Propane tanks must be turned OFF when entering tunnels on this route. Some park tunnels (e.g., Newfound Gap Rd, Zion–Mt Carmel) prohibit active propane.",
  },
  {
    id: "grade",
    severity: "caution",
    kind: "GRADE RESTRICTION",
    title: "Mountain grades ahead",
    body: "Your 45 ft RV will encounter mountain grades on this route. Use engine braking on descents, watch for runaway truck ramps, and verify campsite length before arrival.",
  },
  {
    id: "bridge",
    severity: "caution",
    kind: "BRIDGE RESTRICTION",
    title: "Height clearance",
    body: "Height 13.5 ft — verify tunnel and overpass clearances before entering. Most interstates are fine but local roads may not be.",
  },
  {
    id: "width",
    severity: "caution",
    kind: "WIDTH RESTRICTION",
    title: "Narrow corridors",
    body: "Width 8.5 ft — some campground roads and older bridges have width restrictions under 9 ft. Proceed cautiously on narrow approaches.",
  },
  {
    id: "length",
    severity: "info",
    kind: "LENGTH ADVISORY",
    title: "Campsite length",
    body: "45 ft coach — filter campgrounds for 50 ft+ pads. Shorts Bar and Iron Phone Junction are pre-screened on this route.",
  },
];

export const DEMO_CAMPS: TripCampground[] = [
  {
    id: "shorts-bar",
    name: "Shorts Bar",
    miFromMidpoint: 3.3,
    maxLengthFt: 50,
    hasHookups: true,
    campspotUrl: "https://www.campspot.com/",
  },
  {
    id: "iron-phone",
    name: "Iron Phone Junction Campground",
    miFromMidpoint: 10.9,
    maxLengthFt: 60,
    hasHookups: true,
    campspotUrl: "https://www.campspot.com/",
  },
  {
    id: "glacier-staging",
    name: "West Glacier RV Staging",
    miFromMidpoint: 18.2,
    maxLengthFt: 45,
    hasHookups: false,
    campspotUrl: "https://www.campspot.com/",
  },
];

export const DEMO_DIRECTIONS: { id: string; instruction: string; mi: string }[] =
  [
    { id: "d1", instruction: "Continue on I-80 E toward Salt Lake City", mi: "214" },
    { id: "d2", instruction: "Merge onto I-15 N toward Butte / Great Falls", mi: "318" },
    { id: "d3", instruction: "Take I-90 W toward Missoula", mi: "186" },
    { id: "d4", instruction: "Exit toward US-2 W · West Glacier", mi: "62" },
    { id: "d5", instruction: "Arrive Glacier NP staging · verify propane OFF", mi: "0.4" },
  ];

export const DEMO_PACK: { id: string; item: string; done: boolean }[] = [
  { id: "p1", item: "Propane tank valves + leak soap", done: true },
  { id: "p2", item: "Engine brake check · jake brake test", done: true },
  { id: "p3", item: "Height stickers / clearance card", done: false },
  { id: "p4", item: "Leveling blocks · 45 ft pad kit", done: false },
  { id: "p5", item: "National Parks annual pass", done: true },
  { id: "p6", item: "Tire pressure for mountain grades", done: false },
];

export function formatDrive(hours: number, minutes: number) {
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatMiles(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
