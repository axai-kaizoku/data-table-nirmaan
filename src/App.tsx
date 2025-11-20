import data from "@/consts/spotify_songs.json";
export default function App() {
  const first20 = data?.slice(0, 20);
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="p-20">
        <h1 className="text-2xl font-semibold">Mock Data</h1>
        <pre>{JSON.stringify(first20, null, 2)}</pre>
      </div>
    </div>
  );
}
