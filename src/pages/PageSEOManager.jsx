import { useState, useEffect, useRef } from 'react';
import Breadcrumb from '../components/BreadCrumb';

const API_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5000/api';

const PAGES = [
     { id: 'home', title: 'Home', slug: '/' },
     { id: 'contact-us', title: 'Contact Us', slug: '/contact-us' },
     { id: 'about-us', title: 'About Us', slug: '/about-us' },
     { id: 'privacy-policy', title: 'Privacy Policy', slug: '/privacy-policy' },
     { id: 'services', title: 'Services', slug: '/services' },
     { id: 'portfolios', title: 'Portfolios', slug: '/portfolios' },
     { id: 'case-studies', title: 'Case Studies', slug: '/case-studies' },
     { id: 'disclaimer', title: 'Disclaimer', slug: '/disclaimer' },
     { id: 'blogs', title: 'Blogs', slug: '/blog' },
     { id: 'not-found', title: '404 Page', slug: '*' },
     { id: 'portfolio-coinpay', title: 'Portfolio CoinPay', slug: '/case-studies/portfolio-coinpay' },
     { id: 'portfolio-daccord', title: 'Portfolio Daccord', slug: '/case-studies/portfolio-daccord' },
     { id: 'portfolio-nectar', title: 'Portfolio Nectar', slug: '/case-studies/portfolio-nectar' },
     { id: 'portfolio-beyekls', title: 'Portfolio Beyekls', slug: '/case-studies/portfolio-beyekls' },
];

function PageRow({ page, seoData, onChange, onSave, saving, saved }) {
     return (
          <div
               style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr 1fr 1fr auto',
                    gap: '10px',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.15s',
               }}
               onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
               onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
               {/* Page Name */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{page.title}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{page.slug}</span>
               </div>

               {/* Meta Title */}
               <div style={{ position: 'relative' }}>
                    <input
                         type="text"
                         value={seoData.title}
                         maxLength={60}
                         onChange={e => onChange('title', e.target.value)}
                         placeholder="Meta title..."
                         style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: 12,
                              border: '1.5px solid #e5e7eb',
                              borderRadius: 8,
                              outline: 'none',
                              color: '#374151',
                              background: '#fff',
                              boxSizing: 'border-box',
                              transition: 'border-color 0.15s',
                         }}
                         onFocus={e => (e.target.style.borderColor = '#f97316')}
                         onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                    <span style={{
                         position: 'absolute', right: 8, bottom: -16,
                         fontSize: 10, color: seoData.title.length > 55 ? '#ef4444' : '#9ca3af'
                    }}>
                         {seoData.title.length}/60
                    </span>
               </div>

               {/* Meta Description */}
               <div style={{ position: 'relative' }}>
                    <input
                         type="text"
                         value={seoData.description}
                         maxLength={200}
                         onChange={e => onChange('description', e.target.value)}
                         placeholder="Meta description..."
                         style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: 12,
                              border: '1.5px solid #e5e7eb',
                              borderRadius: 8,
                              outline: 'none',
                              color: '#374151',
                              background: '#fff',
                              boxSizing: 'border-box',
                              transition: 'border-color 0.15s',
                         }}
                         onFocus={e => (e.target.style.borderColor = '#f97316')}
                         onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                    <span style={{
                         position: 'absolute', right: 8, bottom: -16,
                         fontSize: 10, color: seoData.description.length > 150 ? '#ef4444' : '#9ca3af'
                    }}>
                         {seoData.description.length}/200
                    </span>
               </div>

               {/* Schema (JSON-LD) */}
               <div style={{ position: 'relative' }}>
                    <textarea
                         value={seoData.schema || ''}
                         onChange={e => onChange('schema', e.target.value)}
                         placeholder="Paste JSON-LD schema code here..."
                         rows={2}
                         style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: 11,
                              border: '1.5px solid #e5e7eb',
                              borderRadius: 8,
                              outline: 'none',
                              color: '#374151',
                              background: '#fff',
                              boxSizing: 'border-box',
                              transition: 'border-color 0.15s',
                              resize: 'vertical',
                              minHeight: '38px',
                              fontFamily: 'monospace',
                         }}
                         onFocus={e => (e.target.style.borderColor = '#f97316')}
                         onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
               </div>

               {/* Save Button */}
               <button
                    onClick={onSave}
                    disabled={saving || !seoData.title || !seoData.description}
                    style={{
                         padding: '8px 14px',
                         borderRadius: 8,
                         border: 'none',
                         fontSize: 12,
                         fontWeight: 600,
                         cursor: saving || !seoData.title || !seoData.description ? 'not-allowed' : 'pointer',
                         background: saved
                              ? '#22c55e'
                              : saving || !seoData.title || !seoData.description
                                   ? '#e5e7eb'
                                   : '#f97316',
                         color: saving || !seoData.title || !seoData.description ? '#9ca3af' : '#fff',
                         transition: 'all 0.2s',
                         whiteSpace: 'nowrap',
                         minWidth: 64,
                    }}
               >
                    {saving ? '...' : saved ? '✓ Saved' : 'Save'}
               </button>
          </div>
     );
}

