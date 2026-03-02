// ─── DATA PRODUK ───
const PRODUCTS = [
    { id: 1, brand: 'BBS', name: 'BBS RS-GT', size: 'R18', pcd: '5x114.3', color: 'Silver', price: 'Rp 8.500.000', priceNum: 8500000, badge: 'Best Seller', icon: '⚙️', stock: true },
    { id: 2, brand: 'Enkei', name: 'Enkei RPF1', size: 'R17', pcd: '4x114.3', color: 'Matte Black', price: 'Rp 4.200.000', priceNum: 4200000, badge: 'New', icon: '🔩', stock: true },
    { id: 3, brand: 'HSR', name: 'HSR Wheel Barus', size: 'R16', pcd: '4x100', color: 'Glossy Black', price: 'Rp 2.800.000', priceNum: 2800000, badge: null, icon: '🛞', stock: true },
    { id: 4, brand: 'OZ Racing', name: 'OZ Ultraleggera', size: 'R19', pcd: '5x112', color: 'Matt Race Silver', price: 'Rp 12.000.000', priceNum: 12000000, badge: 'Best Seller', icon: '🏎️', stock: true },
    { id: 5, brand: 'Rays', name: 'Volk Racing TE37', size: 'R17', pcd: '5x114.3', color: 'Bronze', price: 'Rp 9.800.000', priceNum: 9800000, badge: 'Best Seller', icon: '🚗', stock: false },
    { id: 6, brand: 'Enkei', name: 'Enkei GTC01RR', size: 'R18', pcd: '5x114.3', color: 'Hyper Black', price: 'Rp 6.500.000', priceNum: 6500000, badge: 'New', icon: '⚡', stock: true },
    { id: 7, brand: 'BBS', name: 'BBS CH-R', size: 'R20', pcd: '5x120', color: 'Satin Platinum', price: 'Rp 15.000.000', priceNum: 15000000, badge: null, icon: '💎', stock: true },
    { id: 8, brand: 'HSR', name: 'HSR Wheel Settia', size: 'R15', pcd: '4x100', color: 'Hyper Silver', price: 'Rp 1.900.000', priceNum: 1900000, badge: 'New', icon: '🔧', stock: true },
    { id: 9, brand: 'OZ Racing', name: 'OZ Leggera HLT', size: 'R17', pcd: '5x114.3', color: 'Crystal Titanium', price: 'Rp 7.800.000', priceNum: 7800000, badge: null, icon: '🏁', stock: true },
    { id: 10, brand: 'Rays', name: 'Volk Racing CE28N', size: 'R18', pcd: '5x114.3', color: 'Dash White', price: 'Rp 11.500.000', priceNum: 11500000, badge: 'Best Seller', icon: '⭐', stock: true },
    { id: 11, brand: 'Work', name: 'Work Emotion D9R', size: 'R17', pcd: '4x114.3', color: 'Black Polish', price: 'Rp 5.200.000', priceNum: 5200000, badge: null, icon: '🎯', stock: true },
    { id: 12, brand: 'BBS', name: 'BBS LM-R', size: 'R19', pcd: '5x112', color: 'Gold', price: 'Rp 18.000.000', priceNum: 18000000, badge: null, icon: '👑', stock: false },
];

// ─── DATA TESTIMONIAL ───
const TESTIMONIALS = [
    { name: 'Budi S.', city: 'Jakarta', velg: 'BBS RS-GT R18', rating: 5, comment: 'Pelayanannya top banget! Konsultasi ramah, pengiriman cepat, velg original pasti. Mobil jadi keliatan beda banget.' },
    { name: 'Andi P.', city: 'Surabaya', velg: 'Enkei RPF1 R17', rating: 5, comment: 'Udah langganan di sini dari 2021. Harga bersaing, velg dijamin asli. Recommended banget buat yang mau upgrade!' },
    { name: 'Reza M.', city: 'Bandung', velg: 'Volk Racing TE37 R17', rating: 5, comment: 'Tim VelgKing bantu banget soal fitment. Gak nyesel beli di sini, packagingnya juga aman banget.' },
    { name: 'Fandi K.', city: 'Medan', velg: 'OZ Ultraleggera R19', rating: 5, comment: 'Kirim ke Medan aman, tidak ada kerusakan sama sekali. Velg asli, garansi jelas. 10/10!' },
    { name: 'Hendra T.', city: 'Semarang', velg: 'HSR Wheel Barus R16', rating: 4, comment: 'Harga terjangkau untuk kualitas yang bagus. Anak muda yang baru mau modif pasti bisa afford.' },
    { name: 'Denny F.', city: 'Yogyakarta', velg: 'Enkei GTC01RR R18', rating: 5, comment: 'Velg sampai dalam kondisi sempurna. Konsultasi via WA responsif banget, gak lebih dari 5 menit langsung dibalas.' },
];
