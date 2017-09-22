var currentuser = {};
var scriptfeedback = {};
var usercookiecheck = e.grabCookie("seshcook");
var loginverify;

document.getElementById("loginbutton").onclick = checklogin;
document.getElementById("logoutbutton").onclick = logout;
document.getElementById("notessubmit").onclick = notejot;
document.getElementById("callgoal").onclick = callgoal;
document.getElementById("callgroup").onclick = callgroup;
document.getElementById("calltoday").onclick = calltoday;

document.getElementById("seemygroups").onclick = seemygroups;
document.getElementById("findagroup").onclick = findagroup;
document.getElementById("makeagroup").onclick = makeagroup;

function seemygroups() {
	document.getElementById("mygroups").style.display = "inline-block";
	document.getElementById("groupsearch").style.display = "none";
	document.getElementById("groupmaker").style.display = "none";
}

function findagroup() {
	document.getElementById("mygroups").style.display = "none";
	document.getElementById("groupsearch").style.display = "inline-block";
	document.getElementById("groupmaker").style.display = "none";
}

function makeagroup() {
	document.getElementById("mygroups").style.display = "none";
	document.getElementById("groupsearch").style.display = "none";
	document.getElementById("groupmaker").style.display = "inline-block";
}
 
if (usercookiecheck == null) {
	//document.getElementById("loginbox").style.display = "inline-block";
	//document.getElementById("clearcookie").style.display = "none";
} else {
	console.log("Cookie seshcook is there, saved as " + usercookiecheck);
	var usercookie = {mycookie: usercookiecheck, method: "cookie"};
	usercookie = JSON.stringify(usercookie);
	// The below is because our encrypted cookies, when containing '+', would replace them with ' '. This prevents that.
	usercookie = encodeURIComponent(usercookie);
	e.ajfetch("jecalendar.php", usercookie, currentuser);
	loginverify = setInterval(userpopulate, 20);
}

function checklogin() {
	var loginid = document.getElementById("loginid").value;
	var loginpw = document.getElementById("loginpw").value;
	var credentials = {myid: loginid, mypw: loginpw, method: "login"};
	credentials = JSON.stringify(credentials);
	e.ajfetch("jecalendar.php", credentials, currentuser);
	// Don't really want it all to clear when you hit the button; moved it down to after you get a useful result.
	// document.getElementById("loginid").value = "";
	// document.getElementById("loginpw").value = "";
	loginverify = setInterval(userpopulate, 20);
}

function userpopulate() {
	if (currentuser.uname != undefined) {
		currentuser.seshon = true;
		var currentuserphp = JSON.stringify(currentuser);
		e.ajfetch("servercookie.php", currentuserphp, undefined);

		document.getElementById("loginholder").style.display = "none";
		document.getElementById("logoutbutton").style.display = "inline-block";
		document.getElementById("greeting").innerHTML = "User " + currentuser.uname + "<br>" + currentuser.firstname + " " + currentuser.lastname;
		document.getElementById("loginid").value = "";
		document.getElementById("loginpw").value = "";
		document.getElementById("datebanner").style.display = "inline-block";
		document.getElementById("datebanner").innerHTML = "<p>" + currentuser.nowday + " [ " + currentuser.nowmonth + "-" + currentuser.nowdate + "-" + currentuser.nowyear + " ]</p>"
		document.getElementById("todo").style.display = "inline-block";
		document.getElementById("actionbuttons").style.display = "inline-block";

		// ** HERE ** : grab all relevant calendar data... from personal starting date to current date, I imagine, just GLORP it all ... add to jecalendar.php



		clearInterval(loginverify);
	}
}

function logout() {
	e.dropCookie("seshcook");
	document.getElementById("greeting").innerHTML = "Thank you for visiting, " + currentuser.firstname + ". See you again soon!";
	currentuser = {};
	document.getElementById("loginholder").style.display = "inline-block";
	document.getElementById("logoutbutton").style.display = "none";
	document.getElementById("actionbuttons").style.display = "none";
	document.getElementById("todo").style.display = "none";
}

function callgoal() {
	resetWindows();
	document.getElementById("calledgoal").style.display = "inline-block";
}

function callgroup() {
	resetWindows();
	document.getElementById("calledgroup").style.display = "inline-block";
	document.getElementById("mygroups").style.display = "inline-block";
}

function calltoday() {
	resetWindows();
	document.getElementById("calledtoday").style.display = "inline-block";
}

function resetWindows() {
	document.getElementById("calledgoal").style.display = "none";
	document.getElementById("calledgroup").style.display = "none";
	document.getElementById("calledtoday").style.display = "none";
}

function notejot() {
	// Basically take the contents of element "notes" upon click of "notessubmit" and add it to the day's notes.
	// This will require a quick sync with the database to update the day-oh. The format will be "day" + currentuser.nowdate.
	// Anyway, since we can hopefully safely assume that the day's notes are already up-to-date, we can just do a quick push back into the database to update this new info.

	/*

	currentuser shall hold ALL THE THINGS. But hao?!
	Maybe as easy as the KEY being like currentuser.09117 = "info" which may or may not be subdivided further into sub-objects from the script.
	ALL NOTES for the day will live in a single block, for now.
	... I think it'd be reasonable to be able to slap some notes on each individual endeavor, as well.

	*/
}

/*

Uh quick note for later... the date/time thinks it's tomorrow. So, uh, figure out where PHP is looking to get this date data... will definitely have to dabble in different time zones.

OVERALL CHANGES
- ) Change "GREETING" to "core user badge" with name, icon/picture, public username OR pseudonym, and some trimmings indicating rank and achievements
- ) Modularize the different display/app parts, with functions that turn them on and off (and add these to logout :P)


WHAT'S MISSING?!
- ) I have no idea how to have someone set their own personal goals. Maybe have different sections, like "Body" "Mind" etc.
	- Right now we're working on success and behaviors, soooo. We can "grey out" ones we don't roll with, for now.


*/