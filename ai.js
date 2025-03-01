const menu = document.querySelector("#menu");
const favorite = document.querySelector("#favourite");
const home = document.querySelector("#Home");
const ai = document.querySelector("#ai");

// Initially hide the elements.
favorite.style.display = "none";
home.style.display = "none";
ai.style.display = "none";

// Toggle the display on menu click.
menu.addEventListener("click", () => {
  if (
    favorite.style.display === "none" &&
    home.style.display === "none" &&
    ai.style.display === "none"
  ) {
    favorite.style.display = "flex";
    home.style.display = "flex";
    ai.style.display = "flex";
  } else {
    favorite.style.display = "none";
    home.style.display = "none";
    ai.style.display = "none";
  }
});
function songArrayforAI() {
  const SongsforAI = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  const filteredSongs = SongsforAI.map((element) => ({
    title: element.title,
    album: element.album,
    artist: element.artist,
    language: element.language,
    year: element.year,
  }));
  return filteredSongs;
}

async function fetchAI() {
  try {
    const response = await fetch(
      "https://smart-search-psi.vercel.app/filter-songs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `Np2LexNKi2460PSmE3jjssd`,
        },
        body: JSON.stringify({ songs: songArrayforAI() }),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.suggestedSongs.suggestions;
  } catch (error) {
    console.error("Error fetching AI:", error);
  }
}

async function displayAI() {
  const ai = document.querySelector("#suggestionsList");

  // Create and show the loading message
  let wait = document.createElement("div");
  wait.setAttribute("id", "wait");
  wait.innerText = "Wait a moment, AI is generating a songs list for you...";
  ai.appendChild(wait); // Add loading message to the page

  // Fetch AI-generated song list
  const suggestions = await fetchAI();

  // Remove the loading message after receiving the data
  if (suggestions) {
    wait.remove(); // Correct way to delete an element
  }

  // Check if #aiList exists, otherwise create it
  let aiList = document.querySelector("#aiList");
  if (!aiList) {
    aiList = document.createElement("div"); // Use <div> for better structure
    aiList.setAttribute("id", "aiList");
    ai.appendChild(aiList);
  } else {
    aiList.innerHTML = ""; // Clear old songs
  }

  // Append the AI-generated songs
  suggestions.forEach((element) => {
    const song = document.createElement("div");
    song.classList.add("song");
    song.innerHTML = `
      <span class="song__title">${element.name}</span>
      <span class="song__artist">- ${element.artist}</span>
    `;
    aiList.appendChild(song);
  });
}

// Ensure event delegation happens after the elements exist
document.addEventListener("click", (event) => {
  const song = event.target.closest(".song");
  if (!song) return;

  document.getElementById("song").value =
    song.querySelector(".song__title").textContent;
});
