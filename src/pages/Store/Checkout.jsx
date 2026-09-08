import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ALGERIA_LOCATIONS = [
    { code: '01', name: '01 - Adrar', communes: ['Adrar', 'Reggane', 'Aoulef', 'Timimoun'] },
    { code: '02', name: '02 - Chlef', communes: ['Chlef', 'Boukadir', 'Ténès', 'Beni Haoua', 'Oued Sly', 'El Karimia', 'Taougrite', 'Sendjas', 'Sobha', 'Harchoun'] },
    { code: '03', name: '03 - Laghouat', communes: ['Laghouat', 'Aflou', 'Ksar El Hirane'] },
    { code: '04', name: '04 - Oum El Bouaghi', communes: ['Oum El Bouaghi', 'Aïn Beïda', 'Aïn M\'lila'] },
    { code: '05', name: '05 - Batna', communes: ['Batna', 'Barika', 'Arris', 'Merouana'] },
    { code: '06', name: '06 - Béjaïa', communes: ['Béjaïa', 'Amizour', 'Akbou', 'El Kseur'] },
    { code: '07', name: '07 - Biskra', communes: ['Biskra', 'Tolga', 'Sidi Okba'] },
    { code: '08', name: '08 - Béchar', communes: ['Béchar', 'Kenadsa', 'Abadla'] },
    { code: '09', name: '09 - Blida', communes: ['Blida', 'Boufarik', 'Mouzaïa', 'Ouled Yaïch'] },
    { code: '10', name: '10 - Bouira', communes: ['Bouira', 'Lakhdaria', 'Sour El Ghozlane'] },
    { code: '11', name: '11 - Tamanrasset', communes: ['Tamanrasset', 'In Salah', 'Abalessa'] },
    { code: '12', name: '12 - Tébessa', communes: ['Tébessa', 'Cheria', 'El Aouinet'] },
    { code: '13', name: '13 - Tlemcen', communes: ['Tlemcen', 'Maghnia', 'Remchi', 'Ghazaouet'] },
    { code: '14', name: '14 - Tiaret', communes: ['Tiaret', 'Sougueur', 'Frenda'] },
    { code: '15', name: '15 - Tizi Ouzou', communes: ['Tizi Ouzou', 'Azazga', 'Draâ Ben Khedda', 'Tigzirt'] },
    { code: '16', name: '16 - Alger', communes: ['Alger Centre', 'Bab El Oued', 'Hydra', 'Kouba', 'El Harrach', 'Zéralda', 'Dar El Beïda', 'Birtouta'] },
    { code: '17', name: '17 - Djelfa', communes: ['Djelfa', 'Aïn Oussara', 'Messaad'] },
    { code: '18', name: '18 - Jijel', communes: ['Jijel', 'Taher', 'El Milia'] },
    { code: '19', name: '19 - Sétif', communes: ['Sétif', 'El Eulma', 'Aïn Oulmene'] },
    { code: '20', name: '20 - Saïda', communes: ['Saïda', 'Aïn El Hadjar'] },
    { code: '21', name: '21 - Skikda', communes: ['Skikda', 'El Harrouch', 'Collo'] },
    { code: '22', name: '22 - Sidi Bel Abbès', communes: ['Sidi Bel Abbès', 'Télagh', 'Sofi'] },
    { code: '23', name: '23 - Annaba', communes: ['Annaba', 'El Bouni', 'Berrahal'] },
    { code: '24', name: '24 - Guelma', communes: ['Guelma', 'Oued Zenati', 'Bouchegouf'] },
    { code: '25', name: '25 - Constantine', communes: ['Constantine', 'El Khroub', 'Hamma Bouziane', 'Didouche Mourad'] },
    { code: '26', name: '26 - Médéa', communes: ['Médéa', 'Berrouaghia', 'Ksar El Boukhari'] },
    { code: '27', name: '27 - Mostaganem', communes: ['Mostaganem', 'Aïn Tedles', 'Sidi Ali'] },
    { code: '28', name: '28 - M\'Sila', communes: ['M\'Sila', 'Bou Saâda', 'Sidi Aïssa'] },
    { code: '29', name: '29 - Mascara', communes: ['Mascara', 'Sig', 'Tighennif'] },
    { code: '30', name: '30 - Ouargla', communes: ['Ouargla', 'Hassi Messaoud', 'Touggourt'] },
    { code: '31', name: '31 - Oran', communes: ['Oran', 'Es Sénia', 'Bir El Djir', 'Arzew', 'Aïn El Turk'] },
    { code: '32', name: '32 - El Bayadh', communes: ['El Bayadh', 'Brezina', 'El Abiodh Sidi Cheikh'] },
    { code: '33', name: '33 - Illizi', communes: ['Illizi', 'Djanet'] },
    { code: '34', name: '34 - Bordj Bou Arréridj', communes: ['Bordj Bou Arreridj', 'Ras El Oued'] },
    { code: '35', name: '35 - Boumerdès', communes: ['Boumerdès', 'Bordj Menaïel', 'Dellys', 'Khemis El Khechna'] },
    { code: '36', name: '36 - El Tarf', communes: ['El Tarf', 'El Kala', 'Dréan'] },
    { code: '37', name: '37 - Tindouf', communes: ['Tindouf', 'Oum El Assel'] },
    { code: '38', name: '38 - Tissemsilt', communes: ['Tissemsilt', 'Théniet El Had'] },
    { code: '39', name: '39 - El Oued', communes: ['El Oued', 'Robbah', 'Djamaa'] },
    { code: '40', name: '40 - Khenchela', communes: ['Khenchela', 'Kais', 'Chechar'] },
    { code: '41', name: '41 - Souk Ahras', communes: ['Souk Ahras', 'Seddrata', 'M\'daourouch'] },
    { code: '42', name: '42 - Tipaza', communes: ['Tipaza', 'Cherchell', 'Kolea', 'Bou Ismail'] },
    { code: '43', name: '43 - Mila', communes: ['Mila', 'Chelghoum Laïd', 'Ferdjioua'] },
    { code: '44', name: '44 - Aïn Defla', communes: ['Aïn Defla', 'Khemis Miliana', 'El Attaf'] },
    { code: '45', name: '45 - Naâma', communes: ['Naâma', 'Aïn Sefra', 'Mécheria'] },
    { code: '46', name: '46 - Aïn Témouchent', communes: ['Aïn Témouchent', 'Hammam Bou Hadjar', 'Béni Saf'] },
    { code: '47', name: '47 - Ghardaïa', communes: ['Ghardaïa', 'Metlili', 'El Guerrara'] },
    { code: '48', name: '48 - Relizane', communes: ['Relizane', 'Oued Rhiou', 'Mazouna'] },
    { code: '49', name: '49 - El M\'Ghair', communes: ['El M\'Ghair', 'Djamaa'] },
    { code: '50', name: '50 - El Meniaa', communes: ['El Meniaa', 'Hassi Gara'] },
    { code: '51', name: '51 - Ouled Djellal', communes: ['Ouled Djellal', 'Sidi Khaled'] },
    { code: '52', name: '52 - Bordj Baji Mokhtar', communes: ['Bordj Baji Mokhtar', 'Timiaouine'] },
    { code: '53', name: '53 - Béni Abbès', communes: ['Béni Abbès', 'Igli', 'El Ouata'] },
    { code: '54', name: '54 - Timimoun', communes: ['Timimoun', 'Aougrout'] },
    { code: '55', name: '55 - Touggourt', communes: ['Touggourt', 'Tebesbest'] },
    { code: '56', name: '56 - Djanet', communes: ['Djanet', 'Bordj El Haouass'] },
    { code: '57', name: '57 - In Salah', communes: ['In Salah', 'In Ghar'] },
    { code: '58', name: '58 - In Guezzam', communes: ['In Guezzam', 'Tin Zaouatine'] }
];

