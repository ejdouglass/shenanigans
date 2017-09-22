/*

CURRENT ISSUES:
1. There's stuttering in traversal. Seems to be at regular intervals regardless of speed, so it's a rendering stutter. Can we improve this?
	> So, the day after I wrote the above, stuttering is gone, and I haven't substantially changed anything. I did restart the computer, though (well, it restarted itself).
		... that may be relevant? I dunno. Anyway, scrolls with seamless beauty now. Super happy with that.
		... if it starts stuttering again, I'll see if restart helps it out again, and if so, we may be onto something.

2. If you don't preload the image in the HTML, it loads blank white screen ~10% of the time (presumption is HTML loads too fast, so the game quickly attempts to load a map
	off an image file that doesn't load in time, and unlike my setInterval takes before, it doesn't have the ability to brute-force this step :P).
	> So, for future maps beyond this test one, it's necessary to preload the image somehow. Play with CSS/JS combos that will allow this!
	> EEEENTERESTING: On page *refreshes,* cached image is enough for 100% load effectiveness...
		!! HOWEVER, on fresh click after a new window is made, first load is blank again. Gotta get around this!
		:) I think the image.onload is gonna be our answer to this. Maybe just have it run during intialization for whatever the currentmap is, if we go minimalist?
		Either way, format is something like:
		var img = new Image();
		img.onload = funkshun;
		img.src = "myImageFile.PNG";
		function funkshun() {
			// whatever gets to happen now that we have a loaded image
			// likely either another function OR do the first part of the requestAnimationFrame here
		}
	NOTE: So uh don't forget to implement this! We still have load issues on the image.

3. Need a way to make sure the Game map generates and renders a map that's the right size. Right now I'm brute-forcing it. Future iterations need to match the loaded map's
	dimensions, which will require a bit of (admittedly pretty simple) math.

4. Not an issue yet, but realize that RAF has a funny hiccup: it'll slow down to negative one million frames if the user changes focus or alts away from the current tab.
	Thus, anything you want to keep happening in "real time" or close to it can't be happening in RAF, probably.
	This may help: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API (haven't looked at it yet)
	RAF is super for drawing, the best! But using times between RAF-calculated frames can cause some Time Travel, as well as some pretty apparently wicked wacky visual
		distortions, so be aware of it and try to plan around it early on.
	!! WATCH OUT !! : Modern browsers, like the latest Chrome? Yeah, they do this with Timeout and Interval, too. Just creep them to a craaaaaawl. So, you're gonna have to get
		snikkity with it to dodge around this particular issue. I'm thinking track the time since the last whatever, and if we're pulled to a super slow laggy doom crawl, we're
		probably un-focused on the game, so suspend everything until the user's back in the saddle.
	So: consider also looking into being able to check "is this in focus right now." That API above may help, or not, who knows. :P

5. Server interaction: communicating with the server is probably best done as minimally as possible whilst we're drawing? Smart server grabs every certain amount of time, 
	and keep most of everything local. Maybe a discreet little magic box that holds all the relevant "what I'm doing right now" data to be passed quickly to "save" progress?

6. Oh, how should I map entrypoints on the map to special things? Like a town or a cave?

7. OVERRIDES: right now you can hold down right/left at the same time and up/down at the same time and there's dominance. I prefer nullification! Fix it!

8. Just an idea here. However, to deal with "layering" on the Canvas, could we cleverly paint the absolute base layer, then draw stuff in a certain order so that overlaps happen
	properly? Hm! Maybe! This is either fairly straightforward or insanely complicated. Hopefully the former!

9. Need a map method that scans all the local grid points for the purposes of generating stuff like forageables or monster spawns or stuff like that

10. Need an "interact" setter - basically the player's current coords plus facing-direction. By default it'll be one 'space' ahead, but certain stuff could reach further, maybe.


*/
// Currentmap prototype will need cols, rows, tsize, source, maptype, tiles, tiles2, possible tiles3, agents, bump, interact, getTile, bumpTile, ...
// Tiles is base layer, tiles2 is overlay to that (trees on grassy terrain or water on grassy terrain or a town sprite), tiles3 would be treasures and fish and forage hotspots,
//    agents are people and critters, bump is a derived array showing where you can and can't walk, interact is derived array for entering/fighting/etc.

// Rando global variable for now, but later we'll have to load these in more cleverly.
// In the DB, each row could conceivably be another map's reference data?

