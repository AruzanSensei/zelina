const Storage = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getObj(key, def = {}) {
    try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
  },
  seed() {
    if (!localStorage.getItem('seeded')) {
      const students = [
        { id: 's1', name: 'Andi Pratama', nis: '2024001', class: 'X-A' },
        { id: 's2', name: 'Budi Santoso', nis: '2024002', class: 'X-A' },
        { id: 's3', name: 'Citra Dewi', nis: '2024003', class: 'X-B' },
        { id: 's4', name: 'Dian Rahayu', nis: '2024004', class: 'X-B' },
        { id: 's5', name: 'Eko Wijaya', nis: '2024005', class: 'XI-A' },
        { id: 's6', name: 'Fani Kusuma', nis: '2024006', class: 'XI-A' },
        { id: 's7', name: 'Gilang Nugraha', nis: '2024007', class: 'XI-B' },
        { id: 's8', name: 'Hana Pertiwi', nis: '2024008', class: 'XI-B' },
      ];
      const exams = [
        { id: 'e1', title: 'Matematika Dasar', subject: 'Matematika', date: '2025-01-20', duration: 60, status: 'active', class: 'X-A' },
        { id: 'e2', title: 'Bahasa Indonesia', subject: 'B. Indonesia', date: '2025-01-22', duration: 90, status: 'active', class: 'X-B' },
        { id: 'e3', title: 'IPA Terpadu', subject: 'IPA', date: '2025-01-25', duration: 75, status: 'draft', class: 'XI-A' },
      ];
      const questions = [
        { id: 'q1', examId: 'e1', question: 'Berapakah hasil dari 15 × 8?', options: ['100', '115', '120', '125'], correctAnswer: 2 },
        { id: 'q2', examId: 'e1', question: 'Akar kuadrat dari 144 adalah?', options: ['10', '11', '12', '13'], correctAnswer: 2 },
        { id: 'q3', examId: 'e1', question: 'Jika x + 7 = 15, maka x = ?', options: ['6', '7', '8', '9'], correctAnswer: 2 },
        { id: 'q4', examId: 'e1', question: 'Nilai dari 2³ + 3² adalah?', options: ['15', '17', '19', '21'], correctAnswer: 1 },
        { id: 'q5', examId: 'e1', question: 'Keliling persegi dengan sisi 7 cm adalah?', options: ['21 cm', '28 cm', '35 cm', '49 cm'], correctAnswer: 1 },
        { id: 'q6', examId: 'e2', question: 'Imbuhan "me-" pada kata "menulis" berfungsi sebagai?', options: ['Awalan transitif', 'Awalan intransitif', 'Akhiran', 'Sisipan'], correctAnswer: 0 },
        { id: 'q7', examId: 'e2', question: 'Kalimat yang menggunakan majas personifikasi adalah?', options: ['Dia secepat kilat berlari', 'Angin berbisik lembut di telingaku', 'Mukanya seperti bulan', 'Suaranya merdu'], correctAnswer: 1 },
        { id: 'q8', examId: 'e2', question: 'Sinonim kata "cepat" adalah?', options: ['Lambat', 'Pelan', 'Kilat', 'Santai'], correctAnswer: 2 },
      ];
      this.set('students', students);
      this.set('exams', exams);
      this.set('questions', questions);
      this.set('scores', []);
      localStorage.setItem('seeded', '1');
    }
  }
};
