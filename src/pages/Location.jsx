import { useEffect, useState } from "react";
import Editor from "../components/Editor";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const emptyHero = { title: "", description: "", points: [""] };
const emptyPageSection = { title: "", description: "", cards: [] };
const emptyPage = {
     help: emptyPageSection,
     location: emptyPageSection,
     why: { title: "", content: "" },
     faq: [{ ques: "", ans: "" }]
};

const normalizeHero = (hero) => ({
     title: hero?.title || "",
     description: hero?.description || "",
     points: Array.isArray(hero?.points) && hero.points.length ? hero.points : [""]
});

const normalizePageSection = (section) => ({
     title: section?.title || "",
     description: section?.description || "",
     cards: Array.isArray(section?.cards) ? section.cards : []
});

const normalizePage = (page) => ({
     help: normalizePageSection(page?.help),
     location: normalizePageSection(page?.location),
     why: {
          title: page?.why?.title || "",
          content: page?.why?.content || ""
     },
     faq: Array.isArray(page?.faq) ? page.faq.map(f => ({ ques: f?.ques || "", ans: f?.ans || "" })) : (page?.faq ? [{ ques: page.faq.ques || "", ans: page.faq.ans || "" }] : [{ ques: "", ans: "" }])

});

const cleanPoints = (points) => points.map((point) => point.trim()).filter(Boolean);

const hasPageContent = (page) => Boolean(
     page?.help?.title ||
     page?.help?.description ||
     page?.help?.cards?.length ||
     page?.location?.title ||
     page?.location?.description ||
     page?.location?.cards?.length ||
     page?.why?.title ||
     page?.why?.content ||
     (page?.faq?.length > 0 && page.faq.some(f => f.ques || f.ans))
);

const stripPageFiles = (page) => ({
     ...page,
     location: {
          ...page.location,
          cards: page.location.cards.map(({ file, ...card }) => ({
               image: card.image || "",
               para: card.para || ""
          }))
     }
});

const getErrorMessage = async (res, fallback) => {
     const data = await res.json().catch(() => ({}));
     return data.error || fallback;
};

