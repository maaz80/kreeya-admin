import { useEffect, useState } from "react";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function Technologies() {
     const [uploading, setUploading] = useState(false);
     const [images, setImages] = useState([]);
     const [showModal, setShowModal] = useState(false);
     const [title, setTitle] = useState("");
     const [file, setFile] = useState(null);
     const [editItem, setEditItem] = useState(null);

     const fetchImages = async () => {
          try {
               const res = await fetch(`${API}/technologies`);
               const data = await res.json();
               if (Array.isArray(data)) {
                    setImages(data);
               }
          } catch (e) {
               console.error("Error fetching technology images", e);
          }
     };

     useEffect(() => {
          fetchImages();
     }, []);

     const uploadImage = async () => {
          if (!title || !file) return;

          setUploading(true);

          const formData = new FormData();
          formData.append("title", title);
          formData.append("image", file);

          try {
               await fetch(`${API}/technologies`, {
                    method: "POST",
                    body: formData
               });
          } catch (e) {
               console.error("Error uploading image", e);
          }

          setUploading(false);
          setShowModal(false);
          setTitle("");
          setFile(null);
          fetchImages();
     };

     const updateImage = async () => {
          if (!editItem || !title) return;

          setUploading(true);

          try {
               await fetch(`${API}/technologies/${editItem._id}`, {
                    method: "PUT",
                    headers: {
                         "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ title })
               });
          } catch (e) {
               console.error("Error updating image", e);
          }

          setUploading(false);
          setShowModal(false);
          setTitle("");
          setEditItem(null);
          fetchImages();
     };

     const deleteImage = async (id) => {
          if (!window.confirm("Are you sure you want to delete this technology logo?")) return;
          try {
               await fetch(`${API}/technologies/${id}`, {
                    method: "DELETE"
               });
               fetchImages();
          } catch (e) {
               console.error("Error deleting image", e);
          }
     };

     return (
          <div className="min-h-screen bg-white">
               <Breadcrumb />
               <div className="max-w-6xl mx-auto px-10 pt-10">
                    <div className="flex justify-between mb-10">
                         <h1 className="text-3xl font-semibold">
                              Technologies We Use
                         </h1>
                         <button
                              onClick={() => {
                                   setEditItem(null);
                                   setTitle("");
                                   setFile(null);
                                   setShowModal(true);
                              }}
                              className="bg-orange-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:scale-105 hover:bg-orange-400 transition-all duration-300 ease-in-out">
                              Upload
                         </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                         {images.map(item => (
                              <div key={item._id} className="rounded-xl p-4 shadow hover:shadow-lg border border-gray-100 flex flex-col justify-between">
                                   <div>
                                        <div className="w-full h-40 bg-gray-50 flex items-center justify-center p-2 rounded">
                                             <img
                                                  src={item.image}
                                                  alt={item.title}
                                                  className="max-w-full max-h-full object-contain rounded"
                                             />
                                        </div>
                                        <h2 className="mt-3 font-medium text-lg text-gray-800">
                                             {item.title}
                                        </h2>
                                   </div>
                                   <div className="flex gap-3 mt-4">
                                        <button
                                             onClick={() => {
                                                  setEditItem(item);
                                                  setTitle(item.title);
                                                  setShowModal(true);
                                             }}
                                             className="bg-gray-100 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-200 transition-all duration-300 ease-in-out">
                                             Edit
                                        </button>
                                        <button
                                             onClick={() => deleteImage(item._id)}
                                             className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600 transition-all duration-300 ease-in-out">
                                             Delete
                                        </button>
                                   </div>
                              </div>
                         ))}
                    </div>
               </div>

               {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
                         <div className="bg-white p-8 rounded-lg w-[350px]">
                              <h2 className="text-xl mb-4 font-semibold">
                                   {editItem ? "Edit Technology Title" : "Upload Technology Logo"}
                              </h2>

                              <input
                                   value={title}
                                   onChange={(e) => setTitle(e.target.value)}
                                   placeholder="Logo title (e.g. React)"
                                   className="border w-full p-2 mb-3 rounded"
                              />

                              {!editItem && (
                                   <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500 transition relative">
                                        <input
                                             type="file"
                                             accept="image/*"
                                             onChange={(e) => setFile(e.target.files[0])}
                                             className="absolute inset-0 opacity-0 cursor-pointer"
                                        />

                                        {file ? (
                                             <div className="flex flex-col items-center gap-2 w-full">
                                                  <img
                                                       src={URL.createObjectURL(file)}
                                                       className="max-w-full h-24 object-contain rounded-lg"
                                                       alt="Preview"
                                                  />
                                                  <p className="text-sm text-gray-600 truncate max-w-full">
                                                       {file.name}
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                       Click to change image
                                                  </p>
                                             </div>
                                        ) : (
                                             <div className="flex flex-col items-center gap-3">
                                                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
                                                       <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-6 h-6 text-gray-500"
                                                       >
                                                            <path
                                                                 strokeLinecap="round"
                                                                 strokeLinejoin="round"
                                                                 d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                                                            />
                                                       </svg>
                                                  </div>
                                                  <p className="text-sm text-gray-700">
                                                       Drop your image here, or
                                                       <span className="text-orange-500 font-medium ml-1">
                                                            browse
                                                       </span>
                                                  </p>
                                                  <p className="text-xs text-gray-400">
                                                       Supports JPG, JPEG, PNG, WEBP
                                                  </p>
                                             </div>
                                        )}
                                   </div>
                              )}

                              <div className="flex justify-end gap-3 mt-4">
                                   <button
                                        onClick={() => setShowModal(false)}
                                        className="border px-4 py-2 rounded cursor-pointer">
                                        Cancel
                                   </button>
                                   <button
                                        onClick={editItem ? updateImage : uploadImage}
                                        disabled={
                                             uploading ||
                                             (!editItem && (!title || !file)) ||
                                             (editItem && !title)
                                        }
                                        className={`px-4 py-2 rounded flex items-center justify-center gap-2 cursor-pointer
                                             ${uploading || (!title || (!editItem && !file))
                                                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                                  : "bg-orange-500 hover:bg-orange-600 text-white"
                                             }`}
                                   >
                                        {uploading ? (
                                             <>
                                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                  Saving...
                                             </>
                                        ) : (
                                             editItem ? "Save" : "Upload"
                                        )}
                                   </button>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
