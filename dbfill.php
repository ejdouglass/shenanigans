<!doctype html>
<html>

<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "littledata";

$conn = mysqli_connect($servername, $username, $password, $dbname);

if (!$conn) {
	die("Connection failed: " . mysqli_connect_error());
}

$sql = "INSERT INTO PGPeeps (firstname, lastname, rank, uname, pword, pseudonym, email, tier, country, city, state)
VALUES ('Eric', 'Douglass', 'Peon', 'ejdouglass', 'zoom', 'Duggy', 'eric.douglass@gmail.com', 9, 'USA', 'San Jose', 'CA');";
$sql .= "INSERT INTO PGPeeps (firstname, lastname, rank, uname, pword, pseudonym, email, tier, country, city, state)
VALUES ('Rosemarie', 'Douglass', 'Queen', 'RDuong', 'sanosano', 'Mary', 'rduong@gmail.com', 1, 'USA', 'San Jose', 'CA');";


if (mysqli_multi_query($conn, $sql)) {
    echo "New records created successfully";
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

mysqli_close($conn);

?>

</html>