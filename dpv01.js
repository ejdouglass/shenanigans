/*
MASTER NOTES FOR THIS FILE

1. VERY RELEVANT NOTE RIGHT NOW: Apparently trying to use drawImage() BEFORE the source image has finished loading will, uh, either not work or break the world.
	... sooo, between those two lines above, you can throw in a
	img.addEventListener('load', function() {
		//drawImage statements go here
	}, false);
		- or something along those lines. Basically, find a way to pre-load all the images you need, or make sure they load before you try to do anything with 'em.
	
	Kiiiind of brute-force fixed it, in that the page refreshes 30+ times a second, so once the image loads, it's there, even if it's not there on the first page load. Ha. :P

ISSUES: 
1. Scrolling right (there is no real down or up scrolling yet, so likely somewhere in there too) waits until a full tile is in view before drawing it properly.
	- I think this is an artifact of the fact that we're actually just rendering the main screen, like, a ton. Nothing is being rendered "off-camera."
	Figuring out how to do this will probably fix this particular issue.
	- With a larger map, turns out the right side, when not fully rendered to the next column, gets "stuck" there and causes some image bleeding. Not great!


X. Here's one idea: define a global object with methods that load (fetch all relevant assets), initialize (populate and divvy up variables), and render (draw the world around you).

For example:
var game = {};
game.load = function() {

};
game.init = function() {

};
game.render = function() {

};
*/

var moving = {allowed: true, left: false, up: false, right: false, down: false};
var timing = setInterval(timekeeper, 30);

function timekeeper () {
	if (moving.left == true && camera.x >= 5) {
		camera.x -= 5;
	}
	if (moving.up == true && camera.y >= 5) {
		camera.y -= 5;
	}
	if (moving.right == true && camera.x + camera.width + 5 < camera.mX) {
		camera.x += 5;
	}
	if (moving.down == true && camera.y + camera.height + 5 < camera.mY) {
		camera.y += 5;
	}
	render();
}

var canvas = document.getElementById('gamescreen');
var ctx = canvas.getContext('2d');

var terrain = new Image();
terrain.src = 'dumbterrain.png';

//Unnecessary now because all the maps live in JS. Eventually this will become relevant as we pull map arrays from the server, though. 
var nowmap = {};

//Gotta define where we are. And who we are! First variable: nowpos, the current position of the hero, around whom the map will render.
var me = {nowpos: [0,0]};
//The above would be in pixels, not tiles. :P Though I think everything is pretty much in pixels at this point.

//For now, maybe we can do "grassland, forest, hill, mountain, shallow water, deep water, road"...? Sure. Snow and sand and jungle and etc. later, too.
//We can have different movement speeds, mebbe. Hills are slow. Mountains impassable. Shallow water impassable without help? Forests slow-ish. Roads FAST. Zoom!
//...
//Our game window is currently 1000px wide by 600px tall, meaning with our 50px blocks we're essentially looking at 20 tiles wide and 12 tiles tall.
//So, for scrolling and windows and shiz, be sure to make it wider and taller than that!

