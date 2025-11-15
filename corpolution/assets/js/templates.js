// ============================================
// TEMPLATES - Card Configuration Objects
// ============================================

/**
 * Template array yang mendefinisikan semua card
 * Setiap template memiliki:
 * - id: identifier unik untuk card
 * - title: judul yang ditampilkan
 * - icon: emoji icon untuk visual
 * - isMultiCopy: apakah memiliki multiple copy buttons
 * - copies: array dari copy templates (jika isMultiCopy true)
 * - hasInputs: apakah memiliki input fields
 * - inputs: array dari input configs (jika hasInputs true)
 * - template: function untuk generate output text
 */
const templates = [
  {
    id: 'login',
    title: 'Log in',
    icon: '📝',
    isMultiCopy: true,
    copies: [
      {
        label: '1',
        template: (name) => `${name} Log IN ✅`
      },
      {
        label: '2',
        template: (name) => `${name} Log IN 2✅`
      },
      {
        label: '3',
        template: (name) => `${name} Log IN 3✅`
      }
    ]
  },
  {
    id: 'tilawah',
    title: 'Tilawah',
    icon: '📖',
    isMultiCopy: true,
    copies: [
      {
        label: '🌅',
        template: (name) => `${name} Tilawah Pagi ✅`
      },
      {
        label: '☀️',
        template: (name) => `${name} Tilawah Siang ✅`
      },
      {
        label: '🌆',
        template: (name) => `${name} Tilawah Sore ✅`
      }
    ]
  },
  {
    id: 'bacabuku',
    title: 'Baca Buku',
    icon: '📚',
    isMultiCopy: false,
    hasInputs: true,
    inputs: [
      { id: 'bacabuku_waktu_mulai', label: 'Waktu Mulai', placeholder: 'Contoh: 05.00', cache: true },
      { id: 'bacabuku_waktu_selesai', label: 'Waktu Selesai', placeholder: 'Contoh: 05.05', cache: true },
      { id: 'bacabuku_judul', label: 'Judul Buku', placeholder: 'Contoh: Seni Berpikir Positif', cache: true },
      { id: 'bacabuku_halaman', label: 'Halaman Buku', placeholder: 'Contoh: 115', cache: true },
      { id: 'bacabuku_paragraf', label: 'Isi Paragraf', placeholder: 'Masukkan isi paragraf...', cache: true, isTextarea: true }
    ],
    template: (name, inputs) => {
      const waktuMulai = inputs.bacabuku_waktu_mulai || '';
      const waktuSelesai = inputs.bacabuku_waktu_selesai || '';
      const waktu = waktuMulai && waktuSelesai ? `${waktuMulai}-${waktuSelesai}` : '';
      const judul = inputs.bacabuku_judul || '';
      const halaman = inputs.bacabuku_halaman || '';
      const paragraf = inputs.bacabuku_paragraf || '';
      
      return `*${name}*
${formatTodayIndonesia()}
${waktu}
*${judul}*
Hal. ${halaman}

"${paragraf}"

*#tasnimgroup*
#buildinghappyliving
#readingculture`;
    }
  },
  {
    id: 'threegoals',
    title: '3 Goals & Result',
    icon: '🎯',
    isMultiCopy: true,
    hasInputs: true,
    copies: [
      {
        label: '🎯',
        template: (name, inputs) => {
          const goal1 = inputs.threegoals_goal1 || '';
          const goal2 = inputs.threegoals_goal2 || '';
          const goal3 = inputs.threegoals_goal3 || '';
          return `*3 Point Goals*
${name}

1. ${goal1}
2. ${goal2}
3. ${goal3}

#buildinghappyliving`;
        }
      },
      {
        label: '🥇',
        template: (name, inputs) => {
          const goal1 = inputs.threegoals_goal1 || '';
          const goal2 = inputs.threegoals_goal2 || '';
          const goal3 = inputs.threegoals_goal3 || '';
          return `*3 Point Results*
${name}

1. ${goal1} ✅
2. ${goal2} ✅
3. ${goal3} ✅

#buildinghappyliving`;
        }
      }
    ],
    inputs: [
      { id: 'threegoals_goal1', label: 'Goal/Result 1', placeholder: 'Masukkan goal pertama...', cache: true },
      { id: 'threegoals_goal2', label: 'Goal/Result 2', placeholder: 'Masukkan goal kedua...', cache: true },
      { id: 'threegoals_goal3', label: 'Goal/Result 3', placeholder: 'Masukkan goal ketiga...', cache: true }
    ]
  },
  {
    id: 'pausetime',
    title: 'Pause Time',
    icon: '⏸️',
    isMultiCopy: false,
    copies: [
      {
        label: 'Jeda',
        template: (name) => `${name} Pause Time ✅`
      }
    ]
  },
  {
    id: 'logout',
    title: 'Log OUT',
    icon: '🚪',
    isMultiCopy: false,
    copies: [
      {
        label: 'Keluar',
        template: (name) => `${name} Log OUT ✅`
      }
    ]
  },
  {
    id: 'valueterapan',
    title: 'ValueTerapan',
    icon: '🧠',
    isMultiCopy: false,
    hasInputs: true,
    inputs: [
      {
        id: 'valueterapan_value',
        label: 'Value',
        placeholder: 'Pilih value...',
        cache: true,
        isSelect: true,
        options: [
          'No. 01 Bahagia',
          'No. 02 Yakin',
          'No. 03 Syukur',
          'No. 04 Tenang',
          'No. 05 Sabar',
          'No. 06 Islami',
          'No. 07 Alami',
          'No. 08 Integritas',
          'No. 09 Profesional',
          'No. 10 Humble'
        ]
      },
      { id: 'valueterapan_makna', label: 'Isi Makna', placeholder: 'Maknanya...', cache: true, isTextarea: true },
      { id: 'valueterapan_terapan', label: 'Isi Terapan', placeholder: 'Terapannya...', cache: true, isTextarea: true }
    ],
    template: (name, inputs) => {
      const value = inputs.valueterapan_value || '';
      const makna = inputs.valueterapan_makna || '';
      const terapan = inputs.valueterapan_terapan || '';
      
      return `*Value ${value}*
${name}

*Makna*
${makna}

*Terapan*
${terapan}

#Buildinghappyliving`;
    }
  }
];
