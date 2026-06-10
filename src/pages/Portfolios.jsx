import { useEffect, useState } from "react";
import Editor from "../components/Editor";
import ImageUploader from "../components/ImageUploader";
import Breadcrumb from "../components/BreadCrumb";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioModal, setPortfolioModal] = useState(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [dribblelink, setDribblelink] = useState("");
  const [behancelink, setBehancelink] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const [cards, setCards] = useState([]); // [{ image: "", para: "", file: null }]
  const [faqs, setFaqs] = useState([]); // [{ ques: "", ans: "" }]
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [toast, setToast] = useState({ show: false, message: "" });
  const [loadingAction, setLoadingAction] = useState(null);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch(`${API}/portfolios`);
      const data = await res.json();
      setPortfolios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching portfolios:", err);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const displayToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const openPortfolioModal = (portfolio = null) => {
    setPortfolioModal({ portfolio });
    setName(portfolio?.name || "");
    setTitle(portfolio?.title || "");''
    setDescription(portfolio?.description || "");
    setDribblelink(portfolio?.dribblelink || "");
    setBehancelink(portfolio?.behancelink || "");
    setSequenceNumber(portfolio?.sequenceNumber !== undefined ? portfolio.sequenceNumber : 0);
    setCards(
      Array.isArray(portfolio?.cards)
        ? portfolio.cards.map((c) => ({ title: c.title || "", image: c.image || "", para: c.para || "", file: null }))
        : []
    );
    setFaqs(
      Array.isArray(portfolio?.faq)
        ? portfolio.faq.map((f) => ({ ques: f.ques || "", ans: f.ans || "" }))
        : []
    );
  };

  const addFaq = () => {
    setFaqs([...faqs, { ques: "", ans: "" }]);
  };

  const updateFaqQues = (index, value) => {
    const updated = [...faqs];
    updated[index].ques = value;
    setFaqs(updated);
  };

  const updateFaqAns = (index, value) => {
    const updated = [...faqs];
    updated[index].ans = value;
    setFaqs(updated);
  };

  const deleteFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const addCard = () => {
    setCards([...cards, { title: "", image: "", para: "", file: null }]);
  };

  const updateCardTitle = (index, value) => {
    const updated = [...cards];
    updated[index].title = value;
    setCards(updated);
  };

  const updateCardPara = (index, value) => {
    const updated = [...cards];
    updated[index].para = value;
    setCards(updated);
  };

  const updateCardImage = (index, file) => {
    const updated = [...cards];
    updated[index].file = file;
    setCards(updated);
  };

  const deleteCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const savePortfolio = async () => {
    if (loadingAction) return;
    if (!name.trim()) {
      displayToast("Please enter a Portfolio Name.");
      return;
    }
    setLoadingAction("portfolio");

    const payload = {
      name,
      title,
      description,
      dribblelink,
      behancelink,
      sequenceNumber: Number(sequenceNumber) || 0,
      cards: cards.map((card) => ({
        title: card.title || "",
        image: card.image || "",
        para: card.para || "",
      })),
      faq: faqs.map((f) => ({
        ques: f.ques || "",
        ans: f.ans || "",
      })),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    cards.forEach((card, index) => {
      if (card.file instanceof File) {
        formData.append("cardImages", card.file);
        formData.append("cardImageIndex", index);
      }
    });

    const url = portfolioModal?.portfolio
      ? `${API}/portfolios/${portfolioModal.portfolio._id}`
      : `${API}/portfolios`;

    try {
      const res = await fetch(url, {
        method: portfolioModal?.portfolio ? "PUT" : "POST",
        body: formData,
      });

      if (!res.ok) {
        displayToast("Portfolio save failed.");
        return;
      }

      setPortfolioModal(null);
      await fetchPortfolios();
      displayToast("Portfolio saved successfully!");
    } catch (err) {
      console.error(err);
      displayToast("An error occurred while saving.");
    } finally {
      setLoadingAction(null);
    }
  };

  const deletePortfolio = async (id) => {
    if (window.confirm("Are you sure you want to delete this portfolio?")) {
      try {
        await fetch(`${API}/portfolios/${id}`, { method: "DELETE" });
        await fetchPortfolios();
        displayToast("Portfolio deleted successfully!");
      } catch (err) {
        console.error(err);
        displayToast("Failed to delete portfolio.");
      }
    }
  };

  return (
    <div className="space-y-8 bg-slate-50 min-h-screen text-slate-800 poppins-regular">
      <Breadcrumb />
      
      <div className="px-10 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Portfolio Manager</h1>
            <p className="text-slate-500 mt-2">Manage your creative portfolios, Behance/Dribbble links, and associated cards.</p>
          </div>

          <button
            onClick={() => openPortfolioModal()}
            className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-all cursor-pointer"
          >
            Add Portfolio
          </button>
        </div>

        {/* Portfolio List */}
        <div className="space-y-6">
          {portfolios.map((portfolio) => (
            <div key={portfolio._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {portfolio.name || "Untitled Portfolio"}{" "}
                    <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-2">
                      Seq: {portfolio.sequenceNumber ?? 0}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-2">
                      FAQs: {portfolio.faq?.length ?? 0}
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    {portfolio.dribblelink && (
                      <a href={portfolio.dribblelink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Dribbble Link
                      </a>
                    )}
                    {portfolio.behancelink && (
                      <a href={portfolio.behancelink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Behance Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPortfolioModal(portfolio)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePortfolio(portfolio._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(portfolio.cards || []).map((card, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
                    {card.image ? (
                      <img src={card.image} className="w-full h-44 object-cover rounded-lg border border-slate-200" alt={card.title || "Card"} />
                    ) : (
                      <div className="w-full h-44 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                        <span className="text-slate-400 text-sm">No Image Uploaded</span>
                      </div>
                    )}
                    {card.title && (
                      <h4 className="text-base font-bold text-slate-800 tracking-tight line-clamp-1">{card.title}</h4>
                    )}
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{card.para || "No description provided."}</p>
                  </div>
                ))}

                {(!portfolio.cards || portfolio.cards.length === 0) && (
                  <div className="col-span-full border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 bg-slate-50/50">
                    No cards added to this portfolio.
                  </div>
                )}
              </div>
            </div>
          ))}

          {portfolios.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 bg-white">
              No portfolios created yet. Click "Add Portfolio" to create your first one.
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Add / Edit Modal */}
      {portfolioModal && (
        <Modal title={portfolioModal.portfolio ? "Edit Portfolio" : "Add Portfolio"} onClose={() => setPortfolioModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Portfolio Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Overhaul"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Sequence Number</label>
              <input
                type="number"
                value={sequenceNumber}
                onChange={(e) => setSequenceNumber(e.target.value)}
                placeholder="e.g. 1"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Page Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Portfolio"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Page Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A brief description of your portfolio"
                className={inputClass}
              />
            </div>


            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Dribbble Link</label>
              <input
                value={dribblelink}
                onChange={(e) => setDribblelink(e.target.value)}
                placeholder="https://dribbble.com/..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Behance Link</label>
              <input
                value={behancelink}
                onChange={(e) => setBehancelink(e.target.value)}
                placeholder="https://behance.net/..."
                className={inputClass}
              />
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-800">Portfolio Cards ({cards.length})</h4>
                <button
                  onClick={addCard}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer"
                >
                  + Add Card
                </button>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {cards.map((card, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative space-y-3">
                    <button
                      onClick={() => deleteCard(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer z-10"
                      title="Delete Card"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Title</label>
                      <input
                        value={card.title || ""}
                        onChange={(e) => updateCardTitle(index, e.target.value)}
                        placeholder="e.g. Creative Layout"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Image</label>
                      <ImageUploader
                        initialImage={card.file ? URL.createObjectURL(card.file) : card.image}
                        setImage={(file) => updateCardImage(index, file)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Description</label>
                      <textarea
                        value={card.para}
                        onChange={(e) => updateCardPara(index, e.target.value)}
                        placeholder="Describe the card project details..."
                        rows={3}
                        className={textareaClass}
                      />
                    </div>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No cards added yet. Click "+ Add Card" above to build your portfolio gallery.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-800">Portfolio FAQs ({faqs.length})</h4>
                <button
                  onClick={addFaq}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
                >
                  + Add FAQ
                </button>
              </div>

              <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
                {faqs.map((f, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative space-y-3">
                    <button
                      onClick={() => deleteFaq(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer z-10"
                      title="Delete FAQ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Question</label>
                      <input
                        value={f.ques || ""}
                        onChange={(e) => updateFaqQues(index, e.target.value)}
                        placeholder="e.g. What is the scope of this project?"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Answer</label>
                      <textarea
                        value={f.ans || ""}
                        onChange={(e) => updateFaqAns(index, e.target.value)}
                        placeholder="Provide answer details..."
                        rows={3}
                        className={textareaClass}
                      />
                    </div>
                  </div>
                ))}

                {faqs.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No FAQs added to this portfolio. Click "+ Add FAQ" above.
                  </div>
                )}
              </div>
            </div>

            <ModalActions onCancel={() => setPortfolioModal(null)} onSave={savePortfolio} loading={loadingAction === "portfolio"} />
          </div>
        </Modal>
      )}

      {/* Floating Toast Alert */}
      <div className={`fixed bottom-6 right-6 flex items-center gap-3 bg-slate-800 text-white px-5 py-3.5 rounded-xl shadow-2xl transform transition-all duration-300 z-50 ${toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}>
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 placeholder-slate-400 shadow-sm";
const textareaClass = `${inputClass} resize-none`;

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
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
