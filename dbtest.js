var userdata = {firstname: "Nullboy"};

document.getElementById("maketable").onclick = wizard;
document.getElementById("tablecreate").onclick = tablecreatepopulate;
document.getElementById("tablefill").onclick = tablefillpopulate;
document.getElementById("loginsubmit").onclick = checklogin;

var userinformer = setInterval(userstuff, 1000);

function wizard() {
	var demand = document.getElementById("scriptlauncher").value;
	e.ajrun(demand);
}

function tablecreatepopulate() {
	document.getElementById("scriptlauncher").value = "dbtablecreate1.php";
}

function tablefillpopulate() {
	document.getElementById("scriptlauncher").value = "dbfill.php";
}

function checklogin() {
	var loginid = document.getElementById("loginid").value;
	var loginpw = document.getElementById("loginpw").value;
	var credentials = {myid: loginid, mypw: loginpw};
	credentials = JSON.stringify(credentials);
	e.ajfetch("dblogin.php", credentials, userdata);
}

function userstuff() {
	if (userdata.firstname != undefined && userdata.lastname!= undefined) {
		document.getElementById("userdata").innerHTML = "Member #" + userdata.id + ": " + userdata.firstname + " " + userdata.lastname + ", " + userdata.rank;
	}
}

/*

FFBE CHARACTER DESIGN IDEAS, in this file just 'cuz EJD is overloaded with comments already.

MASQUE: Subversive support! Class: "Con Artist." Friendly, charming, well-dressed, if over-the-top-ly so. Very cool guy or girl.
4* to 6*
Standard:
	Escape: Flee from battle, yo!
	Mirage: A handful of physical dodges
	High Tide: LB boost rate
	Entrust: Give LB to an ally
Unique: 
	Frame-Up: 1 turn 100% provoke on target ally other than self
	Scram: 1 turn removal of target ally and self
	Tunnel Vision/Mind Games: ST, 1 turn 50% chance per attack target enemy will use a normal ST attack instead of whatever they would have otherwise used
		- OR - Mirage-like debuff, 30% per attack this will happen, but lasts 3 turns and works up to 3 times
	Master of Misdirection: 75% less likely to be targeted, once-per-life 100% auto-revive activated on 3rd turn
	Sleight of Hand: Double item use?
	Retort: Twist of Fate backwards! Takes debuffs on party and throw them onto ST.
	The Perfect Setup: Drops the cost of a single ally's abilities to 0MP (and 0HP?) for 1 turn.
Passive: 
	HP + 20%
	MP + 20%
	DEF + 20%
	SPR + 20%
	Gunslinger: + SPR/mevade
	Stabber: + DEF/evade
	Swordplay: + DEF/SPR
	A Game of Darts: + refresh
LB: 
	Something something. Allows multiple use of unique skills, since they're all currently REALLY short duration, so s/he can only do one thing at a time.
Backstory: 
	???

*/