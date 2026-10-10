export const calendarScriptUrl =
  "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
export const fullCalendarUrl = "https://www.tradingview.com/economic-calendar/";
export const calendarLessonUrl =
  "/learn/forex/level-7/use-an-economic-calendar-safely";
export const calendarFallbackText =
  "The calendar couldn’t load. Open the full calendar or check the official release schedules.";
export const calendarLoadTimeoutMs = 8_000;

// Owner-supplied embed; beginner filter and local countries approved separately.
export const calendarWidgetSettings = {
  colorTheme: "light",
  isTransparent: false,
  locale: "en",
  countryFilter:
    "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu,ke,tz",
  importanceFilter: "0,1",
  width: "100%",
  height: "100%",
} as const;

export const officialCalendarSources = [
  {
    name: "US labour and inflation releases — BLS",
    shortName: "US BLS",
    href: "https://www.bls.gov/schedule/",
  },
  {
    name: "US GDP releases — BEA",
    shortName: "US BEA",
    href: "https://www.bea.gov/news/schedule",
  },
  {
    name: "Federal Reserve meetings",
    shortName: "Federal Reserve",
    href: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  },
  {
    name: "Central Bank of Kenya monetary policy",
    shortName: "Central Bank of Kenya",
    href: "https://www.centralbank.go.ke/monetary-policy/",
  },
  {
    name: "Bank of Tanzania",
    shortName: "Bank of Tanzania",
    href: "https://www.bot.go.tz/",
  },
] as const;
