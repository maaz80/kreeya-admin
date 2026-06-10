import { useEffect, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function OpeningVideoManager() {
     const [data, setData] = useState({});
     const [video, setVideo] = useState(null);
     const [loading, setLoading] = useState(false);

     const fetchVideo = async () => {
          const res = await fetch(`${API}/opening-video`);
          const json = await res.json();
          if (json) setData(json);
     };

     useEffect(() => { fetchVideo() }, []);

     const saveVideo = async () => {
          if (!video) return alert("Pehle video select karo!");
          setLoading(true);
          try {
               const formData = new FormData();
               formData.append("video", video);

               const res = await fetch(`${API}/opening-video`, {
                    method: "PUT",
                    body: formData
               });

               await res.json();
               alert("Opening Video Updated!");
               fetchVideo();
          } catch (error) {
               console.error("Error:", error);
               alert("Error uploading video");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="min-h-screen bg-white p-10 text-center">
               <h1 className="text-3xl font-bold mb-8">Opening Video Manager</h1>

               {/* Current Video Preview */}
               {data.video && (
                    <div className="mb-6">
                         <p className="text-gray-500 mb-2">Current Video:</p>
                         <video
                              src={data.video}
                              className="w-130 mx-auto rounded-lg"
                              controls
                         />
                    </div>
               )}

               {/* Upload New Video */}
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-130 mx-auto">
                    <p className="text-gray-500 mb-4">Naya Video Upload Karo</p>
                    <input
                         type="file"
                         accept="video/*"
                         onChange={(e) => setVideo(e.target.files[0])}
                         className="mx-auto"
                    />
                    {video && (
                         <p className="text-green-500 mt-2">
                              Selected: {video.name}
                         </p>
                    )}
               </div>

               <button
                    onClick={saveVideo}
                    disabled={loading}
                    className="bg-orange-500 text-white px-10 py-4 rounded-full mt-6 disabled:opacity-50"
               >
                    {loading ? "Uploading..." : "Save Video"}
               </button>
          </div>
     );
}