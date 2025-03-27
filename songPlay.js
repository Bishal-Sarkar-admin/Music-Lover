/* songPlay.js */

// Query DOM elements.
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
const favoritesList = document.getElementById("favoritesList");
const songListContainerh2 = document.querySelector(".favorites-list h2");
songListContainerh2.style.display = "none";

let songs = [];
let currentSongIndex = 0;

// Quality preferences array.
const qualityPreferences = ["320kbps", "160kbps", "96kbps", "48kbps", "12kbps"];

/**
 * Loads a song by its index, updates the UI, and sets up the Media Session API.
 *
 * @param {number} index - The index of the song in the songs array.
 */
function loadSong(index) {
  if (!songs || songs.length === 0 || index < 0 || index >= songs.length) {
    console.error("Invalid song index or no songs available.");
    songTitle.textContent = "No songs available.";
    return;
  }
  const song = songs[index];

  // Update song image with a fallback.
  songImage.src = song.image || "music.png";

  // Update song title and details.
  songTitle.innerHTML = `<span class="song-title-text">${song.title} - ${song.artist} - ${song.album} - ${song.language} - ${song.year}</span>`;

  // Choose the best available audio URL based on quality.
  let selectedURL = null;
  for (const quality of qualityPreferences) {
    if (song.url && song.url[quality]) {
      selectedURL = song.url[quality];
      break;
    }
  }
  if (!selectedURL) {
    console.error("No suitable audio URL found for this song.");
    songTitle.textContent = "Audio not available.";
    return;
  }
  audioPlayer.src = selectedURL;

  // Update Media Session metadata if supported.
  if ("mediaSession" in navigator) {
    updateMediaSessionMetadata(song);
  }

  // Once metadata is loaded, update progress and play (if allowed).
  audioPlayer.onloadedmetadata = () => {
    updateProgress();
    if (document.userInteracted) {
      audioPlayer
        .play()
        .catch((error) => console.error("Playback error:", error));
    }
  };

  updateActiveSong(index);
}

/**
 * Updates the Media Session API metadata and sets up action handlers.
 *
 * @param {Object} song - The song object containing metadata.
 */
function updateMediaSessionMetadata(song) {
  if (!song) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: [{ src: song.image, sizes: "512x512", type: "image/jpg" }],
  });
  navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
  navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
  updateMediaSessionPosition();
}

/**
 * Updates the media session’s position state.
 */
function updateMediaSessionPosition() {
  if (
    "setPositionState" in navigator.mediaSession &&
    !isNaN(audioPlayer.duration)
  ) {
    navigator.mediaSession.setPositionState({
      duration: audioPlayer.duration,
      position: audioPlayer.currentTime,
      playbackRate: audioPlayer.playbackRate || 1,
    });
  }
}
audioPlayer.addEventListener("timeupdate", updateMediaSessionPosition);

// Mark user interaction to satisfy autoplay restrictions.
document.addEventListener("click", () => {
  document.userInteracted = true;
});

/**
 * Toggles play/pause state for the audio player and updates the play button label.
 */
function playPause() {
  if (audioPlayer.paused) {
    audioPlayer
      .play()
      .catch((error) => console.error("Playback error:", error));
    playBtn.textContent = userAgent() ? "⏸️" : "⏸️";
  } else {
    audioPlayer.pause();
    playBtn.textContent = userAgent() ? "▶️" : "▶️";
  }
}

/**
 * Plays the previous track.
 */
function prevTrack() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  if (!audioPlayer.paused) {
    audioPlayer
      .play()
      .catch((error) => console.error("Playback error:", error));
  }
}

/**
 * Plays the next track.
 */
function nextTrack() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  if (!audioPlayer.paused) {
    audioPlayer
      .play()
      .catch((error) => console.error("Playback error:", error));
  }
}

/**
 * Visually highlights the active song in the song list.
 *
 * @param {number} activeIndex - The index of the active song.
 */
