# -*- coding: utf-8 -*-
"""DREAM - "A Bin With No Away" - flat-vector motion graphics, fixed frame."""
TITLE="A Bin With No Away"; CHANNEL="DREAM"

# flat, saturated, high-contrast on deep navy. no gradients doing the work.
PAL = dict(bg="#0E1626", bg2="#142034", ink="#EAF2FA", dim="#8FA3BC",
           red="#FF6B6B", orange="#FFA45B", yellow="#FFD46B", mint="#54E8A0",
           teal="#45C7D6", blue="#4A90E2", sky="#8FD3FF", violet="#A78BFA",
           pink="#F58FC2", sand="#EBD9B4", clay="#D3835B", green="#3FBF7F")

ACTS=[
 dict(id=1, head="A BIN WITH NO AWAY",      key="teal",   bg="#0E1626"),
 dict(id=2, head="AWAY IS NOT A PLACE",     key="sky",    bg="#0E1A2C"),
 dict(id=3, head="THE ACTUAL MACHINE",      key="blue",   bg="#101A2E"),
 dict(id=4, head="IT SAVED YOUR ANCESTORS", key="mint",   bg="#0E1F26"),
 dict(id=5, head="THE LOOP DOES NOT CLOSE", key="yellow", bg="#171A26"),
 dict(id=6, head="THE COST IS MOVED",       key="orange", bg="#1B1726"),
 dict(id=7, head="THERE IS NO AWAY",        key="red",    bg="#1E1424"),
 dict(id=8, head="VERDICT",                 key="violet", bg="#141428"),
 dict(id=9, head="BUILD FOR THAT",          key="green",  bg="#0E2026"),
]

def S(act, lines, scene, head=None, sub=None, cap=None, big=None, stat=None):
    return dict(act=act, lines=lines, scene=scene, head=head, sub=sub, cap=cap, big=big, stat=stat)

