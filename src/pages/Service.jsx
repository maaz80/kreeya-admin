import { useEffect, useState } from "react";
import Editor from "../components/Editor";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const emptyHero = { title: "", description: "", points: [""] };
const emptyPageSection = { title: "", description: "", cards: [] };
const emptyPage = {
     help: emptyPageSection,
     service: emptyPageSection,
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
     service: normalizePageSection(page?.service),
     why: {
          title: page?.why?.title || "",
          content: page?.why?.content || ""
     },
     faq: Array.isArray(page?.faq) ? page.faq.map(f => ({ ques: f?.ques || "", ans: f?.ans || "" })) : [{ ques: "", ans: "" }]
});


const emptyLocationMeta = {
     country: "",
     city: "",
     title: "",
     seoTitle: "",
     description: "",
     keywords: "",
     schema: "",
     image: "",
     status: "published",
     hero: emptyHero
};

const normalizeLocationMeta = (locationPage) => ({
     country: locationPage?.country || "",
     city: locationPage?.city || "",
     title: locationPage?.title || "",
     seoTitle: locationPage?.seoTitle || "",
     description: locationPage?.description || "",
     keywords: Array.isArray(locationPage?.keywords) ? locationPage.keywords.join(", ") : (locationPage?.keywords || ""),
     schema: locationPage?.schema || "",
     image: locationPage?.image || "",
     status: locationPage?.status || "published",
     hero: normalizeHero(locationPage?.hero)
});
const cleanPoints = (points) => points.map((point) => point.trim()).filter(Boolean);

const hasPageContent = (page) => Boolean(
     page?.help?.title ||
     page?.help?.description ||
     page?.help?.cards?.length ||
     page?.service?.title ||
     page?.service?.description ||
     page?.service?.cards?.length ||
     page?.why?.title ||
     page?.why?.content ||
     (page?.faq?.length > 0 && page.faq.some(f => f.ques || f.ans))
);

const stripPageFiles = (page) => ({
     ...page,
     service: {
          ...page.service,
          cards: page.service.cards.map(({ file, ...card }) => ({
               image: card.image || "",
               para: card.para || ""
          }))
     },
     faq: Array.isArray(page.faq) ? page.faq.map(({ ques, ans }) => ({ ques, ans })) : []
});

const getErrorMessage = async (res, fallback) => {
     const data = await res.json().catch(() => ({}));
     return data.error || fallback;
};

