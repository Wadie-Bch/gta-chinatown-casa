# -*- coding: utf-8 -*-
"""DREAM - "A Job With No CV" : single source of truth for script + shot list."""

TITLE   = "A Job With No CV"
CHANNEL = "DREAM"

STYLE_BIBLE = (
 "Photoreal cinematic footage that behaves like a dream. Shot on 35mm anamorphic, shallow depth of field, "
 "natural motion blur, fine film grain, subtle gate weave. Real people, real rooms, real weather - never "
 "illustration, never CGI-looking. The dream is in the BEHAVIOUR, not the texture: physics and continuity "
 "bend while the image stays photographically believable. Objects transform without a cut. Rooms repeat. "
 "Crowds move in unison. Light runs faster than it should. Palette: deep blue-black shadows, one dominant "
 "accent per scene - warm gold, cold teal, or sodium orange. High contrast, crushed blacks, strong key "
 "light, heavy negative space. Camera: slow deliberate moves only - locked-off hold, slow push-in, slow "
 "dolly, or one smooth crane; it hesitates, then moves with intent. No handheld shake, no whip pans, no "
 "drone swoops. Absolutely no on-screen text of any kind."
)
NEGATIVE = (
 "text, letters, words, signage, subtitles, watermark, logo, cartoon, anime, illustration, 3D render, "
 "video-game look, plastic skin, warped hands, extra fingers, mascot, character logo, handheld shake, "
 "fisheye, timelapse clouds, stock-footage smile, lens flare spam, oversaturated HDR"
)
TAIL = "Top third of frame kept empty for composited titles. no text, no letters, no signage."

# accent keys -> (name, hex, secondary hex)
ACCENTS = {
 "sodium": ("sodium orange", "#F5A04E", "#D3835B"),
 "teal":   ("cold teal",     "#5FC9D6", "#4A90E2"),
 "gold":   ("warm gold",     "#FFD46B", "#F5B94E"),
}

# ACTS: id, title(headline card), sub, accent, grade
ACTS = [
 dict(id=1, head="A JOB WITH NO CV",       sub="one page decides your life",      accent="sodium", grade="night-sodium"),
 dict(id=2, head="THE PAPER SELF",         sub="what the document really is",     accent="teal",   grade="cold-dawn"),
 dict(id=3, head="THE FUNNEL",             sub="what actually happens to it",     accent="teal",   grade="grey-institution"),
 dict(id=4, head="THE STRONGEST CASE",     sub="stated fairly, and it is good",   accent="gold",   grade="warm-day"),
 dict(id=5, head="IT MEASURES THE WRONG THING", sub="ability, versus describing ability", accent="teal", grade="cold-hard"),
 dict(id=6, head="THE GAP",                sub="the format punishes being human", accent="sodium", grade="sodium-storm"),
 dict(id=7, head="THE FORMAT IS FINISHED", sub="machines write it, machines read it", accent="teal", grade="screen-night"),
 dict(id=8, head="VERDICT",                sub="obsolete, and being defended",    accent="sodium", grade="dusk"),
 dict(id=9, head="THE BETTER VERSION",     sub="four changes, all of them cheap", accent="gold",   grade="gold-rise"),
]

# ---------------------------------------------------------------------------
# SHOTS. lines = narration sentences carried by this shot (1-2).
# grammar = DREAM GRAMMAR move. plate = previs renderer config.
# ---------------------------------------------------------------------------
def S(act, lines, grammar, move, subject, light, plate, head=None, sub=None, cap=None):
    return dict(act=act, lines=lines, grammar=grammar, move=move, subject=subject,
                light=light, plate=plate, head=head, sub=sub, cap=cap)

