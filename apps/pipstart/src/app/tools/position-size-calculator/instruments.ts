export type Instrument = {
  contractSize: number;
  label: string;
  pipSize: number;
};

export type InstrumentGroup = {
  label: string;
  instruments: Instrument[];
};

function forex(label: string): Instrument {
  return {
    label,
    pipSize: label.endsWith("/JPY") ? 0.01 : 0.0001,
    contractSize: 100_000,
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
      { label: "XAU/USD", pipSize: 0.01, contractSize: 100 },
      { label: "XAG/USD", pipSize: 0.001, contractSize: 5_000 },
    ],
  },
];

export const instruments = instrumentGroups.flatMap(
  (instrumentGroup) => instrumentGroup.instruments,
);
