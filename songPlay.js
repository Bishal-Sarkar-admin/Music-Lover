const audioPlayer = document.getElementById("audio-player");
const songImage = document.getElementById("song-image");
const songTitle = document.getElementById("song-title");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const progressThumb = document.getElementById("progress-thumb");
const volumeSlider = document.getElementById("volume-slider");
const songList = document.getElementById("song-list");

let songs = [];
let currentSongIndex = 0;

// Function to load a song based on its index.
function loadSong(index) {
  if (index < 0 || index >= songs.length) {
    return; // Prevent out-of-bound errors.
  }

  const song = songs[index];
  songImage.src = song.image;
  songTitle.innerHTML = `<span>${song.title} - ${song.artist}</span>`;

  // Select an audio URL based on quality preference.
  const qualities = ["320kbps", "160kbps", "96kbps", "48kbps", "12kbps"];
  let selectedURL = null;

  for (const quality of qualities) {
    if (song.url && song.url[quality]) {
      selectedURL = song.url[quality];
      break;
    }
  }

  if (selectedURL) {
    audioPlayer.src = selectedURL;
  } else {
    console.error("No suitable audio URL found for this song.");
    songTitle.textContent = "Audio not available.";
    return;
  }

  audioPlayer.onloadedmetadata = () => {
    updateProgress();
  };

  updateActiveSong();
}

// Update the active song in the song list visually.
function updateActiveSong() {
  const listItems = songList.querySelectorAll("li");
  listItems.forEach((item, idx) => {
    if (idx === currentSongIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}
// Detect mobile user agents
function userAgent() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

function playPause() {
  const isMobile = userAgent();
  if (audioPlayer.paused) {
    audioPlayer.play();
    if (playBtn) {
      playBtn.textContent = isMobile ? "⏸️" : "⏸️ Pause";
    }
  } else {
    audioPlayer.pause();
    if (playBtn) {
      playBtn.textContent = isMobile ? "▶️" : "▶️ Play";
    }
  }
}

// Set button text based on the device type
function buttonAgent() {
  const isMobile = userAgent();

  if (playBtn) {
    playBtn.textContent = isMobile ? "▶️" : "▶️ Play";
  }
  if (prevBtn) {
    prevBtn.textContent = isMobile ? "⏮️" : "⏮️ Previous";
  }
  if (nextBtn) {
    nextBtn.textContent = isMobile ? "⏭️" : "⏭️ Next";
  }
}

// Run on page load
buttonAgent();

playBtn.addEventListener("click", playPause);

prevBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  playPause();
});

nextBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  playPause();
});

// Update the progress bar as the song plays.
function updateProgress() {
  if (audioPlayer.duration) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressThumb.style.width = `${progress}%`;
  }
}

audioPlayer.addEventListener("timeupdate", updateProgress);

progressBar.addEventListener("click", (e) => {
  if (audioPlayer.duration) {
    const totalWidth = progressBar.offsetWidth;
    const clickedX = e.offsetX;
    const newTime = (clickedX / totalWidth) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
  }
});

// Volume control
volumeSlider.value = audioPlayer.volume;
volumeSlider.addEventListener("input", () => {
  audioPlayer.volume = volumeSlider.value;
});

// Load songs from localStorage and populate the song list.
function loadSongsFromLocalStorage() {
  songList.innerHTML = ""; // Clear the song list first.
  try {
    const songArrayString = JSON.parse(localStorage.getItem("SongArray"));
    cardCreate(songArrayString);
  } catch (error) {
    console.error("Error loading songs from localStorage:", error);
    songTitle.textContent = "Error loading songs.";
  }
}

function cardCreate(songArrayString) {
  if (songArrayString) {
    songs = songArrayString;
    if (songs && songs.length > 0) {
      songs.forEach((song, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("song-card");
        listItem.addEventListener("click", () => playQueueSong(index));

        listItem.innerHTML = `
            <h2>${song.title}</h2>
            <div class="details">
              <img class="song-image" width="250" height="350" src="${
                song.image
              }" alt="${song.title} Album Art">
            </div>
            <div class="details">
              <p><strong>Artist:</strong> ${song.artist}</p>
              <p><strong>Album:</strong> ${song.album}</p>
              <p><strong>Language:</strong> ${song.language}</p>
              <p><strong>Year:</strong> ${song.year}</p>
              <p><strong>Play Count:</strong> ${song.playCount}</p>
            </div>
            <a href="${
              song.url["320kbps"] || "#"
            }" target="_blank">Download Song</a>
          `;
        listItem.addEventListener("click", () => {
          currentSongIndex = index;
          loadSong(currentSongIndex);
          playPause();
        });
        songList.appendChild(listItem);
      });
      loadSong(currentSongIndex); // Load the initial song.
    } else {
      console.error("No songs found or invalid data in localStorage.");
      songTitle.textContent = "No songs available.";
    }
  } else {
    console.error("No song data found in localStorage.");
    songTitle.textContent = "No songs available.";
  }
}

loadSongsFromLocalStorage(); // Initialize songs from localStorage.
