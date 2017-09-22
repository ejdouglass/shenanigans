// ** HERE ** : Or, at least before any interaction, all object objects must be defined. Like swords and gear and anything that needs interactionability.

// Also! I guess we can throw a bone to players: we can COOKIE their username upon successful login. :P

var player = {lastcommand: [], lastcommandindex: -1, roundtime: 0, rtmax: 0, mroundtime: 0, mrtmax: 0, where: "000000"};

var agents = {};

var verbs = "000south 001southeast 002southwest 003east 004west 005northeast 006northwest 007north 008look 009up 010down";
verbs += "100slice 101shove";
verbs += "200prepare 201power 201perceive 201concentrate 202mana";
verbs += "300forage";
verbs += "400experience 401info";
/* 
KEY:
	0: travelCommand, 1: attackCommand, 2: magicCommand, 3: survivalCommand, 4: expCommand (we can also scoot things like INFO in here)
NOTE:
	Ok, so travel is madness. We need a separate case where if the player enters a SINGLE letter, we should jump DIRECTLY to movement madness.
		Otherwise, it defaults to finding the first instance of the given letter, and it's REALLY hard to parse it properly.
*/

// Somewhere around here: set all default windows to NOT display at all, and instead a login prompt. Unlike other apps, there's a discrete QUIT function.
// The player will not be using cookies here due to the distinct need to connect/disconnect.

// Upon login, which is our usual easy-peasy login check that we've done a million times before, we access the database...
// Load all stats, grab all game data in as efficient a manner as possible, establish server communications, and set player core data to "playing."
	// Concern: what happens if a player doesn't discretely quit, but off-windows or just closes the window? Can we force-quit them in the absence of input?
	// Basically, we can wizard up an engrossing experience by having player actions fire off scripts that update the entire "world" behind the scenes...
	// But it'd be FAR better if I can figure out how to have a way for the scripts to automatically run themselves at intervals if certain criteria are met.
		// Ghetto option is to have a "watcher" browser open whose ENTIRE job is to do the above. I mean, it would probably work, but requires me to keep my computer running. :P

prompt();

var runtime = 20;
var letsmud = setInterval(sonOfSephos, runtime);

window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key == 13) {
		// Enters the contents of the player input bar into the game for victory!
		var gogo = document.getElementById("playerinput").value;
		cmdhist(gogo);
		player.lastcommandindex = -1;
		parsePlayerCommand(gogo);
	}
	if (key == 38) {
		// UP - this always works, but at 10 UP no longer pulls anything up. Whyyyy! And just holding UP does the same thing.
		if (player.lastcommandindex < 9) {
			player.lastcommandindex += 1;
		}
		/*
		if (player.lastcommandindex > player.lastcommandindex.length) {
			player.lastcommandindex = player.lastcommandindex.length - 1;
		}
		*/
		if (player.lastcommand[player.lastcommandindex] != undefined) {
			document.getElementById("playerinput").value = player.lastcommand[player.lastcommandindex];
		}
	}
	if (key == 40) {
		// DOWN
		player.lastcommandindex -= 1;
		if (player.lastcommandindex <= -1) {
			player.lastcommandindex = -1;
		}
		if (player.lastcommand[player.lastcommandindex] != undefined) {
			document.getElementById("playerinput").value = player.lastcommand[player.lastcommandindex];
		} else {
			document.getElementById("playerinput").value = "";
		}
	}
}

