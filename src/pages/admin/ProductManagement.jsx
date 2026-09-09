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
    const [isVariantProduct, setIsVariantProduct] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        images: []
    });

    // Variant State
    const [variants, setVariants] = useState([{ color: '', size: '', stock: 0 }]);

    // Image Deletion State (for Edit mode)
    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);

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
        if ((name === 'price' || name === 'stock') && value !== '') {
            const numValue = Math.max(0, Number(value));
            setFormData(prev => ({ ...prev, [name]: numValue }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
        }
    };

    // Variant Row Handlers
    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = field === 'stock' ? Math.max(0, Number(value)) : value;
        setVariants(updated);
    };

    const addVariantRow = () => {
        setVariants([...variants, { color: '', size: '', stock: 0 }]);
    };

    const removeVariantRow = (index) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    // Remove existing image in edit mode
    const handleRemoveExistingImage = (publicId) => {
        setRemovedImageIds(prev => [...prev, publicId]);
        setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
    };

    const resetForm = () => {
        setEditingProduct(null);
        setIsVariantProduct(false);
        setVariants([{ color: '', size: '', stock: 0 }]);
        setExistingImages([]);
        setRemovedImageIds([]);
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
        setIsVariantProduct(Boolean(product.hasVariants));
        setExistingImages(product.images || []);
        setRemovedImageIds([]);
        
        if (product.hasVariants && product.variants?.length > 0) {
            setVariants(product.variants);
        } else {
            setVariants([{ color: '', size: '', stock: 0 }]);
        }

        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price ?? '',
            stock: product.stock ?? '',
            category: product.category?._id || product.category || '',
            images: []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting edit form...', editingProduct?._id); // Check browser console
        setError('');
    // ...
        setSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description);
            payload.append('price', formData.price);
            payload.append('categoryId', formData.category);

            if (formData.images.length > 0) {
                formData.images.forEach(file => {
                    payload.append('images', file);
                });
            }

            if (editingProduct) {
                // UPDATE PATH (PATCH /:id)
                
                // 1. Send reordered existing images so backend saves the new main image (index 0)
                payload.append('existingImages', JSON.stringify(existingImages));

                // 2. Send removed image IDs
                if (removedImageIds.length > 0) {
                    payload.append('removedImageIds', JSON.stringify(removedImageIds));
                }

                if (isVariantProduct) {
                    payload.append('variants', JSON.stringify(variants));
                } else {
                    payload.append('stock', formData.stock);
                }

                await api.updateProduct(editingProduct._id, payload);
            } else {
                // CREATE PATH
                if (isVariantProduct) {
                    payload.append('variants', JSON.stringify(variants));
                    await api.createVariantProduct(payload);
                } else {
                    payload.append('stock', formData.stock);
                    await api.createStandardProduct(payload);
                }
            }

            resetForm();
            await loadData();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement du produit');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetMainImage = (indexToMakeMain) => {
    setExistingImages((prev) => {
        const updated = [...prev];
        const [selected] = updated.splice(indexToMakeMain, 1);
        updated.unshift(selected);
        return updated;
    });
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

    // Calculate total stock for display in table
    const getDisplayStock = (item) => {
        if (item.hasVariants && Array.isArray(item.variants)) {
            return item.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
        }
        return item.stock || 0;
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

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* FORM CONTAINER */}
                <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>
                        {editingProduct ? '📝 Modifier le Produit' : '➕ Nouveau Produit'}
                    </h2>

                    {/* Product Type Switcher (Creation Only) */}
                    {!editingProduct && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button
                                type="button"
                                onClick={() => setIsVariantProduct(false)}
                                style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '700', borderRadius: '4px', border: !isVariantProduct ? '2px solid #0F172A' : '1px solid #CBD5E1', backgroundColor: !isVariantProduct ? '#F1F5F9' : '#FFF', cursor: 'pointer' }}
                            >
                                Standard
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsVariantProduct(true)}
                                style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '700', borderRadius: '4px', border: isVariantProduct ? '2px solid #0F172A' : '1px solid #CBD5E1', backgroundColor: isVariantProduct ? '#F1F5F9' : '#FFF', cursor: 'pointer' }}
                            >
                                Tailles / Couleurs
                            </button>
                        </div>
                    )}

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

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Prix (DZD)</label>
                            <input 
                                type="number"
                                name="price"
                                min="0"
                                step="any"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* INVENTORY FIELDS: Standard vs Variant */}
                        {!isVariantProduct ? (
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Stock Global</label>
                                <input 
                                    type="number"
                                    name="stock"
                                    min="0"
                                    step="1"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>
                        ) : (
                            <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Variantes</label>
                                    <button 
                                        type="button" 
                                        onClick={addVariantRow}
                                        style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                                {variants.map((v, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Couleur" 
                                            value={v.color} 
                                            onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                                            style={{ flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Taille" 
                                            value={v.size} 
                                            onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                            style={{ flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Qté" 
                                            min="0"
                                            value={v.stock} 
                                            onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                            style={{ width: '50px', padding: '6px', fontSize: '11px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                                        />
                                        {variants.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeVariantRow(i)} 
                                                style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

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

{/* Existing Images preview in edit mode with "Set Main" controls */}
{editingProduct && existingImages.length > 0 && (
    <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
            Images Actuelles (La première est la principale)
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {existingImages.map((img, index) => (
                <div 
                    key={img.publicId || index} 
                    style={{ 
                        position: 'relative', 
                        width: '72px', 
                        height: '72px', 
                        borderRadius: '6px', 
                        border: index === 0 ? '2px solid #10B981' : '1px solid #CBD5E1', 
                        overflow: 'hidden',
                        backgroundColor: '#F8FAFC'
                    }}
                >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* MAIN BADGE (INDEX 0) OR SET MAIN BUTTON */}
                    {index === 0 ? (
                        <span style={{
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                            backgroundColor: '#10B981',
                            color: '#FFF',
                            fontSize: '8px',
                            fontWeight: '800',
                            padding: '2px 4px',
                            borderRadius: '3px'
                        }}>
                            Principale
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleSetMainImage(index)}
                            style={{
                                position: 'absolute',
                                bottom: '2px',
                                left: '2px',
                                right: '2px',
                                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                color: '#FFF',
                                border: 'none',
                                fontSize: '8px',
                                fontWeight: '700',
                                padding: '2px 0',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Def. Principale
                        </button>
                    )}

                    {/* REMOVE BUTTON */}
                    <button 
                        type="button" 
                        onClick={() => handleRemoveExistingImage(img.publicId)}
                        style={{ 
                            position: 'absolute', 
                            top: 2, 
                            right: 2, 
                            backgroundColor: '#EF4444', 
                            color: '#FFF', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '16px', 
                            height: '16px', 
                            fontSize: '9px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    </div>
)}

<div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
        Nouvelles Images
    </label>
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

                {/* TABLE CONTAINER */}
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
                                        <th style={{ padding: '10px' }}>Stock Total</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((item) => {
                                        const stockCount = getDisplayStock(item);
                                        return (
                                            <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '10px' }}>
                                                    {item.images && item.images.length > 0 ? (
                                                        <img src={item.images[0].url} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#F1F5F9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94A3B8' }}>N/A</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', fontWeight: '600', color: '#0F172A' }}>
                                                    {item.name}
                                                    {item.hasVariants && (
                                                        <span style={{ display: 'block', fontSize: '10px', color: '#6366F1', fontWeight: 'bold' }}>
                                                            {item.variants?.length || 0} variante(s)
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px', color: '#64748B' }}>{item.category?.name || 'N/A'}</td>
                                                <td style={{ padding: '10px', fontWeight: '700', color: '#10B981' }}>{item.price} DZD</td>
                                                <td style={{ padding: '10px' }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: stockCount > 0 ? '#DCFCE7' : '#FEE2E2', color: stockCount > 0 ? '#15803D' : '#991B1B' }}>
                                                        {stockCount} en stock
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}