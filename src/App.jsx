import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
    // Current active view state: 'catalog', 'product-detail', 'checkout', 'admin-login', 'admin-dashboard'
    const [currentView, setCurrentView] = useState('catalog');
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Check if admin is already logged in on load
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token && currentView === 'admin-login') {
            setCurrentView('admin-dashboard');
        }
    }, [currentView]);

    const handleSelectProduct = (productId) => {
        setSelectedProductId(productId);
        setCurrentView('product-detail');
    };

    const handleAdminLoginSuccess = () => {
        setCurrentView('admin-dashboard');
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('adminToken');
        setCurrentView('admin-login');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            
            {/* Top Navigation Bar */}
            <Navbar currentView={currentView} setCurrentView={setCurrentView} />

            {/* Admin Header Context Banner (When logged into Admin Dashboard) */}
            {currentView === 'admin-dashboard' && (
                <div style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <span>Logged in as <strong>Call-Center Admin</strong></span>
                    <button 
                        onClick={handleAdminLogout}
                        style={{ padding: '4px 12px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                        Sign Out
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <main style={{ flex: 1, paddingBottom: '60px' }}>
                {currentView === 'catalog' && (
                    <Catalog onSelectProduct={handleSelectProduct} />
                )}

                {currentView === 'product-detail' && (
                    <ProductDetail productId={selectedProductId} />
                )}

                {currentView === 'checkout' && (
                    <Checkout />
                )}

                {currentView === 'admin-login' && (
                    <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
                )}

                {currentView === 'admin-dashboard' && (
                    <AdminDashboard />
                )}
            </main>

            {/* Simple Minimal Footer */}
            <footer style={{ borderTop: '1px solid #E2E8F0', backgroundColor: '#FFF', padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                &copy; {new Date().getFullYear()} High-Performance COD E-commerce Platform. All rights reserved.
            </footer>

        </div>
    );
}