var worldmap = {
			cols: 30,
			rows: 15,
			tsize: 50,
			source: "dumbterrain.png",
			//The below sets travel speed expectations. You can run and jump all over the place in exploration maps, but the world map is more of a steady slog. :P
			maptype: "world",
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
			bump: [], // Hoi! So BUMP will be a simple pass-fail check and is a third-derived map from TILEMAP -> OBJECTMAP. One object type is AGENT.
			// Returns the x,y coords on the Sprite image for the requested tile area.
			getTile: function(col, row) {
				var tileid = this.tiles[row * worldmap.cols + col];
				var tilecoords;

				// We might be able to be this dumb after all; every map object is gonna have all this info in it, probably. Uh,
				// that said, we can probably afford to make a prototype so we don't have to re-write this function into every map. :P
				switch (tileid) {
					case 1:
						tilecoords = [100,0];
						break;
					case 2:
						tilecoords = [150,0];
						break;
					case 3:
						tilecoords = [100,50];
						break;
					default: 
						tilecoords = [0,0];
				}

				return tilecoords;
			},
			// Returns the number that's in the given slot, so the base terrain "type" for current testing basic bump purposes. 
			bumpTile: function(x, y) {
				var tileid = this.tiles[Math.floor(y / this.tsize) * this.cols + Math.floor(x / this.tsize)];
				return tileid;
			}, 
			mapCoords: function(x, y) {
				var currentXGrid = Math.floor(x / this.tsize) * this.tsize;
				var currentYGrid = Math.floor(y / this.tsize) * this.tsize;
				return [currentXGrid, currentYGrid];
			}
};

// I haven't the foggiest how all of this works. But I THINK this just sets up RAF for various browsers.
(function(){	
	var lastTime = 0;
	var currTime, timeToCall, id;
	var vendors = ['ms', 'moz', 'webkit', 'o'];		
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = 
		  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}	 
	if (!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = function(callback, element) {
			currTime = Date.now();
			timeToCall = Math.max(0, 16 - (currTime - lastTime));
			id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}	 
	if (!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}	
})(); 

// Wrapper for the Game object's "classes", "methods," and "objects."
window.Game = {};

// Wrapper for JSClass Rectangle:
(function(){
	function Rectangle(left, top, width, height){
		this.left = left || 0;
		this.top = top || 0;
        this.width = width || 0;
		this.height = height || 0;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	}
	
	// The width and height are optional:
	Rectangle.prototype.set = function(left, top, width, height){
		this.left = left;
        this.top = top;
        this.width = width || this.width;
        this.height = height || this.height
        this.right = (this.left + this.width);
        this.bottom = (this.top + this.height);
	}
	
	Rectangle.prototype.within = function(r) {
		return (r.left <= this.left && 
				r.right >= this.right &&
				r.top <= this.top && 
				r.bottom >= this.bottom);
	}		
	
	Rectangle.prototype.overlaps = function(r) {
		return (this.left < r.right && 
				r.left < this.right && 
				this.top < r.bottom &&
				r.top < this.bottom);
	}

	// Add "class" Rectangle to the Game object!
	Game.Rectangle = Rectangle;
})();	

