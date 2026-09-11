import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

const STATUSES = [
    { key: 'Pending_Confirmation', label: 'En Attente' },
    { key: 'Confirmed', label: 'Confirmée' },
    { key: 'Shipped', label: 'Expédiée' },
    { key: 'Completed', label: 'Livrée & Payée' },
    { key: 'Retour', label: 'Retour' },
    { key: 'Cancelled', label: 'Annulée' }
];

export default function OrdersDashboard() {
    const [orders, setOrders] = useState([]);
    const [activeStatus, setActiveStatus] = useState('Pending_Confirmation');
    const [searchInput, setSearchInput] = useState(''); // Text box state (typing)
    const [appliedSearch, setAppliedSearch] = useState(''); // Active query sent to API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    // Only triggers API calls when activeStatus OR appliedSearch changes
    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getOrders(activeStatus, appliedSearch);
            setOrders(Array.isArray(data) ? data : data.orders || []);
        } catch (err) {
            setError(err.message || 'Impossible de charger les commandes');
        } finally {
            setLoading(false);
        }
    }, [activeStatus, appliedSearch]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Submit search on Enter or button click
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setAppliedSearch(searchInput.trim());
    };

    // Reset search
    const handleClearSearch = () => {
        setSearchInput('');
        setAppliedSearch('');
    };

    // Tab switch resets current search filter
    const handleTabChange = (statusKey) => {
        setActiveStatus(statusKey);
        setSearchInput('');
        setAppliedSearch('');
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await api.updateOrderStatus(orderId, newStatus);
            await loadOrders();
        } catch (err) {
            alert(`Erreur de mise à jour: ${err.message}`);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        Centre d'Appels COD
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                        Gestion des confirmations, d'expédition et des ventes
                    </p>
                </div>
                <button 
                    onClick={loadOrders}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                    {loading ? 'Actualisation...' : 'Rafraîchir'}
                </button>
            </div>

            {/* Search Bar Form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input 
                    type="text"
                    placeholder="Rechercher par Nom exact ou Téléphone..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 18px',
                        backgroundColor: '#0F172A',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                    }}
                >
                     Rechercher
                </button>
                {appliedSearch && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        style={{
                            padding: '10px 14px',
                            backgroundColor: '#E2E8F0',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        Effacer
                    </button>
                )}
            </form>

            {/* Status Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                {STATUSES.map((status) => {
                    const isActive = activeStatus === status.key;
                    return (
                        <button
                            key={status.key}
                            onClick={() => handleTabChange(status.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                backgroundColor: isActive ? '#0F172A' : '#F1F5F9',
                                color: isActive ? '#FFF' : '#475569',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {status.label}
                        </button>
                    );
                })}
            </div>

            {/* Error Display */}
            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#991B1B', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            {/* Orders Feed */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '14px' }}>
                    Chargement des commandes en cours...
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '14px' }}>
                    Aucune commande trouvée.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => {
                        const fullName = order.shippingDetails?.fullName || order.customerName || 'Client Inconnu';
                        const phone = order.shippingDetails?.phone || order.phone || '';
                        const wilaya = order.shippingDetails?.wilaya || order.wilaya || '';
                        const baladiya = order.shippingDetails?.baladiya || '';
                        const address = order.shippingDetails?.address || order.address || '';
                        const deliveryType = order.shippingDetails?.deliveryType || 'home';
                        const shippingCost = order.shippingCost || 0;

                        return (
                            <div 
                                key={order._id} 
                                style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>ID: #{order._id}</span>
                                        <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                            {fullName}
                                        </h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>
                                            {order.totalAmount} DZD
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                            {shippingCost > 0 ? `(Frais livraison: ${shippingCost} DZD)` : 'Paiement à la livraison'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Téléphone</span>
                                        {phone ? (
                                            <a 
                                                href={`tel:${phone}`} 
                                                style={{ color: '#2563EB', fontWeight: '700', fontSize: '14px', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
                                            >
                                                📞 {phone}
                                            </a>
                                        ) : (
                                            <span style={{ color: '#94A3B8', marginTop: '4px', display: 'inline-block' }}>Non renseigné</span>
                                        )}
                                    </div>

                                    <div>
                                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Livraison & Adresse</span>
                                        <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '13px', marginTop: '4px' }}>
                                            {wilaya} {baladiya ? `- ${baladiya}` : ''}
                                        </div>
                                        {address && (
                                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                                                {address}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '8px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                backgroundColor: deliveryType === 'desk' ? '#FEF3C7' : '#ECFDF5',
                                                color: deliveryType === 'desk' ? '#D97706' : '#059669',
                                                border: `1px solid ${deliveryType === 'desk' ? '#FDE68A' : '#A7F3D0'}`
                                            }}>
                                                {deliveryType === 'desk' ? 'Au Bureau' : ' À Domicile'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: 'span 1' }}>
                                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            Articles ({order.items?.length || 0})
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '13px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 10px', borderRadius: '6px' }}>
                                                        <div style={{ fontWeight: '700', color: '#0F172A' }}>
                                                            • {item.name || item.product?.name || 'Produit'} 
                                                            <span style={{ color: '#2563EB', marginLeft: '6px' }}>(x{item.quantity})</span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                                            Prix: <strong>{item.price} DZD</strong>
                                                        </div>
                                                        {(item.color || item.size) && (
                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px' }}>
                                                                {item.color && (
                                                                    <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                                                         Couleur: {item.color}
                                                                    </span>
                                                                )}
                                                                {item.size && (
                                                                    <span style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                                                         Taille: {item.size}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>Aucun article renseigné</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                                        Changer le statut:
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {activeStatus === 'Pending_Confirmation' && (
                                            <>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Confirmed')}
                                                    style={{ padding: '6px 12px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    ✓ Confirmer
                                                </button>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Cancelled')}
                                                    style={{ padding: '6px 12px', backgroundColor: '#64748B', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    ✕ Annuler
                                                </button>
                                            </>
                                        )}

                                        {activeStatus === 'Confirmed' && (
                                            <button
                                                disabled={updatingId === order._id}
                                                onClick={() => handleStatusChange(order._id, 'Shipped')}
                                                style={{ padding: '6px 12px', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                🚚 Marquer Expédiée
                                            </button>
                                        )}

                                        {activeStatus === 'Shipped' && (
                                            <>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Completed')}
                                                    style={{ padding: '6px 12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                     Livrée & Payée
                                                </button>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Retour')}
                                                    style={{ padding: '6px 12px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                     Retour (Refusée)
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}