function parsePlayerCommand(command) {
	document.getElementById("playerinput").value = "";
	document.getElementById("latesttext").innerHTML += " " + command + "<br>";
	
	// ** HERE ** : use function cmdhist() to update the player's input history.

	// First step: pull the input apart, separated by spaces, into an array.
	command = command.split(" ");

	// Next: interpret the FIRST input, which will be the PRIMARY VERB!
	var mainverb = command[0];

	// For very short commands, such as shorthand walking directions and GO, we need to intercept these first; the generic code for longer commands breaks apart badly otherwise.
	// We can include "L" for "look" here, too!
	if (mainverb.length <= 2) {
		// Separate special-parse for directions.
		// We can have N(W/E), S(W/E), W, E.
		// GO is also in play!

		// ANY COMMAND that can be shorthanded to 2 or fewer letters, like L for look, needs to go in this section.

		if (mainverb[0] == "s") {
			if (mainverb[1] == "w") {
				// SW
				travelCommand([0],"02");
				prompt();
				return;
			} else if (mainverb[1] == "e") {
				// SE
				travelCommand([0],"01");
				prompt();
				return;
			} else if (mainverb.length == 1) {
				// Vanilla S
				travelCommand([0],"00");
				prompt();
				return;
			}
		} else if (mainverb[0] == "n") {
			if (mainverb[1] == "w") {
				// NW
				travelCommand([0],"06");
				prompt();
				return;
			} else if (mainverb[1] == "e") {
				// NE
				travelCommand([0],"05");
				prompt();
				return;
			} else if (mainverb.length == 1) {
				// Vanilla N
				travelCommand([0],"07");
				prompt();
				return;
			}
		} else if (mainverb[0] == "w" && mainverb.length == 1) {
			travelCommand([0],"04");
			prompt();
			return;
		} else if (mainverb[0] == "e" && mainverb.length == 1) {
			travelCommand([0],"03");
			prompt();
			return;
		} else if (mainverb[0] == "g") {
			// Check for GO
			return;
		} else if (mainverb[0] == "l" && mainverb.length == 1) {
			travelCommand([0],"08");
			prompt();
			return;
		} else if (mainverb[0] == "u") {
			travelCommand([0],"09");
			prompt();
			return;
		} else if (mainverb[0] == "d") {
			travelCommand([0],"10");
			prompt();
			return;
		}


	}

	// This section checks the array of words in the user's input and sets command[0] equal to the remaining number of items to parse.
	if (command.length > 1) {
		command[0] = command.length - 1;
	} else {
		command[0] = [0];
	}
	var mvindex = verbs.indexOf(mainverb);
	if (mvindex == -1) {
		echo("(I don't understand what you're trying to do.)");
		prompt();
	} else {
		var verbtype = verbs.substring(mvindex - 3, mvindex - 2);
		var verbsub = verbs.substring(mvindex - 2, mvindex - 0);
		switch (verbtype) {
			case "1":
				attackCommand(command, verbsub);
				break;
			case "2":
				magicCommand(command, verbsub);
				break;
			case "0":
				travelCommand(command, verbsub);
				break;
			case "4":
				expCommand(command, verbsub);
				break;
			case "3":
				survivalCommand(command, verbsub);
				break;
		}

		prompt();

	}

	/* 
		How we do? Basically, we want to ferret out if we're typing PREP or PREPARE or PRE or whatever. 
		If verb = attack, go to fighting function!
				= prepare, go to spell time!
		Etc.

		MAYBE an alphabetical multidimensional array. So then we just search based on the first letter, jump on in there!
		- From there, find the best match, and input.
		OR we can just make an array of 26 letters of the alphabet, with associated actions. Then a separate array that routes to the function that fulfills the verb.

		So tricksy!

		Well, the DR way was "go with first appropriate hit," meaning if you type SLI and it hits SLICE before SLIP, it'll slice. 


	*/
}

function attackCommand(cmdline, type) {
	// Well, we know we're attacking, but nullify if there's no valid target to save time.
	// Step one: identify target. If command.length = 1, then they just typed "slice" or whatever, so just check "facing." 
	// GENERALLY, the final word will be the target, like "slice third goblin". But we can reference the room for valid targets (plus any "extra target pool," which can ponder later).

	/* 
		OK! Below. Parseload is how many remaining items we gotta parse. Go through and look for TARGET first, then NUMBER, then finally ADJECTIVE, decrementing parseload each time.
			- Once parseload is zero, we should be able to set the target within this function, and make sure the attack hits that target!
	*/
	var parseload = cmdline[0];
	if (parseload > 0) {
		// Time to parse things! The below makes a new array out of all remaining parse items.
		cmdline = cmdline.slice(1);
	} else {
		// The command was entered by itself. Set function target to FACING, or if not facing, call DEFAULT BEHAVIOR of facing your nearest target and going wild!
	}
	

	switch (type) {
		case "00":
			// SLICE - type attack!
			if (canIMove()) {
				echo("You slice at a sniggering field goblin!");
			}
			break;
		case "01":
			// SHOVEYS!
			if (canIMove()) {
				echo("You shove a sniggering field goblin to its knees!");
			}
			break;
	}

	// For the above, we also need a function that awards experience to the to-be-drained pool based on, y'know, stuff. 
	// Also, everything needs to check proper stats and skills and condition. TRICKY.
}

