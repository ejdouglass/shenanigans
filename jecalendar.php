<!doctype html>

<html>
<body>

<?php

$servername = "localhost";
$username = "root";
$password = "";
$database = "littledata";
$lockingkey = "moop";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
	die("Connection failed: " . mysqli_connect_error());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	$json = $_POST["myjsonvar"];
	//test_input($_POST["myjsonvar"]); is the old sanitization script, buuuuut
	//it ended up ruining the JSON-encoded variable completely, so we need to reassess this approach altogether
}

/*
function test_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  $data = strtolower($data);
  return $data;
}
*/

function coreuserdata($row) {
	$yayarray = array("firstname" => $row["firstname"], "lastname" => $row["lastname"], "rank" => $row["rank"], "uname" => $row["uname"], "pword" => $row["pword"], "id" => $row["id"]);
	return $yayarray;
}

// Reference: http://php.net/manual/en/function.date.php
$nowmonth = date("n");
$nowdate = date("j");
$nowyear = date("Y");
$nowday = date("l");
$nowtown = array("nowmonth" => $nowmonth, "nowdate" => $nowdate, "nowyear" => $nowyear, "nowday" => $nowday);
// To add... 't' as a format argument that yields the number of days in a given month
// Also! 'L' as a format argument gives whether its a leap year, yielding 1 if it is a Leap Year, 0 otherwise
// Note that date(format, timestamp) is the long form, and the TIMESTAMP defaults to 'right now.' You can set another timestamp! That's how we'll figure out other stuff. Neat.

// This threw occasional errors before. Apparently '+' are stripped during decoding! Weird! Be aware of it.
$jsonarray = json_decode($json);

$method = $jsonarray->method;

// "Method" variable, though originally for cookie versus, y'know, not cookie, can be adapted to mean "purpose of firing this script."
if ($method == "cookie") {
	$usercookie = $jsonarray->mycookie;

	// Debug TIMMMMME!
	// Dumping here is meant to test the PRE-decrypted but post-decoded cookie.
	// OK! Progress. Testing this situation resulted in seeing that, indeed, the '+' symbol has been ripped from the string, rendering it unusable.
	echo "The pre-decrypted, post-decoded cookie right now is: " . var_dump($usercookie);

	// The hiccup couuuuuuld also be occurring here. It's breaking below. No, the above is working fine if we get this far. It's not the decode... I doubt that.
	// So, we have the encrypted string. Then we decrypt it. Then we parse it. Sometimes it works. Sometimes it doesn't.
	// Actually. Wait. Huh. Ok. So the cookie is SAVED in the $json that came here from the JS. It's encoded, sent, and decoded. So, something may be happening in here...
	$usercookie = openssl_decrypt($usercookie, "AES-128-ECB", $lockingkey);

	//The magic of "parse_str" function turns " userid=SOMETHING&userpw=OTHERTHING " into intelligble variables. MAGIC! I forget how this works. But it does!
	parse_str($usercookie);
	
	// ** IMP ** : We didn't check the password before. We do now! Yay. Anyway, seems to work ok. Keep an eye on it.
	$sql = "SELECT * FROM PGPeeps WHERE uname='$userid' AND pword='$userpw'";
	$result = mysqli_query($conn, $sql);
	//Assuming all goes well, we now have the cookie, the encoded user login info. Decode it here and use it to echo a JSON-encoded resultarray, as below.
	if (mysqli_num_rows($result) > 0) {
		$row = mysqli_fetch_assoc($result);
		$resultarray = coreuserdata($row);
		$resultarray = array_merge($resultarray, $nowtown);
		echo json_encode($resultarray);
	} else {
		$resultarray = array("firstname" => "ERROR HAPPENED", "lastname" => $userid, "rank" => $userpw, "uname" => $usercookie);
		echo json_encode($resultarray);
	}	
} else {
	$userid = $jsonarray->myid;
	$userpw = $jsonarray->mypw;
	//Here we gotta do a sql check to return the row from the table where there's a match, if applicable, or spit out a "no such combo found" otherwise
	$sql = "SELECT * FROM PGPeeps WHERE uname='$userid' AND pword='$userpw'";
	$result = mysqli_query($conn, $sql);

	//This next line is pretty much the lynchpin of the whole thing. :P It will output the resultant JSON object, yay!
	if (mysqli_num_rows($result) > 0) {
		$row = mysqli_fetch_assoc($result);
		$resultarray = coreuserdata($row);
		$resultarray = array_merge($resultarray, $nowtown);
		echo json_encode($resultarray);
	} else {
		$resultarray = array("firstname" => "darkvoid");
		echo json_encode($resultarray);
	}
}

/* 
Basically we have two spots above where we're already fetching data from the database. Use these opportunities to also fetch calendar data!

Procedure:
At the beginning of the file we can grab the current date/time and parse it into the variables, such as date, that we want, separately.
Actually, I'm a little off my game with SQL Fu. I think I might have to make a separate $sql thing happen and then append those results to the $resultarray.
	- use array_merge($array1, $array2), which will yield an associative array like above that's a legit combination (and partial rewrite of the second, if shared variables).
The "currentuser" variable will merrily absorb EVERYTHING in a giant array, since that's the big JSON fellow that gets passed back.
	- dunno if there's any upper or other logistical limitation on this

NOTE: Right now this is an adapted login function that retrieves basic data.
		The next goal is to modify it so that this script can cover most of the calendar-based functionalities.
		Is that the best way to do it? Rather than a lot of smaller scripts? Hm. Well, one bigger script for now.

PROCESS! User loops through here. For login, grabs core user data and raw historical data.
		QUESTION: Can a PHP script run another PHP script? (Otherwise I was just gonna jump back into the JS and have the JS run another script. Seems messier. :P)
	CONDITIONAL: Checks current date, and makes sure we're also pulling from that current date.
		OH MY: Hm. Because the data is spread out over so many tables, we need a quick and potent way to grab all dat noise, up to and including 'today.'
		... maybe use the REG_DATE from the core data?
THEN it needs to somehow be parsed into usable data.
	- 

*/

mysqli_close($conn);

?>

</body>
</html>