// Resident roster for daily check-in commentary (Console tab). Same 15 OCs
// as src/apartment/visitors.js for identity consistency (name/role/color),
// but this dialogue is a different flavor entirely: short reactions to
// whether you closed out today's sync queue, not apartment-visit ratings.
// Keep the two files separate — merging them would force one dialogue
// shape to serve two very different UI moments.
export function defaultNpcs() {
  return [
    { id: "zoya", nm: "Zoya", role: "ARASAKA COUNTERINTEL", color: "#ff2e7e", lvl: 1,
      done: ["Clean sheet, no anomalies. I do like it when the data behaves.", "Full compliance. And here I had a contingency ready. Wasted, for once.", "You closed every gap. I noticed. I notice everything."],
      pending: ["There's a version of today where you finish these. Pick that one.", "Unsynced nodes are open questions, and I don't care for open questions.", "You're being watched. By me. Finish the queue."],
      broken: ["The streak's gone. Unfortunate, not fatal. Rebuild it and don't mention it again.", "Everyone slips once. I'll pretend I didn't log it. Start over."] },
    { id: "lukas", nm: "Lukas", role: "RIPPERDOC · KABUKI", color: "#39ff9e", lvl: 2,
      done: ["Oh, you actually did all of them? Look at you, functional. Kettle's on.", "Full card. That's more together than I've managed all week, honestly. Nice one.", "Everything done. I'd offer advice but you clearly don't need it. Tea?"],
      pending: ["Still a few left. I'd nag you but that'd be hypocritical. Go on, though.", "You've got some pending. Do as I say, not as I do, yeah?", "Kettle's on for when you finish. Which is a hint. Finish."],
      broken: ["Ah, streak's gone. Join the club, we've got tea. Then start again tomorrow, seriously.", "Off day. Not the end. Trust me, I'd know, I'm the expert in off days."] },
    { id: "emmy", nm: "Emmeline", role: "RIPPERDOC · WATSON", color: "#00e5ff", lvl: 3,
      done: ["Vitals green, all of them, look at you — hold still, I'm impressed and it's weird.", "Full sync! Do you know how rare that is? Don't answer. Good job. Now eat something.", "Everything logged. Body's running clean. I mean it about the eating."],
      pending: ["Open readings on the chart and I can't tune what I can't see, choom. Log them.", "Half your data's missing. That's how people end up in my chair. Finish.", "Come on, come on, close the loop, I've got other patients."],
      broken: ["Streak flatlined. Not a real flatline, relax, I'd know. Reboot and go again.", "Down day. Happens to everyone, especially me. Start over tomorrow."] },
    { id: "max", nm: "Max", role: "SOLO · HEYWOOD", color: "#ff6a3d", lvl: 4,
      done: ["All targets down. Textbook. You're getting scary consistent, I like it.", "Clean run, no loose ends. Sit down before you fall down.", "Whole list, done. Didn't even need me. Almost insulting. Good."],
      pending: ["Job's not done till it's all done. Move.", "Loose ends get people hurt. Tie 'em off.", "You're this close. Don't make me come over there."],
      broken: ["Streak's dead. So? Get up. We reload and go again, that's the whole thing.", "You fell off. Everyone does. Stand up, it's not complicated."] },
    { id: "vesper", nm: "Vesper", role: "FREELANCE TECH", color: "#42e8c0", lvl: 5,
      done: ["All of it, done — how'd it feel, doing the whole set? No, really. Nice work, though.", "Full sync, clean. I get a little too invested in these, but this one's worth it.", "Everything logged. Tell me you're proud of it, because you should be."],
      pending: ["Still a few open — what's holding you up? Not judging, just curious. Go finish.", "You've got nodes left. I'll wait, I always wait, go on.", "Loose ends. Close 'em, then tell me how it went."],
      broken: ["Streak dropped. Hey — that's allowed. Start the next one when you're ready. Tomorrow, ideally.", "It broke. It's fine. Everything here does at least once. Try again."] },
    { id: "gemma", nm: "Gemma", role: "MOX WHEELMAN · iBYTE", color: "#ff4d6d", lvl: 6,
      done: ["Full clean run, not a scratch on it. THAT'S what I'm talking about.", "All nodes down, foot to the floor the whole way. Beautiful.", "Whole list, done, and fast. I'd race you but you'd probably win today."],
      pending: ["You're not parked yet — still got nodes to hit. Move.", "Half a lap left. Don't you dare coast now.", "Finish the run. I don't do 'almost.'"],
      broken: ["Streak spun out. Happens. You don't quit the race, you take the next corner tighter.", "Crashed the streak. So? Rebuild the car, get back on the line tomorrow."] },
    { id: "solene", nm: "Solène", role: "ALDECALDOS SCOUT", color: "#e0a75e", lvl: 7,
      done: ["Every route run, nothing left in the open. Good. The desert would approve.", "All of it, done, quietly. That's the way that lasts.", "You finished without fuss. I saw. I see most things."],
      pending: ["Still a few routes uncovered. No rush. But don't stop.", "The day's not over. Neither are you. Keep moving.", "Some nodes still out there. Go get them, patiently."],
      broken: ["The trail went cold. We find it again at first light. No shame in it.", "Streak's gone. The desert doesn't hurry to rebuild either. Start again."] },
    { id: "evangeline", nm: "Evangeline", role: "BARTENDER · SANTO DOMINGO", color: "#ffb454", lvl: 8,
      done: ["Full card, all of it. Sit down, first one's on the house. You had a good day.", "Everything done. I noticed. I notice when people have a good week.", "Clean sweep. The city didn't get you today. That's worth something."],
      pending: ["Tab's still open, love — a few nodes left. Settle up before you close out.", "You're not done yet. Take your time, I'll keep the stool warm.", "Few more to go. You've got it in you, I can tell."],
      broken: ["Streak's gone. Rough one. Come sit — tomorrow's a new day and I'll be here for it.", "Off day. The city does that. Doesn't mean you stop. Back at it tomorrow."] },
    { id: "makoto", nm: "Makoto", role: "MUSICIAN · DEAD AIR", color: "#b47dff", lvl: 9,
      done: ["Every note landed. You did the whole thing — did you eat, though? Tell me you ate.", "Full day. It sounds quiet in the best way. Rest now.", "You finished. I noticed the small effort it took. I always notice."],
      pending: ["A few threads left hanging. Take your time, but take them.", "You've got more to do. I'll wait. I'm good at waiting.", "Don't leave the song half-written. Finish the last few."],
      broken: ["The streak broke. It's okay. Come sit, we start the next one gently.", "Off day. I brought food. Tomorrow we begin again."] },
    { id: "maia", nm: "Maia", role: "DANGER GALS · PUMA SQUAD", color: "#ff8a3c", lvl: 10,
      done: ["Every node, done, out loud and on the record. That's how you do it — no quiet half-measures.", "Full clean sheet! See, this is the good kind of visible. Own it.", "You finished the whole set. I'd put you on the flyer for this."],
      pending: ["Still some nodes hiding in the back. Drag 'em into the light and finish.", "Come on, no quiet half-measures — log the rest.", "You've got more in you. I've seen the setlist. Finish it."],
      broken: ["Streak's down? So you get back on the stage tomorrow and go louder. That's the gig.", "One bad night doesn't end the tour. Reset and go again."] },
    { id: "theodore", nm: "Theodore", role: "LATE NIGHT HOST", color: "#ffcf40", lvl: 11,
      done: ["And THAT'S our show — a clean sweep, live from your own two hands. Take the applause.", "Every segment landed. Perfect episode. Now actually rest, would you? For me.", "Full run, no dead air. Beautiful television. Go easy tonight."],
      pending: ["We're mid-episode, choom — a few segments still to tape. Keep it rolling.", "Don't leave the audience hanging. Finish the last few.", "Great energy so far. Now bring it home before the credits."],
      broken: ["Streak's off the air. It's just one night. We're back on tomorrow — same time, same you.", "Bad episode. Every show has one. You reset and go again. That's the job."] },
    { id: "charlotte", nm: "Charlotte", role: "FIXER · WESTBROOK", color: "#fcee0a", lvl: 12,
      done: ["Job's closed clean. That's the name on the door meaning something.", "Every node accounted for. Good. I don't say it twice.", "You delivered. I remember when people deliver."],
      pending: ["Contract's still open. Finish what you started.", "I don't chase people to do their own work. Don't make me start.", "Half-done is just undone with extra steps. Close it out."],
      broken: ["Streak's broken. Own it, don't dwell, pick the next contract.", "You slipped. Fine. Tomorrow you show up. That's the whole deal."] },
    { id: "elizabeth", nm: "Elizabeth", role: "NETWATCH ANALYST", color: "#6ab7ff", lvl: 13,
      done: ["Complete, all of it, in order. I'd expect nothing less — though it's satisfying to see.", "Clean set. No loose logic. Good.", "Every node accounted for. That's the correct outcome. Well done — and yes, I mean that."],
      pending: ["The set's incomplete, and an incomplete set bothers me on your behalf. Finish it.", "There's a gap in the sequence. You already know which one. Close it.", "You're three steps from done. So take them."],
      broken: ["The streak's broken. It's data, not a verdict. Re-run it tomorrow.", "A gap in the record isn't a failure of character. Correct it and continue."] },
    { id: "juno", nm: "Juno", role: "FENCE · KABUKI", color: "#7c6fe0", lvl: 14,
      done: ["Every thread closed. The day sits right. I felt it before you told me.", "All of it, done. Intention leaves a residue — yours is clean today.", "Complete. The cards said as much this morning. They usually do."],
      pending: ["There's something unfinished in the room. You know what it is. Attend to it.", "The day's not settled yet. Close what's open.", "Loose ends leave a residue too. Tidy them."],
      broken: ["The streak's ended. Endings aren't failures, only turns of the card. Draw again.", "Something slipped. Sit with it, briefly, then begin the next cycle."] },
    { id: "clementine", nm: "Clementine", role: "MILITECH INTEL", color: "#e02436", lvl: 15,
      done: ["Every node logged, all on schedule. I did check. I always check. Impeccable — warmly meant.", "Full compliance, and freely given. My favorite kind. Well done.", "All of it, done. I noted it. I note everything. This one pleases me."],
      pending: ["You've a few open items. I'd hate to have to mention it again. Do finish.", "Incomplete. I can see the gaps from here — I can see most things from here. Close them.", "Loose ends are untidy, and I do dislike untidy. Attend to it."],
      broken: ["The streak's ended. Disappointing, but recoverable. Begin again, and we'll say no more about it.", "A lapse. Noted, filed, forgiven — once. Rebuild it."] },
  ];
}