function magicCommand(cmdline, type) {
	var parseload = cmdline[0];
	if (parseload > 0) {
		cmdline = cmdline.slice[1];
	} else {
		// The command was entered solo.
	}

	switch (type) {
		case "00":
			if (canIMind()) {
				echo("You trace an erratic sigil in the air, shaping a simplistic spell pattern, but to no practical purpose.");
			}
			break;
		case "01":
			if (canIMind()) {
				echo("You reach out with your senses, pushing your awareness out into the subtle streams of Elemental energies that knit the natural world together.");
				echo("However, almost impossibly, you cannot detect the slightest spark of that fundamental power here.");
				MRT(6);
			}
			break;
		case "02":
			echo("You turn your attention inward and discover a still blankness where magic should dance. You have no connection to the surrounding Elemental energies whatsoever.");
			break;
	}

}

function travelCommand(cmdline, type) {
	var parseload = cmdline[0];
	if (parseload > 0) {
		cmdline = cmdline.slice[1];
	} else {
		// The command was entered solo.
	}

	switch (type) {
		case "00":
			if (canIMove() && canIMind()) {
				echo("You walk south.");
			}
			break;
		case "02":
			if (canIMove() && canIMind()) {
				echo("You walk southwest.");
			}
			break;
		case "01":
			if (canIMove() && canIMind()) {
				echo("You walk southeast.");
			}
			break;
		case "04":
			if (canIMove() && canIMind()) {	
				echo("You walk west.");
			}
			break;
		case "03":
			if (canIMove() && canIMind()) {
				echo("You walk east.");
			}
			break;
		case "06":
			if (canIMove() && canIMind()) {
				echo("You walk northwest.");
			}
			break;
		case "05":
			if (canIMove() && canIMind()) {
				echo("You walk northeast.");
			}
			break;
		case "07":
			if (canIMove() && canIMind()) {
				echo("You walk north.");
			}
			break;
		case "08":
			echo("You look around. Not much to see here! You're in nothingness.");
			break;
		case "09":
			if (canIMove() && canIMind()) {
				echo("You head up.");
			}
			break;
		case "10":
			if (canIMove() && canIMind()) {
				echo("You head down.");
			}
			break;
	}
}

function expCommand(cmdline, type) {
	var parseload = cmdline[0];
	if (parseload > 0) {
		cmdline = cmdline.slice[1];
	} else {
		// The command was entered solo.
	}

	switch (type) {
		case "00":
			echo("Here ARE YOUR EXPERIENCE POINTS!... nada. You have zero ranks in everything.");
			break;
		case "01":
			echo("Your info is as follows:<br>You have no stats, and no shape, and nothing going for you.<br>You are completely formless. How awkward!");
			break;
	}
}

function survivalCommand(cmdline, type) {
	var parseload = cmdline[0];
	if (parseload > 0) {
		cmdline = cmdline.slice[1];
	} else {
		// The command was entered solo.
	}

	switch (type) {
		case "00":
			if (canIMove()) {
				echo("You forage around for a moment, but you're unable to find anything.");
				RT(4);
			}
			break;
	}
}

function echo(message) {
	document.getElementById("latesttext").innerHTML += "<br>" + message + "<br>";
	// This works great for basic paragraphs. Is there a way to make it so we can do multiple paragraphs, but in a single "grouping?" That'd be great! Add the functionality!
}

function cmdhist(command) {
	// So. After a bunch of uses, this just stops working. NO BUENO. So we gotta figure out why!
	if (command != player.lastcommand[0] && command != "") {
		player.lastcommand.unshift(command);
	}

	if (player.lastcommand.length > 10) {
		player.lastcommand.pop();
	}

	console.log(player.lastcommand);
	// Result: huh! So the array is populating juuuuust fine. It's just after awhile the up and down don't work no mo'.
}

function roundTime(seconds) {
	// A handy function for displaying a textual RT prompt, queuing the RT bar, and actually putting ya in RT.
	player.roundtime += seconds * 1000;
	player.rtmax = seconds;

	// Sneaky span in there allows us to later customize the color of the ROUNDTIME text. A front-end favorite!
	document.getElementById("latesttext").innerHTML += "[<span class='roundtime'>Physical Roundtime:</span> " + seconds + " sec.]<br>";

	// ** HERE ** : populate the RT bar! ... also have an RT bar
	document.getElementById("currentrt").style.width = "100%";
	document.getElementById("rtnum").innerHTML = seconds;
	document.getElementById("currentrt").style.border = "1px solid rgba(200,20,50,1)";

}

