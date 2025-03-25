const smartServerhealth = document.getElementById("smart-Server-health");
async function fetchDataAndDisplay() {
  const songList = document.getElementById("song-list");
  const loadingMessage = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");
  const placeholderImage = "placeholder.png"; // Path to your placeholder image
  const song = document.getElementById("song").value;
  songList.innerHTML = ""; // Clear previous results
  loadingMessage.style.display = "block";
  errorMessage.textContent = "";
  smartServerhealth.innerHTML = "";
  setTimeout(() => {
    smartServerhealth.innerHTML = "Starting Normal Search...";
  }, 10);
  try {
    const response = await fetch(
      `https://musiclovercom.vercel.app/api/search/songs?query=${song}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorText}`
      );
      smartServerhealth.innerHTML = "Normal Search Failed";
    } else {
      smartServerhealth.innerHTML = "Normal Search Completed";
    }

    const jsonData = await response.json();
    const results = jsonData?.data?.results;
    const SongArray = [];
    let Count = 0;
    if (Array.isArray(results)) {
      loadingMessage.style.display = "none";

      results.forEach((songData) => {
        const songCard = document.createElement("li");
        songCard.classList.add("song-card");

        const songName = songData?.name ?? "Unknown Song";
        const songId = songData?.id;
        const primaryArtistName =
          songData?.artists?.primary?.[0]?.name ?? "Unknown Artist";
        const albumName = songData?.album?.name ?? "Unknown Album";
        const Language = songData?.language ?? "Unknown Language";
        const Year = songData?.year ?? "Unknown Year";
        const playCount = songData?.playCount ?? 0;
        const imageURL = songData?.image?.[2]?.url ?? placeholderImage;

        const downloadUrls = songData?.downloadUrl ?? [];
        const url = {};
        if (downloadUrls.length > 0) {
          downloadUrls.forEach((download) => {
            url[download.quality] = download.url;
          });

          songCard.innerHTML = `
                    <h2>${songName}</h2>
                    <div class="details">
                    <img class="song-image" width="250" height="350" src="${imageURL}" alt="${songName} Album Art">
                    </div>
                    <div onClick="playSong(${Count})" class="details">
                        <p><strong>Artist:</strong> ${primaryArtistName}</p>
                        <p><strong>Album:</strong> ${albumName}</p>
                        <p><strong>Language:</strong> ${Language}</p>
                        <p><strong>Year:</strong> ${Year}</p>
                        <p><strong>Play Count:</strong> ${playCount}</p>
                        
                    </div>
                    
                `;

          Count++;
        }

        const data = {
          id: songId,
          title: songName,
          artist: primaryArtistName,
          album: albumName,
          image: imageURL,
          year: Year,
          language: Language,
          playCount: playCount,
          url: url, // Populate URLS if needed
        };
        SongArray.push(data);
        songList.appendChild(songCard);
      });
    } else {
      loadingMessage.style.display = "none";
      errorMessage.textContent = "No results found for your search."; // More user-friendly message
      console.error("Invalid data format received from API:", jsonData);
    }

    localStorage.setItem("SongArray", JSON.stringify(SongArray));
  } catch (error) {
    loadingMessage.style.display = "none";
    errorMessage.textContent =
      "Error fetching or processing data: " + error.message;
    console.error("Error fetching or processing data:", error);
  }
  setTimeout(() => {
    smartServerhealth.innerHTML = "";
  }, 3000);
}

function playSong(index) {
  loadSongsFromLocalStorage();
  currentSongIndex = index;
  loadSong(currentSongIndex);
  playPause();
  playQueueSong(index);
}
// Load songs from localStorage and populate the song list.
