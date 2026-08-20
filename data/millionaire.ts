// Millionaire bank: 10 difficulty tiers. dealMillionaireRound() picks one per
// tier and shuffles answer order so every round is a new, harder climb.

import { pickOne, shuffle } from "@/lib/shuffle"

export type MillionaireQuestion = {
  prompt: string
  choices: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

export type PrizeTier = {
  questionNumber: number
  label: string
}

export const MILLIONAIRE_PRIZES: PrizeTier[] = [
  { questionNumber: 1, label: "3% Off" },
  { questionNumber: 2, label: "5% Off" },
  { questionNumber: 3, label: "10% Off" },
  { questionNumber: 4, label: "50% Off Shipping" },
  { questionNumber: 5, label: "Free Shipping" },
  { questionNumber: 6, label: "20% Off" },
  { questionNumber: 7, label: "25% Off" },
  { questionNumber: 8, label: "35% Off" },
  { questionNumber: 9, label: "50% Off" },
  { questionNumber: 10, label: "$50 Gift Card" },
]

export const SAFETY_NET_QUESTION = 5

export function prizeIndexForQuestion(questionNumber: number): number | null {
  const index = MILLIONAIRE_PRIZES.findIndex((prize) => prize.questionNumber === questionNumber)
  return index >= 0 ? index : null
}

const POOLS: MillionaireQuestion[][] = [
  // 1 — gettable, not baby-easy
  [
    { prompt: "The cabin crew’s kitchen on an airliner is called this.", choices: ["The pantry", "The galley", "The hold", "The lounge"], correctIndex: 1 },
    { prompt: "On a typical airliner, the captain usually sits in this seat.", choices: ["Right seat", "Left seat", "Jump seat only", "First row of coach"], correctIndex: 1 },
    { prompt: "Republic Airways is headquartered in this U.S. state.", choices: ["Ohio", "Illinois", "Indiana", "Kentucky"], correctIndex: 2 },
    { prompt: "Flight recorders nicknamed “black boxes” are usually painted this color so they can be found.", choices: ["Black", "Bright orange", "Navy", "Yellow-and-black stripes"], correctIndex: 1 },
    { prompt: "Carry-on bags go in this compartment above the seats.", choices: ["The cargo hold", "The overhead bin", "The radome", "The APU bay"], correctIndex: 1 },
    { prompt: "You should fasten this before the airplane pushes back from the gate.", choices: ["Your watch", "Your seat belt", "The engine cowl", "The tray latch only"], correctIndex: 1 },
    { prompt: "Pilots fly from this compartment at the front of the airplane.", choices: ["The galley", "The cockpit", "The tail cone", "The cargo pit"], correctIndex: 1 },
    { prompt: "The force a wing produces to fight weight is called this.", choices: ["Thrust", "Drag", "Lift", "Torque"], correctIndex: 2 },
    { prompt: "Passengers usually board a jet through this walkway from the gate.", choices: ["A jet bridge", "A taxiway", "A hold-short line", "A vortex"], correctIndex: 0 },
    { prompt: "The very back of an airplane, home to the stabilizers, is called this.", choices: ["The nose", "The tail", "The spar", "The slat"], correctIndex: 1 },
  ],
  // 2 — common airline / airport knowledge
  [
    { prompt: "ATL is the airport code for this U.S. megahub.", choices: ["Austin", "Atlanta", "Anchorage", "Atlantic City"], correctIndex: 1 },
    { prompt: "LAX is the airport code for this city.", choices: ["Las Vegas", "Los Angeles", "Lancaster", "Laredo"], correctIndex: 1 },
    { prompt: "This U.S. low-cost airline is known for a heart logo and boarding by groups.", choices: ["Spirit", "Frontier", "Southwest", "Allegiant"], correctIndex: 2 },
    { prompt: "Qantas, whose logo is a kangaroo, is the flag carrier of this country.", choices: ["New Zealand", "Australia", "South Africa", "Qatar"], correctIndex: 1 },
    { prompt: "JFK serves this U.S. city.", choices: ["Boston", "New York", "Philadelphia", "Newark"], correctIndex: 1 },
    { prompt: "Flaps on a wing are used mainly to help with this.", choices: ["Cruise speed", "Takeoff and landing", "In-flight Wi-Fi", "Fuel dumping"], correctIndex: 1 },
    { prompt: "Oxygen masks drop if the cabin loses this.", choices: ["Wi-Fi", "Pressurization", "APU oil", "The IFE system"], correctIndex: 1 },
    { prompt: "This phonetic-alphabet word is how pilots say the letter A.", choices: ["Able", "Alpha", "Ace", "Adam"], correctIndex: 1 },
    { prompt: "“Mayday” on the radio means this.", choices: ["Requesting taxi", "An emergency", "Leaving the gate", "Changing frequency"], correctIndex: 1 },
    { prompt: "IND is the airport code for this Midwest city.", choices: ["Independence", "Indianapolis", "Iowa City", "International Falls"], correctIndex: 1 },
  ],
  // 3 — parts, motion, and passenger ops
  [
    { prompt: "ATC in aviation stands for this.", choices: ["Air Traffic Control", "Airline Ticket Counter", "Automatic Thrust Computer", "Average Taxi Clearance"], correctIndex: 0 },
    { prompt: "Ailerons on the wings primarily control this motion.", choices: ["Pitch", "Roll", "Yaw", "Thrust"], correctIndex: 1 },
    { prompt: "The elevator on the tail primarily controls this motion.", choices: ["Roll", "Yaw", "Pitch", "Reverse"], correctIndex: 2 },
    { prompt: "ORD is a famous airport serving this city.", choices: ["Orlando", "Chicago", "Oakland", "Omaha"], correctIndex: 1 },
    { prompt: "A stall in aviation means the wing has lost too much of this.", choices: ["Thrust", "Lift", "Fuel", "Hydraulic pressure"], correctIndex: 1 },
    { prompt: "The cone on the nose that often hides weather radar is called this.", choices: ["A nacelle", "A radome", "A slat", "A pylon"], correctIndex: 1 },
    { prompt: "Fuel on most airliners is stored primarily inside these.", choices: ["The tail cone", "The wings", "The overhead bins", "The seats"], correctIndex: 1 },
    { prompt: "A typical narrow-body airliner has this many main cabin aisles.", choices: ["None", "One", "Two", "Three"], correctIndex: 1 },
    { prompt: "First class on a single-aisle jet is usually toward this end of the airplane.", choices: ["The tail", "The front", "Over the wing only", "The cargo pit"], correctIndex: 1 },
    { prompt: "“Roger” on the radio most nearly means this.", choices: ["I disagree", "I received your message", "Cleared for takeoff", "Mayday"], correctIndex: 1 },
  ],
  // 4 — medium systems and codes
  [
    { prompt: "Yaw is controlled mainly with this flight control.", choices: ["Aileron", "Rudder", "Flap", "Spoiler"], correctIndex: 1 },
    { prompt: "The tube on the nose that helps measure airspeed is this.", choices: ["A static port", "A pitot tube", "A vortex generator", "A trim tab"], correctIndex: 1 },
    { prompt: "An APU is a small engine usually located in this part of the airplane.", choices: ["The nose", "The tail", "Inside a winglet", "Under a passenger seat"], correctIndex: 1 },
    { prompt: "Winglets on the tips are designed mainly to reduce this.", choices: ["Cabin noise", "Induced drag", "Tire wear", "Radio static"], correctIndex: 1 },
    { prompt: "Heathrow’s airport code is this.", choices: ["LON", "LHR", "HTH", "LCY"], correctIndex: 1 },
    { prompt: "MIA is the airport code for this city.", choices: ["Minneapolis", "Miami", "Milwaukee", "Memphis"], correctIndex: 1 },
    { prompt: "A jet engine produces thrust by throwing exhaust this way.", choices: ["Forward", "Backward", "Straight up", "In a spiral only"], correctIndex: 1 },
    { prompt: "Slats deploy from this part of the wing for extra lift at low speed.", choices: ["The trailing edge", "The leading edge", "The winglet", "The flap track only"], correctIndex: 1 },
    { prompt: "DFW serves this Texas metro.", choices: ["Houston", "Dallas–Fort Worth", "San Antonio", "El Paso"], correctIndex: 1 },
    { prompt: "The person in the right seat is often called this on the radio, not “copilot.”", choices: ["Relief captain", "First officer", "Flight engineer", "Observer"], correctIndex: 1 },
  ],
  // 5 — safety net: famous firsts and show knowledge
  [
    { prompt: "Mach 1 is roughly the speed of this.", choices: ["Light", "Sound", "A 737 at cruise", "Escape velocity"], correctIndex: 1 },
    { prompt: "The Wright brothers’ first powered flight happened in this year.", choices: ["1893", "1903", "1914", "1927"], correctIndex: 1 },
    { prompt: "That first powered flight happened in this U.S. state.", choices: ["Ohio", "North Carolina", "Virginia", "Florida"], correctIndex: 1 },
    { prompt: "In Top Gun, Maverick flies for which U.S. service?", choices: ["Air Force", "Navy", "Army", "Marines only"], correctIndex: 1 },
    { prompt: "US Airways Flight 1549 ditched in this river after bird strikes.", choices: ["East River", "Hudson", "Potomac", "Delaware"], correctIndex: 1 },
    { prompt: "Charles Lindbergh’s solo Atlantic airplane was named Spirit of this city.", choices: ["New York", "St. Louis", "Paris", "Chicago"], correctIndex: 1 },
    { prompt: "This Boeing wide-body with an upper-deck hump is nicknamed the Queen of the Skies.", choices: ["737", "747", "757", "777"], correctIndex: 1 },
    { prompt: "The first person to break the sound barrier, in 1947, was this test pilot.", choices: ["Neil Armstrong", "Chuck Yeager", "John Glenn", "Scott Crossfield"], correctIndex: 1 },
    { prompt: "This Franco-British airliner cruised at more than twice the speed of sound.", choices: ["Comet", "Concorde", "Tu-154", "VC10"], correctIndex: 1 },
    { prompt: "Amelia Earhart disappeared in 1937 while attempting to fly around this.", choices: ["The United States", "The world", "The North Pole", "South America"], correctIndex: 1 },
  ],
  // 6 — Republic and the regional industry
  [
    { prompt: "Republic’s airliners are built by this Brazilian manufacturer.", choices: ["Bombardier", "Embraer", "ATR", "Mitsubishi"], correctIndex: 1 },
    { prompt: "Republic’s jet fleet is made up of these two E-Jet models.", choices: ["E190 and E195", "E170 and E175", "E135 and E145", "E175-E2 only"], correctIndex: 1 },
    { prompt: "Republic Airways Holdings trades on the NASDAQ under this ticker.", choices: ["RAIR", "RJET", "REPA", "YX"], correctIndex: 1 },
    { prompt: "Republic’s headquarters and Aviation Campus are in this Indianapolis-area city.", choices: ["Fishers", "Carmel", "Greenwood", "Noblesville"], correctIndex: 1 },
    { prompt: "Republic’s IATA flight-code prefix is these two letters.", choices: ["RW", "YX", "RA", "CH"], correctIndex: 1 },
    { prompt: "Republic’s in-house flight school is known by this four-letter name.", choices: ["RISE", "LIFT", "WING", "PATH"], correctIndex: 1 },
    { prompt: "LIFT student pilots train on DA40 and DA42 airplanes built by this manufacturer.", choices: ["Cessna", "Piper", "Diamond", "Cirrus"], correctIndex: 2 },
    { prompt: "Republic traces its roots to this New York–founded regional, started by Joel and Gloria Hall.", choices: ["Comair", "Chautauqua Airlines", "Mesa Airlines", "Air Wisconsin"], correctIndex: 1 },
    { prompt: "In 2025 Republic combined with this Phoenix-based regional, creating the world’s largest Embraer operator.", choices: ["SkyWest", "Mesa", "Envoy", "PSA"], correctIndex: 1 },
    { prompt: "Republic typically flies as a branded regional for American, Delta, and this other U.S. major.", choices: ["Alaska", "United", "JetBlue", "Southwest"], correctIndex: 1 },
  ],
  // 7 — procedures, weather, harder codes
  [
    { prompt: "A transponder squawk of 7700 tells ATC you have this.", choices: ["Lost communications", "An emergency", "A hijacking", "A medical only"], correctIndex: 1 },
    { prompt: "The “sterile cockpit” rule generally applies below this altitude.", choices: ["3,000 feet", "10,000 feet", "18,000 feet", "FL350"], correctIndex: 1 },
    { prompt: "YYZ is the airport code for this city.", choices: ["Yuma", "Toronto", "Vancouver", "Montreal"], correctIndex: 1 },
    { prompt: "CDG is the main international airport serving this city.", choices: ["Rome", "Paris", "Madrid", "Brussels"], correctIndex: 1 },
    { prompt: "Clear-air turbulence is dangerous because it often has no these to warn you.", choices: ["Jet streams", "Clouds", "PIREPs", "METARs"], correctIndex: 1 },
    { prompt: "Pilots avoid these towering thunderstorm clouds because of severe turbulence and lightning.", choices: ["Cirrus", "Stratus", "Cumulonimbus", "Altocumulus"], correctIndex: 2 },
    { prompt: "A sudden, powerful downdraft near the ground that can ruin a takeoff or landing is this.", choices: ["A mountain wave", "A microburst", "Virga", "A sea breeze"], correctIndex: 1 },
    { prompt: "V1 on the takeoff roll is the speed after which you are committed to this.", choices: ["Rejecting", "Continuing the takeoff", "Rotating only", "Retracting flaps"], correctIndex: 1 },
    { prompt: "“Rotate” on the takeoff roll means lift the nose to this.", choices: ["Cruise pitch", "Takeoff attitude", "A stall", "A go-around"], correctIndex: 1 },
    { prompt: "A METAR is a routine report of this at an airport.", choices: ["Delays", "Weather", "Fuel prices", "Gate assignments"], correctIndex: 1 },
  ],
  // 8 — regs, ATC, and airframes
  [
    { prompt: "ICAO, the U.N. aviation agency, is headquartered in this city.", choices: ["Geneva", "Montreal", "Vienna", "The Hague"], correctIndex: 1 },
    { prompt: "The 1978 U.S. law that let airlines set their own routes and fares is this.", choices: ["Open Skies Act", "Airline Deregulation Act", "Federal Aviation Act", "Wright Amendment"], correctIndex: 1 },
    { prompt: "The 1944 Chicago meeting created the modern framework for this.", choices: ["Space law", "International civil aviation", "Maritime salvage", "Railroad gauges"], correctIndex: 1 },
    { prompt: "Squawk 7600 means you have lost this.", choices: ["An engine", "Radio communication", "Hydraulics", "The flight plan"], correctIndex: 1 },
    { prompt: "Squawk 7500 is reserved for this situation.", choices: ["Medical emergency", "Hijacking", "Minimum fuel", "Bird strike"], correctIndex: 1 },
    { prompt: "Besides the flight data recorder, the other “black box” is this.", choices: ["The CVR — cockpit voice recorder", "The QAR only", "The transponder", "The FDR duplicate"], correctIndex: 0 },
    { prompt: "QNH is an altimeter setting that reads altitude above this.", choices: ["The field", "Sea level", "The tropopause", "The aircraft"], correctIndex: 1 },
    { prompt: "A “hold short” instruction means stop before this.", choices: ["The gate", "The runway", "10,000 feet", "The FAF"], correctIndex: 1 },
    { prompt: "KLM is the flag carrier of this country.", choices: ["Belgium", "the Netherlands", "Denmark", "Luxembourg"], correctIndex: 1 },
    { prompt: "The world’s first commercial jet airliner, in 1952, was this British type.", choices: ["VC10", "de Havilland Comet", "Caravelle", "Trident"], correctIndex: 1 },
  ],
  // 9 — hard science and history
  [
    { prompt: "Faster air over the top of a wing means this kind of pressure, which helps create lift.", choices: ["Higher pressure", "Lower pressure", "The same pressure", "Negative mass"], correctIndex: 1 },
    { prompt: "Induced drag is the drag that comes from producing this.", choices: ["Thrust", "Lift", "Form drag", "Wave drag"], correctIndex: 1 },
    { prompt: "A stall happens when the wing exceeds this.", choices: ["Vne", "The critical angle of attack", "Maximum Mach", "Best glide"], correctIndex: 1 },
    { prompt: "An airplane rolls around this axis, from nose to tail.", choices: ["Lateral", "Vertical", "Longitudinal", "Magnetic"], correctIndex: 2 },
    { prompt: "The first 747 entered airline service in 1970 with this U.S. carrier.", choices: ["TWA", "Pan Am", "United", "American"], correctIndex: 1 },
    { prompt: "Standard sea-level atmospheric pressure is about this many inches of mercury.", choices: ["19.92", "29.92", "39.92", "1013 only, never Hg"], correctIndex: 1 },
    { prompt: "LIFT Academy first opened its hangar doors at Indianapolis in this year.", choices: ["2014", "2016", "2018", "2020"], correctIndex: 2 },
    { prompt: "LIFT is an acronym for this phrase.", choices: ["Learn In Fast Time", "Leadership In Flight Training", "Line Indoctrination Flight Team", "Licensed Instructor Flight Track"], correctIndex: 1 },
    { prompt: "This regional, brought under Republic in 2005, fully merged into Republic in 2017.", choices: ["Comair", "Shuttle America", "ExpressJet", "GoJet"], correctIndex: 1 },
    { prompt: "The original 737 MAX grounding was tied to this stall-prevention system.", choices: ["TCAS", "MCAS", "GPWS", "ADIRU"], correctIndex: 1 },
  ],
  // 10 — expert
  [
    { prompt: "ISA standard temperature at sea level is this many degrees Celsius.", choices: ["0", "10", "15", "20"], correctIndex: 2 },
    { prompt: "In the mid-latitudes, the tropopause is typically near this altitude.", choices: ["18,000 ft", "25,000 ft", "36,000 ft", "51,000 ft"], correctIndex: 2 },
    { prompt: "The standard ISA lapse rate is about this many °C per 1,000 feet.", choices: ["1", "2", "3.5", "5"], correctIndex: 1 },
    { prompt: "Chautauqua Airlines — Republic’s earliest predecessor — began flight operations in this year.", choices: ["1973", "1974", "1979", "1998"], correctIndex: 1 },
    { prompt: "In 1998 this Greenwich, Connecticut firm bought the holding company that became Republic Airways Holdings.", choices: ["Blackstone", "Wexford Management", "KKR", "Carlyle"], correctIndex: 1 },
    { prompt: "Effective June 2026, this executive succeeded David Grizzle as Republic’s President and CEO.", choices: ["Bryan Bedford", "Matt Koscal", "Joe O’Gorman", "Wayne Heller"], correctIndex: 1 },
    { prompt: "The first scheduled U.S. airline passenger flight, in 1914, flew to Tampa from this Florida city.", choices: ["Miami", "St. Petersburg", "Jacksonville", "Key West"], correctIndex: 1 },
    { prompt: "Mach 1 at sea level is about this many miles per hour.", choices: ["500", "660", "760", "880"], correctIndex: 2 },
    { prompt: "LIFT’s Galveston campus won a contract to train candidates for this space agency.", choices: ["ESA", "NASA", "Space Force only", "FAA"], correctIndex: 1 },
    { prompt: "Density altitude rises when temperature and this both increase.", choices: ["Altimeter setting", "Humidity", "Headwind", "QNH"], correctIndex: 1 },
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