export default function PageSEOManager() {
     const [isOpen, setIsOpen] = useState(false);
     const dropdownRef = useRef(null);

     // Per-page SEO state: { [pageId]: { title, description, keywords, schema } }
     const [seoMap, setSeoMap] = useState(() =>
          Object.fromEntries(PAGES.map(p => [p.id, { title: '', description: '', keywords: '', schema: '' }]))
     );
     const [loadingMap, setLoadingMap] = useState({});
     const [savingMap, setSavingMap] = useState({});
     const [savedMap, setSavedMap] = useState({});
     const [fetchedSet, setFetchedSet] = useState(new Set());

     // Close dropdown on outside click
     useEffect(() => {
          const handler = (e) => {
               if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    setIsOpen(false);
               }
          };
          document.addEventListener('mousedown', handler);
          return () => document.removeEventListener('mousedown', handler);
     }, []);

     // Fetch SEO data for all pages when dropdown opens
     useEffect(() => {
          if (!isOpen) return;
          PAGES.forEach(page => {
               if (!fetchedSet.has(page.id)) {
                    fetchPageSEO(page.id);
               }
          });
     }, [isOpen]);

     const fetchPageSEO = async (pageId) => {
          setLoadingMap(prev => ({ ...prev, [pageId]: true }));
          try {
               const res = await fetch(`${API_URL}/pages/${pageId}/seo`);
               const data = await res.json();
               setSeoMap(prev => ({
                    ...prev,
                    [pageId]: {
                         title: data.title || '',
                         description: data.description || '',
                         keywords: data.keywords || '',
                         schema: data.schema || '',
                    },
               }));
               setFetchedSet(prev => new Set([...prev, pageId]));
          } catch {
               // keep empty defaults
          } finally {
               setLoadingMap(prev => ({ ...prev, [pageId]: false }));
          }
     };

     const handleChange = (pageId, field, value) => {
          setSeoMap(prev => ({
               ...prev,
               [pageId]: { ...prev[pageId], [field]: value },
          }));
          // Clear saved state on edit
          setSavedMap(prev => ({ ...prev, [pageId]: false }));
     };

     const handleSave = async (pageId) => {
          const data = seoMap[pageId];
          setSavingMap(prev => ({ ...prev, [pageId]: true }));
          try {
               const res = await fetch(`${API_URL}/pages/${pageId}/seo`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
               });
               if (!res.ok) throw new Error('Save failed');
               setSavedMap(prev => ({ ...prev, [pageId]: true }));
               setTimeout(() => setSavedMap(prev => ({ ...prev, [pageId]: false })), 2500);
          } catch {
               // handle error
          } finally {
               setSavingMap(prev => ({ ...prev, [pageId]: false }));
          }
     };

     return (
          <div>
               <Breadcrumb />
               <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
                    {/* Page Header */}
                    <div style={{ marginBottom: 28 }}>
                         <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>SEO Settings</h1>
                         <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                              Manage meta titles, descriptions, and keywords for each page
                         </p>
                    </div>

                    {/* Custom Dropdown */}
                    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
                         {/* Trigger Button */}
                         <button
                              onClick={() => setIsOpen(prev => !prev)}
                              style={{
                                   width: '100%',
                                   padding: '13px 18px',
                                   background: '#fff',
                                   border: '1.5px solid #e5e7eb',
                                   borderRadius: isOpen ? '12px 12px 0 0' : 12,
                                   cursor: 'pointer',
                                   display: 'flex',
                                   justifyContent: 'space-between',
                                   alignItems: 'center',
                                   fontSize: 14,
                                   fontWeight: 600,
                                   color: '#374151',
                                   transition: 'border-color 0.15s, box-shadow 0.15s',
                                   boxShadow: isOpen ? '0 0 0 3px rgba(249,115,22,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                                   borderColor: isOpen ? '#f97316' : '#e5e7eb',
                              }}
                         >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                   <span style={{
                                        background: '#fff7ed', color: '#f97316',
                                        padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                                   }}>
                                        SEO
                                   </span>
                                   <span>SEO Pages</span>
                                   <span style={{
                                        background: '#f3f4f6', color: '#6b7280',
                                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                   }}>
                                        {PAGES.length} pages
                                   </span>
                              </div>
                              <svg
                                   style={{
                                        width: 18, height: 18, color: '#9ca3af',
                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                   }}
                                   fill="none" viewBox="0 0 24 24" stroke="currentColor"
                              >
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                         </button>

                         {/* Dropdown Panel */}
                         {isOpen && (
                              <div style={{
                                   position: 'absolute',
                                   top: '100%',
                                   left: 0,
                                   right: 0,
                                   background: '#fff',
                                   border: '1.5px solid #f97316',
                                   borderTop: 'none',
                                   borderRadius: '0 0 12px 12px',
                                   boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
                                   zIndex: 100,
                                   overflow: 'hidden',
                              }}>
                                   {/* Column Headers */}
                                   <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '160px 1fr 1fr 1fr auto',
                                        gap: '10px',
                                        padding: '10px 16px',
                                        background: '#f9fafb',
                                        borderBottom: '1.5px solid #f0f0f0',
                                   }}>
                                        {['Page', 'Meta Title', 'Meta Description', 'JSON-LD Schema'].map((label, i) => (
                                             <span key={i} style={{
                                                  fontSize: 11,
                                                  fontWeight: 700,
                                                  color: '#9ca3af',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.05em',
                                                  minWidth: i === 4 ? 64 : 'auto',
                                             }}>
                                                  {label}
                                             </span>
                                        ))}
                                   </div>

                                   {/* Page Rows */}
                                   <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                                        {PAGES.map((page, idx) => (
                                             <PageRow
                                                  key={page.id}
                                                  page={page}
                                                  seoData={seoMap[page.id]}
                                                  onChange={(field, value) => handleChange(page.id, field, value)}
                                                  onSave={() => handleSave(page.id)}
                                                  saving={!!savingMap[page.id]}
                                                  saved={!!savedMap[page.id]}
                                             />
                                        ))}
                                   </div>

                                   {/* Footer */}
                                   <div style={{
                                        padding: '10px 16px',
                                        background: '#f9fafb',
                                        borderTop: '1px solid #f0f0f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                   }}>
                                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                                             💡 Changes are saved per page individually
                                        </span>
                                        <button
                                             onClick={() => setIsOpen(false)}
                                             style={{
                                                  fontSize: 12, color: '#6b7280',
                                                  background: 'none', border: 'none',
                                                  cursor: 'pointer', padding: '4px 10px',
                                                  borderRadius: 6, fontWeight: 500,
                                             }}
                                        >
                                             Close ✕
                                        </button>
                                   </div>
                              </div>
                         )}
                    </div>

                    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #d1d5db; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f9fafb; }
        ::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
               </div>
          </div>
     );
}
