/* ============================================
   DATA.JS — Mock Data Store
   ============================================ */

const AppData = {
  // Current logged-in user
  currentUser: null,

  // ---- Users ----
  users: [
    { id: 1, name: 'Pak Ahmad Fauzi', email: 'ahmad.fauzi@sekolah.id', role: 'teacher', avatar: 'AF' },
    { id: 2, name: 'Bu Siti Rahayu', email: 'siti.rahayu@sekolah.id', role: 'teacher', avatar: 'SR' },
    { id: 3, name: 'Budi Santoso', email: 'budi.santoso@siswa.id', role: 'student', avatar: 'BS', nis: '2024001', class: '10A' },
    { id: 4, name: 'Rina Permata', email: 'rina.permata@siswa.id', role: 'student', avatar: 'RP', nis: '2024002', class: '10A' },
    { id: 5, name: 'Andi Wijaya', email: 'andi.wijaya@siswa.id', role: 'student', avatar: 'AW', nis: '2024003', class: '10B' },
    { id: 6, name: 'Dewi Anggraeni', email: 'dewi.a@siswa.id', role: 'student', avatar: 'DA', nis: '2024004', class: '10B' },
    { id: 7, name: 'Fahri Rahman', email: 'fahri.r@siswa.id', role: 'student', avatar: 'FR', nis: '2024005', class: '10A' },
    { id: 8, name: 'Lestari Putri', email: 'lestari.p@siswa.id', role: 'student', avatar: 'LP', nis: '2024006', class: '11A' },
    { id: 9, name: 'Muhammad Rizky', email: 'rizky.m@siswa.id', role: 'student', avatar: 'MR', nis: '2024007', class: '11A' },
    { id: 10, name: 'Nadia Kusuma', email: 'nadia.k@siswa.id', role: 'student', avatar: 'NK', nis: '2024008', class: '11B' },
    { id: 11, name: 'Oscar Pratama', email: 'oscar.p@siswa.id', role: 'student', avatar: 'OP', nis: '2024009', class: '11B' },
    { id: 12, name: 'Putri Handayani', email: 'putri.h@siswa.id', role: 'student', avatar: 'PH', nis: '2024010', class: '12A' },
    { id: 13, name: 'Reza Firmansyah', email: 'reza.f@siswa.id', role: 'student', avatar: 'RF', nis: '2024011', class: '12A' },
    { id: 14, name: 'Sinta Maharani', email: 'sinta.m@siswa.id', role: 'student', avatar: 'SM', nis: '2024012', class: '12A' },
  ],

  // ---- Students shortcut ----
  getStudents() {
    return this.users.filter(u => u.role === 'student');
  },

  getClasses() {
    const students = this.getStudents();
    return [...new Set(students.map(s => s.class))].sort();
  },

  // ---- Exams ----
  exams: [
    { id: 1, title: 'UTS Matematika', subject: 'Matematika', date: '2026-03-15', duration: 90, status: 'published', class: '10A', teacherId: 1 },
    { id: 2, title: 'UTS Bahasa Indonesia', subject: 'Bahasa Indonesia', date: '2026-03-17', duration: 60, status: 'active', class: '10A', teacherId: 1 },
    { id: 3, title: 'UTS Fisika', subject: 'Fisika', date: '2026-03-20', duration: 90, status: 'draft', class: '10B', teacherId: 2 },
    { id: 4, title: 'UAS Biologi', subject: 'Biologi', date: '2026-03-22', duration: 120, status: 'finished', class: '11A', teacherId: 2 },
    { id: 5, title: 'Ulangan Harian Kimia', subject: 'Kimia', date: '2026-03-10', duration: 45, status: 'finished', class: '11B', teacherId: 1 },
    { id: 6, title: 'UTS Sejarah', subject: 'Sejarah', date: '2026-03-25', duration: 60, status: 'published', class: '12A', teacherId: 2 },
  ],

  nextExamId: 7,

  // ---- Questions ----
  questions: [
    { id: 1, examId: 1, questionText: 'Berapakah hasil dari 15 × 8?', optionA: '100', optionB: '110', optionC: '120', optionD: '130', correctAnswer: 'C', type: 'multiple_choice' },
    { id: 2, examId: 1, questionText: 'Jika x + 5 = 12, maka nilai x adalah...', optionA: '5', optionB: '6', optionC: '7', optionD: '8', correctAnswer: 'C', type: 'multiple_choice' },
    { id: 3, examId: 1, questionText: 'Luas persegi panjang dengan panjang 10cm dan lebar 5cm adalah...', optionA: '30 cm²', optionB: '40 cm²', optionC: '50 cm²', optionD: '60 cm²', correctAnswer: 'C', type: 'multiple_choice' },
    { id: 4, examId: 1, questionText: 'Nilai dari √144 adalah...', optionA: '10', optionB: '11', optionC: '12', optionD: '13', correctAnswer: 'C', type: 'multiple_choice' },
    { id: 5, examId: 1, questionText: 'Bentuk sederhana dari 2x + 3x - x adalah...', optionA: '3x', optionB: '4x', optionC: '5x', optionD: '6x', correctAnswer: 'B', type: 'multiple_choice' },
    { id: 6, examId: 2, questionText: 'Kata baku dari "aktifitas" adalah...', optionA: 'Aktifitas', optionB: 'Aktivitas', optionC: 'Aktipitas', optionD: 'Aktiivitas', correctAnswer: 'B', type: 'multiple_choice' },
    { id: 7, examId: 2, questionText: 'Sinonim dari kata "gigih" adalah...', optionA: 'Malas', optionB: 'Tekun', optionC: 'Lambat', optionD: 'Ceroboh', correctAnswer: 'B', type: 'multiple_choice' },
    { id: 8, examId: 2, questionText: 'Paragraf yang kalimat utamanya berada di awal disebut paragraf...', optionA: 'Induktif', optionB: 'Campuran', optionC: 'Deduktif', optionD: 'Naratif', correctAnswer: 'C', type: 'multiple_choice' },
    { id: 9, examId: 5, questionText: 'Rumus kimia air adalah...', optionA: 'H2O', optionB: 'CO2', optionC: 'NaCl', optionD: 'O2', correctAnswer: 'A', type: 'multiple_choice' },
    { id: 10, examId: 5, questionText: 'Atom terkecil penyusun materi disebut...', optionA: 'Molekul', optionB: 'Senyawa', optionC: 'Atom', optionD: 'Ion', correctAnswer: 'C', type: 'multiple_choice' },
  ],

  nextQuestionId: 11,

  // ---- Scores ----
  scores: [
    { id: 1, studentId: 3, examId: 5, score: 85 },
    { id: 2, studentId: 4, examId: 5, score: 92 },
    { id: 3, studentId: 3, examId: 4, score: 78 },
    { id: 4, studentId: 5, examId: 5, score: 70 },
    { id: 5, studentId: 6, examId: 5, score: 88 },
    { id: 6, studentId: 7, examId: 4, score: 95 },
    { id: 7, studentId: 8, examId: 4, score: 82 },
    { id: 8, studentId: 9, examId: 4, score: 75 },
    { id: 9, studentId: 10, examId: 5, score: 90 },
    { id: 10, studentId: 11, examId: 5, score: 65 },
    { id: 11, studentId: 12, examId: 4, score: 88 },
    { id: 12, studentId: 13, examId: 4, score: 72 },
    { id: 13, studentId: 14, examId: 4, score: 91 },
  ],

  nextScoreId: 14,

  // ---- Answers (for student portal) ----
  answers: [],
  nextAnswerId: 1,

  // ---- Attendance ----
  attendance: [
    { id: 1, studentId: 3, examId: 5, status: 'hadir' },
    { id: 2, studentId: 4, examId: 5, status: 'hadir' },
    { id: 3, studentId: 5, examId: 5, status: 'hadir' },
    { id: 4, studentId: 6, examId: 5, status: 'izin' },
    { id: 5, studentId: 7, examId: 4, status: 'hadir' },
    { id: 6, studentId: 8, examId: 4, status: 'hadir' },
    { id: 7, studentId: 9, examId: 4, status: 'tidak hadir' },
    { id: 8, studentId: 10, examId: 5, status: 'hadir' },
    { id: 9, studentId: 11, examId: 5, status: 'hadir' },
    { id: 10, studentId: 12, examId: 4, status: 'hadir' },
    { id: 11, studentId: 13, examId: 4, status: 'izin' },
    { id: 12, studentId: 14, examId: 4, status: 'hadir' },
  ],

  nextAttendanceId: 13,

  // ---- Recent Activity ----
  activities: [
    { text: '<strong>Pak Ahmad</strong> membuat ujian UTS Matematika', time: '5 menit lalu', type: 'blue' },
    { text: '<strong>Budi Santoso</strong> menyelesaikan ujian Kimia', time: '15 menit lalu', type: 'green' },
    { text: '<strong>Rina Permata</strong> mendapat nilai <strong>92</strong>', time: '1 jam lalu', type: 'green' },
    { text: 'Ujian <strong>UTS Bahasa Indonesia</strong> sedang berlangsung', time: '2 jam lalu', type: 'orange' },
    { text: '<strong>Bu Siti</strong> menambahkan 5 soal baru', time: '3 jam lalu', type: 'blue' },
    { text: '<strong>Andi Wijaya</strong> tidak hadir ujian Biologi', time: '1 hari lalu', type: 'red' },
  ],
};
