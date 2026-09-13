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

export default function Checkout({ productId, selectedVariantId, selectedColor, selectedSize, onBackToStore }) {
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
        deliveryType: 'home',
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
            ? [{
                productId,
                quantity,
                variantId: selectedVariantId || null,
                color: selectedColor || null,
                size: selectedSize || null
              }]
            : cartItems.map(item => ({
                productId: item.productId || item._id || item.id,
                quantity: item.quantity,
                variantId: item.variantId || item.selectedVariantId || null,
                color: item.color || item.selectedColor || null,
                size: item.size || item.selectedSize || null
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
                deliveryType: form.deliveryType,
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
            <div className="max-w-lg mx-auto my-12 p-8 bg-[#161821] border border-[#222634] rounded-3xl text-center shadow-2xl">
                <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#10B981]/20">✓</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Commande Enregistrée !</h2>
                <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
                    Merci <strong className="text-white">{form.customerName}</strong>. Notre centre d'appel va vous contacter au <strong className="text-white">{form.phone}</strong> pour confirmer votre commande avant l'expédition.
                </p>
                <button
                    onClick={onBackToStore}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider py-4 rounded-full transition-all shadow-lg shadow-[#10B981]/20 cursor-pointer"
                >
                    Retour à la boutique
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
            <button
                onClick={onBackToStore}
                className="bg-[#161821] hover:bg-[#222634] border border-[#222634] text-gray-300 font-bold text-xs px-5 py-2.5 rounded-full mb-6 transition-colors flex items-center gap-2 cursor-pointer"
            >
                ← Continuer mes achats
            </button>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-white mb-6">
                Validation de la Commande <span className="text-sm font-sans font-normal text-gray-400 block sm:inline mt-1 sm:mt-0">(Paiement à la livraison)</span>
            </h1>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Card (Desktop: Left columns, Mobile: Top order) */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 bg-[#161821] border border-[#222634] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-xl">
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#10B981] mb-1">Coordonnées de Livraison</h2>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nom et Prénom *</label>
                        <input
                            type="text"
                            name="customerName"
                            value={form.customerName}
                            onChange={handleInputChange}
                            required
                            placeholder="ex: Mohamed Benali"
                            className="w-full bg-[#0D0E14] border border-[#222634] text-xs text-gray-200 placeholder-gray-600 rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Numéro de Téléphone *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="06XX XX XX XX"
                            className="w-full bg-[#0D0E14] border border-[#222634] text-xs text-gray-200 placeholder-gray-600 rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Wilaya *</label>
                            <select
                                name="wilaya"
                                value={form.wilaya}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-[#0D0E14] border border-[#222634] text-xs text-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-colors cursor-pointer"
                            >
                                {ALGERIA_LOCATIONS.map((loc) => (
                                    <option key={loc.code} value={loc.name} className="bg-[#161821] text-white">{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Commune (Baladiya) *</label>
                            <select
                                name="baladiya"
                                value={form.baladiya}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-[#0D0E14] border border-[#222634] text-xs text-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-colors cursor-pointer"
                            >
                                <option value="" className="bg-[#161821] text-gray-500">-- Sélectionner Commune --</option>
                                {availableCommunes.map((commune) => (
                                    <option key={commune} value={commune} className="bg-[#161821] text-white">{commune}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mode de Livraison *</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                form.deliveryType === 'home' 
                                    ? 'border-[#10B981] bg-[#10B981]/10 text-white' 
                                    : 'border-[#222634] bg-[#0D0E14] text-gray-400 hover:border-gray-600'
                            }`}>
                                <input 
                                    type="radio" 
                                    name="deliveryType" 
                                    value="home" 
                                    checked={form.deliveryType === 'home'} 
                                    onChange={handleInputChange} 
                                    className="accent-[#10B981]"
                                />
                                <span className="text-xs font-extrabold uppercase tracking-wider">À Domicile</span>
                            </label>

                            <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                form.deliveryType === 'desk' 
                                    ? 'border-[#10B981] bg-[#10B981]/10 text-white' 
                                    : 'border-[#222634] bg-[#0D0E14] text-gray-400 hover:border-gray-600'
                            }`}>
                                <input 
                                    type="radio" 
                                    name="deliveryType" 
                                    value="desk" 
                                    checked={form.deliveryType === 'desk'} 
                                    onChange={handleInputChange} 
                                    className="accent-[#10B981]"
                                />
                                <span className="text-xs font-extrabold uppercase tracking-wider">Au Bureau</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Adresse Exacte *</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            required
                            rows="3"
                            placeholder={form.deliveryType === 'desk' ? 'Point relais / Adresse du bureau de livraison...' : 'Rue, N° de maison, quartier...'}
                            className="w-full bg-[#0D0E14] border border-[#222634] text-xs text-gray-200 placeholder-gray-600 rounded-xl p-4 focus:outline-none focus:border-[#10B981] transition-colors resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || loadingProduct}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider py-4 rounded-full transition-all shadow-lg shadow-[#10B981]/20 cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {submitting ? 'Confirmation...' : 'Confirmer ma commande (COD)'}
                    </button>
                </form>

                {/* Summary Card (Desktop: Right columns, Mobile: Bottom order) */}
                <div className="lg:col-span-5 bg-[#161821] border border-[#222634] rounded-3xl p-6 sm:p-8 shadow-xl sticky top-24">
                    <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4 pb-3 border-b border-[#222634]">Récapitulatif</h2>

                    {loadingProduct ? (
                        <div className="text-xs text-gray-500 py-8 text-center uppercase tracking-wider">Chargement du produit...</div>
                    ) : productId && product ? (
                        <div>
                            <div className="flex gap-4 items-center mb-6 pb-6 border-b border-[#222634]">
                                {product.imageUrl || product.images?.[0] ? (
                                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden p-1 border border-[#222634] flex-shrink-0 flex items-center justify-center">
                                        <img src={product.imageUrl || (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)} alt={product.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                ) : null}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs sm:text-sm text-white truncate mb-1">{product.name}</h4>
                                    {(selectedColor || selectedSize) && (
                                        <div className="text-[11px] text-gray-400 mb-1">
                                            {selectedColor && `Couleur: ${selectedColor}`} {selectedSize && `| Taille: ${selectedSize}`}
                                        </div>
                                    )}
                                    <span className="text-xs font-black text-[#10B981]">{product.price} DZD</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantité:</span>
                                <div className="flex items-center gap-3 bg-[#0D0E14] border border-[#222634] rounded-full px-3 py-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="text-gray-400 hover:text-white font-bold text-base px-1"
                                    >-</button>
                                    <span className="font-extrabold text-xs text-white">{quantity}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="text-gray-400 hover:text-white font-bold text-base px-1"
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    ) : cartItems.length > 0 ? (
                        <div className="flex flex-col gap-3 mb-6 max-h-[280px] overflow-y-auto pr-1">
                            {cartItems.map((item, index) => (
                                <div key={item.key || item._id || index} className="flex items-center justify-between gap-3 bg-[#0D0E14] p-3 rounded-xl border border-[#222634]">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs text-white truncate">{item.name}</div>
                                        {(item.color || item.size) && (
                                            <div className="text-[10px] text-gray-400">
                                                {item.color && `Couleur: ${item.color} `}{item.size && `| Taille: ${item.size}`}
                                            </div>
                                        )}
                                        <div className="text-[10px] text-gray-500">Qté: {item.quantity}</div>
                                    </div>
                                    <span className="font-black text-xs text-[#10B981] whitespace-nowrap">{item.price * item.quantity} DZD</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 py-12 text-center uppercase tracking-wider">Aucun article dans le panier.</div>
                    )}

                    <div className="border-t border-[#222634] pt-4 mt-4 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-white">Total à payer:</span>
                        <span className="text-lg sm:text-xl font-black text-[#10B981]">{calculateTotal()} DZD</span>
                    </div>
                </div>

            </div>
        </div>
    );
}