-- =============================================================================
-- Seed: Initial affiliate redirect slugs
-- All affiliate links must go through /go/[slug] — never raw URLs in code.
-- Update destination URLs here without code changes.
-- =============================================================================

INSERT INTO redirects (slug, destination, label) VALUES

-- eSIM providers
('airalo',        'https://www.airalo.com/?ref=tripwatch',                   'Airalo eSIM'),
('holafly',       'https://esim.holafly.com/?ref=tripwatch',                 'Holafly eSIM'),
('nomad-esim',    'https://www.getnomad.app/?ref=tripwatch',                 'Nomad eSIM'),

-- Travel insurance — AU market
('world-nomads',  'https://www.worldnomads.com/au/?ref=tripwatch',           'World Nomads'),
('cover-more',    'https://www.covermore.com.au/?ref=tripwatch',             'Cover-More'),
('one-cover',     'https://www.1cover.com.au/?ref=tripwatch',               '1Cover'),
('southern-cross','https://www.scti.com.au/?ref=tripwatch',                  'Southern Cross Travel Insurance'),
('fast-cover',    'https://www.fastcover.com.au/?ref=tripwatch',             'Fast Cover'),
('safety-wing',   'https://safetywing.com/?referenceID=tripwatch',           'SafetyWing'),

-- Luggage & accessories
('samsonite',     'https://www.samsonite.com.au/?ref=tripwatch',             'Samsonite'),
('bellroy',       'https://bellroy.com/?utm_source=tripwatch',               'Bellroy'),
('amazon-luggage','https://www.amazon.com.au/s?k=travel+luggage&ref=tripwatch', 'Amazon Luggage'),
('ebags',         'https://www.ebags.com/?ref=tripwatch',                   'eBags'),

-- Hotel & flights
('booking-com',   'https://www.booking.com/?aid=tripwatch',                  'Booking.com'),
('skyscanner',    'https://www.skyscanner.com.au/?ref=tripwatch',            'Skyscanner'),

-- VPN
('nordvpn',       'https://nordvpn.com/?ref=tripwatch',                     'NordVPN'),
('expressvpn',    'https://www.expressvpn.com/?ref=tripwatch',              'ExpressVPN'),
('surfshark',     'https://surfshark.com/?ref=tripwatch',                   'Surfshark'),

-- Airport lounges
('priority-pass', 'https://www.prioritypass.com/?ref=tripwatch',            'Priority Pass'),
('dragonpass',    'https://www.dragonpass.com/?ref=tripwatch',              'DragonPass'),

-- Travel money
('wise',          'https://wise.com/invite/tripwatch',                       'Wise'),
('revolut',       'https://revolut.com/?ref=tripwatch',                     'Revolut'),

-- Credit card comparison (affiliate referral to comparison sites)
('finder-cards',  'https://www.finder.com.au/credit-cards?ref=tripwatch',   'Finder Credit Cards'),
('canstar-cards', 'https://www.canstar.com.au/credit-cards/?ref=tripwatch', 'Canstar Credit Cards')

ON CONFLICT (slug) DO UPDATE SET
  destination = EXCLUDED.destination,
  label = EXCLUDED.label,
  updated_at = NOW();
