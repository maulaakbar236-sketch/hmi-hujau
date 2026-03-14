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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const qKegiatan = query(collection(db, 'kegiatan'), orderBy('createdAt', 'desc'));
    const unsubKegiatan = onSnapshot(qKegiatan, (snapshot) => {
      setKegiatans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Kegiatan error:", err));

    const qPengurus = query(collection(db, 'pengurus'), orderBy('urutan', 'asc'));
    const unsubPengurus = onSnapshot(qPengurus, (snapshot) => {
      setPengurus(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Pengurus error:", err));

    const qLibrary = query(collection(db, 'elibrary'), orderBy('createdAt', 'desc'));
    const unsubLibrary = onSnapshot(qLibrary, (snapshot) => {
      setElibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Library error:", err));

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
      alert('Login Gagal. Cek kembali Email/Password anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black mb-6 text-center">Admin Login</h2>
        <input type="email" placeholder="Email" className="w-full p-4 mb-4 rounded-2xl border bg-zinc-50 focus:ring-2 focus:ring-[#008000]" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-4 mb-6 rounded-2xl border bg-zinc-50 focus:ring-2 focus:ring-[#008000]" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-[#008000] text-white p-4 rounded-2xl font-black transition-transform active:scale-95 disabled:opacity-50">
          {loading ? 'Masuk...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 4. ADMIN PANEL (PROTECTED & IMPROVED)
// ==========================================

function AdminView({ user, kegiatans, pengurus, elibrary, setIsProcessing, navigateTo }) {
  const [adminTab, setAdminTab] = useState('kegiatan');

  const uploadFile = async (file) => {
    try {
      if (!file) return null;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'hmi-preset'); // Ganti dengan preset Cloudinary anda
      
      const res = await fetch('https://api.cloudinary.com/v1_1/ddmlepyin/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const resData = await res.json();
      if (!resData.secure_url) {
        throw new Error(resData.error?.message || "Gagal mendapatkan link foto dari Cloudinary");
      }
      return resData.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black">Admin Panel</h2>
          <p className="text-zinc-500 text-sm">Masuk sebagai: {user.email}</p>
        </div>
        <button onClick={() => { signOut(auth); navigateTo('home'); }} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition">Logout</button>
      </div>
      
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['kegiatan', 'pengurus', 'elibrary'].map(t => (
          <button 
            key={t} 
            onClick={() => setAdminTab(t)}
            className={`px-6 py-3 rounded-2xl font-black capitalize transition-all whitespace-nowrap ${adminTab === t ? 'bg-[#008000] text-white shadow-lg scale-105' : 'bg-white border text-zinc-600 hover:bg-zinc-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {adminTab === 'kegiatan' && <ManageKegiatan data={kegiatans} uploadFile={uploadFile} setIsProcessing={setIsProcessing} />}
        {adminTab === 'pengurus' && <ManagePengurus data={pengurus} uploadFile={uploadFile} setIsProcessing={setIsProcessing} />}
        {adminTab === 'elibrary' && <ManageELibrary data={elibrary} setIsProcessing={setIsProcessing} />}
      </div>
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
    if (!file && !form.id) return alert("Pilih foto terlebih dahulu!");
    
    setIsProcessing(true);
    try {
      // Logic URL Photo
      let url = form.id ? (data.find(d => d.id === form.id)?.imgUrl || '') : '';
      
      if (file) {
        const uploadedUrl = await uploadFile(file);
        if (!uploadedUrl) throw new Error("Gagal upload foto. Pastikan koneksi stabil.");
        url = uploadedUrl;
      }
      
      const payload = { 
        judul: form.judul,
        tanggal: form.tanggal,
        deskripsi: form.deskripsi,
        imgUrl: url,
        updatedAt: new Date().toISOString() 
      };

      if (form.id) {
        await updateDoc(doc(db, 'kegiatan', form.id), payload);
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'kegiatan'), payload);
      }
      reset();
      alert("Data Kegiatan berhasil disimpan!");
    } catch (e) { 
      alert("Error: " + e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus kegiatan ini?")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'kegiatan', id));
    } catch (e) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={submit} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 h-fit sticky top-32">
        <h3 className="font-black text-lg border-b pb-2 mb-4">{form.id ? 'Edit' : 'Tambah'} Kegiatan</h3>
        <input placeholder="Judul" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required />
        <input placeholder="Tanggal (Contoh: 12 Jan 2024)" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
        <textarea placeholder="Deskripsi Singkat" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 h-32" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} required />
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500">Pilih Foto (Upload Cloudinary)</p>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm w-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-[#008000] text-white p-3 rounded-xl font-bold hover:bg-green-700 transition">Simpan</button>
          <button type="button" onClick={reset} className="p-3 bg-zinc-100 rounded-xl hover:bg-zinc-200 text-zinc-600 transition">Reset</button>
        </div>
      </form>

      <div className="md:col-span-2 space-y-4">
        {data.length === 0 && <p className="text-zinc-400 text-center py-10 italic">Belum ada data kegiatan.</p>}
        {data.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-zinc-100 flex items-center gap-4 hover:shadow-md transition group">
            <img src={item.imgUrl} className="w-20 h-20 object-cover rounded-2xl shadow-inner bg-zinc-100" alt="" />
            <div className="flex-1">
              <h4 className="font-bold text-zinc-800 leading-tight">{item.judul}</h4>
              <p className="text-xs text-zinc-400 mt-1">{item.tanggal}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => setForm(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
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
    if (!file && !form.id) return alert("Pilih foto pengurus!");
    
    setIsProcessing(true);
    try {
      let url = form.id ? (data.find(d => d.id === form.id)?.imgUrl || '') : '';
      
      if (file) {
        const uploadedUrl = await uploadFile(file);
        if (!uploadedUrl) throw new Error("Gagal upload foto pengurus.");
        url = uploadedUrl;
      }
      
      const payload = { 
        nama: form.nama,
        jabatan: form.jabatan,
        urutan: Number(form.urutan), 
        imgUrl: url 
      };

      if (form.id) {
        await updateDoc(doc(db, 'pengurus', form.id), payload);
      } else {
        await addDoc(collection(db, 'pengurus'), payload);
      }
      reset();
      alert("Data Pengurus tersimpan!");
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus pengurus ini?")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'pengurus', id));
    } catch (e) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={submit} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 h-fit sticky top-32">
        <h3 className="font-black text-lg border-b pb-2 mb-4">Data Pengurus</h3>
        <input placeholder="Nama Lengkap" className="w-full p-3 border rounded-xl" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
        <input placeholder="Jabatan" className="w-full p-3 border rounded-xl" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} required />
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500">Nomor Urutan (Untuk Sorting)</p>
          <input type="number" className="w-full p-3 border rounded-xl" value={form.urutan} onChange={e => setForm({...form, urutan: e.target.value})} required />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500">Upload Foto</p>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm w-full" />
        </div>
        <button type="submit" className="w-full bg-[#008000] text-white p-3 rounded-xl font-bold hover:bg-green-700 transition">Simpan Pengurus</button>
        {form.id && <button type="button" onClick={reset} className="w-full p-2 text-zinc-500 text-sm hover:underline">Batal Edit</button>}
      </form>

      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-zinc-100 flex items-center gap-4 group hover:border-green-200 transition shadow-sm">
            <img src={item.imgUrl} className="w-14 h-14 object-cover rounded-full bg-zinc-50" alt="" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-sm truncate">{item.nama}</h4>
              <p className="text-xs text-[#008000] font-bold uppercase">{item.jabatan}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setForm(item)} className="p-2 text-blue-500"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
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
      const payload = { 
        judul: form.judul,
        deskripsi: form.deskripsi,
        link: form.link,
        updatedAt: new Date().toISOString()
      };

      if (form.id) {
        await updateDoc(doc(db, 'elibrary', form.id), payload);
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'elibrary'), payload);
      }
      reset();
      alert("Dokumen berhasil ditambahkan!");
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus dokumen ini?")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'elibrary', id));
    } catch (e) { alert(e.message); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={submit} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 h-fit sticky top-32">
        <h3 className="font-black text-lg border-b pb-2 mb-4">Input Library</h3>
        <input placeholder="Judul Buku/Dokumen" className="w-full p-3 border rounded-xl" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required />
        <input placeholder="Deskripsi Singkat" className="w-full p-3 border rounded-xl" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} required />
        <input placeholder="Link Google Drive / Download" className="w-full p-3 border rounded-xl" value={form.link} onChange={e => setForm({...form, link: e.target.value})} required />
        <button type="submit" className="w-full bg-[#008000] text-white p-4 rounded-xl font-bold hover:bg-green-700 transition">Simpan Dokumen</button>
      </form>

      <div className="md:col-span-2 space-y-3">
        {data.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-zinc-100 flex items-center justify-between group hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="bg-zinc-50 p-3 rounded-2xl">
                <BookOpen className="text-[#008000] w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-800">{item.judul}</h4>
                <p className="text-xs text-zinc-400">{item.deskripsi}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setForm(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
