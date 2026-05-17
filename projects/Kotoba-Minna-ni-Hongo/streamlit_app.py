import streamlit as st
import pandas as pd
import os

folder_path = 'Kotoba'

def load_data(bab):
    file_name = f'bab{bab}.xlsx'
    file_path = os.path.join(folder_path, file_name)
    if os.path.exists(file_path):
        return pd.read_excel(file_path)
    else:
        st.error(f"Data untuk Bab {bab} tidak ditemukan.")
        return pd.DataFrame()
st.write("_untuk pengalaman yang lebih baik gunakan fitur 'tampilan dekstop' di chrome, dan masuk ke setting (titik 3 pada pojok kanan, sebelah gambar kucing) lalu aktifkan 'wide mode' :)_")


st.title("Kotoba - Minna no Nihongo 1")
selected_bab = st.number_input('Pilih Bab', min_value=1, max_value=50, step=1, value=1)

df = load_data(selected_bab)

st.write("")
st.write("**TAMPILKAN:**")

# Opsi untuk menampilkan kolom
col1, col2, col3, col4, col5 = st.columns(5)
show_kata = col1.checkbox('Kata', value=True)
show_arti = col2.checkbox('Arti', value=True)
show_kanji = col3.checkbox('Kanji', value=False)
show_romaji = col4.checkbox('Romaji', value=False)
show_keterangan = col5.checkbox('Keterangan', value=False)

# Tentukan kolom yang akan ditampilkan
columns_to_show = []
if show_kata:
    columns_to_show.append('Kata')
if show_kanji:
    columns_to_show.append('Kanji')
if show_arti:
    columns_to_show.append('Arti')
if show_romaji:
    columns_to_show.append('Romaji')
if show_keterangan:
    columns_to_show.append('Keterangan')

# Tampilkan tabel sesuai dengan kolom yang dipilih
if not df.empty and columns_to_show:
    st.table(df[columns_to_show])
else:
    st.write("Tidak ada kolom yang dipilih untuk ditampilkan.")

st.write("- tentang")
st.write("_situs ini saya buat untuk membantu teman-teman yang sedang mempelajari kosakata bahasa jepang bersama saya, semoga bisa membantu :)_")
st.write("_Aruzan desu -_")
