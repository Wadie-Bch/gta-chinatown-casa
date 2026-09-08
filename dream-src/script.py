# -*- coding: utf-8 -*-
"""DREAM - "A Pocket With No Thief" : script + shot list."""

TITLE   = "A Pocket With No Thief"
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

ACCENTS = {
 "sodium": ("sodium orange", "#F5A04E", "#D3835B"),
 "teal":   ("cold teal",     "#5FC9D6", "#4A90E2"),
 "gold":   ("warm gold",     "#FFD46B", "#F5B94E"),
}

ACTS = [
 dict(id=1, head="A POCKET WITH NO THIEF", sub="the oldest security system on earth", accent="sodium", grade="night-sodium"),
 dict(id=2, head="IT IS NOT A CONTAINER",  sub="it is an assumption",                 accent="teal",   grade="cold-dawn"),
 dict(id=3, head="FOUR SECONDS",           sub="what actually protects it",           accent="teal",   grade="grey-street"),
 dict(id=4, head="THE STRONGEST CASE",     sub="and it is a serious one",             accent="gold",   grade="warm-day"),
 dict(id=5, head="IT CANNOT TELL HANDS APART", sub="perfect access, zero authentication", accent="teal", grade="cold-hard"),
 dict(id=6, head="THE LOSS IS TOTAL",      sub="four seconds, and it is permanent",   accent="sodium", grade="sodium-storm"),
 dict(id=7, head="A POCKET WITH A SCREEN", sub="the thief moved up one layer",        accent="teal",   grade="screen-night"),
 dict(id=8, head="VERDICT",                sub="concealment is not a lock",           accent="sodium", grade="dusk"),
 dict(id=9, head="POCKET V2",              sub="four rules, and a thief takes nothing", accent="gold", grade="gold-rise"),
]

def S(act, lines, grammar, move, subject, light, plate, head=None, sub=None, cap=None):
    return dict(act=act, lines=lines, grammar=grammar, move=move, subject=subject,
                light=light, plate=plate, head=head, sub=sub, cap=cap)

