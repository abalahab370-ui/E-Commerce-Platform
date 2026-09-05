import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';

export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [statusTab, setStatusTab] = useState('Pending_Confirmation');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch token from localStorage (saved during admin login)
    const token = localStorage.getItem('adminToken');

    // Fetch orders when tab or search changes
    useEffect(() => {
        fetchOrders();
    }, [statusTab]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');

        try {
            let endpoint = `/orders?status=${statusTab}`;
            if (searchTerm.trim()) {
                endpoint += `&search=${encodeURIComponent(searchTerm.trim())}`;
            }

            const data = await apiRequest(endpoint, { token });
            setOrders(data.orders || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch orders.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchOrders();
    };

    // Update status (Confirm or Cancel)
    const handleStatusUpdate = async (orderId, newStatus) => {
        const confirmMsg = newStatus === 'Cancelled' 
            ? 'Are you sure you want to cancel this order? This will instantly restore inventory.'
            : `Mark order as ${newStatus}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await apiRequest(`/orders/${orderId}/status`, {
                method: 'PATCH',
                token,
                body: { status: newStatus }
            });

            // Refresh list after status update
            fetchOrders();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#0F172A' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px' }}>Call-Center Order Dashboard</h1>

            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px' }}>
                {[
                    { key: 'Pending_Confirmation', label: 'Pending Calls' },
                    { key: 'Confirmed', label: 'Confirmed' },
                    { key: 'Shipped', label: 'In Transit' },
                    { key: 'Delivered', label: 'Delivered' },
                    { key: 'Cancelled', label: 'Cancelled' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusTab(tab.key)}
                        style={{
                            padding: '10px 18px',
                            fontWeight: '600',
                            fontSize: '14px',
                            border: 'none',
                            borderBottom: statusTab === tab.key ? '3px solid #2563EB' : '3px solid transparent',
                            backgroundColor: 'transparent',
                            color: statusTab === tab.key ? '#2563EB' : '#64748B',
                            cursor: 'pointer'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search by customer name or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Search
                </button>
            </form>

            {error && (
                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {/* Orders Feed */}
            {loading ? (
                <p style={{ color: '#64748B' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
                <p style={{ color: '#64748B' }}>No orders found in this section.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => (
                        <div key={order._id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', backgroundColor: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            
                            {/* Order Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: '600' }}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <p style={{ fontSize: '15px', fontWeight: '600', margin: '4px 0' }}>
                                    Customer: {order.shippingDetails.fullName} — <a href={`tel:${order.shippingDetails.phone}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{order.shippingDetails.phone}</a>
                                </p>
                                <p style={{ fontSize: '14px', color: '#475569', margin: '2px 0' }}>
                                    Location: {order.shippingDetails.wilaya}, {order.shippingDetails.baladiya} ({order.shippingDetails.deliveryType.toUpperCase()} Delivery)
                                </p>

                                {/* Items Breakdown */}
                                <div style={{ marginTop: '12px', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', maxWidth: '500px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>ORDER ITEMS:</span>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ fontSize: '14px', margin: '4px 0' }}>
                                            • {item.name} x{item.quantity} — <strong>{(item.price * item.quantity).toLocaleString()} DZD</strong>
                                        </div>
                                    ))}
                                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                                        Shipping Fee: {order.shippingCost.toLocaleString()} DZD
                                    </div>
                                </div>
                            </div>

                            {/* Total Bill & Action Buttons */}
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>Total Amount</span>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F172A' }}>
                                        {order.totalAmount.toLocaleString()} DZD
                                    </div>
                                </div>

                                {statusTab === 'Pending_Confirmation' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                                            style={{ padding: '8px 14px', backgroundColor: '#16A34A', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Confirm Call
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                            style={{ padding: '8px 14px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Cancel & Restock
                                        </button>
                                    </div>
                                )}

                                {statusTab === 'Confirmed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                        style={{ padding: '8px 14px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        Mark as In Transit
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}