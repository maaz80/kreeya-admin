import { useEffect, useState } from "react";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function Navigation() {

     const [pages, setPages] = useState([]);
     const [projects, setProjects] = useState([]);
     const [socials, setSocials] = useState([]);

     const [showModal, setShowModal] = useState(false);
     const [loading, setLoading] = useState(false);

     const fetchNav = async () => {

          const res = await fetch(`${API}/navigation`);
          const data = await res.json();

          setPages(data.pages);
          setProjects(data.projects);
          setSocials(data.socials);

     };

     useEffect(() => {

          fetchNav();

     }, []);



     const openEdit = () => {

          setPages(prev => [...prev, { name: "", link: "", order: "" }]);
          setProjects(prev => [...prev, { name: "", link: "", order: "" }]);
          setSocials(prev => [...prev, { name: "", link: "", order: "" }]);

          setShowModal(true);

     };



     const handleChange = (list, setList, index, field, value) => {

          const arr = [...list];

          arr[index][field] = value;

          if (index === arr.length - 1 && arr[index].name && arr[index].link) {
               arr.push({ name: "", link: "" });
          }

          setList(arr);

     };



     const saveNavigation = async () => {

          setLoading(true);

          await fetch(`${API}/navigation`, {

               method: "POST",

               headers: {
                    "Content-Type": "application/json"
               },

               body: JSON.stringify({
                    pages,
                    projects,
                    socials
               })

          });

          setLoading(false);
          setShowModal(false);

          fetchNav();

     };



     const renderSection = (title, list, setList) => {

          return (

               <div className="mb-8">
                    
                    <h2 className="text-xl font-semibold mb-4">{title}</h2>

                    <div className="grid md:grid-cols-5 gap-6">

                         {list.map((item, index) => {

                              const isEmpty = !item.name && !item.link;

                              if (isEmpty && index !== list.length - 1) return null;

                              return (

                                   <div key={index} className="border border-gray-400 rounded-xl p-4">

                                        <input
                                             value={item.name}
                                             onChange={(e) => handleChange(list, setList, index, "name", e.target.value)}
                                             placeholder="Name"
                                             className="border border-gray-400 p-2 w-full mb-2 rounded"
                                        />

                                        <input
                                             value={item.link}
                                             onChange={(e) => handleChange(list, setList, index, "link", e.target.value)}
                                             placeholder="Link"
                                             className="border border-gray-400 p-2 w-full rounded mb-2"
                                        />
                                        <input
                                             value={item.order}
                                             onChange={(e) => handleChange(list, setList, index, "order", e.target.value)}
                                             placeholder="Order"
                                             className="border border-gray-400 p-2 w-full rounded"
                                        />

                                   </div>

                              )

                         })}

                    </div>

               </div>

          )

     };



     return (

          <div className="min-h-screen bg-white ">
               <Breadcrumb />
               <div className="max-w-6xl mx-auto ">

                    <div className="flex justify-between items-center mb-10 pt-10">

                         <h1 className="text-3xl font-semibold">

                              Navigation Manager

                         </h1>

                         <button
                              onClick={openEdit}
                              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                         >

                              Edit Navigation

                         </button>

                    </div>


                    {/* DISPLAY */}

                    <div className="flex flex-col gap-6">
                         <div className="flex gap-2">
                              {pages.map(i => (
                                   <div key={i._id} className="shadow p-4 rounded">
                                        {i.name}
                                   </div>
                              ))}
                         </div>
                         <div className="flex gap-2">
                              {projects.map(i => (
                                   <div key={i._id} className="shadow p-4 rounded">
                                        {i.name}
                                   </div>
                              ))}
                         </div>
                         <div className="flex gap-2">
                              {socials.map(i => (
                                   <div key={i._id} className="shadow p-4 rounded">
                                        {i.name}
                                   </div>
                              ))}
                         </div>

                    </div>

               </div>



               {/* MODAL */}

               {showModal && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                         <div className="bg-white p-8 rounded-lg w-300 max-h-[98vh] overflow-auto">

                              {renderSection("Page Navigation", pages, setPages)}
                              {renderSection("Project Navigation", projects, setProjects)}
                              {renderSection("Social Navigation", socials, setSocials)}

                              <button
                                   onClick={saveNavigation}
                                   disabled={loading}
                                   className="bg-orange-500 text-white px-6 py-2 rounded"
                              >

                                   {loading ? "Saving..." : "Save"}

                              </button>

                         </div>

                    </div>

               )}

          </div>

     )

}