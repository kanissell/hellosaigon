# HelloSaigon — Product Document

> Last updated: 2026-02-12

---

## 1. Origin Story

Every time a friend visits Ho Chi Minh City, Kai takes them out — food, spas, hair salons, everything they need. Friends always ask "how do you know all these places?" One day a friend said: "Why don't you make this an app?"

The pattern became clear:
- **Visitors** constantly ask: "What do we eat now? Best spa? Where's good coffee?"
- **Friends who moved to HCMC** ask even more: cleaning services, motorbike repair, vets, gyms — daily life stuff.
- Kai has 50-100 places/services across all categories, built from years of living in Saigon.

This knowledge is valuable and nobody else is packaging it for Saigon.

---

## 2. What HelloSaigon Is

**A local life concierge for Ho Chi Minh City, powered by one person's deep personal knowledge.**

It's NOT:
- A Yelp/Foody.vn clone (no crowdsourced reviews)
- A delivery app
- A tourist guide with generic "top 10" lists
- An algorithm-first recommendation engine

It IS:
- "Texting a friend who's lived in Saigon for years and knows the real spots"
- Opinionated, honest, personal — like The Infatuation but for one city, one voice
- A curated database where every entry is personally verified
- A chat-first interface that understands natural language questions

---

## 3. Target Users

### User 1: Visitors (short-term)
- Friends visiting HCMC for days or weeks
- Want: food, experiences, things to do, where to go tonight
- Behavior: intense usage for a short period, then gone
- Value: word-of-mouth growth ("use this app when you visit Saigon")

### User 2: New Residents / Expats (long-term)
- People who moved to HCMC (or are considering it)
- Want: daily life services — cleaning, laundry, dentist, vet, gym, hair, motorbike repair
- Behavior: ongoing usage over months/years, keep coming back for new needs
- Value: retention engine, sticky users, they share with the next person who moves

**Both are served from day one.** The new-resident user type is more valuable long-term (higher retention, more diverse queries, organic sharing).

---

## 4. Core Value Proposition

### Why users open HelloSaigon instead of Google Maps:

