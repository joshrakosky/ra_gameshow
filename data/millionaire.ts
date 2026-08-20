// Millionaire bank: 10 difficulty tiers. dealMillionaireRound() picks one per tier
// and shuffles answer order so turns stay fresh.

import { pickOne, shuffle } from "@/lib/shuffle"

export type MillionaireQuestion = {
  prompt: string
  choices: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export type PrizeTier = {
  label: string
  isSafetyNet?: boolean
}

export const MILLIONAIRE_PRIZES: PrizeTier[] = [
  { label: "RA sticker pack" },
  { label: "Crew pin" },
  { label: "10% off merch" },
  { label: "15% off merch" },
  { label: "25% off merch", isSafetyNet: true },
  { label: "Weekend tote" },
  { label: "35% off merch" },
  { label: "40% off merch" },
  { label: "45% off merch" },
  { label: "50% off gift card" },
]

export const SAFETY_NET_INDEX = 4

const POOLS: MillionaireQuestion[][] = [
  // 1 — easy
  [
    { prompt: "A typical airliner has how many wings?", choices: ["1", "2", "6", "12"], correctIndex: 1 },
    { prompt: "What do you call the person flying the airplane?", choices: ["Conductor", "Pilot", "Dispatcher", "Gate agent"], correctIndex: 1 },
    { prompt: "Airplanes take off from and land at this place.", choices: ["A harbor", "An airport", "A depot", "A stadium"], correctIndex: 1 },
    { prompt: "The front of an airplane is usually called the what?", choices: ["Tail", "Nose", "Wingtip", "Flap"], correctIndex: 1 },
    { prompt: "Passengers store small bags in this compartment above the seat.", choices: ["Glove box", "Overhead bin", "Cargo hold", "Fuel tank"], correctIndex: 1 },
  ],
  // 2 — easy / cartoony
  [
    { prompt: "In the movie Up, Carl and Russell lift the house with thousands of these.", choices: ["Kites", "Balloons", "Drones", "Seagulls"], correctIndex: 1 },
    { prompt: "Dumbo flies using these.", choices: ["Jet engines", "His ears", "A slingshot", "Helium shoes"], correctIndex: 1 },
    { prompt: "Snoopy often imagines himself as a WWI flying ace battling this enemy.", choices: ["Darth Vader", "The Red Baron", "Godzilla", "A thunderstorm"], correctIndex: 1 },
    { prompt: "Buzz Lightyear’s famous catchphrase is this.", choices: ["Let’s roll", "To infinity and beyond!", "May the Force be with you", "Cowabunga"], correctIndex: 1 },
    { prompt: "Mickey Mouse’s pet dog is named this.", choices: ["Goofy", "Pluto", "Max", "Chip"], correctIndex: 1 },
  ],
  // 3 — easy-medium
  [
    { prompt: "The “black box” flight recorder is usually painted this color so it can be found.", choices: ["Black", "Bright orange", "Navy blue", "Camouflage"], correctIndex: 1 },
    { prompt: "Which of these is a real force on an airplane in flight?", choices: ["Lift", "Magic", "Wifi", "Popcorn"], correctIndex: 0 },
    { prompt: "ATL is the airport code for this U.S. city.", choices: ["Austin", "Atlanta", "Anchorage", "Albuquerque"], correctIndex: 1 },
    { prompt: "You should fasten this before the airplane pushes back.", choices: ["Your watch", "Your seat belt", "The engine", "The wing"], correctIndex: 1 },
    { prompt: "A compass direction that is also a U.S. airline is this.", choices: ["Northwest", "Southwest", "Downstairs", "Sideways"], correctIndex: 1 },
  ],
  // 4 — medium
  [
    { prompt: "In aviation, ATC stands for this.", choices: ["Air Traffic Control", "Airplane Taxi Company", "All Tickets Cheap", "Automatic Tail Camera"], correctIndex: 0 },
    { prompt: "LAX is the airport code for this city.", choices: ["Las Vegas", "Los Angeles", "London", "Lima"], correctIndex: 1 },
    { prompt: "Flaps on a wing are used mainly to help with this.", choices: ["Wi-Fi speed", "Takeoff and landing", "In-flight movies", "Painting the tail"], correctIndex: 1 },
    { prompt: "The back of the airplane is called the what?", choices: ["Nose", "Tail", "Galley only", "Radar"], correctIndex: 1 },
    { prompt: "Oxygen masks drop if the cabin loses this.", choices: ["Wi-Fi", "Pressure", "Pretzels", "The captain’s hat"], correctIndex: 1 },
  ],
  // 5 — safety net / medium
  [
    { prompt: "Mach 1 is roughly the speed of this.", choices: ["Light", "Sound", "A bicycle", "A snail"], correctIndex: 1 },
    { prompt: "In Top Gun, Maverick flies for which U.S. service?", choices: ["Army", "Coast Guard", "Navy", "Postal Service"], correctIndex: 2 },
    { prompt: "ORD is a famous airport in this city.", choices: ["Orlando", "Chicago", "Portland", "Phoenix"], correctIndex: 1 },
    { prompt: "A stall in aviation means the wing has lost too much of this.", choices: ["Paint", "Lift", "Fuel", "Passengers"], correctIndex: 1 },
    { prompt: "The Wright brothers’ first powered flight happened in this U.S. state.", choices: ["California", "North Carolina", "Texas", "Hawaii"], correctIndex: 1 },
  ],
  // 6 — medium-hard
  [
    { prompt: "The Wright brothers’ first powered flight happened in this year.", choices: ["1776", "1903", "1969", "1999"], correctIndex: 1 },
    { prompt: "Bernoulli’s principle helps explain lift because faster air over a wing has this.", choices: ["Higher pressure", "Lower pressure", "More gravity", "Extra pretzels"], correctIndex: 1 },
    { prompt: "IND is the airport code for this city.", choices: ["India", "Indianapolis", "Iceland", "Ithaca"], correctIndex: 1 },
    { prompt: "Ailerons on the wings primarily control this motion.", choices: ["Pitch", "Roll", "Yaw only", "Hover"], correctIndex: 1 },
    { prompt: "US Airways Flight 1549 ditched in this river after bird strikes.", choices: ["Mississippi", "Hudson", "Colorado", "Seine"], correctIndex: 1 },
  ],
  // 7 — harder
  [
    { prompt: "Yaw is controlled mainly with this flight control.", choices: ["Aileron", "Rudder", "Flap", "Spoileron only"], correctIndex: 1 },
    { prompt: "Heathrow’s airport code is this.", choices: ["LON", "LHR", "HTH", "UK1"], correctIndex: 1 },
    { prompt: "In Airplane!, the copilot is played by this NBA legend.", choices: ["Michael Jordan", "Kareem Abdul-Jabbar", "Larry Bird", "Shaq"], correctIndex: 1 },
    { prompt: "A jet engine produces thrust by throwing air in this direction.", choices: ["Forward", "Backward", "Straight up", "In a circle"], correctIndex: 1 },
    { prompt: "The sterile cockpit rule generally applies below this altitude.", choices: ["1,000 feet", "10,000 feet", "40,000 feet", "Sea level only"], correctIndex: 1 },
  ],
  // 8 — harder
  [
    { prompt: "ICAO, the U.N. aviation agency, is based in this city.", choices: ["Geneva", "Montreal", "New York", "Paris"], correctIndex: 1 },
    { prompt: "Qantas is the flag carrier of this country.", choices: ["Canada", "Australia", "Qatar", "Mexico"], correctIndex: 1 },
    { prompt: "A transponder’s “squawk 7700” means this.", choices: ["All is well", "Emergency", "Leaving the gate", "Requesting coffee"], correctIndex: 1 },
    { prompt: "The 1978 U.S. law that opened airline competition is called this.", choices: ["The Jet Act", "Airline Deregulation Act", "Open Skies 2000", "The Wright Rule"], correctIndex: 1 },
    { prompt: "CDG is the main airport serving this city.", choices: ["Cairo", "Paris", "Rome", "Madrid"], correctIndex: 1 },
  ],
  // 9 — pretty hard
  [
    { prompt: "Standard sea-level atmospheric pressure is about this many inches of mercury.", choices: ["19.92", "29.92", "39.92", "9.92"], correctIndex: 1 },
    { prompt: "KLM is the flag carrier of this country.", choices: ["Kenya", "the Netherlands", "South Korea", "Chile"], correctIndex: 1 },
    { prompt: "A wingtip vortex is a byproduct of this.", choices: ["In-flight Wi-Fi", "Lift", "The movie system", "Refueling"], correctIndex: 1 },
    { prompt: "The Chicago Convention of 1944 created the framework for this.", choices: ["Railroad gauges", "International civil aviation", "Ship flags", "Space law"], correctIndex: 1 },
    { prompt: "YYZ is the surprising airport code for this city.", choices: ["Yuma", "Toronto", "Zurich", "Osaka"], correctIndex: 1 },
  ],
  // 10 — hardest
  [
    { prompt: "ISA standard temperature at sea level is this many degrees Celsius.", choices: ["0", "15", "32", "100"], correctIndex: 1 },
    { prompt: "Induced drag is the drag that comes from producing this.", choices: ["Thrust", "Lift", "Noise", "Contrails only"], correctIndex: 1 },
    { prompt: "The tropopause in the mid-latitudes is typically near this altitude.", choices: ["10,000 ft", "36,000 ft", "80,000 ft", "5,000 ft"], correctIndex: 1 },
    { prompt: "A “cross-check” call in the cabin means doors have been verified as what?", choices: ["Cleaned", "Armed or disarmed", "Painted", "Unlocked for boarding only"], correctIndex: 1 },
    { prompt: "The first scheduled U.S. airline passenger flight (1914) flew to Tampa from this Florida city.", choices: ["Miami", "St. Petersburg", "Orlando", "Key West"], correctIndex: 1 },
  ],
]

function shuffleChoices(question: MillionaireQuestion): MillionaireQuestion {
  const indexed = question.choices.map((choice, index) => ({ choice, index }))
  const mixed = shuffle(indexed)
  const correctIndex = mixed.findIndex((item) => item.index === question.correctIndex) as 0 | 1 | 2 | 3
  return {
    prompt: question.prompt,
    choices: [mixed[0].choice, mixed[1].choice, mixed[2].choice, mixed[3].choice],
    correctIndex,
  }
}

export function dealMillionaireRound(): MillionaireQuestion[] {
  return POOLS.map((pool) => shuffleChoices(pickOne(pool)))
}
