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
    const [directBuyDetails, setDirectBuyDetails] = useState(null);
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
        setDirectBuyDetails(null);
        setIsCheckout(false);
        window.history.pushState({}, '', '/');
    };

    const handleGoToCheckout = () => {
        setIsCheckout(true);
        window.history.pushState({}, '', '/checkout');
    };

    return (
        <div className="min-h-screen bg-[#0B0D12] text-gray-100 flex flex-col font-sans selection:bg-[#10B981] selection:text-black">
            {viewMode === 'store' ? (
                <>
                    <StoreNavbar 
                        onGoToAdmin={() => navigateTo('/admin', 'admin')} 
                        onResetStore={handleResetStore} 
                        onGoToCheckout={handleGoToCheckout}
                    />
                    <main className="flex-1 w-full">
                        {isCheckout || selectedProductId ? (
                            <Checkout 
                                productId={selectedProductId}
                                selectedVariantId={directBuyDetails?.variantId || null}
                                selectedColor={directBuyDetails?.color || null}
                                selectedSize={directBuyDetails?.size || null}
                                onBackToStore={handleResetStore} 
                            />
                        ) : (
                            <Catalog 
                                onSelectProduct={(id, variantData) => {
                                    setSelectedProductId(id);
                                    setDirectBuyDetails(variantData || null);
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
                            <main className="flex-1 w-full bg-[#161821] p-6">
                                {adminTab === 'orders' && <OrdersDashboard />}
                                {adminTab === 'products' && <ProductManagement />}
                                {adminTab === 'categories' && <CategoryManagement />}
                            </main>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center p-4">
                            <div className="mb-4">
                                <button 
                                    onClick={() => navigateTo('/', 'store')}
                                    className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    ← Back to Store
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