//TESTING: We'll try 0 is grass, 1 is hill, and 2 is water
var worldmap = {
	cols: 30,
	rows: 15,
	tsize: 50,
	//Hi! I can be a ONE-DIMENSIONAL ARRAY! Neato! Though there may be strengths to using two-dimensional arrays, as well. Explore that later.
	tiles: [1,1,1,1,2,2,2,2,2,1,1,1,1,2,2,2,2,2,1,1,1,1,1,2,2,2,2,2,2,1,
			1,1,1,1,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
			3,1,1,2,2,2,2,1,1,1,2,2,3,3,3,3,2,2,2,2,1,1,1,1,1,2,2,2,2,2,
			3,3,1,1,2,2,1,1,1,1,1,2,2,3,3,3,3,3,2,2,2,1,1,2,1,2,2,2,2,1,
			3,3,3,1,1,2,2,1,1,1,1,2,3,3,2,3,2,3,3,3,2,2,2,1,1,1,2,2,1,1,
			3,3,3,3,1,1,2,1,1,1,3,3,3,2,2,3,2,2,2,3,3,2,2,1,1,1,2,2,1,3,
			3,3,3,1,1,2,2,1,1,1,1,2,3,2,2,3,2,2,2,2,2,2,2,1,1,1,2,2,1,3,
			3,1,1,3,1,2,2,2,1,1,1,2,3,3,2,3,3,3,2,2,2,2,2,1,1,1,2,2,1,3,
			3,1,1,3,1,2,2,1,1,1,1,2,3,3,2,3,2,3,3,2,2,2,2,1,1,1,2,2,1,3,
			3,3,3,3,1,2,2,2,2,1,1,2,3,2,2,3,2,2,3,3,3,3,3,1,1,1,2,2,1,3,
			3,3,3,1,1,2,2,1,1,1,1,2,3,2,3,3,2,2,2,2,2,2,2,1,1,1,2,2,3,3,
			3,3,3,1,1,2,2,1,1,1,1,2,3,2,2,3,2,2,2,2,2,2,2,1,1,1,2,2,3,1,
			3,3,3,1,1,2,2,1,1,1,1,2,3,2,3,3,2,2,2,2,2,2,2,1,1,1,2,2,3,1,
			3,3,3,1,1,2,2,1,1,1,1,2,3,2,3,3,2,2,2,2,2,2,2,1,1,1,2,3,3,1,
			3,3,3,1,1,2,2,1,1,1,1,2,2,2,3,2,2,2,2,2,2,2,2,1,1,1,2,3,3,1], 
	//Currently follows 0-index rules, thus what you'd normally read as, say, column 3 row 3 would actually have to be getTile(2,2), which would properly yield index 18.
	getTile: function(col, row) {
		var tileid = this.tiles[row * worldmap.cols + col];
		var tilecoords;

		//This works ok for now, but is absurdly simplistic. Eventually we're gonna wanna store these coordinates per map and have this function grab them dynamically depending
		//on the loaded currentmap.
		if (tileid == 1) {
			tilecoords = [100,0];
		} else if (tileid == 2) {
			tilecoords = [150,0];
		} else if (tileid == 3) {
			tilecoords = [100, 50];
		} else {
			tilecoords = [0,0];
		}
		return tilecoords;
	}
};

var camera = {x: 350, y: 0, width: 1050, height: 650, mX: worldmap.cols * worldmap.tsize, mY: worldmap.rows * worldmap.tsize};

function render() {
	var startCol = Math.floor(camera.x / worldmap.tsize);
	var endCol = startCol + (camera.width / worldmap.tsize);
	var startRow = Math.floor(camera.y / worldmap.tsize);
	var endRow = startRow + (camera.height / worldmap.tsize);

	var offsetX = -camera.x + startCol * worldmap.tsize;
	var offsetY = -camera.y + startRow * worldmap.tsize;

	for (var c = startCol; c < endCol; c++) {
		for (var r = 0; r < worldmap.rows; r++) {
	    	var tile = worldmap.getTile(c, r);
	    	var x = (c - startCol) * worldmap.tsize + offsetX;
	    	var y = (r - startRow) * worldmap.tsize + offsetY;
	    	//console.log('Current tile is ' + tile);
    		ctx.drawImage(
	        terrain, // image
	        tile[0], // source x
	        tile[1], // source y
	        worldmap.tsize, // source width
	        worldmap.tsize, // source height
	        Math.round(x), // target x
	        Math.round(y), // target y
	        worldmap.tsize, // target width
	        worldmap.tsize // target height
      		);
		}
	}
}

