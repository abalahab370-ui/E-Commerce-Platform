import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: [] // 👈 Changed to array for multi-file support
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.getProducts(),
                api.getCategories()
            ]);
            setProducts(Array.isArray(productsRes) ? productsRes : productsRes.products || []);
            setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.categories || []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            // 👈 Store all selected files in an array
            setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            images: []
        });
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            category: product.category?._id || product.category || '',
            images: []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('price', formData.price);
            payload.append('stock', formData.stock);
            
            // 👈 1. Key must be 'categoryId' to match req.body.categoryId
            payload.append('categoryId', formData.category);
            
            // 👈 2. Append each file under 'images' key for multer.array('images')
            if (formData.images.length > 0) {
                formData.images.forEach(file => {
                    payload.append('images', file);
                });
            }

            if (editingProduct) {
                await api.updateProduct(editingProduct._id, payload);
            } else {
                await api.createProduct(payload);
            }

            resetForm();
            await loadData();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement du produit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

        try {
            await api.deleteProduct(productId);
            await loadData();
        } catch (err) {
            alert(`Erreur de suppression: ${err.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Gestion du Catalogue Produits
                </h1>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Ajoutez, modifiez ou supprimez des articles de votre boutique
                </p>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#991B1B', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>
                
                <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>
                        {editingProduct ? '📝 Modifier le Produit' : '➕ Nouveau Produit'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Nom du produit</label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Prix (DZD)</label>
                                <input 
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Stock</label>
                                <input 
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Images (Max 5)</label>
                            {/* 👈 Added 'multiple' attribute */}
                            <input 
                                type="file"
                                accept="image/*"
                                multiple 
                                onChange={handleFileChange}
                                style={{ fontSize: '12px', color: '#64748B' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{ flex: 1, padding: '10px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                            >
                                {submitting ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Créer Produit'}
                            </button>
                            {editingProduct && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{ padding: '10px', backgroundColor: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>
                        Liste des Produits ({products.length})
                    </h2>

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>Chargement du catalogue...</div>
                    ) : products.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Aucun produit enregistré pour le moment.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                                        <th style={{ padding: '10px' }}>Image</th>
                                        <th style={{ padding: '10px' }}>Nom</th>
                                        <th style={{ padding: '10px' }}>Catégorie</th>
                                        <th style={{ padding: '10px' }}>Prix</th>
                                        <th style={{ padding: '10px' }}>Stock</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((item) => (
                                        <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '10px' }}>
                                                {/* 👈 Corrected rendering to inspect the first Cloudinary image URL */}
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0].url} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#F1F5F9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94A3B8' }}>N/A</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: '600', color: '#0F172A' }}>{item.name}</td>
                                            <td style={{ padding: '10px', color: '#64748B' }}>{item.category?.name || 'N/A'}</td>
                                            <td style={{ padding: '10px', fontWeight: '700', color: '#10B981' }}>{item.price} DZD</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: item.stock > 0 ? '#DCFCE7' : '#FEE2E2', color: item.stock > 0 ? '#15803D' : '#991B1B' }}>
                                                    {item.stock} en stock
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    style={{ padding: '4px 8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', marginRight: '6px' }}
                                                >
                                                    ✏️ Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    style={{ padding: '4px 8px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}