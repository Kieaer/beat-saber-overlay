
const webSocket = new WebSocket("ws://14.39.153.3:30001/");
function beatTournament() {
	
	webSocket.addEventListener("open", () => {
		console.log("대회서버 opened");
	});
	
	webSocket.addEventListener("close", () => {
		console.log("대회용 서버가 닫혀있습니다., retrying in 3 seconds");
		setTimeout(beatTournament, 3000);
	});
}beatTournament();
const urlParams = new URLSearchParams(window.location.search);
const ui = (() => {
	var main = document.getElementById("overlay");

	const performance = (() => {
		var rank = document.getElementById("rank");
		var percentage = document.getElementById("percentage");
		var score = document.getElementById("score");
		var combo = document.getElementById("combo");

		function format(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		if (webSocket.readyState === webSocket.OPEN) {
			// 연결 상태 확인 
			let jsonData ={
				"score" : format(data.score),
				"combo" : data.combo,
				"rank" : data.rank,
				"percentage" : (data.currentMaxScore > 0 ? (Math.floor((data.score / data.currentMaxScore) * 1000) / 10) : 0) + "%"
			}
			jsonData.team = urlParams.get('team');
			jsonData.name = urlParams.get('name');
			jsonStr = JSON.stringify(jsonData);
			webSocket.send(jsonStr);
			// 웹소켓 서버에게 정보 전송 
		} else {
			console.log("연결된 웹소켓 서버가 없습니다.");
		}
		return (data) => {
			score.innerText = format(data.score);
			combo.innerText = data.combo;
			rank.innerText = data.rank;
			percentage.innerText = (data.currentMaxScore > 0 ? (Math.floor((data.score / data.currentMaxScore) * 1000) / 10) : 0) + "%";
		}
	})();

	const timer = (() => {
		const radius = 30;
		const circumference = radius * Math.PI * 2;

		var bar = document.getElementById("progress");
		var text = document.getElementById("progress-text");

		var active = false;

		var began;
		var duration;

		var display;

		function format(time) {
			var minutes = Math.floor(time / 60);
			var seconds = time % 60;

			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			return `${minutes}:${seconds}`;
		}

		function update(time) {
			time = time || Date.now();

			var delta = time - began;

			var progress = Math.floor(delta / 1000);
			var percentage = Math.min(delta / duration, 1);

			bar.setAttribute("style", `stroke-dashoffset: ${(1 - percentage) * circumference}px`);

			// Minor optimization
			if (progress != display) {
				display = progress;
				text.innerText = format(progress);
			}
		}

		function loop() {
			if (active) {
				update();
				requestAnimationFrame(loop);
			}
		}

		return {
			start(time, length) {
				active = true;
				
				began = time;
				duration = length;

				loop();
			},

			pause(time) {
				active = false;

				update(time);
			},

			stop() {
				active = false;
				began = undefined;
				duration = undefined;
			}
		}
	})();

	const beatmap = (() => {
		var cover = document.getElementById("image");

		var title = document.getElementById("title");
		var subtitle = document.getElementById("subtitle");
		var artist = document.getElementById("artist");

		var difficulty = document.getElementById("difficulty");
		var bpm = document.getElementById("bpm");
		var njs = document.getElementById("njs");
		
		function format(number) {
			if (Number.isNaN(number)) {
				return "NaN";
			}

			if (Math.floor(number) !== number) {
				return number.toFixed(2);
			}

			return number.toString();
		}

		return (data, time) => {
			if (data.difficulty === "ExpertPlus") {
				data.difficulty = "Expert+";
			}

			cover.setAttribute("src", `data:image/png;base64,${data.songCover}`);

			title.innerText = data.songName;
			subtitle.innerText = data.songSubName;
			
			if (data.levelAuthorName) {
				artist.innerText = `${data.songAuthorName} [${data.levelAuthorName}]`;
			} else {
				artist.innerText = data.songAuthorName;
			}
			

			difficulty.innerText = data.difficulty;
			bpm.innerText = `${format(data.songBPM)} BPM`;

			if (data.noteJumpSpeed) {
				njs.innerText = `${format(data.noteJumpSpeed)} NJS`;
			} else {
				njs.innerText = "";
			}

			timer.start(Date.now(), data.length);
		}
	})();

	return {
		hide() {
			main.classList.add("hidden");
		},

		show() {
			main.classList.remove("hidden");
		},

		performance,
		timer,
		beatmap
	}
})();
