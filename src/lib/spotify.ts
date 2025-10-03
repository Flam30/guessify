export async function getPlaylistTracks(playlistId: string, accessToken: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`)
  }

  const data = await response.json()
  
  // Extract URIs from response
  return data.items.map((item: any) => ({
    uri: item.track.uri,
    name: item.track.name,
    artist: item.track.artists[0].name,
  }))
}

export function extractPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}