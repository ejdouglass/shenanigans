var currentuser = {};
var usercookiecheck = e.grabCookie("seshcook");
var loginverify;

document.getElementById("loginbutton").onclick = checklogin;
document.getElementById("clearcookie").onclick = logout;

if (usercookiecheck == null) {
	document.getElementById("loginbox").style.display = "inline-block";
	document.getElementById("clearcookie").style.display = "none";
} else {
	console.log("Cookie seshcook is there, saved as " + usercookiecheck);
	var usercookie = {mycookie: usercookiecheck, method: "cookie"};
	usercookie = JSON.stringify(usercookie);
	e.ajfetch("dbloginpp.php", usercookie, currentuser);
	loginverify = setInterval(userpopulate, 100);
}

function checklogin() {
	var loginid = document.getElementById("loginid").value;
	var loginpw = document.getElementById("loginpw").value;
	var credentials = {myid: loginid, mypw: loginpw, method: "login"};
	credentials = JSON.stringify(credentials);
	e.ajfetch("dbloginpp.php", credentials, currentuser);
	document.getElementById("loginid").value = "";
	document.getElementById("loginpw").value = "";
	loginverify = setInterval(userpopulate, 100);
}

// Runs on the loginverify variable as a setInterval function under the assumption that we're waiting for the server to give us user variables.
// Keeps running until it sees currentuser is populated, then stops its own interval and makes appropriate changes to the page to wait for the user's next action.
// It also bakes a new cookie using the JSON-ified currentuser object. I dunno if that's necessary. I'll reflect on that later!
function userpopulate() {
	if (currentuser.uname != undefined) {
		currentuser.seshon = true;
		var currentuserphp = JSON.stringify(currentuser);
		e.ajfetch("servercookie.php", currentuserphp, undefined);
		clearInterval(loginverify);
		document.getElementById("loginbox").style.display = "none";
		document.getElementById("clearcookie").style.display = "inline-block";
		document.getElementById("headline").innerHTML = "Welcome, " + currentuser.firstname + ", " + currentuser.rank + " of the realm!";
	}
}

function logout() {
	e.dropCookie("seshcook");
	document.getElementById("headline").innerHTML = "Thank you for visiting, " + currentuser.firstname + ". See you again soon!";
	currentuser = {};
	document.getElementById("loginbox").style.display = "inline-block";
	document.getElementById("clearcookie").style.display = "none";
}