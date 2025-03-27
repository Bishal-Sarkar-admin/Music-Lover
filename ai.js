const menu = document.querySelector("#menu");
const favorite = document.querySelector("#favourite");
const home = document.querySelector("#Home");
const ai = document.querySelector("#ai");
const search = document.querySelector("#search");
const hideandseek = document.querySelector(".hideandseek");
const instraction = document.querySelector("#instraction");
// const favoritesList = document.querySelector("#favoritesList");
// Initially hide the elements.

favorite.style.display = "none";
home.style.display = "none";
ai.style.display = "none";
hideandseek.style.display = "none";
// favoritesList.style.display = "none";
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
home.addEventListener("click", () => {
  instraction.innerHTML = "Wellcome To Home page";
  setTimeout(() => {
    instraction.innerHTML = "";
  }, 2000);

  hideandseek.style.display = "none";
});
favorite.addEventListener("click", () => {
  const SongsforAI = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  if (SongsforAI.length === 0) {
    instraction.innerHTML = "No Favorite Songs Found";
    setTimeout(() => {
      instraction.innerHTML = "";
    }, 2000);
  } else {
    instraction.innerHTML = "Wellcome To Favorite Songs page";
    setTimeout(() => {
      instraction.innerHTML = "";
    }, 2000);
  }
});
ai.addEventListener("click", () => {
  let SongsforAI = [];
  try {
    SongsforAI = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  } catch (error) {
    console.error("Error parsing favorite songs:", error);
    SongsforAI = [];
  }

  if (SongsforAI.length === 0) {
    favoritesList.style.display = "none";
    hideandseek.style.display = "none";
    instraction.innerHTML =
      "No Favorite Songs Found. At First, Add Songs to Your Favorite List";

    setTimeout(() => {
      instraction.innerHTML = "";
    }, 4000);
  } else {
    instraction.innerHTML = "Welcome to Your AI Song Recommendation Page";
    if (typeof displayAI === "function") {
      displayAI();
    } else {
      console.warn("displayAI function is not defined");
    }
  }
});

search.addEventListener("click", () => {
  const SongsforAI = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  if (SongsforAI.length === 0) {
    hideandseek.style.display = "none";
  } else {
    hideandseek.style.display = "block";
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
  instraction.innerText =
    "Wait a moment, AI is generating a songs list for you...";
  setTimeout(() => {
    instraction.innerHTML = "";
  }, 8000);

  // Fetch AI-generated song list
  const suggestions = await fetchAI();

  // Remove the loading message after receiving the data
  if (!suggestions) {
    instraction.innerText = "No, AI generated songs are not Found";
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
