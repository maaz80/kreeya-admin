import { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function NavbarManager() {

     const [buttonText, setButtonText] = useState("");

     const [logo1, setLogo1] = useState(null);
     const [logo2, setLogo2] = useState(null);

     const [preview1, setPreview1] = useState("");
     const [preview2, setPreview2] = useState("");

     const fetchNavbar = async () => {

          const res = await fetch(`${API}/navbar`);
          const data = await res.json();

          if (!data) return;

          setButtonText(data.buttonText || "");
          setPreview1(data.logo1 || "");
          setPreview2(data.logo2 || "");

     };

     useEffect(() => {

          fetchNavbar();

     }, []);

     const saveNavbar = async () => {

          const formData = new FormData();

          formData.append("buttonText", buttonText);

          if (logo1 instanceof File) {
               formData.append("logo1", logo1);
          }

          if (logo2 instanceof File) {
               formData.append("logo2", logo2);
          }

          await fetch(`${API}/navbar`, {
               method: "PUT",
               body: formData
          });

          alert("Navbar Updated");

          fetchNavbar();

     };

     return (

          <div className="">
               <Breadcrumb/>
               <div className="px-10 pt-10 max-w-3xl">
               <h1 className="text-3xl font-semibold mb-8">
                    Navbar Manager
               </h1>

               <input
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Button Text"
                    className="border p-3 w-full mb-6 rounded"
               />

               <div className="mb-6">

                    <h3>Main Logo</h3>

                    {preview1 && (
                         <img src={preview1} className="w-40 mb-3" />
                    )}

                    <ImageUploader setImage={setLogo1} />

               </div>

               <div className="mb-6">

                    <h3>White Logo</h3>

                    {preview2 && (
                         <img src={preview2} className="w-40 mb-3" />
                    )}

                    <ImageUploader setImage={setLogo2} />

               </div>

               <button
                    onClick={saveNavbar}
                    className="bg-orange-500 text-white px-6 py-2 rounded"
               >
                    Save
               </button>
               </div>
          </div>

     );

}