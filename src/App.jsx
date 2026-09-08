import React, { useState, useEffect } from 'react';
import StoreNavbar from './components/StoreNavbar';
import AdminNavbar from './components/AdminNavbar';
import Catalog from './pages/Store/Catalog';
import Checkout from './pages/Store/Checkout';
import OrdersDashboard from './pages/admin/OrdersDashBoard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import Login from './pages/admin/Login';

export default function App() {
    // Initial view mode based on browser URL (/admin or /login opens admin mode)
    const [viewMode, setViewMode] = useState(() => {
        const path = window.location.pathname;
        return (path === '/admin' || path === '/login') ? 'admin' : 'store';
    }); 
    
    // Auth state for Admin area
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
    const [adminTab, setAdminTab] = useState('orders');

    // Store navigation state
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isCheckout, setIsCheckout] = useState(() => window.location.pathname === '/checkout');

    // Sync state if user types in browser bar or presses Back/Forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path === '/admin' || path === '/login') {
                setViewMode('admin');
            } else {
                setViewMode('store');
                setIsCheckout(path === '/checkout');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Sync URL path when switching views programmatically
    const navigateTo = (path, mode) => {
        window.history.pushState({}, '', path);
        setViewMode(mode);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        navigateTo('/', 'store');
    };

    const handleResetStore = () => {
        setSelectedProductId(null);
        setIsCheckout(false);
        window.history.pushState({}, '', '/');
    };

    const handleGoToCheckout = () => {
        setIsCheckout(true);
        window.history.pushState({}, '', '/checkout');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            {viewMode === 'store' ? (
                <>
                    <StoreNavbar 
                        onGoToAdmin={() => navigateTo('/admin', 'admin')} 
                        onResetStore={handleResetStore} 
                        onGoToCheckout={handleGoToCheckout}
                    />
                    <main style={{ flex: 1 }}>
                        {isCheckout || selectedProductId ? (
                            <Checkout 
                                productId={selectedProductId} 
                                onBackToStore={handleResetStore} 
                            />
                        ) : (
                            <Catalog 
                                onSelectProduct={(id) => {
                                    setSelectedProductId(id);
                                    handleGoToCheckout();
                                }}
                                onGoToCheckout={handleGoToCheckout}
                                onCartCheckout={handleGoToCheckout}
                            />
                        )}
                    </main>
                </>
            ) : (
                <>
                    {isAuthenticated ? (
                        <>
                            <AdminNavbar 
                                activeTab={adminTab} 
                                setActiveTab={setAdminTab} 
                                onLogout={handleLogout} 
                                onGoToStore={() => navigateTo('/', 'store')} 
                            />
                            <main style={{ flex: 1 }}>
                                {adminTab === 'orders' && <OrdersDashboard />}
                                {adminTab === 'products' && <ProductManagement />}
                                {adminTab === 'categories' && <CategoryManagement />}
                            </main>
                        </>
                    ) : (
                        <div style={{ flex: 1 }}>
                            <div style={{ padding: '16px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => navigateTo('/', 'store')}
                                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
                                >
                                    ← Retour à la boutique
                                </button>
                            </div>
                            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}