window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key == 65) {
		moving.left = true;
	}
	if (key == 87) {
		moving.up = true;
	}
	if (key == 68) {
		moving.right = true;
	}
	if (key == 83) {
		moving.down = true;
	}
}

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key== 65) {
		moving.left = false;
	}
	if (key== 87) {
		moving.up = false;
	}
	if (key== 68) {
		moving.right = false;
	}
	if (key== 83) {
		moving.down = false;
	}
}

function animate() {
	/*
	ANIMATE A THING
	So what do we need...
	- What object/agent/etc. are we animating
	- Image source
	- Number of frames
	- Length of each frame
	- Proper sprite slice, source and destination for every frame
	- Repeat/no-repeat + what to do next
	- IDEA: Every animated object can have an "animation state" variable that indicates what it's currently doing, as well as a "animation possibilities" collection
		that will help reference all the variables above that animate will need to execute them

	... basically, if it is a repeating situation, we'll probably use setInterval. Otherwise, setTimeout for a single-run?
	*/
}

function scoot() {
	/*
	MOVE A THING
	Basically a way to move, say, an agent from one spot to another. Doesn't collision-detect; this function's SOLE purpose is to move a thing from where it is to somewhere else.
	Should be pretty flexible, ideally, if I build it well. Needs to know:
	- Where are we moving to
	- How fast are we moving there
	- A way to influence a (global?) variable to indicate scooting is done
	*/
}

