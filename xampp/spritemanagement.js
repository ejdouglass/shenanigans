/*
NOTES, BUGS, AND ISSUES:
1. When changing the numbers for "new default," typing causes different frames to be selected. :P
	- Is there a way to sense when a box is in focus and add a conditional to the JS?
	- Could also make frame selection more than a simple number-press, but if so, try not to make it too cumbersome.

IMPROVEMENTS:
1. When a frame is selected, maybe remove the "total number of frames" and default and source stuff so that the entirety of the page
	is dedicated/dedicate-able to working with that particular frame. The current frame number should then be displayed (probably X of Y).
2. For large frame sizes, the default screen will get pretty cluttered, especially with large numbers of frames. Maybe have a separate
	"frame overview" button/mode that shows all frames lined up and can take the entire screen, but otherwise an abridged or thumbnail
	version?
3. Backgrounds: being able to test a sprite's animation against various backgrounds is a good idea. This can be an optional series of boxes
	that do this (warm, cool, etc.) on the main animate screen.
4. Make the pixel-jump more granular, maybe? 1/10/100 is ok, but we can probably streamline it, or maybe introduce something like shift-clicking
	to do fine adjustments or somesuch.
5. The current "spritesource" box doesn't actually do anything. :P
6. Put all this onto the local server and see if we can cookie this bad boy up properly.
7. Maybe have the stuff outside of the framefinder "grayed out" or "whited out" partially to give a more clear visual cue for what's in the framefinder
	versus outside?
8. A "same as previous frame" button would be super-handy, since spritesheets tend to have stuff lined up close to each other. A more advanced
	functionality on top of this would be an "undo" feature, but that's pretty double-fancy.
9. For very large spritesheets, it'd be annoying to have to scroll around a lot past the initial HTML page's boundaries and create a fold.
	Perhaps change it so that the framefinder is centered, and the rest of the spritesheet moves around it, rather than vice-versa?

X. A way to deviate specific frames from the default? Although is this necessary? Hm, without overflow protection, the actual frame size
	doesn't necessarily correlate to the JS/coordinates/whatever size, so really at this point it's more of a reference than anything else.
	It still matters, but not enough to really necessitate individually different frame sizes yet.

*/

var frame1 = document.getElementById("frame1");
var frame2 = document.getElementById("frame2");
var frame3 = document.getElementById("frame3");
var frame4 = document.getElementById("frame4");
var frame5 = document.getElementById("frame5");
var frame6 = document.getElementById("frame6");
var frame7 = document.getElementById("frame7");
var frame8 = document.getElementById("frame8");
var frame9 = document.getElementById("frame9");
var frame10 = document.getElementById("frame10");
var frame11 = document.getElementById("frame11");
var frame12 = document.getElementById("frame12");
var activeframe = "none";
var numframes = 4;
var spritesource = "testing123sprite.png";
var defaultx = "150px";
var defaulty = "150px";
var framefinderx = 0;
var framefindery = 0;
var pixeljump = 1;
//x,y spritesheet default values for frames 1 through 12
var frames = [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]];
if (grabCookie("defaultx") != null) {
	defaultx = grabCookie("defaultx");
	alert('I got a cookie.');
} else {
	bakeCookie("defaultx", defaultx, 365);
	alert('I failed to find a cookie and maybe made one?');
}
if (grabCookie("defaulty") != null) {
	defaulty = grabCookie("defaulty");
} else {
	bakeCookie("defaulty", defaulty, 365);
}
if (grabCookie("numframes") != null) {
	numframes = grabCookie("numframes");
} else {
	bakeCookie("numframes", numframes, 365);
}
for (z = 1; z <= 12; z++) {
	var fixframe = "frame" + z;
	document.getElementById(fixframe).style.width = defaultx;
	document.getElementById(fixframe).style.height = defaulty;
}
alert('I am alert?');

/*

Animatin' shit.
Two styles:
1. Nonstop loop. Every object could theoretically have its own animation variable, since each JS object would likely be linked to a div or something.
	- This variable could be used for setInterval and clearInterval porpoises.
2. Limited loop. A quick setTimeout could be used for a one-off animation, say, an explosion or spell effect or other relatively quick effect.
	- A single-loop for a character animation would likely have to be different, because if it's just a setTimeout, anything that causes a setInterval would
	then cause some awkward situations of animations overlapping each other.
	- The trick is to have events and/or functions that properly activate and deactivate the animation variable. Maybe a separate variable that's a "length of run"
	variable, which responds to a global always-running time varaible?

Execution of above:
e.animate() ; 

Rando thought: MOVEMENT, different from animation per se, which changes the JS coords and HTML coords of an object...
		and EFFECTS, like day/night, rain, status effects, explosions? (There may be sub-effect categories)

*/


//Here we should LOAD all values, since now they're either factory-default OR cookie-loaded. Theoretically.
//LOADLOADLOADetc.

frame1.style.display = "inline-block";
frame2.style.display = "inline-block";
frame3.style.display = "inline-block";
frame4.style.display = "inline-block";

document.getElementById("animenubutton").onclick = function() {
	saveThisFrame(activeframe);
}

frame1.onclick = function() {
	if (activeframe != 1) {
		activateMyFrame(1);
	} else {
		animateMode(activeframe);
	}
}

if (document.getElementById("framesaver") != null) {
	document.getElementById("framesaver").onclick = function() {
		saveThisFrame(activeframe);
		animateMode(activeframe);
	}
}

