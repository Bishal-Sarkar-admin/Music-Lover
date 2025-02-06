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
let trackSongIndex = 0;
// Function to load a song based on its index.
function loadSong(index) {
  if (index < 0 || index >= songs.length) {
    return; // Prevent out-of-bound errors.
  }

  const song = songs[index];
  songImage.src = song.image || "default-image.jpg"; // Ensure a fallback image
  songTitle.innerHTML = `<span class="song-title-text">${song.title} - ${song.artist} - ${song.album} - ${song.language} - ${song.year} </span>`;

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

  // ✅ Ensure media session metadata updates correctly
  if ("mediaSession" in navigator) {
    updateMediaSessionMetadata(song);
  }

  // ✅ Update progress bar & ensure playback starts only after user interaction
  audioPlayer.onloadedmetadata = () => {
    updateProgress();
    if (document.userInteraction) {
      audioPlayer
        .play()
        .catch((error) => console.error("Playback error:", error));
    }
  };

  updateActiveSong();
}

// ✅ Function to update Media Session metadata
function updateMediaSessionMetadata(song) {
  if (!song.image) return; // Avoid errors with missing images

  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: [{ src: song.image, sizes: "512x512", type: "image/jpg" }],
  });

  // ✅ Ensure media session controls work
  navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
  navigator.mediaSession.setActionHandler("nexttrack", nextTrack);

  // ✅ Update media session progress
  updateMediaSessionPosition();
}

// ✅ Function to update Media Session progress bar
function updateMediaSessionPosition() {
  if (
    "setPositionState" in navigator.mediaSession &&
    !isNaN(audioPlayer.duration)
  ) {
    navigator.mediaSession.setPositionState({
      duration: audioPlayer.duration, // Total duration
      position: audioPlayer.currentTime, // Current progress
      playbackRate: audioPlayer.playbackRate || 1, // Speed (usually 1)
    });
  }
}

// ✅ Ensure media session position updates every second
audioPlayer.addEventListener("timeupdate", updateMediaSessionPosition);

// ✅ Function to handle user interaction
document.addEventListener("click", () => {
  document.userInteraction = true; // Set user interaction flag
});

// Function to handle previous track
function prevTrack() {
  trackSongIndex = (trackSongIndex - 1 + songs.length) % songs.length;
  loadSong(trackSongIndex);
}

// Function to handle next track
function nextTrack() {
  trackSongIndex = (trackSongIndex + 1) % songs.length;
  loadSong(trackSongIndex);
}

// Add event listeners **ONCE** (not inside `loadSong()`)
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

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
  trackSongIndex = currentSongIndex;
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
    nextBtn.textContent = isMobile ? "⏭️" : "Next ⏭️";
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
// Automatically play the next song when the current one ends
audioPlayer.addEventListener("ended", () => {
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
            <a id="downloadLink" href="${
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

////