export default function Services() {
     const [services, setServices] = useState([]);
     const [serviceModal, setServiceModal] = useState(null);
     const [serviceForm, setServiceForm] = useState({ title: "", description: "" });
     const [serviceImageFile, setServiceImageFile] = useState(null);
     const [itemModal, setItemModal] = useState(null);
     const [itemTitle, setItemTitle] = useState("");
     const [itemSeoTitle, setItemSeoTitle] = useState("");
     const [itemSlug, setItemSlug] = useState("");
     const [itemDescription, setItemDescription] = useState("");
     const [itemKeywords, setItemKeywords] = useState("");
     const [itemSchema, setItemSchema] = useState("");
     const [itemImageFile, setItemImageFile] = useState(null);
     const [itemImageUrl, setItemImageUrl] = useState("");
     const [selectedServiceId, setSelectedServiceId] = useState("");
     const [heroModal, setHeroModal] = useState(null);
     const [heroForm, setHeroForm] = useState(emptyHero);
     const [pageModal, setPageModal] = useState(null);
     const [pageForm, setPageForm] = useState(emptyPage);
     const [locationMeta, setLocationMeta] = useState(emptyLocationMeta);
     const [locationImageFile, setLocationImageFile] = useState(null);
     const [cardModal, setCardModal] = useState(null);
     const [editingCardIndex, setEditingCardIndex] = useState(null);
     const [tempCard, setTempCard] = useState({});
     const [toast, setToast] = useState({ show: false, message: "" });
     const [loadingAction, setLoadingAction] = useState(null);

     const fetchServices = async () => {
          const res = await fetch(`${API}/services`);
          const data = await res.json();
          setServices(Array.isArray(data) ? data : []);
     };

     useEffect(() => {
          fetchServices();
     }, []);

     const displayToast = (message) => {
          setToast({ show: true, message });
          setTimeout(() => setToast({ show: false, message: "" }), 3000);
     };

     const saveService = async () => {
          if (loadingAction) return;
          setLoadingAction("service");
          const formData = new FormData();
          formData.append("data", JSON.stringify(serviceForm));
          if (serviceImageFile) {
               formData.append("image", serviceImageFile);
          }

          const url = serviceModal?.service
               ? `${API}/services/${serviceModal.service._id}`
               : `${API}/services`;

          try {
               await fetch(url, {
                    method: serviceModal?.service ? "PUT" : "POST",
                    body: formData
               });

               setServiceModal(null);
               setServiceImageFile(null);
               await fetchServices();
               displayToast("Service saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const deleteService = async (serviceId) => {
          await fetch(`${API}/services/${serviceId}`, { method: "DELETE" });
          await fetchServices();
          displayToast("Service deleted successfully!");
     };

     const openServiceModal = (service = null) => {
          setServiceModal({ service });
          setServiceForm({
               title: service?.title || "",
               description: service?.description || "",
               image: service?.image || ""
          });
          setServiceImageFile(null);
     };

     const openItemModal = (service, item = null) => {
          setItemModal({ service, item });
          setItemTitle(item?.title || "");
          setItemSeoTitle(item?.seoTitle || "");
          setItemSlug(item?.slug || "");
          setItemDescription(item?.description || "");
          setItemKeywords(Array.isArray(item?.keywords) ? item.keywords.join(", ") : (item?.keywords || ""));
          setItemSchema(item?.schema || "");
          setItemImageUrl(item?.image || "");
          setItemImageFile(null);
          setSelectedServiceId(service._id);
     };

     const saveItem = async () => {
          if (loadingAction) return;
          if (!selectedServiceId) {
               displayToast("Please select a service.");
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
               schema: itemSchema,
               image: itemImageUrl,
               hero: existing.hero || {},
               page: existing.page || {}
          };

          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));
          if (itemImageFile) {
               formData.append("itemImage", itemImageFile);
          }

          try {
               if (existing._id && selectedServiceId !== itemModal.service._id) {
                    await fetch(`${API}/services/${itemModal.service._id}/items/${existing._id}`, { method: "DELETE" });
                    const addRes = await fetch(`${API}/services/${selectedServiceId}/items`, {
                         method: "POST",
                         body: formData
                    });
                    if (!addRes.ok) {
                         displayToast(await getErrorMessage(addRes, "Item save failed."));
                         return;
                    }
               } else {
                    const url = existing._id
                         ? `${API}/services/${selectedServiceId}/items/${existing._id}`
                         : `${API}/services/${selectedServiceId}/items`;
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
               await fetchServices();
               displayToast("Item saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const deleteItem = async (serviceId, itemId) => {
          await fetch(`${API}/services/${serviceId}/items/${itemId}`, { method: "DELETE" });
          await fetchServices();
          displayToast("Item deleted successfully!");
     };

     const openHeroModal = (service, item) => {
          setHeroModal({ service, item });
          setHeroForm(normalizeHero(item.hero));
     };

     const saveHero = async () => {
          if (loadingAction) return;
          setLoadingAction("hero");
          const payload = {
               _id: heroModal.item._id,
               title: heroModal.item.title,
               hero: {
                    ...heroForm,
                    points: cleanPoints(heroForm.points)
               },
               page: heroModal.item.page || {}
          };

          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));

          try {
               await fetch(`${API}/services/${heroModal.service._id}/items/${heroModal.item._id}`, {
                    method: "PUT",
                    body: formData
               });

               setHeroModal(null);
               await fetchServices();
               displayToast("Hero saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const openPageModal = (service, item) => {
          setPageModal({ service, item, mode: "base" });
          setPageForm(normalizePage(item.page));
          setLocationMeta(emptyLocationMeta);
          setLocationImageFile(null);
     };

     const openLocationPageModal = (service, item, locationPage = null) => {
          setPageModal({ service, item, locationPage, mode: "location" });
          setPageForm(normalizePage(locationPage?.page));
          setLocationMeta(normalizeLocationMeta(locationPage));
          setLocationImageFile(null);
     };

     const appendPageImages = (formData, updatedPage) => {
          updatedPage.service.cards.forEach((card, index) => {
               if (card.file instanceof File) {
                    formData.append("serviceImages", card.file);
                    formData.append("serviceImageIndex", index);
               }
          });
     };

     const savePage = async (updatedPage = pageForm) => {
          if (loadingAction) return;
          setLoadingAction("page");

          const isLocationPage = pageModal.mode === "location";
          const payload = isLocationPage
               ? {
                    ...locationMeta,
                    country: locationMeta.country,
                    city: locationMeta.city,
                    hero: {
                         ...locationMeta.hero,
                         points: cleanPoints(locationMeta.hero.points || [])
                    },
                    page: stripPageFiles(updatedPage)
               }
               : {
                    _id: pageModal.item._id,
                    title: pageModal.item.title,
                    hero: pageModal.item.hero || {},
                    page: stripPageFiles(updatedPage)
               };

          const formData = new FormData();
          formData.append("data", JSON.stringify(payload));
          appendPageImages(formData, updatedPage);

          if (isLocationPage && locationImageFile) {
               formData.append("itemImage", locationImageFile);
          }

          const locationPageId = pageModal.locationPage?._id;
          const url = isLocationPage
               ? locationPageId
                    ? `${API}/services/${pageModal.service._id}/items/${pageModal.item._id}/location-pages/${locationPageId}`
                    : `${API}/services/${pageModal.service._id}/items/${pageModal.item._id}/location-pages`
               : `${API}/services/${pageModal.service._id}/items/${pageModal.item._id}`;

          try {
               const res = await fetch(url, {
                    method: isLocationPage && !locationPageId ? "POST" : "PUT",
                    body: formData
               });

               if (!res.ok) {
                    displayToast(await getErrorMessage(res, "Page save failed."));
                    return;
               }

               setPageModal(null);
               setLocationImageFile(null);
               await fetchServices();
               displayToast(isLocationPage ? "Location page saved successfully!" : "Page saved successfully!");
          } finally {
               setLoadingAction(null);
          }
     };

     const deleteLocationPage = async (serviceId, itemId, locationPageId) => {
          await fetch(`${API}/services/${serviceId}/items/${itemId}/location-pages/${locationPageId}`, { method: "DELETE" });
          await fetchServices();
          displayToast("Location page deleted successfully!");
     };

     const updateLocationHeroPoint = (index, value) => {
          const points = [...locationMeta.hero.points];
          points[index] = value;
          setLocationMeta({ ...locationMeta, hero: { ...locationMeta.hero, points } });
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
          <div className="space-y-8 bg-slate-50 min-h-screen text-slate-800 poppins-regular">
               <Breadcrumb />
               <div className="px-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Service Manager</h1>
                              <p className="text-slate-500 mt-2">Manage service groups, their items, hero content, and page content.</p>
                         </div>

                         <button
                              onClick={() => openServiceModal()}
                              className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-all cursor-pointer"
                         >
                              Add Service
                         </button>
                    </div>

                    <div className="space-y-6">
                         {services.map((service) => (
                              <div key={service._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                   <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
                                        <div>
                                             {service.image && (
                                                  <img src={service.image} className="w-full max-w-sm h-44 object-cover rounded-xl mb-4 border border-slate-200" alt={service.title || "Service"} />
                                             )}
                                             <h2 className="text-2xl font-bold text-slate-900">{service.title || "Untitled Service"}</h2>
                                             {service.description && (
                                                  <p className="text-slate-500 mt-1 max-w-3xl">{service.description}</p>
                                             )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                             <button onClick={() => openItemModal(service)} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 cursor-pointer">
                                                  + Add Item
                                             </button>
                                             <button onClick={() => openServiceModal(service)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer">
                                                  Edit
                                             </button>
                                             <button onClick={() => deleteService(service._id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 cursor-pointer">
                                                  Delete
                                             </button>
                                        </div>
                                   </div>

                                   <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {(service.items || []).map((item) => (
                                             <div key={item._id} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                                                  <div className="flex items-start gap-4 mb-2">
                                                       {item.image && (
                                                            <img src={item.image} className="w-16 h-16 object-cover rounded-lg border border-slate-200" alt={item.title} />
                                                       )}
                                                       <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-slate-800 truncate">{item.title || "Untitled Item"}</h3>
                                                            {item.description && (
                                                                 <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                                                            )}
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                 {item.hero?.title ? "Hero added" : "Hero pending"} | {hasPageContent(item.page) ? "Page added" : "Page pending"}
                                                            </p>
                                                       </div>
                                                       <button onClick={() => openItemModal(service, item)} className="text-blue-600 text-sm font-semibold cursor-pointer whitespace-nowrap">
                                                            Edit
                                                       </button>
                                                  </div>

                                                  <div className="flex flex-wrap gap-1 mt-4">
                                                       <button onClick={() => openHeroModal(service, item)} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 cursor-pointer">
                                                            Add Hero
                                                       </button>
                                                       <button onClick={() => openPageModal(service, item)} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 cursor-pointer">
                                                            Add Page
                                                       </button>
                                                       <button onClick={() => openLocationPageModal(service, item)} className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold hover:bg-indigo-100 cursor-pointer">
                                                            Add Location Page
                                                       </button>
                                                       <button onClick={() => deleteItem(service._id, item._id)} className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 cursor-pointer">
                                                            Delete
                                                       </button>
                                                  </div>

                                                  {(item.locationPages || []).length > 0 && (
                                                       <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location Pages</p>
                                                            {(item.locationPages || []).map((locationPage) => (
                                                                 <div key={locationPage._id} className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                                                                      <div className="min-w-0">
                                                                           <p className="text-sm font-semibold text-slate-700 truncate">/{locationPage.country}{locationPage.city ? `/${locationPage.city}` : ""}</p>
                                                                           <p className="text-xs text-slate-500 truncate">{locationPage.title || locationPage.seoTitle || "Untitled location page"}</p>
                                                                      </div>
                                                                      <div className="flex gap-2 shrink-0">
                                                                           <button onClick={() => openLocationPageModal(service, item, locationPage)} className="text-blue-600 text-xs font-semibold cursor-pointer">Edit</button>
                                                                           <button onClick={() => deleteLocationPage(service._id, item._id, locationPage._id)} className="text-red-500 text-xs font-semibold cursor-pointer">Delete</button>
                                                                      </div>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  )}
                                             </div>
                                        ))}

                                        {(!service.items || service.items.length === 0) && (
                                             <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 bg-slate-50">
                                                  No items added yet.
                                             </div>
                                        )}
                                   </div>
                              </div>
                         ))}
                    </div>

                    {serviceModal && (
                         <Modal title={serviceModal.service ? "Edit Service" : "Add Service"} onClose={() => setServiceModal(null)}>
                              <input value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} placeholder="Service Title" className={inputClass} />
                              {/* <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Service Description" rows={4} className={textareaClass} /> */}
                              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                                   <ImageUploader
                                        initialImage={serviceForm.image}
                                        setImage={(file) => setServiceImageFile(file)}
                                   />
                              </div>
                              <ModalActions onCancel={() => setServiceModal(null)} onSave={saveService} loading={loadingAction === "service"} />
                         </Modal>
                    )}

                    {itemModal && (
                         <Modal title={itemModal.item ? "Edit Item" : "Add Item"} onClose={() => setItemModal(null)}>
                              <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className={inputClass}>
                                   <option value="">Select Service</option>
                                   {services.map((service) => (
                                        <option key={service._id} value={service._id}>{service.title || "Untitled Service"}</option>
                                   ))}
                              </select>
                              <input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Item Title" className={inputClass} />
                              <input value={itemSeoTitle} onChange={(e) => setItemSeoTitle(e.target.value)} placeholder="Item SEO Title" className={inputClass} />
                              <input value={itemSlug} onChange={(e) => setItemSlug(e.target.value)} placeholder="Item Slug" className={inputClass} />
                              <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Item Description" rows={4} className={textareaClass} />
                              <input value={itemKeywords} onChange={(e) => setItemKeywords(e.target.value)} placeholder="Item Keywords" className={inputClass} />
                              <textarea
                                   value={itemSchema}
                                   onChange={(e) => setItemSchema(e.target.value)}
                                   placeholder="Item JSON-LD Schema (Optional)"
                                   rows={3}
                                   className={`${textareaClass} font-mono text-xs`}
                              />
                              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                                   <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Item Image</label>
                                   <ImageUploader
                                        initialImage={itemImageUrl}
                                        setImage={(file) => setItemImageFile(file)}
                                   />
                              </div>
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
                                        <h3 className="text-xl font-bold text-slate-800">{pageModal.mode === "location" ? "Location Page" : "Add Page"}</h3>
                                        <div className="flex gap-3">
                                             <button onClick={() => setPageModal(null)} className="px-5 py-2.5 text-slate-600 bg-slate-100 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer">Cancel</button>
                                             <button disabled={loadingAction === "page"} onClick={() => savePage(pageForm)} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
                                                  {loadingAction === "page" && <Spinner />}
                                                  {loadingAction === "page" ? "Saving..." : "Save Page"}
                                             </button>
                                        </div>
                                   </div>

                                   <div className="p-6 md:p-8 space-y-8">
                                        {pageModal.mode === "location" && (
                                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                                                  <div>
                                                       <h2 className="text-2xl font-bold text-slate-800">Location & SEO</h2>
                                                       <p className="text-sm text-slate-500 mt-1">Country page URL uses country only. City page URL uses country and city.</p>
                                                  </div>
                                                  <div className="grid md:grid-cols-2 gap-4">
                                                       <input value={locationMeta.country} onChange={(e) => setLocationMeta({ ...locationMeta, country: e.target.value })} placeholder="Country slug e.g. india" className={inputClass} />
                                                       <input value={locationMeta.city} onChange={(e) => setLocationMeta({ ...locationMeta, city: e.target.value })} placeholder="City slug e.g. delhi (optional)" className={inputClass} />
                                                       <input value={locationMeta.title} onChange={(e) => setLocationMeta({ ...locationMeta, title: e.target.value })} placeholder="Page Title" className={inputClass} />
                                                       <input value={locationMeta.seoTitle} onChange={(e) => setLocationMeta({ ...locationMeta, seoTitle: e.target.value })} placeholder="SEO Title" className={inputClass} />
                                                       <input value={locationMeta.keywords} onChange={(e) => setLocationMeta({ ...locationMeta, keywords: e.target.value })} placeholder="Keywords" className={inputClass} />
                                                       <select value={locationMeta.status} onChange={(e) => setLocationMeta({ ...locationMeta, status: e.target.value })} className={inputClass}>
                                                            <option value="published">Published</option>
                                                            <option value="draft">Draft</option>
                                                       </select>
                                                  </div>
                                                  <textarea value={locationMeta.description} onChange={(e) => setLocationMeta({ ...locationMeta, description: e.target.value })} placeholder="Meta Description" rows={3} className={textareaClass} />
                                                  <textarea value={locationMeta.schema} onChange={(e) => setLocationMeta({ ...locationMeta, schema: e.target.value })} placeholder="JSON-LD Schema (Optional)" rows={3} className={`${textareaClass} font-mono text-xs`} />
                                                  <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                                                       <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Location Page Image</label>
                                                       <ImageUploader initialImage={locationMeta.image} setImage={(file) => setLocationImageFile(file)} />
                                                  </div>
                                             </div>
                                        )}

                                        {pageModal.mode === "location" && (
                                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                                  <h2 className="text-2xl font-bold text-slate-800">Hero Section</h2>
                                                  <input value={locationMeta.hero.title} onChange={(e) => setLocationMeta({ ...locationMeta, hero: { ...locationMeta.hero, title: e.target.value } })} placeholder="Hero Title" className={inputClass} />
                                                  <textarea value={locationMeta.hero.description} onChange={(e) => setLocationMeta({ ...locationMeta, hero: { ...locationMeta.hero, description: e.target.value } })} placeholder="Hero Description" rows={4} className={textareaClass} />
                                                  <div className="space-y-2">
                                                       {locationMeta.hero.points.map((point, index) => (
                                                            <input key={index} value={point} onChange={(e) => updateLocationHeroPoint(index, e.target.value)} placeholder={`Point ${index + 1}`} className={inputClass} />
                                                       ))}
                                                  </div>
                                                  <button onClick={() => setLocationMeta({ ...locationMeta, hero: { ...locationMeta.hero, points: [...locationMeta.hero.points, ""] } })} className="text-blue-600 text-sm font-semibold cursor-pointer">
                                                       + Add Point
                                                  </button>
                                             </div>
                                        )}
                                        <PageSection title="Content Section" data={pageForm.help} onChange={(val) => setPageForm({ ...pageForm, help: val })} onAdd={() => openCardModal("help")}>
                                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                  {pageForm.help.cards.map((card, index) => (
                                                       <Card key={index}>
                                                            <h4 className="text-lg font-bold text-slate-800 mb-1">{card.head}</h4>
                                                            <p className="text-sm font-medium text-blue-600 mb-3">{card.subhead}</p>
                                                            <p className="text-sm text-slate-600 leading-relaxed">{card.para}</p>
                                                            <div className="flex gap-2 mt-4">
                                                                 <EditBtn onClick={() => {
                                                                      openCardModal("help", card, index);
                                                                 }} />
                                                                 <DeleteBtn onClick={() => deletePageCard("help", index)} />
                                                            </div>
                                                       </Card>
                                                  ))}
                                             </div>
                                        </PageSection>

                                        <PageSection title="Specialized Services Section" data={pageForm.service} onChange={(val) => setPageForm({ ...pageForm, service: val })} onAdd={() => openCardModal("service")}>
                                             <div className="grid md:grid-cols-3 gap-4">
                                                  {pageForm.service.cards.map((card, index) => (
                                                       <Card key={index}>
                                                            {card.image || card.file ? (
                                                                 <img src={card.file instanceof File ? URL.createObjectURL(card.file) : card.image} className="h-40 w-full object-cover rounded-lg mb-4" alt="Service" />
                                                            ) : (
                                                                 <div className="h-40 w-full bg-slate-100 rounded-lg mb-4 flex items-center justify-center border border-dashed border-slate-300">
                                                                      <span className="text-slate-400 text-sm">No Image</span>
                                                                 </div>
                                                            )}
                                                            <p className="text-sm text-slate-700">{card.para}</p>
                                                            <div className="flex gap-2 mt-4">
                                                                 <EditBtn onClick={() => openCardModal("service", card, index)} />
                                                                 <DeleteBtn onClick={() => deletePageCard("service", index)} />
                                                            </div>
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
                         <Modal title={`${editingCardIndex === null ? "Add New" : "Edit"} ${cardModal === "help" ? "Help" : "Service"} Card`} onClose={() => closeCardModal()}>
                              {cardModal === "help" && (
                                   <>
                                        <input value={tempCard.head || ""} placeholder="Heading" className={inputClass} onChange={(e) => setTempCard({ ...tempCard, head: e.target.value })} />
                                        <input value={tempCard.subhead || ""} placeholder="Subheading" className={inputClass} onChange={(e) => setTempCard({ ...tempCard, subhead: e.target.value })} />
                                        <textarea value={tempCard.para || ""} placeholder="Paragraph Description" rows={4} className={textareaClass} onChange={(e) => setTempCard({ ...tempCard, para: e.target.value })} />
                                   </>
                              )}

                              {cardModal === "service" && (
                                   <>
                                        <ImageUploader initialImage={tempCard.image} setImage={(file) => setTempCard({ ...tempCard, file })} />
                                        <textarea value={tempCard.para || ""} placeholder="Service Description" rows={4} className={textareaClass} onChange={(e) => setTempCard({ ...tempCard, para: e.target.value })} />
                                   </>
                              )}

                              <ModalActions onCancel={() => closeCardModal()} onSave={savePageCard} saveLabel="Save Card" />
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

const DeleteBtn = ({ onClick }) => (
     <button onClick={onClick} title="Delete Card" className="absolute top-3 right-3 bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white p-2 rounded-md transition-all duration-200 shadow-sm focus:opacity-100 outline-none cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
     </button>
);

const EditBtn = ({ onClick }) => (
     <button onClick={onClick} title="Edit Card" className="absolute top-3 right-12 bg-blue-50 text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:text-white p-2 rounded-md transition-all duration-200 shadow-sm focus:opacity-100 outline-none cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
     </button>
);