function updateActiveSong(activeIndex) {
  const listItems = songList.querySelectorAll("li.song-card");
  listItems.forEach((item, idx) => {
    if (idx === activeIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Utility function to detect mobile user agents.
 *
 * @returns {boolean} True if the user is on a mobile device.
 */
function userAgent() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

/**
 * Initializes button labels based on the device type.
 */
function initializeButtonLabels() {
  playBtn.textContent = userAgent() ? "▶️" : "▶️";
  prevBtn.textContent = userAgent() ? "⏮️" : "⏮️";
  nextBtn.textContent = userAgent() ? "⏭️" : "⏭️";
}

/**
 * Updates the progress bar as the song plays.
 */
function updateProgress() {
  if (audioPlayer.duration) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressThumb.style.width = `${progress}%`;
  }
}
audioPlayer.addEventListener("timeupdate", updateProgress);

progressBar.addEventListener("click", (e) => {
  if (audioPlayer.duration) {
    const rect = progressBar.getBoundingClientRect();
    const clickedX = e.clientX - rect.left;
    const newTime = (clickedX / progressBar.offsetWidth) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
  }
});

// Volume control.
volumeSlider.value = audioPlayer.volume;
volumeSlider.addEventListener("input", () => {
  audioPlayer.volume = volumeSlider.value;
});

// Attach playback control event listeners.
playBtn.addEventListener("click", playPause);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);
audioPlayer.addEventListener("ended", nextTrack);

/**
 * Loads songs from localStorage and creates song cards.
 */
function loadSongsFromLocalStorage() {
  try {
    const songArrayStr = localStorage.getItem("SongArray");

    if (songArrayStr) {
      const parsedSongs = JSON.parse(songArrayStr);
      if (Array.isArray(parsedSongs) && parsedSongs.length > 0) {
        songs = parsedSongs;
        createSongCards(songs);
        // loadSong(currentSongIndex);
      } else {
        throw new Error("No valid songs found.");
      }
    }
    //
    // else {
    //   const data = {
    //     id: "1M",
    //     title: "Badshah O Badshah",
    //     artist: "Anu Malik",
    //     album: "Baadshah",
    //     image: "Badshah O Badshah.jpg",
    //     year: "1999",
    //     language: "hindi",
    //     playCount: "12924854",
    //     url: {
    //       "320kbps": "Baadshah O Baadshah.m4a",
    //     }, // Populate URLS if needed
    //   };

    //   songs.push(data);
    //   createSongCards(songs);
    //   loadSong(currentSongIndex);
    // }
  } catch (error) {
    console.error("Error loading songs from localStorage:", error);
    // songTitle.textContent = "Error loading songs.";
  }
}

/**
 * Creates song cards for each song and appends them to the song list.
 *
 * @param {Array} songArray - The array of song objects.
 */
function createSongCards(songArray) {
  songList.innerHTML = "";
  songListContainerh2.style.display = "none";
  favoritesList.innerHTML = "";
  songArray.forEach((song, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add("song-card");
    listItem.dataset.index = index;
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
      <a class="download-link" href="${
        song.url["320kbps"] || "#"
      }" target="_blank">Download Song</a>
      <button class="favourite-btn" data-song-id="${song.id}">Favourite</button>
    `;
    songList.appendChild(listItem);
  });
}

/**
 * Event delegation for song list clicks.
 * - Clicking on a song card plays the song.
 * - Clicking the Favourite button adds the song to favorites.
 */
songList.addEventListener("click", (event) => {
  const target = event.target;

  // If the favourite button is clicked, stop propagation to avoid playing the song.
  if (target.classList.contains("favourite-btn")) {
    event.stopPropagation();
    const songId = target.dataset.songId;
    const song = songs.find((s) => s.id == songId);
    if (song) {
      addSongToFavorites(song);
    }
    return;
  }

  const listItem = target.closest("li.song-card");
  if (listItem) {
    const index = parseInt(listItem.dataset.index, 10);
    if (!isNaN(index)) {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      playPause();
    }
  }
});

/**
 * Adds a song to favorites and saves it in localStorage.
 *
 * @param {Object} song - The song object to be added.
 */
function addSongToFavorites(song) {
  let favoriteSongs = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  if (favoriteSongs.some((s) => s.id === song.id)) {
    console.log("Song already in favorites");
    return;
  }
  favoriteSongs.push(song);
  localStorage.setItem("favoriteSongs", JSON.stringify(favoriteSongs));
  renderFavoriteSongs();
}

/**
 * Renders the list of favorite songs from localStorage.
 */
function renderFavoriteSongs() {
  if (!favoritesList) return;
  // Clear main song list if you want to show only favorites.
  songList.innerHTML = "";
  favoritesList.innerHTML = "";
  songListContainerh2.style.display = "block";
  const favoriteSongs = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  favoriteSongs.forEach((song) => {
    const favItem = document.createElement("li");
    favItem.classList.add("song-card");
    // Store song ID on the list item.
    favItem.dataset.songId = song.id;
    favItem.innerHTML = `
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
      <a class="download-link" href="${
        song.url["320kbps"] || "#"
      }" target="_blank">Download Song</a>
      <button class="delete-btn" data-song-id="${song.id}">Delete</button>
    `;
    favoritesList.appendChild(favItem);
  });
}

/**
 * Deletes a song from favorites.
 *
 * @param {string|number} songId - The ID of the song to delete.
 */
function deleteFavoriteSong(songId) {
  let favoriteSongs = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  favoriteSongs = favoriteSongs.filter((song) => song.id != songId);
  localStorage.setItem("favoriteSongs", JSON.stringify(favoriteSongs));
  renderFavoriteSongs();
}

// Event delegation for deleting a favorite song.
document.getElementById("favoritesList").addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const songId = event.target.dataset.songId;
    deleteFavoriteSong(songId);
  }
});

// Attach event listener to favoritesList for playing a song.
favoritesList.addEventListener("click", (event) => {
  // Ignore clicks on the delete button.
  if (event.target.classList.contains("delete-btn")) return;

  // Find the closest song card element.
  const favItem = event.target.closest("li.song-card");
  if (!favItem) return;

  // Retrieve the song ID from the list item's data attribute.
  const songId = favItem.dataset.songId;
  const favoriteSongs = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
  const song = favoriteSongs.find((s) => s.id == songId);

  if (song) {
    // Update the song image with a fallback.
    songImage.src = song.image || "default-image.jpg";

    // Update the song title and details.
    songTitle.innerHTML = `<span class="song-title-text">${song.title} - ${song.artist} - ${song.album} - ${song.language} - ${song.year}</span>`;

    // Choose the best available audio URL based on quality preferences.
    let selectedURL = null;
    for (const quality of qualityPreferences) {
      if (song.url && song.url[quality]) {
        selectedURL = song.url[quality];
        break;
      }
    }
    if (!selectedURL) {
      console.error("No suitable audio URL found for this song.");
      songTitle.textContent = "Audio not available.";
      return;
    }
    // Update the audio source and play.
    audioPlayer.src = selectedURL;
    audioPlayer
      .play()
      .then(() => {
        playBtn.textContent = "⏸️";
      })
      .catch((error) => {
        console.error("Playback error:", error);
        playBtn.textContent = "▶️";
      });
  }
});

// Initialize button labels, load songs, and render favorites on page load.
initializeButtonLabels();
loadSongsFromLocalStorage();
// Optionally call renderFavoriteSongs() if needed.
