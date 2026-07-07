import { useEffect, useState } from "react";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function HeroManager() {

     const [data, setData] = useState({});
     const [video, setVideo] = useState(null);
     const [loading, setLoading] = useState(false);
     const [showVideoUploader, setShowVideoUploader] = useState(false);

     const fetchHero = async () => {

          const res = await fetch(`${API}/hero`);
          const json = await res.json();

          if (json) setData(json);

     };

     useEffect(() => { fetchHero() }, []);

     const handleChange = (e) => {

          setData({
               ...data,
               [e.target.name]: e.target.value
          });

     };

     const saveHero = async () => {

          setLoading(true);
          try {

               const formData = new FormData();

               Object.keys(data).forEach(key => {
                    formData.append(key, data[key])
               });

               if (video instanceof File) {
                    formData.append("video", video)
               }

               const res = await fetch(`${API}/hero`, {
                    method: "PUT",
                    body: formData
               });

               const result = await res.json();

               console.log("Update response:", result);

               alert("Hero Updated");
               setVideo(null);
               setShowVideoUploader(false);
               fetchHero();

          } catch (error) {

               console.error("HERO UPDATE ERROR:", error);
               alert("Error updating hero");

          } finally {
               setLoading(false);
          }

     };

     return (

          <div className="min-h-screen bg-white  text-center">
<Breadcrumb/>
             <div className="px-10 pt-10">
                    <h1 className="text-[50px] leading-32">

                         <input
                              name="topText"
                              value={data.topText || ""}
                              onChange={handleChange}
                              placeholder="One Stop Solution"
                              className="text-center w-full"
                         />

                    </h1>

                    <div className="flex justify-center gap-5 text-[50px]">

                         <input
                              name="midLeftText"
                              value={data.midLeftText || ""}
                              onChange={handleChange}
                              placeholder="For"
                              className="w-40 text-center"
                         />

                         <div>

                              {/* Current Video Preview */}
                              {data.video && (
                                   <video
                                        src={data.video}
                                        className="w-130 mx-auto mb-3 rounded-lg"
                                        controls
                                   />
                              )}

                              {/* Change Video Button */}
                              <button
                                   onClick={() => setShowVideoUploader(!showVideoUploader)}
                                   className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer mb-3"
                              >
                                   {showVideoUploader ? "Cancel" : data.video ? " Change Video" : "Upload Video"}
                              </button>

                              {/* Video Upload Input */}
                              {showVideoUploader && (
                                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 w-130 mx-auto bg-gray-50">
                                        <input
                                             type="file"
                                             accept="video/*"
                                             onChange={(e) => setVideo(e.target.files[0])}
                                             className="text-sm"
                                        />
                                        {video && (
                                             <p className="text-green-600 mt-2 text-sm font-medium">
                                                  Selected: {video.name} ({(video.size / (1024 * 1024)).toFixed(1)} MB)
                                             </p>
                                        )}
                                   </div>
                              )}

                         </div>

                         <input
                              name="midRightText"
                              value={data.midRightText || ""}
                              onChange={handleChange}
                              placeholder="All"
                              className="w-40 text-center"
                         />

                    </div>

                    <input
                         name="bottomText"
                         value={data.bottomText || ""}
                         onChange={handleChange}
                         placeholder="Your Design Needs"
                         className="text-[50px] text-center w-full"
                    />

                    <textarea
                         name="description"
                         value={data.description || ""}
                         onChange={handleChange}
                         placeholder="Description"
                         className="border p-4 mt-2 w-120 mx-auto"
                    />

                    <div className="mt-5">

                         <button
                              onClick={saveHero}
                              disabled={loading}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full disabled:opacity-50 cursor-pointer"
                         >
                              {loading ? "Saving..." : "Save Hero"}
                         </button>

                    </div>

             </div>
          </div>

     )
}