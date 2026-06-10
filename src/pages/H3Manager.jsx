// admin/components/H3Manager.jsx
import { useState, useEffect } from 'react';
import Breadcrumb from '../components/BreadCrumb';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.kreeyadesign.com/api';

export default function H3Manager() {
     const [selectedPage, setSelectedPage] = useState('home');
     const [headingData, setHeadingData] = useState({});
     const [headingIds, setHeadingIds] = useState([]);
     const [loading, setLoading] = useState(false);
     const [saveStatus, setSaveStatus] = useState('');

     const pages = ['home'];

     // Fetch heading structure when page changes
     useEffect(() => {
          if (selectedPage) {
               fetchHeadingStructure();
          }
     }, [selectedPage]);

     const fetchHeadingStructure = async () => {
          setLoading(true);
          try {
               const res = await fetch(`${API_URL}/h3/structure/${selectedPage}`);
               const data = await res.json();
               setHeadingIds(data.headingIds);
               setHeadingData(data.existingData);
          } catch (error) {
               console.error('Error fetching structure:', error);
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
          // Check if value is empty
          if (!headingData[headingId] || headingData[headingId].trim() === '') {
               setSaveStatus('Cannot save empty field!');
               setTimeout(() => setSaveStatus(''), 2000);
               return;
          }

          try {
               const res = await fetch(`${API_URL}/h3/upsert`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         pageName: selectedPage,
                         headingId,
                         headingText: headingData[headingId]
                    })
               });

               if (!res.ok) throw new Error('Save failed');

               setSaveStatus(`Saved: ${headingId}`);
               setTimeout(() => setSaveStatus(''), 2000);
          } catch (error) {
               console.error('Error saving:', error);
               setSaveStatus('Error saving!');
          }
     };

     const handleSaveAll = async () => {
          // Check if any field is empty
          const emptyFields = headingIds.filter(id => !headingData[id] || headingData[id].trim() === '');

          if (emptyFields.length > 0) {
               setSaveStatus(`Cannot save: ${emptyFields.length} field(s) are empty!`);
               setTimeout(() => setSaveStatus(''), 3000);
               return;
          }

          setLoading(true);
          try {
               const promises = headingIds.map(async (headingId) => {
                    const res = await fetch(`${API_URL}/h3/upsert`, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json',
                         },
                         body: JSON.stringify({
                              pageName: selectedPage,
                              headingId,
                              headingText: headingData[headingId]
                         })
                    });
                    if (!res.ok) throw new Error('Save all failed');
                    return res.json();
               });

               await Promise.all(promises);
               setSaveStatus('All headings saved successfully!');
               setTimeout(() => setSaveStatus(''), 3000);
          } catch (error) {
               console.error('Error saving all:', error);
               setSaveStatus('Error saving all!');
          } finally {
               setLoading(false);
          }
     };

     // Check if a specific field is empty
     const isFieldEmpty = (headingId) => {
          return !headingData[headingId] || headingData[headingId].trim() === '';
     };

     // Check if any field is empty for Save All button
     const isAnyFieldEmpty = () => {
          return headingIds.some(id => isFieldEmpty(id));
     };

     return (
          <div className="">
               <Breadcrumb />
               <div className='p-6 max-w-4xl mx-auto'>
                    <h3 className="text-2xl font-bold mb-6">H3 Tags Manager</h3>

                    {/* Page Selector */}
                    {/* <div className="mb-6">
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
               </div> */}

                    {/* Save Status */}
                    {saveStatus && (
                         <div className={`mb-4 p-3 rounded ${saveStatus.includes('Error') || saveStatus.includes('Cannot') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                              {saveStatus}
                         </div>
                    )}

                    {/* Heading Inputs */}
                    {loading ? (
                         <div className="text-center py-8">Loading...</div>
                    ) : (
                         <div className="space-y-6">
                              {headingIds.map((headingId) => (
                                   <div key={headingId} className="border border-gray-400 rounded-lg p-4">
                                        <label className="block text-sm font-medium mb-2">
                                             {headingId.replace(/_/g, ' ').toUpperCase()}
                                        </label>
                                        <div className="flex gap-2">
                                             <input
                                                  type="text"
                                                  value={headingData[headingId] || ''}
                                                  onChange={(e) => handleInputChange(headingId, e.target.value)}
                                                  placeholder={`Enter text for ${headingId}`}
                                                  className="flex-1 p-2 border border-gray-400 rounded-md"
                                             />
                                             <button
                                                  onClick={() => handleSave(headingId)}
                                                  disabled={isFieldEmpty(headingId)}
                                                  className={`px-4 py-2 rounded-md cursor-pointer ${isFieldEmpty(headingId)
                                                       ? 'bg-gray-400 cursor-not-allowed text-white/60'
                                                       : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                       }`}
                                             >
                                                  Save
                                             </button>
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