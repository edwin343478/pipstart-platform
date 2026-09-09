export type Instrument = {
  baseCurrency: string;
  contractSize: number;
  label: string;
  minimumVolume: number;
  pipSize: number;
  quoteCurrency: string;
  specificationNote: string;
  volumeStep: number;
};

export type InstrumentGroup = {
  label: string;
  instruments: Instrument[];
};

function forex(label: string): Instrument {
  const [baseCurrency, quoteCurrency] = label.split("/");
  const pipSizeByQuoteCurrency: Partial<Record<string, number>> = {
    CLP: 1,
    COP: 1,
    IDR: 1,
    CZK: 0.01,
    HUF: 0.01,
    INR: 0.01,
    JPY: 0.01,
    KRW: 0.01,
    PHP: 0.01,
    THB: 0.01,
    TWD: 0.01,
  };

  return {
    baseCurrency,
    label,
    pipSize: pipSizeByQuoteCurrency[quoteCurrency] ?? 0.0001,
    contractSize: 100_000,
    minimumVolume: 0.01,
    quoteCurrency,
    specificationNote:
      "Quote-currency pip convention for education. Confirm the symbol specification with your broker before trading.",
    volumeStep: 0.01,
  };
}

function group(label: string, pairs: string[]): InstrumentGroup {
  return { label, instruments: pairs.map(forex) };
}

export const accountCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "TZS",
  "KES",
  "GHS",
] as const;

export const instrumentGroups: InstrumentGroup[] = [
  group("Major currency pairs", [
    "EUR/USD",
    "USD/JPY",
    "GBP/USD",
    "USD/CHF",
    "AUD/USD",
    "USD/CAD",
    "NZD/USD",
  ]),
  group("Minor currency pairs", [
    "EUR/GBP",
    "EUR/JPY",
    "EUR/AUD",
    "EUR/CAD",
    "EUR/CHF",
    "EUR/NZD",
    "GBP/JPY",
    "GBP/AUD",
    "GBP/CAD",
    "GBP/CHF",
    "GBP/NZD",
    "AUD/JPY",
    "AUD/CAD",
    "AUD/CHF",
    "AUD/NZD",
    "CAD/JPY",
    "CAD/CHF",
    "CHF/JPY",
    "NZD/JPY",
    "NZD/CAD",
    "NZD/CHF",
  ]),
  group("Exotic currency pairs", [
    "USD/CNH",
    "USD/HKD",
    "USD/SGD",
    "USD/THB",
    "USD/MXN",
    "USD/ZAR",
    "USD/TRY",
    "USD/PLN",
    "USD/SEK",
    "USD/NOK",
    "USD/DKK",
    "USD/CZK",
    "USD/HUF",
    "USD/ILS",
    "USD/BRL",
    "USD/CLP",
    "USD/COP",
    "USD/INR",
    "USD/IDR",
    "USD/KRW",
    "USD/MYR",
    "USD/PHP",
    "USD/TWD",
    "USD/SAR",
    "USD/AED",
    "EUR/TRY",
    "EUR/ZAR",
    "EUR/PLN",
    "EUR/SEK",
    "EUR/NOK",
    "EUR/DKK",
    "EUR/CZK",
    "EUR/HUF",
    "GBP/TRY",
    "GBP/ZAR",
    "GBP/PLN",
    "GBP/SEK",
    "GBP/NOK",
    "AUD/SGD",
    "AUD/CNH",
    "NZD/SGD",
    "SGD/JPY",
    "HKD/JPY",
  ]),
  {
    label: "Metals",
    instruments: [
      {
        baseCurrency: "XAU",
        contractSize: 100,
        label: "XAU/USD",
        minimumVolume: 0.01,
        pipSize: 0.01,
        quoteCurrency: "USD",
        specificationNote:
          "Illustrative metal specification. Confirm contract and volume details with your broker.",
        volumeStep: 0.01,
      },
      {
        baseCurrency: "XAG",
        contractSize: 5_000,
        label: "XAG/USD",
        minimumVolume: 0.01,
        pipSize: 0.001,
        quoteCurrency: "USD",
        specificationNote:
          "Illustrative metal specification. Confirm contract and volume details with your broker.",
        volumeStep: 0.01,
      },
    ],
  },
];

export const instruments = instrumentGroups.flatMap(
  (instrumentGroup) => instrumentGroup.instruments,
);
