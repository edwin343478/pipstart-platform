// Original PipStart teaching copy, not provider descriptions or a data feed.
// All example numbers are invented, not current releases or forecasts.
export const calendarExplainers = [
  {
    id: "interest-rates",
    title: "Interest-rate decisions",
    measures:
      "A central bank announces its policy rate and explains its outlook. This influences borrowing costs, although your bank’s loan rate is different.",
    reaction:
      "Currencies can react when a decision or statement changes expectations about future rates. Higher rates do not guarantee a stronger currency.",
    example:
      "If everyone expects a shop’s delivery fee to rise from 5 to 6, a rise to 8 is the bigger surprise. Likewise, an expected rate increase may already be reflected in prices; an unexpected hold can matter more.",
    source: "Federal Reserve meetings",
    href: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  },
  {
    id: "cpi",
    title: "Consumer Price Index (CPI)",
    measures:
      "CPI tracks price changes for a basket of consumer goods and services. Monthly and yearly inflation rates answer different questions.",
    reaction:
      "An inflation surprise can change expectations about rates and purchasing power. Other news and starting expectations still matter.",
    example:
      "A shopping basket costing 100, then 104 a year later, has risen 4%. In an invented release, 3% inflation against a 2% forecast is a bigger upside surprise than 4% against a 4% forecast.",
    source: "BLS consumer prices",
    href: "https://www.bls.gov/cpi/",
  },
  {
    id: "core-inflation",
    title: "Core inflation",
    measures:
      "US core CPI excludes food and energy to examine other price trends. This does not mean food and fuel are unimportant to households.",
    reaction:
      "Unexpected core inflation can change views about persistent price pressure. Headline and core figures tell different parts of the story.",
    example:
      "Cheaper fuel can lower your total spending while rent keeps rising. A fictional 0.4% monthly core rise against a 0.2% forecast may surprise readers even if headline inflation falls.",
    source: "BLS consumer prices",
    href: "https://www.bls.gov/cpi/",
  },
  {
    id: "us-jobs",
    title: "US jobs report: nonfarm payrolls",
    measures:
      "Payrolls estimate the monthly change in covered employer jobs, not unique people. The broader report also covers unemployment and wages.",
    reaction:
      "Unexpected hiring can change views about demand and policy. Revisions to earlier months also matter.",
    example:
      "A café planning two new hires but making five has exceeded its plan. Conversely, an invented gain of 150,000 jobs can disappoint a 200,000 forecast despite being positive.",
    source: "BLS Employment Situation",
    href: "https://www.bls.gov/news.release/empsit.toc.htm",
  },
  {
    id: "unemployment",
    title: "Unemployment rate",
    measures:
      "The US rate is the unemployed share of the labour force, measured through a household survey rather than the employer payroll survey.",
    reaction:
      "A surprise can change perceptions of employment strength. A falling rate can reflect new jobs or people leaving the labour force.",
    example:
      "If 10 of 100 people in the labour force are unemployed, the rate is 10%. A fictional 4.5% rate against a 4.0% forecast raises different questions from 4.5% against 4.5%.",
    source: "BLS labour-force concepts",
    href: "https://www.bls.gov/cps/definitions.htm",
  },
  {
    id: "wages",
    title: "Average hourly earnings",
    measures:
      "This tracks average hourly pay for covered US payroll employees. Changes in the mix of workers can affect the average.",
    reaction:
      "Unexpected wage growth can alter views about spending and inflation. Read it alongside employment and hours worked.",
    example:
      "Hiring a senior manager can raise a shop’s average wage without existing staff getting raises. A fictional 0.4% monthly earnings rise against a 0.2% forecast is a surprise, but its causes still need checking.",
    source: "BLS Employment Situation",
    href: "https://www.bls.gov/news.release/empsit.toc.htm",
  },
  {
    id: "gdp",
    title: "Gross Domestic Product (GDP)",
    measures:
      "GDP measures final goods and services produced within an economy. Real GDP adjusts for price changes. Check whether a rate is quarterly, yearly or annualised.",
    reaction:
      "Unexpected growth can change views about demand and policy. Early estimates can be revised.",
    example:
      "A bakery making more bread increases output; sales rising only because prices rose are different. Fictional growth of 2% against a 1% forecast is a different surprise from 2% against 3%. Compare the same measurement basis.",
    source: "BEA GDP guide",
    href: "https://www.bea.gov/data/gdp/gross-domestic-product",
  },
  {
    id: "pmi",
    title: "Purchasing Managers’ Index (PMI)",
    measures:
      "Business surveys track conditions such as orders and activity. For headline ISM manufacturing and services PMIs, above 50 generally signals sector expansion and below 50 contraction, not a percentage growth rate.",
    reaction:
      "Survey surprises can change expectations before slower official statistics arrive. Manufacturing, services and different providers’ surveys are not interchangeable.",
    example:
      "More shops reporting busier trade suggests improvement, not an exact sales increase. A fictional PMI of 51 against a 54 forecast still indicates expansion but is weaker than expected.",
    source: "ISM PMI reports",
    href: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/",
  },
  {
    id: "retail-sales",
    title: "Retail sales",
    measures:
      "US retail and food-services sales estimate spending at covered businesses. Headline dollar figures are not adjusted for price changes.",
    reaction:
      "A spending surprise can change views about demand. Revisions and categories such as vehicles can affect the headline.",
    example:
      "Your grocery bill can rise from 50 to 55 because prices rose, even with the same basket. An invented 0.5% sales increase against a 1% forecast is below expectations despite showing an increase.",
    source: "US Census retail-trade definitions",
    href: "https://www.census.gov/retail/definitions.html",
  },
  {
    id: "cbk",
    title: "Central Bank of Kenya meetings",
    measures:
      "The Monetary Policy Committee reviews Kenya’s monetary-policy stance and announces Central Bank Rate decisions. Read the official explanation and outlook too.",
    reaction:
      "A surprise can change expectations about borrowing costs and the shilling. Local conditions and global developments also matter; no exchange-rate response is guaranteed.",
    example:
      "An expected fee change already in your household budget adds little new information. Similarly, an expected CBK decision may surprise less than a different decision or unexpected guidance. This does not predict the next meeting.",
    source: "CBK monetary policy",
    href: "https://www.centralbank.go.ke/monetary-policy/",
  },
] as const;