// Camera JSClass wrapper.
(function(){

	// Different axes for the camera. Can be changed for other projects.
	var AXIS = {
		NONE: "none", 
		HORIZONTAL: "horizontal", 
		VERTICAL: "vertical", 
		BOTH: "both"
	};

	// Camera constructor
	function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
	{
		// Position of camera (top-left coordinate).
		this.xView = xView || 0;
		this.yView = yView || 0;
		
		// Distance from followed object to border before camera starts move
		this.xDeadZone = 0; // min distance to horizontal borders
		this.yDeadZone = 0; // min distance to vertical borders
		
		// viewport dimensions
		this.wView = canvasWidth;
		this.hView = canvasHeight;			
		
		// Defines what axis the camera moves in.
		this.axis = AXIS.BOTH;	
	
		// Object that should be followed. Currently empty, of course!
		this.followed = null;
		
		// rectangle that represents the viewport
		this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);				
							
		// rectangle that represents the world's boundary (room's boundary)
		this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);			
	}

	// Note that the passed gameObject needs to have "x" and "y" properties (as current-area position).
	Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone)
	{		
		this.followed = gameObject;	
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	}					
	
	Camera.prototype.update = function()
	{
		// Assuming the target of camera-following exists, continue to track it!
		if(this.followed != null)
		{		
			if(this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
			{		
				// moves camera on horizontal axis based on followed object position
				if(this.followed.x - this.xView  + this.xDeadZone > this.wView)
					this.xView = this.followed.x - (this.wView - this.xDeadZone);
				else if(this.followed.x  - this.xDeadZone < this.xView)
					this.xView = this.followed.x  - this.xDeadZone;
				
			}
			if(this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
			{
				// moves camera on vertical axis based on followed object position
				if(this.followed.y - this.yView + this.yDeadZone > this.hView)
					this.yView = this.followed.y - (this.hView - this.yDeadZone);
				else if(this.followed.y - this.yDeadZone < this.yView)
					this.yView = this.followed.y - this.yDeadZone;
			}						
			
		}		
		
		// Updates the viewing box with the current xView/yView data.
		this.viewportRect.set(this.xView, this.yView);
		
		// don't let camera leaves the world's boundary
		if(!this.viewportRect.within(this.worldRect))
		{
			if(this.viewportRect.left < this.worldRect.left)
				this.xView = this.worldRect.left;
			if(this.viewportRect.top < this.worldRect.top)					
				this.yView = this.worldRect.top;
			if(this.viewportRect.right > this.worldRect.right)
				this.xView = this.worldRect.right - this.wView;
			if(this.viewportRect.bottom > this.worldRect.bottom)					
				this.yView = this.worldRect.bottom - this.hView;
		}
		
	}	
	
	// add "class" Camera to our Game object
	Game.Camera = Camera;
	
})();

