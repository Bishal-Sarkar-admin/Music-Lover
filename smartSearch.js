async function fetchSmartSearch() {
  // Ensure smartServerhealth exists before modifying it
  if (!smartServerhealth) {
    console.error(
      "Element with ID 'smart-Server-health' not found in the DOM."
    );
    return;
  }

  const songInput = document.getElementById("song");
  const arrayData = songInput ? [songInput.value] : [];

  smartServerhealth.innerHTML = "";

  try {
    // Checking server health
    const testServer = await fetch("https://smart-search-psi.vercel.app/test");
    smartServerhealth.innerHTML = testServer.ok
      ? "Server is healthy"
      : "Server is down";

    if (!testServer.ok) {
      console.warn("Test server is down. Aborting search request.");
      return;
    }

    // Smart search request
    if (testServer.ok) {
      setTimeout(() => {
        smartServerhealth.innerHTML = "Starting Smart Search...";
      }, 30);
    }

    const response = await fetch(
      "https://smart-search-psi.vercel.app/smart-search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "Np2LexNKi2460PSmE3jjssd", // Ensure this is valid
        },
        body: JSON.stringify({ songs: arrayData }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorText}`
      );
    } else {
      smartServerhealth.innerHTML = "Smart Search Completed";
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.suggestedSongs)) {
      console.warn("No 'suggestedSongs' data received from API.");
      return ["error", "No suggested songs data received"];
    }

    const SongArray2 = data.suggestedSongs.map((element) => ({
      id: element.id,
      title: element.title,
      album: element.album,
      artist: element.artist,
      language: element.language,
      year: element.year,
      playCount: element.playCount,
      image: element.image,
      url: {
        "12kbps": element.downloadUrls?.[0]?.url || "",
        "48kbps": element.downloadUrls?.[1]?.url || "",
        "96kbps": element.downloadUrls?.[2]?.url || "",
        "160kbps": element.downloadUrls?.[3]?.url || "",
        "320kbps": element.downloadUrls?.[4]?.url || "",
      },
    }));

    localStorage.setItem("SongArray", JSON.stringify(SongArray2));
    loadSongsFromLocalStorage();
    setTimeout(() => {
      smartServerhealth.innerHTML = "";
    }, 4000);
  } catch (error) {
    console.error("Fetch error:", error.message);
    smartServerhealth.innerHTML = "Smart Search Failed";
  }
}
