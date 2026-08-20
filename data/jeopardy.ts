// Jeopardy question bank. Each category has 5 difficulty buckets ($200 easy → $1000 hard).
// dealJeopardyBoard() picks one clue per cell so every turn is a different board.
// Host rule: never put the answer (or its key proper name / code) in the clue.

import { pickOne, shuffle } from "@/lib/shuffle"

export type JeopardyClue = {
  clue: string
  answer: string
}

export type DealtCategory = {
  name: string
  clues: JeopardyClue[]
}

export type DailyDoubleCell = {
  categoryIndex: number
  valueIndex: number
}

export const CLUE_VALUES = [200, 400, 600, 800, 1000] as const

type CategoryPool = {
  name: string
  pools: JeopardyClue[][]
}

const CATEGORY_POOLS: CategoryPool[] = [
  {
    name: "Airline Trivia",
    pools: [
      [
        { clue: "This U.S. low-cost airline is known for its heart logo and boarding by groups.", answer: "What is Southwest?" },
        { clue: "This airline’s name is also a direction on a compass.", answer: "What is Southwest?" },
        { clue: "Delta, United, and American are often called the “Big Three” of this country.", answer: "What is the United States?" },
        { clue: "This word describes a company that flies paying passengers: a commercial ____.", answer: "What is an airline?" },
      ],
      [
        { clue: "This Australian airline’s flying kangaroo has hopped around the world since 1947.", answer: "What is Qantas?" },
        { clue: "This Irish low-cost carrier is famous for charging for almost everything, even printing a boarding pass.", answer: "What is Ryanair?" },
        { clue: "This U.K. flag carrier’s tail still shows a Union Flag-inspired design.", answer: "What is British Airways?" },
        { clue: "This Middle Eastern airline’s name is also a title for a ruler.", answer: "What is Emirates?" },
      ],
      [
        { clue: "Founded in 1919, this Dutch airline is often called the world’s oldest still flying under its original name.", answer: "What is KLM?" },
        { clue: "This now-defunct U.S. airline was nicknamed “the World’s Most Experienced Airline.”", answer: "What is Pan Am?" },
        { clue: "This German flag carrier’s name means “in the air” in Latin-ish branding — and it’s based in Frankfurt.", answer: "What is Lufthansa?" },
        { clue: "This U.S. airline uses a cranberry-colored widget on its tail.", answer: "What is Delta?" },
      ],
      [
        { clue: "In 1978, Congress passed this act that let U.S. airlines set their own routes and fares.", answer: "What is the Airline Deregulation Act?" },
        { clue: "This grouping of airlines includes United, Lufthansa, and Air Canada.", answer: "What is Star Alliance?" },
        { clue: "Oneworld’s U.S. founding member is this Dallas-based airline.", answer: "What is American Airlines?" },
        { clue: "This Atlanta-based airline is a founding member of SkyTeam.", answer: "What is Delta?" },
      ],
      [
        { clue: "The first scheduled airline passenger flight in the U.S. flew between St. Petersburg and this Florida city in 1914.", answer: "What is Tampa?" },
        { clue: "This IATA code prefix is used by Republic Airways flights under the American Eagle brand — two letters.", answer: "What is YX? (accept American Eagle / Republic)" },
        { clue: "This 1944 meeting in Illinois created the modern rules of international civil aviation.", answer: "What is the Chicago Convention?" },
        { clue: "ICAO, the U.N. aviation agency, is headquartered in this Canadian city.", answer: "What is Montreal?" },
      ],
    ],
  },
  {
    name: "Air Science",
    pools: [
      [
        { clue: "This four-letter force is what a wing produces to fight gravity.", answer: "What is lift?" },
        { clue: "This force pulls every airplane toward the Earth.", answer: "What is gravity? (or weight)" },
        { clue: "Pilots call a sudden, bumpy change in airflow this.", answer: "What is turbulence?" },
        { clue: "The front edge of a wing is called the leading ____.", answer: "What is edge?" },
      ],
      [
        { clue: "A jet that flies faster than sound is described as this.", answer: "What is supersonic?" },
        { clue: "Flaps on the back of a wing are used mostly to increase lift at this phase of flight.", answer: "What is landing? (or takeoff)" },
        { clue: "This movable tail surface pitches the nose up or down.", answer: "What is the elevator?" },
        { clue: "Ailerons on the wings primarily control this motion.", answer: "What is roll?" },
      ],
      [
        { clue: "An airplane rolls around this axis that runs from nose to tail.", answer: "What is the longitudinal axis?" },
        { clue: "Yaw is rotation around this axis that points up through the cabin.", answer: "What is the vertical axis?" },
        { clue: "The rudder is found on this part of the tail.", answer: "What is the vertical stabilizer? (or fin)" },
        { clue: "Pitot tubes help measure this, which you see as airspeed.", answer: "What is dynamic pressure? (accept airspeed / ram air)" },
      ],
      [
        { clue: "Faster air over the top of a wing means this kind of pressure, which helps create lift.", answer: "What is lower (or low) pressure?" },
        { clue: "This 18th-century scientist’s principle is often used to explain lift.", answer: "Who is Bernoulli?" },
        { clue: "A stall happens when the wing exceeds this angle relative to the oncoming air.", answer: "What is the critical angle of attack?" },
        { clue: "ISA standard sea-level temperature is this many degrees Celsius.", answer: "What is 15?" },
      ],
      [
        { clue: "Mach 1 at sea level is about this many miles per hour (within 30).", answer: "What is 760 mph? (accept 730–790)" },
        { clue: "A transonic jet is flying near this Mach number.", answer: "What is Mach 1? (accept 0.8–1.2)" },
        { clue: "Wingtip vortices are a form of this drag caused by lift itself.", answer: "What is induced drag?" },
        { clue: "The tropopause sits near this altitude in feet in the mid-latitudes (within 5,000).", answer: "What is 36,000 feet? (accept 30,000–40,000)" },
      ],
    ],
  },
  {
    name: "Movie Cockpit",
    pools: [
      [
        { clue: "In this 1980 spoof, a passenger has to land a jet after the crew eats bad fish.", answer: "What is Airplane!?" },
        { clue: "Samuel L. Jackson has had it with these reptiles at 30,000 feet.", answer: "What are snakes?" },
        { clue: "Don’t call him Shirley — that’s the running gag in this comedy.", answer: "What is Airplane!?" },
        { clue: "This 2012 Denzel Washington film is about a troubled airline captain.", answer: "What is Flight?" },
      ],
      [
        { clue: "Tom Hanks talks to a volleyball named Wilson after this FedEx plane goes down.", answer: "What is Cast Away?" },
        { clue: "In Top Gun, Maverick’s copilot and best friend is nicknamed this.", answer: "Who is Goose?" },
        { clue: "This 2022 sequel brought Tom Cruise back to the Naval Fighter Weapons School.", answer: "What is Top Gun: Maverick?" },
        { clue: "Leonardo DiCaprio impersonates a Pan Am pilot in this Spielberg film.", answer: "What is Catch Me If You Can?" },
      ],
      [
        { clue: "This 2016 film follows the ditching of US Airways 1549 in the Hudson.", answer: "What is Sully?" },
        { clue: "Harrison Ford plays a president who must retake this hijacked flying Oval Office.", answer: "What is Air Force One?" },
        { clue: "This 1996 film stars Kurt Russell trying to retake a hijacked 747.", answer: "What is Executive Decision?" },
        { clue: "John Cusack tries to land a 747 in this 1997 action film after the crew is taken out.", answer: "What is Con Air?" },
      ],
      [
        { clue: "In Catch Me If You Can, young Frank Abagnale impersonates a pilot for this real airline.", answer: "What is Pan Am?" },
        { clue: "This 1986 film coined “Talk to me, Goose.”", answer: "What is Top Gun?" },
        { clue: "Tom Hanks plays Chesley Sullenberger in this Clint Eastwood film.", answer: "What is Sully?" },
        { clue: "This 2004 film follows a doomed flight to Paris and a mysterious island — Oceanic 815.", answer: "What is Lost? (TV, accept it)" },
      ],
      [
        { clue: "Robert Zemeckis directed this 2000 film where a FedEx plane goes down in the Pacific.", answer: "What is Cast Away?" },
        { clue: "This 1983 film follows test pilots chasing the sound barrier — “The Right ____.”", answer: "What is Stuff?" },
        { clue: "In 2012’s Flight, Denzel’s character is named Whip ____.", answer: "Who is Whitaker?" },
        { clue: "Kareem Abdul-Jabbar plays the copilot in this 1980 comedy.", answer: "What is Airplane!?" },
      ],
    ],
  },
  {
    name: "Airport Codes",
    pools: [
      [
        { clue: "ATL is the code for this Georgia megahub, often the world’s busiest.", answer: "What is Atlanta?" },
        { clue: "LAX puts you on the ground in this California city.", answer: "What is Los Angeles?" },
        { clue: "JFK serves this U.S. city.", answer: "What is New York?" },
        { clue: "ORD is the code for this Chicago airport.", answer: "What is O’Hare?" },
      ],
      [
        { clue: "DFW is the huge hub serving this Texas metro.", answer: "What is Dallas–Fort Worth?" },
        { clue: "MIA is the code for this Florida international airport.", answer: "What is Miami?" },
        { clue: "SEA is the code for this Pacific Northwest hub.", answer: "What is Seattle? (Sea-Tac)" },
        { clue: "DEN is the code for this mile-high airport.", answer: "What is Denver?" },
      ],
      [
        { clue: "IND is the code for this Midwest cargo powerhouse — and a hometown favorite.", answer: "What is Indianapolis?" },
        { clue: "LHR is the code for this London airport.", answer: "What is Heathrow?" },
        { clue: "CDG is the main international airport of this European capital.", answer: "What is Paris?" },
        { clue: "YYZ is the surprising code for this Canadian city.", answer: "What is Toronto?" },
      ],
      [
        { clue: "This three-letter code belongs to Chicago Midway, not O’Hare.", answer: "What is MDW?" },
        { clue: "EWR is the code for this New Jersey airport named after a city.", answer: "What is Newark?" },
        { clue: "IAD is the code for this D.C.-area airport named after a president.", answer: "What is Dulles? (Washington Dulles)" },
        { clue: "BOS is the code for this Massachusetts airport, also called Logan.", answer: "What is Boston?" },
      ],
      [
        { clue: "Phoenix Sky Harbor uses this three-letter code.", answer: "What is PHX?" },
        { clue: "NRT is the main international code for this Japanese capital’s Narita airport.", answer: "What is Tokyo?" },
        { clue: "The code for Honolulu International is this three-letter combo.", answer: "What is HNL?" },
        { clue: "This Icelandic airport code, KEF, is a transatlantic fuel-stop favorite.", answer: "What is Keflavík? (Reykjavík area)" },
      ],
    ],
  },
  {
    name: "Cabin Life",
    pools: [
      [
        { clue: "For takeoff and landing, your seatback and this little table must be up.", answer: "What is the tray table?" },
        { clue: "The lighted path on the cabin floor leads you toward these.", answer: "What are the exits?" },
        { clue: "You are asked to buckle this before the aircraft moves.", answer: "What is your seat belt?" },
        { clue: "Carry-ons go in this compartment above your seat.", answer: "What is the overhead bin?" },
      ],
      [
        { clue: "Flight attendants sit on these fold-down seats for takeoff and landing.", answer: "What are jump seats?" },
        { clue: "This inflatable yellow device is under your seat if you land on water.", answer: "What is a life vest? (life jacket)" },
        { clue: "The cabin crew works out of this kitchen area.", answer: "What is the galley?" },
        { clue: "Oxygen masks drop from here if the cabin loses pressure.", answer: "What is the overhead panel? (ceiling)" },
      ],
      [
        { clue: "“Cross-check” is a cabin call that the doors have been verified as this.", answer: "What is armed or disarmed?" },
        { clue: "In a decompression, you should put your mask on before helping this person.", answer: "Who is someone else? (others / children)" },
        { clue: "This chime often tells the crew the seat-belt sign has changed.", answer: "What is the ding? (accept seat-belt chime)" },
        { clue: "First class sits toward this end of the airplane.", answer: "What is the front? (forward)" },
      ],
      [
        { clue: "Below 10,000 feet, crews follow this “quiet” rule so pilots can focus.", answer: "What is sterile cockpit?" },
        { clue: "Arming a door attaches this slide so it can inflate in an evacuation.", answer: "What is the girt bar? (accept slide)" },
        { clue: "This briefing card in the seatback shows exits and brace positions.", answer: "What is the safety card?" },
        { clue: "A typical narrow-body has this many main cabin aisles.", answer: "What is one?" },
      ],
      [
        { clue: "FAA rules generally require a life vest demonstration on flights that may fly beyond this many miles from land.", answer: "What is 50 miles? (accept overwater)" },
        { clue: "The brace position is used for this kind of landing.", answer: "What is an emergency landing? (or crash)" },
        { clue: "Cabin altitude on most airliners is kept near this many feet (within 2,000).", answer: "What is 6,000–8,000 feet?" },
        { clue: "This two-word call means get out now — leave bags behind.", answer: "What is “evacuate, evacuate”? (accept evacuation)" },
      ],
    ],
  },
  {
    name: "Cartoon Skies",
    pools: [
      [
        { clue: "This big-eared Disney elephant takes flight without an engine.", answer: "What is Dumbo?" },
        { clue: "Snoopy’s imaginary WWI fighter is this type of Sopwith plane.", answer: "What is a (Sopwith) Camel?" },
        { clue: "This Pixar crop duster dreams of racing in the movie Planes.", answer: "Who is Dusty Crophopper?" },
        { clue: "Mickey’s dog, who sometimes wears a pilot’s cap in cartoons, is named this.", answer: "Who is Pluto?" },
      ],
      [
        { clue: "How to Train Your Dragon stars this Night Fury who soars with Hiccup.", answer: "Who is Toothless?" },
        { clue: "In Up, this retired balloon salesman ties his house to thousands of balloons.", answer: "Who is Carl Fredricksen?" },
        { clue: "Buzz Lightyear’s catchphrase goes to infinity and this.", answer: "What is beyond?" },
        { clue: "This Looney Tunes duck sometimes wears a pilot helmet and goggles.", answer: "Who is Daffy Duck? (accept others if clearly a toon pilot)" },
      ],
      [
        { clue: "This Studio Ghibli film follows a pig fighter pilot over the Adriatic.", answer: "What is Porco Rosso?" },
        { clue: "In The Incredibles, this baby unexpectedly goes airborne in the jungle jet scene.", answer: "Who is Jack-Jack?" },
        { clue: "Pete “Maverick” isn’t a cartoon — this Disney film stars a hawk named Orville who flies a mouse.", answer: "What is The Rescuers?" },
        { clue: "This 2014 DreamWorks film follows a boy, a girl, and a bunch of flying dragons in Berk.", answer: "What is How to Train Your Dragon 2?" },
      ],
      [
        { clue: "Hayao Miyazaki’s 2013 film about a boy who designs planes is called The Wind ____.", answer: "What is Rises? (The Wind Rises)" },
        { clue: "In Toy Story, this space ranger is not actually a flying toy — he just thinks he is.", answer: "Who is Buzz Lightyear?" },
        { clue: "This pink Panther is not a pilot, but this 1960s bird always outruns a coyote — ACME jet packs included.", answer: "Who is the Road Runner?" },
        { clue: "Disney’s racing champion Ripslinger is a villain in this 2013 talking-airplane movie.", answer: "What is Planes?" },
      ],
      [
        { clue: "This 1992 Disney film features a street thief on a magic carpet, not a 737.", answer: "What is Aladdin?" },
        { clue: "Kiki’s Delivery Service flies on this household object.", answer: "What is a broom?" },
        { clue: "This Ghibli castle floats in the sky and shares its name with a Swift book, Laputa.", answer: "What is Castle in the Sky?" },
        { clue: "In Wall-E, humans live on this giant cruise-in-space ship.", answer: "What is the Axiom?" },
      ],
    ],
  },
  {
    name: "Plane Parts",
    pools: [
      [
        { clue: "This spinning blade on a small airplane pulls it through the air.", answer: "What is a propeller?" },
        { clue: "The windows in the cockpit are called this, not just “windows.”", answer: "What is the windshield? (accept windscreen)" },
        { clue: "Fuel is often stored inside these big lifting surfaces.", answer: "What are the wings?" },
        { clue: "Passengers walk on this to board from the gate.", answer: "What is a jet bridge? (jetway / airbridge)" },
      ],
      [
        { clue: "This hinged surface on the wing’s trailing edge helps you slow down and land.", answer: "What are flaps?" },
        { clue: "This vertical tail fin keeps the airplane pointed straight.", answer: "What is the vertical stabilizer? (or fin)" },
        { clue: "Landing gear is also called this three-letter nickname.", answer: "What is the LG? (accept gear / undercarriage)" },
        { clue: "This cone on the nose often hides weather radar.", answer: "What is the radome?" },
      ],
      [
        { clue: "Spoilers on top of the wing do this to lift after touchdown.", answer: "What is dump / kill / reduce lift?" },
        { clue: "This engine inlet pod has a French-sounding name; the whole housing is the engine ____.", answer: "What is a nacelle?" },
        { clue: "Slats deploy from this edge of the wing for extra lift.", answer: "What is the leading edge?" },
        { clue: "The tube that measures airspeed on the nose is this.", answer: "What is a pitot tube?" },
      ],
      [
        { clue: "Winglets on the tips reduce this kind of drag from tip vortices.", answer: "What is induced drag?" },
        { clue: "This control surface on the horizontal tail changes pitch.", answer: "What is the elevator?" },
        { clue: "Thrust reversers help do this after landing.", answer: "What is slow the airplane? (braking)" },
        { clue: "An APU is a small engine usually in this part of the airplane.", answer: "What is the tail?" },
      ],
      [
        { clue: "A fly-by-wire jet sends this to the control surfaces instead of cables.", answer: "What are electrical signals? (accept computers / electrons)" },
        { clue: "The “trim tab” is a tiny surface that helps hold this.", answer: "What is attitude? (or a control position)" },
        { clue: "A turbofan bypasses extra air around this hot inner section of the engine.", answer: "What is the core? (engine core / combustor)" },
        { clue: "This hexagonal structure in a wing is strong and light: ____ core.", answer: "What is honeycomb? (or composite)" },
      ],
    ],
  },
  {
    name: "Famous Firsts",
    pools: [
      [
        { clue: "In 1903, these brothers made the first powered, controlled airplane flight.", answer: "Who are the Wright brothers?" },
        { clue: "Charles Lindbergh’s plane on his solo Atlantic hop was named Spirit of this city.", answer: "What is St. Louis?" },
        { clue: "Amelia Earhart was the first woman to fly solo across this ocean.", answer: "What is the Atlantic?" },
        { clue: "The first airplane flight happened in this U.S. state.", answer: "What is North Carolina?" },
      ],
      [
        { clue: "Chuck Yeager first broke this “barrier” in 1947.", answer: "What is the sound barrier?" },
        { clue: "The first jumbo jet to enter service was this Boeing model.", answer: "What is the 747?" },
        { clue: "Sputnik wasn’t a plane — Yuri Gagarin was first human in this.", answer: "What is space?" },
        { clue: "The first woman in space was this Soviet cosmonaut, Valentina ____.", answer: "Who is Tereshkova?" },
      ],
      [
        { clue: "The first nonstop transatlantic flight by airplane was by Alcock and this man in 1919.", answer: "Who is Brown?" },
        { clue: "The first U.S. jet airliner in airline service was this Boeing model.", answer: "What is the 707?" },
        { clue: "Concorde was the first supersonic airliner in this kind of service, with the Tu-144 close behind.", answer: "What is passenger / commercial service?" },
        { clue: "Bessie Coleman was the first African American woman to earn this.", answer: "What is a pilot’s license?" },
      ],
      [
        { clue: "The first flight around the world by airplane was completed in 1924 by this U.S. service.", answer: "What is the U.S. Army? (Army Air Service)" },
        { clue: "Wiley Post was first to fly solo around the world in this year.", answer: "What is 1933?" },
        { clue: "The first landing on the Moon was in this year.", answer: "What is 1969?" },
        { clue: "The first woman to fly solo around the world was this American, Jerrie ____.", answer: "Who is Mock?" },
      ],
      [
        { clue: "The Wright Flyer flew about this many feet on its first hop (within 20).", answer: "What is 120 feet?" },
        { clue: "This 1992 astronaut was the first African American woman in space.", answer: "Who is Mae Jemison?" },
        { clue: "The first commercial jet, the de Havilland Comet, was built in this country.", answer: "What is Britain? (the UK / England)" },
        { clue: "In 1947, the Bell X-1 that broke the sound barrier was nicknamed Glamorous ____.", answer: "What is Glennis?" },
      ],
    ],
  },
  {
    name: "Cockpit Talk",
    pools: [
      [
        { clue: "Pilots say this word to mean “yes” on the radio.", answer: "What is roger? (or affirmative)" },
        { clue: "This short word means “I received your message.”", answer: "What is roger?" },
        { clue: "“Mayday” is the call for this kind of situation.", answer: "What is an emergency?" },
        { clue: "The person in the right seat is often called this, not “copilot” on the radio.", answer: "What is first officer?" },
      ],
      [
        { clue: "“Wilco” is short for “will ____.”", answer: "What is comply?" },
        { clue: "A “squawk” is a four-digit code you set on this box.", answer: "What is the transponder?" },
        { clue: "“Cleared for takeoff” comes from this facility.", answer: "What is the tower? (ATC)" },
        { clue: "“Pan-pan” is less urgent than mayday; it signals this, not a full emergency.", answer: "What is urgency? (not immediately life-threatening)" },
      ],
      [
        { clue: "Squawk 7700 tells ATC you have this.", answer: "What is an emergency?" },
        { clue: "Squawk 7500 is reserved for this grim situation.", answer: "What is hijacking?" },
        { clue: "“Rotate” on the takeoff roll means lift the nose to this.", answer: "What is takeoff attitude? (leave the ground)" },
        { clue: "V1 is the speed after which you are committed to this.", answer: "What is takeoff? (continue the takeoff)" },
      ],
      [
        { clue: "“George” is slang for this flying helper.", answer: "What is the autopilot?" },
        { clue: "A “sterile cockpit” means no extra chatter below this many feet.", answer: "What is 10,000?" },
        { clue: "“Niner” is how pilots say this digit, so it isn’t lost on the radio.", answer: "What is 9?" },
        { clue: "“Feet wet” means you are flying over this.", answer: "What is water? (the ocean)" },
      ],
      [
        { clue: "“Alpha, Bravo, Charlie” is the start of this spelling system.", answer: "What is the phonetic alphabet? (ICAO / NATO)" },
        { clue: "QNH is the altimeter setting that reads altitude above this.", answer: "What is sea level?" },
        { clue: "A “hold short” instruction means stop before this.", answer: "What is the runway? (or a taxiway intersection)" },
        { clue: "“Go around” means abandon this and climb away.", answer: "What is the landing? (the approach)" },
      ],
    ],
  },
  {
    name: "World Hubs",
    pools: [
      [
        { clue: "This desert city’s airport code is DXB, a giant connecting hub.", answer: "What is Dubai?" },
        { clue: "This city-state’s main airport is famous for an indoor waterfall and the code SIN.", answer: "What is Singapore? (Changi)" },
        { clue: "This Japanese capital is served by both NRT and HND.", answer: "What is Tokyo?" },
        { clue: "FRA is the hub code for this German financial city.", answer: "What is Frankfurt?" },
      ],
      [
        { clue: "AMS is the code for this Dutch airport, home of KLM.", answer: "What is Amsterdam? (Schiphol)" },
        { clue: "ICN is the main international airport for this Korean capital.", answer: "What is Seoul? (Incheon)" },
        { clue: "DOH is the hub of Qatar Airways in this city.", answer: "What is Doha?" },
        { clue: "SYD is the code for this Australian harbor city.", answer: "What is Sydney?" },
      ],
      [
        { clue: "This city’s new mega-hub replaced Atatürk; its code is IST.", answer: "What is Istanbul?" },
        { clue: "GRU is the main international airport for this Brazilian megacity.", answer: "What is São Paulo?" },
        { clue: "MEX is the code for this Latin American capital’s big airport.", answer: "What is Mexico City?" },
        { clue: "JNB is the code for this South African city, O.R. Tambo.", answer: "What is Johannesburg?" },
      ],
      [
        { clue: "This Doha rival in the UAE has the code AUH.", answer: "What is Abu Dhabi?" },
        { clue: "PEK and the newer PKX serve this Chinese capital.", answer: "What is Beijing?" },
        { clue: "HEL is a popular Europe–Asia connector in this Nordic capital.", answer: "What is Helsinki?" },
        { clue: "ADD is Ethiopian Airlines’ hub in this African capital.", answer: "What is Addis Ababa?" },
      ],
      [
        { clue: "This city’s airport, built on reclaimed land, uses the code HKG.", answer: "What is Hong Kong?" },
        { clue: "This Spanish capital’s main airport uses the code MAD.", answer: "What is Madrid? (Barajas)" },
        { clue: "GIG is the code for this Brazilian city’s Tom Jobim airport.", answer: "What is Rio de Janeiro?" },
        { clue: "This Saudi city is served by King Abdulaziz International; the code is JED.", answer: "What is Jeddah?" },
      ],
    ],
  },
  {
    name: "Jet Age",
    pools: [
      [
        { clue: "Boeing’s first successful jetliner was this 7-series that opened the U.S. jet age.", answer: "What is the 707?" },
        { clue: "This wide-body with a hump upstairs is nicknamed the Queen of the Skies.", answer: "What is the 747?" },
        { clue: "Airbus’s double-deck giant that airlines have mostly retired is this.", answer: "What is the A380?" },
        { clue: "This twin-engine Boeing is the world’s most-delivered jet family.", answer: "What is the 737?" },
      ],
      [
        { clue: "The 787 Dreamliner is known for this lightweight material in its body.", answer: "What are composites? (carbon fiber)" },
        { clue: "This four-engine Concorde could cross the Atlantic in about this many hours (within 1).", answer: "What is 3.5 hours? (accept 3–4)" },
        { clue: "The A320 family is famous for this side-mounted controller instead of a yoke.", answer: "What is a sidestick?" },
        { clue: "Regional jets like the E175 are built by this Brazilian company.", answer: "What is Embraer?" },
      ],
      [
        { clue: "The 777 is nicknamed the Triple ____.", answer: "What is Seven?" },
        { clue: "This U.S. regional specialist, Bombardier’s CRJ line, was sold to this company.", answer: "What is Mitsubishi? (MHI / Mitsubishi Heavy)" },
        { clue: "ETOPS rules let twin jets fly far from this.", answer: "What is a diversion airport? (land)" },
        { clue: "The first 747 entered airline service with this U.S. carrier in 1970.", answer: "What is Pan Am?" },
      ],
      [
        { clue: "GE’s GE90 engine was designed for this Boeing twin.", answer: "What is the 777?" },
        { clue: "The A350’s carbon fuselage competes most directly with this Boeing jet.", answer: "What is the 787?" },
        { clue: "This Soviet SST flew passengers briefly and was nicknamed Concordski.", answer: "What is the Tu-144?" },
        { clue: "Lockheed’s TriStar was a wide-body with this many engines.", answer: "What is three?" },
      ],
      [
        { clue: "This stretched Queen of the Skies still carries that nickname on its upper deck.", answer: "What is the 747-8? (accept 747)" },
        { clue: "Pratt & Whitney’s geared turbofan is a big seller on this Airbus family.", answer: "What is the A320neo?" },
        { clue: "The original 737 MAX grounding was tied to this stall-prevention maneuvering system.", answer: "What is MCAS?" },
        { clue: "This British four-engine jet was famous for its rear engines and T-tail.", answer: "What is the VC10?" },
      ],
    ],
  },
  {
    name: "Safety First",
    pools: [
      [
        { clue: "In a water landing, your life vest is usually under this.", answer: "What is your seat?" },
        { clue: "You should put your own oxygen mask on before helping this person.", answer: "Who is someone else? (a child / others)" },
        { clue: "The brace position is used for this kind of landing.", answer: "What is an emergency landing?" },
        { clue: "Leave these behind in an evacuation — they’re not worth it.", answer: "What are bags? (carry-ons)" },
      ],
      [
        { clue: "Cabin crew shout this two-word command when it’s time to get out.", answer: "What is “evacuate, evacuate”? (or “release seat belts”)" },
        { clue: "A demo shows you how to inflate the vest — but not until you are here.", answer: "What is outside? (outside the aircraft)" },
        { clue: "The nearest exit may be behind you; count these as you board.", answer: "What are the rows? (accept exits)" },
        { clue: "Smoke in the cabin: stay this direction, where the air is better.", answer: "What is low? (down)" },
      ],
      [
        { clue: "Overwing exits are used when slides at the doors cannot do this.", answer: "What is deploy? (or be used)" },
        { clue: "A “deadhead” crew member is traveling as this, not working the flight.", answer: "What is a passenger?" },
        { clue: "FAA certification wants a full cabin empty in this many seconds, often cited as a minute and a half.", answer: "What is 90 seconds?" },
        { clue: "Floor-path lighting leads you to these when it’s dark or smoky.", answer: "What are the exits?" },
      ],
      [
        { clue: "A squawk of 7600 means you have lost this.", answer: "What is radio communication?" },
        { clue: "Windshear is a sudden change in this that can ruin a takeoff or landing.", answer: "What is wind? (wind speed/direction)" },
        { clue: "GPWS and TAWS warn you if you get too close to this.", answer: "What is the ground? (terrain)" },
        { clue: "TCAS alerts help you avoid this in the sky.", answer: "What is another aircraft? (a collision)" },
      ],
      [
        { clue: "A “runway incursion” is when an airplane, vehicle, or person wrongly enters this.", answer: "What is the runway? (protected area)" },
        { clue: "CRM in the cockpit stands for Crew Resource ____.", answer: "What is Management?" },
        { clue: "The “Swiss cheese” model of accidents is associated with this psychologist, James ____.", answer: "Who is Reason?" },
        { clue: "FOQA programs review this recorded data to spot safety trends.", answer: "What is flight data? (recorder / QAR data)" },
      ],
    ],
  },
  {
    name: "Weather Watch",
    pools: [
      [
        { clue: "This frozen precipitation can ruin lift if it sticks to a wing.", answer: "What is ice? (icing)" },
        { clue: "Pilots call a thunderstorm’s tall cloud this dangerous type.", answer: "What is cumulonimbus?" },
        { clue: "A METAR is a routine report of this at an airport.", answer: "What is weather?" },
        { clue: "This spinning column of air is a tornado’s cousin over water.", answer: "What is a waterspout?" },
        { clue: "Ceiling is the height of the lowest broken or overcast layer of these.", answer: "What are clouds?" },
      ],
      [
        { clue: "A microburst is a dangerous downward blast of this.", answer: "What is wind? (air)" },
        { clue: "Fog that forms when warm rain falls into cold air near the ground is this kind.", answer: "What is precipitation fog? (accept steam / frontal if close)" },
        { clue: "ATIS is a recorded loop of airport weather and this other info.", answer: "What is airport / NOTAM / runway info?" },
        { clue: "Wind is reported in this many degrees from north, plus speed.", answer: "What is 360? (degrees / magnetic heading)" },
        { clue: "A TAF is a forecast for this place, not the whole country.", answer: "What is an airport? (terminal)" },
      ],
      [
        { clue: "CAT in weather talk is this kind of turbulence with no clouds to warn you.", answer: "What is clear-air turbulence?" },
        { clue: "A squall line is a row of these storms.", answer: "What are thunderstorms?" },
        { clue: "RVR tells a pilot how far they can see down this.", answer: "What is the runway?" },
        { clue: "Freezing rain is extra dangerous because it makes this on the airframe.", answer: "What is clear ice?" },
        { clue: "A sea breeze is wind that blows from this toward land by day.", answer: "What is the water? (the sea)" },
      ],
      [
        { clue: "Jet streams are fast rivers of wind near this atmospheric boundary.", answer: "What is the tropopause?" },
        { clue: "Virga is precipitation that evaporates before hitting this.", answer: "What is the ground?" },
        { clue: "A mountain wave can make rotor clouds on this side of a ridge.", answer: "What is the downwind / lee side?" },
        { clue: "SIGMETs warn of weather that is this to all aircraft.", answer: "What is significant / hazardous?" },
        { clue: "Dew point is the temperature where air becomes this.", answer: "What is saturated? (100% humidity)" },
      ],
      [
        { clue: "ISA lapse rate is about this many degrees C per 1,000 feet (within 0.5).", answer: "What is 2 degrees? (1.98 / 2)" },
        { clue: "A smooth lens-shaped cap cloud sitting on a peak is often this type.", answer: "What is lenticular?" },
        { clue: "PIREPs are weather reports from these people in the air.", answer: "Who are pilots?" },
        { clue: "A “hook echo” on radar can mean this violent storm is nearby.", answer: "What is a tornado? (supercell)" },
        { clue: "Density altitude goes up when temperature and this both go up.", answer: "What is humidity? (or elevation / heat)" },
      ],
    ],
  },
  {
    name: "Flying Heroes",
    pools: [
      [
        { clue: "This “Lucky Lindy” was first to fly solo nonstop from New York to Paris.", answer: "Who is Charles Lindbergh?" },
        { clue: "This aviator disappeared over the Pacific in 1937.", answer: "Who is Amelia Earhart?" },
        { clue: "The Tuskegee Airmen flew for this country in WWII.", answer: "What is the United States?" },
        { clue: "Neil Armstrong was first to walk here after a flight from Earth.", answer: "What is the Moon?" },
        { clue: "This “Red Baron” was a famous WWI German ace.", answer: "Who is von Richthofen? (Manfred von Richthofen)" },
      ],
      [
        { clue: "Bessie Coleman earned her license in this European country because U.S. schools said no.", answer: "What is France?" },
        { clue: "Chuck Yeager broke the sound barrier in this year.", answer: "What is 1947?" },
        { clue: "This general led the “Flying Tigers” in China.", answer: "Who is Claire Chennault?" },
        { clue: "Sally Ride was the first American woman in this.", answer: "What is space?" },
        { clue: "This Navy ace, later a presidential candidate, was shot down over Vietnam: John ____.", answer: "Who is McCain?" },
      ],
      [
        { clue: "Harriet Quimby was the first woman to fly the English ____.", answer: "What is Channel?" },
        { clue: "Eddie Rickenbacker was America’s top ace in this war.", answer: "What is World War I?" },
        { clue: "This “Queen of the Air” set speed records in the 1930s: Jackie ____.", answer: "Who is Cochran?" },
        { clue: "Yuri Gagarin was first human to orbit this planet.", answer: "What is Earth?" },
        { clue: "This WWII U.S. program trained women to ferry military planes; its four-letter acronym is still used.", answer: "What are the WASPs? (Women Airforce Service Pilots)" },
      ],
      [
        { clue: "This Soviet woman was first in space in 1963.", answer: "Who is Tereshkova?" },
        { clue: "Robert Goddard is called the father of modern this kind of rocketry.", answer: "What is liquid-fuel? (rocketry)" },
        { clue: "This Frenchman first flew across the English Channel in 1909.", answer: "Who is Blériot?" },
        { clue: "An international organization of women pilots took its name from this many charter members.", answer: "What is 99?" },
        { clue: "This RAF ace, Douglas Bader, flew despite losing these in an accident.", answer: "What are his legs?" },
      ],
      [
        { clue: "This Italian air theorist argued for strategic bombing in the 1920s.", answer: "Who is Douhet?" },
        { clue: "Wiley Post discovered the jet stream while wearing this early high-altitude garment.", answer: "What is a pressure suit? (accept flying suit)" },
        { clue: "This American led the 1942 raid on Tokyo from a carrier.", answer: "Who is Doolittle?" },
        { clue: "Jean Batten was a record-setting aviator from this island nation.", answer: "What is New Zealand?" },
        { clue: "This “Night Witches” unit was a WWII women’s bomber regiment from this country.", answer: "What is the Soviet Union? (Russia / USSR)" },
      ],
    ],
  },
  {
    name: "Cargo Haul",
    pools: [
      [
        { clue: "FedEx is famous for flying this kind of freight overnight.", answer: "What is packages? (cargo / parcels)" },
        { clue: "The belly of a passenger jet often carries this besides bags.", answer: "What is cargo? (freight / mail)" },
        { clue: "A 747 with a hinged nose for freight is a 747-____ freighter.", answer: "What is 8F? (accept 400F / freighter)" },
        { clue: "UPS brown planes haul this around the world.", answer: "What is packages? (cargo)" },
        { clue: "Live animals in the hold are often called this kind of cargo.", answer: "What is AVI? (live / animal cargo)" },
      ],
      [
        { clue: "IND is a huge sort hub for this overnight carrier in purple and orange.", answer: "What is FedEx?" },
        { clue: "The Antonov An-225, once the world’s largest cargo plane, was named Mriya and built in this country.", answer: "What is Ukraine?" },
        { clue: "A “combi” airplane carries both people and this.", answer: "What is cargo? (freight)" },
        { clue: "ULD is a container or pallet used to load this onto a jet.", answer: "What is cargo?" },
        { clue: "The C-17 Globemaster is a military airlifter built by this Seattle-area company.", answer: "What is Boeing?" },
      ],
      [
        { clue: "Airbus’s Super Transporter hauls parts and is nicknamed after this white Arctic whale.", answer: "What is a beluga? (whale)" },
        { clue: "A 777F is the freighter version of this Boeing twin.", answer: "What is the 777?" },
        { clue: "Louisville’s SDF is a major hub for this brown-and-gold parcel airline.", answer: "What is UPS?" },
        { clue: "The C-5 Galaxy is one of the U.S. Air Force’s biggest of these.", answer: "What is a cargo plane? (airlifter)" },
        { clue: "Dangerous goods in the hold are labeled as this kind of cargo, DG or HAZMAT.", answer: "What is hazardous? (dangerous goods)" },
      ],
      [
        { clue: "The Dreamlifter is a 747 modified to carry this Boeing jet’s wings.", answer: "What is the 787? (Dreamliner)" },
        { clue: "A “nose-loader” freighter opens at this end of the airplane.", answer: "What is the front? (nose)" },
        { clue: "The An-124 Ruslan is a giant cargo jet from this former Soviet design bureau.", answer: "What is Antonov?" },
        { clue: "Memphis is FedEx’s “SuperHub” in this U.S. state.", answer: "What is Tennessee?" },
        { clue: "ACMI is a cargo lease that includes aircraft, crew, maintenance, and this.", answer: "What is insurance?" },
      ],
      [
        { clue: "The Guppy and Super Guppy hauled NASA’s this program hardware, including Saturn stages.", answer: "What is Apollo? (Saturn / space)" },
        { clue: "IATA’s e-AWB is the electronic version of this cargo document.", answer: "What is an air waybill?" },
        { clue: "A 747-8F’s nose cargo door swings up like this.", answer: "What is a visor? (hinged nose)" },
        { clue: "The C-130 Hercules is famous for this kind of short, rough-field cargo work.", answer: "What is tactical airlift? (short-field / dirt strips)" },
        { clue: "Cool-chain cargo must stay at a controlled this.", answer: "What is temperature?" },
      ],
    ],
  },
  {
    name: "War Birds",
    pools: [
      [
        { clue: "The P-51 Mustang was a famous U.S. fighter in this war.", answer: "What is World War II?" },
        { clue: "A “dogfight” is combat between these.", answer: "What are fighter planes? (aircraft)" },
        { clue: "The Spitfire was a legendary fighter from this country.", answer: "What is Britain? (the UK)" },
        { clue: "B-17 Flying Fortress was this kind of airplane, not a fighter.", answer: "What is a bomber?" },
        { clue: "Top Gun trains U.S. Navy pilots who fly these off carriers.", answer: "What are fighters? (jets)" },
      ],
      [
        { clue: "The F-14 Tomcat was the star jet of this 1986 movie.", answer: "What is Top Gun?" },
        { clue: "The Mitsubishi Zero was a fighter for this country in WWII.", answer: "What is Japan?" },
        { clue: "The U-2 is famous for flying this kind of spy mission, very high.", answer: "What is reconnaissance? (spy / high-altitude)" },
        { clue: "The A-10 Warthog is built around this giant gun for close air support.", answer: "What is a cannon? (GAU-8 / 30mm)" },
        { clue: "The SR-71 Blackbird was famous for this: going very, very fast.", answer: "What is speed? (Mach 3 / spy plane)" },
      ],
      [
        { clue: "The F-22 Raptor is a U.S. stealth fighter made by this Skunk Works parent company.", answer: "What is Lockheed Martin?" },
        { clue: "The B-2 Spirit bomber has this distinctive planform, a flying ____.", answer: "What is wing?" },
        { clue: "The Messerschmitt Me 262 was the first operational one of these in WWII.", answer: "What is a jet fighter?" },
        { clue: "The F-4 Phantom served the Navy, Marines, and this U.S. service.", answer: "What is the Air Force?" },
        { clue: "“Ace” traditionally means this many aerial victories.", answer: "What is five?" },
      ],
      [
        { clue: "The F-117 was nicknamed this stealth bird of the night.", answer: "What is Nighthawk?" },
        { clue: "The B-52 Stratofortress first flew in the 1950s and is still called the ____.", answer: "What is BUF? (BUFF / Stratofortress)" },
        { clue: "The Harrier is famous for this kind of takeoff and landing that can start from a hover.", answer: "What is vertical? (VTOL / hovering)" },
        { clue: "The F-35 Lightning II comes in A, B, and this Navy carrier variant letter.", answer: "What is C?" },
        { clue: "The Lancaster was a four-engine RAF bomber of this war.", answer: "What is World War II?" },
      ],
      [
        { clue: "The P-38 Lightning had this unusual tail: two booms.", answer: "What is a twin boom? (two tails)" },
        { clue: "The MiG-21 was a Soviet fighter nicknamed Fishbed by this NATO system.", answer: "What is a reporting name? (NATO)" },
        { clue: "The B-29 that dropped the first atomic bomb was named Enola ____.", answer: "What is Gay?" },
        { clue: "The F-15 Eagle’s unofficial motto is “not a pound for this.”", answer: "What is air-to-ground? (air-to-air)" },
        { clue: "The Avro Vulcan was a British V-bomber with this triangular wing planform.", answer: "What is a delta wing?" },
      ],
    ],
  },
  {
    name: "Sky Music",
    pools: [
      [
        { clue: "Frank Sinatra invited you to share a trip in this classic “Come Fly with ____” tune.", answer: "What is Come Fly with Me?" },
        { clue: "The Beatles sang “Back in the U.S.S.R.” about a flight on this British airline named in the lyrics.", answer: "What is BOAC?" },
        { clue: "“Leaving on a Jet Plane” was a hit for this folk trio of two men and one woman.", answer: "Who are Peter, Paul and Mary?" },
        { clue: "The Foo Fighters’ Dave Grohl named the band after these WWII mystery lights, foo ____.", answer: "What are fighters?" },
        { clue: "“Jet Airliner” is a Steve Miller Band song about this kind of plane.", answer: "What is a jetliner? (airliner)" },
      ],
      [
        { clue: "Elton John’s “Daniel” is traveling tonight on a plane — to this European country named in the song.", answer: "What is Spain?" },
        { clue: "The theme from this 1986 fighter-pilot movie is “Danger Zone.”", answer: "What is Top Gun?" },
        { clue: "“Fly Me to the Moon” was made famous by this crooner, who also invited you to come fly with him.", answer: "Who is Frank Sinatra? (accept Bart Howard as writer)" },
        { clue: "John Denver wrote “Leaving on a Jet Plane,” first recorded by this group.", answer: "Who are Peter, Paul and Mary?" },
        { clue: "AC/DC’s “Thunderstruck” is a staple anthem at this kind of flying event.", answer: "What is an air show?" },
      ],
      [
        { clue: "Berlin’s “Take My Breath Away” was a love theme from this jet movie.", answer: "What is Top Gun?" },
        { clue: "B.o.B.’s hit “Airplanes” featured this Paramore singer.", answer: "Who is Hayley Williams?" },
        { clue: "“Learning to Fly” is a Tom Petty song — and a Pink Floyd track off this 1987 album.", answer: "What is A Momentary Lapse of Reason?" },
        { clue: "The Steve Miller Band also sang “Jet Airliner,” written by this blues guitarist, not Steve.", answer: "Who is Paul Pena?" },
        { clue: "“Learn to Fly” is a hit by this band Dave Grohl started after Nirvana.", answer: "Who are the Foo Fighters?" },
      ],
      [
        { clue: "“Danger Zone” was sung by this artist, a 1980s soundtrack regular.", answer: "Who is Kenny Loggins?" },
        { clue: "The 1960s hit “Those Magnificent Men in Their Flying Machines” was a theme from this kind of film, a comedy.", answer: "What is a movie? (comedy / film)" },
        { clue: "Oasis has a debut single whose title is this aviation speed word.", answer: "What is Supersonic?" },
        { clue: "“Come Fly with Me” was arranged for Sinatra by this man, a big-band writer.", answer: "Who is Billy May?" },
        { clue: "The Canadian band Rush titled a song after flying after dark.", answer: "What is Fly by Night?" },
      ],
      [
        { clue: "Tom Petty’s “Learning to Fly” is on this 1991 album about a landscape with no fences.", answer: "What is Into the Great Wide Open?" },
        { clue: "John Denver, who wrote “Leaving on a Jet Plane,” made this Rocky Mountain state his home.", answer: "What is Colorado?" },
        { clue: "Wings’ 1973 single “Jet” was led by this former Beatle.", answer: "Who is Paul McCartney?" },
        { clue: "Giorgio Moroder co-wrote “Take My Breath Away” with this lyricist.", answer: "Who is Tom Whitlock?" },
        { clue: "The official Air Force song starts “Off we go into the wild blue ____.”", answer: "What is yonder?" },
      ],
    ],
  },
  {
    name: "Pilot Gear",
    pools: [
      [
        { clue: "A pilot’s headset usually has these over the ears and a boom for this.", answer: "What is a mic? (microphone)" },
        { clue: "Sunglasses in the cockpit help with this bright problem.", answer: "What is glare? (sun)" },
        { clue: "A kneeboard clips notes to this part of your leg.", answer: "What is the thigh? (knee)" },
        { clue: "Epaulets on a uniform show this: how senior you are, often by stripes.", answer: "What is rank? (stripes)" },
        { clue: "A flight bag carries charts, a tablet, and this backup you wear on your head.", answer: "What is a headset? (iPad / charts)" },
      ],
      [
        { clue: "A “foggles” visor is used in training to simulate this kind of flying when you can’t see outside.", answer: "What is instrument flying? (hood / IMC)" },
        { clue: "Nomex flight gloves are meant to resist this.", answer: "What is fire? (heat)" },
        { clue: "A Jepp plate is a paper or digital this, used to fly an approach.", answer: "What is a chart? (approach plate)" },
        { clue: "A four-digit squawk code is set on this cockpit box.", answer: "What is the transponder?" },
        { clue: "Many airline pilots now use this Apple tablet as an EFB.", answer: "What is an iPad? (EFB / tablet)" },
      ],
      [
        { clue: "EFB stands for Electronic Flight ____.", answer: "What is Bag?" },
        { clue: "A David Clark unit is a classic of this cockpit audio gear.", answer: "What is a headset?" },
        { clue: "Four stripes on a jacket usually mean you sit in this left seat.", answer: "What is captain?" },
        { clue: "A “bug” on an airspeed indicator is a marker you set for this.", answer: "What is a target speed? (V-speed)" },
        { clue: "Oxygen masks in a small plane are used above this many feet without cabin pressure (a common VFR day limit).", answer: "What is 12,500 feet? (14,000 at night)" },
      ],
      [
        { clue: "A CRJ or E-Jet jumpseater might carry a company ID and this travel document.", answer: "What is a passport? (badge)" },
        { clue: "ANR headsets use electronics to cancel this.", answer: "What is noise?" },
        { clue: "A “whiz wheel” is slang for this circular flight computer.", answer: "What is an E6B? (flight computer)" },
        { clue: "Hi-viz vests on the ramp are this color, usually, so you’re seen.", answer: "What is yellow? (orange / lime)" },
        { clue: "A portable GPS like a Garmin 430 is mounted here, among the gauges.", answer: "What is the instrument panel?" },
      ],
      [
        { clue: "MAF is not gear — a “piddle pack” is a last-resort answer to this long-haul problem.", answer: "What is using the bathroom? (relief)" },
        { clue: "A boom mic should sit at the corner of this.", answer: "What is your mouth?" },
        { clue: "Type-rated pilots carry this certificate besides a medical.", answer: "What is a license? (ATP / certificate)" },
        { clue: "The FAA medical is issued in first, second, or this class.", answer: "What is third?" },
        { clue: "A carrier “meatball” isn’t in the flight bag; night-vision gear goes by this three-letter acronym.", answer: "What are NVGs? (night vision goggles)" },
      ],
    ],
  },
  {
    name: "Cloud Nine",
    pools: [
      [
        { clue: "This fluffy fair-weather cloud looks like cotton.", answer: "What is cumulus?" },
        { clue: "A flat, layered gray cloud that can drizzle is this type.", answer: "What is stratus?" },
        { clue: "High, wispy clouds are made of this, not liquid water droplets.", answer: "What is ice?" },
        { clue: "Fog is basically a cloud that sits here.", answer: "What is on the ground? (at the surface)" },
        { clue: "A contrail is a cloud-like trail behind this.", answer: "What is a jet? (airplane)" },
      ],
      [
        { clue: "Nimbus in a cloud name means this is falling from it.", answer: "What is rain? (precipitation)" },
        { clue: "Altocumulus is found in this layer of the sky, neither high nor low.", answer: "What is middle? (mid-level)" },
        { clue: "A thunderstorm’s anvil is made of this high, icy cloud type.", answer: "What is cirrus? (ice anvil)" },
        { clue: "Mammatus clouds hang like pouches and can mean this nearby.", answer: "What is a storm? (severe weather)" },
        { clue: "The “ceiling” in aviation is the base of these.", answer: "What are clouds?" },
      ],
      [
        { clue: "A towering thunderstorm cloud can punch into this layer above the troposphere.", answer: "What is the stratosphere?" },
        { clue: "A wall cloud can hang under a supercell and precede this.", answer: "What is a tornado?" },
        { clue: "Stratocumulus is a low layer of lumpy clouds, often after this kind of front.", answer: "What is a cold front? (or a storm)" },
        { clue: "Noctilucent clouds are so high they still shine after the sun has done this.", answer: "What is set? (sunset / night)" },
        { clue: "Orographic clouds form when air is forced up this.", answer: "What is a mountain? (terrain)" },
      ],
      [
        { clue: "A pileus is a smooth cap cloud over a fast-growing tower of this fluffy type.", answer: "What is cumulus? (updraft)" },
        { clue: "Kelvin-Helmholtz clouds look like these breaking ocean features.", answer: "What are waves?" },
        { clue: "The Latin “cirrus” means a lock of this.", answer: "What is hair? (curl / lock)" },
        { clue: "A funnel cloud becomes a tornado when it touches this.", answer: "What is the ground?" },
        { clue: "Asperitas was added as an official cloud type in this decade.", answer: "What are the 2010s? (2017)" },
      ],
      [
        { clue: "The World Meteorological Organization’s cloud atlas is based in this Swiss city.", answer: "What is Geneva?" },
        { clue: "Pyrocumulus forms over this kind of disaster.", answer: "What is a fire? (wildfire / volcano)" },
        { clue: "A “ceiling and visibility OK” report might still hide this mid-level layered cloud.", answer: "What is altostratus?" },
        { clue: "Holes that open in a high lumpy cloud deck go by this punchy nickname.", answer: "What is a hole-punch? (fallstreak)" },
        { clue: "The prefix “nimbo-” on a cloud means it is producing this.", answer: "What is precipitation? (rain)" },
      ],
    ],
  },
  {
    name: "Helo World",
    pools: [
      [
        { clue: "A helicopter’s main rotor provides this, the same force a wing makes.", answer: "What is lift? (thrust)" },
        { clue: "The tail rotor on many helicopters fights this spinning problem.", answer: "What is torque?" },
        { clue: "Igor Sikorsky is a pioneer of this kind of flying machine.", answer: "What is the helicopter?" },
        { clue: "Medevac helicopters often land at this kind of hospital pad.", answer: "What is a helipad?" },
        { clue: "A “chopper” is slang for this aircraft.", answer: "What is a helicopter?" },
      ],
      [
        { clue: "The Bell 206 JetRanger is a famous light this.", answer: "What is a helicopter?" },
        { clue: "Autorotation is how a helicopter can land if this fails.", answer: "What is the engine?" },
        { clue: "A Chinook is a big tandem-rotor helicopter used by this U.S. service.", answer: "What is the Army?" },
        { clue: "Coast Guard orange helicopters often rescue people from this.", answer: "What is the water? (the sea)" },
        { clue: "A NOTAR helicopter has no tail rotor; it uses this kind of exhaust steering.", answer: "What is blown air? (fenestron / Coanda)" },
      ],
      [
        { clue: "The AH-64 is this U.S. Army attack helicopter named for a Southwest people.", answer: "What is the Apache?" },
        { clue: "A fenestron is a shrouded tail rotor pioneered by this European helicopter maker (once Eurocopter).", answer: "What is Airbus? (Eurocopter / Aerospatiale)" },
        { clue: "The V-22 Osprey is a tiltrotor that takes off like a helicopter and flies like this.", answer: "What is an airplane?" },
        { clue: "Collective pitch controls this: how much upward force the rotor makes.", answer: "What is lift? (climb / power)" },
        { clue: "Cyclic stick tilts the rotor disc to go this way, forward, back, or sideways.", answer: "What is direction? (forward)" },
      ],
      [
        { clue: "Retreating blade stall can limit this on a helicopter.", answer: "What is speed?" },
        { clue: "The world’s largest production helicopter is this Russian Mil design in the twenties.", answer: "What is the Mi-26?" },
        { clue: "A cushion of air helps a helicopter hover near this.", answer: "What is the ground?" },
        { clue: "The UH-60 is this U.S. utility helicopter named for a Native leader.", answer: "What is the Black Hawk?" },
        { clue: "Settling with power is a dangerous vortex ring state in this kind of downward flight.", answer: "What is a vertical descent? (steep / hover)" },
      ],
      [
        { clue: "Transverse flow effect is a hover-to-forward-flight leftover that rolls the helo this way in U.S. trainers.", answer: "What is right? (laterally)" },
        { clue: "The S-64 Skycrane is a flying crane built from this American designer’s heavylift family.", answer: "What is Sikorsky? (Skycrane / Erickson)" },
        { clue: "LTE is loss of tail-rotor effectiveness, often in this kind of wind.", answer: "What is a tailwind? (crosswind / vortex)" },
        { clue: "The first practical helicopter flights by Sikorsky’s VS-300 were in this decade, the 1930s–40s.", answer: "What is the 1940s? (1939–1940)" },
        { clue: "A “heliport” is to helicopters what an airport is to these.", answer: "What are airplanes?" },
      ],
    ],
  },
  {
    name: "Three Letters",
    pools: [
      [
        { clue: "Chicago’s biggest airport code is a holdover from “Orchard Field,” not the airport’s current name.", answer: "What is ORD?" },
        { clue: "This Georgia megahub’s code is the busiest in the world by passenger traffic.", answer: "What is ATL?" },
        { clue: "This Southern California airport’s code ends in X, a leftover from an old radio era.", answer: "What is LAX?" },
        { clue: "New York’s airport named for a president uses this three-letter code.", answer: "What is JFK?" },
      ],
      [
        { clue: "This Texas airport serves two cities with one hyphenated name.", answer: "What is DFW? (Dallas/Fort Worth)" },
        { clue: "Miami International uses this sunny three-letter code.", answer: "What is MIA?" },
        { clue: "This Pacific Northwest hub’s code is also a three-letter word for ocean.", answer: "What is SEA?" },
        { clue: "The mile-high city’s airport uses this code.", answer: "What is DEN?" },
      ],
      [
        { clue: "London’s main airport is named for a nearby village, not the city — give the airport.", answer: "What is Heathrow?" },
        { clue: "This hometown Midwest cargo powerhouse shares its code with a state’s stock-style ticker.", answer: "What is Indianapolis? (IND)" },
        { clue: "Paris’s main international airport uses this three-letter code.", answer: "What is CDG?" },
        { clue: "A Rush instrumental shares its title with Toronto’s main airport code.", answer: "What is YYZ?" },
      ],
      [
        { clue: "Chicago’s smaller close-in airport, not O’Hare, uses this code.", answer: "What is MDW?" },
        { clue: "This New Jersey airport is named after the city it sits in; its code starts with E.", answer: "What is Newark?" },
        { clue: "Washington’s airport named after a president uses a code that starts with I.", answer: "What is Dulles?" },
        { clue: "Boston Logan uses this three-letter code.", answer: "What is BOS?" },
      ],
      [
        { clue: "Toronto’s main international airport is named for this man, besides the rock-song code.", answer: "What is Pearson? (Lester B. Pearson)" },
        { clue: "Honolulu’s airport uses this three-letter code.", answer: "What is HNL?" },
        { clue: "Tokyo Narita’s main international code is this.", answer: "What is NRT?" },
        { clue: "Iceland’s transatlantic fuel-stop favorite uses a code that starts with K.", answer: "What is Keflavík?" },
      ],
    ],
  },
  {
    name: "Sky Legends",
    pools: [
      [
        { clue: "In 1927, this American made the first solo nonstop transatlantic flight in the Spirit of St. Louis.", answer: "Who is Charles Lindbergh?" },
        { clue: "This aviator disappeared over the Pacific in 1937 while attempting to fly around the world.", answer: "Who is Amelia Earhart?" },
        { clue: "These two brothers from Ohio achieved the first powered flight at Kitty Hawk in 1903.", answer: "Who are the Wright brothers?" },
        { clue: "This “Lucky Lindy” nickname belonged to a transatlantic pioneer.", answer: "Who is Charles Lindbergh?" },
      ],
      [
        { clue: "This test pilot became the first person to break the sound barrier in 1947 in the Bell X-1.", answer: "Who is Chuck Yeager?" },
        { clue: "This African American woman earned her license in France after U.S. schools said no.", answer: "Who is Bessie Coleman?" },
        { clue: "This “Red Baron” was a famous WWI German ace.", answer: "Who is von Richthofen?" },
        { clue: "Neil Armstrong was first to walk here after riding a rocket from Earth.", answer: "What is the Moon?" },
      ],
      [
        { clue: "This woman was the first person to fly solo across the Atlantic more than once, and first woman to fly solo nonstop coast-to-coast in the U.S.", answer: "Who is Amelia Earhart?" },
        { clue: "Sally Ride was the first American woman in this.", answer: "What is space?" },
        { clue: "Eddie Rickenbacker was America’s top ace in this war.", answer: "What is World War I?" },
        { clue: "This American woman was the first of her gender to fly the English Channel.", answer: "Who is Harriet Quimby?" },
      ],
      [
        { clue: "This “Queen of the Air” set speed records in the 1930s: Jackie ____.", answer: "Who is Cochran?" },
        { clue: "This WWII U.S. program trained women to ferry military planes; its four-letter acronym is still used.", answer: "What are the WASPs?" },
        { clue: "Yuri Gagarin was first human to orbit this planet.", answer: "What is Earth?" },
        { clue: "This general led the Flying Tigers in China.", answer: "Who is Claire Chennault?" },
      ],
      [
        { clue: "This Soviet woman was first in space in 1963.", answer: "Who is Valentina Tereshkova?" },
        { clue: "This American led the 1942 raid on Tokyo from a carrier.", answer: "Who is Jimmy Doolittle?" },
        { clue: "Jean Batten was a record-setting aviator from this island nation.", answer: "What is New Zealand?" },
        { clue: "An international organization of women pilots took its name from this many charter members.", answer: "What is 99?" },
      ],
    ],
  },
  {
    name: "Flight Firsts",
    pools: [
      [
        { clue: "This was the first airline to offer scheduled commercial passenger service, starting in Florida in 1914.", answer: "What is the St. Petersburg–Tampa Airboat Line?" },
        { clue: "The first U.S. scheduled airline passenger hop flew between St. Petersburg and this city.", answer: "What is Tampa?" },
        { clue: "The Wright Flyer made history in this U.S. state.", answer: "What is North Carolina?" },
        { clue: "Louis Blériot first flew across this body of water in 1909.", answer: "What is the English Channel?" },
      ],
      [
        { clue: "In 1952, this British aircraft became the world’s first commercial jet airliner.", answer: "What is the de Havilland Comet?" },
        { clue: "The first U.S. jet airliner in airline service was this Boeing model.", answer: "What is the 707?" },
        { clue: "Chuck Yeager’s Bell X-1 first exceeded this speed.", answer: "What is the speed of sound? (Mach 1)" },
        { clue: "The first jumbo jet to enter service was this Boeing model.", answer: "What is the 747?" },
      ],
      [
        { clue: "This Boeing aircraft, which debuted in 1970, was the first widebody “jumbo jet.”", answer: "What is the 747?" },
        { clue: "This Franco-British supersonic jet began commercial service in 1976 and could cross the Atlantic in under 3.5 hours.", answer: "What is the Concorde?" },
        { clue: "The Me 262 was the first operational one of these in WWII.", answer: "What is a jet fighter?" },
        { clue: "Bessie Coleman was the first African American woman to earn this.", answer: "What is a pilot’s license?" },
      ],
      [
        { clue: "This airline operated the first round-the-world commercial flight route, starting in 1947.", answer: "What is Pan Am?" },
        { clue: "The first landing on the Moon was in this year.", answer: "What is 1969?" },
        { clue: "Wiley Post was first to fly solo around the world in this year.", answer: "What is 1933?" },
        { clue: "The first woman in space was this Soviet cosmonaut.", answer: "Who is Tereshkova?" },
      ],
      [
        { clue: "The first certified Black woman astronaut in space from the U.S. was this 1992 flyer.", answer: "Who is Mae Jemison?" },
        { clue: "The original 737 MAX grounding was tied to this maneuvering system.", answer: "What is MCAS?" },
        { clue: "A 1944 meeting in Illinois created the framework for this.", answer: "What is international civil aviation?" },
        { clue: "KLM is often cited as the world’s oldest airline still flying under its original name, founded in this year.", answer: "What is 1919?" },
      ],
    ],
  },
  {
    name: "Air Anatomy",
    pools: [
      [
        { clue: "This part of the plane, at the very back, typically houses the horizontal and vertical stabilizers.", answer: "What is the tail? (empennage)" },
        { clue: "The spinning blade on a small airplane pulls it through the air.", answer: "What is a propeller?" },
        { clue: "Passengers walk on this to board from the gate.", answer: "What is a jet bridge? (jetway)" },
        { clue: "Fuel is often stored inside these big lifting surfaces.", answer: "What are the wings?" },
      ],
      [
        { clue: "These hinged surfaces on the trailing edge of the wings extend during takeoff and landing to increase lift.", answer: "What are flaps?" },
        { clue: "This movable tail surface pitches the nose up or down.", answer: "What is the elevator?" },
        { clue: "Ailerons on the wings primarily control this motion.", answer: "What is roll?" },
        { clue: "The cone on the nose often hides weather radar.", answer: "What is the radome?" },
      ],
      [
        { clue: "This “black box” term actually refers to two devices: the flight data recorder and this other one.", answer: "What is the cockpit voice recorder?" },
        { clue: "Slats deploy from this edge of the wing for extra lift.", answer: "What is the leading edge?" },
        { clue: "The tube that measures airspeed on the nose is this.", answer: "What is a pitot tube?" },
        { clue: "Spoilers on top of the wing dump this after touchdown.", answer: "What is lift?" },
      ],
      [
        { clue: "These curved-up tips on modern wings reduce drag by minimizing wingtip vortices.", answer: "What are winglets?" },
        { clue: "Thrust reversers help do this after landing.", answer: "What is slow the airplane?" },
        { clue: "An APU is a small engine usually in this part of the airplane.", answer: "What is the tail?" },
        { clue: "The rudder is found on this part of the tail.", answer: "What is the vertical stabilizer? (fin)" },
      ],
      [
        { clue: "This surface on the wing’s leading edge helps prevent stalling at low speeds by smoothing airflow.", answer: "What is a slat?" },
        { clue: "A fly-by-wire jet sends this to the control surfaces instead of cables.", answer: "What are electrical signals?" },
        { clue: "Wingtip vortices are a form of this drag caused by lift itself.", answer: "What is induced drag?" },
        { clue: "The “trim tab” is a tiny surface that helps hold this.", answer: "What is attitude? (a control position)" },
      ],
    ],
  },
  {
    name: "Airline Mergers",
    pools: [
      [
        { clue: "In 2008, this airline merged with Northwest to become the world’s largest carrier at the time.", answer: "What is Delta?" },
        { clue: "This 2013 merger combined a legacy carrier with a bankrupt one to create the then-largest U.S. airline.", answer: "What is American? (US Airways)" },
        { clue: "This airline dropped “Airlines” from a famous pre-merger name after combining with United in 2010.", answer: "What is Continental?" },
        { clue: "This once-iconic carrier ceased operations in 1991 after decades as a “Golden Age” symbol.", answer: "What is Pan Am?" },
      ],
      [
        { clue: "This low-cost-ish West Coast carrier completed a merger with Virgin America in 2018.", answer: "What is Alaska?" },
        { clue: "US Airways disappeared into this Dallas-based giant.", answer: "What is American?" },
        { clue: "Northwest’s red tail became part of this Atlanta-based airline.", answer: "What is Delta?" },
        { clue: "TWA’s last chapter was a merger into this U.S. carrier in 2001.", answer: "What is American?" },
      ],
      [
        { clue: "America West combined with this East Coast carrier before a later mega-merger.", answer: "What is US Airways?" },
        { clue: "AirTran was absorbed by this low-cost airline known for boarding groups.", answer: "What is Southwest?" },
        { clue: "Virgin America flights were rebranded under this West Coast carrier’s name.", answer: "What is Alaska?" },
        { clue: "Continental’s globe logo gave way to this Chicago-based carrier’s identity.", answer: "What is United?" },
      ],
      [
        { clue: "Ozark and Piedmont were among regionals swallowed in this 1980s U.S. consolidation wave.", answer: "What is deregulation-era mergers? (accept specific: TWA/Ozark, USAir/Piedmont)" },
        { clue: "Northwest’s Tokyo hub later sat under this SkyTeam member’s banner.", answer: "What is Delta?" },
        { clue: "This Texas carrier once tried to buy National and later vanished into American via US Airways.", answer: "What is America West? (accept US Airways)" },
        { clue: "KLM’s long partnership with this U.S. carrier is a SkyTeam story, not a full merger.", answer: "What is Delta? (or Northwest historically)" },
      ],
      [
        { clue: "Republic Airlines of the 1980s (not today’s Republic Airways) was folded into this Minnesota-based carrier.", answer: "What is Northwest?" },
        { clue: "Hughes Airwest’s “top banana” jets ended up in this airline’s family.", answer: "What is Republic? (then Northwest / Delta)" },
        { clue: "This British carrier combined with KLM’s owner in a European group, not a U.S. merger.", answer: "What is Air France? (Air France–KLM)" },
        { clue: "People Express was absorbed by this Newark-based airline in the 1980s.", answer: "What is Continental?" },
      ],
    ],
  },
  {
    name: "Flight Service",
    pools: [
      [
        { clue: "This snack, distributed in small foil bags, is a staple of economy beverage service.", answer: "What are pretzels?" },
        { clue: "You are asked to buckle this before the airplane pushes back.", answer: "What is a seat belt?" },
        { clue: "The cabin crew works out of this kitchen area.", answer: "What is the galley?" },
        { clue: "Carry-ons go in this compartment above your seat.", answer: "What is the overhead bin?" },
      ],
      [
        { clue: "This term describes the reclining sleep compartments offered in some international first-class cabins.", answer: "What are suites? (pods / lie-flat)" },
        { clue: "This inflatable yellow device is under your seat if you land on water.", answer: "What is a life vest?" },
        { clue: "First class sits toward this end of the airplane.", answer: "What is the front?" },
        { clue: "A typical narrow-body has this many main cabin aisles.", answer: "What is one?" },
      ],
      [
        { clue: "This safety demonstration, once done live by flight attendants, is now often shown via this pre-recorded segment.", answer: "What is a safety video?" },
        { clue: "This briefing card in the seatback shows exits and brace positions.", answer: "What is the safety card?" },
        { clue: "Oxygen masks drop from here if the cabin loses pressure.", answer: "What is the overhead panel? (ceiling)" },
        { clue: "“Cross-check” is a cabin call that the doors have been verified as this.", answer: "What is armed or disarmed?" },
      ],
      [
        { clue: "This airline was famous in the 1970s for ads with the slogan “We really move our tail for you.”", answer: "What is Continental?" },
        { clue: "This class of service, between economy and business, became widespread in the 2010s.", answer: "What is premium economy?" },
        { clue: "This city-state’s cabin crew image is branded the Singapore ____.", answer: "What is Girl?" },
        { clue: "A “buy on board” model means you pay for this that used to be free.", answer: "What is food? (snacks / meals)" },
      ],
      [
        { clue: "This class of service sits between coach and business on many long-haul jets.", answer: "What is premium economy?" },
        { clue: "Lie-flat seats in business class are designed for this on overnight flights.", answer: "What is sleep?" },
        { clue: "Emirates A380s are known for this downstairs social space.", answer: "What is an onboard lounge? (bar)" },
        { clue: "A “sundowner” or meal service often starts after this cabin chime.", answer: "What is the seat-belt sign? (or a ding)" },
      ],
    ],
  },
  {
    name: "Sky Records",
    pools: [
      [
        { clue: "This Airbus model, which debuted in 2007, is the largest passenger airliner ever built.", answer: "What is the A380?" },
        { clue: "This wide-body with a hump upstairs is nicknamed the Queen of the Skies.", answer: "What is the 747?" },
        { clue: "The SR-71 was famous for this: going very, very fast.", answer: "What is speed? (Mach 3)" },
        { clue: "A typical airliner has how many wings?", answer: "What is two?" },
      ],
      [
        { clue: "This is among the longest commercial nonstop routes, connecting the New York area and this Southeast Asian city-state.", answer: "What is Singapore to Newark? (SQ / Singapore Airlines)" },
        { clue: "This is the fastest commercial airliner ever to enter passenger service, cruising at over twice the speed of sound.", answer: "What is the Concorde?" },
        { clue: "The 737 family is the world’s most-delivered jet of this type.", answer: "What is an airliner? (narrow-body)" },
        { clue: "Qantas kangaroo hops include some of the world’s longest flights to this continent.", answer: "What is Australia? (or North America)" },
      ],
      [
        { clue: "This airline holds the record for the world’s shortest scheduled commercial flight, under two minutes, in Scotland.", answer: "What is Loganair?" },
        { clue: "This Soviet-era giant held the record for heaviest aircraft ever built before its 2022 destruction.", answer: "What is the An-225? (Mriya)" },
        { clue: "Concorde’s Atlantic crossing was about this many hours (within one).", answer: "What is 3.5 hours? (3–4)" },
        { clue: "The first 747 entered airline service with this U.S. carrier in 1970.", answer: "What is Pan Am?" },
      ],
      [
        { clue: "This two-island hop in Orkney is often called the world’s shortest scheduled flight.", answer: "What is Westray to Papa Westray? (Loganair)" },
        { clue: "The Dreamlifter is a 747 modified to carry this Boeing jet’s wings.", answer: "What is the 787?" },
        { clue: "The C-5 Galaxy is one of the U.S. Air Force’s biggest of these.", answer: "What is a cargo plane?" },
        { clue: "The A380’s upper deck made it the first full-length double-deck this.", answer: "What is a jetliner? (airliner)" },
      ],
      [
        { clue: "This Antonov giant, named Mriya, was destroyed in 2022 and had been the heaviest aircraft built.", answer: "What is the An-225?" },
        { clue: "Singapore’s ultra-long-haul to the U.S. East Coast is flown with this Airbus twin.", answer: "What is the A350?" },
        { clue: "The Guppy and Super Guppy hauled NASA hardware for this Moon program.", answer: "What is Apollo?" },
        { clue: "The Wright Flyer’s first hop was about this many feet (within 20).", answer: "What is 120 feet?" },
      ],
    ],
  },
  {
    name: "Airline Names",
    pools: [
      [
        { clue: "This airline’s logo features a stylized kangaroo.", answer: "What is Qantas?" },
        { clue: "This U.S. low-cost airline is known for its heart logo and boarding by groups.", answer: "What is Southwest?" },
        { clue: "This U.K. flag carrier’s tail still shows a Union Flag-inspired design.", answer: "What is British Airways?" },
        { clue: "This Middle Eastern airline’s name is also a title for a ruler.", answer: "What is Emirates?" },
      ],
      [
        { clue: "This Abu Dhabi carrier flies a maroon and gold livery; its name means “union.”", answer: "What is Etihad?" },
        { clue: "This airline’s tail features a red maple leaf.", answer: "What is Air Canada?" },
        { clue: "This Irish low-cost carrier is famous for charging for almost everything.", answer: "What is Ryanair?" },
        { clue: "This German flag carrier is based in Frankfurt.", answer: "What is Lufthansa?" },
      ],
      [
        { clue: "This carrier’s “Fly the Friendly Skies” slogan made it a U.S. icon.", answer: "What is United?" },
        { clue: "This U.S. airline uses a cranberry-colored widget on its tail.", answer: "What is Delta?" },
        { clue: "This now-defunct U.S. airline was nicknamed “the World’s Most Experienced Airline.”", answer: "What is Pan Am?" },
        { clue: "This Dutch airline, founded in 1919, still flies under its original name.", answer: "What is KLM?" },
      ],
      [
        { clue: "This airline flies a livery featuring a stylized crown and is the flag carrier of the Netherlands.", answer: "What is KLM?" },
        { clue: "Oneworld’s U.S. founding member is this Dallas-based airline.", answer: "What is American?" },
        { clue: "This grouping of airlines includes United, Lufthansa, and Air Canada.", answer: "What is Star Alliance?" },
        { clue: "This Atlanta-based airline is a founding member of SkyTeam.", answer: "What is Delta?" },
      ],
      [
        { clue: "This Australian airline’s flying kangaroo has hopped around the world since 1947.", answer: "What is Qantas?" },
        { clue: "This Gulf carrier based in Doha is a oneworld member.", answer: "What is Qatar Airways?" },
        { clue: "This flag carrier from a Southeast Asian city-state is famous for a gold bird-like logo.", answer: "What is Singapore Airlines?" },
        { clue: "This Japanese carrier’s three-letter name is also a woman’s nickname; it competes with JAL.", answer: "What is ANA? (All Nippon Airways)" },
      ],
    ],
  },
  {
    name: "Tower Talk",
    pools: [
      [
        { clue: "Pilots use this phonetic alphabet word for the letter A.", answer: "What is Alpha?" },
        { clue: "Pilots say this word to mean “yes” on the radio.", answer: "What is roger? (or affirmative)" },
        { clue: "“Mayday” is the call for this kind of situation.", answer: "What is an emergency?" },
        { clue: "“Cleared for takeoff” comes from this facility.", answer: "What is the tower? (ATC)" },
      ],
      [
        { clue: "This term refers to an aircraft’s assigned cruising height, often given as a flight level.", answer: "What is altitude? (flight level)" },
        { clue: "“Wilco” is short for “will ____.”", answer: "What is comply?" },
        { clue: "A “squawk” is a four-digit code you set on this box.", answer: "What is the transponder?" },
        { clue: "“Pan-pan” is less urgent than mayday; it signals this, not a full emergency.", answer: "What is urgency?" },
      ],
      [
        { clue: "This phrase, repeated three times, is the international radio distress call for life-threatening danger.", answer: "What is Mayday?" },
        { clue: "Squawk 7700 tells ATC you have this.", answer: "What is an emergency?" },
        { clue: "Squawk 7500 is reserved for this grim situation.", answer: "What is hijacking?" },
        { clue: "“Niner” is how pilots say this digit so it isn’t lost on the radio.", answer: "What is 9?" },
      ],
      [
        { clue: "This term describes the point of no return on takeoff, after which a pilot must commit to lifting off.", answer: "What is V1?" },
        { clue: "“Rotate” on the takeoff roll means lift the nose to this.", answer: "What is takeoff attitude?" },
        { clue: "“George” is slang for this flying helper.", answer: "What is the autopilot?" },
        { clue: "“Feet wet” means you are flying over this.", answer: "What is water?" },
      ],
      [
        { clue: "A plane’s direction relative to magnetic north is called this.", answer: "What is heading? (bearing)" },
        { clue: "“Alpha, Bravo, Charlie” is the start of this spelling system.", answer: "What is the phonetic alphabet?" },
        { clue: "QNH is the altimeter setting that reads altitude above this.", answer: "What is sea level?" },
        { clue: "A “hold short” instruction means stop before this.", answer: "What is the runway?" },
      ],
    ],
  },
  {
    name: "Sky Weather",
    pools: [
      [
        { clue: "This type of turbulence occurs without visible clouds, often near jet streams.", answer: "What is clear-air turbulence?" },
        { clue: "Pilots call a thunderstorm’s tall cloud this dangerous type.", answer: "What is cumulonimbus?" },
        { clue: "This frozen precipitation can ruin lift if it sticks to a wing.", answer: "What is ice?" },
        { clue: "A METAR is a routine report of this at an airport.", answer: "What is weather?" },
      ],
      [
        { clue: "Pilots avoid flying through these towering storm clouds due to severe turbulence and lightning.", answer: "What are cumulonimbus? (thunderstorms)" },
        { clue: "This sudden, powerful downdraft can be extremely dangerous during takeoff and landing.", answer: "What is a microburst? (wind shear)" },
        { clue: "A TAF is a forecast for this place, not the whole country.", answer: "What is an airport?" },
        { clue: "RVR tells a pilot how far they can see down this.", answer: "What is the runway?" },
      ],
      [
        { clue: "This colorful ring sometimes seen around a plane’s shadow on clouds is this optical phenomenon.", answer: "What is a glory?" },
        { clue: "CAT in weather talk is this kind of bump with no clouds to warn you.", answer: "What is clear-air turbulence?" },
        { clue: "A squall line is a row of these storms.", answer: "What are thunderstorms?" },
        { clue: "Freezing rain is extra dangerous because it makes this on the airframe.", answer: "What is clear ice?" },
      ],
      [
        { clue: "This fast-moving air current at high altitude can add or subtract significant time from flights.", answer: "What is the jet stream?" },
        { clue: "Virga is precipitation that evaporates before hitting this.", answer: "What is the ground?" },
        { clue: "SIGMETs warn of weather that is this to all aircraft.", answer: "What is significant? (hazardous)" },
        { clue: "Dew point is the temperature where air becomes this.", answer: "What is saturated?" },
      ],
      [
        { clue: "This high-altitude river of wind was better understood after WWII bombing missions.", answer: "What is the jet stream?" },
        { clue: "A mountain wave can make rotor clouds on this side of a ridge.", answer: "What is the lee? (downwind)" },
        { clue: "PIREPs are weather reports from these people in the air.", answer: "Who are pilots?" },
        { clue: "Density altitude goes up when temperature and this both go up.", answer: "What is humidity? (or elevation)" },
      ],
    ],
  },
  {
    name: "RA History",
    pools: [
      [
        { clue: "Republic traces its roots to this regional carrier, founded in 1973 in Jamestown, New York by Joel and Gloria Hall.", answer: "What is Chautauqua Airlines?" },
        { clue: "Joel and Gloria Hall started Republic’s earliest predecessor in this upstate New York town.", answer: "What is Jamestown?" },
        { clue: "The original airline was named for this New York lake and county, not for a Native nation in Oklahoma.", answer: "What is Chautauqua?" },
        { clue: "Republic’s story begins with this husband-and-wife pair who founded a carrier in Jamestown.", answer: "Who are Joel and Gloria Hall?" },
      ],
      [
        { clue: "This is the year Chautauqua — Republic’s earliest predecessor — began actual flight operations.", answer: "What is 1974?" },
        { clue: "The Halls founded their airline in this year, one year before flying started.", answer: "What is 1973?" },
        { clue: "Chautauqua’s first flights left from this New York state, not Indiana.", answer: "What is New York?" },
        { clue: "Republic’s holding company later borrowed a famous name, but the flying started under this upstate brand.", answer: "What is Chautauqua?" },
      ],
      [
        { clue: "Republic Airways Holdings borrowed its name from this earlier U.S. airline that flew from 1979–1986, despite having no historical connection to it.", answer: "What is Republic Airlines?" },
        { clue: "The 1979–1986 namesake carrier was based in this Twin Cities state.", answer: "What is Minnesota?" },
        { clue: "That 1979–1986 namesake later disappeared into Northwest, then this Atlanta-based airline.", answer: "What is Delta?" },
        { clue: "Today’s company kept this word in its name even though it was never part of the 1979–1986 carrier.", answer: "What is Republic?" },
      ],
      [
        { clue: "In 1998, this Greenwich, Connecticut investment firm bought the holding company that would soon become Republic Airways Holdings.", answer: "What is Wexford Management?" },
        { clue: "The 1998 buyer of the holding company was based in this Connecticut town, famous for hedge funds.", answer: "What is Greenwich?" },
        { clue: "Wexford bought the company in this year, late in the 1990s.", answer: "What is 1998?" },
        { clue: "The Connecticut firm that bought the holding company was this kind of buyer, not an airline.", answer: "What is an investment firm? (private equity / management)" },
      ],
      [
        { clue: "This regional carrier, brought under the Republic umbrella in 2005, was fully merged into Republic Airways in February 2017.", answer: "What is Shuttle America?" },
        { clue: "Shuttle America’s full merger into Republic happened in this month and year (month + year).", answer: "What is February 2017?" },
        { clue: "Shuttle America first joined the Republic family in this year, the mid-2000s.", answer: "What is 2005?" },
        { clue: "Besides Chautauqua, this “America” branded regional was folded into today’s Republic.", answer: "What is Shuttle America?" },
      ],
    ],
  },
  {
    name: "RA Today",
    pools: [
      [
        { clue: "Republic Airways is headquartered in this Indianapolis-area city, also home to its Aviation Campus.", answer: "What is Carmel? (Carmel, Indiana)" },
        { clue: "Republic’s headquarters sit in this U.S. state.", answer: "What is Indiana?" },
        { clue: "The Aviation Campus and HQ are just north of this Midwest capital city.", answer: "What is Indianapolis?" },
        { clue: "Republic’s home airport, a short hop from HQ, uses this three-letter code.", answer: "What is IND?" },
      ],
      [
        { clue: "This is Republic Airways Holdings’ ticker symbol on the NASDAQ.", answer: "What is RJET?" },
        { clue: "Republic’s stock ticker is four letters and starts with R.", answer: "What is RJET?" },
        { clue: "Republic’s website domain matches this NASDAQ ticker, plus “.com.”", answer: "What is RJET?" },
        { clue: "On the NASDAQ, Republic trades under this four-letter symbol.", answer: "What is RJET?" },
      ],
      [
        { clue: "Republic operates an all-Embraer regional jet fleet made up entirely of these two aircraft models.", answer: "What are the E170 and E175?" },
        { clue: "Every Republic airliner is built by this Brazilian manufacturer.", answer: "What is Embraer?" },
        { clue: "The larger of Republic’s two jet types typically seats about 76 and is this E-Jet.", answer: "What is the E175?" },
        { clue: "Republic does not fly Boeing or Airbus; the fleet is all this Brazilian E-Jet family.", answer: "What is Embraer? (E170 / E175)" },
      ],
      [
        { clue: "In November 2025, Republic completed an all-stock combination with this Phoenix-based regional airline, creating the world’s largest operator of Embraer jets.", answer: "What is Mesa? (Mesa Air Group)" },
        { clue: "The 2025 combination partner was based in this Arizona city.", answer: "What is Phoenix?" },
        { clue: "Together with Mesa, Republic became the world’s largest operator of this Brazilian jet maker’s aircraft.", answer: "What is Embraer?" },
        { clue: "The Mesa combination closed in this month and year (month + year).", answer: "What is November 2025?" },
      ],
      [
        { clue: "Effective June 15, 2026, this longtime Republic executive — who joined in 2014 — was named President and CEO, succeeding David Grizzle.", answer: "Who is Matt Koscal?" },
        { clue: "Matt Koscal succeeded this previous Republic CEO.", answer: "Who is David Grizzle?" },
        { clue: "The current President and CEO joined Republic in this year, the mid-2010s.", answer: "What is 2014?" },
        { clue: "Republic’s 2026 CEO change took effect in this month.", answer: "What is June? (June 15, 2026)" },
      ],
    ],
  },
  {
    name: "Lift Academy",
    pools: [
      [
        { clue: "LIFT is an acronym for this phrase, the name of Republic’s own pilot training school.", answer: "What is Leadership In Flight Training?" },
        { clue: "Republic’s in-house flight school is known by this four-letter name.", answer: "What is LIFT?" },
        { clue: "LIFT was built as a direct pipeline of new pilots into this airline.", answer: "What is Republic? (Republic Airways)" },
        { clue: "More than 200 graduates of this academy have gone on to fly for Republic.", answer: "What is LIFT? (LIFT Academy)" },
      ],
      [
        { clue: "LIFT Academy opened its hangar doors in September of this year at Indianapolis International Airport.", answer: "What is 2018?" },
        { clue: "The original LIFT campus sits at this Midwest airport, Republic’s hometown hub.", answer: "What is Indianapolis? (IND)" },
        { clue: "LIFT first opened its hangar doors in this month of 2018.", answer: "What is September?" },
        { clue: "LIFT’s first home was this three-letter airport code, not a reliever field.", answer: "What is IND?" },
      ],
      [
        { clue: "Student pilots at LIFT train on the DA40-NG and DA42-VI aircraft made by this manufacturer.", answer: "What is Diamond? (Diamond Aircraft)" },
        { clue: "LIFT’s four-seat piston single is this Diamond model numbered in the 40s.", answer: "What is the DA40? (DA40-NG)" },
        { clue: "LIFT’s piston twin is this Diamond model numbered in the 40s.", answer: "What is the DA42? (DA42-VI)" },
        { clue: "Besides those four-seat Diamonds, LIFT also flies this smaller two-seat trainer in the DA family.", answer: "What is the DA20?" },
      ],
      [
        { clue: "In 2024, LIFT partnered with this historic university to open a flight school at Alabama’s Moton Field, once home to a famed WWII African American fighter group.", answer: "What is Tuskegee University?" },
        { clue: "LIFT’s Alabama campus trains at this historic field named for a commandant, not a city.", answer: "What is Moton Field?" },
        { clue: "The Moton Field partnership is in this U.S. state.", answer: "What is Alabama?" },
        { clue: "LIFT also has a Gulf Coast campus in this Texas island city.", answer: "What is Galveston?" },
      ],
      [
        { clue: "LIFT’s Galveston, Texas campus won a contract to provide flight training for candidates in this space agency’s astronaut corps.", answer: "What is NASA?" },
        { clue: "NASA astronaut candidates train with LIFT at this Texas campus.", answer: "What is Galveston?" },
        { clue: "Besides Indianapolis and Galveston, LIFT campuses include Myrtle Beach and this South Carolina capital.", answer: "What is Columbia?" },
        { clue: "LIFT also trains in this Indiana city south of Indianapolis, sharing a name with Ohio’s capital.", answer: "What is Columbus? (Columbus, Indiana)" },
      ],
    ],
  },
]

export const BOARD_CATEGORY_COUNT = 6

export function dealJeopardyBoard(): DealtCategory[] {
  return shuffle(CATEGORY_POOLS)
    .slice(0, BOARD_CATEGORY_COUNT)
    .map((category) => ({
      name: category.name,
      clues: category.pools.map((pool) => pickOne(pool)),
    }))
}

// Two Daily Doubles, not on the $200 row, different categories.
export function pickDailyDoubles(): DailyDoubleCell[] {
  const cells: DailyDoubleCell[] = []
  for (let categoryIndex = 0; categoryIndex < BOARD_CATEGORY_COUNT; categoryIndex++) {
    for (let valueIndex = 1; valueIndex < CLUE_VALUES.length; valueIndex++) {
      cells.push({ categoryIndex, valueIndex })
    }
  }
  return shuffle(cells).slice(0, 2)
}

export function isDailyDouble(doubles: DailyDoubleCell[], cat: number, val: number) {
  return doubles.some((cell) => cell.categoryIndex === cat && cell.valueIndex === val)
}
