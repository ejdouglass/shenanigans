var laststamp = 0;

function testit(timestamp) {
	var inseconds = Math.floor(timestamp / 1000);
	if (inseconds > laststamp) {
		console.log(Math.floor(timestamp / 1000));
		laststamp += 1;
	}
	update();
	draw();
	requestAnimationFrame(testit);
}

requestAnimationFrame(testit);

function update() {

}

function draw() {

}