export const RND_NAMES = ["Vik", "Nix", "Rogue", "Kael", "Mireille", "Dex", "Sable", "Ozzy", "Wren", "Tomo", "Bex", "Cass", "Rin", "Dmitri", "Lena", "Ash", "Corvo", "Yuki", "Salt", "Fen", "Rue", "Jarek", "Nadia", "Bishop", "Kite", "Mara"];
export const RND_ROLES = ["NETRUNNER", "MERC", "RIPPERDOC", "FIXER", "NOMAD", "TECHIE", "MEDIA", "ROCKERBOY", "BOUNTY HUNTER", "DEALER", "MECHANIC", "BARTENDER", "SCAVENGER", "COURIER", "JOYTOY", "NETWATCH LEAK"];
export const RND_COLORS = ["#ff2e7e", "#00e5ff", "#fcee0a", "#b47dff", "#ff6a3d", "#39ff9e", "#e0a75e", "#7c6fe0", "#ff4d6d", "#42e8c0", "#c77dff", "#ffa53c"];
export const RND_DONE = ["Full sync. Not bad for a stranger's console.", "All green. You run a tight ship, choom.", "Everything logged. Respect.", "Clean day. Somebody taught you well."];
export const RND_PENDING = ["Still got nodes hanging. Handle it.", "You're not done yet. Keep at it, choom.", "Loose ends. Tie them off.", "City doesn't wait. Finish up."];
export const RND_BROKEN = ["Streak's gone. Shake it off, start over.", "Bad run. Happens in this city. Reboot.", "Down day. Get back up tomorrow.", "Flatline. Not the first, won't be the last. Go again."];

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
