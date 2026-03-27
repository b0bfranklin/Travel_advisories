// Hardcoded flight data for the MEL-DXB-DUS trip, May 2026
// All times are local at the respective airport

export interface FlightLeg {
  flightNumber: string
  from: { iata: string; name: string; city: string; country: string; timezone: string }
  to: { iata: string; name: string; city: string; country: string; timezone: string }
  scheduledDeparture: string
  scheduledArrival: string
  durationMinutes: number
  cabin: 'Premium Economy'
  direction: 'outbound' | 'return'
  aircraft: string
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
    scheduledDeparture: '2026-05-10T21:15:00+10:00',
    scheduledArrival: '2026-05-11T05:15:00+04:00',
    durationMinutes: 14 * 60,
    cabin: 'Premium Economy',
    direction: 'outbound',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'MEL T2: Qantas Business Lounge (Level 1, International). Access via Qantas Platinum status — show QFF card + boarding pass. NOTE: Emirates Lounge at MEL requires Business/First class ticket; PE passengers use Qantas lounge via status.',
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
    scheduledDeparture: '2026-05-11T08:30:00+04:00',
    scheduledArrival: '2026-05-11T13:25:00+02:00',
    durationMinutes: 6 * 60 + 55,
    cabin: 'Premium Economy',
    direction: 'outbound',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'DXB T3: Emirates First Class Lounge (Concourse B). Access via Qantas Platinum status on EK flight number — show QFF card + boarding pass. Open 24h. Ensure QFF number is linked in Manage My Booking.',
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
    scheduledDeparture: '2026-05-25T15:25:00+02:00',
    scheduledArrival: '2026-05-25T23:55:00+04:00',
    durationMinutes: 6 * 60 + 30,
    cabin: 'Premium Economy',
    direction: 'return',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'DUS Pier C, near Gate C45: No free access on Qantas Platinum credit card. Paid entry ~USD$125 (Skywards member). Fallback: DUS Sky Lounge (Pier C upper floor) via Priority Pass or pay-at-door ~€49.',
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
    scheduledDeparture: '2026-05-26T02:40:00+04:00',
    scheduledArrival: '2026-05-26T21:50:00+10:00',
    durationMinutes: 13 * 60 + 10,
    cabin: 'Premium Economy',
    direction: 'return',
    aircraft: 'Boeing 777-300ER',
    loungeInfo:
      'DXB T3 (Concourse B): No free access on Qantas Platinum credit card. Paid entry ~USD$125 (Skywards member). Open 24h — quieter at 02:40 departure time. Fallback: Ahlan/Marhaba open 24h.',
  },
]

export const WEATHER_AIRPORTS = [
  { iata: 'MEL', city: 'Melbourne', country: 'AU', query: 'Melbourne,AU' },
  { iata: 'DXB', city: 'Dubai', country: 'AE', query: 'Dubai,AE' },
  { iata: 'DUS', city: 'Düsseldorf', country: 'DE', query: 'Dusseldorf,DE' },
] as const

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

export const EMIRATES_LINKS = {
  manageBooking: 'https://www.emirates.com/english/manage-booking/',
  checkIn: 'https://www.emirates.com/english/manage-booking/online-check-in/',
  flightStatus: 'https://www.emirates.com/english/manage-booking/flight-status/',
  operationalUpdates: 'https://www.emirates.com/english/help/travel-updates/',
  loungeAccess: 'https://www.emirates.com/english/experience/on-ground/lounge/',
  baggageInfo: 'https://www.emirates.com/english/before-you-fly/baggage/checked-baggage/',
  premiumEconomyInfo: 'https://www.emirates.com/english/experience/premium-economy/',
  refundForm: 'https://www.emirates.com/english/help/refunds/',
  disruptionSupport: 'https://www.emirates.com/english/manage-booking/change-flight/',
}

