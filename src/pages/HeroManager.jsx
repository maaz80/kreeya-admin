import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function HeroManager() {

     const [data, setData] = useState({});
     const [video, setVideo] = useState(null);

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
               fetchHero();

          } catch (error) {

               console.error("HERO UPDATE ERROR:", error);

               res.status(500).json({
                    success: false,
                    message: error.message
               });

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

                              <video
                                   src={data.video}
                                   className="w-130 mx-auto mb-3"
                              />

                              {!data.video && (
                                   <input
                                        type="file"
                                        onChange={(e) => setVideo(e.target.files[0])}
                                   />
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
                              className="bg-orange-500 text-white px-10 py-4 rounded-full"
                         >
                              Save Hero
                         </button>

                    </div>

             </div>
          </div>

     )
}