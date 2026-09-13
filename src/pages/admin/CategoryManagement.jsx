import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isFeatured: false,
        featuredTitle: '',
        featuredSubtitle: '',
        buttonText: 'Découvrir'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getCategories();
            setCategories(Array.isArray(data) ? data : data.categories || []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des catégories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            isFeatured: false,
            featuredTitle: '',
            featuredSubtitle: '',
            buttonText: 'Découvrir'
        });
        setImageFile(null);
        setImagePreview('');
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            isFeatured: !!category.isFeatured,
            featuredTitle: category.featuredTitle || '',
            featuredSubtitle: category.featuredSubtitle || '',
            buttonText: category.buttonText || 'Découvrir'
        });
        setImagePreview(category.bannerImage || '');
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const dataToSend = new FormData();
            dataToSend.append('name', formData.name);
            dataToSend.append('description', formData.description);
            dataToSend.append('isFeatured', formData.isFeatured);
            dataToSend.append('featuredTitle', formData.featuredTitle);
            dataToSend.append('featuredSubtitle', formData.featuredSubtitle);
            dataToSend.append('buttonText', formData.buttonText);

            if (imageFile) {
                dataToSend.append('image', imageFile);
            }

            if (editingCategory) {
                await api.updateCategory(editingCategory._id, dataToSend);
            } else {
                await api.createCategory(dataToSend);
            }

            resetForm();
            await loadCategories();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement de la catégorie');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;

        try {
            await api.deleteCategory(categoryId);
            await loadCategories();
        } catch (err) {
            alert(`Erreur de suppression: ${err.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#0F172A', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            
            <div style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
                    Gestion des Catégories
                </h1>
                <p style={{ fontSize: '15px', color: '#64748B', margin: '6px 0 0 0' }}>
                    Créez des rayons et configurez les bannières promotionnelles de votre boutique.
                </p>
            </div>

            {error && (
                <div style={{ padding: '16px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', marginBottom: '32px', fontSize: '14px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* SPACIOUS FORM CARD */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 24px 0', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                    {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Nouvelle Catégorie'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                Nom de la catégorie <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="ex: Électronique & High-Tech"
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                                Description
                            </label>
                            <input 
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Courte introduction de la catégorie..."
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* BANNER CONFIGURATION BOX */}
                    <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                            <input 
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                style={{ width: '20px', height: '20px', accentColor: '#4F46E5', cursor: 'pointer' }}
                            />
                            Mettre en Vedette (Bannière Hero sur l'Accueil)
                        </label>

                        {formData.isFeatured && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px', paddingTop: '20px', borderTop: '1px stroke #E5E7EB' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', marginBottom: '6px' }}>Titre de la bannière</label>
                                        <input 
                                            type="text" 
                                            name="featuredTitle" 
                                            value={formData.featuredTitle} 
                                            onChange={handleInputChange} 
                                            placeholder="ex: Offres Spéciales Été" 
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', marginBottom: '6px' }}>Sous-titre</label>
                                        <input 
                                            type="text" 
                                            name="featuredSubtitle" 
                                            value={formData.featuredSubtitle} 
                                            onChange={handleInputChange} 
                                            placeholder="ex: Jusqu'à -40% sur la sélection" 
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', marginBottom: '6px' }}>Texte du Bouton</label>
                                        <input 
                                            type="text" 
                                            name="buttonText" 
                                            value={formData.buttonText} 
                                            onChange={handleInputChange} 
                                            placeholder="ex: Découvrir" 
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                                        />
                                    </div>
                                </div>

                                {/* PROMINENT BANNER IMAGE PREVIEW */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', marginBottom: '6px' }}>Image de la Bannière</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ fontSize: '13px', width: '100%', color: '#374151', marginBottom: '12px' }}
                                    />
                                    {imagePreview ? (
                                        <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB', position: 'relative' }}>
                                            <img src={imagePreview} alt="Aperçu Bannière" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', height: '160px', borderRadius: '10px', border: '2px dashed #D1D5DB', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                            Aucune image sélectionnée
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        {editingCategory && (
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
                            style={{ padding: '12px 32px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                        >
                            {submitting ? 'Enregistrement...' : editingCategory ? 'Mettre à jour' : 'Créer la Catégorie'}
                        </button>
                    </div>

                </form>
            </div>

            {/* SPACIOUS LIST TABLE */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 24px 0' }}>
                    Catégories de la Boutique
                </h2>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>Chargement...</div>
                ) : categories.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>Aucune catégorie configurée.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Bannière Image</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Nom & Description</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700' }}>Mise en Vedette</th>
                                    <th style={{ padding: '16px 20px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            {cat.bannerImage ? (
                                                <img src={cat.bannerImage} alt={cat.name} style={{ width: '90px', height: '54px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                                            ) : (
                                                <div style={{ width: '90px', height: '54px', backgroundColor: '#F3F4F6', borderRadius: '8px', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#9CA3AF' }}>
                                                    Pas de visuel
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '15px' }}>{cat.name}</div>
                                            {cat.description && (
                                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{cat.description}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {cat.isFeatured ? (
                                                <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                                                    ⭐ En Vedette
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Standard</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleEditClick(cat)}
                                                style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', color: '#374151', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginRight: '8px' }}
                                            >
                                                Éditer
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat._id)}
                                                style={{ padding: '8px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                            >
                                                Supprimer
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
    );
}