export default function Locations() {
     const [locations, setLocations] = useState([]);
     const [locationModal, setLocationModal] = useState(null);
     const [locationForm, setLocationForm] = useState({ title: "", slug: "" });
     const [itemModal, setItemModal] = useState(null);
     const [itemTitle, setItemTitle] = useState("");
     const [itemSeoTitle, setItemSeoTitle] = useState("");
     const [itemSlug, setItemSlug] = useState("");
     const [itemDescription, setItemDescription] = useState("");
     const [itemKeywords, setItemKeywords] = useState("");
     const [heroModal, setHeroModal] = useState(null);
     const [heroForm, setHeroForm] = useState(emptyHero);
     const [pageModal, setPageModal] = useState(null);
     const [pageForm, setPageForm] = useState(emptyPage);
     const [cardModal, setCardModal] = useState(null);
     const [editingCardIndex, setEditingCardIndex] = useState(null);
     const [tempCard, setTempCard] = useState({});
     const [toast, setToast] = useState({ show: false, message: "" });
     const [loadingAction, setLoadingAction] = useState(null);
     const [selectedLocation, setSelectedLocation] = useState("");

     const fetchLocations = async () => {
          const res = await fetch(`${API}/locations`);
          const data = await res.json();
          setLocations(Array.isArray(data) ? data : []);
     };

     useEffect(() => {
          fetchLocations();
     }, []);

     const displayToast = (message) => {
          setToast({ show: true, message });
          setTimeout(() => setToast({ show: false, message: "" }), 3000);
     };

     const saveLocation = async () => {
          if (loadingAction) return;
          setLoadingAction("location");
          const formData = new FormData();
          formData.append("data", JSON.stringify(locationForm));

          const url = locationModal?.location
               ? `${API}/locations/${locationModal.location._id}`
               : `${API}/locations`;

          try {
               const res = await fetch(url, {
                    method: locationModal?.location ? "PUT" : "POST",
                    body: formData
               });

               if (!res.ok) {
                    displayToast(await getErrorMessage(res, "Location save failed."));
                    return;
               }

               setLocationModal(null);
               await fetchLocations();
               displayToast("Location saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const deleteLocation = async (locationId) => {
          await fetch(`${API}/locations/${locationId}`, { method: "DELETE" });
          await fetchLocations();
          displayToast("Location deleted successfully!");
     };

     const openLocationModal = (location = null) => {
          setLocationModal({ location });
          setLocationForm({
               title: location?.title || "",
               slug: location?.slug || ""
          });
     };

     const openItemModal = (location, item = null) => {
          setItemModal({ location, item });
          setItemTitle(item?.title || "");
          setItemSeoTitle(item?.seoTitle || "");
          setItemSlug(item?.slug || "");
          setItemDescription(item?.description || "");
          setItemKeywords(Array.isArray(item?.keywords) ? item.keywords.join(", ") : (item?.keywords || ""));
          setSelectedLocation(location._id);
     };

     const saveItem = async () => {
          if (loadingAction) return;
          if (!selectedLocation) {
               displayToast("Please select a location.");
               return;
          }
          setLoadingAction("item");
          const existing = itemModal.item || {};
          const payload = {
               _id: existing._id,
               title: itemTitle,
               slug: itemSlug,
               seoTitle: itemSeoTitle,
               description: itemDescription,
               keywords: itemKeywords,
               hero: existing.hero || {},
               page: existing.page || {}
          };

          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));

          try {
               if (existing._id && selectedLocation !== itemModal.location._id) {
                    // Move item to new location: delete from old, add to new
                    await fetch(`${API}/locations/${itemModal.location._id}/items/${existing._id}`, { method: "DELETE" });
                    const addRes = await fetch(`${API}/locations/${selectedLocation}/items`, {
                         method: "POST",
                         body: formData
                    });
                    if (!addRes.ok) {
                         displayToast(await getErrorMessage(addRes, "Item move failed."));
                         return;
                    }
               } else {
                    const url = existing._id
                         ? `${API}/locations/${selectedLocation}/items/${existing._id}`
                         : `${API}/locations/${selectedLocation}/items`;
                    const res = await fetch(url, {
                         method: existing._id ? "PUT" : "POST",
                         body: formData
                    });
                    if (!res.ok) {
                         displayToast(await getErrorMessage(res, "Item save failed."));
                         return;
                    }
               }

               setItemModal(null);
               await fetchLocations();
               displayToast("Item saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const deleteItem = async (locationId, itemId) => {
          await fetch(`${API}/locations/${locationId}/items/${itemId}`, { method: "DELETE" });
          await fetchLocations();
          displayToast("Item deleted successfully!");
     };

     const openHeroModal = (location, item) => {
          setHeroModal({ location, item });
          setHeroForm(normalizeHero(item.hero));
     };

     const saveHero = async () => {
          if (loadingAction) return;
          setLoadingAction("hero");
          const payload = {
               _id: heroModal.item._id,
               title: heroModal.item.title,
               slug: heroModal.item.slug,
               description: heroModal.item.description,
               hero: {
                    ...heroForm,
                    points: cleanPoints(heroForm.points)
               },
               page: heroModal.item.page || {}
          };

          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));

          try {
               await fetch(`${API}/locations/${heroModal.location._id}/items/${heroModal.item._id}`, {
                    method: "PUT",
                    body: formData
               });

               setHeroModal(null);
               await fetchLocations();
               displayToast("Hero saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const openPageModal = (location, item) => {
          setPageModal({ location, item });
          setPageForm(normalizePage(item.page));
     };

     const savePage = async (updatedPage = pageForm) => {
          if (loadingAction) return;
          setLoadingAction("page");
          const payload = {
               _id: pageModal.item._id,
               title: pageModal.item.title,
               slug: pageModal.item.slug,
               description: pageModal.item.description,
               hero: pageModal.item.hero || {},
               page: stripPageFiles(updatedPage)
          };

          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));

          updatedPage.location.cards.forEach((card, index) => {
               if (card.file instanceof File) {
                    formData.append("locationImages", card.file);
                    formData.append("locationImageIndex", index);
               }
          });

          try {
               await fetch(`${API}/locations/${pageModal.location._id}/items/${pageModal.item._id}`, {
                    method: "PUT",
                    body: formData
               });

               setPageModal(null);
               await fetchLocations();
               displayToast("Page saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const deletePageCard = (section, index) => {
          const updated = {
               ...pageForm,
               [section]: {
                    ...pageForm[section],
                    cards: pageForm[section].cards.filter((_, cardIndex) => cardIndex !== index)
               }
          };

          setPageForm(updated);
     };

     const openCardModal = (section, card = null, index = null) => {
          setCardModal(section);
          setEditingCardIndex(index);
          setTempCard(card ? { ...card } : section === "help" ? { head: "", subhead: "", para: "" } : { image: "", para: "" });
     };

     const closeCardModal = () => {
          setCardModal(null);
          setEditingCardIndex(null);
          setTempCard({});
     };

     const savePageCard = () => {
          const cards = editingCardIndex === null
               ? [...pageForm[cardModal].cards, tempCard]
               : pageForm[cardModal].cards.map((card, index) => (
                    index === editingCardIndex ? tempCard : card
               ));

          const updated = {
               ...pageForm,
               [cardModal]: {
                    ...pageForm[cardModal],
                    cards
               }
          };

          setPageForm(updated);
          closeCardModal();
     };

     const updateHeroPoint = (index, value) => {
          const points = [...heroForm.points];
          points[index] = value;
          setHeroForm({ ...heroForm, points });
     };

     const updateFaq = (index, field, value) => {
          const faq = [...pageForm.faq];
          faq[index] = { ...faq[index], [field]: value };
          setPageForm({ ...pageForm, faq });
     };

     const addFaq = () => {
          setPageForm({ ...pageForm, faq: [...pageForm.faq, { ques: "", ans: "" }] });
     };

     const deleteFaq = (index) => {
          setPageForm({ ...pageForm, faq: pageForm.faq.filter((_, i) => i !== index) });
     };

     return (
          <div className=" space-y-8 bg-slate-50 min-h-screen text-slate-800 poppins-regular">
               <Breadcrumb/>
            <div className="px-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Location Manager</h1>
                              <p className="text-slate-500 mt-2">Manage location groups, their items, hero content, and page content.</p>
                         </div>

                         <button
                              onClick={() => openLocationModal()}
                              className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-all cursor-pointer"
                         >
                              Add Location
                         </button>
                    </div>

                    <div className="space-y-6">
                         {locations.map((location) => (
                              <div key={location._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                   <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
                                        <div>
                                             <h2 className="text-2xl font-bold text-slate-900">{location.title || "Untitled Location"}</h2>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                             <button onClick={() => openItemModal(location)} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 cursor-pointer">
                                                  + Add Item
                                             </button>
                                             <button onClick={() => openLocationModal(location)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer">
                                                  Edit
                                             </button>
                                             <button onClick={() => deleteLocation(location._id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 cursor-pointer">
                                                  Delete
                                             </button>
                                        </div>
                                   </div>

                                   <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {(location.items || []).map((item) => (
                                             <div key={item._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                                  <div className="flex items-start justify-between gap-3">
                                                       <div>
                                                            <h3 className="font-bold text-slate-800">{item.title || "Untitled Item"}</h3>
                                                            {item.description && (
                                                                 <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                                                            )}
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                 {item.hero?.title ? "Hero added" : "Hero pending"} | {hasPageContent(item.page) ? "Page added" : "Page pending"}
                                                            </p>
                                                       </div>
                                                       <button onClick={() => openItemModal(location, item)} className="text-blue-600 text-sm font-semibold cursor-pointer">
                                                            Edit
                                                       </button>
                                                  </div>

                                                  <div className="flex flex-wrap gap-2 mt-4">
                                                       <button onClick={() => openHeroModal(location, item)} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 cursor-pointer">
                                                            Add Hero
                                                       </button>
                                                       <button onClick={() => openPageModal(location, item)} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 cursor-pointer">
                                                            Add Page
                                                       </button>
                                                       <button onClick={() => deleteItem(location._id, item._id)} className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 cursor-pointer">
                                                            Delete
                                                       </button>
                                                  </div>
                                             </div>
                                        ))}

                                        {(!location.items || location.items.length === 0) && (
                                             <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 bg-slate-50">
                                                  No items added yet.
                                             </div>
                                        )}
                                   </div>
                              </div>
                         ))}
                    </div>

                    {locationModal && (
                         <Modal title={locationModal.location ? "Edit Location" : "Add Location"} onClose={() => setLocationModal(null)}>
                              <input value={locationForm.title} onChange={(e) => setLocationForm({ ...locationForm, title: e.target.value })} placeholder="Location Title" className={inputClass} />
                              {/* <input value={locationForm.slug} onChange={(e) => setLocationForm({ ...locationForm, slug: e.target.value })} placeholder="Location Path" className={inputClass} /> */}
                              <ModalActions onCancel={() => setLocationModal(null)} onSave={saveLocation} loading={loadingAction === "location"} />
                         </Modal>
                    )}

                    {itemModal && (
                         <Modal title={itemModal.item ? "Edit Item" : "Add Item"} onClose={() => setItemModal(null)}>
                              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className={`${inputClass} cursor-pointer`}>
                                   <option value="">Select Location</option>
                                   {locations.map(loc => <option className="cursor-pointer" key={loc._id} value={loc._id}>{loc.title}</option>)}
                              </select>
                              <input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Item Title" className={inputClass} />
                              <input value={itemSeoTitle} onChange={(e) => setItemSeoTitle(e.target.value)} placeholder="Item SEO Title" className={inputClass} />
                              <input value={itemSlug} onChange={(e) => setItemSlug(e.target.value)} placeholder="Item Path" className={inputClass} />
                              <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Item Description" rows={4} className={textareaClass} />
                              <input value={itemKeywords} onChange={(e) => setItemKeywords(e.target.value)} placeholder="Item Keywords" className={inputClass} />
                              <ModalActions onCancel={() => setItemModal(null)} onSave={saveItem} loading={loadingAction === "item"} />
                         </Modal>
                    )}

                    {heroModal && (
                         <Modal title="Add Hero" onClose={() => setHeroModal(null)}>
                              <input value={heroForm.title} onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} placeholder="Hero Title" className={inputClass} />
                              <textarea value={heroForm.description} onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })} placeholder="Hero Description" rows={4} className={textareaClass} />

                              <div className="space-y-2">
                                   {heroForm.points.map((point, index) => (
                                        <input key={index} value={point} onChange={(e) => updateHeroPoint(index, e.target.value)} placeholder={`Point ${index + 1}`} className={inputClass} />
                                   ))}
                              </div>

                              <button onClick={() => setHeroForm({ ...heroForm, points: [...heroForm.points, ""] })} className="text-blue-600 text-sm font-semibold cursor-pointer">
                                   + Add Point
                              </button>

                              <ModalActions onCancel={() => setHeroModal(null)} onSave={saveHero} loading={loadingAction === "hero"} />
                         </Modal>
                    )}

                    {pageModal && (
                         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-y-auto">
                              <div className="bg-slate-50 rounded-2xl w-full max-w-6xl shadow-2xl my-6">
                                   <div className="sticky top-0 z-10 bg-white border-b border-slate-200 rounded-t-2xl px-6 py-4 flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-slate-800">Add Page</h3>
                                        <div className="flex gap-3">
                                             <button onClick={() => setPageModal(null)} className="px-5 py-2.5 text-slate-600 bg-slate-100 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
                                             <button disabled={loadingAction === "page"} onClick={() => savePage(pageForm)} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
                                                  {loadingAction === "page" && <Spinner />}
                                                  {loadingAction === "page" ? "Saving..." : "Save Page"}
                                             </button>
                                        </div>
                                   </div>

                                   <div className="p-6 md:p-8 space-y-8">
                                        <PageSection title="Content Section" data={pageForm.help} onChange={(val) => setPageForm({ ...pageForm, help: val })} onAdd={() => openCardModal("help")}>
                                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                  {pageForm.help.cards.map((card, index) => (
                                                       <Card key={index}>
                                                            <h4 className="text-lg font-bold text-slate-800 mb-1">{card.head}</h4>
                                                            <p className="text-sm font-medium text-blue-600 mb-3">{card.subhead}</p>
                                                            <p className="text-sm text-slate-600 leading-relaxed">{card.para}</p>
                                                            <EditBtn onClick={() => openCardModal("help", card, index)} />
                                                            <DeleteBtn onClick={() => deletePageCard("help", index)} />
                                                       </Card>
                                                  ))}
                                             </div>
                                        </PageSection>

                                        <PageSection title="Specialized Services Section" data={pageForm.location} onChange={(val) => setPageForm({ ...pageForm, location: val })} onAdd={() => openCardModal("location")}>
                                             <div className="grid md:grid-cols-3 gap-4">
                                                  {pageForm.location.cards.map((card, index) => (
                                                       <Card key={index}>
                                                            {card.image || card.file ? (
                                                                 <img src={card.file instanceof File ? URL.createObjectURL(card.file) : card.image} className="h-40 w-full object-cover rounded-lg mb-4" alt="Location" />
                                                            ) : (
                                                                 <div className="h-40 w-full bg-slate-100 rounded-lg mb-4 flex items-center justify-center border border-dashed border-slate-300">
                                                                      <span className="text-slate-400 text-sm">No Image</span>
                                                                 </div>
                                                            )}
                                                            <p className="text-sm text-slate-700">{card.para}</p>
                                                            <EditBtn onClick={() => openCardModal("location", card, index)} />
                                                            <DeleteBtn onClick={() => deletePageCard("location", index)} />
                                                       </Card>
                                                  ))}
                                             </div>
                                        </PageSection>

                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                             <h2 className="text-2xl font-bold text-slate-800 mb-4">Why to Choose Us Section</h2>
                                             <input value={pageForm.why.title} onChange={(e) => setPageForm({ ...pageForm, why: { ...pageForm.why, title: e.target.value } })} placeholder="Enter section title..." className={inputClass} />
                                             <div className="mt-4">
                                                  <Editor value={pageForm.why.content} onChange={(val) => setPageForm({ ...pageForm, why: { ...pageForm.why, content: val } })} />
                                             </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                             <div className="flex justify-between items-center mb-4">
                                                  <h2 className="text-2xl font-bold text-slate-800">FAQ Section</h2>
                                                  <button onClick={addFaq} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer">Add FAQ</button>
                                             </div>
                                             <div className="space-y-4">
                                                  {pageForm.faq.map((faq, index) => (
                                                       <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative space-y-2">
                                                            <input value={faq.ques} onChange={(e) => updateFaq(index, 'ques', e.target.value)} placeholder="Enter FAQ question..." className={inputClass} />
                                                            <input value={faq.ans} onChange={(e) => updateFaq(index, 'ans', e.target.value)} placeholder="Enter FAQ answer..." className={inputClass} />
                                                            <button onClick={() => deleteFaq(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer">
                                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                 </svg>
                                                            </button>
                                                       </div>
                                                  ))}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    )}

                    {cardModal && (
                         <Modal title={`${editingCardIndex === null ? "Add New" : "Edit"} ${cardModal === "help" ? "Help" : "Location"} Card`} onClose={closeCardModal}>
                              {cardModal === "help" && (
                                   <>
                                        <input value={tempCard.head || ""} placeholder="Heading" className={inputClass} onChange={(e) => setTempCard({ ...tempCard, head: e.target.value })} />
                                        <input value={tempCard.subhead || ""} placeholder="Subheading" className={inputClass} onChange={(e) => setTempCard({ ...tempCard, subhead: e.target.value })} />
                                        <textarea value={tempCard.para || ""} placeholder="Paragraph Description" rows={4} className={textareaClass} onChange={(e) => setTempCard({ ...tempCard, para: e.target.value })} />
                                   </>
                              )}

                              {cardModal === "location" && (
                                   <>
                                        <ImageUploader initialImage={tempCard.image} setImage={(file) => setTempCard({ ...tempCard, file })} />
                                        <textarea value={tempCard.para || ""} placeholder="Location Description" rows={4} className={textareaClass} onChange={(e) => setTempCard({ ...tempCard, para: e.target.value })} />
                                   </>
                              )}

                              <ModalActions onCancel={closeCardModal} onSave={savePageCard} saveLabel="Save Card" />
                         </Modal>
                    )}

                    <div className={`fixed bottom-6 right-6 flex items-center gap-3 bg-slate-800 text-white px-5 py-3.5 rounded-xl shadow-2xl transform transition-all duration-300 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}>
                         <span className="font-medium text-sm">{toast.message}</span>
                    </div>
            </div>
          </div>
     );
}

const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 placeholder-slate-400 shadow-sm";
const textareaClass = `${inputClass} resize-none`;

const Modal = ({ title, onClose, children }) => (
     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-900 cursor-pointer">Close</button>
               </div>
               <div className="space-y-4">{children}</div>
          </div>
     </div>
);

const ModalActions = ({ onCancel, onSave, saveLabel = "Save", loading = false }) => (
     <div className="flex justify-end gap-3 pt-4">
          <button disabled={loading} onClick={onCancel} className="px-5 py-2.5 text-slate-600 bg-slate-100 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">Cancel</button>
          <button disabled={loading} onClick={onSave} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
               {loading && <Spinner />}
               {loading ? "Saving..." : saveLabel}
          </button>
     </div>
);

const Spinner = () => (
     <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
);

const PageSection = ({ title, data, onChange, onAdd, children }) => (
     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
               <button onClick={onAdd} className="px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer">+ Add Card</button>
          </div>

          <div className="space-y-4 mb-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
               <input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className={inputClass} placeholder="Enter main title..." />
               <textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={3} className={textareaClass} placeholder="Enter brief description..." />
          </div>

          {children}
     </div>
);

const Card = ({ children }) => (
     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
          {children}
     </div>
);

const EditBtn = ({ onClick }) => (
     <button onClick={onClick} title="Edit Card" className="absolute top-3 right-12 bg-blue-50 text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:text-white p-2 rounded-md transition-all duration-200 shadow-sm focus:opacity-100 outline-none cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
     </button>
);

const DeleteBtn = ({ onClick }) => (
     <button onClick={onClick} title="Delete Card" className="absolute top-3 right-3 bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white p-2 rounded-md transition-all duration-200 shadow-sm focus:opacity-100 outline-none cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
     </button>
);