SCENES=[
# ---------------- ACT 1 : HOOK ----------------
S(1,["Every day you perform a small act of magic."],
  dict(k="title_bin"), head="A BIN WITH NO AWAY", sub="EPISODE 11"),
S(1,["You put something into a container, and it stops existing.","A bag. A wrapper. A bottle. Gone.",
      "Roughly a kilo of it. Every day. For your entire life."],
  dict(k="drop_in")),
S(1,["It is not gone.","It has never once been gone."],
  dict(k="reveal_behind"), big="IT IS NOT GONE"),
S(1,["Tonight: a bin with no away."],
  dict(k="earth_orbit_trash")),
# ---------------- ACT 2 : AWAY IS NOT A PLACE ----------------
S(2,["Away is not a place.","It is a distance."],
  dict(k="ruler"), head="AWAY IS NOT A PLACE", sub="it is a distance"),
S(2,["The whole system has exactly one job: move the object far enough that you stop thinking about it.",
      "Every city on Earth is built around that single trick."],
  dict(k="conveyor_out")),
S(2,["That distance is about four metres.","The width of a kitchen."],
  dict(k="four_metres"), stat=dict(v=4, unit="m", label="the entire range of 'away'")),
S(2,["Past four metres the object becomes somebody else's problem.","And the problem is extremely real."],
  dict(k="handoff"), cap="somebody else's here"),
# ---------------- ACT 3 : THE MACHINE ----------------
S(3,["Here is the actual machine."],
  dict(k="machine_build"), head="THE ACTUAL MACHINE", sub="what happens after the lid closes"),
S(3,["A truck. A sorting hall.","A furnace, a hole in the ground, or a ship.",
      "None of it is hidden. All of it is invisible."],
  dict(k="flow_chain")),
S(3,["Roughly two billion tonnes of household waste move through it every year."],
  dict(k="tonnage"), stat=dict(v=2000000000, unit="t", label="household waste, every year")),
S(3,["About a fifth of it is recycled.","The rest is buried, burned, or lost."],
  dict(k="split_donut"), cap="19% recycled"),
S(3,["The recycling arrow is a loop.","The system is a line, and the line ends somewhere."],
  dict(k="loop_breaks"), big="A LINE, NOT A LOOP"),
# ---------------- ACT 4 : STEEL-MAN ----------------
S(4,["Now the strongest case for it, and it is genuinely strong."],
  dict(k="steelman_open"), head="IT SAVED YOUR ANCESTORS", sub="the honest defence"),
S(4,["Before this system, waste stayed where it fell.","Cities died of it."],
  dict(k="old_city")),
S(4,["Cholera. Typhoid. Plague.","Carried by exactly what nobody removed."],
  dict(k="disease_curve")),
S(4,["Municipal waste collection is one of the largest life-saving inventions in human history.","It outperforms most medicine."],
  dict(k="lives_bar"), stat=dict(v=100, unit="%", label="one of the great public-health wins")),
S(4,["It is cheap, it is universal, and it runs every single day without you knowing anything about it.",
      "Rubbish collection is not glamorous. It is load-bearing."],
  dict(k="city_runs")),
S(4,["Do not mistake what follows for contempt.","This system saved your ancestors."],
  dict(k="respect"), cap="that is the honest defence"),
# ---------------- ACT 5 : THE LOOP ----------------
S(5,["Here is where it breaks."],
  dict(k="crack_open"), head="THE LOOP DOES NOT CLOSE", sub="you were told a loop. it is a slide."),
S(5,["You were told the loop closes.","It mostly does not."],
  dict(k="loop_fail")),
S(5,["Most plastic can be recycled once, or twice, into something worse.","Then it is finished.",
      "Glass and metal are the honest ones. They really do come back. Plastic was sold to you on their reputation."],
  dict(k="downcycle")),
S(5,["That is not a loop.","That is a slide with extra steps."],
  dict(k="slide"), big="A SLIDE WITH EXTRA STEPS"),
S(5,["And the symbol on the packet was never a promise.","It is a category code. It means what I am, not I will come back."],
  dict(k="symbol_lie"), cap="a code, not a promise"),
# ---------------- ACT 6 : THE COST IS MOVED ----------------
S(6,["The second break is bigger."],
  dict(k="cost_open"), head="THE COST IS MOVED", sub="never actually paid"),
S(6,["The person who made the object pays nothing to end it."],
  dict(k="maker_free")),
S(6,["They choose the material, the layers, the glue, the colour.","Every decision that makes it unrecyclable, and they carry none of the cost."],
  dict(k="decisions")),
S(6,["You carry it. Your city carries it.","Then a poorer country carries it."],
  dict(k="cost_passes")),
S(6,["A system where the decision-maker is immune to the consequence will always produce more of the consequence.",
      "This is not greed. It is a missing wire in the circuit."],
  dict(k="feedback_cut"), big="IMMUNE TO THE CONSEQUENCE"),
# ---------------- ACT 7 : COLLAPSE ----------------
S(7,["So it scaled."],
  dict(k="scale_open"), head="THERE IS NO AWAY", sub="only somebody else's here"),
S(7,["Half of all the plastic ever made was made in the last twenty years."],
  dict(k="plastic_curve"), stat=dict(v=50, unit="%", label="of all plastic ever: made since 2005")),
S(7,["We did not get better at disposal.","We got better at hiding."],
  dict(k="hiding")),
S(7,["And away kept getting further.","First the edge of town. Then the sea. Then the air. Then the bloodstream.",
      "Microplastic is not a pollution story. It is a design story with a longer delay."],
  dict(k="away_ladder")),
S(7,["There is no away.","There is only somebody else's here."],
  dict(k="no_away"), big="THERE IS NO AWAY"),
# ---------------- ACT 8 : VERDICT ----------------
S(8,["The verdict."],
  dict(k="verdict_open"), head="VERDICT", sub="we built disposal and called it waste"),
S(8,["The bin is not the failure. The bin works perfectly.","It does exactly what it was built to do, which is to end your relationship with an object."],
  dict(k="bin_works")),
S(8,["The failure is that we built a disposal system and called it a waste system."],
  dict(k="two_questions")),
S(8,["Disposal asks: where does this go?","A waste system asks: who pays for what this becomes?"],
  dict(k="question_swap"), big="WHO PAYS?"),
S(8,["We have been answering the easy question for a hundred and fifty years.",
      "A bin is an answer to a question we stopped asking."],
  dict(k="years"), stat=dict(v=150, unit="yr", label="answering the easy question")),
# ---------------- ACT 9 : THE BETTER VERSION ----------------
S(9,["So design it properly.","Four rules."],
  dict(k="v2_open"), head="BUILD FOR THAT", sub="four rules, all of them boring"),
S(9,["One. Whoever makes the object owns its ending.","Price the disposal into the sale, at the factory, before it ships."],
  dict(k="rule1"), cap="1 · the maker owns the ending"),
S(9,["Two. Make the material count.","One polymer per product. If it cannot be separated, it cannot be sold."],
  dict(k="rule2"), cap="2 · one material per product"),
S(9,["Three. Put the number on the front.","Not a triangle. A real figure: what this costs to end, in money."],
  dict(k="rule3"), cap="3 · print the real cost"),
S(9,["Four. Make away visible.","If a city cannot process its own waste inside its own borders, that city has not solved anything."],
  dict(k="rule4"), cap="4 · process it where you make it"),
S(9,["None of this is exotic.","It is a bill, attached to the right person, at the right moment.",
      "Make the ending expensive at the beginning, and the beginning changes."],
  dict(k="the_bill")),
S(9,["Do that, and the loop finally closes, because somebody is finally holding both ends of it."],
  dict(k="loop_closes")),
S(9,["There is no away.","Build for that."],
  dict(k="outro"), big="BUILD FOR THAT"),
S(9,["This was DREAM."],
  dict(k="signoff")),
]

if __name__=="__main__":
    import re
    w=sum(len(re.findall(r"[A-Za-z']+",l)) for s in SCENES for l in s["lines"])
    print("scenes:",len(SCENES),"lines:",sum(len(s['lines']) for s in SCENES),"words:",w)
    for a in ACTS: print(f"  act{a['id']} {a['head'][:26]:28s} scenes={len([s for s in SCENES if s['act']==a['id']])}")
    ks=[s['scene']['k'] for s in SCENES]; print("keys:",len(set(ks)),"unique of",len(ks))
