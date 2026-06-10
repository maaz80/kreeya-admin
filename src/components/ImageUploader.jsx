import { useRef, useState, useEffect } from "react";

export default function ImageUploader({ setImage, initialImage }) {

     const inputRef = useRef();
     const [preview, setPreview] = useState(null);

     useEffect(() => {
          if (initialImage) {
               setPreview(initialImage);
          }
     }, [initialImage]);

     const handleFile = (selectedFile) => {

          if (!selectedFile) return;

          setPreview(URL.createObjectURL(selectedFile));
          setImage(selectedFile);

     };

     const handleDrop = (e) => {

          e.preventDefault();

          const droppedFile = e.dataTransfer.files[0];
          handleFile(droppedFile);

     };

     return (

          <div
               onDragOver={(e) => e.preventDefault()}
               onDrop={handleDrop}
               onClick={() => inputRef.current.click()}
               className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 transition"
          >

               <input
                    ref={inputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
               />

               {preview ? (

                    <img
                         src={preview}
                         className="w-full h-32 object-contain rounded-lg"
                    />

               ) : (

                    <p>Drop image or click to upload</p>

               )}

          </div>

     );

}