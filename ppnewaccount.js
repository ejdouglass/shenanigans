var newaccountdeets = {};
var acctresult = {};
var resilientdata = setInterval(saveNewUserFields, 1000);
var newbiecookie = e.grabCookie("babyuser");
if (newbiecookie != null) {
	newaccountdeets = JSON.parse(newbiecookie);
	document.getElementById("firstname").value = newaccountdeets.firstname;
	document.getElementById("lastname").value = newaccountdeets.lastname;
	document.getElementById("username").value = newaccountdeets.username;
	document.getElementById("email").value = newaccountdeets.email;
	document.getElementById("country").value = newaccountdeets.country;
	document.getElementById("city").value = newaccountdeets.city;
	document.getElementById("state").value = newaccountdeets.state;
	document.getElementById("address").value = newaccountdeets.address;
}

document.getElementById("createnewaccount").onclick = accountmaker;
document.getElementById("clearfields").onclick = clearfields;

function clearfields() {
	document.getElementById("firstname").value = "";
	document.getElementById("lastname").value = "";
	document.getElementById("username").value = "";
	document.getElementById("password").value = "";
	document.getElementById("password2").value = "";
	document.getElementById("email").value = "";
	document.getElementById("country").value = "USA";
	document.getElementById("city").value = "";
	document.getElementById("state").value = "";
	document.getElementById("address").value = "";
}

function accountmaker() {
	document.getElementById("feedback").innerHTML = "Processing your request, just a moment, please...";

	newaccountdeets.firstname = document.getElementById("firstname").value;
	newaccountdeets.firstname = newaccountdeets.firstname.split(' ').join('');
	newaccountdeets.firstname = newaccountdeets.firstname.replace(/[0-9]/g, '');
	document.getElementById("firstname").value = newaccountdeets.firstname;

	if (newaccountdeets.firstname == "") {
		document.getElementById("feedback").innerHTML = "You're not allowed to not have a first name. Very important!";
		return;
	}

	newaccountdeets.lastname = document.getElementById("lastname").value;
	newaccountdeets.lastname = newaccountdeets.lastname.split(' ').join('');
	newaccountdeets.lastname = newaccountdeets.lastname.replace(/[0-9]/g, '');
	document.getElementById("lastname").value = newaccountdeets.lastname

	if (newaccountdeets.lastname == "") {
		document.getElementById("feedback").innerHTML = "You're not allowed to not have a last name. We need to know who you are!";
		return;
	}

	//Give the username some SPECIAL TREATMENT. Just RETURN if this bit of code doesn't like what it sees.
	newaccountdeets.username = document.getElementById("username").value;
	newaccountdeets.username = newaccountdeets.username.split(' ').join('');
	document.getElementById("username").value = newaccountdeets.username;

	if (newaccountdeets.username.length > 20) {
		document.getElementById("feedback").innerHTML = "I'm sorry to say your username is, like, WAY too long. 20 characters or less, please.";
		return;
	}

	//Already hit the brakes if they have no password, mismatched passwords, or short passwords.
	//I'd like to add other warnings, such as "you can't have whitespaces in your password" and such. OTHER FXN!
	newaccountdeets.password = document.getElementById("password").value;
	newaccountdeets.password = newaccountdeets.password.split(' ').join('');
	document.getElementById("password").value = newaccountdeets.password;

	if (newaccountdeets.password == "") {
		document.getElementById("feedback").innerHTML = "A password of nothing isn't particularly secure. Please take another whack at it!";
		return;
	}

	if (newaccountdeets.password != document.getElementById("password2").value) {
		document.getElementById("feedback").innerHTML = "You FOOL! Your password doesn't match itself! Make sure capitals match each other and such, as well.";
		return;
	}

	if (newaccountdeets.password.length < 6) {
		document.getElementById("feedback").innerHTML = "Eh, in all good conscience, I can't really allow you to have a password that's less than 6 characters long.";
		return;
	}

	newaccountdeets.email = document.getElementById("email").value;
	newaccountdeets.email = newaccountdeets.email.split(' ').join('');
	document.getElementById("email").value = newaccountdeets.email;

	newaccountdeets.country = document.getElementById("country").value;
	newaccountdeets.city = document.getElementById("city").value;
	newaccountdeets.state = document.getElementById("state").value;
	newaccountdeets.address = document.getElementById("address").value;

	var newaccountjson = JSON.stringify(newaccountdeets);

	e.bakeCookie("babyuser", newaccountjson, 30);

	e.ajfetch("ppnewaccount.php", newaccountjson, acctresult);
}

function saveNewUserFields() {
	newaccountdeets.firstname = document.getElementById("firstname").value;
	newaccountdeets.lastname = document.getElementById("lastname").value;
	newaccountdeets.username = document.getElementById("username").value;
	newaccountdeets.email = document.getElementById("email").value;
	newaccountdeets.country = document.getElementById("country").value;
	newaccountdeets.city = document.getElementById("city").value;
	newaccountdeets.state = document.getElementById("state").value;
	newaccountdeets.address = document.getElementById("address").value;
	e.bakeCookie("babyuser", JSON.stringify(newaccountdeets), 30);

	if (document.getElementById("password").value != '') {
		console.log(document.getElementById("password").value.indexOf(' '));
		if (document.getElementById("password").value.indexOf(' ') != -1) {
			document.getElementById("feedback").innerHTML = "You can't have whitespaces in your password, silly.";
		}
	} else {
		document.getElementById("feedback").innerHTML = "I'm here to give you feedback, dear reader.";
	}

	if (acctresult.feedback != undefined) {
		document.getElementById("feedback").innerHTML = acctresult.feedback;
	}

	// ** HERE ** : We can add a bit that does checks on the current username status and gives feedback as necessary.
	// ** ALSO ** : Password whimsy!
}