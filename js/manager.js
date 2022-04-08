function connect() {
	var ip = query.get("ip") || "127.0.0.1";
	var port = query.get("port") || 30001;

	var socket = new WebSocket(`ws://${ip}:${port}`);

	socket.addEventListener("open", () => {
		console.log("WebSocket opened");
	});

	socket.addEventListener("message", function (e) {
		var data = JSON.parse(e.data);
		var event = events[data.event];

		if (event) {
			event(data.status, data.time);
		}
	});


	socket.addEventListener("close", () => {
		console.log("Failed to connect to server, retrying in 3 seconds");
		setTimeout(connect, 3000);
	});
}

connect();