// JSClass wrapper for the Player function/object thingy.
(function(){
	function Player(x, y){
		// IMPORTANT NOTE:
		// This represents the player's current position in the (current) map, not relative to the canvas he's living in.
		this.x = x;
		this.y = y;				
		
		// Movement speed in px/s. Currently hardcoded, but future iterations should have different speed options, esp. in exploration maps.
		this.speed = 300;
		
		// Render properties of width and height. These, too, may change based on area type? But nah, not for now. :P
		this.width = 50;
		this.height = 50;

		// First stab at an "animation" variable. For whatever the current animation is!
		this.timeline = 0;

		// May be a terrible idea, but heck. Anyway, 12 is up, 3 is right, 6 is down, and 9 is left. CLOCKS.
		this.facing = 6;

		this.actTile = undefined;
	}
	
	Player.prototype.update = function(step, worldWidth, worldHeight){

		var currentTile = worldmap.mapCoords(this.x, this.y);
		var newx = this.x;
		var newy = this.y;
		var propx = this.x;
		var propy = this.y;

		if (Game.controls.left) {
			if (!Game.controls.right) {
				newx = this.x - this.speed * step;
				propx = newx - this.width / 2;
				this.facing = 9;
				this.actTile = [currentTile[0] - 1, currentTile[1]];
			}
		}
		if (Game.controls.right) {
			if (!Game.controls.left) {
				newx = this.x + this.speed * step;
				propx = newx + this.width / 2;
				this.facing = 3;
				this.actTile = [currentTile[0] + 1, currentTile[1]];
			}
		}
		if (Game.controls.up) {
			if (!Game.controls.down) {
				newy = this.y - this.speed * step;
				propy = newy;
				this.facing = 12;
				this.actTile = [currentTile[0], currentTile[1] - 1];
			}
		}
		if (Game.controls.down) {
			if (!Game.controls.up) {
				newy = this.y + this.speed * step;
				propy = newy + this.height / 2;
				this.facing = 6;
				this.actTile = [currentTile[0], currentTile[1] + 1];
			}
		}

		var proposedTileX = worldmap.bumpTile(propx, this.y);
		var proposedTileY = worldmap.bumpTile(this.x, propy);


		// ** HERE ** : A function lovingly crafted to refer the currentmap to see if a BUMP should occur! Since valid tiles vary map to map
		// 				and possibly even based on, say, if you have a canoe.
		//				Then it can spit out proposedTileX and Y as result 1 or 0. 1 Walks, 0 stays.

	

		/*
			META TIME
			So we can divvy up the IF situations below, and possibly above, more granularly. Gnarly.
			- If you're only moving X-axis, disregard Y. And vice versa.
			- If X-move AND Y-move, go nuts.

		*/

		/* 
			OK!
			- This currently works PRETTY well. Rattling fixed, too!
			- Sticky widgets:
				- You can still blithely barrier-break along the Y axis if you're ONLY moving along the X axis
				- Likewise for clipping the X sides of barriers if you ONLY move Y
		*/
		if (proposedTileX != 3 && proposedTileY != 3) {
			// All is well condition
			/*
				We can probably eliminate the X-or-Y clipping bug if we add extra conditions. Maybe.
				So we're already in here where we've acknowledged that the new X and the new Y are totally technically fine!
			*/
			this.x = newx;
			this.y = newy;
		} else if (proposedTileX != 3 && proposedTileY == 3) {
			// X is ok and Y is bad juju, but allow just-shy-of-half-overlapping when moving up
			this.x = newx;
			if (Game.controls.up) {
				this.y = currentTile[1];
			} else {
				this.y = currentTile[1] + this.height / 2;
			}
		} else if (proposedTileX == 3 && proposedTileY != 3) {
			// X is bad and Y is good
			this.x = currentTile[0] + this.width / 2;
			this.y = newy;
		} else {
			// All directions invalid, no move allowed. However, allows within-cell upward movement for flavor.
			if (Game.controls.up) {
				this.x = currentTile[0] + this.width / 2;
				this.y = currentTile[1];
			} else {
				//Snap to current tile in a way I don't remember :P
				this.x = currentTile[0] + this.width / 2;
				this.y = currentTile[1] + this.height / 2;
			}
		}

		
		// Quick edge-of-the-map check. Snaps the player to the appropriate boundary/ies if the above transposition would put them out of bounds.
		if (this.x - this.width/2 < 0) {
			this.x = this.width/2;
		}
		if (this.y - this.height/2 < 0) {
			this.y = this.height/2;
		}
		if (this.x + this.width/2 > worldWidth) {
			this.x = worldWidth - this.width/2;
		}
		if (this.y + this.height/2 > worldHeight) {
			this.y = worldHeight - this.height/2;
		}

	}
	
	Player.prototype.draw = function(step, context, xView, yView){		
		// We still need variables for animation per object.

		/* NOWT
		
		Ok, time to figure out ANIMATION as a core concept. How does animation work? And how will we implement that here?

		HOW ANIMATION WORKS
		- You have frames of animation, each of which is played back-to-back at certain intervals.
		- In order for this to work, you need to have a 'timeline,' where you are on that timeline, and to fire off the next frame when the proper points are crossed on said timeline.
		- Timeline is a variable that can be attached to every animate-able thing.
		- If it lags, I suppose you have the option to just cancel the animation from the code? Hm.
		- For a game, there should probably also be a default position the character is in, and a default animation for that position.
			Ex: If the character is on the world map and facing right, their sprite should be facing right and marching in place (if DW/DW style).
			Ex: If the char was supposed to be swinging a sword at a slime but it lags/glitches, they should return to the default "I'm in combat facing my enemy" animation.
			Thus, the default is to run an animation, and the exception is to do specific animations for specific actions as an override to demonstrate specific events.
		- In addition to frames of animation, there's also relative movement to consider... if you lunge to strike the slime, you not only go through 'swing your weapon' animation,
			but you also have 'move towards the slime' and 'return back to starting position' [x,y] displacements. Not all animations require such displacements, although adding
			minor deformations to [x,y] as a general rule could serve as emphasis for strong action.
			- There's another consideration: if the animation shows [x,y] displacement, should the character's actual [x,y] change, or just their DRAW [x,y]?

		- Basically different triggers need to fire up at different events, then an object gets "currentAnimation" that loops through one of its animation cycle variables,
			which will need its loaded image file, its frames: number of, source coords per, duration, and repeat/not-repeat (and if not-repeat, default to fall back to).
		- Every ANIMATION EVENT could be a self-triggering function, so looping animations have themselves as a target; this all loads into the 'current animation' slot,
			and then different occurrences/player inputs could change it up and either load a whole new animation OR change the next-animation OR accelerate the current animation
			and change the next animation. This could get tricky! Play with it!
		- Note also that there might have to be extra specifications during some actions/animations, like "can't move" or "invincible." :P
		- Active vs Passive movement: active is super-responsive to player control, passive is happening as a result of external forces or in fulfillment of player control or
			because it's an AI or object doing its own thing; on each update(), positions and animation points will be checked and set, ignoring or checking player input
			as appropriate. 

		*/

		// Step is supposedly in seconds, but the console.log was showing itty bitty numbers that only become seconds when times 1000, so, I guess it was in MS after all?
		this.timeline += (step * 1000);

		// In the next iteration, this code will cycle a basic walk animation.
		if (this.timeline > 500 && context.fillStyle == "#000000") {
			context.fillStyle = "#676767";
			this.timeline -= 500;
		} else if (this.timeline > 500 && context.fillStyle == "#676767") {
			context.fillStyle = "#000000";
			this.timeline -= 500;
		} else {
			// Above: if it's the next frame and it's black, make it grey; if it's the next frame and it's grey, make it black. Brutish but effective in this simple case.
		}
		// Before draw we need to convert player world's position to canvas position. This draws the actual player in.
		// Note: instead of fillRect, you'll need to do an image draw if you're using sprites. Which you will be!
		context.fillRect((this.x - this.width/2) - xView, (this.y - this.height/2) - yView, this.width, this.height);
	}
	
	// Adds JSClass Player to the Game object:
	Game.Player = Player;
	
})();