SHOTS = [
# ================= ACT 1 - HOOK =================
S(1, ["Right now, you are carrying everything that matters in a hole sewn into your clothes."],
  "Wrong Scale", "slow push-in",
  "a man alone on a night street seen from behind, and the opening of his coat pocket is enormous, "
  "the size of a doorway, a deep black void cut into the fabric",
  "sodium orange streetlight from a single overhead lamp, wet asphalt, deep blue-black shadows",
  dict(k="pocket_void"), head="A POCKET WITH NO THIEF", sub="EPISODE 10"),

S(1, ["It has no lid. No lock. No alarm.", "It does not know who you are."],
  "The Repeat", "locked-off hold",
  "extreme close on a trouser pocket in hard light while different hands, one after another, reach in "
  "and out of it without resistance, the fabric never changing",
  "single hard sodium key from camera right, everything else crushed to black",
  dict(k="hands_in")),

S(1, ["It is the oldest security system on Earth, and it has never once been upgraded.",
      "Every other object you own has been redesigned a hundred times. This one was never touched."],
  "Time Slip", "slow dolly right",
  "a single garment on a stand while six hundred years of clothing styles change around it in one "
  "continuous shot, the pocket itself never changing shape",
  "sodium orange museum key light racing through day and night, deep shadow behind",
  dict(k="garment_slip")),

S(1, ["Tonight: a pocket with no thief."],
  "Object Rain", "one smooth crane down",
  "coins, keys, folded banknotes and cards falling slowly upward out of a crowd of people in a dark "
  "street, drifting away into the night sky",
  "sodium streetlight from below catching each falling object, blue-black sky above",
  dict(k="rain_valuables")),

# ================= ACT 2 - WHAT IT IS =================
S(2, ["A pocket is not a container.", "It is an assumption."],
  "The Swap", "slow push-in",
  "a heavy steel safe standing in an empty room slowly becoming, without a cut, a limp square of grey "
  "cloth hanging in exactly the same place",
  "cold teal window light from camera left, long shadow, heavy negative space",
  dict(k="safe_to_cloth"), head="IT IS NOT A CONTAINER", sub="it is an assumption"),

S(2, ["Physically it is a bag of cloth held shut by gravity and friction.", "That is the entire mechanism."],
  "Wrong Scale", "locked-off hold",
  "an enormous cross-section of a fabric pocket filling the frame like a geological cutaway, two layers "
  "of cloth and a seam, nothing else inside it",
  "cold teal raking light across the weave, dust in the air, crushed blacks",
  dict(k="seam_section")),

S(2, ["It survives on one belief: that the space six inches from your skin belongs to you."],
  "The Slow Crowd", "slow dolly left",
  "a dense crowd on a station concourse where every person has a faint spherical boundary around their "
  "body that others move around without touching",
  "cold teal overhead light, figures in silhouette, one bright shaft through the roof",
  dict(k="bubbles")),

S(2, ["That belief is doing all the work. The cloth is doing almost none.",
      "Take the belief away, and a pocket is just a hole."],
  "Soft Erasure", "slow push-in",
  "a coat hanging in a dark room; the fabric slowly dissolves into drifting threads and dust until only "
  "the shape of the pocket's contents remains hanging in mid-air",
  "one cold teal shaft from a high window, the rest of the room black",
  dict(k="coat_dissolve"), cap="the cloth is not the lock"),

# ================= ACT 3 - FOUR SECONDS =================
S(3, ["So what actually protects it?", "Not the pocket. You do."],
  "The Freeze", "slow push-in",
  "a busy street where everyone is frozen mid-stride except one man who is pressing his hand flat "
  "against his thigh as he walks",
  "flat grey street daylight with a cold teal cast, one warmer pool on the moving man",
  dict(k="freeze_street"), head="FOUR SECONDS", sub="what actually protects it"),

S(3, ["You protect it with attention. A hand pressed against your thigh in a crowd."],
  "The Repeat", "locked-off hold",
  "close on a hand repeatedly patting a pocket, the same gesture over and over, the owner's face never "
  "entering frame",
  "hard cold teal key from above, black surround, fabric texture catching light",
  dict(k="pat_loop")),

S(3, ["A pickpocket does not defeat the cloth.", "Nobody has ever needed to defeat cloth."],
  "Wrong Scale", "slow dolly right",
  "an immense bank vault door standing open in the middle of a pavement, and beside it a single thread "
  "of cotton stretched between two posts, which is the thing people actually walk around",
  "cold grey-teal daylight, hard shadow under the vault door, high contrast",
  dict(k="vault_vs_thread")),

S(3, ["They defeat your attention.", "A bump. A question. A spilled drink. Four seconds."],
  "The Repeat", "locked-off hold",
  "the same collision between two strangers on a pavement replayed four times, each time a different "
  "small distraction, each time one hand leaving the frame low",
  "cold teal street light, motion blur on the passing crowd, crushed blacks",
  dict(k="four_seconds")),

S(3, ["The theft happened in the one place with no security at all: your focus.",
      "A lock you have to remember is not a lock. It is a chore."],
  "Wrong Scale", "one smooth crane down",
  "a vast dark control room full of monitors all pointed at one small empty chair, and the chair is "
  "turned away",
  "cold teal monitor glow as the only source, the room beyond in deep blue-black",
  dict(k="attention_chart"), cap="the gap is four seconds wide"),

# ================= ACT 4 - STEEL-MAN =================
S(4, ["Now the strongest case for the pocket, and it is a serious one."],
  "Time Slip", "slow push-in",
  "a plain tailor's table at dawn where the light races through a whole day while hands sew a single "
  "pocket into a garment in one continuous unbroken shot",
  "warm gold sunlight running fast across the bench, long racing shadows",
  dict(k="tailor"), head="THE STRONGEST CASE", sub="and it is a serious one"),

S(4, ["It costs nothing. A pocket is two seams.", "It has been free for six hundred years."],
  "The Repeat", "slow dolly left",
  "a needle passing through cloth over and over in close-up, the same two stitches repeating, the pile "
  "of finished garments beside it growing enormous",
  "warm gold lamplight, rich shadow, shallow focus on the needle",
  dict(k="two_seams")),

S(4, ["It needs no power, no signal, no account, no permission.", "And it never fails."],
  "The Freeze", "locked-off hold",
  "a wall of dead electronic devices with black screens in a dark room, and in front of them one "
  "ordinary jacket hanging, lit and intact",
  "warm gold key on the jacket only, the dead devices in cold blue-black shadow",
  dict(k="dead_devices")),

S(4, ["It is instant. No unlock, no latency, no queue.", "Hand in, hand out."],
  "The Slow Crowd", "slow dolly right",
  "a long queue of people at a barrier all reaching into their pockets in perfect unison and withdrawing "
  "their hands at exactly the same moment",
  "warm gold low sun raking down the line, long shadows, clean sky",
  dict(k="unison_reach")),

S(4, ["It works for everyone. The rich, the poor, the offline, the undocumented."],
  "The Repeat", "one smooth crane down",
  "seen from above, dozens of different hands from different lives all placing something into a pocket, "
  "the same motion repeated across every kind of clothing",
  "warm gold top light, deep shadow between the figures, high contrast",
  dict(k="every_hand")),

S(4, ["No other system on Earth has that reach.", "The pocket is the most successful infrastructure nobody designed."],
  "Wrong Scale", "slow push-in",
  "an enormous map-like field of tiny lit windows stretching to the horizon, each one holding a single "
  "small glowing point at waist height",
  "warm gold points of light against a deep blue-black landscape, one raking key",
  dict(k="reach_bars"), cap="that is the honest defence"),

# ================= ACT 5 - NO AUTHENTICATION =================
S(5, ["Here is the break.", "The pocket cannot tell hands apart."],
  "The Swap", "slow push-in",
  "a hand reaching into a pocket; without a cut the hand becomes a different hand, then another, then "
  "another, the pocket never reacting",
  "cold teal hard key from camera right, black surround, skin rim-lit",
  dict(k="hand_swap"), head="IT CANNOT TELL HANDS APART", sub="perfect access, zero authentication"),

S(5, ["It gives to any hand with the same obedience. Yours, a friend's, a stranger's.",
      "This is not a flaw in the pocket. This is the pocket."],
  "The Repeat", "locked-off hold",
  "three identical pockets side by side, three different hands entering and leaving them at exactly the "
  "same rhythm, all three withdrawing the same object",
  "cold teal key from above, the three figures in silhouette, crushed blacks",
  dict(k="three_hands")),

S(5, ["Every other system we own asks who you are.", "The pocket never asks."],
  "Folded Space", "slow dolly left",
  "a corridor of security doors each with a reader beside it, all of them opening in sequence, and at "
  "the end of the corridor a plain open pocket with nothing beside it at all",
  "cold teal corridor lights repeating to infinity, strong key, deep shadow",
  dict(k="reader_corridor")),

S(5, ["It is a system with perfect availability and zero authentication, holding the things you can least afford to lose.",
      "We would refuse this anywhere else. We accept it on the thing that carries our rent."],
  "Wrong Scale", "one smooth crane down",
  "a single small open pocket lying on the floor of a vast empty vault, the vault door wide open behind it",
  "cold teal shaft from far above onto the pocket, the vault in blue-black darkness",
  dict(k="auth_chart"), cap="availability 100% · authentication 0%"),

# ================= ACT 6 - THE LOSS IS TOTAL =================
S(6, ["And when it fails, it fails completely."],
  "Soft Erasure", "locked-off hold",
  "a folded banknote resting on wet ground under a streetlight slowly dissolving into rain and light "
  "until the pavement is bare",
  "sodium orange streetlight through heavy rain, storm-blue sky, wet reflections",
  dict(k="note_dissolve"), head="THE LOSS IS TOTAL", sub="four seconds, and it is permanent"),

S(6, ["Cash has no owner.", "The moment it leaves your cloth, it is theirs, and it is legal tender in their hand."],
  "The Swap", "slow push-in",
  "a banknote held in one hand passing into another hand, and as it crosses the gap it visibly becomes "
  "new and clean, all trace of the first hand gone",
  "sodium orange hard key on the exchange, both faces out of frame, deep black surround",
  dict(k="note_transfer")),

S(6, ["Keys, documents, a phone. Gone in one motion, with no receipt, no trace, no appeal."],
  "Object Rain", "one smooth crane down",
  "keys, cards, papers and phones falling into a deep black drain in a wet street and never landing",
  "sodium orange streetlight raking across the wet ground, the drain absolutely black",
  dict(k="drain")),

S(6, ["There is no other place in your life where a four-second event is permanent and unreversible."],
  "Wrong Scale", "slow dolly right",
  "a huge rectangular hole cut cleanly out of a wet plaza, the exact shape of a pocket opening, "
  "bottomless, with a man standing at its edge",
  "sodium orange low sun raking the plaza, the void completely black, storm cloud above",
  dict(k="recovery_chart"), cap="recovered: almost none of it"),

S(6, ["We accepted that, because we could not imagine an alternative.",
      "A hand pressed on your own pocket is not security. It is anxiety, and we have been calling it a solution."],
  "The Slow Crowd", "locked-off hold",
  "hundreds of people standing still in heavy rain, each one with a hand resting flat over their own "
  "pocket, none of them moving",
  "sodium orange streetlight from behind throwing the crowd into silhouette, rain lit from behind",
  dict(k="still_hands")),

# ================= ACT 7 - A POCKET WITH A SCREEN =================
S(7, ["Then we put everything into a glass rectangle and called it solved."],
  "The Swap", "slow push-in",
  "a pile of coins, notes, keys and cards on a dark table collapsing without a cut into a single black "
  "glass rectangle lying in the same place",
  "cold teal screen glow as the only light, the room otherwise pure black",
  dict(k="pile_to_phone"), head="A POCKET WITH A SCREEN", sub="the thief moved up one layer"),

S(7, ["The phone is still a pocket.", "It is a pocket with a screen."],
  "Wrong Scale", "locked-off hold",
  "an enormous glass rectangle standing upright in a dark room like a monolith, and cut into its face "
  "at waist height is an ordinary cloth pocket opening",
  "cold teal edge light along the glass, the pocket opening completely black",
  dict(k="phone_pocket")),

S(7, ["So the theft simply moved up a layer.", "They no longer steal the value. They steal the moment it is open."],
  "The Freeze", "slow dolly right",
  "a crowded night street frozen completely still except for one pair of eyes, in the background, "
  "tracking a lit screen held by someone in the foreground",
  "cold teal screen light on the foreground face, sodium street light behind, crushed blacks",
  dict(k="watching")),

S(7, ["Watch the code, then take the phone.", "Or take the person, and ask."],
  "The Repeat", "locked-off hold",
  "the same unlocking gesture on a lit screen repeated over and over from a stranger's viewpoint, each "
  "repetition a little closer",
  "cold teal screen glow from below on unseen hands, everything beyond black",
  dict(k="unlock_loop")),

S(7, ["Encryption did not remove the thief. It just made them look you in the eye.",
      "The glass changed who has to be present. It did not change who wins."],
  "The Swap", "slow push-in",
  "a heavy steel padlock on a dark table becoming, without a cut, a human hand held open and waiting",
  "cold teal single hard source, deep shadow, the hand rim-lit",
  dict(k="lock_to_hand"), cap="the lock now has a face"),

# ================= ACT 8 - VERDICT =================
S(8, ["The verdict."],
  "The Freeze", "locked-off hold",
  "one empty coat hanging alone in a vast dark hall under a single shaft of dusk light, dust frozen in "
  "the air around it",
  "sodium orange dusk shaft from a high window, everything else deep blue-black",
  dict(k="verdict_coat"), head="VERDICT", sub="concealment is not a lock"),

S(8, ["The pocket was never security.", "It was concealment, and concealment is not a lock. It is a hope."],
  "The Swap", "slow push-in",
  "a solid brass padlock lying on a table slowly becoming a thin square of folded paper in the same "
  "position, keeping the same highlight",
  "warm sodium dusk key from a low window, long shadow across the table",
  dict(k="lock_to_paper")),

S(8, ["Everything we have built since, zips, chains, money belts, phone cases, defends the container.",
      "Six hundred years of engineering, aimed at the wrong object."],
  "The Repeat", "slow dolly left",
  "a long row of increasingly elaborate fastenings, zips, chains and straps, each one being closed in "
  "sequence, all of them on the same plain piece of cloth",
  "sodium orange raking key down the row, deep shadow behind each fastening",
  dict(k="fastenings")),

S(8, ["That is the wrong target.", "The container was never the problem. Possession was."],
  "Wrong Scale", "one smooth crane down",
  "an enormous armoured strongbox resting on the ground, wide open and completely empty, while a small "
  "ordinary hand nearby holds one coin",
  "sodium orange dusk raking across the metal, the interior in deep shadow",
  dict(k="wrong_target")),

S(8, ["As long as holding a thing means owning it, every pocket on Earth is unlocked.",
      "Not weak. Unlocked. There is nothing in it to break."],
  "The Slow Crowd", "slow push-in",
  "a horizon-wide crowd seen in silhouette at dusk, every single person's pocket glowing faintly and "
  "openly, all of them turning to camera in unison",
  "sodium orange backlight throwing the crowd into hard silhouette, dusk sky beyond",
  dict(k="all_unlocked"), cap="holding is not owning"),

# ================= ACT 9 - POCKET V2 =================
S(9, ["So build the second version.", "Four rules."],
  "Time Slip", "slow push-in",
  "an empty workbench at first light where the sun rises fully in one continuous shot, revealing four "
  "small objects laid out in a row",
  "warm gold sunrise racing across the bench, long retreating shadows, clean sky",
  dict(k="v2_bench"), head="POCKET V2", sub="four rules, and a thief takes nothing"),

S(9, ["One. Separate holding from owning.", "What you carry is a pointer. The value sits somewhere a hand cannot reach."],
  "The Swap", "locked-off hold",
  "a thick bundle of banknotes in an open palm becoming a single thin blank card, while in the deep "
  "background a lit vault door stays exactly where it was",
  "warm gold key from a window camera left, soft falloff, blue-black depth behind",
  dict(k="pointer"), cap="1 · carry the pointer, not the value"),

S(9, ["Two. Bind access to the body, not the object.", "It should open while you walk, and close the instant it leaves you."],
  "The Repeat", "slow dolly right",
  "a person walking steadily while a small object at their hip glows warm in rhythm with their stride, "
  "and dims to nothing the moment it is lifted away from them",
  "warm gold rim light following the walk, deep blue-black surround",
  dict(k="body_bound"), cap="2 · the body is the key"),

S(9, ["Three. Build a duress mode.", "A forced hand opens a decoy, and quietly calls for help."],
  "Folded Space", "locked-off hold",
  "a hand opening a small container to reveal a modest amount of money, and behind it through a doorway "
  "the same container is open again holding far more, unreachable",
  "warm gold key on the near container, the far doorway cooler and deeper",
  dict(k="duress"), cap="3 · a decoy, and a silent alarm"),

S(9, ["Four. Make transfer slow. Give value a delay, and a theft becomes an appeal.",
      "None of this is speculative. Every piece already exists, deployed somewhere else, for someone richer than you."],
  "Time Slip", "slow push-in",
  "an object passing between two hands extremely slowly while the daylight around them races through "
  "an entire afternoon, the object never quite arriving",
  "warm gold light sweeping fast across both hands, long moving shadows",
  dict(k="delay_chart"), cap="4 · a delay is a right of appeal"),

S(9, ["Then a thief can take the cloth, and the phone, and the notes, and still take nothing."],
  "Soft Erasure", "one smooth crane down",
  "a running figure at night clutching a bundle, and as they run the bundle quietly dissolves into "
  "light in their arms until their hands are empty",
  "warm gold street light behind the runner, motion blur, deep blue-black street",
  dict(k="runner_empty")),

S(9, ["Because they were never carrying your money.", "They were carrying a receipt for it."],
  "The Swap", "slow push-in",
  "an open palm holding a small folded banknote which becomes a thin plain slip of paper, weightless, "
  "lifting slightly off the skin",
  "warm gold morning key from camera right, soft wrap on the hand, deep shadow behind",
  dict(k="receipt")),

S(9, ["Steal the pocket. Keep the pocket."],
  "Wrong Scale", "locked-off hold",
  "an ordinary jacket lying open and abandoned on a bright morning pavement, both pockets turned "
  "inside out, and nothing anywhere near it",
  "warm gold morning sun flooding the pavement, hard clean shadow",
  dict(k="empty_jacket"), cap="take the cloth. it was never the point."),

S(9, ["This was DREAM."],
  "Folded Space", "slow push-in",
  "a plain open doorway in a bright empty room filled with gold morning light, nobody in frame, the "
  "light slowly intensifying until it fills the whole doorway",
  "warm gold sunrise through the doorway blowing to white, deep blue-black room around it",
  dict(k="outro"), head="DREAM"),
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
        print(f"  act{i} {a['head'][:30]:32s} shots={len([s for s in SHOTS if s['act']==i])}")
    ks=sorted({s['plate']['k'] for s in SHOTS}); print(f"plate keys ({len(ks)}):"); print("  "+" ".join(ks))
