export type Continent =
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'NorthAmerica'
  | 'SouthAmerica'
  | 'Oceania'

const CONTINENT_COUNTRIES: Record<Continent, string[]> = {
  Europe: (
    'AL AD AT BY BE BA BG HR CY CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME ' +
    'NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA'
  ).split(' '),
  Asia: (
    'AF AM AZ BH BD BT BN KH CN GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM ' +
    'PK PS PH QA SA SG KR LK SY TJ TH TL TR TM AE UZ VN YE TW HK'
  ).split(' '),
  Africa: (
    'DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY ' +
    'MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'
  ).split(' '),
  NorthAmerica: (
    'AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US'
  ).split(' '),
  SouthAmerica: 'AR BO BR CL CO EC GY PY PE SR UY VE'.split(' '),
  Oceania: 'AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU'.split(' '),
}

export const CONTINENT_LABELS: Record<Continent, string> = {
  Europe: 'Europa',
  Asia: 'Azja',
  Africa: 'Afryka',
  NorthAmerica: 'Ameryka Północna',
  SouthAmerica: 'Ameryka Południowa',
  Oceania: 'Oceania',
}

const CONTINENT_BY_COUNTRY = new Map<string, Continent>(
  Object.entries(CONTINENT_COUNTRIES).flatMap(([continent, codes]) =>
    codes.map((code): [string, Continent] => [code, continent as Continent]),
  ),
)

const regionNames = new Intl.DisplayNames('pl', { type: 'region' })

export interface Progress {
  visited: number
  total: number
  percent: number
}

export function getCountryName(code: string): string {
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

export function getContinent(code: string): Continent | undefined {
  return CONTINENT_BY_COUNTRY.get(code)
}

export function getVisitedContinents(codes: string[]): Continent[] {
  const visited = new Set<Continent>()

  for (const code of codes) {
    const continent = getContinent(code)

    if (continent) {
      visited.add(continent)
    }
  }

  return Array.from(visited)
}

function toProgress(visited: number, total: number): Progress {
  return { visited, total, percent: (visited / total) * 100 }
}

export function getContinentProgress(codes: string[], continent: Continent): Progress {
  const countries = CONTINENT_COUNTRIES[continent]
  const visited = codes.filter((code) => countries.includes(code)).length

  return toProgress(visited, countries.length)
}

export function getWorldProgress(codes: string[]): Progress {
  const total = Object.values(CONTINENT_COUNTRIES).reduce((sum, list) => sum + list.length, 0)
  const visited = codes.filter((code) => CONTINENT_BY_COUNTRY.has(code)).length

  return toProgress(visited, total)
}