export default function Checkout({ productId, onBackToStore }) {
    // Read cart directly from localStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('storedz_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(!!productId);
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        customerName: '',
        phone: '',
        wilaya: '16 - Alger',
        baladiya: '',
        address: ''
    });

    useEffect(() => {
        if (!productId) return;
        
        async function fetchSelectedProduct() {
            setLoadingProduct(true);
            try {
                const data = await api.getProductById(productId);
                setProduct(data.product || data);
            } catch (err) {
                setError('Erreur lors du chargement des détails du produit.');
            } finally {
                setLoadingProduct(false);
            }
        }

        fetchSelectedProduct();
    }, [productId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ 
            ...prev, 
            [name]: value,
            ...(name === 'wilaya' ? { baladiya: '' } : {}) 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const orderItems = productId
            ? [{ productId, quantity }]
            : cartItems.map(item => ({
                productId: item._id || item.id,
                quantity: item.quantity
              }));

        if (orderItems.length === 0) {
            setError('Votre panier est vide.');
            setSubmitting(false);
            return;
        }

        const orderPayload = {
            shippingDetails: {
                fullName: form.customerName,
                phone: form.phone,
                wilaya: form.wilaya,
                baladiya: form.baladiya,
                deliveryType: 'home',
                address: form.address
            },
            items: orderItems
        };

        try {
            await api.createGuestOrder(orderPayload);
            localStorage.removeItem('storedz_cart');
            setCartItems([]);
            setOrderSuccess(true);
        } catch (err) {
            setError(err.message || 'Échec lors de la validation de la commande.');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedWilayaObj = ALGERIA_LOCATIONS.find(loc => loc.name === form.wilaya);
    const availableCommunes = selectedWilayaObj ? selectedWilayaObj.communes : [];

    const calculateTotal = () => {
        if (productId && product) {
            return product.price * quantity;
        }
        return cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    };

    if (orderSuccess) {
        return (
            <div style={{ maxWidth: '500px', margin: '40px auto', padding: '32px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px auto' }}>✓</div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Commande Enregistrée !</h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '8px', lineHeight: '1.5' }}>
                    Merci <strong>{form.customerName}</strong>. Notre centre d'appel va vous contacter au <strong>{form.phone}</strong> pour confirmer votre commande avant l'expédition.
                </p>
                <button
                    onClick={onBackToStore}
                    style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                    Retour à la boutique
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
            <button
                onClick={onBackToStore}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}
            >
                ← Continuer mes achats
            </button>

            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
                Validation de la Commande (Paiement à la livraison)
            </h1>

            {error && (
                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '6px', fontSize: '13px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                
                {/* Form Section */}
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Coordonnées de Livraison</h2>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Nom et Prénom *</label>
                        <input
                            type="text"
                            name="customerName"
                            value={form.customerName}
                            onChange={handleInputChange}
                            required
                            placeholder="ex: Mohamed Benali"
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Numéro de Téléphone *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="06XX XX XX XX"
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Wilaya *</label>
                        <select
                            name="wilaya"
                            value={form.wilaya}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                            {ALGERIA_LOCATIONS.map((loc) => (
                                <option key={loc.code} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Commune (Baladiya) *</label>
                        <select
                            name="baladiya"
                            value={form.baladiya}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                            <option value="">-- Sélectionner Commune --</option>
                            {availableCommunes.map((commune) => (
                                <option key={commune} value={commune}>{commune}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Adresse Exacte *</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            required
                            rows="2"
                            placeholder="Rue, N° de maison, quartier..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || loadingProduct}
                        style={{ padding: '12px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}
                    >
                        {submitting ? 'Confirmation...' : 'Confirmer ma commande (COD)'}
                    </button>
                </form>

                {/* Summary Section */}
                <div style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginTop: 0, marginBottom: '16px' }}>Récapitulatif</h2>

                    {loadingProduct ? (
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Chargement du produit...</div>
                    ) : productId && product ? (
                        <div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                                {product.imageUrl && (
                                    <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                )}
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{product.name}</h4>
                                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>{product.price} DZD</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Quantité:</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        style={{ width: '28px', height: '28px', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                                    >-</button>
                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{quantity}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => q + 1)}
                                        style={{ width: '28px', height: '28px', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    ) : cartItems.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                            {cartItems.map((item, index) => (
                                <div key={item._id || item.id || index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>Qté: {item.quantity}</div>
                                    </div>
                                    <span style={{ fontWeight: '700', color: '#10B981' }}>{item.price * item.quantity} DZD</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>Aucun article dans le panier.</div>
                    )}

                    <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Total à payer:</span>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>{calculateTotal()} DZD</span>
                    </div>
                </div>

            </div>
        </div>
    );
}