// Map JSClass wrapper.
(function(){
	function Map(width, height){
		// Map dimensions
		this.width = width;
		this.height = height;
		
		// Map texture
		this.image = null;

		this.currentmap = worldmap;

		function mapCoords() {
			console.log('I did a useless thing');
		};
	}

	Map.prototype.getTile = function(col, row) {
		var tileid = this.currentmap.tiles[row * worldmap.cols + col];
		var tilecoords;

		switch (tileid) {
			case 1:
				tilecoords = [100,0];
				break;
			case 2:
				tilecoords = [150,0];
				break;
			case 3:
				tilecoords = [100,50];
				break;
			default: 
				tilecoords = [0,0];
		}

		return tilecoords;
	}

	Map.prototype.bumpTile = function(x, y) {
		var tileid = this.currentmap.tiles[Math.floor(y / this.currentmap.tsize) * this.currentmap.cols + Math.floor(x / this.currentmap.tsize)];
		return tileid;
	}

	Map.prototype.mapCoords = function(x, y) {
		var currentXGrid = Math.floor(x / this.currentmap.tsize) * this.currentmap.tsize;
		var currentYGrid = Math.floor(y / this.currentmap.tsize) * this.currentmap.tsize;
		return [currentXGrid, currentYGrid];
	}
	
	// Create a PNG file drawn from tile sprites.
	Map.prototype.generate = function(sorc){
		// I believe this is probably a "throwaway" canvas, just to make the PNG file.
		var ctx = document.createElement("canvas").getContext("2d");		
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;
		
		// Shenanigans! Draws the map in its entirety into a full PNG file. Is this a good idea? I DUNNO. Works for our itty-bitty map for now, for what it's worth.
		// Future iterations will have multiple draw layers, so we need to figure that out in here somewhere, as well.
		var gar = new Image();
		gar.src = sorc.source;
		for (var c = 0; c < sorc.cols; c++) {
			for (var r = 0; r < sorc.rows; r++) {
		    	var tile = sorc.getTile(c, r);  // Grabs the [x,y] of the Sprite to sample from!
		    	if (tile !== 0) { // 0 => empty tile
		      		ctx.drawImage(
			        gar,//sorc.source, // Sprite source! Verra important.
			        tile[0], // source x
			        tile[1], // source y
			        sorc.tsize, // source width
			        sorc.tsize, // source height
			        c * sorc.tsize, // target x
			        r * sorc.tsize, // target y
			        sorc.tsize, // target width
			        sorc.tsize // target height
		      		);
		    	}
		  	}
		}
		
		// store the generate map as this image texture
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL("image/png");					
		
		// clear context
		ctx = null;
	}
	
	// Draws the map framed by the camera.
	Map.prototype.draw = function(context, xView, yView){					
		// easiest way: draw the entire map changing only the destination coordinate in canvas
		// canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
		// context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);
		
		// didactic way:
		
		var sx, sy, dx, dy;
        var sWidth, sHeight, dWidth, dHeight;
		
		// offset point to crop the image
		sx = xView;
		sy = yView;
		
		// dimensions of cropped image
		sWidth =  context.canvas.width;
		sHeight = context.canvas.height;

		// if cropped image is smaller than canvas we need to change the source dimensions
		if(this.image.width - sx < sWidth){
			sWidth = this.image.width - sx;
		}
		if(this.image.height - sy < sHeight){
			sHeight = this.image.height - sy; 
		}
		
		// location on canvas to draw the cropped image
		dx = 0;
		dy = 0;
		// Avoid scaling by making the source and destination tile sizes to be the same.
		dWidth = sWidth;
		dHeight = sHeight;									
		
		context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);			
	}
	
	// Add JSClass Map to the Game object:
	Game.Map = Map;
	
})();

