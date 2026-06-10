import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function About() {

     const [about, setAbout] = useState([]);
     const [title, setTitle] = useState("");
     const [quote, setQuote] = useState("");

     const [leftImg, setleftImg] = useState(null);
     const [rightImg, setrightImg] = useState(null);

     const [editItem, setEditItem] = useState(null);
     const [showModal, setShowModal] = useState(false);


     const fetchAbout = async () => {

          try {

               const res = await fetch(`${API}/about`);

               if (!res.ok) {
                    throw new Error("API error");
               }

               const data = await res.json();
               console.log(res);

               setAbout(data);

          } catch (err) {

               console.error("About fetch error:", err);

          }

     };

     useEffect(() => {
          fetchAbout()
     }, [])
     const openUpload = () => {

          setEditItem(null);
          setTitle("");
          setQuote("");
          setleftImg(null);
          setrightImg(null);

          setShowModal(true);

     };


     const openEdit = (item) => {

          setEditItem(item);
          setTitle(item.title);
          setQuote(item.quote);

          setleftImg(item.leftImg);
          setrightImg(item.rightImg);

          setShowModal(true);
     };


     const saveAbout = async () => {

          const formData = new FormData();

          formData.append("title", title);
          formData.append("quote", quote);

          // Only send file if user selected new one
          if (leftImg instanceof File) {
               formData.append("leftImg", leftImg);
          }

          if (rightImg instanceof File) {
               formData.append("rightImg", rightImg);
          }

          if (editItem) {

               await fetch(`${API}/about/${editItem._id}`, {
                    method: "PUT",
                    body: formData
               });

          } else {

               await fetch(`${API}/about`, {
                    method: "POST",
                    body: formData
               });

          }

          setShowModal(false);
          fetchAbout();

     };


     const deleteAbout = async (id) => {

          await fetch(`${API}/about/${id}`, {
               method: "DELETE"
          });

          fetchAbout();

     };


     return (

          <div className="">
<Breadcrumb/>
               <div className="flex justify-between mb-10 px-10 pt-10">

                    <h1 className="text-3xl font-semibold">
                         About Manager
                    </h1>

                    <button
                         onClick={openUpload}
                         className="bg-orange-500 text-white px-6 py-2 rounded"
                    >
                         Add About
                    </button>

               </div>


               <div className="grid md:grid-cols-2 gap-6 px-10">

                    {about.map(a => (

                         <div key={a._id} className="border p-4 rounded">

                              <div className="flex gap-4 mb-3">

                                   <img src={a.leftImg} className="w-30 h-30 object-cover rounded" />
                                   <img src={a.rightImg} className="w-30 h-30 object-cover rounded" />

                              </div>

                              <h3 className="font-semibold mb-1">
                                   {a.title}
                              </h3>

                              <p className="text-sm text-gray-500 mb-3">
                                   {a.quote}
                              </p>

                              <div className="flex gap-3">

                                   <button
                                        onClick={() => openEdit(a)}
                                        className="bg-orange-500 text-white px-3 py-1 rounded"
                                   >
                                        Edit
                                   </button>

                                   <button
                                        onClick={() => deleteAbout(a._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                   >
                                        Delete
                                   </button>

                              </div>

                         </div>

                    ))}

               </div>



               {showModal && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                         <div className="bg-white h-screen overflow-y-scroll p-8 rounded-xl w-[600px]">

                              <h2 className="text-xl mb-4">
                                   {editItem ? "Edit About" : "Add About"}
                              </h2>

                              <input
                                   value={title}
                                   onChange={(e) => setTitle(e.target.value)}
                                   placeholder="Title"
                                   className="border w-full p-3 mb-4"
                              />

                              <textarea
                                   value={quote}
                                   onChange={(e) => setQuote(e.target.value)}
                                   placeholder="Quote"
                                   className="border w-full p-3 mb-4"
                              />

                              <ImageUploader setImage={setleftImg} initialImage={about.leftImg} />
                              <ImageUploader setImage={setrightImg} initialImage={about.rightImg} />

                              <div className="flex gap-3 mt-4">

                                   <button
                                        onClick={saveAbout}
                                        className="bg-orange-500 text-white px-6 py-2 rounded"
                                   >
                                        Save
                                   </button>

                                   <button
                                        onClick={() => setShowModal(false)}
                                        className="border px-6 py-2 rounded"
                                   >
                                        Cancel
                                   </button>

                              </div>

                         </div>

                    </div>

               )}

          </div>

     );

}