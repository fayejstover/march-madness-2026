// ─── 2026 Yahoo Bracket — All 64 Teams ───────────────────────────────────────
// efficiency: 0–100 (higher = better; ~inverse of KenPom rank)
// form:       1–10 (recent momentum entering tournament)
// coaching:   1–10 (tournament experience + track record)
// regDiff:    1–10 (strength of conference / regional path)
// ─────────────────────────────────────────────────────────────────────────────

const BRACKET_TEAMS = {
  East: [
    // Duke survived a 16-seed scare: won 71-65 vs Siena. Form and efficiency docked.
    {name:"Duke",            seed:1,  efficiency:88, form:5, coaching:9, regDiff:7},
    {name:"Siena",           seed:16, efficiency:28, form:3, coaching:3, regDiff:4},
    {name:"Ohio St.",        seed:8,  efficiency:68, form:6, coaching:6, regDiff:5},
    {name:"TCU",             seed:9,  efficiency:65, form:6, coaching:5, regDiff:5},
    {name:"St. John's",      seed:5,  efficiency:77, form:8, coaching:7, regDiff:7},
    {name:"Northern Iowa",   seed:12, efficiency:59, form:5, coaching:5, regDiff:4},
    {name:"Kansas",          seed:4,  efficiency:82, form:7, coaching:9, regDiff:7},
    {name:"Cal Baptist",     seed:13, efficiency:52, form:4, coaching:4, regDiff:4},
    {name:"Louisville",      seed:6,  efficiency:72, form:7, coaching:7, regDiff:6},
    {name:"South Florida",   seed:11, efficiency:63, form:7, coaching:5, regDiff:5},
    {name:"Michigan St.",    seed:3,  efficiency:84, form:8, coaching:8, regDiff:7},
    {name:"N. Dak. St.",     seed:14, efficiency:51, form:4, coaching:4, regDiff:4},
    {name:"UCLA",            seed:7,  efficiency:70, form:7, coaching:7, regDiff:6},
    {name:"UCF",             seed:10, efficiency:64, form:6, coaching:5, regDiff:5},
    {name:"Connecticut",     seed:2,  efficiency:91, form:8, coaching:8, regDiff:8},
    {name:"Furman",          seed:15, efficiency:46, form:4, coaching:4, regDiff:3},
  ],
  South: [
    {name:"Florida",         seed:1,  efficiency:94, form:9, coaching:8, regDiff:8},
    {name:"Prairie View A&M",seed:16, efficiency:27, form:3, coaching:3, regDiff:3},
    {name:"Clemson",         seed:8,  efficiency:71, form:7, coaching:6, regDiff:6},
    {name:"Iowa",            seed:9,  efficiency:66, form:6, coaching:6, regDiff:5},
    {name:"Vanderbilt",      seed:5,  efficiency:76, form:7, coaching:7, regDiff:6},
    {name:"McNeese",         seed:12, efficiency:58, form:5, coaching:4, regDiff:4},
    {name:"Nebraska",        seed:4,  efficiency:77, form:7, coaching:6, regDiff:6},
    {name:"Troy",            seed:13, efficiency:53, form:5, coaching:4, regDiff:4},
    {name:"N. Carolina",     seed:6,  efficiency:73, form:7, coaching:8, regDiff:6},
    {name:"VCU",             seed:11, efficiency:63, form:7, coaching:6, regDiff:5},
    {name:"Illinois",        seed:3,  efficiency:83, form:8, coaching:7, regDiff:7},
    {name:"Pennsylvania",    seed:14, efficiency:50, form:4, coaching:4, regDiff:4},
    {name:"St. Mary's",      seed:7,  efficiency:69, form:7, coaching:7, regDiff:6},
    {name:"Texas A&M",       seed:10, efficiency:64, form:6, coaching:6, regDiff:5},
    {name:"Houston",         seed:2,  efficiency:92, form:8, coaching:8, regDiff:7},
    {name:"Idaho",           seed:15, efficiency:44, form:3, coaching:3, regDiff:3},
  ],
  West: [
    {name:"Arizona",         seed:1,  efficiency:94, form:9, coaching:8, regDiff:8},
    {name:"LIU Brooklyn",    seed:16, efficiency:26, form:3, coaching:3, regDiff:3},
    {name:"Villanova",       seed:8,  efficiency:67, form:6, coaching:7, regDiff:5},
    {name:"Utah St.",        seed:9,  efficiency:65, form:6, coaching:6, regDiff:5},
    {name:"Wisconsin",       seed:5,  efficiency:75, form:7, coaching:7, regDiff:6},
    {name:"High Point",      seed:12, efficiency:57, form:5, coaching:4, regDiff:4},
    {name:"Arkansas",        seed:4,  efficiency:79, form:7, coaching:7, regDiff:7},
    {name:"Hawaii",          seed:13, efficiency:52, form:4, coaching:4, regDiff:4},
    {name:"BYU",             seed:6,  efficiency:71, form:7, coaching:6, regDiff:6},
    {name:"Texas",           seed:11, efficiency:63, form:7, coaching:6, regDiff:5},
    {name:"Gonzaga",         seed:3,  efficiency:84, form:8, coaching:8, regDiff:7},
    {name:"Kennesaw St.",    seed:14, efficiency:51, form:4, coaching:3, regDiff:4},
    {name:"Miami (FL)",      seed:7,  efficiency:69, form:7, coaching:6, regDiff:6},
    {name:"Missouri",        seed:10, efficiency:64, form:6, coaching:6, regDiff:5},
    {name:"Purdue",          seed:2,  efficiency:90, form:8, coaching:8, regDiff:7},
    {name:"Queens Univ.",    seed:15, efficiency:43, form:3, coaching:3, regDiff:3},
  ],
  Midwest: [
    {name:"Michigan",        seed:1,  efficiency:93, form:8, coaching:7, regDiff:7},
    {name:"Howard",          seed:16, efficiency:27, form:3, coaching:3, regDiff:3},
    {name:"Georgia",         seed:8,  efficiency:67, form:6, coaching:6, regDiff:5},
    {name:"Saint Louis",     seed:9,  efficiency:64, form:6, coaching:6, regDiff:5},
    {name:"Texas Tech",      seed:5,  efficiency:75, form:7, coaching:7, regDiff:6},
    {name:"Akron",           seed:12, efficiency:59, form:5, coaching:5, regDiff:4},
    {name:"Alabama",         seed:4,  efficiency:80, form:8, coaching:7, regDiff:7},
    {name:"Hofstra",         seed:13, efficiency:52, form:5, coaching:4, regDiff:4},
    {name:"Tennessee",       seed:6,  efficiency:74, form:7, coaching:7, regDiff:6},
    {name:"Miami (OH)",      seed:11, efficiency:62, form:6, coaching:5, regDiff:5},
    {name:"Virginia",        seed:3,  efficiency:82, form:8, coaching:8, regDiff:7},
    {name:"Wright St.",      seed:14, efficiency:51, form:4, coaching:4, regDiff:4},
    {name:"Kentucky",        seed:7,  efficiency:70, form:7, coaching:8, regDiff:6},
    {name:"Santa Clara",     seed:10, efficiency:62, form:5, coaching:5, regDiff:5},
    {name:"Iowa St.",        seed:2,  efficiency:91, form:8, coaching:8, regDiff:7},
    {name:"Tennessee St.",   seed:15, efficiency:44, form:3, coaching:3, regDiff:3},
  ],
};

function buildTeamLookup(bracketTeams) {
  const lookup = {}, flat = [];
  Object.entries(bracketTeams).forEach(([region, teams]) => {
    lookup[region] = {};
    teams.forEach(t => {
      const team = {...t, region};
      lookup[region][t.seed] = team;
      flat.push(team);
    });
  });
  return {lookup, flat};
}