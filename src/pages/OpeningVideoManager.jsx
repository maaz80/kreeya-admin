import { useEffect, useRef, useState } from "react";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function OpeningVideoManager() {
     const [data, setData] = useState({});
     const [video, setVideo] = useState(null);
     const [loading, setLoading] = useState(false);
     const [showUploader, setShowUploader] = useState(false);
     const [previewUrl, setPreviewUrl] = useState(null);
     const [toast, setToast] = useState({ show: false, message: "", type: "" });
     const fileInputRef = useRef(null);

     const showToast = (message, type = "success") => {
          setToast({ show: true, message, type });
          setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
     };

     const fetchVideo = async () => {
          try {
               const res = await fetch(`${API}/opening-video`);
               const json = await res.json();
               if (json) setData(json);
          } catch (err) {
               console.error("Fetch error:", err);
          }
     };

     useEffect(() => { fetchVideo() }, []);

     const handleFileChange = (e) => {
          const file = e.target.files[0];
          if (file) {
               setVideo(file);
               setPreviewUrl(URL.createObjectURL(file));
          }
     };

     const cancelUpload = () => {
          setVideo(null);
          setPreviewUrl(null);
          setShowUploader(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
     };

     const saveVideo = async () => {
          if (!video) return showToast("Pehle video select karo!", "error");
          setLoading(true);
          try {
               const formData = new FormData();
               formData.append("video", video);

               const res = await fetch(`${API}/opening-video`, {
                    method: "PUT",
                    body: formData
               });

               if (!res.ok) throw new Error("Upload failed");

               await res.json();
               showToast("Opening Video Updated Successfully! ");
               cancelUpload();
               fetchVideo();
          } catch (error) {
               console.error("Error:", error);
               showToast("Error uploading video", "error");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="min-h-screen bg-white">
               <Breadcrumb />

               {/* Toast Notification */}
               {toast.show && (
                    <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"
                         }`}>
                         {toast.message}
                    </div>
               )}

               <div className="px-6 md:px-10 pt-6 pb-10">
                    <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                         Opening Video Manager
                    </h1>

                    {/* Current Video Card */}
                    <div className="max-w-2xl mx-auto">
                         {data.video ? (
                              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                   <p className="text-gray-600 font-medium mb-3 text-sm uppercase tracking-wide">
                                        Current Opening Video
                                   </p>
                                   <video
                                        src={data.video}
                                        className="w-full rounded-xl"
                                        controls
                                   />
                                   <button
                                        onClick={() => setShowUploader(!showUploader)}
                                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                   >
                                        {showUploader ? "Cancel" : "Change Video"}
                                   </button>
                              </div>
                         ) : (
                              <div className="bg-gray-50 rounded-2xl p-10 mb-6 border border-dashed border-gray-300 text-center">
                                   <p className="text-gray-400 text-lg mb-2">No video uploaded yet</p>
                                   <button
                                        onClick={() => setShowUploader(true)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                   >
                                        Upload Video
                                   </button>
                              </div>
                         )}

                         {/* Upload Section */}
                         {showUploader && (
                              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                   <p className="text-blue-700 font-medium mb-4 text-sm uppercase tracking-wide">
                                        Upload New Video
                                   </p>

                                   <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-white">
                                        <input
                                             ref={fileInputRef}
                                             type="file"
                                             accept="video/*"
                                             onChange={handleFileChange}
                                             className="mx-auto text-sm"
                                        />
                                        {video && (
                                             <p className="text-green-600 mt-2 text-sm font-medium">
                                                  Selected: {video.name} ({(video.size / (1024 * 1024)).toFixed(1)} MB)
                                             </p>
                                        )}
                                   </div>

                                   {/* New Video Preview */}
                                   {previewUrl && (
                                        <div className="mt-4">
                                             <p className="text-gray-500 text-sm mb-2">Preview:</p>
                                             <video
                                                  src={previewUrl}
                                                  className="w-full rounded-xl"
                                                  controls
                                             />
                                        </div>
                                   )}

                                   {/* Action Buttons */}
                                   <div className="flex justify-center gap-3 mt-5">
                                        <button
                                             onClick={cancelUpload}
                                             className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             onClick={saveVideo}
                                             disabled={loading || !video}
                                             className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                             {loading ? " Uploading..." : " Save Video"}
                                        </button>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}