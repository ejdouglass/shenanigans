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

$sql = "CREATE TABLE farmland (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
rank VARCHAR(30) NOT NULL,
uname VARCHAR(30) NOT NULL,
pword VARCHAR(30) NOT NULL,
pseudonym VARCHAR(30),
email varchar(50) NOT NULL";
/* How do we Farmland?
	Welp what variables do we wanna save?
	We'll have to encode, store, decode, use. Well, not in this file, but eventually.

*/

if (mysqli_query($conn, $sql)) {
	echo "Table farmland has been successfully created.";
} else {
	echo "ONOES no table for some reason, reason being: " . mysqli_error($conn);
}

mysqli_close($conn);

?>

</body>
</html>