#!/usr/bin/env python3
"""
ElevenLabs + AI Text-to-Speech CLI
Aplikasi CLI untuk menghasilkan audio menggunakan ElevenLabs TTS dengan opsi AI
"""

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os
from datetime import datetime
from google import genai
import subprocess
import platform
import sys

# Load environment variables
load_dotenv()

# ==================== KONFIGURASI ====================

# Daftar API Keys yang tersedia
AVAILABLE_API_KEYS = {
    "1": ("ELEVENLABS_API_KEY_ZS", "ZS Account"),
    "2": ("ELEVENLABS_API_KEY_A12", "A12 Account"),
    "3": ("ELEVENLABS_API_KEY_AJ", "AJ Account"),
    "4": ("ELEVENLABS_API_KEY_NVL", "NVL Account"),
}

# Voice IDs yang tersedia
AVAILABLE_VOICES = {
    "1": ("TX3LPaxmHKxFdv7VOQHJ", "Default Voice"),
    # Tambahkan voice lain di sini jika diperlukan
}

# Model IDs yang tersedia
AVAILABLE_MODELS = {
    "1": ("eleven_v3", "Eleven V3 (Kualitas Tinggi)"),
    "2": ("eleven_turbo_2_5v", "Eleven Turbo 2.5 (Cepat)"),
}

# ==================== FUNGSI UTILITAS ====================

def clear_screen():
    """Membersihkan layar terminal"""
    os.system('cls' if platform.system() == 'Windows' else 'clear')

