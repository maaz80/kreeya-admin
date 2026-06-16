// admin/components/H1Manager.jsx
import { useState, useEffect } from 'react';
import Breadcrumb from '../components/BreadCrumb';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export default function H1Manager() {
     const [selectedPage, setSelectedPage] = useState('blogs');
     const [headingData, setHeadingData] = useState({});
     const [headingIds, setHeadingIds] = useState([]);
     const [existingIds, setExistingIds] = useState({}); // MongoDB _id per headingId
     const [loading, setLoading] = useState(false);
     const [saveStatus, setSaveStatus] = useState('');
     const [fetchError, setFetchError] = useState('');

     const pages = ['blogs', 'contact-us', 'disclaimer', 'privacy-policy', 'portfolio-beyekls', 'portfolio-coinpay', 'portfolio-daccord', 'portfolio-nectar'];

     // Fetch heading structure when page changes
     useEffect(() => {
          if (selectedPage) {
               fetchHeadingStructure();
          }
     }, [selectedPage]);

     const fetchHeadingStructure = async () => {
          setLoading(true);
          setFetchError('');
          try {
               const res = await fetch(`${API_URL}/h1/structure/${selectedPage}`);
               if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    setFetchError(err.error || `Server error: ${res.status}`);
                    setHeadingIds([]);
                    setHeadingData({});
                    setExistingIds({});
                    return;
               }
               const data = await res.json();
               setHeadingIds(data.headingIds || []);
               setHeadingData(data.existingData || {});
               setExistingIds(data.existingIds || {});
          } catch (error) {
               console.error('Error fetching structure:', error);
               setFetchError('Could not connect to backend. Is the server running?');
               setHeadingIds([]);
               setHeadingData({});
               setExistingIds({});
          } finally {
               setLoading(false);
          }
     };

     const handleInputChange = (headingId, value) => {
          setHeadingData(prev => ({
               ...prev,
               [headingId]: value
          }));
     };

     const handleSave = async (headingId) => {
          if (!headingData[headingId] || headingData[headingId].trim() === '') {
               setSaveStatus('Cannot save empty field!');
               setTimeout(() => setSaveStatus(''), 2000);
               return;
          }

          try {
               const res = await fetch(`${API_URL}/h1/upsert`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         pageName: selectedPage,
                         headingId,
                         headingText: headingData[headingId]
                    })
               });

               if (!res.ok) throw new Error('Save failed');

               const saved = await res.json();
               // Update existingIds with new/updated _id
               setExistingIds(prev => ({ ...prev, [headingId]: saved._id }));
               setSaveStatus(`Saved: ${headingId}`);
               setTimeout(() => setSaveStatus(''), 2000);
          } catch (error) {
               console.error('Error saving:', error);
               setSaveStatus('Error saving!');
          }
     };

     const handleDelete = async (headingId) => {
          const id = existingIds[headingId];
          if (!id) {
               // Not saved yet, just clear UI
               setHeadingData(prev => ({ ...prev, [headingId]: '' }));
               return;
          }

          try {
               const res = await fetch(`${API_URL}/h1/${id}`, { method: 'DELETE' });
               if (!res.ok) throw new Error('Delete failed');

               setExistingIds(prev => {
                    const updated = { ...prev };
                    delete updated[headingId];
                    return updated;
               });
               setHeadingData(prev => ({ ...prev, [headingId]: '' }));
               setSaveStatus(`Deleted: ${headingId}`);
               setTimeout(() => setSaveStatus(''), 2000);
          } catch (error) {
               console.error('Error deleting:', error);
               setSaveStatus('Error deleting!');
          }
     };

     const handleSaveAll = async () => {
          const emptyFields = headingIds.filter(id => !headingData[id] || headingData[id].trim() === '');

          if (emptyFields.length > 0) {
               setSaveStatus(`Cannot save: ${emptyFields.length} field(s) are empty!`);
               setTimeout(() => setSaveStatus(''), 3000);
               return;
          }

          setLoading(true);
          try {
               const promises = headingIds.map(async (headingId) => {
                    const res = await fetch(`${API_URL}/h1/upsert`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                              pageName: selectedPage,
                              headingId,
                              headingText: headingData[headingId]
                         })
                    });
                    if (!res.ok) throw new Error('Save all failed');
                    const saved = await res.json();
                    return { headingId, _id: saved._id };
               });

               const results = await Promise.all(promises);
               const newIds = {};
               results.forEach(({ headingId, _id }) => { newIds[headingId] = _id; });
               setExistingIds(prev => ({ ...prev, ...newIds }));

               setSaveStatus('All headings saved successfully!');
               setTimeout(() => setSaveStatus(''), 3000);
          } catch (error) {
               console.error('Error saving all:', error);
               setSaveStatus('Error saving all!');
          } finally {
               setLoading(false);
          }
     };

     const isFieldEmpty = (headingId) => {
          return !headingData[headingId] || headingData[headingId].trim() === '';
     };

     const isAnyFieldEmpty = () => {
          return headingIds.some(id => isFieldEmpty(id));
     };

     return (
          <div className=" ">
               <Breadcrumb />
               <div className='px-6 max-w-4xl mx-auto'>
                    <h1 className="text-2xl font-bold mb-6">H1 Tags Manager</h1>

                    {/* Page Selector */}
                    <div className="mb-6">
                         <label className="block text-sm font-medium mb-2">Select Page</label>
                         <select
                              value={selectedPage}
                              onChange={(e) => setSelectedPage(e.target.value)}
                              className="w-full p-2 border border-gray-400 rounded-md"
                         >
                              {pages.map(page => (
                                   <option key={page} value={page}>
                                        {page.toUpperCase()}
                                   </option>
                              ))}
                         </select>
                    </div>

                    {/* Save Status */}
                    {saveStatus && (
                         <div className={`mb-4 p-3 rounded ${saveStatus.includes('Error') || saveStatus.includes('Cannot')
                              ? 'bg-red-100 text-red-700'
                              : saveStatus.includes('Deleted')
                                   ? 'bg-yellow-100 text-yellow-700'
                                   : 'bg-green-100 text-green-700'
                              }`}>
                              {saveStatus}
                         </div>
                    )}

                    {/* Fetch Error */}
                    {fetchError && (
                         <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
                              ❌ {fetchError}
                         </div>
                    )}

                    {/* Heading Inputs */}
                    {loading ? (
                         <div className="text-center py-8">Loading...</div>
                    ) : (
                         <div className="space-y-4">
                              {headingIds.length === 0 && !fetchError && (
                                   <div className="text-center py-8 text-gray-500">
                                        No heading fields defined for this page.
                                   </div>
                              )}

                              {headingIds.map((headingId) => (
                                   <div key={headingId} className="border border-gray-400 rounded-lg p-4">
                                        <label className="block text-sm font-medium mb-2">
                                             {headingId.replace(/_/g, ' ').toUpperCase()}
                                             {existingIds[headingId] && (
                                                  <span className="ml-2 text-xs text-green-600 font-normal">✓ Saved</span>
                                             )}
                                        </label>
                                        <div className="flex gap-2">
                                             <input
                                                  type="text"
                                                  value={headingData[headingId] || ''}
                                                  onChange={(e) => handleInputChange(headingId, e.target.value)}
                                                  placeholder={`Enter text for ${headingId}`}
                                                  className="flex-1 p-2 border border-gray-400 rounded-md"
                                             />

                                             {/* Save button — shown when field has content */}
                                             {!isFieldEmpty(headingId) && (
                                                  <button
                                                       onClick={() => handleSave(headingId)}
                                                       className="px-4 py-2 rounded-md cursor-pointer bg-orange-500 hover:bg-orange-600 text-white"
                                                  >
                                                       Save
                                                  </button>
                                             )}

                                             {/* Delete button — shown when field is empty AND record exists in DB */}
                                             {isFieldEmpty(headingId) && existingIds[headingId] && (
                                                  <button
                                                       onClick={() => handleDelete(headingId)}
                                                       className="px-4 py-2 rounded-md cursor-pointer bg-red-500 hover:bg-red-600 text-white"
                                                  >
                                                       Delete
                                                  </button>
                                             )}
                                        </div>
                                   </div>
                              ))}

                              {headingIds.length > 0 && (
                                   <button
                                        onClick={handleSaveAll}
                                        disabled={isAnyFieldEmpty()}
                                        className={`w-full mt-4 px-4 py-2 rounded-md cursor-pointer ${isAnyFieldEmpty()
                                             ? 'bg-gray-400 cursor-not-allowed text-white/60'
                                             : 'bg-orange-500 hover:bg-orange-600 text-white'
                                             }`}
                                   >
                                        Save All Changes
                                   </button>
                              )}
                         </div>
                    )}
               </div>
          </div>
     );
}