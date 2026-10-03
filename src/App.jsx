import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Cloudinary Configuration
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'g10t7iyd';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET || 'gaonsetu_uploads';

export default function App() {
  const [activePortal, setActivePortal] = useState('customer'); // customer, vendor, agent, admin
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Vendor Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newItemType, setNewItemType] = useState('product');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('products_services').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  // Text-to-Speech Hindi Voice Reader
  const speakHindi = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Cloudinary Direct Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!supabase || !newTitle || !newPrice) return;

    setLoading(true);
    const { error } = await supabase.from('products_services').insert([
      {
        title: newTitle,
        price: parseFloat(newPrice),
        item_type: newItemType,
        image_url: imageUrl || 'https://via.placeholder.com/300?text=GaonSetu'
      }
    ]);

    if (!error) {
      setNewTitle('');
      setNewPrice('');
      setImageUrl('');
      fetchProducts();
      alert("उत्पाद/सेवा सफलतापूर्वक जोड़ी गई!");
    } else {
      alert("Error adding product: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-200">
      
      {/* Branded Header with Logo */}
      <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3 sticky top-0 z-50 shadow-md border-b border-emerald-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-lg shadow-sm border border-emerald-300 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="GaonSetu Logo" 
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  // Fallback icon if logo image path is loading
                  e.target.onerror = null; 
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-tight flex items-center gap-1">
                गाँव<span className="text-amber-400">SETU</span>
              </h1>
              <p className="text-[10px] text-emerald-200 font-medium">Gramin Bharat ka Digital Setu</p>
            </div>
          </div>

          <button 
            onClick={() => speakHindi(`गाँवसेतु में आपका स्वागत है। ग्रामीण भारत का डिजिटल सेतु।`)}
            className="bg-emerald-900/80 hover:bg-emerald-900 text-amber-300 px-2.5 py-1.5 rounded-full text-xs font-bold border border-amber-400/60 shadow-sm flex items-center gap-1"
            title="आवाज़ सुनें"
          >
            <span>🔊</span>
            <span className="text-[11px]">सुनें</span>
          </button>
        </div>

        {/* Portal Indicator Sub-bar */}
        <div className="mt-2 pt-1.5 border-t border-emerald-600/50 flex justify-between items-center text-[11px]">
          <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-amber-300 font-semibold uppercase tracking-wider">
            {activePortal === 'customer' && '🛒 ग्राहक पोर्टल'}
            {activePortal === 'vendor' && '🏪 विक्रेता पोर्टल'}
            {activePortal === 'agent' && '🚴 एजेंट पोर्टल'}
            {activePortal === 'admin' && '⚙️ एडमिन पैनल'}
          </span>
          <span className="text-emerald-100 text-[10px]">2G/3G ओप्टिमाइज्ड</span>
        </div>
      </header>

      {/* Main Body Content by Role */}
      <main className="flex-1 p-4 overflow-y-auto mb-16">
        {/* CUSTOMER PORTAL */}
        {activePortal === 'customer' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="सामान या सेवा खोजें..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-emerald-600 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <h2 className="font-bold text-slate-800 text-base flex justify-between items-center">
              उपलब्ध सामान एवं सेवाएं
              <span className="text-xs text-slate-500 font-normal">({products.length} उपलब्ध)</span>
            </h2>

            {loading ? (
              <p className="text-center text-slate-500 my-8">लोड हो रहा है...</p>
            ) : products.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">कोई उत्पाद नहीं मिला।</p>
                <p className="text-xs text-slate-400 mt-1">विक्रेता पोर्टल से नया उत्पाद जोड़ें।</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products
                  .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(item => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between">
                      <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.title} className="h-28 w-full object-cover" />
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.item_type === 'product' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {item.item_type === 'product' ? 'सामान' : 'सेवा'}
                          </span>
                          <h3 className="font-semibold text-slate-800 text-sm mt-1 line-clamp-1">{item.title}</h3>
                          <p className="text-emerald-700 font-bold text-sm">₹{item.price}</p>
                        </div>
                        <div className="mt-2 flex gap-1">
                          <button 
                            onClick={() => speakHindi(`${item.title}, मूल्य ${item.price} रुपये`)}
                            className="bg-slate-100 text-slate-700 p-1.5 rounded-md text-xs hover:bg-slate-200"
                          >
                            🔊
                          </button>
                          <button 
                            onClick={() => alert(`ऑर्डर दर्ज हुआ: ${item.title}`)}
                            className="flex-1 bg-emerald-600 text-white py-1 rounded-md text-xs font-semibold hover:bg-emerald-700"
                          >
                            खरीदें (COD/UPI)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VENDOR PORTAL */}
        {activePortal === 'vendor' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-3">नया सामान/सेवा जोड़ें (Vendor Add Item)</h2>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">नाम (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. ताज़ा दूध, सिलाई कार्य, ट्रैक्टर"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">मूल्य (Price ₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="₹"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">प्रकार (Type)</label>
                    <select
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                    >
                      <option value="product">सामान (Product)</option>
                      <option value="service">सेवा (Service)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">फोटो अपलोड (Cloudinary direct upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                  />
                  {uploadingImage && <p className="text-xs text-amber-600 mt-1">फोटो कंप्रेस हो रही है...</p>}
                  {imageUrl && <p className="text-xs text-emerald-600 mt-1">✓ फोटो तैयार है!</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'जोड़ा जा रहा है...' : 'जोड़ें (Publish Item)'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DELIVERY AGENT PORTAL */}
        {activePortal === 'agent' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-800">डिलीवरी एजेंट पोर्टल (Delivery Partner)</h2>
            <p className="text-xs text-slate-500">आपके ग्राम पंचायत क्षेत्र के डिलीवरी ऑर्डर यहाँ दिखेंगे।</p>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-700">ऑर्डर #GS-8921</p>
                  <p className="text-xs text-slate-500">स्थान: गाँव रामपुर</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">पेंडिंग डिलीवरी</span>
              </div>
              <div className="mt-3 flex gap-2">
                <input type="text" placeholder="OTP दर्ज करें" className="w-1/2 p-1.5 text-xs border border-slate-300 rounded" />
                <button className="w-1/2 bg-emerald-600 text-white text-xs font-bold rounded py-1.5">डिलीवरी पूर्ण करें</button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PORTAL */}
        {activePortal === 'admin' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-800">एडमिन डैशबोर्ड (Admin Portal)</h2>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                <p className="text-xs text-slate-600">कुल प्रोडक्ट्स</p>
                <p className="text-lg font-bold text-emerald-800">{products.length}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                <p className="text-xs text-slate-600">पेंडिंग UTR वेरिफिकेशन</p>
                <p className="text-lg font-bold text-amber-800">0</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Role Switcher Bottom Navigation */}
      <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-slate-200 grid grid-cols-4 text-center py-2 z-50">
        {[
          { id: 'customer', label: 'ग्राहक', icon: '🛒' },
          { id: 'vendor', label: 'विक्रेता', icon: '🏪' },
          { id: 'agent', label: 'एजेंट', icon: '🚴' },
          { id: 'admin', label: 'एडमिन', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePortal(tab.id)}
            className={`flex flex-col items-center text-xs font-semibold ${activePortal === tab.id ? 'text-emerald-700' : 'text-slate-400'}`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