RT = roundTime;

function mroundTime(seconds) {
	player.mroundtime += seconds * 1000;
	player.mrtmax = seconds;

	document.getElementById("latesttext").innerHTML += "[<span class='mroundtime'>Mental Roundtime:</span> " + seconds + " sec.]<br>";

	document.getElementById("currentmrt").style.width = "100%";
	document.getElementById("mrtnum").innerHTML = seconds;
	document.getElementById("currentmrt").style.border = "1px solid rgba(200,20,50,1)";

}

MRT = mroundTime;

function prompt() {
	document.getElementById("latesttext").innerHTML += "<br>>";
}

function canIMove() {
	// Physical roundtime checker. See if the player is in roundtime. If so, halt next action!
	if (player.roundtime > 0) {
		echo("... wait " + Math.floor(player.roundtime / 1000 + 1) + " seconds for your body to catch up.");
		return false;
	} else {
		return true;
	}
}

function canIMind() {
	// Mental roundtime checker. See if the player's mind is occupied. If so, be prepared to halt mental action!
	if (player.mroundtime > 0) {
		echo("... wait " + Math.floor(player.mroundtime / 1000 + 1) + " seconds for your mind to catch up.");
		return false;
	} else {
		return true;
	}
}

function sonOfSephos() {
	// SO! This is gonna be the SUPER GAME-RUNNING FUNCTION. Yay! Its entire job will be to run interference on ROUNDTIMES, as well as keep an open communication with
	//		server-side scripts and the DB, which will handle the bulk of the game's multiplayer capabilities.

	// This runs every 20 MS, currently, so bear that in mind! May have to tweak that down the road.

	// ROUNDTIME update!
	if (player.roundtime > 0) {
		player.roundtime -= runtime;
		var rtratio = (player.roundtime / 10) / player.rtmax;
		document.getElementById("rtnum").innerHTML = Math.floor(player.roundtime / 1000 + 1);
		document.getElementById("currentrt").style.width = rtratio.toString() + "%";
	}
	if (player.roundtime <= 0) {
		player.roundtime = 0;
		document.getElementById("currentrt").style.width = "0%";
		document.getElementById("rtnum").innerHTML = "0";
		document.getElementById("currentrt").style.border = "0px solid black";
	}
	// MENTAL ROUNDTIME update!
	if (player.mroundtime > 0) {
		player.mroundtime -= runtime;
		var rtratio = (player.mroundtime / 10) / player.mrtmax;
		document.getElementById("mrtnum").innerHTML = Math.floor(player.mroundtime / 1000 + 1);
		document.getElementById("currentmrt").style.width = rtratio.toString() + "%";
	}
	if (player.mroundtime <= 0) {
		player.mroundtime = 0;
		document.getElementById("currentmrt").style.width = "0%";
		document.getElementById("mrtnum").innerHTML = "0";
		document.getElementById("currentmrt").style.border = "0px solid black";
	}

	return;
}