// ─── Lounge access: Qantas Platinum CREDIT CARD (not QFF status)
// The Qantas Platinum credit card provides 2 single-entry passes per year to
// Qantas Club or Qantas-operated International Business Lounges ONLY.
// It does NOT provide Emirates lounge access, Priority Pass, or access at DXB/DUS.
// Without earned QFF status (Bronze/Silver/Gold/Platinum from flying), DXB and DUS
// require paying at the door or using a separate Priority Pass membership.
export const LOUNGE_ACCESS = [
  {
    port: 'MEL',
    portName: 'Melbourne',
    flight: 'EK407',
    loungeName: 'Emirates Lounge',
    terminal: 'Terminal 2, Level 3, near Gate 10',
    hours: '18:15–23:30 daily',
    access: 'Use 1 Qantas Platinum credit card lounge pass (2 available per year)',
    showers: false,
    free: true,
    paidPrice: null,
    notes: 'Link pass via Qantas app at least 24h before departure. Cannot unlink within 24h. This is the best use of one of your 2 annual passes.',
    actionRequired: true,
    actionText: 'Link lounge pass in Qantas app',
    actionUrl: 'https://www.qantas.com/au/en/frequent-flyer/qantas-lounges/lounge-invitations.html',
    fallback: 'Marhaba Lounge (T2, Level 3, Gates 9–11) — Priority Pass or pay at door',
  },
  {
    port: 'DXB',
    portName: 'Dubai (outbound transit)',
    flight: 'EK055',
    loungeName: 'Emirates Business Class Lounge',
    terminal: 'Terminal 3, Concourse B',
    hours: 'Open 24 hours',
    access: 'No free access — Business/First ticket or earned Skywards/QFF status required',
    showers: true,
    free: false,
    paidPrice: 'USD ~$125 (Skywards member) / ~$155 (non-member) — join Skywards free first',
    notes: '3h 15m transit. Paid access subject to capacity. Skywards membership is free to join and immediately qualifies for the member rate.',
    actionRequired: false,
    fallback: 'Ahlan or Marhaba Lounges (T3, Concourse B) — Priority Pass or pay at door ~USD$40–60',
  },
  {
    port: 'DUS',
    portName: 'Düsseldorf',
    flight: 'EK056',
    loungeName: 'Emirates Lounge',
    terminal: 'Pier C (Non-Schengen), near Gate C45',
    hours: 'Approx 12:25–15:25 & 18:15–21:15',
    access: 'No free access — Business/First ticket or earned Skywards/QFF status required',
    showers: true,
    free: false,
    paidPrice: 'USD ~$125 (Skywards member) / ~$155 (non-member)',
    notes: 'EK056 departs 15:25 — lounge should be open at that time. Recently refurbished, 700sqm, Do&Co catering.',
    actionRequired: false,
    fallback: 'DUS Sky Lounge (Pier C, upper floor) — Priority Pass or pay at door ~€49/person. Good option.',
  },
  {
    port: 'DXB',
    portName: 'Dubai (return transit)',
    flight: 'EK408',
    loungeName: 'Emirates Business Class Lounge',
    terminal: 'Terminal 3, Concourse B',
    hours: 'Open 24 hours',
    access: 'No free access — Business/First ticket or earned Skywards/QFF status required',
    showers: true,
    free: false,
    paidPrice: 'USD ~$125 (Skywards member) — note: this is peak late-night period at DXB, subject to capacity',
    notes: 'EK408 departs 02:40. You arrive DXB ~midnight with ~2h45m transit. Paid access may be tight on capacity at this hour.',
    actionRequired: false,
    fallback: 'Ahlan or Marhaba Lounges (T3) — open 24h, Priority Pass or pay at door',
  },
]

// ─── Premium Economy entitlements ─────────────────────────────────────────────
// NOTE: Lounge access below is NOT from the PE ticket itself —
// it comes from Qantas Platinum status. PE alone does NOT include lounge access.
export const PE_ENTITLEMENTS = [
  { label: 'Checked baggage', value: '35 kg (2 pieces)' },
  { label: 'Cabin baggage', value: '7 kg carry-on + personal item' },
  { label: 'Lounge access', value: 'NOT included with PE ticket. Use Qantas Platinum credit card pass at MEL only. Paid access at DXB/DUS — see Lounge panel.' },
  { label: 'Seat width', value: '19.5 inches with leg rest & footbar' },
  { label: 'Screen size', value: '13.3 inch ICE system' },
  { label: 'Meals', value: '3-course meal service with upgraded crockery' },
  { label: 'Check-in', value: 'Business Class check-in counters' },
  { label: 'Priority boarding', value: 'Yes — after Business/First' },
]

// ─── Rebooking / waiver data ──────────────────────────────────────────────────
// Current Emirates waiver covers travel 28 Feb – 15 Apr 2026.
// Our flights (10 May and 25 May 2026) are OUTSIDE the current waiver window.
// This section is for the RebookingPanel to display clearly.
export const REBOOKING_INFO = {
  currentWaiverActive: false,
  currentWaiverWindow: 'Feb 28 – Apr 15, 2026',
  currentWaiverRebookBy: 'May 31, 2026',
  ourFlightsDates: 'May 10 & May 25, 2026',
  ourFlightsCovered: false,
  // What applies to our flights (standard fare rules)
  standardPolicy: [
    {
      scenario: 'Emirates cancels or significantly changes the flight',
      entitlement: 'Free rebook on next available EK flight, or full refund regardless of fare type',
    },
    {
      scenario: 'Flex / Flex Plus fare ticket',
      entitlement: 'Change flight date/time with no change fee (fare difference may apply)',
    },
    {
      scenario: 'Saver fare ticket',
      entitlement: 'Changes incur a fee; cancellation is generally non-refundable (taxes refundable)',
    },
    {
      scenario: 'Booked via travel agent',
      entitlement: 'All changes and refunds must go through your travel agent, not Emirates directly',
    },
  ],
  // EU261 applies to DUS-origin flights (EK056)
  eu261Applies: true,
  eu261Note: 'EK056 departs from Germany (EU soil) — EC 261/2004 applies. Delay 3h+: €600 compensation per passenger. Cancellation: full refund or rerouting + €600. This applies regardless of airline nationality.',
  eu261Link: 'https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.html',
  // Key links
  manageBookingUrl: 'https://www.emirates.com/english/manage-booking/',
  travelUpdatesUrl: 'https://www.emirates.com/english/help/travel-updates/',
  refundFormUrl: 'https://www.emirates.com/english/help/refunds/',
  disruptionFaqUrl: 'https://www.emirates.com/english/help/faq-topics/disrupted-travel/',
}
