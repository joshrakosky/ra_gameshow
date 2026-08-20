// Jeopardy question bank. Each category has 5 difficulty buckets ($200 easy → $1000 hard).
// dealJeopardyBoard() picks one clue per cell so every turn is a different board.

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
        { clue: "This U.K. flag carrier’s initials are BA.", answer: "What is British Airways?" },
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
        { clue: "This alliance includes United, Lufthansa, and Air Canada.", answer: "What is Star Alliance?" },
        { clue: "Oneworld’s U.S. founding member is this Dallas-based airline.", answer: "What is American Airlines?" },
        { clue: "This Atlanta-based airline is a founding member of SkyTeam.", answer: "What is Delta?" },
      ],
      [
        { clue: "The first scheduled airline passenger flight in the U.S. flew between St. Petersburg and this Florida city in 1914.", answer: "What is Tampa?" },
        { clue: "This IATA code prefix is used by Republic Airways flights under the American Eagle brand — two letters.", answer: "What is YX? (accept American Eagle / Republic)" },
        { clue: "This 1944 Chicago convention created the modern rules of international civil aviation.", answer: "What is the Chicago Convention?" },
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
        { clue: "Yaw is rotation around this vertical axis.", answer: "What is the vertical axis?" },
        { clue: "The rudder is found on this part of the tail.", answer: "What is the vertical stabilizer? (or fin)" },
        { clue: "Pitot tubes help measure this, which you see as airspeed.", answer: "What is dynamic pressure? (accept airspeed / ram air)" },
      ],
      [
        { clue: "Faster air over the top of a wing means this kind of pressure, which helps create lift.", answer: "What is lower (or low) pressure?" },
        { clue: "This 18th-century scientist’s principle is often used to explain lift.", answer: "Who is Bernoulli?" },
        { clue: "A stall happens when the wing exceeds this critical angle.", answer: "What is the critical angle of attack?" },
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
        { clue: "Harrison Ford plays a president who must retake this hijacked Air Force jet.", answer: "What is Air Force One?" },
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
        { clue: "This airport code for Phoenix is PHX — named after this sky harbor nickname.", answer: "What is Phoenix Sky Harbor?" },
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
        { clue: "FAA rules generally require a life vest demonstration on flights that may fly beyond this many miles from land — often 50.", answer: "What is 50 miles? (accept overwater)" },
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
        { clue: "Disney’s Planes villains include this racing champion named Ripslinger, from this movie.", answer: "What is Planes?" },
      ],
      [
        { clue: "This 1992 Disney film features Aladdin on a magic carpet, not a 737.", answer: "What is Aladdin?" },
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
        { clue: "This engine inlet is called a nacelle; the whole pod is the engine ____.", answer: "What is a nacelle?" },
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
        { clue: "A turbofan bypasses extra air around this hot inner core.", answer: "What is the core? (engine core / combustor)" },
        { clue: "This honeycomb-like structure in a wing is strong and light: ____ core.", answer: "What is honeycomb? (or composite)" },
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
        { clue: "Wiley Post was first to fly solo around the world in this year, 1933.", answer: "What is 1933?" },
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
        { clue: "“Pan-pan” is less urgent than mayday; it means this kind of urgency.", answer: "What is urgency? (not immediately life-threatening)" },
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
        { clue: "Singapore’s main airport is famous for a waterfall and this three-letter code, SIN.", answer: "What is Singapore? (Changi)" },
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
        { clue: "This Istanbul airport replaced Atatürk as Turkey’s mega-hub; its code is IST.", answer: "What is Istanbul?" },
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
        { clue: "This Hong Kong airport’s code is HKG, built on reclaimed land.", answer: "What is Hong Kong?" },
        { clue: "The code for Madrid’s main airport is this, MAD.", answer: "What is Madrid? (Barajas)" },
        { clue: "GIG is the code for this Brazilian city’s Tom Jobim airport.", answer: "What is Rio de Janeiro?" },
        { clue: "This Saudi city is served by King Abdulaziz International; the code is JED.", answer: "What is Jeddah?" },
      ],
    ],
  },
  {
    name: "Jet Age",
    pools: [
      [
        { clue: "Boeing’s first successful jetliner was this 7-series, the 707.", answer: "What is the 707?" },
        { clue: "This wide-body with a hump upstairs is nicknamed the Queen of the Skies.", answer: "What is the 747?" },
        { clue: "Airbus’s double-deck giant that airlines have mostly retired is this.", answer: "What is the A380?" },
        { clue: "This twin-engine Boeing is the world’s most-delivered jet family.", answer: "What is the 737?" },
      ],
      [
        { clue: "The 787 Dreamliner is known for this lightweight material in its body.", answer: "What are composites? (carbon fiber)" },
        { clue: "This four-engine Concorde could cross the Atlantic in about this many hours (within 1).", answer: "What is 3.5 hours? (accept 3–4)" },
        { clue: "The A320 family is famous for this sidestick instead of a yoke.", answer: "What is a sidestick?" },
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
        { clue: "This Soviet SST, the Tu-144, flew passengers briefly and was nicknamed Concordski.", answer: "What is the Tu-144?" },
        { clue: "Lockheed’s TriStar was a wide-body with this many engines.", answer: "What is three?" },
      ],
      [
        { clue: "The 747-8’s stretched upper deck still carries this nickname, Queen of the Skies.", answer: "What is the 747-8? (accept 747)" },
        { clue: "Pratt & Whitney’s geared turbofan is a big seller on this Airbus family.", answer: "What is the A320neo?" },
        { clue: "The original 737 MAX grounding was tied to this maneuvering system, MCAS.", answer: "What is MCAS?" },
        { clue: "This British four-engine jet, the VC10, was famous for its rear engines and T-tail.", answer: "What is the VC10?" },
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
        { clue: "The “90-second rule” is the certification goal to evacuate in this time.", answer: "What is 90 seconds?" },
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
