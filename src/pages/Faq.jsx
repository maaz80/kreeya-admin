import { useEffect, useMemo, useRef, useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import Breadcrumb from '../components/BreadCrumb';
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const PAGES = [
     { title: 'Home', slug: 'home' },
     { title: 'About Us', slug: 'about-us' },
     // { title: 'Blog Details', slug: 'blogs-details' },
     { title: 'Blogs', slug: 'blogs' },
     { title: 'Contact Us', slug: 'contact-us' },
     { title: 'Disclaimer', slug: 'disclaimer' },
     { title: 'Privacy Policy', slug: 'privacy-policy' },
     { title: 'Services', slug: 'services' },
     { title: 'Case Studies', slug: 'case-studies' },
];

const defaultFaq = {
     faq: [],
};

const emptyFaq = {
     ques: '',
     ans: '',
};

function FaqItem({ item, index, onChange, onDelete }) {

     const [open, setOpen] = useState(true);

     return (
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/3 backdrop-blur-xl">

               {/* Header */}
               <div
                    onClick={() => setOpen(!open)}
                    className="flex items-start justify-between gap-3 px-4 sm:px-5 py-4 cursor-pointer hover:bg-white/3 transition-all overflow-hidden"
               >

                    {/* Left */}
                    <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">

                         <div className="min-w-8 w-8 h-8 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                         </div>

                         <div className="flex-1 min-w-0 overflow-hidden">

                              {/* FIXED OVERFLOW */}
                              <p className="text-sm text-white font-medium wrap-break-word whitespace-pre-wrap overflow-hidden">
                                   {item.ques || 'Untitled FAQ'}
                              </p>

                              <p className="text-xs text-zinc-500 mt-1">
                                   FAQ Item
                              </p>

                         </div>

                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 shrink-0">

                         <button
                              onClick={(e) => {
                                   e.stopPropagation();
                                   onDelete(index);
                              }}
                              className="w-8 h-8 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                         >
                              ✕
                         </button>

                         <div className={`transition-all duration-300 text-zinc-500 shrink-0 ${open ? 'rotate-180' : ''}`}>
                              <IoIosArrowDown />
                         </div>

                    </div>

               </div>

               {/* Body */}
               {open && (
                    <div className="px-4 sm:px-5 pb-5 border-t border-white/5 pt-5 space-y-4">

                         {/* Question */}
                         <div>

                              <label className="text-xs font-medium text-zinc-400 block mb-2">
                                   Question
                              </label>

                              <textarea
                                   rows={3}
                                   value={item.ques}
                                   onChange={(e) => onChange(index, 'ques', e.target.value)}
                                   placeholder="Enter question..."
                                   className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none resize-none focus:border-orange-500/50 transition-all wrap-break-word whitespace-pre-wrap overflow-hidden"
                              />

                         </div>

                         {/* Answer */}
                         <div>

                              <label className="text-xs font-medium text-zinc-400 block mb-2">
                                   Answer
                              </label>

                              <textarea
                                   rows={6}
                                   value={item.ans}
                                   onChange={(e) => onChange(index, 'ans', e.target.value)}
                                   placeholder="Enter answer..."
                                   className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none resize-none focus:border-orange-500/50 transition-all wrap-break-word whitespace-pre-wrap overflow-hidden"
                              />

                         </div>

                    </div>
               )}

          </div>
     );
}

export default function FaqManager() {

     const dropdownRef = useRef(null);

     const [openDropdown, setOpenDropdown] = useState(false);

     const [selectedPage, setSelectedPage] = useState(PAGES[0]);

     const [loading, setLoading] = useState(false);

     const [saving, setSaving] = useState(false);

     const [formData, setFormData] = useState(defaultFaq);
     const [toast, setToast] = useState({ show: false, message: "" });

     const displayToast = (message) => {
          setToast({ show: true, message });
          setTimeout(() => setToast({ show: false, message: "" }), 3000);
     };


     // Close Dropdown
     useEffect(() => {

          const handleClick = (e) => {

               if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    setOpenDropdown(false);
               }

          };

          document.addEventListener('mousedown', handleClick);

          return () => {
               document.removeEventListener('mousedown', handleClick);
          };

     }, []);

     // Fetch FAQ
     useEffect(() => {

          if (selectedPage?.slug) {
               fetchFaqData(selectedPage.slug);
          }

     }, [selectedPage]);

     const fetchFaqData = async (slug) => {

          try {

               setLoading(true);

               const response = await fetch(
                    `${API_URL}/pages/${slug}/faq`
               );

               const data = await response.json();

               setFormData({
                    faq: data?.faq || [],
               });

          } catch (error) {

               console.log(error);

               setFormData(defaultFaq);

          } finally {

               setLoading(false);

          }
     };

     const handleFaqChange = (index, field, value) => {

          setFormData((prev) => {

               const updatedFaq = [...prev.faq];

               updatedFaq[index] = {
                    ...updatedFaq[index],
                    [field]: value,
               };

               return {
                    ...prev,
                    faq: updatedFaq,
               };
          });
     };

     const handleAddFaq = () => {

          setFormData((prev) => ({
               ...prev,
               faq: [...prev.faq, emptyFaq],
          }));
     };

     const handleDeleteFaq = (index) => {

          setFormData((prev) => ({
               ...prev,
               faq: prev.faq.filter((_, i) => i !== index),
          }));
     };

     const handleSave = async () => {

          try {

               setSaving(true);

               const response = await fetch(
                    `${API_URL}/pages/${selectedPage.slug}/faq`,
                    {
                         method: 'PUT',
                         headers: {
                              'Content-Type': 'application/json',
                         },
                         body: JSON.stringify(formData),
                    }
               );

               const data = await response.json();

               if (response.ok) {
                    displayToast("FAQ Saved Successfully");

               } else {
                    displayToast(data?.error || 'Something went wrong');

               }

          } catch (error) {

               console.log(error);

               displayToast("Server Error");

          } finally {

               setSaving(false);

          }
     };

     const totalFaqs = useMemo(() => formData?.faq?.length || 0, [formData]);

     return (
          <section >
               <div className="w-full min-h-screen bg-[#050816] p-4 sm:p-5 md:p-8 overflow-x-hidden">
                    <Breadcrumb />
                    <div className="max-w-6xl mx-auto w-full overflow-scroll container">

                         {/* Header */}
                         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                              <div className="min-w-0">
                                   <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight wrap-break-word">
                                        FAQ Manager
                                   </h1>

                                   <p className="text-sm text-zinc-400 mt-2">
                                        Manage page wise FAQ content and questions.
                                   </p>
                              </div>

                              <button
                                   onClick={handleSave}
                                   disabled={saving}
                                   className="h-12 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all text-sm font-medium text-white shadow-[0_10px_40px_rgba(249,115,22,0.25)] disabled:opacity-50 shrink-0"
                              >
                                   {saving ? 'Saving...' : 'Save Changes'}
                              </button>

                         </div>

                         {/* Dropdown */}
                         <div
                              ref={dropdownRef}
                              className="relative mb-8"
                         >

                              <button
                                   onClick={() => setOpenDropdown(!openDropdown)}
                                   className="w-full min-h-14 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl px-4 sm:px-5 py-3 flex items-center justify-between gap-4 text-left overflow-hidden"
                              >

                                   <div className="min-w-0 overflow-hidden">

                                        <p className="text-xs text-zinc-500 mb-1">
                                             Selected Page
                                        </p>

                                        <p className="text-sm font-medium text-white truncate">
                                             {selectedPage.title}
                                        </p>

                                   </div>

                                   <div className={`transition-all duration-300 text-zinc-400 shrink-0 ${openDropdown ? 'rotate-180' : ''}`}>
                                        <IoIosArrowDown />
                                   </div>

                              </button>

                              {openDropdown && (
                                   <div className="absolute top-[110%] left-0 w-full rounded-2xl border border-white/10 bg-[#0b1020]  backdrop-blur-2xl z-50 shadow-2xl">

                                        {PAGES.map((page) => {

                                             const active = page.slug === selectedPage.slug;

                                             return (
                                                  <button
                                                       key={page.slug}
                                                       onClick={() => {
                                                            setSelectedPage(page);
                                                            setOpenDropdown(false);
                                                       }}
                                                       className={`w-full px-5 py-4 flex items-center justify-between gap-4 transition-all border-b border-white/5 last:border-none ${active
                                                            ? 'bg-orange-500/10'
                                                            : 'hover:bg-white/3'
                                                            }`}
                                                  >

                                                       <div className="text-left min-w-0 overflow-hidden">

                                                            <p className={`text-sm font-medium truncate ${active ? 'text-orange-400' : 'text-white'}`}>
                                                                 {page.title}
                                                            </p>

                                                            <p className="text-xs text-zinc-500 mt-1 truncate">
                                                                 {page.slug}
                                                            </p>

                                                       </div>

                                                       {active && (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                                                       )}

                                                  </button>
                                             );
                                        })}

                                   </div>
                              )}

                         </div>

                         {/* Main Content */}
                         {loading ? (
                              <div className="h-100 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl flex items-center justify-center text-zinc-400">
                                   Loading FAQ Data...
                              </div>
                         ) : (
                              <div className="max-w-4xl mx-auto">

                                   {/* FAQ Section */}
                                   <div className="rounded-3xl border border-white/10 bg-white/4 backdrop-blur-xl p-4 sm:p-5 overflow-hidden">

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                                             <div className="min-w-0">
                                                  <div className="flex items-center gap-3">
                                                       <h2 className="text-lg font-semibold text-white">
                                                            FAQ Questions
                                                       </h2>
                                                       <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium shrink-0">
                                                            {totalFaqs} FAQ
                                                       </div>
                                                  </div>

                                                  <p className="text-xs text-zinc-500 mt-1">
                                                       Add and manage frequently asked questions
                                                  </p>
                                             </div>

                                             <button
                                                  onClick={handleAddFaq}
                                                  className="h-11 px-5 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white transition-all text-sm font-medium shrink-0"
                                             >
                                                  + Add FAQ
                                             </button>

                                        </div>

                                        {formData?.faq?.length > 0 ? (
                                             <div className="space-y-4 overflow-hidden">
                                                  {formData.faq.map((item, index) => (
                                                       <FaqItem
                                                            key={index}
                                                            item={item}
                                                            index={index}
                                                            onChange={handleFaqChange}
                                                            onDelete={handleDeleteFaq}
                                                       />
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="h-87.5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-5">

                                                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-2xl mb-5">
                                                       ?
                                                  </div>

                                                  <h3 className="text-white font-medium text-lg">
                                                       No FAQ Added
                                                  </h3>

                                                  <p className="text-sm text-zinc-500 mt-2 max-w-sm">
                                                       Add your first FAQ question for this page from the button above.
                                                  </p>

                                             </div>
                                        )}

                                   </div>

                              </div>
                         )}
                         <div className={`fixed bottom-6 right-6 flex items-center gap-3 bg-slate-800 text-white px-5 py-3.5 rounded-xl shadow-2xl transform transition-all duration-300 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}>
                              <span className="font-medium text-sm">{toast.message}</span>
                         </div>
                    </div>

               </div>
          </section>
     );
}