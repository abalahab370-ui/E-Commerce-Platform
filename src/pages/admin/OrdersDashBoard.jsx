import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

const STATUSES = [
    { key: 'Pending_Confirmation', label: 'En Attente', color: '#EAB308' },
    { key: 'Confirmed', label: 'Confirmée', color: '#3B82F6' },
    { key: 'In Transit', label: 'En Transit', color: '#8B5CF6' }, // Fixed enum value
    { key: 'Delivered', label: 'Livrée', color: '#10B981' },
    { key: 'Cancelled', label: 'Annulée', color: '#EF4444' }
];

export default function OrdersDashboard() {
    const [orders, setOrders] = useState([]);
    const [activeStatus, setActiveStatus] = useState('Pending_Confirmation');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getOrders(activeStatus);
            setOrders(Array.isArray(data) ? data : data.orders || []);
        } catch (err) {
            setError(err.message || 'Impossible de charger les commandes');
        } finally {
            setLoading(false);
        }
    }, [activeStatus]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        Centre d'Appels COD
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                        Gestion des confirmations et de l'expédition
                    </p>
                </div>
                <button 
                    onClick={loadOrders}
                    disabled={loading}
                    style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                    {loading ? 'Actualisation...' : '🔄 Rafraîchir'}
                </button>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                {STATUSES.map((status) => {
                    const isActive = activeStatus === status.key;
                    return (
                        <button
                            key={status.key}
                            onClick={() => setActiveStatus(status.key)}
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

            {/* Loading Skeleton */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '14px' }}>
                    Chargement des commandes en cours...
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '14px' }}>
                    Aucune commande dans cette catégorie.
                </div>
            ) : (
                /* Orders Feed */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => {
                        const customerName = order.shippingDetails?.fullName || order.customerName || 'Client Inconnu';
                        const phone = order.shippingDetails?.phone || order.phone || '';
                        const wilaya = order.shippingDetails?.wilaya || order.wilaya || '';
                        const baladiya = order.shippingDetails?.baladiya || '';
                        const address = order.shippingDetails?.address || order.address || '';

                        const locationText = [wilaya, baladiya, address].filter(Boolean).join(' - ') || 'Pas d\'adresse renseignée';

                        return (
                            <div 
                                key={order._id} 
                                style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>ID: #{order._id}</span>
                                        <h3 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                                            {customerName}
                                        </h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#10B981' }}>
                                            {order.totalAmount || order.totalPrice || 0} DZD
                                        </span>
                                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Paiement à la livraison</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
                                    <div>
                                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700' }}>TELEPHONE</span>
                                        {phone ? (
                                            <a 
                                                href={`tel:${phone}`} 
                                                style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none', display: 'inline-block', marginTop: '2px' }}
                                            >
                                                📞 {phone}
                                            </a>
                                        ) : (
                                            <span style={{ color: '#94A3B8', marginTop: '2px', display: 'inline-block' }}>Non renseigné</span>
                                        )}
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700' }}>WILAYA & ADRESSE</span>
                                        <div style={{ color: '#334155', fontWeight: '600', marginTop: '2px' }}>
                                            {locationText}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700' }}>ARTICLES</span>
                                        <div style={{ color: '#334155', marginTop: '2px' }}>
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <div key={idx}>• {item.product?.name || item.name || 'Produit'} (x{item.quantity})</div>
                                                ))
                                            ) : (
                                                <span>Commande unique</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Change Controls */}
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
                                                    style={{ padding: '6px 12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    ✓ Confirmer
                                                </button>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Cancelled')}
                                                    style={{ padding: '6px 12px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    ✕ Annuler
                                                </button>
                                            </>
                                        )}

                                        {activeStatus === 'Confirmed' && (
                                            <button
                                                disabled={updatingId === order._id}
                                                onClick={() => handleStatusChange(order._id, 'In Transit')}
                                                style={{ padding: '6px 12px', backgroundColor: '#8B5CF6', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                🚚 Expédier (In Transit)
                                            </button>
                                        )}

                                        {activeStatus === 'In Transit' && (
                                            <button
                                                disabled={updatingId === order._id}
                                                onClick={() => handleStatusChange(order._id, 'Delivered')}
                                                style={{ padding: '6px 12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                📦 Marquer comme Livré
                                            </button>
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