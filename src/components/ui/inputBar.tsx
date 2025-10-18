"use client";
// Input bar component for user link input
import { useId, useState } from "react";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchPlaylistTracks } from "../../script";

interface Track {
  track: {
    name: string;
    artists: Array<{ name: string }>;
    id: string;
  };
}

export default function Component() {
  const id = useId();
  const { data: session } = useSession();
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Extract playlist ID from Spotify URL
  const extractPlaylistId = (url: string) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const handleGetPlaylist = async () => {
    const accessToken = (session as any)?.token?.access_token;
    if (!accessToken) {
      setError("Please sign in first");
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError("Invalid Spotify playlist URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchPlaylistTracks(accessToken, playlistId);
      setTracks(data.items);
      console.log("Fetched tracks:", data.items);
    } catch (err) {
      setError("Failed to fetch playlist tracks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="*:not-first:mt-2">
      <div className="flex items-center justify-between gap-1">
        <Label htmlFor={id} className="leading-6">
          {`Playlist > Share > Copy link to playlist`}
        </Label>
      </div>
      <div className="flex rounded-md shadow-xs">
        <Input
          id={id}
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
          placeholder="https://open.spotify.com/playlist"
          type="text"
        />
        <button
          onClick={handleGetPlaylist}
          disabled={loading || !session}
          className="border-input bg-background text-foreground hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center rounded-e-md border px-3 text-sm font-medium transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get"}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {tracks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            Playlist Songs ({tracks.length} tracks):
          </h3>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {tracks.map((item, index) => (
              <div
                key={item.track.id || index}
                className="p-2 bg-muted/50 hover:bg-muted/80 border border-border rounded text-sm text-foreground transition-colors"
              >
                <strong className="text-foreground">{item.track.name}</strong>{" "}
                <span className="text-muted-foreground">by</span>{" "}
                <span className="text-muted-foreground">
                  {item.track.artists.map((artist) => artist.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