def print_header(title):
    """Menampilkan header dengan format yang rapi"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60 + "\n")

def print_menu(options):
    """Menampilkan menu dengan format yang rapi"""
    for key, value in options.items():
        print(f"  [{key}] {value}")
    print()

def get_user_choice(prompt, valid_choices):
    """Mendapatkan pilihan user dengan validasi"""
    while True:
        choice = input(f"{prompt}: ").strip()
        if choice in valid_choices:
            return choice
        print(f"❌ Pilihan tidak valid! Silakan pilih dari: {', '.join(valid_choices)}\n")

def confirm_action(message):
    """Meminta konfirmasi dari user"""
    response = input(f"{message} (y/n): ").strip().lower()
    return response in ['y', 'yes', 'ya']

# ==================== FUNGSI API KEY ====================

def select_api_key():
    """Memilih API key yang akan digunakan"""
    print_header("PILIH API KEY")
    
    # Tampilkan API keys yang tersedia
    for key, (env_var, name) in AVAILABLE_API_KEYS.items():
        api_key = os.getenv(env_var)
        status = "✓ Tersedia" if api_key else "✗ Tidak ditemukan"
        print(f"  [{key}] {name} - {status}")
    print()
    
    choice = get_user_choice("Pilih API Key", AVAILABLE_API_KEYS.keys())
    env_var, name = AVAILABLE_API_KEYS[choice]
    api_key = os.getenv(env_var)
    
    if not api_key:
        print(f"\n❌ API Key '{env_var}' tidak ditemukan di file .env!")
        return None
    
    print(f"\n✓ Menggunakan API Key: {name}")
    return api_key

# ==================== FUNGSI TEXT-TO-SPEECH ====================

def generate_audio(text, api_key, voice_id="TX3LPaxmHKxFdv7VOQHJ", model_id="eleven_v3"):
    """Menghasilkan audio dari teks menggunakan ElevenLabs"""
    try:
        print("\n🔄 Menghasilkan audio...")
        
        # Inisialisasi ElevenLabs client
        elevenlabs = ElevenLabs(api_key=api_key)
        
        # Konversi teks ke audio
        audio = elevenlabs.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id=model_id,
            output_format="mp3_44100_128",
        )
        
        # Simpan ke file
        filename = f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
        with open(filename, "wb") as f:
            for chunk in audio:
                f.write(chunk)
        
        print(f"✓ Audio berhasil disimpan: {filename}")
        return filename
        
    except Exception as e:
        print(f"\n❌ Error saat menghasilkan audio: {str(e)}")
        return None

def open_audio_file(filename):
    """Membuka file audio dengan aplikasi default"""
    try:
        if platform.system() == "Windows":
            os.startfile(filename)
        elif platform.system() == "Darwin":
            subprocess.run(["open", filename])
        else:
            subprocess.run(["xdg-open", filename])
        print(f"✓ Membuka file: {filename}")
    except Exception as e:
        print(f"❌ Error saat membuka file: {str(e)}")

# ==================== FUNGSI AI ====================

def generate_text_with_ai(prompt):
    """Menghasilkan teks menggunakan Google Gemini AI"""
    try:
        print("\n🤖 Menghasilkan teks dengan AI...")
        
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        
        print(f"\n{'─' * 60}")
        print("AI Generated Text:")
        print(f"{'─' * 60}")
        print(response.text)
        print(f"{'─' * 60}\n")
        
        return response.text
        
    except Exception as e:
        print(f"\n❌ Error saat menghasilkan teks dengan AI: {str(e)}")
        return None

# ==================== MODE OPERASI ====================

def mode_direct_tts(api_key):
    """Mode: Langsung convert teks ke audio"""
    print_header("MODE: TEXT-TO-SPEECH LANGSUNG")
    
    # Input teks
    print("Masukkan teks yang ingin dikonversi ke audio:")
    print("(Tekan Enter 2x untuk selesai)\n")
    
    lines = []
    while True:
        line = input()
        if line == "" and len(lines) > 0:
            break
        lines.append(line)
    
    text = "\n".join(lines)
    
    if not text.strip():
        print("❌ Teks tidak boleh kosong!")
        return
    
    # Pilih voice (opsional, bisa dikembangkan)
    voice_id = "TX3LPaxmHKxFdv7VOQHJ"
    
    # Pilih model
    print_header("PILIH MODEL")
    print_menu({k: v[1] for k, v in AVAILABLE_MODELS.items()})
    model_choice = get_user_choice("Pilih Model", AVAILABLE_MODELS.keys())
    model_id = AVAILABLE_MODELS[model_choice][0]
    
    # Generate audio
    filename = generate_audio(text, api_key, voice_id, model_id)
    
    if filename:
        # Tanya apakah ingin membuka file
        if confirm_action("\n🔊 Buka file audio sekarang?"):
            open_audio_file(filename)

def mode_ai_tts(api_key):
    """Mode: Generate teks dengan AI, lalu convert ke audio"""
    print_header("MODE: AI + TEXT-TO-SPEECH")
    
    # Input prompt untuk AI
    print("Masukkan prompt untuk AI (Gemini-3):")
    prompt = input("> ").strip()
    
    if not prompt:
        print("❌ Prompt tidak boleh kosong!")
        return
    
    # Generate teks dengan AI
    ai_text = generate_text_with_ai(prompt)
    
    if not ai_text:
        return
    
    # Konfirmasi untuk melanjutkan ke TTS
    if not confirm_action("Lanjutkan konversi ke audio?"):
        print("❌ Dibatalkan.")
        return
    
    # Pilih model
    print_header("PILIH MODEL")
    print_menu({k: v[1] for k, v in AVAILABLE_MODELS.items()})
    model_choice = get_user_choice("Pilih Model", AVAILABLE_MODELS.keys())
    model_id = AVAILABLE_MODELS[model_choice][0]
    
    # Generate audio
    voice_id = "TX3LPaxmHKxFdv7VOQHJ"
    filename = generate_audio(ai_text, api_key, voice_id, model_id)
    
    if filename:
        # Tanya apakah ingin membuka file
        if confirm_action("\n🔊 Buka file audio sekarang?"):
            open_audio_file(filename)

def mode_change_api():
    """Mode: Ganti API Key"""
    api_key = select_api_key()
    if api_key:
        return api_key
    return None

# ==================== MAIN MENU ====================

def main_menu():
    """Menu utama aplikasi"""
    # Pilih API key di awal
    api_key = select_api_key()
    
    if not api_key:
        print("\n❌ Tidak dapat melanjutkan tanpa API Key yang valid!")
        return
    
    while True:
        clear_screen()
        print_header("ELEVENLABS + AI TEXT-TO-SPEECH")
        
        menu_options = {
            "1": "📝 Text-to-Speech Langsung",
            "2": "🤖 AI + Text-to-Speech",
            "3": "🔑 Ganti API Key",
            "4": "❌ Keluar"
        }
        
        print_menu(menu_options)
        choice = get_user_choice("Pilih menu", menu_options.keys())
        
        if choice == "1":
            mode_direct_tts(api_key)
            input("\nTekan Enter untuk kembali ke menu...")
            
        elif choice == "2":
            mode_ai_tts(api_key)
            input("\nTekan Enter untuk kembali ke menu...")
            
        elif choice == "3":
            new_api_key = mode_change_api()
            if new_api_key:
                api_key = new_api_key
            input("\nTekan Enter untuk kembali ke menu...")
            
        elif choice == "4":
            print("\n👋 Terima kasih telah menggunakan aplikasi ini!\n")
            sys.exit(0)

# ==================== ENTRY POINT ====================

if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        print("\n\n👋 Program dihentikan oleh user. Terima kasih!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error tidak terduga: {str(e)}\n")
        sys.exit(1)