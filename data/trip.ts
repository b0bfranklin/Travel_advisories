// Hardcoded flight data for the MEL-DXB-DUS trip, May 2026
// All times are local at the respective airport — "all times are local" per ticket

export interface FlightLeg {
  flightNumber: string
  from: { iata: string; name: string; city: string; country: string; timezone: string }
  to: { iata: string; name: string; city: string; country: string; timezone: string }
  // ISO 8601 with UTC offset — converted from local times on the ticket
  scheduledDeparture: string
  scheduledArrival: string
  // Duration in minutes (calculated)
  durationMinutes: number
  cabin: 'Premium Economy'
  direction: 'outbound' | 'return'
  aircraft: string
  // Check-in opens 48h before departure (Emirates policy)
  loungeInfo: string
}

export const FLIGHTS: FlightLeg[] = [
  {
    flightNumber: 'EK407',
    from: {
      iata: 'MEL',
      name: 'Melbourne Airport',
      city: 'Melbourne',
      country: 'Australia',
      timezone: 'Australia/Melbourne',
    },
    to: {
      iata: 'DXB',
      name: 'Dubai International Airport',
      city: 'Dubai',
      country: 'UAE',
      timezone: 'Asia/Dubai',
    },
    // Depart MEL 21:15 AEST (UTC+10) on 10 May 2026
    scheduledDeparture: '2026-05-10T21:15:00+10:00',
    // Arrive DXB 05:15 GST (UTC+4) on 11 May 2026
    scheduledArrival: '2026-05-11T05:15:00+04:00',
    durationMinutes: 14 * 60, // ~14h
    cabin: 'Premium Economy',
    direction: 'outbound',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'Melbourne T2: Emirates Lounge (Level 3, near gates). Open from 3h before departure.',
  },
  {
    flightNumber: 'EK055',
    from: {
      iata: 'DXB',
      name: 'Dubai International Airport',
      city: 'Dubai',
      country: 'UAE',
      timezone: 'Asia/Dubai',
    },
    to: {
      iata: 'DUS',
      name: 'Düsseldorf Airport',
      city: 'Düsseldorf',
      country: 'Germany',
      timezone: 'Europe/Berlin',
    },
    // Depart DXB 08:30 GST (UTC+4) on 11 May 2026
    scheduledDeparture: '2026-05-11T08:30:00+04:00',
    // Arrive DUS 13:25 CEST (UTC+2) on 11 May 2026
    scheduledArrival: '2026-05-11T13:25:00+02:00',
    durationMinutes: 6 * 60 + 55, // ~6h55m
    cabin: 'Premium Economy',
    direction: 'outbound',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'Dubai DXB: Emirates Business Class Lounge, Concourse B (Premium Economy passengers have access). Open 24h.',
  },
  {
    flightNumber: 'EK056',
    from: {
      iata: 'DUS',
      name: 'Düsseldorf Airport',
      city: 'Düsseldorf',
      country: 'Germany',
      timezone: 'Europe/Berlin',
    },
    to: {
      iata: 'DXB',
      name: 'Dubai International Airport',
      city: 'Dubai',
      country: 'UAE',
      timezone: 'Asia/Dubai',
    },
    // Depart DUS 15:25 CEST (UTC+2) on 25 May 2026
    scheduledDeparture: '2026-05-25T15:25:00+02:00',
    // Arrive DXB 23:55 GST (UTC+4) on 25 May 2026
    scheduledArrival: '2026-05-25T23:55:00+04:00',
    durationMinutes: 6 * 60 + 30, // ~6h30m
    cabin: 'Premium Economy',
    direction: 'return',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'Düsseldorf DUS: Emirates Business Class Lounge, Terminal A. Open from 3h before departure.',
  },
  {
    flightNumber: 'EK408',
    from: {
      iata: 'DXB',
      name: 'Dubai International Airport',
      city: 'Dubai',
      country: 'UAE',
      timezone: 'Asia/Dubai',
    },
    to: {
      iata: 'MEL',
      name: 'Melbourne Airport',
      city: 'Melbourne',
      country: 'Australia',
      timezone: 'Australia/Melbourne',
    },
    // Depart DXB 02:40 GST (UTC+4) on 26 May 2026
    scheduledDeparture: '2026-05-26T02:40:00+04:00',
    // Arrive MEL 21:50 AEST (UTC+10) on 26 May 2026
    scheduledArrival: '2026-05-26T21:50:00+10:00',
    durationMinutes: 13 * 60 + 10, // ~13h10m
    cabin: 'Premium Economy',
    direction: 'return',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'Dubai DXB: Emirates Business Class Lounge, Concourse B (Premium Economy passengers have access). Open 24h.',
  },
]

// Airports we show weather for
export const WEATHER_AIRPORTS = [
  { iata: 'MEL', city: 'Melbourne', country: 'AU', query: 'Melbourne,AU' },
  { iata: 'DXB', city: 'Dubai', country: 'AE', query: 'Dubai,AE' },
  { iata: 'DUS', city: 'Düsseldorf', country: 'DE', query: 'Dusseldorf,DE' },
] as const

// Countries we show DFAT advisories for
export const ADVISORY_COUNTRIES = [
  {
    slug: 'united-arab-emirates',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    dfatUrl: 'https://www.smartraveller.gov.au/destinations/middle-east/united-arab-emirates',
    relevance: 'Transit hub (DXB) — both outbound and return',
  },
  {
    slug: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    dfatUrl: 'https://www.smartraveller.gov.au/destinations/europe/germany',
    relevance: 'Destination (DUS)',
  },
] as const

// Emirates useful links
export const EMIRATES_LINKS = {
  manageBooking: 'https://www.emirates.com/english/manage-booking/',
  checkIn: 'https://www.emirates.com/english/manage-booking/online-check-in/',
  flightStatus: 'https://www.emirates.com/english/manage-booking/flight-status/',
  operationalUpdates: 'https://www.emirates.com/english/help/travel-updates/',
  loungeAccess: 'https://www.emirates.com/english/experience/on-ground/lounge/',
  baggageInfo: 'https://www.emirates.com/english/before-you-fly/baggage/checked-baggage/',
  premiumEconomyInfo: 'https://www.emirates.com/english/experience/premium-economy/',
}

// Premium Economy entitlements (EK PE as of 2025/26)
export const PE_ENTITLEMENTS = [
  { label: 'Checked baggage', value: '35 kg (2 pieces)' },
  { label: 'Cabin baggage', value: '7 kg carry-on + personal item' },
  { label: 'Lounge access', value: 'Emirates Business Class Lounge at all EK hubs' },
  { label: 'Seat width', value: '19.5 inches with leg rest & footbar' },
  { label: 'Screen size', value: '13.3 inch ICE system' },
  { label: 'Meals', value: '3-course meal service with upgraded crockery' },
  { label: 'Check-in', value: 'Business Class check-in counters' },
  { label: 'Priority boarding', value: 'Yes — after Business/First' },
]
