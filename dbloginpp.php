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

$jsonarray = json_decode($json);

$method = $jsonarray->method;

if ($method == "cookie") {
	$usercookie = $jsonarray->mycookie;

	$usercookie = openssl_decrypt($usercookie, "AES-128-ECB", $lockingkey);

	//The magic of "parse_str" function turns " userid=SOMETHING&userpw=OTHERTHING " into intelligble variables. MAGIC! I forget how this works. But it does!
	parse_str($usercookie);
	
	// ** IMP ** : Hey, uh, real quick. Shouldn't we also be checking password here? Make sure it works properly...
	$sql = "SELECT * FROM PGPeeps WHERE uname='$userid'";
	$result = mysqli_query($conn, $sql);
	//Assuming all goes well, we now have the cookie, the encoded user login info. Decode it here and use it to echo a JSON-encoded resultarray, as below.
	if (mysqli_num_rows($result) > 0) {
		$row = mysqli_fetch_assoc($result);
		$resultarray = array("firstname" => $row["firstname"], "lastname" => $row["lastname"], "rank" => $row["rank"], "uname" => $row["uname"], "pword" => $row["pword"], "id" => $row["id"]);
		echo json_encode($resultarray);
	} else {
		$resultarray = array("firstname" => "CRUMMYCRACKERS");
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
		$resultarray = array("firstname" => $row["firstname"], "lastname" => $row["lastname"], "rank" => $row["rank"], "uname" => $row["uname"], "pword" => $row["pword"], "id" => $row["id"]);
		echo json_encode($resultarray);
	} else {
		$resultarray = array("firstname" => "darkvoid");
		echo json_encode($resultarray);
	}
}

mysqli_close($conn);

?>

</body>
</html>