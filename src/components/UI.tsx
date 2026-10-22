/**
 * ============================================================
 * PROJECT 03 - SISTEM INFORMASI PENILAIAN SISWA
 * File        : UI.tsx
 * Lokasi file : src/components/UI.tsx
 * Fungsi      : Menyediakan komponen antarmuka (UI) reusable
 *               untuk menjaga konsistensi tampilan pada halaman
 *               Dashboard, Siswa, Mata Pelajaran, Nilai, dan Rekap.
 * Dibuat oleh : Amrizal, S.Kom., M.Kom.
 * ============================================================
 *
 * Fitur utama:
 *
 * 1. Menyediakan palet warna terpusat melalui object C.
 * 2. Menampilkan konten di dalam komponen Card.
 * 3. Menampilkan judul dan subjudul halaman melalui Header.
 * 4. Menampilkan identitas PROJECT 03 pada bagian Header.
 * 5. Menyediakan tombol aksi utama Btn dengan ikon Ionicons.
 * 6. Menggunakan ikon default jika prop icon pada Btn kosong.
 * 7. Menjalankan callback onPress ketika tombol ditekan.
 * 8. Menyediakan tombol aksi ringkas IconBtn.
 * 9. Membedakan tampilan aksi berbahaya melalui prop danger.
 * 10. Mengatur warna, ukuran, jarak, dan bayangan via StyleSheet.
 *
 * Konsep pembelajaran:
 *
 * - React Functional Component
 * - TypeScript Props dan React.ReactNode
 * - Reusable Component dan Component Composition
 * - Named Export dan Import
 * - Destructuring Props dan Default Parameter
 * - Callback Function melalui onPress
 * - Conditional Styling dan Ternary Operator
 * - React Native View, Text, dan TouchableOpacity
 * - Expo Vector Icons (Ionicons)
 * - StyleSheet dan Object Konfigurasi Warna
 *
 * Catatan arsitektur:
 * File ini hanya menyediakan komponen tampilan bersama.
 * Tidak menjalankan query SQLite, CRUD, atau perhitungan grade.
 * Halaman lain dapat mengimpor komponen dan palet warna dari sini.
 * ============================================================
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * PALET WARNA APLIKASI
 * Warna disimpan dalam satu object agar identitas visual aplikasi
 * konsisten dan perubahan warna dapat dilakukan dari satu tempat.
 */
export const C = {
  navy: '#172554',
  blue: '#2563eb',
  violet: '#7c3aed',
  orange: '#f97316',
  cyan: '#0891b2',
  bg: '#f8fafc',
  muted: '#64748b',
  red: '#dc2626',
};

/**
 * CARD
 * Komponen reusable untuk membungkus informasi dalam panel putih.
 *
 * children adalah isi yang ditempatkan di dalam komponen Card.
 */
export const Card = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <View style={s.card}>
    {children}
  </View>
);

/**
 * HEADER
 * Digunakan sebagai bagian kepala halaman.
 *
 * Parameter:
 * - title    : Judul utama halaman.
 * - subtitle : Keterangan tambahan di bawah judul.
 */
export const Header = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <View style={s.header}>
    <Text style={s.kicker}>
      PROJECT 03 • SISTEM INFORMASI
    </Text>

    <Text style={s.title}>
      {title}
    </Text>

    <Text style={s.sub}>
      {subtitle}
    </Text>
  </View>
);

/**
 * BUTTON UTAMA
 * Tombol reusable yang mempunyai ikon dan label.
 *
 * Parameter:
 * - label   : Teks yang ditampilkan pada tombol.
 * - onPress : Fungsi yang dijalankan ketika tombol ditekan.
 * - icon    : Nama ikon Ionicons.
 *
 * Jika icon tidak diberikan, ikon default yang digunakan adalah
 * "add-circle-outline".
 */
export const Btn = ({
  label,
  onPress,
  icon = 'add-circle-outline',
}: {
  label: string;
  onPress: () => void;
  icon?: any;
}) => (
  <TouchableOpacity
    style={s.btn}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={18}
      color="white"
    />

    <Text style={s.btnText}>
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * ICON BUTTON
 * Tombol kecil berbentuk ikon yang biasanya digunakan untuk
 * aksi seperti Edit atau Hapus.
 *
 * Parameter:
 * - icon    : Nama ikon Ionicons.
 * - onPress : Fungsi yang dijalankan ketika tombol ditekan.
 * - danger  : Menentukan apakah tombol merupakan aksi berbahaya.
 *
 * Jika danger = true:
 * - Background tombol menjadi merah muda.
 * - Warna ikon menjadi merah.
 *
 * Biasanya digunakan untuk tombol hapus (delete).
 */
export const IconBtn = ({
  icon,
  onPress,
  danger = false,
}: {
  icon: any;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    style={[
      s.ib,
      danger && {
        backgroundColor: '#fee2e2',
      },
    ]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={18}
      color={danger ? C.red : C.blue}
    />
  </TouchableOpacity>
);

/**
 * STYLE APLIKASI
 * StyleSheet.create digunakan untuk mengelompokkan seluruh
 * pengaturan tampilan komponen pada file ini.
 */
const s = StyleSheet.create({
  // Tampilan panel/kartu informasi.
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  // Tampilan header halaman.
  header: {
    backgroundColor: C.navy,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },

  // Tulisan kecil identitas project pada header.
  kicker: {
    color: '#bfdbfe',
    fontSize: 11,
    fontWeight: '900',
  },

  // Judul utama pada header.
  title: {
    color: 'white',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 5,
  },

  // Subjudul pada header.
  sub: {
    color: '#dbeafe',
    marginTop: 5,
  },

  // Tampilan tombol utama.
  btn: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.blue,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
  },

  // Teks pada tombol utama.
  btnText: {
    color: 'white',
    fontWeight: '900',
  },

  // Tampilan tombol berbentuk ikon.
  ib: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
});