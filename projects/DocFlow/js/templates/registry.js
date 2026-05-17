/**
 * Template Registry — Defines all available document templates
 * To add a new template: create an HTML file in /templates/ and add the config here.
 */

export const TEMPLATES = [
    {
        id: 'invoice',
        name: 'Invoice',
        htmlFile: 'templates/invoice.html',
        defaultFileName: 'Invoice-{{judul}}-{{YYYY}}{{MM}}{{DD}}',
        extraFields: [
            { id: 'kepada', label: 'Kepada', type: 'text', placeholder: 'PT. Saraswanti Indo Genetech' },
            { id: 'tanggal', label: 'Tanggal', type: 'date' }
        ],
        tableColumns: [
            { id: 'name', label: 'Nama Barang', type: 'text' },
            { id: 'qty', label: 'Qty', type: 'number', suffix: 'pcs' },
            { id: 'price', label: 'Harga Satuan', type: 'currency' },
            { id: 'note', label: 'Keterangan', type: 'text', optional: true }
        ],
        hasPriceTotal: true,
        exportGroup: ['invoice', 'surat_jalan']
    },
    {
        id: 'surat_jalan',
        name: 'Surat Jalan',
        htmlFile: 'templates/surat-jalan.html',
        defaultFileName: 'SJ-{{judul}}-{{YYYY}}{{MM}}{{DD}}',
        extraFields: [
            { id: 'kepada', label: 'Kepada Yth.', type: 'text', placeholder: 'PT. Saraswanti Indo Genetech' },
            { id: 'alamat_1', label: 'Alamat Baris 1', type: 'text', placeholder: 'Jl. Rasamala No. 20' },
            { id: 'alamat_2', label: 'Alamat Baris 2', type: 'text', placeholder: 'RT.02/RW.03, Curugmekar', optional: true },
            { id: 'alamat_3', label: 'Alamat Baris 3', type: 'text', placeholder: 'Kec. Bogor Barat', optional: true },
            { id: 'alamat_4', label: 'Alamat Baris 4', type: 'text', placeholder: 'Kota Bogor 16113', optional: true },
            { id: 'tanggal', label: 'Tanggal', type: 'date' }
        ],
        tableColumns: [
            { id: 'name', label: 'Nama Barang', type: 'text' },
            { id: 'qty', label: 'Jumlah', type: 'number', suffix: 'pcs' },
            { id: 'note', label: 'Keterangan', type: 'text' }
        ],
        hasPriceTotal: false,
        exportGroup: ['surat_jalan']
    }
];

/**
 * Get a template config by its ID
 */
export function getTemplate(id) {
    return TEMPLATES.find(t => t.id === id) || null;
}

/**
 * Get all templates
 */
export function getAllTemplates() {
    return TEMPLATES;
}
