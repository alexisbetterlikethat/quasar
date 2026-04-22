const gameFrame = document.querySelector(".gameframe");
const container = document.querySelector(".container");
const searchBar = document.querySelector(".search-bar");
const categoriesSwitcher = document.getElementById("categories");
const sortMethodSwitcher = document.getElementById("sortMethod");

const ANIMATION_DELAY_PER_CARD = 30;
const MAX_ANIMATION_DELAY = 600;

let activeGames,
	allGames,
	originalList,
	activeCategory = "all",
	sortMethod = "alphabetically";
search = "";

function loadIframe(path) {
	gameFrame.style.display = "block";
	const actualFrame = document.getElementById("actualGameFrame");
	actualFrame.src = `/assets/storage${path}`;

	actualFrame.addEventListener("load", () => {
		actualFrame.contentWindow.document.addEventListener("keydown", (e) => {
			if (e.key === localStorage.getItem("panicKey")) {
				window.open(localStorage.getItem("panicURL"));
			}
		});
	});
	console.log("loading:" + path);
}

async function renderGames() {
	if (originalList == null) {
		const response = await fetch("/assets/json/storage.json");
		originalList = await response.json();
	}
	let data = [...originalList];

	switch (sortMethod) {
		case "alphabetically":
			data.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case "dateadded":
			data = data.slice().reverse();
			break;
		default:
			data = data.slice().reverse();
			break;
	}
	allGames = data;
	activeGames = allGames.filter((game) => {
		const categoryMatch =
			game.category
				.map((c) => c.toLowerCase())
				.includes(activeCategory.toLowerCase()) || activeCategory === "all";

		const searchMatch =
			search === "" ||
			game.name.toLowerCase().trim().includes(search.toLowerCase()) ||
			game.id.toLowerCase().trim().includes(search.toLowerCase());

		return categoryMatch && searchMatch;
	});
	container.innerHTML = "";
	for (const [index, game] of activeGames.entries()) {
		const card = document.createElement("div");
		card.id = game.id;
		card.classList.add("card");
		card.style.animationDelay = `${Math.min(index * ANIMATION_DELAY_PER_CARD, MAX_ANIMATION_DELAY)}ms`;
		const img = document.createElement("img");
		img.src = `/assets/img${game.img}`;
		img.alt = game.name;
		card.appendChild(img);

		if (game.category && game.category.length > 0) {
			const badge = document.createElement("span");
			badge.classList.add("card-badge");
			badge.textContent = game.category[0];
			card.appendChild(badge);
		}

		const p = document.createElement("p");
		p.textContent = game.name;
		card.appendChild(p);
		container.appendChild(card);
		card.addEventListener("click", () => {
			loadIframe(game.path);
		});
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	await renderGames();
	searchBar.placeholder = `Search all of our ${activeGames.length} gаmes!`;
});
searchBar.addEventListener("input", (e) => {
	search = e.target.value.trim();
	renderGames();
});
categoriesSwitcher.addEventListener("change", async (e) => {
	activeCategory = e.target.value.toLowerCase();
	await renderGames();
});
sortMethodSwitcher.addEventListener("change", async (e) => {
	sortMethod = e.target.value.toLowerCase();
	await renderGames();
});

document.getElementById("closeFrame").addEventListener("click", () => {
	gameFrame.style.display = "none";
	document.getElementById("actualGameFrame").src = "about:blank";
});
document.getElementById("fullscreen").addEventListener("click", () => {
	document.getElementById("actualGameFrame").requestFullscreen();
});
document.getElementById("reload").addEventListener("click", () => {
	document.getElementById("actualGameFrame").contentWindow.location.reload();
});