1. **No decision fatigue** — One trusted recommendation, not 147 options with 4.2-4.7 stars
2. **Insider knowledge** — "Ask for the special, it's not on the English menu" (Google can't give you this)
3. **Honest curation** — "Coffee is mediocre but it's the only dog-friendly spot in D1"
4. **Context-aware** — Understands "coffee where I can work" vs. "coffee for a date"
5. **Beyond food** — Cleaning service, vet, motorbike repair — stuff Google Maps is terrible at
6. **Zero noise** — No sponsored listings, no fake reviews, no algorithm gaming

### The trust model:
- Every recommendation is personally verified (visited multiple times)
- Insider notes share real experience, not marketing copy
- Honest about trade-offs ("touristy but the view is worth it")
- Says "I don't have a spot for that yet" when there's no good option
- Named curator with skin in the game (reputation on the line)

---

## 5. Category Model

### Eat & Drink
- `food` — pho, banh mi, bun bo hue, com tam, street food, restaurants
- `coffee` — cafes, workspace cafes, specialty coffee, egg coffee
- `bar` — rooftop bars, craft beer, cocktail bars, bia hoi
- `dessert` — che, banh, ice cream, bakeries

### Self-Care
- `spa` — massage, spa treatments, wellness
- `hair` — salons, barbers, hair wash
- `nails` — nail salons, manicure/pedicure
- `health` — dentist, doctor, clinic, pharmacy

### Daily Life (Services)
- `cleaning` — home cleaning services
- `laundry` — laundry, dry cleaning
- `repair` — motorbike repair, phone repair, electronics
- `pet` — vet, pet grooming, pet-friendly places
- `fitness` — gyms, yoga, martial arts, swimming
- `tailor` — tailoring, clothing alterations

### Experiences
- `attraction` — temples, museums, landmarks, markets
- `nightlife` — clubs, late-night spots, live music
- `daytrip` — Cu Chi Tunnels, Mekong Delta, beaches
- `class` — cooking classes, language classes, art workshops

> Categories will expand as the database grows. Start with what Kai knows best.

---

## 6. Data Model

### Current State (v0.1)
The prototype has 6 hardcoded places in `lib/data/places.ts` with a `Place` type covering food/coffee/bar/spa/attraction.

### Target Data Model (v0.2)

Each entry (place or service) should capture:

#### Identity
- `id` — unique slug
- `name` — place/service name
- `category` — top-level category (eat_drink, self_care, daily_life, experiences)
- `subcategory` — specific type (pho, spa, cleaning, etc.)

#### Location
- `district` — HCMC district
- `address` — street address
- `hemAddress` — alley/hem directions if applicable ("Hem 127, past the pharmacy, look for plastic stools")
- `coordinates` — { lat, lng }
- `googleMapsUrl` — direct link for navigation

#### Kai's Assessment (the core value)
- `personalRating` — 1-10 score
- `personalNotes` — honest insider take
- `signatureItem` — what to order/ask for
- `insiderTip` — the thing only a local would know
- `verifiedByKai` — boolean
- `timesVisited` — visit count
- `lastVerified` — date of last personal visit

#### Quality Signals
- `yearsOpen` — longevity (quality signal)
- `specializationScore` — 1-10, focused > generalist

#### Context Tags
- `vibes` — string[] (authentic, chill, work, date, quick, upscale, local, scenic, family...)
- `bestFor` — string[] (solo, couple, group, family, business)
- `bestTime` — (morning, lunch, afternoon, dinner, late_night)[]
- `dogFriendly` — boolean
- `priceRange` — street | casual | mid | upscale
- `acOrOutdoor` — ac | outdoor | both

#### Practical Info
- `cashOnly` — boolean
- `acceptsMomo` — boolean (mobile payments)
- `reservationNeeded` — boolean
- `parkingSituation` — easy | difficult | none
- `closedDays` — string[] (e.g., ["Monday"])
- `sellsOutBy` — string (e.g., "Usually sold out by 10am")
- `operatingHours` — string (e.g., "6am-11am" or "Flexible, closes when sold out")
- `phoneNumber` — string
- `instagramHandle` — string
- `photoUrls` — string[] (Kai's own photos)

#### For Services (cleaning, repair, etc.)
- `contactMethod` — how to book (phone, Zalo, walk-in, app)
- `serviceArea` — which districts they serve
- `priceExample` — string (e.g., "200k VND for 2-hour apartment clean")
- `languagesSpoken` — string[] (Vietnamese, English, etc.)
- `responseTime` — string (e.g., "Usually replies within 1 hour on Zalo")

---

## 7. UX Decisions

### Chat-First Interface (confirmed)
- Primary interaction is natural language: "Where should I eat tonight in D3?"
- Chat handles complex multi-constraint queries: "Dog-friendly coffee with wifi near Thao Dien"
- Conversation history provides context (remembers preferences over time)

### Smart Empty State
- Before first message, show 3-4 contextual suggestion chips
- Chips change based on time of day:
  - Morning: `Quick breakfast` | `Coffee for working` | `Pho near me`
  - Afternoon: `Afternoon coffee` | `Spa recommendations` | `Quick snack`
  - Evening: `Dinner ideas` | `Date spot` | `Bar recommendations`
  - Late night: `Still open now` | `Late night food` | `Bar hopping`

### Rich Place Cards in Chat
- Recommendations render as visual cards, not plain text
- Card shows: name, Kai's 1-line take, distance, key tags
- Action buttons: "Tell me more" | "Show on map" | "Save"

### Honest Fallback
- When no verified option exists: "I don't have a solid spot for that yet — let me know if you find one and I'll check it out."
- Never recommends unverified places
- Never invents details

### Zero Onboarding
- No signup, no questionnaire, no tutorial
- Start chatting immediately
- Learn preferences passively from conversation over time

---

## 8. Technical Stack

### Current (Prototype)
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **LLM**: Groq SDK → Llama 3.3 70B (fast, free tier)
- **Data**: Hardcoded TypeScript array (6 places)
- **Hosting**: Local development

### Path to iOS
- **Phase 1 (now)**: Keep building on Next.js, improve the web prototype
- **Phase 2 (soon)**: Add Capacitor to wrap Next.js as native iOS app
  - 100% code reuse from web app
  - App Store distribution via TestFlight
  - Native geolocation, push notifications, camera access
  - Good enough UX for chat-based app (WebView handles text well)
  - Ship to TestFlight in 1-2 weeks
- **Phase 3 (if needed)**: Migrate to React Native/Expo for native polish
  - Only if users complain about app feel
  - Only after product-market fit is validated
  - 4-8 week migration

### Database (future)
- Move from hardcoded array to a real database
- Options: Supabase (Postgres), PlanetScale (MySQL), or Turso (SQLite edge)
- Needed once data exceeds ~100 entries or when adding user features (saved places, preferences)

---

## 9. Algorithm & Data Strategy

### What We Build: Discovery Pipeline (Kai's tool)
- Google Places API scan of 500-1,000 candidate places
- Scoring based on authenticity signals:
  - Vietnamese review ratio >60% (locals eat here)
  - Years in business >5 (survived market selection)
  - Rating 4.2-4.7 (mixed = real, not gamed)
  - Distance from tourist landmarks (anti-tourist-trap)
  - Review authenticity (low fake reviewer ratio)
- Output: ranked list of candidates for Kai to personally visit
- Cost: $0-20/month (Google Places free tier covers 10,000 calls)
- Timeline: Build after core app is functional

### What We DON'T Build (and why)
- **User-facing algorithm recommendations** — too risky, kills trust. Google Maps reviews in Vietnam are actively gamed (QR codes only given to happy customers).
- **Social media integration** — viral =/= good, hype cycles, expensive APIs, noise.
- **Foody.vn scraping** — no public API, legally gray, not worth the risk.
- **User-generated reviews** — moderation burden, destroys single-voice value prop.
- **Crowdsourced ratings** — that's Yelp's model, not ours.

### Future Opportunity: Street Food via Payment Heatmaps
- 78% of Saigon street vendors accept MoMo/ZaloPay
- Transaction heatmaps could reveal hidden food clusters in hem alleys
- Requires partnership with payment providers (no public API)
- File under "future moat" — not actionable now

---

## 10. Competitive Landscape

### No direct competitor in Saigon
- **Foody.vn** — crowdsourced, 63k listings, volume over curation (anti-HelloSaigon)
- **Google Maps** — tourist-biased, gamed reviews, terrible for services/street food
- **GrabFood/ShopeeFood** — delivery only, no discovery, no curation
- **TripAdvisor** — tourist trap central
- **Saigoneer** — great content but editorial (articles, not interactive recommendations)

### Global models that validate the approach
- **The Infatuation** — opinionated food reviews, no user ratings, acquired by JPMorgan Chase
- **Spotted by Locals** — 85+ cities, 100% curated by named locals, no sponsored content
- Both prove that personal curation beats crowdsourcing for trust

### HelloSaigon's moat
1. Single-city depth (not spread thin across 85 cities)
2. Personal verification of every entry
3. Beyond food — daily life services that no competitor covers
4. Insider tips that can't be crowdsourced ("ask for the special")
5. Chat interface that handles complex context (dog + wifi + D3)

---

## 11. Monetization Roadmap

| Phase | Timeline | Model |
|-------|----------|-------|
| 1 | 0-6 months | **Free** — build trust, grow user base |
| 2 | 6-12 months | **Tips/donations** (Ko-fi style) |
| 3 | 12-18 months | **Freemium** ($5/mo for full database + offline + advanced filters) |
| 4 | 18+ months | **Selective partnerships** (hotel concierges, expat onboarding services, relocation companies) |

**Rules:**
- Never take sponsored listings in core recommendations
- Clearly separate any partnerships from editorial content
- Monetization must not compromise trust

---

## 12. Implementation Phases

### Phase 1: Foundation (current focus)
- [ ] Expand data model to handle all categories (eat_drink, self_care, daily_life, experiences)
- [ ] Expand data model to handle services (not just places)
- [ ] Add missing fields (lastVerified, closedDays, hemAddress, sellsOutBy, etc.)
- [ ] Populate database with 30-50 entries from Kai's knowledge
- [ ] Fix layout metadata (title/description)
- [ ] Update intent parsing for new categories
- [ ] Update system prompt for broader scope

### Phase 2: UX Polish
- [ ] Smart empty state with time-of-day suggestions
- [ ] Rich place cards in chat responses (not plain text)
- [ ] Streaming responses from Groq
- [ ] "Tell me more" expansion for place details
- [ ] Basic "Save for later" functionality (localStorage)

### Phase 3: iOS Ship
- [ ] Add Capacitor to wrap Next.js for iOS
- [ ] Configure geolocation plugin
- [ ] App icon, splash screen, iOS permissions
- [ ] Deploy to TestFlight
- [ ] Test with friends (real users)

### Phase 4: Growth
- [ ] Share specific recommendations (beautiful share cards)
- [ ] "From a friend" attribution on shared links
- [ ] About page (Kai's story, methodology, credentials)
- [ ] Feedback mechanism ("Was this recommendation good?")

### Phase 5: Scale
- [ ] Google Places API discovery pipeline (Kai's tool for finding new places)
- [ ] Real database (Supabase/PlanetScale)
- [ ] User accounts + saved places (cloud sync)
- [ ] Push notifications for new places added
- [ ] Preference learning from conversation history

---

## 13. Key Metrics (once launched)

- **Weekly active users** — are people coming back?
- **Messages per session** — are conversations useful?
- **Places saved** — are recommendations hitting?
- **Share rate** — are users sharing recommendations?
- **Return rate** — do visitors come back? Do residents stay?
- **"I don't have a spot" rate** — where are the gaps in the database?

---

## 14. Saigon-Specific Requirements

Things unique to building for HCMC:

- **District-aware recommendations** — D1 to D7 can be 45 min in traffic
- **Time-of-day filtering** — pho is morning, banh mi is afternoon, bia hoi is evening
- **Hem (alley) addressing** — "Hem 127, past the pharmacy, plastic stools on the left"
- **"Sells out by" flag** — many places close when they run out (not at a set time)
- **Cash vs. MoMo** — critical practical info for every entry
- **Traffic awareness** — rush hour (7-9am, 5-7pm) changes everything
- **Rainy season** — outdoor-only spots need weather context (May-November)
- **Vietnamese + English** — respond in whatever language the user writes in
- **Rapid turnover** — places open/close frequently, data staleness is the enemy

---

*This document is the single source of truth for HelloSaigon's product direction. Update it as decisions evolve.*