SHOTS = [
# ================= ACT 1 - HOOK =================
S(1, ["There is a single sheet of paper that decides more of your life than your country's constitution."],
  "Wrong Scale", "slow push-in",
  "a single sheet of white paper standing upright in the middle of an empty night street, four storeys tall, "
  "lit like a monument, a lone man in a coat standing at its base looking up, his back to camera",
  "sodium orange streetlight from a single overhead lamp, deep blue-black shadows, wet asphalt reflecting the glow",
  dict(k="monument", fig=1),
  head="A JOB WITH NO CV", sub="EPISODE 09"),

S(1, ["It is roughly six hundred words long.", "You wrote it yourself."],
  "Soft Erasure", "locked-off hold",
  "close on a man's hands on a kitchen table at night pressing flat a single sheet of paper; as he smooths it, "
  "the ink lifts off the page and drifts upward as fine dust, leaving the sheet blank",
  "single warm practical lamp above the table, everything else crushed to black, sodium orange key",
  dict(k="hands")),

S(1, ["And a stranger will spend seven seconds deciding whether you eat."],
  "The Freeze", "slow dolly right",
  "a wide open-plan office at night, forty people frozen mid-motion at their desks, one woman still moving, "
  "picking up a sheet of paper and putting it down again",
  "cold overhead office light on the frozen crowd, one sodium desk lamp isolating the woman who still moves",
  dict(k="crowd", n=14, one=True),
  cap="seven seconds"),

S(1, ["Tonight we take it apart."],
  "Object Rain", "one smooth crane down",
  "thousands of sheets of paper falling slowly through a vast dark atrium like snow, a single figure standing "
  "in the centre with arms at their sides, unmoved",
  "one hard shaft of sodium light from a skylight far above, paper catching the light as it falls, blue-black surround",
  dict(k="rain", n=90)),

# ================= ACT 2 - THE PAPER SELF =================
S(2, ["A CV is not a description of you.", "It is a compression format."],
  "The Swap", "slow push-in",
  "a man standing in an empty white-grey room slowly flattening, without a cut, into a single sheet of paper "
  "that hangs in the air where he stood; his shadow on the floor stays human",
  "cold teal window light from camera left, long shadow, heavy negative space, crushed blacks",
  dict(k="swap"),
  head="THE PAPER SELF", sub="what the document really is"),

S(2, ["Twenty-five years of a human life, every skill, every hour, every failure that taught you something, squeezed into a file small enough to skim."],
  "Wrong Scale", "slow dolly left",
  "an enormous industrial press in a cold empty hall slowly compressing a mountain of household objects, "
  "photographs, tools and clothes down into one thin white rectangle",
  "cold teal industrial light from high windows, dust in the air, deep blue-black shadows",
  dict(k="press")),

S(2, ["Like every compression format, it keeps what it was designed to keep, and throws away everything else."],
  "The Repeat", "locked-off hold",
  "a sorting table where identical pairs of hands repeatedly place objects into two piles; the left pile is "
  "three small identical white cards, the right pile is everything else and it is enormous",
  "cold teal overhead key, hard falloff, the large pile sinking into black",
  dict(k="sort")),

S(2, ["It keeps job titles, dates, the names of institutions."],
  "The Slow Crowd", "slow dolly right",
  "a long corridor of identical closed office doors receding into darkness, each with an empty nameplate, "
  "a man walking past them without stopping",
  "cold teal fluorescent strips overhead repeating to infinity, strong key, crushed blacks",
  dict(k="corridor")),

S(2, ["It throws away judgement.", "Taste. Nerve. The thing you are actually good at."],
  "Soft Erasure", "slow push-in",
  "a woman playing a piano in an empty hall; as she plays, her hands and then the piano dissolve into fine "
  "paper dust that drifts away, the sound implied by the motion of the vanishing keys",
  "one cold teal shaft from a high window, the rest of the hall black",
  dict(k="erase"),
  cap="judgement · taste · nerve"),

# ================= ACT 3 - THE FUNNEL =================
S(3, ["Here is what actually happens to it."],
  "Folded Space", "slow push-in",
  "a man posts a single envelope into a slot in a plain wall; the camera pushes through the slot into a vast "
  "grey sorting hall on the other side that could not possibly fit behind that wall",
  "flat grey institutional daylight, no warmth, teal-grey cast, hard shadows under the machinery",
  dict(k="slot"),
  head="THE FUNNEL", sub="what actually happens to it"),

S(3, ["You send it into a funnel.", "At the top, software you will never see reads it before any human does."],
  "Wrong Scale", "one smooth crane down",
  "an immense metal funnel the size of a cathedral, paper pouring into its mouth from above, and at the narrow "
  "bottom a single thin stream of sheets emerging; no people anywhere",
  "cold grey-teal top light, machinery in silhouette, deep blue-black interior",
  dict(k="funnel")),

S(3, ["It is not reading for talent.", "It is matching strings."],
  "The Repeat", "locked-off hold",
  "a machine arm in close-up rapidly stamping identical marks onto passing sheets of paper on a conveyor, "
  "never pausing, occasionally flicking one sheet into a bin below",
  "cold teal machine light, specular highlights on metal, everything behind it black",
  dict(k="belt")),

S(3, ["It ranks you against a keyword list written by someone who has never done your job."],
  "The Slow Crowd", "slow dolly left",
  "a hall of identical grey filing cabinets stretching beyond the frame, hundreds of drawers opening and "
  "closing in perfect unison, no operator visible",
  "grey institutional overheads, cold teal fill, dust motes, crushed blacks at the edges",
  dict(k="cabinets")),

S(3, ["What survives reaches a recruiter, who is holding two hundred more."],
  "Wrong Scale", "slow push-in",
  "a woman at a small desk holding a stack of paper so tall it disappears up out of frame into darkness above her",
  "single cold teal desk lamp, strong key from below the stack, the room behind entirely black",
  dict(k="stack")),

S(3, ["Seven seconds. Then a pile: yes, or no."],
  "The Repeat", "locked-off hold",
  "close on two hands dealing sheets of paper into two piles at metronomic speed; the rejected pile grows "
  "until it fills the lower half of frame, the accepted pile stays at three sheets",
  "hard cold teal key from above, black surround, paper edges catching light",
  dict(k="two_piles"),
  cap="yes · no"),

S(3, ["The whole system runs on one assumption: that the best candidate is the one who describes themselves best."],
  "The Freeze", "slow dolly right",
  "a room of forty candidates all frozen mid-gesture in the act of speaking about themselves, mouths open, "
  "hands raised; dust hangs motionless in the air",
  "cold teal wash, one warmer pool of light in the centre that nobody occupies",
  dict(k="crowd", n=16, one=False)),

# ================= ACT 4 - STEEL-MAN =================
S(4, ["Now the strongest case for it, stated properly."],
  "Time Slip", "slow push-in",
  "a wide exterior of a plain civic building at dawn where the light races through an entire day in one "
  "continuous shot, shadows sweeping across the steps, people arriving and leaving in smooth unbroken motion",
  "warm gold sunlight running fast across stone, long racing shadows, clean blue sky",
  dict(k="civic"),
  head="THE STRONGEST CASE", sub="stated fairly, and it is good"),

S(4, ["Before the CV, hiring ran on blood and proximity.", "Who your father knew. Which church, which family, which street."],
  "The Repeat", "slow dolly left",
  "a formal drawing room where the same handshake between two well-dressed men repeats over and over, each "
  "time with slightly different men, always the same handshake, always the same room",
  "warm gold lamplight and firelight, rich shadow, heavy negative space at frame top",
  dict(k="handshake")),

S(4, ["The CV is the reason a stranger can be considered at all."],
  "Folded Space", "slow push-in",
  "a plain wooden door in a stone wall opening onto a warm lit room; a stranger with a small case steps "
  "through, and the door behind them opens again onto the same room, and again",
  "warm gold interior spill against cold exterior blue, strong key through the doorway",
  dict(k="door")),

S(4, ["It is cheap. It costs nothing to produce and nothing to read.", "It scales to a planet."],
  "Object Rain", "one smooth crane down",
  "seen from very high above, sheets of paper falling upward from every rooftop of a vast city, rising into "
  "a gold-lit sky in their millions",
  "warm gold low sun raking across rooftops, deep blue-black streets below, high contrast",
  dict(k="rain", n=70, up=True)),

S(4, ["It is portable. One artefact, any employer, any country."],
  "The Swap", "locked-off hold",
  "a single sheet of paper resting on a table; the room around it changes without a cut - office, workshop, "
  "farmhouse, laboratory - while the paper and the framing stay exactly the same",
  "warm gold key holding constant while the surrounding rooms change around it, crushed blacks",
  dict(k="paper_room")),

S(4, ["And it is auditable. A claim on paper can be checked. A handshake cannot."],
  "The Freeze", "slow push-in",
  "two men mid-handshake frozen completely still in a warm room while a third person walks slowly around "
  "them examining the handshake from every side",
  "warm gold single-source key, the two frozen figures rim-lit, the moving figure in silhouette",
  dict(k="audit")),

S(4, ["The CV did not appear to oppress anyone.", "It appeared to break a monopoly on opportunity, and for about fifty years, it worked."],
  "Time Slip", "slow dolly right",
  "a long queue of ordinary people outside a factory gate at dawn, the light racing forward through decades, "
  "their clothing changing smoothly on the same bodies while the queue never breaks",
  "warm gold sunrise accelerating across the crowd, long shadows sweeping, clean sky, high contrast",
  dict(k="queue"),
  cap="that is the honest defence"),

# ================= ACT 5 - CRACK ONE =================
S(5, ["Here is where it breaks."],
  "Soft Erasure", "locked-off hold",
  "a sheet of paper on a table beginning to crack down the middle like dry clay, the two halves separating "
  "slightly, dust falling from the fracture",
  "cold teal hard key from camera right, black surround, dust catching light in the beam",
  dict(k="crack"),
  head="IT MEASURES THE WRONG THING", sub="ability, versus describing ability"),

S(5, ["The CV does not measure ability.", "It measures the ability to describe ability."],
  "The Swap", "slow push-in",
  "a man welding in a workshop, sparks falling; without a cut the welding torch in his hand becomes a pen, "
  "and the workshop becomes a plain white interview room, his posture unchanged",
  "cold teal room light replacing warm spark-glow mid-shot, strong contrast, crushed blacks",
  dict(k="weld_swap")),

S(5, ["Those are two different skills, and only one of them shows up on the page."],
  "The Repeat", "slow dolly left",
  "two identical rooms side by side seen through a cutaway wall; in one a woman works with her hands on a "
  "complex machine, in the other she sits still and speaks; the speaking room is brightly lit, the working room is going dark",
  "cold teal key on the speaking room, the working room falling into blue-black shadow",
  dict(k="two_rooms")),

S(5, ["So the system quietly selects for writers.", "For the fluent, the confident, the coached."],
  "The Slow Crowd", "locked-off hold",
  "thirty people standing in rows in a dim hall, all speaking at once in perfect unison with identical hand "
  "gestures, one person at the back silent with their hands at their sides",
  "cold teal top light picking out the front rows, the silent figure in near-darkness",
  dict(k="crowd", n=18, one=True)),

S(5, ["The best engineer in the room loses to the second best, who owns better adjectives."],
  "The Freeze", "slow push-in",
  "an interview table where one candidate is mid-gesture, animated and confident, while beside them a second "
  "candidate is completely frozen, and the panel is turned only towards the one who moves",
  "cold teal key hard on the animated candidate, the frozen one falling into shadow",
  dict(k="table")),

S(5, ["Every hire made this way is a small tax paid by competence to presentation."],
  "Object Rain", "one smooth crane down",
  "coins falling in a thin steady stream from a dark ceiling onto a plain white sheet of paper on a table below, "
  "piling up and spilling off the edges",
  "single cold teal beam onto the paper, coins catching hard specular light, everything else black",
  dict(k="rain", n=55, coin=True),
  cap="a tax on competence"),

# ================= ACT 6 - THE GAP =================
S(6, ["Then there is the gap."],
  "Wrong Scale", "slow dolly right",
  "a man standing at the edge of an enormous rectangular void cut clean out of a paved plaza, the hole is "
  "the exact proportions of a sheet of paper and it is bottomless",
  "sodium orange low sun raking across the plaza, the void completely black, storm cloud above",
  dict(k="void"),
  head="THE GAP", sub="the format punishes being human"),

S(6, ["The format demands an unbroken line of dates. A life that never stopped."],
  "The Slow Crowd", "locked-off hold",
  "hundreds of people walking in a single unbroken line across a wet plaza in perfect step, never slowing, "
  "rain falling hard, nobody carrying an umbrella",
  "sodium orange streetlight through heavy rain, deep blue-black storm sky, wet ground reflections",
  dict(k="line_walk")),

S(6, ["But real lives stop.", "You get sick. Someone you love gets sick. You raise a child."],
  "The Freeze", "slow push-in",
  "the same marching crowd, now completely frozen mid-step, while one woman kneels on the wet ground holding "
  "a small child; she is the only thing moving in frame",
  "sodium orange key from a single streetlamp on the kneeling figure, the frozen crowd in blue-black silhouette",
  dict(k="kneel")),

S(6, ["You fail at something ambitious, and it takes eighteen months to recover."],
  "Soft Erasure", "locked-off hold",
  "a man sitting alone on the edge of a bed in a dim room, rain on the window; the room around him slowly "
  "dissolves into drifting paper dust while he stays solid and still",
  "sodium orange streetlight through a rain-streaked window as the only source, everything else crushed black",
  dict(k="bed")),

S(6, ["The page has no field for any of that. It has only a hole.", "And a hole reads as guilt."],
  "Wrong Scale", "slow push-in",
  "extreme close on a sheet of paper with a rectangular hole burned through its centre; through the hole, "
  "far below, a person is falling away into darkness",
  "sodium orange rim on the paper edge, the hole leading to pure black, hard single source",
  dict(k="hole")),

S(6, ["So the format punishes the exact experiences that make people good at work: care, risk, recovery."],
  "The Repeat", "slow dolly left",
  "three identical rooms in a row seen through cutaway walls: in the first a person cares for someone in bed, "
  "in the second a person builds something and it collapses, in the third a person stands back up; all three "
  "rooms have their doors slammed shut in unison",
  "sodium orange interior warmth in each room, extinguished as the doors close, storm-blue exterior",
  dict(k="three_rooms")),

S(6, ["And because a gap is fatal, people stop taking risks.", "The document changes the life it was only supposed to record."],
  "The Slow Crowd", "one smooth crane down",
  "a crowd of people standing perfectly still in a storm, all facing the same direction, none of them stepping "
  "forward onto the empty ground ahead of them",
  "sodium orange from behind the crowd throwing them into silhouette, blue-black storm sky, rain lit from behind",
  dict(k="still_crowd"),
  cap="it stopped recording. it started deciding."),

# ================= ACT 7 - THE COLLAPSE =================
S(7, ["And now the format is finished."],
  "The Swap", "slow push-in",
  "a sheet of paper on a desk in a dark room; without a cut it becomes a glowing rectangle of screen light, "
  "then another, then a wall of them, filling the room",
  "cold teal screen glow as the only light source, the room otherwise pure black, faces not visible",
  dict(k="screens"),
  head="THE FORMAT IS FINISHED", sub="machines write it, machines read it"),

S(7, ["A language model writes a flawless CV in four seconds.", "Tailored, keyword-perfect, indistinguishable."],
  "The Repeat", "locked-off hold",
  "a printer in a dark room ejecting identical sheets faster and faster until they form a continuous ribbon "
  "of paper flowing across the floor and out of frame",
  "cold teal from a single monitor beside the printer, hard specular on the moving paper, black surround",
  dict(k="printer")),

S(7, ["So applications went up ten times.", "Employers answered with more filters. Candidates answered with more machines."],
  "Wrong Scale", "one smooth crane down",
  "an impossibly tall wall of stacked grey server racks, and pressed against it a tide of paper rising steadily "
  "up the wall like floodwater",
  "cold teal indicator light bleeding from the racks, the paper tide catching it, deep blue-black above",
  dict(k="servers")),

S(7, ["Two systems now write and read documents that no human believes, at enormous speed, to decide who gets to work."],
  "Folded Space", "slow dolly right",
  "two identical dark rooms facing each other through an open doorway, each containing a machine feeding paper "
  "to the other in a closed loop, no person present in either room",
  "cold teal machine light in both rooms, the doorway between them a hard-edged rectangle of glow",
  dict(k="loop_rooms")),

S(7, ["The signal is gone. What is left is noise with a font."],
  "Soft Erasure", "slow push-in",
  "a vast drift of paper filling a dark hall to waist height, slowly disintegrating into grey dust that hangs "
  "in the air and dims the light",
  "one cold teal shaft from above choking with dust until it fades, crushed blacks",
  dict(k="dust")),

S(7, ["The CV survived a century because it was expensive to fake.", "That is no longer true, and nothing about it survives that fact."],
  "The Repeat", "locked-off hold",
  "a single sheet of paper being reproduced over and over on a dark table, each copy appearing instantly beside "
  "the last until the table and then the whole frame is covered",
  "cold teal hard top light, paper white blowing slightly hot, everything beyond the table black",
  dict(k="copies"),
  cap="noise with a font"),

# ================= ACT 8 - VERDICT =================
S(8, ["The verdict."],
  "The Freeze", "locked-off hold",
  "a single empty chair in the centre of a vast dark hall, one shaft of dusk light on it, dust motes completely "
  "frozen in mid-air around it",
  "sodium orange dusk shaft from a high window, everything else deep blue-black, extreme negative space",
  dict(k="chair"),
  head="VERDICT", sub="obsolete, and being defended"),

S(8, ["The CV was never a measurement.", "It was a proxy. A cheap stand-in for evidence, in an age when real evidence could not travel."],
  "The Swap", "slow push-in",
  "a small paper photograph of a person on a table; without a cut the photograph becomes the actual person, "
  "small and standing on the table, then becomes the photograph again",
  "warm sodium dusk key from a low window, long shadow across the table, crushed blacks",
  dict(k="photo")),

S(8, ["That age ended. Evidence travels now.", "Work is online, versioned, timestamped, public."],
  "Time Slip", "slow dolly left",
  "a workshop bench at dusk where a finished object sits; the light races backward through the whole day "
  "revealing every stage of its making in one continuous unbroken shot",
  "sodium orange dusk racing back to midday white and forward again, hard raking key across the bench",
  dict(k="bench")),

S(8, ["We kept the proxy anyway, because the institutions built around it are heavier than the truth it was hiding."],
  "Wrong Scale", "one smooth crane down",
  "an enormous stone institutional building resting its entire weight on a single sheet of paper at ground "
  "level, the paper not bending",
  "sodium orange dusk raking across the stone facade, the paper lit hot white, deep blue shadow beneath",
  dict(k="weight")),

S(8, ["The CV is not broken. It is obsolete, and being defended.", "Those are different problems, and only one of them is fixable."],
  "The Slow Crowd", "slow push-in",
  "a row of figures in silhouette standing shoulder to shoulder in front of a wall of filing cabinets, all "
  "with arms folded, all turning their heads to camera in perfect unison",
  "sodium orange backlight throwing the row into hard silhouette, dusk sky beyond, crushed blacks",
  dict(k="defenders"),
  cap="obsolete, and defended"),

# ================= ACT 9 - THE BETTER VERSION =================
S(9, ["So design the replacement. It is not complicated."],
  "Time Slip", "slow push-in",
  "an empty room at first light where the sun rises fully in one continuous shot, the shadows retreating "
  "across a bare floor to reveal a plain table and two chairs facing each other",
  "warm gold sunrise racing across the floor, clean sky through the window, long retreating shadows",
  dict(k="sunrise"),
  head="THE BETTER VERSION", sub="four changes, all of them cheap"),

S(9, ["One. Hire on the work, not the account of the work.", "A real task, scoped to four hours, and pay for it."],
  "The Swap", "locked-off hold",
  "two people at a plain table; a sheet of paper between them becomes a set of real tools and materials, and "
  "both pairs of hands begin working on it together",
  "warm gold key from a large window camera left, soft falloff, blue-black shadow behind",
  dict(k="tools"),
  cap="1 · pay for the trial"),

S(9, ["Two. Make the record verifiable, not narrated.", "Signed proof of what you shipped, issued by whoever you shipped it to."],
  "Object Rain", "slow dolly right",
  "small solid metal objects falling gently upward from a workbench into a gold-lit sky, each one settling "
  "into a slow orbit above the bench rather than drifting away",
  "warm gold low sun from behind, objects rim-lit hard, deep blue-black ground",
  dict(k="rain", n=45, up=True, coin=True),
  cap="2 · signed proof, not prose"),

S(9, ["Three. Kill the date line. Replace continuity with capability.", "Nobody has ever needed to know which months you existed."],
  "Soft Erasure", "slow push-in",
  "a long unbroken horizontal line of paper stretched across a bright room dissolving away into light from "
  "both ends towards the middle, leaving a row of solid objects standing where it was",
  "warm gold high-key light, blown highlights at the dissolving ends, clean shadow beneath the objects",
  dict(k="dateline"),
  cap="3 · capability, not continuity"),

S(9, ["Four. Score blind. The task first, the person after."],
  "Folded Space", "locked-off hold",
  "a plain door opening onto a room with a finished piece of work on a table and nobody in it; the door closes "
  "and opens again onto the same room, now with a person standing beside the work",
  "warm gold interior key through the doorway, the corridor side in blue-black shadow",
  dict(k="blind_door"),
  cap="4 · task first, person after"),

S(9, ["This costs employers more per candidate, and far less per hire, because the expensive thing was never screening.", "It was being wrong."],
  "Wrong Scale", "one smooth crane down",
  "an enormous pair of balance scales in a gold-lit hall; one pan holds a mountain of paper, the other holds "
  "a single small finished object, and the small object is heavier",
  "warm gold shaft from high above onto the scales, everything beyond in deep blue-black",
  dict(k="scales")),

S(9, ["The paper self was a photograph taken when nobody could see you work.", "Everyone can see you work now."],
  "The Swap", "slow push-in",
  "a man holding a paper photograph of himself at arm's length; the photograph goes blank and the real room "
  "behind it comes into focus, full of his actual finished work",
  "warm gold morning key from camera right, soft wrap on the face, deep shadow behind",
  dict(k="reveal")),

S(9, ["Put the photograph down."],
  "Soft Erasure", "locked-off hold",
  "a hand placing a blank sheet of paper face down on a table and lifting away; the paper dissolves quietly "
  "into light, leaving the bare table in morning sun",
  "warm gold sunrise flooding the table, blown white highlight where the paper was, blue-black room beyond",
  dict(k="putdown")),

S(9, ["This was DREAM."],
  "Folded Space", "slow push-in",
  "a plain open doorway in a bright empty room filled with gold morning light, nobody in frame, the light "
  "slowly intensifying until it fills the whole doorway",
  "warm gold sunrise through the doorway blowing to white, deep blue-black room around it",
  dict(k="outro"),
  head="DREAM"),
]

def prompt_for(s):
    a = ACTS[s["act"]-1]
    acc = ACCENTS[a["accent"]][0]
    return (f"{STYLE_BIBLE} Dominant accent for this scene: {acc}. "
            f"Camera: {s['move']}. Subject: {s['subject']}. Light: {s['light']}. "
            f"Dream grammar: {s['grammar']}. {TAIL}")

if __name__ == "__main__":
    import re
    words = sum(len(re.findall(r"[A-Za-z']+", l)) for s in SHOTS for l in s["lines"])
    print("shots:", len(SHOTS), "lines:", sum(len(s['lines']) for s in SHOTS), "words:", words)
    for i,a in enumerate(ACTS,1):
        n=[s for s in SHOTS if s['act']==i]
        print(f"  act{i} {a['head'][:28]:30s} shots={len(n)}")
