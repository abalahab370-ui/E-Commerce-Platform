// config/deliveryFees.js

const deliveryRates = {
    "Adrar": { home: 1000, desk: 600 },
    "Chlef": { home: 700, desk: 400 },
    "Laghouat": { home: 800, desk: 500 },
    "Oum El Bouaghi": { home: 700, desk: 400 },
    "Batna": { home: 700, desk: 400 },
    "Béjaïa": { home: 700, desk: 400 },
    "Biskra": { home: 800, desk: 500 },
    "Béchar": { home: 900, desk: 550 },
    "Blida": { home: 600, desk: 350 },
    "Bouira": { home: 650, desk: 350 },
    "Tamanrasset": { home: 1400, desk: 900 },
    "Tébessa": { home: 750, desk: 450 },
    "Tlemcen": { home: 700, desk: 400 },
    "Tiaret": { home: 700, desk: 400 },
    "Tizi Ouzou": { home: 650, desk: 350 },
    "Alger": { home: 500, desk: 300 },
    "Djelfa": { home: 800, desk: 500 },
    "Jijel": { home: 700, desk: 400 },
    "Sétif": { home: 650, desk: 350 },
    "Saïda": { home: 750, desk: 450 },
    "Skikda": { home: 700, desk: 400 },
    "Sidi Bel Abbès": { home: 700, desk: 400 },
    "Annaba": { home: 700, desk: 400 },
    "Guelma": { home: 700, desk: 400 },
    "Constantine": { home: 650, desk: 350 },
    "Médéa": { home: 650, desk: 350 },
    "Mostaganem": { home: 700, desk: 400 },
    "M'Sila": { home: 750, desk: 450 },
    "Mascara": { home: 700, desk: 400 },
    "Ouargla": { home: 900, desk: 550 },
    "Oran": { home: 600, desk: 350 },
    "El Bayadh": { home: 850, desk: 500 },
    "Illizi": { home: 1400, desk: 900 },
    "Bordj Bou Arréridj": { home: 650, desk: 350 },
    "Boumerdès": { home: 600, desk: 350 },
    "El Tarf": { home: 750, desk: 450 },
    "Tindouf": { home: 1400, desk: 900 },
    "Tissemsilt": { home: 700, desk: 400 },
    "El Oued": { home: 900, desk: 550 },
    "Khenchela": { home: 750, desk: 450 },
    "Souk Ahras": { home: 750, desk: 450 },
    "Tipaza": { home: 600, desk: 350 },
    "Mila": { home: 700, desk: 400 },
    "Aïn Defla": { home: 650, desk: 350 },
    "Naâma": { home: 850, desk: 500 },
    "Aïn Témouchent": { home: 700, desk: 400 },
    "Ghardaïa": { home: 850, desk: 500 },
    "Relizane": { home: 700, desk: 400 },
    "Timimoun": { home: 1100, desk: 700 },
    "Bordj Badji Mokhtar": { home: 1500, desk: 1000 },
    "Ouled Djellal": { home: 850, desk: 500 },
    "Béni Abbès": { home: 1000, desk: 600 },
    "In Salah": { home: 1300, desk: 800 },
    "In Guezzam": { home: 1500, desk: 1000 },
    "Touggourt": { home: 900, desk: 550 },
    "Djanet": { home: 1500, desk: 1000 },
    "El M'Ghair": { home: 900, desk: 550 },
    "El Meniaa": { home: 1000, desk: 600 }
};

const DEFAULT_RATES = { home: 800, desk: 500 };

const getDeliveryFee = (wilaya, deliveryType = 'home') => {
    if (!wilaya) {
        throw new Error('Wilaya is required to calculate delivery fee');
    }

    const formattedWilaya = Object.keys(deliveryRates).find(
        key => key.toLowerCase() === wilaya.trim().toLowerCase()
    );

    const rates = deliveryRates[formattedWilaya] || DEFAULT_RATES;
    const type = deliveryType.toLowerCase() === 'desk' ? 'desk' : 'home';

    return rates[type];
};

module.exports = { getDeliveryFee };