// Game Script
(function(){
	// I think this is sort of an Init() situation?

	// Prepare the game canvas. Matched to the canvas in the HTML code.
	var canvas = document.getElementById("gamescreen");
	var context = canvas.getContext("2d");

    var last = 0; // last frame timestamp
    var now = 0; // current timestamp
    var step = now - last; // time between frames
	
	// This object represents the "room," the entirety of the current area. In current testing, the "worldmap."
	// The width is equal to the currentmap's cols * tsize, and height is equal to rows * tsize.
	var room = {
		width: 1500,
		height: 750,
		map: new Game.Map(1500, 750)
	};

	
	// Generate a large texturemap based off a map-object. Whee! Is wonky if the source PNG isn't loaded by the browser yet.
	room.map.generate(worldmap);
	 
	// Set up the Player! Right now it accepts just an X and Y position, but presumably we could load in a fully funcitoning char chock full of stats. STATS!
	// Future iterations could look for a cookie to load the character from the server, and if failed, do nothing here and wait for user input like New Char or Continue or whatevs.
	// Right now we just set up a new character at fiddy-fiddy x-y.
	var player = new Game.Player(50, 50);
	
	// Fire up the camera, with origin X and Y, the stats of the canvas, and the stats for the entire map we're looking at currently.
	var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);	
	// The below makes the camera follow something. Good news, everyone! By following the "player" object, we jump the camera away from that [0,0] we just established above.
	camera.follow(player, canvas.width/2, canvas.height/2);

	// For earlier testing: console.log(room.map.mapCoords);
	
	// Game update function! The master update function that calls all other update functions. The STEP is the number of seconds since the last frame.
	var update = function(step) { 
		player.update(step, room.width, room.height);
		camera.update();
		// And probably any other updates that need to occur on each "pulse" of the game!
		// On each iteration of the gameLoop, the timestamp is collected and essentially we get a call to this UPDATE function and then to the draw function to show stuff.
		// So, this function is the one that updates everything that needs updating behind the scenes. The numbers-crunching!
	}
		
	// Game draw function!
	var draw = function(step) {
		// Clears the canvas entirely.
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		// Redraws everything.
		room.map.draw(context, camera.xView, camera.yView);
		player.draw(step, context, camera.xView, camera.yView);
		// Ah! The draw function re-draws the player every time, too. Good to know.
	}
    
    var runningId = -1;
	
	// Game Loop
	var gameLoop = function(timestamp) {
        now = timestamp; // Current timestamp (in milliseconds)
        step = (now - last) / 1000; // Time between frames (in seconds, thanks to the division by 1000)
        last = now; // Stores the current timestamp for further evaluation in next frame/step 
        
		update(step);
		draw(step);
        runningId = requestAnimationFrame(gameLoop); 
	}	
	
    // We have the ability to pause, which is a holdover from the original code. Highly scrappable. :P
	
	Game.play = function(){	
		if(runningId == -1){
			runningId = requestAnimationFrame(gameLoop);
			// The controlling variable, a la setInterval. runningId can be cancelled to stop the animation frames from occurring.
		}
	}
	
	Game.togglePause = function(){		
		if (runningId == -1) {
			Game.play();
		}
		else
		{
			cancelAnimationFrame(runningId);
			runningId = -1;
			// This pauses the game by killing the runningId variable, which is running the Animation interval/loopy thingy.
			// However, it also sets the runningId back to its "ready to go" value, so it hits that IF on another run and gets started again.
		}
	}	
	
	// ---
	
})();

// <-- configure Game controls:

//Huh. Why is this sitting outside the anon function above? Hm... I mean, it works. So. 
Game.controls = {
	left: false,
	up: false,
	right: false,
	down: false,
};

window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key == 65) {
		Game.controls.left = true;
	}
	if (key == 87) {
		Game.controls.up = true;
	}
	if (key == 68) {
		Game.controls.right = true;
	}
	if (key == 83) {
		Game.controls.down = true;
	}
}

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key == 65) {
		Game.controls.left = false;
	}
	if (key == 87) {
		Game.controls.up = false;
	}
	if (key == 68) {
		Game.controls.right = false;
	}
	if (key == 83) {
		Game.controls.down = false;
	}
	if (key == 80) {
		Game.togglePause();
	}
}

// -->

// start the game when page is loaded
window.onload = function(){	
	Game.play();
}