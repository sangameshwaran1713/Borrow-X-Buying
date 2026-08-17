import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ItemDetails from './pages/ItemDetails';
import AddItem from './pages/AddItem';
import MyItems from './pages/MyItems';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import LoginRegisterModal from './pages/LoginRegisterModal';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-primary-500 selection:text-white">
            <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/item/:id" element={<ItemDetails onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
                <Route path="/add-item" element={<AddItem onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
                <Route path="/my-items" element={<MyItems onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
                <Route path="/requests" element={<Requests onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
                <Route path="/profile" element={<Profile onOpenAuthModal={() => setIsAuthModalOpen(true)} />} />
              </Routes>
            </main>

            <Footer />

            {/* Global Authentication Modal */}
            <LoginRegisterModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
