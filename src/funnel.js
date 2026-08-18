export const EMPTY_PROFILE = {
  firstName: "",
  email: "",
  market: "",
  wearable: "",
  focusAreas: [],
  betaInterest: false,
  emailConsent: false,
};

export const WEARABLE_OPTIONS = [
  "Apple Watch",
  "Garmin",
  "Oura",
  "WHOOP",
  "Fitbit / Pixel Watch",
  "Samsung Galaxy Watch",
  "Something else",
  "No wearable yet",
];

export const FOCUS_OPTIONS = [
  "Sleep",
  "Recovery",
  "Energy",
  "Stress",
  "Training",
  "Nutrition",
  "Making sense of all my data",
  "Something else",
  "Prefer not to say",
];

export const MARKET_OPTIONS = [
  "Amsterdam",
  "Chennai",
  "Somewhere else",
];

export function getAcquisitionContext() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const read = (key) => params.get(key)?.slice(0, 160) || undefined;

  return {
    utm_source: read("utm_source"),
    utm_medium: read("utm_medium"),
    utm_campaign: read("utm_campaign"),
    utm_content: read("utm_content"),
    referral: read("ref"),
  };
}

export function trackFunnelEvent(name, properties = {}) {
  if (typeof window === "undefined") return;

  const detail = {
    event: name,
    ...getAcquisitionContext(),
    ...properties,
  };

  window.dispatchEvent(new CustomEvent("aeiva:funnel", { detail }));
}
