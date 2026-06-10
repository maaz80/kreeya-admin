import { useEffect, useState } from "react";
import Editor from "../components/Editor";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function Blogs() {

     const [blogs, setBlogs] = useState([]);
     const [showModal, setShowModal] = useState(false);
     const [editItem, setEditItem] = useState(null);
     const [uploading, setUploading] = useState(false);
     const [title, setTitle] = useState("");
     const [alt, setAlt] = useState("");
     const [category, setCategory] = useState("");
     const [date, setDate] = useState("");
     const [read, setRead] = useState("");
     const [content, setContent] = useState("");
     const [image, setImage] = useState(null);
     const [seoTitle, setSeoTitle] = useState("");
     const [seoKeywords, setSeoKeywords] = useState("");
     const [seoDescription, setSeoDescription] = useState("");
     const [slug, setSlug] = useState("");
     const [error, setError] = useState("");
     const fetchBlogs = async () => {

          const res = await fetch(`${API_URL}/blogs`);
          const data = await res.json();

          setBlogs(data);

     };

     useEffect(() => {
          fetchBlogs();
     }, []);

     const openUpload = () => {

          setEditItem(null);
          setTitle("");
          setAlt("");
          setCategory("");
          setDate("");
          setRead("");
          setContent("");
          setImage(null);
          setSeoTitle("");
          setSeoKeywords("");
          setSlug("");
          setSeoDescription("");
          setError("");
          setShowModal(true);

     };

     const openEdit = (blog) => {

          setEditItem(blog);
          setTitle(blog.title);
          setAlt(blog.alt);
          setSlug(blog.slug);
          setCategory(blog.category);
          setDate(blog.date);
          setRead(blog.read);
          setContent(blog.content);
          setImage(null);
          setSeoTitle(blog.seoTitle || "");
          setSeoKeywords(blog.seoKeywords || "");
          setSeoDescription(blog.seoDescription || "");
          setError("");
          setShowModal(true);
     };

     const saveBlog = async () => {
          try {
               setError("");

               // Frontend Validations
               if (!title.trim()) throw new Error("Blog title is required.");
               if (!category.trim()) throw new Error("Category is required.");
               if (!date) throw new Error("Publish date is required.");
               if (!read.toString().trim()) throw new Error("Read time is required.");
               if (!content.trim()) throw new Error("Blog content is required.");
               if (!editItem && !image) throw new Error("Blog image is required.");

               setUploading(true);
               const formData = new FormData();

               formData.append("title", title);
               formData.append("alt", alt);
               formData.append("slug", slug);
               formData.append("category", category);
               formData.append("date", date);
               formData.append("read", read);
               formData.append("content", content);
               formData.append("seoTitle", seoTitle);
               formData.append("seoKeywords", seoKeywords);
               formData.append("seoDescription", seoDescription);
               if (image) formData.append("image", image);

               let res;
               if (editItem) {
                    res = await fetch(`${API_URL}/blogs/${editItem._id}`, {
                         method: "PUT",
                         body: formData
                    });
               } else {
                    res = await fetch(`${API_URL}/blogs`, {
                         method: "POST",
                         body: formData
                    });
               }

               const data = await res.json().catch(() => ({}));
               if (!res.ok) {
                    throw new Error(data.error || "Failed to save blog.");
               }

               setShowModal(false);
               fetchBlogs();
          } catch (err) {
               setError(err.message);
          } finally {
               setUploading(false);
          }
     };

     const deleteBlog = async (id) => {

          await fetch(`${API_URL}/blogs/${id}`, {
               method: "DELETE"
          });

          fetchBlogs();

     };

     return (

          <div className="">
               <Breadcrumb />
               <div className="flex justify-between mb-10 px-10 pt-10">

                    <h1 className="text-3xl font-semibold">
                         Blog Manager
                    </h1>

                    <button
                         onClick={openUpload}
                         className="bg-orange-500 text-white px-6 py-2 rounded"
                    >
                         Upload Blog
                    </button>

               </div>


               <div className="grid md:grid-cols-3 gap-6 px-10">

                    {blogs.map(blog => (

                         <div key={blog._id} className="border border-gray-400 rounded-lg p-4">

                              <img src={blog.image} className="w-full h-40 object-cover mb-3" />

                              <h2 className="font-semibold mb-1">
                                   {blog.title}
                              </h2>

                              <p className="text-sm text-gray-500 mb-3">
                                   {blog.category}
                              </p>

                              <div className="flex gap-3">

                                   <button
                                        onClick={() => openEdit(blog)}
                                        className="px-3 py-1 bg-orange-500 text-white rounded"
                                   >
                                        Edit
                                   </button>

                                   <button
                                        onClick={() => deleteBlog(blog._id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded"
                                   >
                                        Delete
                                   </button>

                              </div>

                         </div>

                    ))}

               </div>


               {showModal && (

                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                              <div className="bg-white w-187.5 rounded-2xl shadow-xl p-8 max-h-[90vh] overflow-y-auto">

                                   <h2 className="text-2xl font-semibold mb-6">
                                        {editItem ? "Edit Blog" : "Upload Blog"}
                                   </h2>

                                   {/* TITLE */}

                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             Blog Title
                                        </label>

                                        <input
                                             value={title}
                                             onChange={(e) => setTitle(e.target.value)}
                                             placeholder="Enter blog title"
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>

                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             Blog Alt Tag
                                        </label>

                                        <input
                                             value={alt}
                                             onChange={(e) => setAlt(e.target.value)}
                                             placeholder="Enter blog alt tag"
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>

                                   {/* SEO TITLE */}
                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             SEO Title
                                        </label>

                                        <input
                                             value={seoTitle}
                                             onChange={(e) => setSeoTitle(e.target.value)}
                                             placeholder="Enter SEO title (for Google)"
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>
                                   {/* SEO KEYWORDS */}
                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             SEO Keywords
                                        </label>

                                        <input
                                             value={seoKeywords}
                                             onChange={(e) => setSeoKeywords(e.target.value)}
                                             placeholder="Enter SEO keywords (comma-separated)"
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>
                                   {/* SLUG */}
                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             Path
                                        </label>

                                        <input
                                             value={slug}
                                             onChange={(e) => setSlug(e.target.value)}
                                             placeholder="Enter blog slug"
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>

                                   {/* SEO DESCRIPTION */}
                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             SEO Description
                                        </label>

                                        <textarea
                                             value={seoDescription}
                                             onChange={(e) => setSeoDescription(e.target.value)}
                                             placeholder="Enter SEO description (150-160 chars)"
                                             rows={3}
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>

                                   {/* CATEGORY */}

                                   <div className="mb-4">
                                        <label className="block text-sm font-medium mb-1">
                                             Category
                                        </label>

                                        <input
                                             value={category}
                                             onChange={(e) => setCategory(e.target.value)}
                                             placeholder="Example: AI / Startup"
                                             className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                        />
                                   </div>


                                   {/* DATE + READ TIME */}

                                   <div className="grid grid-cols-2 gap-4 mb-4">

                                        <div>
                                             <label className="block text-sm font-medium mb-1">
                                                  Publish Date
                                             </label>

                                             <input
                                                  type="date"
                                                  value={date}
                                                  onChange={(e) => setDate(e.target.value)}
                                                  className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                             />
                                        </div>

                                        <div>
                                             <label className="block text-sm font-medium mb-1">
                                                  Read Time (minutes)
                                             </label>

                                             <input
                                                  type="number"
                                                  min="1"
                                                  value={read}
                                                  placeholder="Time Taken"
                                                  onChange={(e) => setRead(e.target.value)}
                                                  className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                                             />
                                        </div>

                                   </div>


                                   {/* IMAGE UPLOAD */}

                                   <ImageUploader setImage={setImage} initialImage={editItem?.image} />


                                   {/* CONTENT EDITOR */}

                                   <div className="mb-6">

                                        <label className="block text-sm font-medium mb-2">
                                             Blog Content
                                        </label>

                                        <Editor value={content} onChange={setContent} />

                                   </div>


                                   {/* ERROR DISPLAY */}
                                   {error && (
                                        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                                             {error}
                                        </div>
                                   )}

                                   {/* BUTTONS */}

                                   <div className="flex justify-end gap-3">

                                        <button
                                             onClick={() => setShowModal(false)}
                                             className="px-5 py-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                                        >
                                             Cancel
                                        </button>

                                        <button
                                             onClick={saveBlog}
                                             className="px-6 py-2 bg-orange-500 cursor-pointer text-white rounded-lg hover:bg-orange-600 transition"
                                        >
                                             {uploading ? (
                                                  <>
                                                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                       Uploading...
                                                  </>
                                             ) : (
                                                  editItem ? "Save" : "Upload"
                                             )}
                                        </button>

                                   </div>

                              </div>

                         </div>

                    </div>

               )}

          </div>

     );

}