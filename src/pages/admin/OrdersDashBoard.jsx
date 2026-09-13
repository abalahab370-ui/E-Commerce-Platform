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
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

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

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setAppliedSearch(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setAppliedSearch('');
    };

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
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#0F172A' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
        Gestion Logistique
    </span>
    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
        Commandes COD
    </h1>
</div>
                <button 
                    onClick={loadOrders}
                    disabled={loading}
                    style={{ padding: '10px 18px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                    {loading ? 'Rafraîchissement...' : ' Actualiser'}
                </button>
            </div>

            {/* Search Toolbar */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                        type="text"
                        placeholder="Rechercher par Nom exact ou Téléphone..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '11px 16px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: '11px 22px',
                        backgroundColor: '#4F46E5',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '8px',
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
                            padding: '11px 16px',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        Réinitialiser
                    </button>
                )}
            </form>

            {/* Pill Tabs Header */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                {STATUSES.map((status) => {
                    const isActive = activeStatus === status.key;
                    return (
                        <button
                            key={status.key}
                            onClick={() => handleTabChange(status.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: isActive ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                backgroundColor: isActive ? '#EEF2FF' : '#FFFFFF',
                                color: isActive ? '#4F46E5' : '#64748B',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {status.label}
                        </button>
                    );
                })}
            </div>

            {/* Error Notification */}
            {error && (
                <div style={{ padding: '14px 18px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '10px', marginBottom: '24px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            {/* Orders Feed */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748B', fontSize: '14px' }}>
                    Chargement des commandes...
                </div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '14px' }}>
                    Aucune commande enregistrée pour ce statut.
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
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.03em' }}>ID: #{order._id}</span>
                                        <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                                            {fullName}
                                        </h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>
                                            {order.totalAmount} DZD
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                            {shippingCost > 0 ? `+ Livr: ${shippingCost} DZD` : 'Frais de livraison inclus'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                                    <div>
                                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</span>
                                        {phone ? (
                                            <a 
                                                href={`tel:${phone}`} 
                                                style={{ color: '#4F46E5', fontWeight: '700', fontSize: '14px', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
                                            >
                                                📞 {phone}
                                            </a>
                                        ) : (
                                            <span style={{ color: '#94A3B8', marginTop: '4px', display: 'inline-block', fontSize: '13px' }}>Non renseigné</span>
                                        )}
                                    </div>

                                    <div>
                                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</span>
                                        <div style={{ color: '#0F172A', fontWeight: '700', fontSize: '13px', marginTop: '4px' }}>
                                            {wilaya} {baladiya ? `- ${baladiya}` : ''}
                                        </div>
                                        {address && (
                                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                                {address}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '8px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                backgroundColor: deliveryType === 'desk' ? '#FFFBEB' : '#ECFDF5',
                                                color: deliveryType === 'desk' ? '#B45309' : '#047857',
                                                border: `1px solid ${deliveryType === 'desk' ? '#FDE68A' : '#A7F3D0'}`
                                            }}>
                                                {deliveryType === 'desk' ? 'Point Relais / Bureau' : 'À Domicile'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                            Articles Commandés ({order.items?.length || 0})
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 10px', borderRadius: '8px' }}>
                                                        <div style={{ fontWeight: '700', color: '#0F172A' }}>
                                                            {item.name || item.product?.name || 'Produit'} 
                                                            <span style={{ color: '#4F46E5', marginLeft: '6px' }}>x{item.quantity}</span>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                                            Prix unit: <strong>{item.price} DZD</strong>
                                                        </div>
                                                        {(item.color || item.size) && (
                                                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                                                {item.color && (
                                                                    <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '10px' }}>
                                                                        {item.color}
                                                                    </span>
                                                                )}
                                                                {item.size && (
                                                                    <span style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '1px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '10px' }}>
                                                                        Taille: {item.size}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>Aucun article</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Control Toolbar */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                                        Mettre à jour le statut :
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {activeStatus === 'Pending_Confirmation' && (
                                            <>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Confirmed')}
                                                    style={{ padding: '7px 14px', backgroundColor: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    Confirmée
                                                </button>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Cancelled')}
                                                    style={{ padding: '7px 14px', backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    Annuler
                                                </button>
                                            </>
                                        )}

                                        {activeStatus === 'Confirmed' && (
                                            <button
                                                disabled={updatingId === order._id}
                                                onClick={() => handleStatusChange(order._id, 'Shipped')}
                                                style={{ padding: '7px 14px', backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                🚚 Passer en Expédiée
                                            </button>
                                        )}

                                        {activeStatus === 'Shipped' && (
                                            <>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Completed')}
                                                    style={{ padding: '7px 14px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                                >
                                                    Livrée & Payée
                                                </button>
                                                <button
                                                    disabled={updatingId === order._id}
                                                    onClick={() => handleStatusChange(order._id, 'Retour')}
                                                    style={{ padding: '7px 14px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
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