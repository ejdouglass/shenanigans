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
	$jsonarray = json_decode($json);
	$monthnum = $jsonarray->monthnum;
} else {
	// For debugging purposes, if we run the script by itself, we'll just run it assuming a 3-month month population.
	$monthnum = 3;
}

// We can use $variable = strtotime("+3 Months") should work. Apparently it's pretty flexible. We can use this for our for-loop below, probably.
// Also possible, apparently: strtotime(year-month-date). Easier to increment the month by 1 here, EXCEPT when 12 becomes 1 again. A little extra jiggering there.

// HERE: Open up a for-loop. For month starting now, up to number of months ahead to populate.
for ($month = 0; $month < $monthnum; $month++) {
	// GENERAL FUNCTION NOTE: Some of these things will be strings! Some will not. During debugging, we may have to play with that.

	// Starting at the current month, we need to produce a table name in the desired format, "MonthYear", i.e. September2017.
	// Basically at each point we need to define the month we want to look at... the new $nowmonth... and update the year, as well, to be safe.

	// Since this always is starting from "today," this little bit brings us into that proper month for this loop.
	$nowtime = strtotime("+" . $month . " Months");

	// The textual representation of the current month in examination, i.e. March, followed by the year of that month.
	$nowmonth = date("F", $nowtime);
	$nowyear = date("Y", $nowtime);

	// This should yield the properly formatted monthyear for the table, i.e. September2017.
	$thismonthtable = $nowmonth . $nowyear;

	// Here we check whether the table for the given month exists, skips to the next month if so, and creates the table if not.
	$checkformonth = mysqli_query($conn, "SELECT 1 FROM " . $thismonthtable . " LIMIT 1");
	if ($checkformonth) {
		// This table already exists; pop out to the next iteration of the for-loop.
		continue;
	} else {
		// Make that table, bro! What we need for it: proper number of days, and core data in its User Zero: number of days, starting day, final day, final day of previous month.
		$sql = "CREATE TABLE " . $thismonthtable . " (id INT(6)";
		$daysthismonth = date("t", $nowtime);
		$firstday = date("D", strtotime($nowyear . "-" . $nowmonth . "-01"));
		$lastday = date("D", strtotime($nowyear . "-" . $nowmonth . "-" . $daysthismonth));
		$daysthismonthint = intval($daysthismonth);
		// Build-a-sql-statement! This for loop will put together the statement that will build our new table.
		for ($day = 1; $day <= $daysthismonthint; $day++) {
			$sql = $sql . ", day" . strval($day) . " VARCHAR(2000)";
		}
		$sql .= ")";

		if (mysqli_query($conn, $sql)) {
			// Here we can assume the table was successfully made, thus we can throw the desired variables into User Zero.
			echo "Alright, we have a new table named " . $thismonthtable . "! Neato!";
			// Building a string that will be our builder data for the calendar. Let's see, format... 
			// First day, last day, both three letters; number of days, double-digit number; so like MONSAT31
			$calbuildata = $firstday . $lastday . $daysthismonth;
			// INSERT the starter/builder data at ID 0. Should be safe to do it this way, since nobody else will be allowed to be user 0.
			$sql = "INSERT INTO " . $thismonthtable . " (id, day1) VALUES ('0', '" . $calbuildata . "'
			)";
			if (mysqli_query($conn, $sql)) {
				echo "And furthermore, the builder data is now in there, too. How very handy!";
			} else {
				echo "We couldn't populate that first build data because " . mysqli_error($conn);
			}
		} else {
			echo "So our monthly table did not come into glorious existence because " . mysqli_error($conn);
		}
	}
}

mysqli_close($conn);

?>

</body>
</html>