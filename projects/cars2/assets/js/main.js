/* =====================================================
   AUTOPRIME – Main JS
   ===================================================== */

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Mobile dropdown toggle
document.querySelectorAll('.dropdown-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      e.preventDefault();
      btn.closest('.nav-dropdown').classList.toggle('open');
    }
  });
});

// Close nav on link click (mobile)
document.querySelectorAll('.nav-link:not(.dropdown-trigger)').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth <= 992) navLinks.classList.remove('open');
  });
});

// ===== HERO SLIDESHOW =====
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = index;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide((currentSlide + 1) % slides.length);
}

function startSlideshow() {
  slideInterval = setInterval(nextSlide, 4500);
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    clearInterval(slideInterval);
    goToSlide(i);
    startSlideshow();
  });
});

startSlideshow();

// ===== ACCORDION =====
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.accordion-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
    // Open clicked if wasn't open
    if (!isOpen) item.classList.add('open');
  });
});

// Open first accordion by default
const firstAccordion = document.querySelector('.accordion-item');
if (firstAccordion) firstAccordion.classList.add('open');

// Handle dropdown category clicks to scroll to accordion
document.querySelectorAll('.dd-item').forEach(item => {
  item.addEventListener('click', (e) => {
    const cat = item.dataset.cat;
    if (cat) {
      const target = document.querySelector(`.accordion-item[data-cat="${cat}"]`);
      if (target) {
        document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
        target.classList.add('open');
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  });
});

// ===== MODAL DATA =====
const carData = {
  camry: {
    brand: 'TOYOTA',
    name: 'Camry 2.5 V',
    img: 'https://images.unsplash.com/photo-1617469767783-1de9ecddb20e?w=800&auto=format&fit=crop',
    price: 'Rp 573.000.000',
    specs: [
      ['Mesin', '2.5L Dual VVT-i'],
      ['Transmisi', 'Automatic 8-Speed'],
      ['Tenaga', '178 HP / 5.700 rpm'],
      ['Torsi', '221 Nm / 3.600 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '6 Pilihan'],
    ],
    desc: 'Toyota Camry adalah sedan premium yang memadukan desain elegan dengan performa tinggi. Didukung mesin 2.5L Dual VVT-i yang bertenaga dan irit bahan bakar, Camry hadir untuk memenuhi kebutuhan Anda akan kendaraan premium yang nyaman dan terpercaya.'
  },
  accord: {
    brand: 'HONDA',
    name: 'Accord 1.5 Turbo',
    img: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop',
    price: 'Rp 698.000.000',
    specs: [
      ['Mesin', '1.5L VTEC Turbo'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '193 HP / 6.000 rpm'],
      ['Torsi', '243 Nm / 1.600 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Honda Accord generasi terbaru hadir dengan desain sporty dan kabine mewah. Mesin 1.5L VTEC Turbo memberikan performa responsif dengan konsumsi bahan bakar yang efisien.'
  },
  elantra: {
    brand: 'HYUNDAI',
    name: 'Elantra 1.6',
    img: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&auto=format&fit=crop',
    price: 'Rp 389.000.000',
    specs: [
      ['Mesin', '1.6L MPI'],
      ['Transmisi', 'DCT 7-Speed'],
      ['Tenaga', '123 HP / 6.300 rpm'],
      ['Torsi', '151 Nm / 4.800 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '7 Pilihan'],
    ],
    desc: 'Hyundai Elantra menawarkan desain parametrik futuristik yang berani. Kabin yang luas dan fitur keselamatan canggih menjadikan Elantra pilihan sedan modern yang terjangkau.'
  },
  rav4: {
    brand: 'TOYOTA',
    name: 'RAV4 2.0',
    img: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800&auto=format&fit=crop',
    price: 'Rp 498.000.000',
    specs: [
      ['Mesin', '2.0L Dual VVT-iE'],
      ['Transmisi', 'Automatic CVT'],
      ['Tenaga', '170 HP / 6.600 rpm'],
      ['Torsi', '204 Nm / 4.400 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Drivetrain', 'FWD / AWD'],
      ['Warna Tersedia', '6 Pilihan'],
    ],
    desc: 'Toyota RAV4 adalah SUV kompak yang menggabungkan gaya urban dengan kemampuan off-road yang handal. Tersedia dalam pilihan FWD dan AWD untuk berbagai kebutuhan.'
  },
  crv: {
    brand: 'HONDA',
    name: 'CR-V 1.5 Turbo',
    img: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop',
    price: 'Rp 539.000.000',
    specs: [
      ['Mesin', '1.5L VTEC Turbo'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '189 HP / 5.600 rpm'],
      ['Torsi', '240 Nm / 2.000 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Honda CR-V hadir dengan kabin yang sangat luas dan berbagai fitur canggih. Mesin turbocharged memberikan performa yang mumpuni sekaligus irit bahan bakar.'
  },
  outlander: {
    brand: 'MITSUBISHI',
    name: 'Outlander 2.4',
    img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop',
    price: 'Rp 575.000.000',
    specs: [
      ['Mesin', '2.4L MIVEC'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '167 HP / 6.000 rpm'],
      ['Torsi', '222 Nm / 4.200 rpm'],
      ['Kapasitas Penumpang', '7 Orang'],
      ['Drivetrain', 'FWD'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Mitsubishi Outlander merupakan SUV 7-seater yang tangguh dengan teknologi e-Assist terdepan. Pilihan tepat untuk keluarga yang aktif dan dinamis.'
  },
  tucson: {
    brand: 'HYUNDAI',
    name: 'Tucson 1.6 Turbo',
    img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
    price: 'Rp 529.000.000',
    specs: [
      ['Mesin', '1.6L T-GDi'],
      ['Transmisi', 'DCT 7-Speed'],
      ['Tenaga', '178 HP / 5.500 rpm'],
      ['Torsi', '265 Nm / 1.500 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '8 Pilihan'],
    ],
    desc: 'Hyundai Tucson dengan desain avant-garde dan teknologi canggih. Fitur ADAS lengkap menjadikan Tucson salah satu SUV paling aman di kelasnya.'
  },
  innova: {
    brand: 'TOYOTA',
    name: 'Innova Zenix 2.0',
    img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
    price: 'Rp 389.000.000',
    specs: [
      ['Mesin', '2.0L M20A-FKS'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '168 HP / 6.000 rpm'],
      ['Torsi', '204 Nm / 4.400 rpm'],
      ['Kapasitas Penumpang', '7 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '6 Pilihan'],
    ],
    desc: 'Toyota Innova Zenix generasi terbaru hadir dengan platform TNGA-C yang modern. Nyaman, lega, dan sangat cocok untuk perjalanan keluarga jarak jauh.'
  },
  brv: {
    brand: 'HONDA',
    name: 'BR-V 1.5',
    img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop',
    price: 'Rp 299.000.000',
    specs: [
      ['Mesin', '1.5L i-VTEC'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '121 HP / 6.600 rpm'],
      ['Torsi', '145 Nm / 4.600 rpm'],
      ['Kapasitas Penumpang', '7 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Honda BR-V adalah MPV terjangkau dengan 7 tempat duduk yang nyaman. Desain segar dan fitur lengkap menjadikannya pilihan keluarga muda yang tepat.'
  },
  ertiga: {
    brand: 'SUZUKI',
    name: 'Ertiga Hybrid',
    img: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&auto=format&fit=crop',
    price: 'Rp 249.000.000',
    specs: [
      ['Mesin', '1.5L K15C + Motor Listrik'],
      ['Transmisi', 'AT 4-Speed'],
      ['Tenaga', '103 HP + 3.1 HP'],
      ['Torsi', '138 Nm'],
      ['Kapasitas Penumpang', '7 Orang'],
      ['Teknologi', 'Mild Hybrid'],
      ['Warna Tersedia', '7 Pilihan'],
    ],
    desc: 'Suzuki Ertiga Hybrid memadukan teknologi mild hybrid yang hemat bahan bakar dengan kabin lapang 7 penumpang. Solusi MPV terbaik untuk anggaran yang bijak.'
  },
  yaris: {
    brand: 'TOYOTA',
    name: 'Yaris GR Sport',
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop',
    price: 'Rp 289.000.000',
    specs: [
      ['Mesin', '1.5L Dual VVT-i'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '107 HP / 6.000 rpm'],
      ['Torsi', '140 Nm / 4.200 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Bahan Bakar', 'Bensin'],
      ['Warna Tersedia', '6 Pilihan'],
    ],
    desc: 'Toyota Yaris GR Sport hadir dengan tampilan sporty yang agresif dan fitur lengkap. Lincah di perkotaan namun tetap nyaman untuk perjalanan jauh.'
  },
  jazz: {
    brand: 'HONDA',
    name: 'Jazz RS 1.5',
    img: 'https://images.unsplash.com/photo-1576220258822-cf53c34e28be?w=800&auto=format&fit=crop',
    price: 'Rp 279.000.000',
    specs: [
      ['Mesin', '1.5L i-VTEC'],
      ['Transmisi', 'CVT'],
      ['Tenaga', '118 HP / 6.600 rpm'],
      ['Torsi', '145 Nm / 4.600 rpm'],
      ['Kapasitas Penumpang', '5 Orang'],
      ['Fitur Unggulan', 'Magic Seat'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Honda Jazz RS merupakan hatchback premium dengan magic seat yang fleksibel. Interior cerdas dan mesin bertenaga menjadikan Jazz pilihan urban yang sempurna.'
  },
  triton: {
    brand: 'MITSUBISHI',
    name: 'Triton 4x4 AT',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    price: 'Rp 399.000.000',
    specs: [
      ['Mesin', '2.4L MIVEC Diesel'],
      ['Transmisi', 'Automatic 6-Speed'],
      ['Tenaga', '181 HP / 3.500 rpm'],
      ['Torsi', '430 Nm / 2.500 rpm'],
      ['Drivetrain', '4WD'],
      ['Bahan Bakar', 'Diesel'],
      ['Warna Tersedia', '4 Pilihan'],
    ],
    desc: 'Mitsubishi Triton adalah pickup tangguh dengan kapabilitas 4WD yang handal. Ideal untuk keperluan bisnis maupun petualangan off-road yang menantang.'
  },
  navara: {
    brand: 'NISSAN',
    name: 'Navara Pro-4X',
    img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
    price: 'Rp 449.000.000',
    specs: [
      ['Mesin', '2.5L YD25 Diesel'],
      ['Transmisi', 'Automatic 7-Speed'],
      ['Tenaga', '190 HP / 3.600 rpm'],
      ['Torsi', '450 Nm / 2.000 rpm'],
      ['Drivetrain', '4WD'],
      ['Bahan Bakar', 'Diesel'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Nissan Navara Pro-4X dirancang untuk pekerjaan berat dan petualangan ekstrem. Suspensi belakang Coil-spring memberikan kenyamanan berkendara yang luar biasa.'
  },
  ioniq6: {
    brand: 'HYUNDAI',
    name: 'IONIQ 6',
    img: 'https://images.unsplash.com/photo-1651231523755-b5a6e6a3e1e2?w=800&auto=format&fit=crop',
    price: 'Rp 749.000.000',
    specs: [
      ['Motor', 'Rear-Wheel Drive'],
      ['Daya Baterai', '77.4 kWh'],
      ['Jangkauan', '614 km (WLTP)'],
      ['Tenaga', '225 HP'],
      ['Torsi', '350 Nm'],
      ['Pengisian Cepat', '18 menit (10–80%)'],
      ['Warna Tersedia', '7 Pilihan'],
    ],
    desc: 'Hyundai IONIQ 6 adalah sedan listrik dengan aerodinamika kelas dunia dan range terpanjang di kelasnya. Pengalaman berkendara masa depan yang kini tersedia.'
  },
  airev: {
    brand: 'WULING',
    name: 'Air EV Long Range',
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop',
    price: 'Rp 299.000.000',
    specs: [
      ['Motor', 'Front-Wheel Drive'],
      ['Daya Baterai', '26.7 kWh'],
      ['Jangkauan', '460 km (CLTC)'],
      ['Tenaga', '50 HP'],
      ['Torsi', '150 Nm'],
      ['Pengisian Cepat', 'Fast Charging DC'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Wuling Air EV Long Range adalah kendaraan listrik yang ekonomis dan modern. Solusi mobilitas ramah lingkungan dengan harga terjangkau untuk kehidupan perkotaan.'
  },
  leaf: {
    brand: 'NISSAN',
    name: 'Leaf 40 kWh',
    img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
    price: 'Rp 599.000.000',
    specs: [
      ['Motor', 'Front-Wheel Drive'],
      ['Daya Baterai', '40 kWh'],
      ['Jangkauan', '385 km (WLTP)'],
      ['Tenaga', '147 HP'],
      ['Torsi', '320 Nm'],
      ['Teknologi', 'e-Pedal'],
      ['Warna Tersedia', '5 Pilihan'],
    ],
    desc: 'Nissan Leaf adalah pelopor kendaraan listrik dunia yang kini semakin canggih. Teknologi e-Pedal revolusioner memungkinkan Anda berkendara dan berhenti hanya dengan satu pedal.'
  },
};

// ===== OPEN MODAL =====
function openModal(carId) {
  const car = carData[carId];
  if (!car) return;

  const specsHTML = car.specs.map(([key, val]) => `
    <div class="modal-spec-row">
      <span>${key}</span>
      <span>${val}</span>
    </div>
  `).join('');

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-gallery">
      <img src="${car.img}" alt="${car.name}" />
    </div>
    <div class="modal-info-grid">
      <div>
        <div class="modal-brand">${car.brand}</div>
        <h2 class="modal-name">${car.name}</h2>
        ${specsHTML}
      </div>
      <div>
        <div class="modal-price-box">
          <div class="modal-price-label">Harga OTR Jakarta</div>
          <div class="modal-price-val">${car.price}</div>
        </div>
        <div class="modal-btns">
          <a href="https://wa.me/6281234567890?text=Halo, saya tertarik dengan ${encodeURIComponent(car.brand + ' ' + car.name)}" 
             target="_blank" class="btn btn-primary">💬 Konsultasi WA</a>
          <a href="https://wa.me/6281234567890?text=Saya ingin booking test drive ${encodeURIComponent(car.brand + ' ' + car.name)}" 
             target="_blank" class="btn btn-detail" style="background:transparent;border-color:var(--dark);color:var(--dark);">🚗 Booking Test Drive</a>
        </div>
      </div>
    </div>
    <div class="modal-desc">${car.desc}</div>
  `;

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== LIGHTBOX =====
function openLightbox(el) {
  const img = el.querySelector('img');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightboxImg').alt = img.alt;
  document.getElementById('lightboxOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== FORM SUBMIT =====
function submitForm(e) {
  e.preventDefault();
  showToast();
  e.target.reset();
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== CLOSE ON ESC =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeLightbox();
  }
});

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== ANIMATE ON SCROLL =====
const observerOpts = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOpts);

// Apply to cards
document.querySelectorAll('.car-card, .testi-card, .stat-card, .branch-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.4s linear, transform 0.4s linear';
  observer.observe(el);
});
