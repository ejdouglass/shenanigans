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
	//test_input($_POST["myjsonvar"]); is the old sanitization script, buuuuut it super fux with object variables.
}

function test_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}


$jsonarray = json_decode($json);

$uname = $jsonarray->username;
$pword = $jsonarray->password;
$firstname = $jsonarray->firstname;
$lastname = $jsonarray->lastname;
$email = $jsonarray->email;
$country = $jsonarray->country;
$city = $jsonarray->city;
$state = $jsonarray->state;
$address = $jsonarray->address;

$feedback = "";

$sql = "SELECT * FROM PGPeeps WHERE uname='$uname'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
	//OSNAP someone already has that username, no bueno. Report thusly!
	$feedback .= "That username is already in use. Please pick another. ";

} else {
	//Ok so username doesn't exist. Let's see if everything else checks out.
	//EMAIL CHECK, where we make sure it's a valid address and NOT HAX.
	$email = test_input($email);
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  		$feedback .= "Your email is in an invalid format. "; 
	}
	//Username, password, firstname, lastname, city, state, address. All check for NOT HAX.
	$uname = test_input($uname);
	$pword = test_input($pword);
	$firstname = test_input($firstname);
	$lastname = test_input($lastname);
	$city = test_input($city);
	$state = test_input($state);
	$address = test_input($address);

	if ($feedback == "") {

		$sql = "INSERT INTO PGPeeps (firstname, lastname, rank, uname, pword, email, tier, country, city, state)
		VALUES ('$firstname', '$lastname', 'Peon', '$uname', '$pword', '$email', 1, '$country', '$city', '$state');";

		//This was previously mysqli_multi_query. I changed it before testing, since it's only one new record, but we can change it back if this part acts odd.
		if (mysqli_query($conn, $sql)) {
		    $feedback .= "Congrats! You have successfully created your account. ";
		} else {
		    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
		}

	}
}

$feedbackarray = array("feedback" => $feedback);
echo json_encode($feedbackarray);

mysqli_close($conn);

?>

</body>
</html>