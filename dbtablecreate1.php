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

$sql = "CREATE TABLE PGPeeps (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
rank VARCHAR(30) NOT NULL,
uname VARCHAR(30) NOT NULL,
pword VARCHAR(30) NOT NULL,
pseudonym VARCHAR(30),
email varchar(50) NOT NULL,
workouts_june_2017 varchar(600),
dietary_june_2017 varchar(600), 
questlog varchar(600),
playarea varchar(600),
npcs varchar(600),
settings varchar(250), 
tier tinyint(10), 
event_history varchar(600),
friend_data varchar(600),
videos varchar(600),
pictures varchar(600), 
logs varchar(600), 
tenet varchar(600), 
goals varchar(600), 
scaffolding varchar(600), 
victories varchar(600), 
collection varchar(600), 
messages varchar(600), 
country varchar(40), 
city varchar(50), 
state varchar(40), 
address varchar(200), 
reg_date TIMESTAMP)";


if (mysqli_query($conn, $sql)) {
	echo "Table PGPeeps has been successfully created.";
} else {
	echo "ONOES no table for some reason, reason being: " . mysqli_error($conn);
}

mysqli_close($conn);

?>

</body>
</html>