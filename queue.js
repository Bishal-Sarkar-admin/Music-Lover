const queue = JSON.parse(localStorage.getItem("favoriteSongs")) || [];

function playQueueSong(index) {
  try {
    const songArray = localStorage.getItem("SongArray");
    const favoriteSongArray = localStorage.getItem("favoriteSongs");

    if (songArray) {
      const mySongs = JSON.parse(songArray);
      const favoriteSongs = favoriteSongArray
        ? JSON.parse(favoriteSongArray)
        : [];

      if (mySongs && mySongs.length > 0) {
        const songToAdd = mySongs[index];

        // Check if song is already in queue
        const isAlreadyInQueue = queue.some(
          (element) => element.id === songToAdd.id
        );

        // Check if song is already in FavoriteSongs
        const isAlreadyInFavorite = favoriteSongs.some(
          (element) => element.id === songToAdd.id
        );

        // Exit function early if song is already in queue or favorites
        if (isAlreadyInQueue || isAlreadyInFavorite) {
          console.log("Song already in queue or favorites");
          return;
        }

        // Add song to queue
        queue.push(songToAdd);
        console.log("Song added to queue");
      }
    }
  } catch (error) {
    console.error("Error loading songs from localStorage:", error);

    // Ensure songTitle exists before using it
    if (typeof songTitle !== "undefined" && songTitle) {
      songTitle.textContent = "Error loading songs.";
    }
  }
}

//
function loadfavoriteSongs() {
  document.getElementById("song-list").innerHTML = ""; // Clear the song list first.
  try {
    const favoriteSongsArray = queue;
    cardCreate(favoriteSongsArray);
  } catch (error) {
    console.error("Error loading favorite songs from localStorage:", error);
    songTitle.textContent = "Error loading songs.";
  }
}

//
window.addEventListener("beforeunload", function (event) {
  // Show a browser confirmation dialog
  event.preventDefault();
  event.returnValue = "Tusi ja rahe ho?"; // Required for modern browsers

  // Because confirm() doesn't work inside beforeunload, we use a workaround
  setTimeout(() => {
    const userConfirmed = confirm("Tusi ja rahe ho?");
    if (userConfirmed) {
      saveFavoriteSongs(); // Save data if the user says "Yes"
      window.removeEventListener("beforeunload", preventUnload); // Allow leaving
      window.location.reload(); // Reload the page manually
    }
  }, 0);

  return false; // Prevent default unload
});

// Temporary function to block unload if the user cancels
function preventUnload(event) {
  event.preventDefault();
  event.returnValue = "";
}

// Attach unload prevention
window.addEventListener("beforeunload", preventUnload);

function saveFavoriteSongs() {
  console.log("Saving favorite songs before leaving...");
  localStorage.setItem("favoriteSongs", JSON.stringify(queue));
}
