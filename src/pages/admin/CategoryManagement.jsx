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
        description: ''
    });

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory._id, formData);
            } else {
                await api.createCategory(formData);
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Gestion des Catégories
                </h1>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Structurez le catalogue de votre boutique en organisant vos rayons
                </p>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#991B1B', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Category Form (Create / Edit) */}
                <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>
                        {editingCategory ? '📝 Modifier Catégorie' : '➕ Nouvelle Catégorie'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                Nom de la catégorie
                            </label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="ex: Électronique, Vêtements..."
                                style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                Description (Optionnel)
                            </label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Brève description du rayon..."
                                style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{ flex: 1, padding: '10px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                            >
                                {submitting ? 'Enregistrement...' : editingCategory ? 'Mettre à jour' : 'Créer Catégorie'}
                            </button>
                            {editingCategory && (
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

                {/* Categories Table */}
                <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>
                        Catégories Existantes ({categories.length})
                    </h2>

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>Chargement des catégories...</div>
                    ) : categories.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>Aucune catégorie créée.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                                        <th style={{ padding: '10px' }}>Nom</th>
                                        <th style={{ padding: '10px' }}>Description</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '10px', fontWeight: '700', color: '#0F172A' }}>{cat.name}</td>
                                            <td style={{ padding: '10px', color: '#64748B' }}>{cat.description || '—'}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleEditClick(cat)}
                                                    style={{ padding: '4px 8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', marginRight: '6px' }}
                                                >
                                                    ✏️ Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
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