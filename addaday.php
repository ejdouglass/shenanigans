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

// ** NOTE ** : This particular script may be totally unnecessary. We'll see!

/*
$sql = "CREATE TABLE August2017 (
id INT(6),
day1 VARCHAR(1000),
day2 VARCHAR(1000),
day3 VARCHAR(1000),
day4 VARCHAR(1000),
day5 VARCHAR(1000),
day6 VARCHAR(1000),
day7 VARCHAR(1000))";
*/

$sql = "SELECT * FROM September2017";

if (mysqli_query($conn, $sql)) {
	// This table exists. Yay! You may interface with it.
	echo "This table exists! Yay!";
} else {
	// The table does not exist! O my! In that case, we should make it. And then interface with it.
	echo "ONOES no table for some reason, reason being: " . mysqli_error($conn);
}

mysqli_close($conn);

?>

</body>
</html>