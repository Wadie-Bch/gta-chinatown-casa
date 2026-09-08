# -*- coding: utf-8 -*-
"""DREAM - "A City With No Flashing Light" - one continuous camera through a 3D city."""
TITLE="A City With No Flashing Light"; CHANNEL="DREAM"

# each act sets the world's state: time of day, density, mood. the camera never cuts.
ACTS=[
 dict(id=1, key="night",   sky="#0A0F1A", fog="#0A0F1A", warm=0.9,  dens=1.0),
 dict(id=2, key="night2",  sky="#0B1220", fog="#0C1524", warm=0.8,  dens=1.0),
 dict(id=3, key="predawn", sky="#101B2E", fog="#132238", warm=0.7,  dens=1.3),
 dict(id=4, key="dawn",    sky="#2A2740", fog="#3A3550", warm=0.5,  dens=1.1),
 dict(id=5, key="day",     sky="#5B7CA6", fog="#7E9CBE", warm=0.2,  dens=1.4),
 dict(id=6, key="grey",    sky="#4E5A6B", fog="#69768A", warm=0.2,  dens=1.6),
 dict(id=7, key="dusk",    sky="#3A2A38", fog="#5A3B44", warm=0.6,  dens=1.9),
 dict(id=8, key="night3",  sky="#0C1018", fog="#101826", warm=0.9,  dens=1.2),
 dict(id=9, key="sunrise", sky="#2E3F58", fog="#54708E", warm=0.4,  dens=0.7),
]

def S(act, lines, shot):
    return dict(act=act, lines=lines, shot=shot)

