import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function AdminTestimonials() {

     const [testimonials, setTestimonials] = useState([]);
     const [showModal, setShowModal] = useState(false);
     const [editItem, setEditItem] = useState(null);

     const [quote, setQuote] = useState("");
     const [name, setName] = useState("");
     const [role, setRole] = useState("");
     const [avatar, setAvatar] = useState(null);


     const fetchTestimonials = async () => {

          const res = await fetch(`${API}/testimonials`);
          const data = await res.json();

          setTestimonials(data);

     };

     useEffect(() => {

          fetchTestimonials();

     }, []);


     const openUpload = () => {

          setEditItem(null);
          setQuote("");
          setName("");
          setRole("");
          setAvatar(null);

          setShowModal(true);

     };


     const openEdit = (item) => {

          setEditItem(item);
          setQuote(item.quote);
          setName(item.name);
          setRole(item.role);

          setShowModal(true);

     };


     const saveTestimonial = async () => {

          const formData = new FormData();

          formData.append("quote", quote);
          formData.append("name", name);
          formData.append("role", role);

          if (avatar) formData.append("avatar", avatar);

          if (editItem) {

               await fetch(`${API}/testimonials/${editItem._id}`, {
                    method: "PUT",
                    body: formData
               });

          } else {

               await fetch(`${API}/testimonials`, {
                    method: "POST",
                    body: formData
               });

          }

          setShowModal(false);
          fetchTestimonials();

     };


     const deleteTestimonial = async (id) => {

          await fetch(`${API}/testimonials/${id}`, {
               method: "DELETE"
          });

          fetchTestimonials();

     };


     return (

          <div className="">
               <Breadcrumb />
               <div className="px-10 pt-10">
               <div className="flex justify-between mb-10">

                    <h1 className="text-3xl font-semibold">
                         Testimonial Manager
                    </h1>

                    <button
                         onClick={openUpload}
                         className="bg-orange-500 text-white px-6 py-2 rounded"
                    >
                         Add Testimonial
                    </button>

               </div>


               <div className="grid md:grid-cols-3 gap-6">

                    {testimonials.map(t => (

                         <div key={t._id} className="border border-gray-400 rounded p-4">

                              <img
                                   src={t.avatar}
                                   className="w-16 h-16 rounded-full mb-3"
                              />

                              <p className="text-sm mb-3">
                                   "{t.quote}"
                              </p>

                              <h3 className="font-semibold">
                                   {t.name}
                              </h3>

                              <p className="text-gray-500 text-sm mb-3">
                                   {t.role}
                              </p>

                              <div className="flex gap-3">

                                   <button
                                        onClick={() => openEdit(t)}
                                        className="bg-orange-500 text-white px-3 py-1 rounded"
                                   >
                                        Edit
                                   </button>

                                   <button
                                        onClick={() => deleteTestimonial(t._id)}
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

                         <div className="bg-white p-8 rounded-xl w-125">

                              <h2 className="text-xl mb-4">
                                   {editItem ? "Edit Testimonial" : "Add Testimonial"}
                              </h2>
                              <ImageUploader setImage={setAvatar} />


                              <input
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   placeholder="Name"
                                   className="border border-gray-400 rounded-lg w-full p-3 mb-4 mt-4"
                              />

                              <input
                                   value={role}
                                   onChange={(e) => setRole(e.target.value)}
                                   placeholder="Role"
                                   className="border border-gray-400 rounded-lg w-full p-3 mb-4"
                              />

                              <textarea
                                   value={quote}
                                   onChange={(e) => setQuote(e.target.value)}
                                   placeholder="Quote"
                                   className="border border-gray-400 rounded-lg w-full p-3 mb-4"
                              />


                              <div className="flex gap-3 ">

                                   <button
                                        onClick={saveTestimonial}
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
          </div>

     );

}