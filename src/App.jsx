import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Menu, X, LogIn, LogOut, UploadCloud, 
  Trash2, Edit3, Loader2, Image as ImageIcon,
  Download, ChevronRight, BookOpen, Users, Activity
} from 'lucide-react';

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC_zRk3lOo5DMy1JBYz-Gp9CN-rJciRbn0",
  authDomain: "hmi-staikha.firebaseapp.com",
  projectId: "hmi-staikha",
  storageBucket: "hmi-staikha.firebasestorage.app",
  messagingSenderId: "806712578223",
  appId: "1:806712578223:web:7660b9c8fdf5ae59f6445a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State Data Global
  const [kegiatans, setKegiatans] = useState([]);
  const [pengurus, setPengurus] = useState([]);
  const [elibrary, setElibrary] = useState([]);
  
  // State Loading Global
  const [isProcessing, setIsProcessing] = useState(false);

  // Listener Autentikasi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listener Scroll untuk Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Data dari Firestore
  useEffect(() => {
    const qKegiatan = query(collection(db, 'kegiatan'), orderBy('createdAt', 'desc'));
    const unsubKegiatan = onSnapshot(qKegiatan, (snapshot) => {
      setKegiatans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qPengurus = query(collection(db, 'pengurus'), orderBy('urutan', 'asc'));
    const unsubPengurus = onSnapshot(qPengurus, (snapshot) => {
      setPengurus(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qLibrary = query(collection(db, 'elibrary'), orderBy('createdAt', 'desc'));
    const unsubLibrary = onSnapshot(qLibrary, (snapshot) => {
      setElibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubKegiatan();
      unsubPengurus();
      unsubLibrary();
    };
  }, []);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-[#008000] selection:text-white">
      
      {/* LOADING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-20 h-20 text-[#008000] animate-spin mb-6" />
          <h2 className="text-white text-2xl font-black tracking-wider animate-pulse text-center px-4">
            Sedang Memproses Perjuangan...
          </h2>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || activeTab !== 'home' ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 bg-[#008000] rounded-full flex items-center justify-center mr-3 shadow-md">
                <span className="text-white font-black text-xl">HMI</span>
              </div>
              <div>
                <h1 className={`font-black text-xl leading-tight ${isScrolled || activeTab !== 'home' ? 'text-zinc-900' : 'text-white drop-shadow-md'}`}>STAI KHARISMA</h1>
                <p className={`text-xs font-bold tracking-widest ${isScrolled || activeTab !== 'home' ? 'text-[#008000]' : 'text-zinc-200 drop-shadow-md'}`}>KOMISARIAT</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {['home', 'kegiatan', 'struktur', 'elibrary'].map((item) => (
                <button 
                  key={item}
                  onClick={() => navigateTo(item)}
                  className={`font-extrabold capitalize transition-colors hover:text-[#008000] ${activeTab === item ? 'text-[#008000]' : (isScrolled || activeTab !== 'home' ? 'text-zinc-600' : 'text-white drop-shadow-md')}`}
                >
                  {item}
                </button>
              ))}
              
              {user ? (
                <button onClick={() => navigateTo('admin')} className="flex items-center bg-[#008000] text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-green-800 transition shadow-md">
                  <Activity className="w-4 h-4 mr-2" /> Admin Panel
                </button>
              ) : (
                <button onClick={() => navigateTo('login')} className={`p-2 rounded-full transition-colors ${isScrolled || activeTab !== 'home' ? 'text-zinc-400 hover:text-[#008000]' : 'text-white/80 hover:text-white'}`}>
                  <LogIn className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`${isScrolled || activeTab !== 'home' ? 'text-zinc-900' : 'text-white'}`}>
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-4 flex flex-col border-t border-zinc-100">
            {['home', 'kegiatan', 'struktur', 'elibrary'].map((item) => (
              <button 
                key={item}
                onClick={() => navigateTo(item)}
                className={`py-3 px-6 text-left font-black capitalize ${activeTab === item ? 'text-[#008000] bg-green-50' : 'text-zinc-700 hover:bg-zinc-50'}`}
              >
                {item}
              </button>
            ))}
            {user && (
              <button onClick={() => navigateTo('admin')} className="py-3 px-6 text-left font-black text-[#008000] bg-green-50 mt-2">
                Admin Panel
              </button>
            )}
          </div>
        )}
      </nav>

      <main className="min-h-screen">
        {activeTab === 'home' && <HomeView kegiatans={kegiatans} navigateTo={navigateTo} />}
        {activeTab === 'kegiatan' && <KegiatanView kegiatans={kegiatans} />}
        {activeTab === 'struktur' && <StrukturView pengurus={pengurus} />}
        {activeTab === 'elibrary' && <ELibraryView elibrary={elibrary} />}
        {activeTab === 'login' && <LoginView navigateTo={navigateTo} />}
        {activeTab === 'admin' && user && (
          <AdminView 
            user={user} 
            kegiatans={kegiatans} 
            pengurus={pengurus} 
            elibrary={elibrary}
            setIsProcessing={setIsProcessing} 
            navigateTo={navigateTo}
          />
        )}
      </main>

      <footer className="bg-zinc-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-[#008000] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-black text-2xl">HMI</span>
          </div>
          <h2 className="text-2xl font-black mb-2">HMI Komisariat STAI Kharisma</h2>
          <p className="text-zinc-600 text-sm font-bold">© {new Date().getFullYear()} HMI STAI Kharisma. Yakusa!</p>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 3. SUB-COMPONENTS (VIEWS)
// ==========================================

function HomeView({ kegiatans, navigateTo }) {
  const latestKegiatan = kegiatans.slice(0, 3);
  return (
    <div className="animate-in fade-in duration-500">
      <div className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-[#008000]/20 mix-blend-multiply z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')" }}
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            Merajut Ukhuwah, <br/>
            <span className="text-[#008000]">Membangun Peradaban</span>
          </h1>
          <button onClick={() => navigateTo('kegiatan')} className="bg-[#008000] hover:bg-green-700 text-white px-8 py-4 rounded-3xl font-black text-lg transition-all shadow-lg flex items-center justify-center mx-auto">
            Jelajahi Kegiatan <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KegiatanView({ kegiatans }) {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <h2 className="text-4xl font-black mb-12">Galeri Kegiatan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kegiatans.map(item => (
          <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-zinc-100">
            <img src={item.imgUrl} className="w-full h-48 object-cover" alt={item.judul} />
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">{item.judul}</h3>
              <p className="text-zinc-500 text-sm mb-4">{item.tanggal}</p>
              <p className="text-zinc-600 line-clamp-3">{item.deskripsi}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrukturView({ pengurus }) {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <h2 className="text-4xl font-black mb-12 text-center">Struktur Pengurus</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {pengurus.map(item => (
          <div key={item.id} className="text-center">
            <img src={item.imgUrl} className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg" alt={item.nama} />
            <h3 className="font-black text-lg">{item.nama}</h3>
            <p className="text-[#008000] font-bold text-sm uppercase">{item.jabatan}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ELibraryView({ elibrary }) {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4">
      <h2 className="text-4xl font-black mb-12">E-Library</h2>
      <div className="space-y-4">
        {elibrary.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex justify-between items-center">
            <div>
              <h3 className="font-black text-xl">{item.judul}</h3>
              <p className="text-zinc-500">{item.deskripsi}</p>
            </div>
            <a href={item.link} target="_blank" rel="noreferrer" className="bg-[#008000] text-white p-4 rounded-2xl">
              <Download className="w-5 h-5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginView({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigateTo('admin');
    } catch (err) {
      alert('Login Gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-6 text-center">Admin Login</h2>
        <input type="email" placeholder="Email" className="w-full p-4 mb-4 rounded-2xl border bg-zinc-50" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-4 mb-6 rounded-2xl border bg-zinc-50" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-[#008000] text-white p-4 rounded-2xl font-black">
          {loading ? 'Masuk...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 4. ADMIN PANEL (FULL IMPLEMENTATION)
// ==========================================

function AdminView({ user, kegiatans, pengurus, elibrary, setIsProcessing, navigateTo }) {
  const [adminTab, setAdminTab] = useState('kegiatan');

  const uploadFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'hmi-preset');
    const res = await fetch('https://api.cloudinary.com/v1_1/ddmlepyin/image/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black">Admin Panel</h2>
        <button onClick={() => signOut(auth)} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold">Logout</button>
      </div>
      
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {['kegiatan', 'pengurus', 'elibrary'].map(t => (
          <button 
            key={t} 
            onClick={() => setAdminTab(t)}
            className={`px-6 py-3 rounded-2xl font-black capitalize ${adminTab === t ? 'bg-[#008000] text-white' : 'bg-white border'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {adminTab === 'kegiatan' && <ManageKegiatan data={kegiatans} uploadFile={uploadFile} setIsProcessing={setIsProcessing} />}
      {adminTab === 'pengurus' && <ManagePengurus data={pengurus} uploadFile={uploadFile} setIsProcessing={setIsProcessing} />}
      {adminTab === 'elibrary' && <ManageELibrary data={elibrary} setIsProcessing={setIsProcessing} />}
    </div>
  );
}

// SUB-ADMIN: KEGIATAN
function ManageKegiatan({ data, uploadFile, setIsProcessing }) {
  const [form, setForm] = useState({ id: '', judul: '', tanggal: '', deskripsi: '' });
  const [file, setFile] = useState(null);

  const reset = () => { setForm({ id: '', judul: '', tanggal: '', deskripsi: '' }); setFile(null); };

  const submit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let url = form.id ? data.find(d => d.id === form.id).imgUrl : '';
      if (file) url = await uploadFile(file);
      
      const payload = { ...form, imgUrl: url, updatedAt: new Date().toISOString() };
      if (form.id) {
        await updateDoc(doc(db, 'kegiatan', form.id), payload);
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'kegiatan'), payload);
      }
      reset();
    } catch (e) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={submit} className="bg-white p-6 rounded-3xl border space-y-4 h-fit">
        <input placeholder="Judul" className="w-full p-3 border rounded-xl" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required />
        <input placeholder="Tanggal" className="w-full p-3 border rounded-xl" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
        <textarea placeholder="Deskripsi" className="w-full p-3 border rounded-xl" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} required />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-black text-white p-3 rounded-xl font-bold">Simpan</button>
          <button type="button" onClick={reset} className="p-3 bg-zinc-100 rounded-xl">Reset</button>
        </div>
      </form>
      <div className="md:col-span-2 space-y-4">
        {data.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center gap-4">
            <img src={item.imgUrl} className="w-20 h-20 object-cover rounded-xl" alt="" />
            <div className="flex-1">
              <h4 className="font-bold">{item.judul}</h4>
            </div>
            <button onClick={() => setForm(item)} className="p-2 text-blue-600"><Edit3 /></button>
            <button onClick={() => deleteDoc(doc(db, 'kegiatan', item.id))} className="p-2 text-red-600"><Trash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// SUB-ADMIN: PENGURUS
function ManagePengurus({ data, uploadFile, setIsProcessing }) {
  const [form, setForm] = useState({ id: '', nama: '', jabatan: '', urutan: 0 });
  const [file, setFile] = useState(null);

  const reset = () => { setForm({ id: '', nama: '', jabatan: '', urutan: 0 }); setFile(null); };

  const submit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let url = form.id ? data.find(d => d.id === form.id).imgUrl : '';
      if (file) url = await uploadFile(file);
      
      const payload = { ...form, urutan: Number(form.urutan), imgUrl: url };
      if (form.id) {
        await updateDoc(doc(db, 'pengurus', form.id), payload);
      } else {
        await addDoc(collection(db, 'pengurus'), payload);
      }
      reset();
    } catch (e) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={submit} className="bg-white p-6 rounded-3xl border space-y-4 h-fit">
        <input placeholder="Nama" className="w-full p-3 border rounded-xl" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
        <input placeholder="Jabatan" className="w-full p-3 border rounded-xl" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} required />
        <input type="number" placeholder="Urutan" className="w-full p-3 border rounded-xl" value={form.urutan} onChange={e => setForm({...form, urutan: e.target.value})} required />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" className="w-full bg-black text-white p-3 rounded-xl font-bold">Simpan Pengurus</button>
        {form.id && <button type="button" onClick={reset} className="w-full p-3 text-zinc-500">Batal Edit</button>}
      </form>
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center gap-4">
            <img src={item.imgUrl} className="w-12 h-12 object-cover rounded-full" alt="" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">{item.nama}</h4>
              <p className="text-xs text-zinc-500">{item.jabatan}</p>
            </div>
            <button onClick={() => setForm(item)} className="p-2 text-blue-600"><Edit3 className="w-4 h-4" /></button>
            <button onClick={() => deleteDoc(doc(db, 'pengurus', item.id))} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// SUB-ADMIN: E-LIBRARY
function ManageELibrary({ data, setIsProcessing }) {
  const [form, setForm] = useState({ id: '', judul: '', deskripsi: '', link: '' });

  const reset = () => setForm({ id: '', judul: '', deskripsi: '', link: '' });

  const submit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (form.id) {
        await updateDoc(doc(db, 'elibrary', form.id), form);
      } else {
        const payload = { ...form, createdAt: new Date().toISOString() };
        await addDoc(collection(db, 'elibrary'), payload);
      }
      reset();
    } catch (e) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={submit} className="bg-white p-6 rounded-3xl border space-y-4 h-fit">
        <input placeholder="Judul Buku/Dokumen" className="w-full p-3 border rounded-xl" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required />
        <input placeholder="Deskripsi" className="w-full p-3 border rounded-xl" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} required />
        <input placeholder="Link Download (URL)" className="w-full p-3 border rounded-xl" value={form.link} onChange={e => setForm({...form, link: e.target.value})} required />
        <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-bold">Simpan Dokumen</button>
      </form>
      <div className="md:col-span-2 space-y-4">
        {data.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
            <div>
              <h4 className="font-bold">{item.judul}</h4>
              <p className="text-sm text-zinc-500">{item.deskripsi}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setForm(item)} className="p-2 text-blue-600"><Edit3 /></button>
              <button onClick={() => deleteDoc(doc(db, 'elibrary', item.id))} className="p-2 text-red-600"><Trash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
