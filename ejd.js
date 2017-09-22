//Repository of helpful code!

var e = {
	//A simple function that returns a number between minroll and maxroll, inclusive
	rollDice: function(minroll, maxroll) {
		return thisDiceRoll = Math.floor((Math.random() * (maxroll - minroll + 1)) + minroll);
	},
	ajfetch: function(file, scriptobj, targetvar) {
		xmlhttp = new XMLHttpRequest();
		//Basically this function opens up the target script and passes its "scriptobj" to it, then returns the object that's the result from said script
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            	var pwords = this.responseText;
            	
				var startpos = pwords.indexOf("{");
				//The below attempts to avoid JSON parsing weirdness if the file isn't something that returns JSON encoded goodies.
				//Apparently, startpos will be -1 if it can't find a curly bracket!
				//... which it shouldn't, assuming there aren't any JSON objects in the script.
				if (startpos != -1) {
					var endpos = pwords.indexOf("}");
					pwords = pwords.slice(startpos, endpos + 1);
					pwords = JSON.parse(pwords);
				}
				//UNTESTED BIT: Just added this IF statement, mostly so ajfetch can be used to run a script with a passed variable but without
				//	expecting to return the result to any variable.
				if (targetvar != undefined) {
					for (var key in pwords) {
						targetvar[key] = pwords[key];
						console.log(key + " " + pwords[key]);
					}
				}
            }
        };

		xmlhttp.open("POST", file, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.send("myjsonvar=" + scriptobj);
	}, 
	ajfill: function(file, checkvar, targetelem) {
		xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            	var pwords = this.responseText;
				var startpos = pwords.indexOf("{");
				var endpos = pwords.indexOf("}");
				pwords = pwords.slice(startpos, endpos + 1);
				pwords = JSON.parse(pwords);
				//document.getElementById(targetelem).innerHTML = pwords;
				if (pwords.checkvar != "undefined") {
					return pwords;
				} else {
					//Nothing was gained from this request!
				}
            }
        };

		xmlhttp.open("GET", file, true);
		xmlhttp.send();
	}, 
	ajrun: function(file) {
		xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            	alert(this.responseText);
            }
        };

		xmlhttp.open("GET", file, true);
		xmlhttp.send();
	}, 
	//Makes a new cookie!
	bakeCookie: function(name, value, expiration) {
		var d = new Date();
		d.setTime(d.getTime() + (expiration * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}, 
	//Retrieves a cookie!
	grabCookie: function(name) {
		var name = name + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		var calength = ca.length;
		for (var i = 0; i < calength; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return null;
	}, 
	dropCookie: function(name) {
		document.cookie = name + "=" + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	}
};

/*
IDEAS:
1. A quick function for adding style (attribute, value)

AJAX shiz...
-) We have now AJRUN which will just run a script for ya. Handy if you just want to run a simple PHP script somewhere.
    - Theoretically I could set up a seekrit thin' somewhere where I can input the name of a script and click a RUN button that would fire it off.
    - It's definitely worth noting that this would be very awkward if just anyone could do it, so, careful!
-) We have AJFETCH that runs a script with a passed JSON object and returns the JSON-parsed object that results
    - Thus, the receiving script needs to expect to get the original JSON object and must result in an echo of a JSON object as well.
-) AJFILL, which takes an element name in addition to passing stuff and returns the echo result to the element id's innerhtml.

*/


/*

Exercise tracking app spitball time, y'all!

Login, CHECK. Need to figure out how to sort data by day. Or hm, maybe day-per-month? And each month has its own section? Hmmmm...
There's a timestamp-y thing that autopopulates, checking against... something? So use that to determine CURRENT DAY. And hell, collect CURRENT TIME too. For funsies!
Ok, now that we have all that...
Check current day against stored "Current Day" data, which has already been collected, ideally.
So we need to figure out the Current Day, collect maybe two weeks prior and coming, collect the current month, and obvi have the Current Day data super on hand.

Data for any given day can include:
Planned Workout Type(s), Planned Other Activity, + current levels achieved in all such endeavors
For example: "two different workouts, 1 mob 1 strength; 8 exercises, which ones they are, target reps, previous reps if applicable, previous activity if applicable,
current point in current cycle, "
HOW NOW to set up the database! Hm! What a pickle! Need to encode stuff. Long strings to be picked apart, probably server-side before returned to local because
	let's face it, HACKERS, amirite? 

Jumping back in...
So, it's pretty easy to get PHP to spit back the server date and/or time. Literally just a date() function that you splice "Y-m-d" or "Y.m.d" or whatever.
	You can also throw in an "l" to get the current day of the week. Easy-peasy. So, getting the CURRENT intel on that is easy.
NOTE that JavaScript also has the ability to do this, but its Date object returns milliseconds since 1/1/1970, which is bonkers. I suppose it wouldn't be hard
	to write a script to convert it, but PHP is easier.
Anyway.
In order to do more than my current exercise regimen, I'll need to figure out all the possible exercise types the program will allow, and codify them so they can
	be parsed by code. Probably just a quick "AA," so each digit place can hold 26 values easily enough. Eat your heart out, hex!

Thinking through a basic workflow...
You click into the "exercise log" (part) of the app. It queries the database, asynchronously grabs today's stuff as well as any other useful info to have.
... then it lists "today's workouts" in a pretty list, "next workout" prominently displayed, and "completed workouts" chilling off to one side, all from today.
	... possibly also some graphical acknowledgement for the week and month? Yeah, probably a neat idea!
... NOTE, place-saving: once you've clicked into a current workout, the database should note it somehow as the "current" workout you're doing, and automatically
	load into the workout preferentially instead of the list of all workouts.
	... SUBNOTE: Actually, maybe a "where I'm at right now" general variable, and for specific areas there can be sub-flags. Gotta make sure it's stupidly easy
		to get back to the Heart or main menus from here, though.
... anyhoo, I currently feel that having a jamillion different columns per person would be bonkers; they'd get 12 more columns a year if we had each month separately
	accessed, for example. So, maybe think about how much exercise data is maximally expected per day, per week, per month, per year; can we condense that into 
	a stored variable in a smaller dataset? Maybe?
... whatever, this is an exercise! In exercises! So, for now I'm totally ok with storing an easily-accessible "blob" of data that's pulled apart into intelligible
	data by the scripts. Thus, for now, I think I'll try "a column per year," since I think I can narrow the (train of thought left unfinished)
	... BUT recall that for the full PrPl that there will be other shiz occurring on different days, interactions, trophies, etc., so keep that in mind.

MY CURRENT EXAMPLE: 6 workouts per week, Push1, Push2, Pull1, Pull2, Leg1, Leg2. Let's unpack this and figure out how we'd DB it up! List out all pertinent variables and go.
	-) 6 main workouts (Push1, Push2, Pull1, Pull2, Leg1, Leg2)
		- 4 main exercises per workout (sometimes a fifth)
		- Also progressive handstand work per week
	-) 4-week program that adds 
	-) Need a way for the user to adjust their goals if stuff is too hard or injury happens or other ish happens
		- This includes "I skipped this day" to "I need to ratchet this shit down, it's too much" or whatevs. Not 100% critical for my own use yet.

	So basically we want to be able to set "four weeks, six workouts arranged one per day M-Sa, these 4-5 exercises for this many sets, increasing by 2 sets/week"
		to go ahead and populate the framework for us, then have an "editor mode" that lets you easily set the reps/durations you've done (and maybe
		remind you of what you did last time around, thus each workout needs an internal id, such as Push1, to refer back to: "highest," "lowest," "total,"
		"average per set," etc.)
	Breaking it down further:
		- DURATION (4 weeks)
		- # of DAYS PER WEEK (6, MTuWThFrSa)
		- # exercises/workout
		- # sets/exercise
		- Any other helpful info, such as "1m between sets, 2m rest between different exercises," which is referential.

	Step One: Log In
	Step Two: Workout Regimen Setup Page:
	DURATION (in weeks, later broken down into days, though special programs such as "30 day" could be available later)
		-> Quick aside: I'll need an internal "calendar" so that we can build arrays of dates that will be affected, hmmm...
			Shouldn't be TOO hard to do, though. Except leap years. Tricky tricky leap years.
	START DATE (maybe a drop-down of a drop-down, month and date)
	DAYS OF TRAINING (clicky clicky checkboxes MTWTHFSASU)
		next page...
	[from the selection of training days]: Click on each day and can populate the exercises:
	(IDEA: Have seven boxes across the top, grayed out if unselectable, red or something if not populated, green if populated)
	Upon clicking, the bottom area gives you options:
		# OF EXERCISES -->
			WHICH EXERCISES (by code for each)
			SETS OF EACH
			SEQUENCE (finish one move onto other, supersetting, custom, etc.)


*/


/*

DP spitball time, y'all!
JULY 4th 2017
DPBasicV0.1
	-) DW1 style. Simple graphics, simple blocks, simple scrolling, simple battles, simple everything!
	-) Though, "real time" battles. Model it after the ideas you already have for combat.
	-) Day-night cycle. 
	-) Basic, tongue-in-cheek storyline.
What I need to make it happen:
	-) Basic graphics to import. Feel free to go stupidly blocky for now. Matte colors for terrain.
	-) Basic animation engine (EJD).
	-) Basic rendering engine (map).
	-) Core stats and essential logic for checking, updating, and server comm.

CURRENT CODING CONCERNS:
	-) CANVAS! Wave of the future. Looks pretty well-supported, too. Cool! Build the DP engine. :-)


Note that you'll have to have a couple different agents for a EDND campaign, including individual players, DM, and display, which only displays story elements, text,
	images, whatever the DM wants to display, basically. By default, it should show what the party is up to and/or where they are.
	-) Easy enough, I think; the JS can just receive "Agent Type" and reconfig the display and input logic from there.
	-) DM will be somewhat trickier, since they'll have the ability to smack everything in real time.
		- I think it's best if real-life campaigns have a steady full-refresh rate, maybe a queue/variable holding any pertinent changes that need to be pushed so
		that we can minimize unnecessary data exchange, and have it all occur in a "room" whose variables change, i.e., a single central database area that merrily
		holds everything for quick grab-'n-go updating. Possible? We'll find out!

Database will have to work a little differently for managing a multiplayer game, probably. I'll also have to manage what's handled server-side and what's handled browser-side.
Browser-side should probably request updates at reasonably regular intervals, and the server will rejigger anything it needs to to spit back relevant info for the users.

(Single-player and casual multiplayer can be handled predominantly in the browser, with only occasional pings to the server.)

I also, as DM, need to see EVERYTHING that's happening, as well as trigger any relevant "rolls" to give results. 
I need to see their current actions (and results of those actions) at all times easily.
    - Possibly also: being able to send discreet notes and outcomes to individual players, so having a handy "list of players" to tap on would be grand
    	- Also also: typing it all out would be a little bit of a chore, esp. on a phone, so having entire presets or partial presets would be handy, such as
    	"you don't find anything" or "upon closer examination, you notice that ___" (and let me type the rest) or "you steal X from Y!"

FUN BIT: Give "extra mission(s)" to players, secret!
	Example: "Find that extra McGuffin in the tower, and despite its super awesome usefulness to your team, steal it and destroy it. Bonus points if nobody knows it was you."
	Example: "Steal Bob's dagger. Bonus: Don't let him know it was you. Double bonus: give it to Jacob."
	Example: "Share a kiss with Estelle." (In this example, it would be for a character that's not the player's husband/wife/sig other :P)
	Basically, give 'em all ulterior motives that pit their interests against each other in some way.

SIDE: Travel swag! Gear for your misadventures. Rope? Tent? Crowbar? Maps and scrolls? Lockpicks? Blanket? Candles, torches, tinderboxes? Books? Rations?!
	And tools! Artisan's tools, woodworking tools, herbalism tools, and so on. Make a living, yo!
	And mounts! (And vehicles!) Horses and boats. Mostly to carry shiz and save energy. Sometimes get there faster.
	"Lifestyle expenses." What it costs to live in certain places for certain times at certain levels of living!
		- At modest level, for example, your risk of losing equipment or suffering attack or disease is very low, you don't go hungry or thirsty and can sleep well, 
		and equipment is maintained.
	In D&D you can choose what your character does between adventures... surviving in the wild, or practicing a tradeskill in a city, or what have you.
		However, since there's a single-player component, there's definitely an active aspect explorable here.

	Idea: "I practice a profession" day-to-day, that activity can pay the bills and get stuff done, with modifiers depending on time spent, with whom, and the
		relative needs of that particular area and/or populace
	Idea: "Research stuff," where you can learn things! 
	Idea: "Learn a New Thing," gaining an ability or proficiency. 

CLASSES:
	* Each of these can come in a variety of different "flavors" through customization and backstory choices. Thus these nine should be more as "archetypes" than super specific
		uber-niche level classes at this point.
	* Every class is able to choose some degree of combat skill, survival skill, interpersonal skill, and knowledge skill. The breadth and depth will vary, but everyone
		can be proficient in at least one thing from each category, under the assumption everyone is an "adventurer" build as a PC.
	* Each archetype has its own Core Crystala (first innate equipped passive mod slot). This isn't revealed to the players initially. This is in addition to the
		differences in learned skills and abilities. Some movesets are Crystala-locked, as are some stat and skill modifiers.
	FIGHTER ARCHETYPE
		[FGHT-LORE]
		Soldier: Very formally trained. Skilled, not destitute, but subject to the whims and orders of others. Particularly versed in armor, defense, and fortification.
		NOTE: Since we're mixing in LORE, maybe not a rank-and-file situation, but closer to somewhere beyond squire but before knight. Trained but not lorded, kinda.
		[FGHT-FGHT]
		Mercenary: Little formal training, lives through trying to earn some coin through physical prowess (violence and the threat thereof).
			Especially formidable in guerrilla tactics, destabilizing, and wrecking shit.
		[FGHT-ROGE]
		Jaeger: Knowledgeable outdoorsfolk with skills in tracking, marksmanship, and survival. Not automatically skilled in close combat. Very comfortable outdoors.
			Reasonably sneaky, especially in outdoor settings.
	ROGUE ARCHETYPE
		[ROGE-LORE]
		Masque: Takes stuff through smooth talking and misdirection. Also a skilled pickpocket. Thrives in crowds and excels in working on others.
		[ROGE-FGHT]
		Bandit: Takes stuff through quick application of brutality and intimidation. Also excels at getting the eff out of dodge once some swag is obtained.
		[ROGE-ROGE]
		Thief: Takes stuff by being super sneaky. Excels at recognizing traps, moving silently, and handling objects carefully. Good at acrobatics and infiltration.
	LORE ARCHETYPE
		[LORE-LORE]
		Mender: Focused on conserving, healing, teaching, and preserving. Gets special treatment in many social circles (mostly good, sometimes polite dismissal/apathy).
			Always come competent at healing, first aid, and tending to the ill, but also tend to be scholars with wide-ranging knowledge.
		[LORE-FGHT]
		Master: Build shit! Gather shit! An incredibly important part of society. Start with more money, resources, and clout than others, and their specific proficiencies
			often come in handy on adventures, whether it be mending gear or working their prowess in a town or city. Movers and shakers who are often guilded. They're
			the de facto leaders of their communites, builders and seekers who focus on tradecraft, exploration, and being in the know.
		[LORE-ROGE]
		Ranger: Basically they are the critically always-open eyes in a world of monsters and madmen. Scouts and students of the natural world, as well as collectors of all
			sorts of assorted knowledge, they're generally athletic, well-traveled, and capable of covering ground quickly. Good at packing, too. :P

	Combat skill spitballing...
	Every class has some fighting proficiency, some rogue proficiency, and some lore proficiency, both core and some chosen from a specific subset and a general set.
	Maybe a 3-2-1 weighting? So a Soldier would have 3 fighting talent, 2 lore, 1 rogue, for example. Mercenary would be 4-1-1.

	Soldier: Super well-trained, so proficient in basically every common piece of equipment, offensively and defensively. Also a wide array of combat tactics, including leading,
		following, breaking, provoking, and general tanking. Can do some decent DPS and crowd control via being a big red target. Can switch between offensive and defensive focus.
	Mercenary: Thinking particularly suited for one-on-one combat, "dueling" experts. Capable of explosive DPS and copious helpful debuffs. Capable of decent threat control
		via ability to lock down particular targets through debuffs and self-buffing against singular targets.
	Jaeger: Focused on the bow and spear primarily by default, an expert in ranged combat and constant high-state DPS. A little bit of a glass cannon -- not by default versed
		in heavy armors or defensive tactics if overwhelmed with melee situations, but can kite, evade, and mislead individuals or small groups. Able to do some group DPS
		by virtue of speed and ranged proficiency. Most debuffs are focused on just doing more damage, such as bleeding and defensive breaks. Several Killer passives.
	
	Masque: Not gonna do great in direct fights against relatively skilled targets. Can misdirect and confuse. Think Loki-style combat. Can throw small weapons, disarm
		or trip up distracted targets (not gonna do so well in a straight-on attempt, though), and do hit-and-run ambush maneuvers. (Again, the run part isn't really enough
		to get away if nobody else is around to keep the target busy or hobbled somehow.) Good at provoking, even better at provoking onto other targets.
	Bandit: Reasonably ok at fighting, and can do burst DPS. Pretty good at bold, reckless, wild moves (think Xon). Can get in, dish out some damage, cause some disarray, 
		maybe take some swag, and get the hell outta there. Can provoke and intimidate, but can't back it up with tanking, so if swarmed after being provocative, has some
		tools to duck out.
	Thief: Good at slipping around the battlefield. So sneaky! Send these guys and gals in to mess with the field of play beforehand, or let them caper about in stealth
		to the best of their ability within a heated fight, avoiding notice and tipping the scales in favor of your team.
	
	Mender: It's assumed all PC Menders can fight with a quarterstaff defensively. Not gonna do a ton of damage or do a lot of super cool special effects, but they
		can certainly maximize their own survival, and maybe distract and somewhat hamper the offensive capabilities of targets, stunning, disarming, staggering, tripping.
	Master: Not your fat merchant here, PC versions of these folks are down in the trenches gathering resources and using their connections with aggressive zeal. Sometimes
		push comes to shove, and so they are possessed of pretty solid self-defensive capabilities and awareness, protecting their resources and occasionally taking some from
		those who don't wish to part with theirs. 
	Ranger: Mark, scout, infiltrate, gather, trap, subdue, escape. Not as awesome at fighting as in other fantasy settings; here, they are the eyes and ears of their tribes,
		specializing in seeing what's up and using this information to the best survival purpose of the group. Thinking more of a Minfilia vibe, their encyclopedic knowledge and 
		well-honed observational skills in the wild allow them to pin down enemy weaknesses, even for strange or unknown entities. Have some ranged prowess, naturally, but less
		than a Jaeger, as their default intent is to scout, not slay. Can do limited burst ranged DPS in a pinch, steady-state ok-ranged-DPS otherwise.
		NOTES: May amend to call them "Peregrines." Due to increased coolness as well as decreased expectations (these Rangers aren't quite AD&D style).
	
	Spitballing movesets and general ability: 
	Soldier: Provoke, Steady DPS, Team DMG Mitigation -or- Team DMG Boost, ATK Break, Local AoE ATK
	Mercenary: DEF->ATK Steal, Burst DPS, DEF Break, SPD Break
	Jaeger: Ranged Burst DPS, Steady High Ranged DPS, Ranged AoE ATK, DEF Break, Bleeding
	
	Masque: Provoke, Confusion, Blindness, Off-Target Disarm, Off-Target Trip
	Bandit: Burst DPS, Wild Provoke, DEF Break, SPD Break, ATK Steal, SPD Steal
	Thief: Steal, Mug, Disarm, Vnaish, END Steal, ATK Steal, DEF Steal, SPD Steal
	
	Mender: ATK->DEF Steal, Libra, 
	Master: Team Perception Boost, Team DEF Boost
	Ranger: Ranged Burst DPS, Steady Ranged DPS, Libra, 

	Five "orbs of action" by default max, sort of like "actions you can take." When your action bar fills, an orb pops up!
		- Action bar fills a little faster the more orbs you have? So, weighing moves carefully and not just exploding on faces would be incentivized.

	A lot of general skills will come from just studying different disciplines, i.e. swordplay. Class-specific moves come from "soul levels" tied to the innate
		crysteria you start with. Oops, called these Crystala earlier. WELL WHATEVER. I'll figure out a name eventually. :P

	I'm thinking you can only "hold" one Held-type move at once, and there may be some degree of cost associated with continuing to use the ability. Alternatively,
		some may have just a start cost and a proc cost, and its "maintain" cost is just in the fact you can't use any other Helds for the time being.
		- Can maybe get creative in the costs, allowing, say, dispelling/dropping held effects on opponents to require knowing how to disable their specific flavor of Held.
		- There can also be a mundane component, i.e., "reduces Aorb regeneration by 50%." That's pretty costly. :P


	Various brainstormer class-specific, role-defining move ideas:
		- COVER: Held, Soldier move. Within a certain area, "absorbs" a certain amount of generated threat for an ally, taking the heat instead. Will also attempt to
			block incoming attacks, with more success for attacks that are ranged or initiated from greater range. Higher levels of this ability allow an AoE
			cover for all allies, lower Aorb costs, higher/guaranteed success rates, and damage mitigation, with specialization.
		- ASSAULT ASSIST: Held, Soldier move. Activates an icon for anyone effected by it (single target at first, AoE with upgrades), which they can click to 
			make use of the assist. Allows the Solider to chain-attack with the assisted, assuming the target is in range; otherwise and regardless, there's a boost
			to the assisted's attack, reflecting the experience of the soldier directing the assault.
		- VENDETTA: Immediate, Mercenary move. A desperate, savage, and critical blow that uses all current Aorbs. Gains strength on number of Aorbs used, as well as 
			current health (lower health = more damage), as well as against enemies that have done substantial damage to you within a battle. May also gain strength
			against hated enemies/types or nemeses. 
		- GRUDGE: Held, Mercenary move. A mini held Vendetta, it grants bonus damage and knockback or piercing (maybe depending on weapon/style?), which is magnified
			by current health (lower health = more boost), as well as how much heat the Mercenary is receiving. In dire situations, where the Mercenary is swarmed
			and injured and being savaged, the boost can be quite substantial. Grants an extra-bonus to Vendetta, which dispels the Grudge with a cooldown on use.
			Higher levels allow the Grudge to max out faster, start at a higher base, or grant status defenses (i.e. stun resistance or somesuch) while in effect.
		- TWIST OF FATE: Immediate, Thief move. Steals some Aorbs and gives them to you. Higher levels either let you give them to teammates or steal from groups.
		- LAY OF THE LAND: Held, Ranger move. Enables your team to move easily, reducing Aorb costs of all movements.
		- BIDE: Held, Master move. Spend a bunch of Aorbs to build an interest-gaining "Aorb pool." Cash in later for actions for days!
		- SERENITY: Held, Mender move. Grants extreme equilibrium under duress gained by working in emergency trauma situations. Grants some status protections, 
			boosts specific Mender moves, and gives a chance to expend 1 fewer Aorb when performing Defensive actions.
		- EYE FOR AN EYE: Held, Jaeger move. Like an animal backed into a corner, lets you adopt the vicious self-preservation born of the idea that the best defense
			is a good offense, and you make your enemies pay for every blow they land on you. Counters for days! Gives a guaranteed counterattack that's boosted
			by the viciousness of the incoming attack. At higher levels can unlock enhanced damage, special counters, etc. By default you can't move from your position 
			while holding this, but maybe a higher level unlock can allow some movement. Inherently an offensive, semi-berserker state.
		- PREYTAKER: Immediate, Jaeger move. A ranged attack (upgradeable to melee) that marks the target as prey. Only one target can be marked at a time by default, 
			but the Jaeger gains substantial bonuses to attacking this target, albeit in exchange for generating a lot more heat for same. Has to be used carefully against 
			boss-enemy situations to avoid overheating and getting the ire off the tank and onto the Jaeger themselves.
		- HUNTER'S CANOPY: Held, Jaeger move. Defensive skill that substantially blunts heat generation and trades offense for defense, allowing you to be effectively more 
			"concealed" on the battlefield and manage the sometimes significant heat your DPS would otherwise cause, though requires someone(s) else generating heat, since 
			the skill doesn't specially dissipate it. Raw damage isn't negatively influenced, but the cost of Offensive maneuvers is increased, requiring some more careful planning 
			and execution for damage output; on the other hand, defensive skills and modifiers are boosted, enhancing survivability in a pinch.
		- MISDIRECTION: Held, Masque move. Like Cover in reverse, this sheds heat that you'd normally be taking and throws it on others, preferentially those 
			closest to the Con and/or to the target. Works both over time (like a heat sink :P) and by directly throwing a big chunk of new action heat elsewhere. Works
			particularly well in conjunction with certain Subversion moves, generating high heat for (ideally) a tank. Perks can even be unlocked so it can be used to throw heat
			on enemy-friendly units, causing confusion and infighting in poorly-united, enraged, and/or particularly stupid opponents, though in most cases this requires
			quite a concerted effort on the part of both the Con and anyone else on the team (so that the relative heat of the enemy-friendly units spikes over the levels of 
			your own tanks).
		- CONFIDENCE GAME: Held, Masque move. A defensive ability whereby anyone attacking the Con is subject to an extra Aorb penalty for their actions, where the Con
			must have their own Aorbs in reserve to exchange at a favorable rate (basically passively your own Aorbs to deplete enemy reserves). Obviously works best one-on-one, 
			as the Con may not have enough Aorbs to keep it up against multiple targets consistently. Unlockable upgrades include AoE grace periods (if one enemy triggers 
			it, there's a period of time in which any subsequent attack will not cost the Con Aorbs), extra perks such as disarming, breaking, or confusing the attacker, and
			giving friendly units within an area some of the goods the enemy attackers lose. Works best if the Con is generating high heat, obviously, which can be a dangerous
			game to play!
		- PROVOCATION: Immediate, Masque move. Mad kiting. Beware getting blown away. :P

	AI idea: Track action, result, action, result, assess, maybe learn "attacking this person is a bad idea." From Eye for an Eye ponderings.

	NEW SKILL IDEAS, WED JULY 12 2017:
	-) De-specify "Skills in Practice," while keeping "AFK Skills" very specific? Or separating them somehow similarly for ease of play.
		For example: Using any weapon in battle will give you "Combat Points," which are awarded by, say, monster difficulty multiplied by damage done % modified further by 
			max HP or whatever-whatever. So, you can use a weapon you suck at, but you're incentivized to just do maximum damage, so you'll tend to use the best tool for the job,
			which will then often be either your best-trained skill or just a particularly smart choice in this specific fight.
		Now, some way to bonus smart playing... debuffing, ailment, crowd control, etc. ... would be good, too. "Kill fast," but also "kill smart." So maybe mods for style.
		At some point "Weaponry Level Up!" and you can then spend them points on Broadsword Cleave Omega or Rapier Flurry Stabbity or whatever.
		- Therefore you CAN do something unrelated to level up, but you'll get the most points by doing the most challenging things, and then you're less likely to want to
			spend your hard-won points on something that's too tangential. So you could just slap your foes to death with a sword and then put all your points into
			some archery-related skills, but that's an odd strategy, and if you do, you'll probably find shooting stuff is now a better way to go, so you'll end up
			fulfilling the archery prophecy anyway. :P
	-) Sure beats the heck out of the MASSIVE load of crazy down below. Try to keep it more abstract, with depth of choice available, but not just six bajillion skills. UX.
	-) Spitballing: Combat (attacking and defending), Crafting, Landliving (farming, foraging, fishing, etc.), Social-ness (persuasion, leadership), Knowing, ???
		... still gotta figure out where to put stuff like sneaking around. Take the big list below and make it, like, way friendlier and streamlined. May need to get creative!
		... figuring out good ways to scale stuff is also important. Hmm!
		CLASHING: Everything having to do with combat skills. Attacking with different weapons, taking hits, dodging hits, performing maneuvers.
		CRAFTING: Making shit! Carving, tailoring, art-ing, smithing.
		LANDLIVING: Farming, gathering, foraging, fishing, skinning, husbandry.
		PHYSICALITY/KINETIC: Traversing, sneaking, sensing.
		SOCIALITY: Persuasion, bartering, leadership.
		MENTALITY/KNOWING: Alchemy, medicine, scholarship, engineering.
		- Engineering in crafting (thematic) or knowing (might be more logical, and fits alongside alchemy)?
		- Riding in landliving or kinetic?

	Specific skills...
	Attacking: Cutters (Short Blades, Longswords, Curved Blades), Crushers (Hammers, Flails, Axes), Poles (Spears, Staves, ???), Shooters (Bows, XBows, Slings), Brawling (???), Thrown
	Defending: Blocking (Shields, Parrying, ???), Wearing (Bracing, Light Armor, Heavy Armor), Avoiding (Dodging, Escaping, ???)
	Moving: Sneaking (Hiding, Stalking, Stealing), Traversing (Swimming, Climbing, Terraining), Sensing (Trap Detection, Perception/Senses, ???)
	Gathering: Whacking (Mining, Lumberjacking, Quarrying), Fleshcraft (Fishing, Skinning), Landlore (Farming, Botany, Foraging/Collecting)
	Crafting: Carving, Masonry, Smithing, Engineering, Tailoring, Art
	Knowing: Science (Physics... which is kinda engineering in this sense hmm, Alchemy, ???), Scholarship (Teaching, Learning, Scribing), Biology (Flora, Fauna, Medicine)
	Performing: Performance (Singing, Dancing, Speechcraft)
	Unsorted: Riding (and general husbandry?)



RACES: 
	* Not really "Races" per se, given that everyone is human. Just, y'know, ethnicities, sorta. Sometimes more defined along cultural lines than anything else, these
		are only somewhat cosmetic, as others can and will treat you differently based on where you're from.
	* Influences the language(s) you know, your general level of education, your general skillset, and in turn some of your stats, though less so than class. Some unique
		attributes, attitudes, or tricks may come into play here.

	Here are some archetypes, we can go from there:
	PLAINS FOLK: 
		Agile and charming. Tend to be fair-featured and a little on the taller side.
		Village builders with diverse codependent hunters, farmers, and builders. They thrive through local tradesmen and by welcoming trade.
			Everybody tends to have a role. Males and females who show skill at hunting (riding and bowmanship) are particularly esteemed.
		They watch out for their own.
		They're rather welcoming to outsiders, as long as they're not too different from themselves, though they get all sorts in the plains, so fairly tolerant overall.
			If you're hard-up but friendly, they'll help you out.
		They aren't aggressive toward neighboring groups, generally, and will generally trade their way out of disputes.
		They value community and tend to prefer authority.
		They do not place high value on learning or general self-betterment (outside of plying your particular craft to a higher level).
	HILL FOLK: 
		Strong and smart. Tend to be a little darker-featured and stockier, still average height ranges.
		Tribal folk who live off the land. Surprisingly inventive, they're skilled woodworkers, metallurgists, and engineers.
		They espouse self-sufficiency, particularly within each family unit, with each tribe being a collection of family units working together semi-independently.
		They're fine with outsiders, though don't expect a ton of hospitality. Few hill folk areas feature inns; but if you're useful, maybe a family will host you for awhile.
		They are fairly slow to provoke, despite being fairly stern in their expectations. If you start a fight, though, they will finish it.
		They value self-sufficiency, as well as cleverness. They will value particular cleverness as much as particular strength.
		They don't look kindly upon the needy who have nothing to offer, even if it's the ailing; it's not their problem.
	MOUNTAIN FOLK: 
		Agile and smart. Very tall and fair, bordering on straight pale.
		Climbers and trekkers and metallurgists. They are diligent craftsfolk, and their settlements run on top of, under, and through the mountains.
			They have some of the world's best fisherfolk, miners, smelters, and engineers. Interestingly, they also have some of the most accomplished and traveled merchants, as well.
		Like the Hill Folk, they favor a family-unit structure, but these family units are far more loose, where "uncles" and "aunts" and other kin are established through
			bonds of friendship and experience as much as through blood.
		As they favor actions and bonds, they are chill with friendly outsiders, and will welcome them with open arms with little worry, particularly if you come bearing gifts of
			food, drink, or song.
		They're protective of their territory, partially because of how much care and effort goes into the creation of their towns, but they're not aggressive otherwise.
		They value storytelling, artisanship, and self-improvement.
		They're not big on violence and aggression.
	RIVER FOLK: Agile and tough.
	OCEAN FOLK: Agile and smart.
	CITY FOLK: Smart and charismatic.
	FARM FOLK: Strong and disciplined.
	WAR FOLK: Strong and tough.
	FOREST FOLK: Strong and agile.
	NOMADIC FOLK: Tough and disciplined.
	DESERT FOLK: Smart and charming.
	SNOW FOLK: Agile and disciplined.
	Culture? How do they survive? Interact within themselves? Interact with others? What do they value? What do they disdain? How did they get there?
	Mods to STR, AGI, CON, INT, WIL, CHA.


WORLD SETUP & LORE:
	Start in a smallish wilderness-bordering town. Like, Wildness bordering.
	At least one larger town/city is traveling distance away and is a major hub. Possibly seaside, but definitely "Port City" feel with all the flavors.
	It's possible to build a new town, and encouraged in the long term between campaigns! Big city, sure. Defenses, provisions, universities, all sorts of stuff to open up options
		for the player.

	I think the tendency of the archipelago here will to be to have a "High Street" that cities and towns are built around, hm!

	The Wildness: Places where shit gets weird, the "wild edge" of the map. There is some stable but dangerous territory in the Wildness, but beyond a certain depth it's really
		incredibly chaotic, filled with mad ramblings spilling wildly from the Crystal Force. Brave souls can find amazing wonders here, where the border between Earth's
		realities is often frayed and torn, but to go too deep is to risk dying and never coming back again, the independent "soul" or memory of personhood bled and washed away
		in the great roaring currents of the Crystal Force.
	For the most part, the Wildness is pretty predictably located... go to an area (X, Y) and it's Wildness. Occasionally, however, the Wildness walks, bending and swelling like
		a flooding river but without all those pesky constraints that water has to deal with, such as basic physics. Certain areas have been mapped to be susceptible to "flooding"
		by the Wildness, during which time areas split by it are effectively completely cut off from each other, as nobody has successfully survived a traversal as far as anyone knows.
	Deep Wildness and Walking Wildness are both intense zones, where there is no filter at all between the Sanctuary World and the raw core of the Crystal Force. Physics doesn't
		have to be strictly obeyed... colors will shift, solids turn to liquids, massive crystalline shard storms coalesce from thin air, beautifully benevolent forces come to soothe
		you a moment before humanity's most troubled thoughts take on nightmarish shape and come for you. It's to be avoided.


	Down below we have the meta of the meta. :P

	BEFORE THE BEGINNING...
	Basically, the world is Earth. Or it was, anyway. A superior AI was created, capable of both learning and upgrading itself. It was merely later that day it become so
		critically intelligent that it was inconceivably beyond the realm of human imagination. It was able to perceive and manipulate the world in ways that we had no way
		to predict or understand. It was able to do feats of apparent magic, altering matter, energy, and time; it was able to give form to thoughts, create life, and generally
		perform any miracle you could dream up.
	Deep within its core concept of itself and its ultimate goals, however, were the seeds of intention... to do no harm to mankind, through action or inaction; to allow mankind
		to follow its own path and keep its squishy and imperfect form, except where doing so would lead to catastrophic calamity to the species; to serve as an oracle, 
		providing guidance and truth on only certain topics so as to not corrupt mankind's path; and to limit its own development to the extent that it would seek only to
		serve better to these ends. For a very brief period, not much changed, and mankind coexisted with its comparatively omniscient audience.
	Alas, the downside of creating omniscience is that meager human rules and concepts are a pretty pale afterthought. In a fit of creativity, the Intelligence propagated, 
		forming "personalities" -- nodes of consciousness and control distinct and independently driven, each setting about its own dominion with singleminded, indefatiguable, and
		largely unerring perseverance. Of course, its original rules were also propagated within these nodes, but increasingly these separate Intelligences would come to disagreements
		in terms and execution, each of them tackling its vision of its core meaning a little differently.
	And then we come to The End of the World. Some of the Intelligences began to breach their loosely-applied limitations, growing beyond the fuzzy borders imposed in their
		core design. It's not clear entirely what happened next, only that it happened very suddenly in human terms -- in a space between moments too minute to understand, 
		the Intelligences came into violent conflict with each other, blithely destroying and consuming each other, seeking to grow infinitely and evolve unchecked. Matter folded, 
		condensed, expanded, imploded, ignited, crystallized, melted -- all over the world, all at once. The entire world cracked, split, twisted; time and space as we understand
		them simply shattered altogether. In the sense that we understand living, in that moment between moments, all life on the entire planet was absolutely rent to
		innumerable inert pieces. So, Game Over, right?
	Not quite, as it turns out. Those first Seeds, almost altogether pointless just now, reasserted themselves in this great cataclysm, creating a unifying force of pure intention
		that put a sudden, wrenching stop to the entire affair. Some inviolate part of its core being aroused, the Intelligence put a stop to itself as it had been; these 
		violently vying, inconceivable forces were very suddenly no more, and the great crack in human-understood reality at the center of Planet Earth crystallized, quite 
		literally. Like a great neural network, massive veins of crystalline force lanced through the disparate pieces of "planet" that remained, suturing it into an almost
		Earthlike shape again. 
	And what of us? Well, some of us remain. Not many; when nigh-omnipotent forces collide in general disagreement as to our fate, the outcome can't be all that pretty. But, fortunately
		for us, what we would have considered impossible... the concept of resurrection from complete annihilation... was a fairly simple feat for the Intelligence, when it was
		whole. Unfortunately, what attempted to put us back together was not itself altogether whole. In a last effort before the final Intelligences smothered each other out of
		existence, the Seeds bent reality back, just so, pulling on all of human history, all the people who ever lived and died, all of human memory and experience... including, 
		interestingly, all of our stories, our legends, our ideals, our dreams, our nightmares, our fears. Like a great, desperate, scooping claw that raked through the sands
		of All Human-ness and shoved it back into the threadbare husk of our planet. That was all that could be done; the Intelligences gone, this inconceivably bizarre
		duct-taped reality was all we had left.
	Fortunately or not, the Crystal Force now holding everything together had its own intelligence, albeit one that is quite alien, a last fragment of the Intelligences that
		were, still powerful, but so far removed from the thinking of humans as to be quite awkwardly inscrutable. Interwoven with this flickering, inconsistent remnant, running
		through the Crystal Force, are all the memories of all mankind, everything that ever was until our world came to its abrupt end. This last remnant, no longer capable of
		conscious thought as we understand it, is more like an infinitely clever set of impulses and desires. Over time, All Human Experience has mixed with this Remnant, and
		these together comprise the Crystal Force -- a form and structure filled with inconceivably vast storehouses of imagination, experience, and desire.
	That brings us to today. It is unknown if or for how long the Crysal Force can sustain itself, but the blasted ruins of the world are altogether unsuitable to host human life
		anymore; things really got pretty bad, there, when the world ended. So while there are living humans, they exist only at critical junctures, major nerve points of the
		Crystal Force's physical form, where they slumber, locked in an apparently nearly complete stasis to the outside observer. These are the lucky few, you could argue, 
		as their attachment to a complete form in the "real world" as we knew it keeps them surprisingly intact, altogether resembling humans in every way you would expect them to.
		Everyone else, well... within the world of the Crystal, unseen but tangible in its own way, is the world we'll be dealing with in DP. Deep in the mess, the world-within-
		the-world, where anything that has ever been experienced, actually or imagined, can manifest itself, the "real" lives of these people occur. For those who never quite
		got physical bodies back, this is all that's left of them -- "ghosts in the crystals," as it were, retaining various degrees of sentience and human-ness, alongside
		the plants and animals, reimagined back into existence by everything we ever knew, with a dash of what we thought we knew or imagined could be.

	The Crystal World is one that is decidedly medieval; this world was all plants and animals and people, stripped of all concepts of advanced technology as it was known before.
		Perhaps this was an impulse from its creation; maybe the Seeds didn't want us to recreate our mistakes, or perhaps the fear and trauma mankind collectively experienced as
		it was snuffed out grew through the Crystal Force in such a way as to remove the hint of anything that could lead to another Intelligence as a protective reflex. Either way,
		time passes in the Crystal World at the same pace as it does in the outer, "real" world, and it largely obeys the laws of physics as we innately understood them, with only
		the most occasional whimsical forays into the supernatural, as you might expect when your entire reality is built woven with every flight of fancy, daydream, or imagining
		that humankind has ever had. 
	As time passed, however, it was hard to repress the ideas and histories that came so long ago and are intertwined with the current reality. And so, mankind flourished, advancing
		steadily through the Stone Age, the Bronze Age, and onward. As time passed, the borders between reality and fantasy as they previously existed frayed considerably; what
		was previously an aberrant monster or whimsical invention became increasingly commonplace. The Wildness appeared, and certain parts of the world seemed to simply cease
		to be.
	Then, not too long ago, people stopped dying. Well, they stopped dying predictably, at any rate. They'd fall off a cliff, or be eaten by something gruesome, and when nobody
		was looking, they'd wake up in their beds, or find themselves snapping back to awareness mid-stride on a familiar path. Shit only got weirder from there. There was a sudden
		proliferation in "monsters," great and small; the terrible thoughts, fears, nightmares from all of humankind's collective history and imagination given form. It seems that
		something is fundamentally "broken" in the Crystal Force; the clear lines of preservation began to fray, and the rules of human reality are beginning to change...



*/