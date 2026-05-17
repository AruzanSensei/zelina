// storage.js — localStorage abstraction

const Storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch { return []; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getObj(key, fallback = {}) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  setObj(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  seed() {
    if (!localStorage.getItem('seeded')) {
      this.set('students', [
        { id: 's1', name: 'Andi Pratama', kelas: 'X-A', nis: '2024001' },
        { id: 's2', name: 'Budi Santoso', kelas: 'X-A', nis: '2024002' },
        { id: 's3', name: 'Citra Dewi', kelas: 'X-B', nis: '2024003' },
        { id: 's4', name: 'Dina Rahayu', kelas: 'X-B', nis: '2024004' },
        { id: 's5', name: 'Eko Wahyudi', kelas: 'XI-A', nis: '2024005' },
        { id: 's6', name: 'Fitri Handayani', kelas: 'XI-A', nis: '2024006' },
        { id: 's7', name: 'Gilang Ramadan', kelas: 'XI-B', nis: '2024007' },
        { id: 's8', name: 'Hana Pertiwi', kelas: 'XI-B', nis: '2024008' },
      ]);
      this.set('exams', [
        { id: 'e1', title: 'Matematika Dasar', date: '2025-04-20', duration: 60, status: 'active', subject: 'Matematika' },
        { id: 'e2', title: 'Bahasa Indonesia', date: '2025-04-22', duration: 45, status: 'active', subject: 'Bahasa' },
        { id: 'e3', title: 'IPA Terpadu', date: '2025-04-18', duration: 90, status: 'draft', subject: 'Sains' },
      ]);
      this.set('questions', [
        { id: 'q1', examId: 'e1', question: 'Berapakah hasil dari 15 × 8?', options: ['100','110','120','130'], correctAnswer: 2 },
        { id: 'q2', examId: 'e1', question: 'Manakah yang merupakan bilangan prima?', options: ['9','15','17','21'], correctAnswer: 2 },
        { id: 'q3', examId: 'e1', question: 'Hasil dari √144 adalah...', options: ['10','11','12','13'], correctAnswer: 2 },
        { id: 'q4', examId: 'e1', question: '2³ + 3² = ?', options: ['15','17','19','21'], correctAnswer: 1 },
        { id: 'q5', examId: 'e2', question: 'Apa yang dimaksud dengan kata baku?', options: ['Kata tidak resmi','Kata sesuai KBBI','Kata daerah','Kata serapan'], correctAnswer: 1 },
        { id: 'q6', examId: 'e2', question: 'Penulisan yang benar adalah...', options: ['Di rumah','Dirumah','di-rumah','Di-rumah'], correctAnswer: 0 },
        { id: 'q7', examId: 'e2', question: 'Sinonim kata "bijaksana" adalah...', options: ['Ceroboh','Arif','Nakal','Malas'], correctAnswer: 1 },
      ]);
      this.set('scores', [
        { id: 'sc1', examId: 'e2', studentName: 'Andi Pratama', score: 85, date: '2025-04-10', answers: [0,0,1] },
        { id: 'sc2', examId: 'e2', studentName: 'Citra Dewi', score: 100, date: '2025-04-10', answers: [0,0,1] },
      ]);
      this.set('attendance', []);
      localStorage.setItem('seeded', '1');
    }
  }
};
