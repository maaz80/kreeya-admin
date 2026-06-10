import { useEffect, useState } from "react";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function OldFaq() {

     const [faqs, setFaqs] = useState([]);
     const [showModal, setShowModal] = useState(false);
     const [editItem, setEditItem] = useState(null);

     const [question, setQuestion] = useState("");
     const [answer, setAnswer] = useState("");



     const fetchFaqs = async () => {

          const res = await fetch(`${API}/faqs`);
          const data = await res.json();

          setFaqs(data);

     };



     useEffect(() => {

          fetchFaqs();

     }, []);



     const openUpload = () => {

          setEditItem(null);
          setQuestion("");
          setAnswer("");

          setShowModal(true);

     };



     const openEdit = (item) => {

          setEditItem(item);
          setQuestion(item.question);
          setAnswer(item.answer);

          setShowModal(true);

     };



     const saveFaq = async () => {

          if (!question || !answer) return;

          if (editItem) {

               await fetch(`${API}/faqs/${editItem._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question, answer })
               });

          } else {

               await fetch(`${API}/faqs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question, answer })
               });

          }

          setShowModal(false);

          fetchFaqs();

     };



     const deleteFaq = async (id) => {

          await fetch(`${API}/faqs/${id}`, {
               method: "DELETE"
          });

          fetchFaqs();

     };



     return (

          <div className="min-h-screen bg-white">
          <Breadcrumb/>
               <div className="max-w-5xl mx-auto px-10 pt-10">

                    <div className="flex justify-between items-center mb-10">

                         <h1 className="text-3xl font-semibold">
                              FAQ Manager
                         </h1>

                         <button
                              onClick={openUpload}
                              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                         >
                              Upload
                         </button>

                    </div>


                    <div className="grid md:grid-cols-2 gap-6">

                         {faqs.map(faq => (

                              <div
                                   key={faq._id}
                                   className="border border-gray-400 rounded-lg p-5 shadow-sm"
                              >

                                   <h2 className="font-semibold mb-2">
                                        {faq.question}
                                   </h2>

                                   <p className="text-sm text-gray-600 mb-4">
                                        {faq.answer}
                                   </p>

                                   <div className="flex gap-3">

                                        <button
                                             onClick={() => openEdit(faq)}
                                             className="px-4 py-1 text-sm bg-orange-500 text-white rounded"
                                        >
                                             Edit
                                        </button>

                                        <button
                                             onClick={() => deleteFaq(faq._id)}
                                             className="px-4 py-1 text-sm bg-red-500 text-white rounded"
                                        >
                                             Delete
                                        </button>

                                   </div>

                              </div>

                         ))}

                    </div>

               </div>



               {showModal && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                         <div className="bg-white p-8 rounded-lg w-125">

                              <h2 className="text-xl mb-4">
                                   {editItem ? "Edit FAQ" : "Upload FAQ"}
                              </h2>

                              <input
                                   value={question}
                                   onChange={(e) => setQuestion(e.target.value)}
                                   placeholder="Question"
                                   className="border p-2 w-full mb-3 rounded"
                              />

                              <textarea
                                   value={answer}
                                   onChange={(e) => setAnswer(e.target.value)}
                                   placeholder="Answer"
                                   rows="4"
                                   className="border p-2 w-full mb-4 rounded"
                              />

                              <div className="flex justify-end gap-3">

                                   <button
                                        onClick={() => setShowModal(false)}
                                        className="border px-4 py-2 rounded"
                                   >
                                        Cancel
                                   </button>

                                   <button
                                        onClick={saveFaq}
                                        className="bg-orange-500 text-white px-4 py-2 rounded"
                                   >
                                        Save
                                   </button>

                              </div>

                         </div>

                    </div>

               )}

          </div>

     );

}