# shot = the camera's behaviour for this beat. one continuous flight; the MOVE changes.
SHOTS=[
# ---------------- ACT 1 : HOOK ----------------
S(1,["There is a lamp on a pole that tells two hundred million people what to do every day.",
     "Nobody voted for it."], dict(m="rise_to_light")),
S(1,["It has three states. It cannot see you.",
     "It has never once looked at the road.",
     "You have obeyed it more times than you have obeyed any law, any parent, any god."], dict(m="orbit_light")),
S(1,["Tonight: a city with no flashing light."], dict(m="pull_back_city")),
# ---------------- ACT 2 : WHAT IT IS ----------------
S(2,["A traffic light is not a safety device.","It is a rationing device."], dict(m="descend_junction")),
S(2,["It has one scarce resource, the middle of the junction, and one job: hand it out in turns."],
   dict(m="top_down_junction")),
S(2,["Most of them run a fixed schedule written years ago, looping whether anyone is there or not."],
   dict(m="glide_street")),
S(2,["At three in the morning, in an empty city, the machine is still dealing out turns to nobody."],
   dict(m="empty_street")),
# ---------------- ACT 3 : THE MACHINE ----------------
S(3,["Here is the real machine.","A cycle. Ninety seconds, give or take, split between the arms of the junction."],
   dict(m="crane_over_grid")),
S(3,["Green is not given to whoever is waiting.","It is given to whoever the plan said would be waiting."],
   dict(m="follow_queue")),
S(3,["Your car is a vote.","Your body is not. On most junctions a person on foot has to press a button to be counted."],
   dict(m="kerb_level")),
S(3,["Multiply that by every junction on Earth, every ninety seconds, forever.",
     "Ninety seconds is not a long time. It is a long time three hundred times a day."], dict(m="high_grid_sweep")),
# ---------------- ACT 4 : STEEL-MAN ----------------
S(4,["Now the strongest case for it, and it is overwhelming."], dict(m="dawn_rise")),
S(4,["Before signals, junctions were settled by nerve.","Nerve killed people."], dict(m="chaos_junction")),
S(4,["A signal replaces negotiation with a rule, and a rule scales.",
     "Every driver, every language, every level of skill, obeys the same lamp."], dict(m="order_restored")),
S(4,["It needs no operator. It is the cheapest coordination machine ever built."], dict(m="lonely_pole")),
S(4,["And it works. Signalised junctions cut the crashes that kill: the side impacts, the turning collisions."],
   dict(m="safe_flow")),
S(4,["This is not a stupid object.","It is a brilliant one, aimed at nineteen twenty."], dict(m="respect_hold")),
# ---------------- ACT 5 : IT CANNOT SEE ----------------
S(5,["Here is where it breaks.","The lamp has no senses."], dict(m="push_into_lens")),
S(5,["It does not know the ambulance is four cars back."], dict(m="ambulance")),
S(5,["It does not know the road is empty.","Or flooded. Or that a child is standing at the kerb."],
   dict(m="empty_vs_full")),
S(5,["It is a clock pretending to be a judgement.",
     "A lamp on a timer is not infrastructure. It is a guess, repeated forever."], dict(m="clock_face")),
S(5,["Every second of green given to an empty road is taken from a full one, and the machine will never notice."],
   dict(m="split_junction")),
# ---------------- ACT 6 : THE UNPRICED WAIT ----------------
S(6,["The second break is the one nobody counts."], dict(m="grey_descend")),
S(6,["Waiting is a cost. It is time taken out of a life."], dict(m="crowd_kerb")),
S(6,["But the traffic light bills nobody. So the cost is invisible. So it is never optimised."],
   dict(m="crowd_grows")),
S(6,["An engineer is graded on vehicles per hour.",
     "Nobody is graded on the hours taken from the people standing on the kerb."], dict(m="cars_vs_people")),
S(6,["A cost that is never measured will always be spent."], dict(m="long_wait_hold")),
# ---------------- ACT 7 : THE COLLAPSE ----------------
S(7,["And so the junction taught the city what to become."], dict(m="dusk_climb")),
S(7,["Signals made the fast road possible, and the fast road cut the city into blocks."],
   dict(m="grid_widens")),
S(7,["To cross became to ask.","To walk became to wait."], dict(m="pedestrian_island")),
S(7,["We widened, we signalled, we widened again.",
     "And the traffic came back every time, because a road that moves faster invites more of it."],
   dict(m="induced_demand")),
S(7,["The lamp did not just manage the city.","It designed it.",
     "Nobody drew the modern city. The junction did, one cycle at a time."], dict(m="city_as_grid")),
# ---------------- ACT 8 : VERDICT ----------------
S(8,["The verdict."], dict(m="night_wide")),
S(8,["The traffic light is a rule standing in for attention, in a place where attention used to work."],
   dict(m="slow_orbit_verdict")),
S(8,["It was the right answer when the only alternative was a whistle and a brave man in white gloves."],
   dict(m="empty_box_junction")),
S(8,["It is the wrong answer now, because we can finally see the junction.","And we still refuse to look."],
   dict(m="unlit_eyes")),
S(8,["We automated the instruction and left the observation to nobody."], dict(m="hold_dark")),
# ---------------- ACT 9 : THE BETTER VERSION ----------------
S(9,["So build the junction properly.","Four rules."], dict(m="sunrise_open")),
S(9,["One. Make the junction see.",
     "A single camera and a cheap chip can count what is actually waiting. Give green to demand, not to the plan."],
   dict(m="rule_see")),
S(9,["Two. Price the wait.",
     "Publish the seconds lost per person, per junction, per year, and put a name against the number."],
   dict(m="rule_price")),
S(9,["Three. Where speeds are low, take the lamp out entirely.",
     "Shared space makes drivers negotiate again, and eye contact is a better protocol than a bulb."],
   dict(m="rule_remove")),
S(9,["Four. Weight by people, not by metal.",
     "A bus with fifty aboard is not one vehicle. A person on foot is not an interruption."],
   dict(m="rule_weight")),
S(9,["None of this needs new physics.",
     "It needs the junction to be allowed to notice who is there.",
     "The technology has existed for twenty years. The permission has not."], dict(m="flow_free")),
S(9,["A city with no flashing light is not a city with no order.",
     "It is a city that finally stopped guessing."], dict(m="final_climb")),
S(9,["This was DREAM."], dict(m="outro_sky")),
]

if __name__=="__main__":
    import re
    w=sum(len(re.findall(r"[A-Za-z']+",l)) for s in SHOTS for l in s["lines"])
    print("shots:",len(SHOTS),"lines:",sum(len(s['lines']) for s in SHOTS),"words:",w)
    for a in ACTS: print(f"  act{a['id']} {a['key']:9s} shots={len([s for s in SHOTS if s['act']==a['id']])}")
    print("moves:",len({s['shot']['m'] for s in SHOTS}),"unique of",len(SHOTS))
