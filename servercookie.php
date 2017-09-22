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
}

$jsonarray = json_decode($json);

//The goal is to make a cookie called "seshcook" that has the user's id and pw in it.

//This script is receiving an object containing the user's username and password. Here we pull them out for use.
$userid = $jsonarray->uname;
$userpw = $jsonarray->pword;

//Dunno if we actually have to do this. Uh. Well, I guess it DOES confirm that we have a valid username and password.
//Note, I should change it later to be more exclusive. It SHOULD only pick up one result, but ya never know...
$sql = "SELECT * FROM PGPeeps WHERE uname='$userid' AND pword='$userpw'";
$result = mysqli_query($conn, $sql);

//IF we have a valid uname and pword, make the cookie for it for pass back to the browser to store. Otherwise, NAW, DAWG.
if (mysqli_num_rows($result) > 0) {
	//I don't know WHY, but the string to be encryted needs an extra space before it and after it. Eh. Doesn't work without, but works great with, sooooo.
	//Apparently there's no great reason for this? I'unno. Look into it more later, I suppose! I'm not satisfied with "just because."
	$encryptme = " userid=" . $userid . "&userpw=" . $userpw . " ";
	$encryptedcookie = openssl_encrypt($encryptme, "AES-128-ECB", $lockingkey);
	//Clear a thingy so the cookie can be saved. I dunno why we do this, but we do! Apparently it might not work properly if I don't. Learn more about it later. 
	ob_start();
	setcookie("seshcook", $encryptedcookie, time() + (86400 * 30), "/");
	ob_end_flush();
} else {
	$resultarray = array("firstname" => "ERROR");
	ob_start();
	setcookie("seshcook", "workedwrongway", time() + (86400 * 30), "/");
	ob_end_flush();	
}


mysqli_close($conn);

?>

</body>
</html>