async function fetchDataAndDisplay(song) {
  const songList = document.getElementById("song-list");
  const loadingMessage = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");
  const placeholderImage = "placeholder.png"; // Path to your placeholder image

  songList.innerHTML = ""; // Clear previous results
  loadingMessage.style.display = "block";
  errorMessage.textContent = "";

  try {
    const response = await fetch(
      `https://jiosaavn-3o0zxoj68-sumit-kolhes-projects-94a4846a.vercel.app/api/search/songs?query=${song}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorText}`
      );
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
          // const downloadLinksDiv = document.createElement("div");
          // downloadLinksDiv.classList.add("download-links");

          downloadUrls.forEach((download) => {
            // const downloadLink = document.createElement("a");
            // downloadLink.href = download.url;
            // downloadLink.textContent = `${download.quality} Download`;
            // downloadLink.target = "_blank";
            // downloadLinksDiv.appendChild(downloadLink);
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
          songCard.addEventListener("click", () => {
            // currentSongIndex = index;
            loadSong(currentSongIndex);
            playPause();
          });
          Count++;
          // songCard.appendChild(downloadLinksDiv);
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
}
// Example usage (you'll need to set up the search input and event
// Wait until DOM is fully loaded
// document.addEventListener("DOMContentLoaded", function () {
//   const searchInput = document.getElementById("search-input");
//   if (searchInput) {
//     searchInput.addEventListener(
//       "input",
//       debounce(function () {
//         const searchTerm = searchInput.value;
//         fetchDataAndDisplay(searchTerm);
//       }, 100)
//     );
//   } else {
//     console.error("Element with ID 'search-input' not found.");
//   }
// });

// Debounce function (prevents rapid API calls)
// function debounce(func, delay) {
//   let timeout;
//   return function () {
//     const context = this;
//     const args = arguments;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), delay);
//   };
// }
