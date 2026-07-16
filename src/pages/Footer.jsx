import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function FooterManager() {

     const [data, setData] = useState({});
     const [logo, setLogo] = useState(null);
     const [loading, setLoading] = useState(false)
     const fetchFooter = async () => {

          const res = await fetch(`${API}/footer`);
          const json = await res.json();

          if (json) setData(json);

     };

     useEffect(() => { fetchFooter() }, []);

     const handleChange = (e) => {
          setLoading(true)
          setData({
               ...data,
               [e.target.name]: e.target.value
          });
          setLoading(false)

     };

     const saveFooter = async () => {
          setLoading(true)
          const formData = new FormData();

          Object.keys(data).forEach(key => {
               formData.append(key, data[key])
          });

          if (logo instanceof File) {
               formData.append("logo", logo)
          }

          await fetch(`${API}/footer`, {
               method: "PUT",
               body: formData
          });
          setLoading(false)
          alert("Footer Updated");
          fetchFooter();
     };

     return (

          <div className="bg-[#ff5a00] text-white min-h-screen plus-jakarta-sans">
<Breadcrumb/>
               {/* SAY HELLO SECTION */}

               <div className="flex flex-col lg:flex-row items-center gap-10 mb-20 px-10 pt-10">

                    <input
                         name="heading"
                         value={data.heading || ""}
                         onChange={handleChange}
                         placeholder="SAY HELLO !"
                         className="bg-transparent border-b text-[72px] w-full outline-none"
                    />

                    <div className="flex gap-4">

                         <input
                              name="buttonText"
                              value={data.buttonText || ""}
                              onChange={handleChange}
                              placeholder="Button Text"
                              className="border p-3 text-black rounded"
                         />

                         <input
                              name="buttonLink"
                              value={data.buttonLink || ""}
                              onChange={handleChange}
                              placeholder="Button Link"
                              className="border p-3 text-black rounded"
                         />

                    </div>

               </div>

               {/* GRID SECTION */}

               <div className="grid lg:grid-cols-3 gap-20 px-10">

                    {/* LOGO + SOCIAL */}

                    <div>

                         <ImageUploader setImage={setLogo} initialImage={data.logo} />

                         <div className="mt-6 flex flex-col gap-3">

                              <input
                                   name="instagram"
                                   value={data.instagram || ""}
                                   onChange={handleChange}
                                   placeholder="Instagram Link"
                                   className="p-2 text-black rounded"
                              />

                              <input
                                   name="linkedin"
                                   value={data.linkedin || ""}
                                   onChange={handleChange}
                                   placeholder="LinkedIn Link"
                                   className="p-2 text-black rounded"
                              />

                              <input
                                   name="facebook"
                                   value={data.facebook || ""}
                                   onChange={handleChange}
                                   placeholder="Facebook Link"
                                   className="p-2 text-black rounded"
                              />
                              <input
                                   name="youtube"
                                   value={data.youtube || ""}
                                   onChange={handleChange}
                                   placeholder="Youtube Link"
                                   className="p-2 text-black rounded"
                              />

                         </div>

                    </div>

                    {/* WRITE TO US */}

                    <div>

                         <input
                              name="contactTitle"
                              value={data.contactTitle || ""}
                              onChange={handleChange}
                              placeholder="Write to us"
                              className="bg-transparent border-b text-[32px] w-full mb-6 outline-none"
                         />

                         <input
                              name="email"
                              value={data.email || ""}
                              onChange={handleChange}
                              placeholder="Email"
                              className="p-2 text-black rounded w-full mb-4"
                         />

                         <input
                              name="phone"
                              value={data.phone || ""}
                              onChange={handleChange}
                              placeholder="Phone"
                              className="p-2 text-black rounded w-full"
                         />

                    </div>

                    {/* ADDRESS */}

                    <div>

                         <input
                              name="locationTitle"
                              value={data.locationTitle || ""}
                              onChange={handleChange}
                              placeholder="Join us at"
                              className="bg-transparent border-b text-[32px] w-full mb-6 outline-none"
                         />

                         <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                   <input
                                        name="city1"
                                        value={data.city1 || data.city || ""}
                                        onChange={handleChange}
                                        placeholder="City 1"
                                        className="p-2 text-black rounded w-full mb-2"
                                   />

                                   <textarea
                                        name="address1"
                                        value={data.address1 || data.address || ""}
                                        onChange={handleChange}
                                        placeholder="Address 1"
                                        className="p-2 text-black rounded w-full"
                                   />
                              </div>
                              <div>
                                   <input
                                        name="city2"
                                        value={data.city2 || ""}
                                        onChange={handleChange}
                                        placeholder="City 2"
                                        className="p-2 text-black rounded w-full mb-2"
                                   />

                                   <textarea
                                        name="address2"
                                        value={data.address2 || ""}
                                        onChange={handleChange}
                                        placeholder="Address 2"
                                        className="p-2 text-black rounded w-full"
                                   />
                              </div>
                         </div>

                    </div>

               </div>

               {/* SAVE BUTTON */}

               <div className="mt-5 text-center px-10">

                    <button
                         onClick={saveFooter}
                         disabled={loading}
                         className="bg-white disabled:bg-white/60 disabled:text-[#ff5a00]/60 cursor-pointer text-[#ff5a00] px-10 py-4 rounded-full text-lg font-semibold"
                    >
                         {loading ? 'Saving' : '  Save Footer'}
                    </button>

               </div>

          </div>

     );
}