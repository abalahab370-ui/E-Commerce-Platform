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

    // Image Deletion State
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
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
                payload.append('existingImages', JSON.stringify(existingImages));

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

    const getDisplayStock = (item) => {
        if (item.hasVariants && Array.isArray(item.variants)) {
            return item.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
        }
        return item.stock || 0;
    };

    return (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#0F172A', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            
            {/* Header Area */}
            <div style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
                        Gestion des Produits
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748B', margin: '6px 0 0 0' }}>
                        Ajoutez, modifiez et gérez les photos et stocks de votre catalogue.
                    </p>
                </div>
            </div>

            {error && (
                <div style={{ padding: '16px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', marginBottom: '32px', fontSize: '14px', fontWeight: '500' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Main Form Container - Spacious Uncrowded Layout */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', marginBottom: '40px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                            {editingProduct ? 'Modifier le Produit' : 'Créer un Nouveau Produit'}
                        </h2>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>
                            {editingProduct ? `ID: #${editingProduct._id}` : 'Remplissez les détails ci-dessous'}
                        </span>
                    </div>

                    {!editingProduct && (
                        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setIsVariantProduct(false)}
                                style={{
                                    padding: '8px 18px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: !isVariantProduct ? '#FFFFFF' : 'transparent',
                                    color: !isVariantProduct ? '#0F172A' : '#64748B',
                                    boxShadow: !isVariantProduct ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Produit Simple
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsVariantProduct(true)}
                                style={{
                                    padding: '8px 18px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: isVariantProduct ? '#FFFFFF' : 'transparent',
                                    color: isVariantProduct ? '#0F172A' : '#64748B',
                                    boxShadow: isVariantProduct ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Avec Variantes
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Top Row: Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                Nom du produit <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="ex: Veste Homme en Cuir Premium"
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                Catégorie <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                Prix (DZD) <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input 
                                type="number"
                                name="price"
                                min="0"
                                step="any"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                placeholder="4500"
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Stock & Variant Section */}
                    {!isVariantProduct ? (
                        <div style={{ maxWidth: '300px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                Quantité en Stock
                            </label>
                            <input 
                                type="number"
                                name="stock"
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={handleInputChange}
                                required
                                placeholder="10"
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Variantes (Couleurs & Tailles)</label>
                                <button 
                                    type="button" 
                                    onClick={addVariantRow}
                                    style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                                >
                                    + Ajouter une Variante
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {variants.map((v, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Couleur (ex: Noir)" 
                                            value={v.color} 
                                            onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                                            style={{ flex: 2, padding: '10px 14px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px' }}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Taille (ex: XL)" 
                                            value={v.size} 
                                            onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                            style={{ flex: 2, padding: '10px 14px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px' }}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Qté" 
                                            min="0"
                                            value={v.stock} 
                                            onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                                            style={{ flex: 1, padding: '10px 14px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px' }}
                                        />
                                        {variants.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeVariantRow(i)} 
                                                style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', padding: '4px 8px' }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description Area */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                            Description Complète
                        </label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Décrivez les caractéristiques, matières, et détails de livraison du produit..."
                            style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                    </div>

                    {/* LARGE IMAGE PREVIEW DISPLAY AREA */}
                    <div style={{ backgroundColor: '#F9FAFB', border: '1px dashed #D1D5DB', padding: '24px', borderRadius: '12px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                            Galerie Photos du Produit
                        </label>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
                            Téléchargez des images haute résolution. La première image servira de couverture.
                        </p>

                        {/* Existing Photos Grid - Big Cards */}
                        {editingProduct && existingImages.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                                    Images Actuelles
                                </span>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    {existingImages.map((img, index) => (
                                        <div 
                                            key={img.publicId || index} 
                                            style={{ 
                                                position: 'relative', 
                                                width: '130px', 
                                                height: '130px', 
                                                borderRadius: '12px', 
                                                border: index === 0 ? '3px solid #4F46E5' : '1px solid #E5E7EB', 
                                                overflow: 'hidden',
                                                backgroundColor: '#FFFFFF',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                                            }}
                                        >
                                            <img src={img.url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                            {index === 0 ? (
                                                <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#4F46E5', color: '#FFF', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                                    Principale
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetMainImage(index)}
                                                    style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#FFF', border: 'none', fontSize: '10px', fontWeight: '600', padding: '4px 0', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Définir Principale
                                                </button>
                                            )}

                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveExistingImage(img.publicId)}
                                                style={{ position: 'absolute', top: 6, right: 6, backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input 
                            type="file"
                            accept="image/*"
                            multiple 
                            onChange={handleFileChange}
                            style={{ fontSize: '13px', color: '#374151' }}
                        />
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                        {editingProduct && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={{ padding: '12px 24px', backgroundColor: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '12px 32px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)' }}
                        >
                            {submitting ? 'Enregistrement...' : editingProduct ? 'Mettre à jour le Produit' : 'Créer le Produit'}
                        </button>
                    </div>

                </form>
            </div>

            {/* SPACIOUS TABLE LIST */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                        Inventaire Actuel
                    </h2>
                    <span style={{ fontSize: '13px', fontWeight: '600', backgroundColor: '#F3F4F6', color: '#4B5563', padding: '6px 14px', borderRadius: '20px' }}>
                        {products.length} articles au total
                    </span>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                        Chargement des données...
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
                        Aucun produit enregistré.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Photo</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Désignation</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Catégorie</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Prix</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Disponible</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item) => {
                                    const stockCount = getDisplayStock(item);
                                    return (
                                        <tr key={item._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0].url} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E5E7EB' }} />
                                                ) : (
                                                    <div style={{ width: '64px', height: '64px', backgroundColor: '#F3F4F6', borderRadius: '10px', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#9CA3AF' }}>
                                                        Pas d'img
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '15px' }}>{item.name}</div>
                                                {item.hasVariants && (
                                                    <div style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '600', marginTop: '4px' }}>
                                                        {item.variants?.length || 0} variante(s) configurée(s)
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#4B5563' }}>{item.category?.name || 'Non classé'}</td>
                                            <td style={{ padding: '16px 20px', fontWeight: '700', color: '#059669', fontSize: '15px' }}>{item.price} DZD</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', backgroundColor: stockCount > 0 ? '#ECFDF5' : '#FEF2F2', color: stockCount > 0 ? '#047857' : '#B91C1C', border: `1px solid ${stockCount > 0 ? '#A7F3D0' : '#FCA5A5'}` }}>
                                                    {stockCount} unités
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', color: '#374151', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginRight: '8px' }}
                                                >
                                                    Éditer
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    style={{ padding: '8px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                                >
                                                    Supprimer
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
    );
}