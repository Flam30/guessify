// Utility functions for Spotify Web API interactions
// Uses NextAuth.js session for authentication

/**
 * Fetch user's Spotify profile using the access token from NextAuth session
 */
export async function fetchSpotifyProfile(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user's playlists from Spotify
 */
export async function fetchUserPlaylists(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch playlists: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch tracks from a specific playlist (handles pagination to get ALL tracks)
 */
export async function fetchPlaylistTracks(
  accessToken: string,
  playlistId: string
) {
  const allTracks: any[] = [];
  let offset = 0;
  const limit = 50; // Spotify's recommended batch size
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();

    // Add tracks from this batch
    allTracks.push(...data.items);

    // Check if there are more tracks
    hasMore = data.next !== null;
    offset += limit;

    console.log(`Fetched ${allTracks.length} tracks so far...`);
  }

  console.log(`Total tracks fetched: ${allTracks.length}`);

  // Return in the same format as the original API response
  return {
    items: allTracks,
    total: allTracks.length,
  };
}
