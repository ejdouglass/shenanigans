<!doctype html>

<html>
<body>

<?php

$servername = "localhost";
$username = "root";
$password = "";
$database = "littledata";

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

mysqli_close($conn);

?>

</body>
</html>