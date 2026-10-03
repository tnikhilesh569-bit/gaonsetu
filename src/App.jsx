import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingBag, Store, Truck, ShieldCheck, Volume2, Plus, Upload, CheckCircle2, MapPin, Search } from 'lucide-react';

// Supabase Initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Cloudinary Configuration
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

export default function App() {
  const [activeRole, setActiveRole] = useState('customer'); // customer, vendor, agent, admin
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', image_url: '' });
  const [uploading, setUploading] = useState(false);

  // Fetch Products on Mount
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

  // Hindi Voice Description (Speech Synthesis)
  const speakHindi = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support text-to-speech.');
    }
  };

  // Cloudinary Direct Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setNewProduct({ ...newProduct, image_url: data.secure_url });
      }
    } catch (err) {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Create Product in Supabase
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return alert('Fill required fields');
    setLoading(true);

    if (supabase) {
      await supabase.from('products_services').insert([
        {
          title: newProduct.title,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          item_type: 'product'
        }
      ]);
      setNewProduct({ title: '', price: '', description: '', image_url: '' });
      fetchProducts();
    }
    setLoading(false);
  };

  return (
    <div style={styles.appContainer}>
      {/* Claymorphic Global Styles & Keyframe Animations */}
      <style>{`
        * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background-color: #eaf2ed; margin: 0; padding: 0; color: #1e293b; }
        
        /* Claymorphic 3D Card */
        .clay-card {
          background: #f0f7f2;
          border-radius: 28px;
          box-shadow: 9px 9px 18px #d2ded5, -9px -9px 18px #ffffff, inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 5px rgba(0,0,0,0.04);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .clay-card:hover {
          transform: translateY(-4px);
        }

        /* 3D Clay Interactive Button Primary (Emerald) */
        .clay-btn-primary {
          background: linear-gradient(145deg, #10b981, #059669);
          color: #ffffff;
          border: none;
          border-radius: 20px;
          padding: 14px 22px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 6px 6px 14px #c2d4c7, -6px -6px 14px #ffffff, inset 2px 2px 4px rgba(255,255,255,0.4);
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .clay-btn-primary:active {
          transform: translateY(3px);
          box-shadow: inset 3px 3px 6px rgba(0,0,0,0.25);
        }

        /* 3D Clay Role Pill Buttons */
        .clay-pill {
          background: #eaf2ed;
          border: none;
          border-radius: 16px;
          padding: 10px 18px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          box-shadow: 4px 4px 10px #cfdcd2, -4px -4px 10px #ffffff;
          transition: all 0.2s ease;
        }
        .clay-pill-active {
          background: linear-gradient(145deg, #059669, #047857) !important;
          color: #ffffff !important;
          box-shadow: inset 3px 3px 6px rgba(0,0,0,0.3) !important;
        }

        /* Input Fields Claymorphism */
        .clay-input {
          width: 100%;
          background: #eaf2ed;
          border: none;
          border-radius: 16px;
          padding: 14px 18px;
          font-size: 15px;
          outline: none;
          box-shadow: inset 4px 4px 8px #cfdcd2, inset -4px -4px 8px #ffffff;
          margin-bottom: 12px;
        }

        /* Pulse Animation */
        @keyframes pulseGlow {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .pulse-logo { animation: pulseGlow 3s infinite ease-in-out; }
      `}</style>

      {/* Header Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/logo.png" 
            alt="GaonSetu" 
            className="pulse-logo"
            onError={(e) => { e.target.style.display = 'none'; }} 
            style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#047857' }}>गांवसेतु (GaonSetu)</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ग्रामीण डिजिटल क्रांति • Digital Rural Hub</span>
          </div>
        </div>

        {/* Location Badge */}
        <div className="clay-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '16px' }}>
          <MapPin size={16} color="#059669" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e' }}>बिहार (Bihar)</span>
        </div>
      </header>

      {/* Navigation Roles (3D Clay Pills) */}
      <nav style={styles.roleNav}>
        {[
          { id: 'customer', label: 'ग्राहक (Customer)', icon: ShoppingBag },
          { id: 'vendor', label: 'दुकानदार (Vendor)', icon: Store },
          { id: 'agent', label: 'डिलीवरी (Agent)', icon: Truck },
          { id: 'admin', label: 'एडमिन (Admin)', icon: ShieldCheck },
        ].map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`clay-pill ${activeRole === role.id ? 'clay-pill-active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={16} />
              {role.label}
            </button>
          );
        })}
      </nav>

      {/* CUSTOMER PORTAL */}
      {activeRole === 'customer' && (
        <section>
          {/* Voice Search Prompt */}
          <div className="clay-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#065f46' }}>बोलकर सामान खोजें (Voice Search)</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>आवाज़ से सामान सुनने के लिए माइक पर टैप करें</p>
            </div>
            <button className="clay-btn-primary" onClick={() => speakHindi('गांवसेतु में आपका स्वागत है। आप यहाँ अपने गांव के उत्पाद खरीद सकते हैं।')}>
              <Volume2 size={20} /> सुनें
            </button>
          </div>

          {/* Product Grid */}
          <h2 style={{ fontSize: '18px', color: '#0f766e', marginBottom: '16px' }}>ताज़ा सामान और सेवाएं (Products)</h2>
          {loading ? (
            <p>Loading products from Supabase...</p>
          ) : (
            <div style={styles.productGrid}>
              {products.length === 0 ? (
                <div className="clay-card" style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <p>कोई उत्पाद नहीं मिला। विक्रेता पोर्टल से नया सामान जोड़ें!</p>
                </div>
              ) : (
                products.map((item) => (
                  <div key={item.id} className="clay-card" style={{ padding: '16px', overflow: 'hidden' }}>
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'} 
                      alt={item.title} 
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '18px', marginBottom: '12px' }} 
                    />
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{item.title}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>{item.description || 'शुद्ध एवं स्थानीय उत्पाद'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>₹{item.price}</span>
                      <button className="clay-btn-primary" onClick={() => speakHindi(`${item.title}, कीमत ${item.price} रुपये`)}>
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* VENDOR PORTAL */}
      {activeRole === 'vendor' && (
        <section style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="clay-card" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#047857', fontSize: '20px' }}>नया उत्पाद जोड़ें (Add Product)</h2>
            <form onSubmit={handleAddProduct}>
              <input 
                type="text" 
                placeholder="उत्पाद का नाम (e.g. ताज़ा गेहूं)" 
                className="clay-input" 
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                required 
              />
              <input 
                type="number" 
                placeholder="कीमत (Price in ₹)" 
                className="clay-input" 
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required 
              />
              <textarea 
                placeholder="विवरण (Description)" 
                className="clay-input" 
                rows="3"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />

              {/* Image Upload Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#0f766e' }}>
                  फ़ोटो अपलोड करें (Cloudinary)
                </label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="photo-upload" />
                <label htmlFor="photo-upload" className="clay-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Upload size={16} /> {uploading ? 'अपलोड हो रहा है...' : 'गैलरी से चुनें'}
                </label>
                {newProduct.image_url && <span style={{ marginLeft: '10px', color: '#059669', fontSize: '13px' }}>✓ अपलोड सफल</span>}
              </div>

              <button type="submit" className="clay-btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                <Plus size={18} /> {loading ? 'सेव हो रहा है...' : 'उत्पाद प्रकाशित करें'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* DELIVERY AGENT PORTAL */}
      {activeRole === 'agent' && (
        <section style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="clay-card" style={{ padding: '24px', textAlign: 'center' }}>
            <Truck size={48} color="#059669" style={{ marginBottom: '12px' }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#065f46' }}>डिलीवरी एजेंट डैशबोर्ड</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>आज का असाइन किया गया कोई नया ऑर्डर नहीं है।</p>
          </div>
        </section>
      )}

      {/* ADMIN PORTAL */}
      {activeRole === 'admin' && (
        <section style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="clay-card" style={{ padding: '24px' }}>
            <ShieldCheck size={48} color="#d97706" style={{ marginBottom: '12px' }} />
            <h2 style={{ margin: '0 0 8px 0', color: '#92400e' }}>एडमिन कंट्रोल</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>UTR भुगतान सत्यापन और दुकानदार सेटलमेंट स्थिति देख सकते हैं।</p>
            <div className="clay-card" style={{ padding: '16px', background: '#eaf2ed' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>डेटाबेस स्थिति: </span>
              <span style={{ color: supabase ? '#059669' : '#dc2626', fontWeight: 800 }}>
                {supabase ? 'Supabase कनेक्टेड' : 'कनेक्शन त्रुटि'}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Inline Mobile Layout Styles
const styles = {
  appContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  roleNav: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '12px',
    marginBottom: '20px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '18px',
  },
};