/*

LOADING AREA MAP:
1. The underlying map with base level sprites, i.e. forest and plains and roads and whatnot
2. Object map, i.e. treasures or towns or caves or other interactable nodes, a layer above the previous
3. Agent map, i.e. monsters or people, which travel, probably at equal layer with #2
4. Bump and movement map: a final derivative data collection that is the master guide for where you can move, how fast, etc. 
	... gonna have to figure out "dynamic layers" later so that more "foreground" objects can hide more "background" objects, though right now we're so blocky
	it hardly matters. Important going forward after that, though!
CONSIDER: Having seperate tilesets, so that "0" means one thing in the world tileset, and another in the rustic town tileset.

5+. We can also have other further derived or partially derived maps, such as vision maps for agents, hearing maps, foraging maps, etc.


DRAWING SPRITES THROUGH CANVAS
When using outside images and sprites, like we will be, it's a two step process:
	1. Get a reference to the image (prolly URL on local server or elsewhere)
	2. Smack that image down with the drawImage() function.

Looks like what we'll want to do is:
var img = new Image(); ... what a handy constructor!
img.src = 'myImage.png'; ... or whatever, obviously. :P

RANDO FUN FACT: You can use frames from a video that is presented by a <video> element in the canvas. Hm. May be useful for PP! This works even if the video isn't displayed/visible.

Anyway, how to use drawImage()... you have drawImage(image, x, y) in its basic form.
	- As you'd expect, draws the CanvasImageSource specified by the image parameter at (x,y).
You can ALSO do drawImage(image, x, y, width, height), the final two variables being a handy way to SCALE the source image. Hmmm. That could come in handy, absolutely.

You can ALSO do slicing, drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight), holy buttballs.
	- Uh, we may need to do this. Because it slices a chunk out of a larger image file, which is... essentially entirely what a spritesheet is.
	- sx and sy are SOURCE x, y, or how far in the source file to move before samping. sWidth and sHeight are how large an area to sample from that start point.
	- dx and dy are DESTINATION x, y, or how far on the canvas to move the start point, and dWidth and dHeight are the scaled size to put it to.
		- Since we'll be building the sprites to fit snugly, ideally, we can ignore dWidth and dHeight MOST of the time. Probably.

Looking at MozDev, it looks like instead of redefining "img.src" every time, you can do something like... say, for a small galactic animation:
	var sun = new Image();
	var moon = new Image();
	var earth = new Image();
	sun.src = 'sunnysideup.png'; ... and so on with moon and earth.




DP IDEAS BRAINSTORM AREA
-) Some combat stats: 
	ATTACK STATS, broken down into precision/accuracy and power/damage
	DEFENSE STATS, broken down into armor/resilience and defenses/avoidance (parry/block/dodge/etc.)

	Combat spitballing: 
	-) Hits: Miss, Graze, Solid, Critical
		Miss: No damage done, no effects applied (I'm looking at you, FFBE :P)
		Graze: Mitigated damage, damage capped (nonfatal unless you're already screwed), mitigated effects, effects capped (maybe)
		Solid: Standard damage, standard effect range
		Critical: Maximized damage, maximized effect
	-) In an attack, attacker's precision is contested against defenses (dodge, deflect, block). You get one of the above results.
		- Blocking works a little oddly: it's more potent per point than other defenses, but mechanically is a little different: unlike a perfect dodge that will always reduce
			the attack to a MISS, a perfect block caps the attack at a GRAZE but confers a substantial armor boost and mitigation effect depending on the particular shield.
		- Essentially, if you're going against something really freaking scary or powerful, and it's got mad skills over and beyond you, bring a shield and a prayer.
		- After that, if it's any kind of hit, the raw power of that hit is measured against the defender's armor (with any pertinent shield bonuses).
		- The hit is now either totally dissipated or did something. Calculate accordingly!
	-) Threat Range: A dagger has less reach than a spear; the amount of space you can "control" is different. Mechanically, this does a thing!
	-) Styles: default styles for different weapons!
		- Fist: Almost everything is either 1 or 5 Aorbs. Build combos and conditions. Very fast animations with low windup and low recovery.
		- Axe: Almost everything is at least 2 Aorbs. Big, meaty cleaves. Focused on spinning, and early on you can build up a localized AoE. Boomboomboom!
			So-so windup, slow recovery.
		- Sword: Versatile balance, with a wide array of 1-3 Aorb maneuvers. 
		- Spear: 
		- Hammer: 
	-) Windup and Recovery: lag before an attack starts and lag before the next maneuver can occur, respectively. CHAINED moves can smoosh these two together favorably.


	I dunno, how long combat should be? Smickity SMACK! How do we math it!
		- Let's start with a slimmity slime! Quick fight! Slimes have low armor and no block and parry, just a little dodge. 60 HP! Or something. Let's start with that.
		- 60 HP, each hit should do... back up, let's talk about...
		- AORBS! How fast do they regen by default? Higher AORB cost = more flexibility or power. 1 AORB is probably gonna be quick, 1x damage. 1x damage is meant to be pretty poor.
		- So, I dunno, like 4hp damage for a base hit? 1/15? You could just spam basic attacks and win. Which is fine. :P
		- Regen rate of AORBS: 5 seconds from 0 to 1, 3 seconds from 4 to 5? Something like that. So you can measure out your hits, whap, whap, whap. Or go full hog!
		- Downsides of going Whole Hog: you get your swag back more slowly. Upsides: you do unique or more damaging things. 

	WEAPON-TOOL:
		- Damage Mod, where basic force generation is pretty stable. You hit something, force is equal to about 4HP based on above to start.
		- Should damage be a magnitude modifier (x1.3 for example) or raw (+3 damage)? Depends on how stuff scales, I guess. Maybe even both!
		- Also depends on stats. So if strength is 37, what does that even mean? What's the range? Maybe DR-ish. Starting out you're in kind of a D&D range.
		- So maybe starting range... 10 is pretty low, about as low as a functioning adult should have. Mid-20's is on the high end to start off.
		- Anyway... math it up! So you're starting out and you're Combat 1. Your weapon of choice is at +2 precision. Your agility is +2. You have 4 precision!
			Slimey has 2 dodge and nothing else. But since things don't scale multiplicatively, doing 4/2 or whatever doesn't seem sensible. Hmmmm.

	OK! Caffeine on a Saturday! Latest thoughts!
		- Old system refined: enemy HP defined in terms of "hits" rather than "HP." The difference is that instead of rapidly growing massive numbers, you can keep the numbers
			much more bounded, and then measure based on DPS. So, say a Slime has 30 seconds' worth of HP at "expected" at-level DPS. 
			- So if you're just using single-aorb strikes, it's expected you'd take about 30 seconds at-level to take one slime out.
			- We can then extrapolate this into "hits" and then multiply by like 10 to get a more palatable number (mitigating decimal action).
			- Going further: let's say base DPS is 10 for normal strength and weapon at level 1, so then a slime would have 30x10 = 300 "hits." 
			- I'd say 1 DPS and 30 hits, but if we want to have strength and skills and weapon to add, we'd rapidly get into situations of 1.1 or 1.37, and I'd rather just
				multiply by 10 and get 11 DPS or 13 DPS, though we still then have the trailing .7 that I personally don't like to just ignore or round, because both mean
				you can get better without getting better. Eh, may be a necessary truncation? Since the 13.7 would be truncated, but some moves would multiply that base damage,
				so it'd still be advantageous to have that .7 lurking for multipliers. Ok, it's all good in the hood, yo.
		- From Fortnite: quick, crisp status effects... armor break, shield snaps in half! Orange! Straight effect.
		- From FFXV: BREAK status, staggered and vulnerable boss, now's the time to cash in!
			- "Vulnerable" status where you can pull off finishing or risky moves? Esp. intended for tough fights, above-level fights, or generally bosses.
			- "Vulnerable" could be caused by different conditions, though some commonalities with some feedback could help players figure out how to hobble something.
		- So, then, maybe base DPS is 5, base weapon DPS is 5, so that's how you get your default 10. So, many weapons at base level would be all like "damage 5,"
			and maybe balance of your own base DPS would be based on weapon type as well, like "BIG HAMMER: base dps 100% from strength, 0% from anything else."
			That would allow stuff like "rapier: base DPS 100% agility" for... hm. This may be overcomplicating. Set it aside for now.
		- Barehanded fighting would probably be its own weapon slot. Is it bad enough to just let it have half the base damage of any other starting weapon? Eh, I was gonna 
			say no, but actually, having to take 1 minute to kill a slime instead of 30 seconds seems good enough, especially since untrained would have no special moves
			to speed that along (since most of active DPS will come from prudent application of aorbs, rather than just base DPS).
		- Relative armor or absolute armor? Hm. So, let's say damage is 5 and enemy armor is 5. I think it's "reasonable" they cancel each other out and you're left with
			just your base DPS. But how does it scale? What happens when your opponent has 10 armor? Do you do 0 DPS? That's bonkers. I mean, he has twice as much armor
			as you have whacking power, but that would make scaling real weird in the beginning. Well, assuming it scales up quickly like that. I guess a "base armor" is 
			not such a terrible idea. 

	SKILLS AGAIN: 
		- What are the ranges for skills? Address it in EJD!



	POTENTIAL: in stars, 0 - 5 + omega + infinity + double infinity :P
	So every weapon and tool have a "template," with basic attributes based off that template. 
	Quality is within that range; default is "normal quality," with a few sub-quality options, and many super-quality options.
	
	Attributes are added piece by piece. We can either have the pieces be locked behind quality barriers (i.e. target must be two stars to add this two-star piece), 
		or perhaps have a separate scale that is modified by the piece's quality (i.e. ATK+10 on a one-star, ATK+15 on a two-star).
		- If the latter, instead of a star-gate (ha!), we'll need maybe craft-addition-trees, so instead of a total grab-bag, you might need to be a little choosy
		with your upgrades, like "sharp edge" unlocks "razor edge" (pierce) or whatever.
		- Templates can also modify receptivity to upgrades, like "piercing receptivity" and whatnot. Increased stars, then, modify base stats a little, and maybe
		receptivity far more, since stars = potential, rather than raw starting power.

	IDEA: Upgrade slots! Like, you craft "basic metal greaves," but it could have a "padding" slot available. Something like that. CONSIDER IT. CONSIIIIIDERRRR IIIIIIIIT
	IDEA: INITIAL SLOTS! Stuff you can pick during creation. Consider "short sword," with the initial slot "minimalist" that reduces the item cost for creation (like
		from 40 volume metal to 32). The initial slots can be more based on crafter skill than actual template.

	INTERESTING CONCEPT: "For almost all of human history, knowledge was held by gatekeepers, mystics, wisemen, prophets, sages, scholars, kings, and gods." Regular people
		didn't have access to lore. Beyond learning social customs to get along with your particular community, if you wanted to learn a specialized skill or body of
		knowledge, you required somebody's blessing, whether it be an apprenticeship all the way up to rites/rituals/initiation. 

	ACHIEVEMENT IDEAS:
	-) Kill X Slimes
	-) Perfect Fight a Slime
	-) Generate X Heat ("Hot Hot Heat")
	-) Walk X Tiles

	WORLD IDEAS:
	-) Maybe make the world map a little bit Zelda-like? Like, original Zelda. Using tools to cross obstacles and such. Slap down a ladder to cross 1 tile of water, etc.
		- Then make these mostly craftables, consumables, etc. rather than hard "Beat Level 1 to progress" situations.

	ITEMS AND BASIC CRAFTING SPITBALLING:
	-) Wiggly Worm: basic muddy forageable
	-) Gummy Gel: basic slime drop
	   = Gummy Worm: basic craft: wiggly worm + gummy gel

	HARVESTING:
	-) Button mash with another button prompt or reticule or whatever that does enhanced effect for faster harvesting?
	-) During more skilled work like forging, IF we minigame it, maybe have button prompts fix damage done by previous failed work during the current piece?

	TRADING: 
	-) Supply and demand negotiate prices
	-) Can travel in bulk with trading caravans and the like (Medievia?)
	-) Bartering skillzzzz
	-) Local areas can sort out what they have a lot of, what they use a lot of, what they need, what they want, etc.

	FORAGEABLES:
	-) Insects and such
		- Wiggly Worm: muddy vibrant areas
		- Bellicose Beetle: temperate to cool forests
		- 
	-) Herbs! Greenery!
		- Herbs
		- Moss
		- Roots
		- Leaves

	TRIVIAL PURSUITS :P
	ALCHEMY: 
	-) This is an old idea (from me), but basically every alchemy-ready item (and most items can have hidden alchemical attributes!) has "components" and "states."
		- Basically this means that a component can be "Heal 20HP" and state can be "bound to water." So, to access it fully, you need to dessicate that item!
		- A single state can bind multiple components, so that "water-bound"-edness could bind both that +20HP as well as a "sleep" effect.
		- Consuming it raw could make you heal a bit but also sleepy. Drying it out would reduce the water, meaning the original amount of item would get closer to the full
			20HP heal, but also more of the sleep effect, as well.
		- Or, perhaps, have sort of puzzles: everything is a component, such as "water" and "healing" being different types of components, with water acting as the gatekeeper
			for the end result of the item. There's only so much potency to go around, so using different alchemical processes to distill the healing by uncoupling it with the water
			could yield X parts water and X parts healing, but each component could be like puzzle pieces, being destroyed or combined/altered depending on how you try to
			solve-ify it.
	-) The obviousness of these alchemical properties depends on skill and item. For example, a hunk of iron would have various qualities for being heated and shaped into
		various tools, but creating a steel alloy is basically a chemical process, which in this world, is ALCHEMY! Whee!
			- Anyway, the parts of a medicinal plant would all have much more obvious qualities, which could be discerned by a trained eye much more easily than someone
				staring at a hunk of ore and trying to divine its properties in a potion. (Yeah, you can put iron into potions. Why not? :P Or distill some helpful properties
				from the ore through the process mentioned above to recombine into other products.)

	FARMING: 
	-) Everybody loves casual farming! :P
	-) Farming includes growing crops and raising animals for various purposes.
	-) Genetics!
	-) Do we want to futz around with soil quality and such? MEBBE.

	FIGHTING:
	-) Kinetic, crisp, and colorful! Splashes of light and sound and color! (Not necessarily always bright, but crisp and flowing. Snap! Crack! Satisfying!)
	-) Tool thoughts: weapon specs, like "slicing," where it's super effective on low-armor targets, but severely nerfed by scale, plate, or heavy armor in general

	WORLDCRAFT:
	-) Your (rando gen?) starting world is YOURS. When you graduate from it, you go from singleplayer to multiplayer possibilities, and you get a crystal that encapsulates it.
		- Your world is something you can gain great control over. It has its own day/night cycles, it's a controlled single-player world by default. It doesn't have to "go"
		without you. You can set it to run or to freeze without you, once you gain basic control, and you can gain increasing crystal mastery from this, until you can start
		to seed and craft new worlds from crystals.

	NOTES ON PROTOJS
	- It's hard to keep scrolling around so much over there. We'll just keep notes here for now.
	- Anyway. Right now "player.update" is looping for one specific instance: walking around the world map.
		- We don't want to blitz through all these unnecessary variables if we're, say, in combat.
		- The GAME loop needs to switch to a new SCREEN and PLAYER update scheme when applicable.
		- The MAP can probably stay as-is; we can define a separate function for SCREEN for other applications, like CRAFTING, FIGHTING, etc.
		- THUS, we need a "Master Switch" in the core Player variables that is set to "what situation I'm in right now," and the UPDATE fxn will look at this and run
			the proper looping from there.
	- UPDATE the MAP fxn to have a currentmap prototype that holds all the current worldmap shit, a loader fxn for all the goodies, and all the current prototype fxns.
		- All the code currently calls the global WORLDMAP object, so after you implement the above, you can gradually switch to the currentmap version and see how it goes.
		- ERROR: Since this stuff is called in the Player area, I'm finding that any reference to the super-hidden MAP prototypes returns undefined every time.
			I can't figure out a handy modular way to integrate these critical functions without cheesing it with the global worldmap.
	- BUMP: Scrutinize the current bump logic and see where we can improve the X/Y clipping.
	- LOL: I just broke the game with the pause functionality! The pause doesn't actually pause EVERYTHING. Hahahahahaha. Well, we'll have to rejigger it anyway.
		But basically you can hold down a direction, pause, unpause, and 'teleport' past any obstacle. Fun!
	- Some of the PROTO functions assume the entire game is that one first map you're on. Neato! But it also means you'll have to rejigger it so that when you enter a new area,
		or when you switch modes, you'll have to change some of these things to fire off again, rather than once, forevermore. Current-map generation is currently a mess that way.
	- To make a new map load up, basically look at everything the initializing-ish function is doing, and find a way to encapsulate that in a later-stage function.
	- Experiment: since all my JS is just gonna be in-house, I can probably de-anonymify the PROTOJS file to see if it makes it easier to work with and communicate across areas.
		Be careful, though. Copy the whole file into a new one and use that. Don't touch PROTOJS until you're sure the new code doesn't break the world.

	GAME DEV IDEAS 7/25/17
	- The boss of the tutorial area, currently named Wreath (ha) is a Dark Knight dude. Make more story for him! Everybody will end up fighting him, so why is he present
		in every iteration of every splinter world you can start in? Hmmmm! Also he didn't start as a Dark Knight. Heck, maybe he's a good guy looking fella.
	- You beat him, you take his (now broken) sword. It becomes a part of you, a unique class of items! Like permanent materia, such as the one you start your class with, 
		you can go all LoDragoon (or any number of alternatives) where you can 'summon' this item for awhile at a time. It merges with your actual weapon and imparts qualities,
		and you can upgrade it to fit your style with crystals. Sort of an 'omega 1-star,' separate from mundane 1-star.
		- This broken sword is the key to your superpower of moving between worlds, where any patch of Wildness becomes a potential portal into a crystal world. To begin with,
			it is the pathway back to your own little world!
		- OH! Super Souls! Every super item that binds to your character is like an esper or zanpakutou. They gots personalities, yo! You can SUMMON them, potentially!
	- A mysterious figure guides you in your Tutorial World, as well as the Shared World. How mysterious!
		- They pop up when you defeat Wreath, which shatters his sword and the world simultaneously. Grabbing it pulls you into the Shared World. The Mysterious Figure gives you
			some insight and off you go. Part of the tutorial is getting to the first shared town, which is far bigger than anything you saw in your little world (by default).
		- After this you're given the tools to return to your Tutorial World, whereupon you're given world-building tools, building cities and towns, the process by which
			also lets you do so to a degree in the Shared World. Neat!
	- FORGING: Forging styles! DUAL HAMMER YO. Influence the final outcome of your piece! Crazy!

	GENERAL MINIGAME IDEAS
	- Mash two buttons in alteration to influence a bar that needs to stay within a certain range for a certain amount of time
	- Rhythm game (original battle idea) where you have to hit marks as they float into a certain target range
	- Ticker moves back and forth among a field of possible outcomes, time it properly!

	GENERAL BATTLE TOMFOOLERY a la SB:
	Just ideas. Go!
	So, attacker has precision and potential damage. Defender has avoidance and armor.
	I want to keep ranges pretty tight. No starting at 120 HP going up to 9999 HP (at least not in any short order). Tigther!
	The big variance then will be less pure power of skills and weapons and stats and more skill choice and timing as well as weapon suitability.
	Some attackers will be highly precise, mitigating dodging and blocking;
		some attackers will be piercing, mitigating high armor;
		some attackers will be staggering, mitigating high speed and Aorb generation;
		some attackers will be breaking, shattering different attributes for the benefit of all attackers;
		and so on.
	So, precision scales vs. blocking/dodging/deflecting, and
		power scales vs. armor.
	In the beginning, weapons don't really differ a ton in stats. Any weapon you're good with is fine. Their movesets are bigger differentiators.

	We can extrapolate move value based on 1 Aorb costs and Aorb regen rates (which are based partially on speed).
		- The basic regen rate for 4th-5th Aorb (basic actions at full speed) will be considered the baseline.
		- Calculate assuming equality by default: precision matching avoidance, power matching armor.
	Also, Aorbs can be "stolen," discounted, etc. by moves. There are also "conditional Aorbs" that pop up with different powers, such as "fury Aorbs" that are consumed
		for aggressive actions BEFORE your normal stash is touched, or "tactical Aorbs" that offset tactical maneuvers.
		- Gonna have to be a little careful with the scope of these so things don't get too cluttered.
		- Maybe have the conditional Aorbs decay at a set rate (that can be modified). Having every random new Aorb have its own decay rate would be hard to express to a user.

	FOOD! Like the Miiverse thing. Food permanently increasing stats, slowly, somehow. I like the idea! Ponder on it more.

	
*/


/*

8/18/2017

Ok, rejiggering everything for PORTFOLIO GAMES.

The DP is basically a game of games. Basically all this shiz is available from the get-go. Have fun!
-) Fighting (Aorbs and strategy, crisp 'n clean)
-) Fishing (primarily reflex-based trying to capture a darting fish inside of a capture range)
-) Farming (in basic levels just plant, water, and harvest; more advanced Rune-style soil care; animal husbandry as well)
-) Building (you get your own little land for some reason; gather some goods, build some goodies!)
-) Exploring
-) Mining
-) Woodcutting
-) Crafting (alchemy, smithing, general crafting)
-) Chain Chronicling (siege and defending battles, traveling with your 'army' to claim and expand territory)
-) Dungeon-diving
-) Storymode adventure time

You start in a little village with some peeps. 

/*