//When de-loading the current frame, this function is called and it saves the frames[x] [x,y] variables, resets the global current x,y to 0, 
//	resets the framefinder viewfinder variables, turns off the activeframe global, resets the pixeljump global, and hides the spritesheet.
function saveThisFrame(n) {
	frames[n-1] = [framefinderx, framefindery];
	framefinderx = 0;
	framefindery = 0;
	if (n != "none") {
		var oldframe = "frame" + n;
		document.getElementById(oldframe).style.border = "1px solid black";
	}
	document.getElementById("spriteview").style.left = framefinderx + "px";
	document.getElementById("spriteview").style.top = framefindery + "px";
	document.getElementById("fullspritesheet").style.display = "none";
	document.getElementById("spriteview").style.display = "none";
	activeframe = "none";
	pixeljump = 1;
}

//Function activates frame n, setting the activeframe variable, highlighting the current frame, displaying the spritesheet, loading the framefinder globals,
//	and putting the spriteview "window" in the proper place for that frame based on that.
function activateMyFrame(n) {
	var currentframe = "frame" + n;
	document.getElementById(currentframe).style.border = "1px solid red";
	activeframe = n;
	framefinderx = frames[n-1][0];
	framefindery = frames[n-1][1];
	frameMenuOn();
	document.getElementById("spriteview").style.left = framefinderx + "px";
	document.getElementById("spriteview").style.top = framefindery + "px";
}

//Easy-peasy. Just makes the spritesheet and spriteview "window" visible.
function frameMenuOn() {
	document.getElementById("fullspritesheet").style.display = "inline-block";
	document.getElementById("spriteview").style.display = "inline-block";
}

//Displays the current numframes to the user.
document.getElementById("numframes").innerHTML = numframes;

//Buttons call merry functions to add or subtract frames.
document.getElementById("moreframes").onclick = onemoreframe;
document.getElementById("fewerframes").onclick = onefewerframe;

//Function on click saves the current frame width/height settings as "default."
document.getElementById("defaultchanger").onclick = savenewdefault;

//Function that adds +1 to the number of current frames. Displays the next frame (hidden otherwise). Doesn't do anything if the number exceeds 12.
function onemoreframe() {
	if (numframes + 1 <= 12) {
		numframes++;
		document.getElementById("numframes").innerHTML = numframes;
		var fixframe = "frame" + numframes;
		document.getElementById(fixframe).style.display = "inline-block";
	}
}

//Onemoreframe, but in reverse.
function onefewerframe() {
	if (numframes - 1 >= 1) {
		numframes--;
		document.getElementById("numframes").innerHTML = numframes;
		var fixframe = "frame" + (numframes + 1);
		document.getElementById(fixframe).style.display = "none";
	}
}

//Takes the current numbers in x and y width/height boxes and applies them to the frame box sizes. Unless the numbers are less than 1.
//	Also saves new cookies for the defaultx and defaulty variables. Theoretically.
function savenewdefault() {
	var x = document.getElementById("defaultframewidth").value;
	var y = document.getElementById("defaultframeheight").value;
	if (x < 1) {
		alert("That's a silly small number. Changing x-default to 1px instead.");
		x = 1;
	}
	if (y < 1) {
		alert("That's a silly small number. Changing y-default to 1px instead.");
		y = 1;
	}
	for (z = 1; z <= 12; z++) {
		var fixframe = "frame" + z;
		document.getElementById(fixframe).style.width = x+"px";
		document.getElementById(fixframe).style.height = y+"px";
		document.getElementById("spriteview").style.width = x+"px";
		document.getElementById("spriteview").style.height = y+"px";
	}
	bakeCookie("defaultx", x, 365);
	bakeCookie("defaulty", y, 365);
}

//Makes a new cookie!
function bakeCookie(name, value, expiration) {
	var d = new Date();
	d.setTime(d.getTime() + (expiration * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

//Retrieves a cookie!
function grabCookie(name) {
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
}

//Various things that happen when you press different keys!
window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;

	if (key == 49) {
		saveThisFrame(activeframe);
		activateMyFrame(1);
	}
	if (key == 50 && numframes >= 2) {
		saveThisFrame(activeframe);
		activateMyFrame(2);
	}
	if (key == 51 && numframes >= 3) {
		saveThisFrame(activeframe);
		activateMyFrame(3);
	}
	if (key == 52 && numframes >= 4) {
		saveThisFrame(activeframe);
		activateMyFrame(4);
	}
	if (key == 53 && numframes >= 5) {
		saveThisFrame(activeframe);
		activateMyFrame(5);
	}
	if (key == 54 && numframes >= 6) {
		saveThisFrame(activeframe);
		activateMyFrame(6);
	}
	//ENTER or ESC
	if (key == 13 || key == 27) {
		saveThisFrame(activeframe);
		//Here we activate ANIMATETIME!
	}
	if (key == 65) {
		framefinderx -= pixeljump;
		document.getElementById("spriteview").style.left = framefinderx + "px";
	}
	if (key == 87) {
		framefindery -= pixeljump;
		document.getElementById("spriteview").style.top = framefindery + "px";
	}
	if (key == 68) {
		framefinderx += pixeljump;
		document.getElementById("spriteview").style.left = framefinderx + "px";
	}
	if (key == 83) {
		framefindery += pixeljump;
		document.getElementById("spriteview").style.top = framefindery + "px";
	}
	if (key == 189) {
		pixeljump /= 10;
		if (pixeljump < 1) {
			pixeljump = 1;
		}
	}
	if (key == 187) {
		pixeljump *= 10;
		if (pixeljump > 100) {
			pixeljump = 100;
		}
	}
	document.getElementById("spritestats").innerHTML = "Current (x,y): (" + framefinderx + "," + framefindery + ") ... current pixel-jump is at " + pixeljump;
}