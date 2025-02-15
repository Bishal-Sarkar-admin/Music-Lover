// Initialize the queue from localStorage or an empty array.
const queue = JSON.parse(localStorage.getItem("favoriteSongs")) || [];

/**
 * Adds a song to the queue based on its index in SongArray.
 * The song is added only if it is not already in the queue or favorites.
 *
 * @param {number} index - The index of the song in the SongArray.
 */
function playQueueSong(index) {
  try {
    const songArrayStr = localStorage.getItem("SongArray");
    const favoriteSongArrayStr = localStorage.getItem("favoriteSongs");

    if (songArrayStr) {
      const mySongs = JSON.parse(songArrayStr);
      const favoriteSongs = favoriteSongArrayStr
        ? JSON.parse(favoriteSongArrayStr)
        : [];

      if (mySongs && mySongs.length > 0) {
        const songToAdd = mySongs[index];

        // Check if the song already exists in the queue or favorites.
        const isAlreadyInQueue = queue.some(
          (element) => element.id === songToAdd.id
        );
        const isAlreadyInFavorite = favoriteSongs.some(
          (element) => element.id === songToAdd.id
        );

        if (isAlreadyInQueue || isAlreadyInFavorite) {
          console.log("Song already in queue or favorites");
          return;
        }

        queue.push(songToAdd);
      }
    }
  } catch (error) {
    console.error("Error loading songs from localStorage:", error);
    if (typeof songTitle !== "undefined" && songTitle) {
      songTitle.textContent = "Error loading songs.";
    }
  }
}

/**
 * Loads the favorite songs and renders them.
 */
function loadFavoriteSongs() {
  try {
    // Call the render function (declared in songPlay.js) to display favorites.
    renderFavoriteSongs();
  } catch (error) {
    console.error("Error loading favorite songs:", error);
    if (typeof songTitle !== "undefined" && songTitle) {
      songTitle.textContent = "Error loading songs.";
    }
  }
}

/////////