/*

RIGHT NOW... I want to work on setting up having the world set up. This WILL require a database to act as a central repository of "everything that's happening right now."
	- Rooms, with their associated stats (which are detailed just a little bit below)
		- Maybe follow verb format... "000000" where the first 3 are Area ID and last 3 are Room ID (within said area).
	- All SNPC's
	- All players
	- All critters
	- All items!
So how are we to accomplish this? BRAINSTORM TIME!

Everything is held in the database. It may or may not be possible to have the world "running" when nobody is playing; it's technically possible, though I'm not sure if something
	like that is outside the scope of this particular game. Hm. Research a little bit more. (Research Complete: CRON JOBS, yo)
We already have a looping fxn that can include a server check within it.
	- The DB for every given room will include 'messages,' so maybe each player can have a 'current room time index' var that checks against the info in the room's DB and then
		gives the player all the info that's happened between the last timestamp and the room's latest timestamp, updating the player's timestamp in the process
	- Changing rooms would reset the player's room timestamp variable? No; instead, immediately set to the new room's current timestamp
	- Like a deli counter, I think we can use a 'looping' time variable, from (for example) 0 to 999 and back to 0. Enough time will elapse in normal conditions that there
		should be no scenario where the requests to the DB could trip over a "lapped" time situation.
	- Each player's browser JS will look at their current room and ping an NPC-prodding script for that room at regular intervals.
		- Secondary to that, an 'area' script can be pinged periodically as well, to apply basic decision-making for NPC's in the area, as well as spawn mechanics.
		- Alternatively, if we can get a script running on its own merrily, it can handle all of this intelligently at its own intervals, thus only needing to compute
			on rooms from the player's perspective with high frequency, leaving less overall processing load for unused or unlooked at areas.
	- The "room message data" will have to be scrubbed clean at intervals lest we hit a hard limit on database length. It can be safely scrubbed anytime nobody is in a room, as well
		as in an ongoing basis (at any given time we should have a pretty good idea of what is "older room output data" to scrub).

DATABASE: sonofsephos
	TABLES:
	- ) map
		- all of the rooms in the entire woooorld
	- ) characters
		- all your stats and swag and character data
	- ) all active agents (SNPC's)
		- guildleader, non-PC characters running around
	- ) active mobs
		- all them goblins and trolls and sprites and hogs, oh my!
		- inclusive of stuff like "AI Type" and "current actions" (state its in, like cautious or searching or hunting or meandering) and blocking (can't go west, goblins in the way!)
		- they can basically always exist in the DB, where they repopulate at a steady clip within an area
	- ) mobprints
		- contains the blueprints of every mob, which a script can merrily reference for building new mobs of a given type
	- ) worldview
		- keeps track of various sundry things such as the weather, time, months
		- can also be used to keep a track on critter/mob populations
	UNPACK A TABLE...
		chardata
		- uname, pword, charname, charrace/age/features, stats, skills, spells, abilities, talents, whereat, health, state (RTs and such)
			... skills: RANK (3), % to NEXT RANK (2), % of EXP POOL (2)
			... health includes VIT (3), ATTUNEMENT (3), all bodily injuries external and internal (52 slots)

BODY LIST!
Right eye, left eye, head, neck... 4 (plus internal to 8)
Chest, back, abdomen... 3 (plus interntal to 6)
Right arm, left arm, right hand, left hand, right leg, left leg... 6 (plus internal to 12)
... 26 total body parts to register injury, so I guess 00 is fine and dandy and 99 is ALL MESSED UP! Maybe wound is first and scar is second?
52 memory slots fo' body parts then!



CODESTORM!
- ) THING: Think of "special hooks" like GIVE BRANCH TO MAGS. Let verb targets have unique responses to verbs?
	- Maybe a "verbcheck" for verbs that interact with targets, pulling any special conditions or results from the target.
	- ALSO, special hooks that can be added by certain spells or items; for example, a spell that turns your WAVE into a deadly attack :P

Other ideas/next steps: 
	- "Room message board" in real time to project actions, so browser says "You do this," database for room adds "Dek does this" and does a push to all relevant player browsers.
		- Two ways I can think of: one, to just have a relatively high refresh rate to check if moar room data needs to be shown; two, research and see if you can make the server 
		"nudge" the browsers of participants? Hm... that MAY be possible??
	- Various HUD elements: RT bar, body position, compass, right/left hands, health, attunement, fatigue, weather, environment type, area name [Big Place, Wilderness]
	- ROOM DATA: needs description, agents inside, items inside, mana levels, exits (and which areas those exits link to), size, forageables generic, forageables specific, roomlog, spawnables, 
		aaaand possibly for the future (Moongates!) you can set the x/y/z coords of a room so everywhere has a distance relationship.
	- Unique interaction objects: objects that respond specially to verbs (GIVE BRANCH TO MAGS)
	- Command queue memory, up to 10 commands back
	- Hm. Inventory management.
	- Stats! Skills!
	- Core Data: name, class, race, stats, health, features, location, etc. ... also POSSIBLY inventory, though that might need its own table ... options, such as RT color
	- DualPrep: unlock preparing two spells at once (from same type, like double ward or double target), blend into a single cast! NEAT!

I think, right now? 
1) Server-populated rooms with prototypical mobs that start to do more as I advance the code.
2) Inventory management.

*/