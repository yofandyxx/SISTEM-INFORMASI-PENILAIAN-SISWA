/**

 * Fitur utama:
 * 1. Menampilkan data siswa.
 * 2. Mencari siswa berdasarkan nama atau NIS.
 * 3. Menambah data siswa.
 * 4. Mengubah data siswa.
 * 5. Menghapus data siswa.
 * 6. Menampilkan data mata pelajaran.
 * 7. Menambah data mata pelajaran.
 * 8. Mengubah data mata pelajaran.
 * 9. Menghapus data mata pelajaran.
 * 10. Validasi form sebelum data disimpan.
 *
 * Konsep penting yang dipelajari:
 * - CRUD (Create, Read, Update, Delete)
 * - React useState()
 * - SQLite SELECT, INSERT, UPDATE, DELETE
 * - Parameterized Query
 * - LIKE untuk pencarian
 * - Modal Form
 * - Form Validation
 * - Array map()
 * - Conditional Rendering
 * - Reusable Component
 * - Foreign Key dan ON DELETE CASCADE
 * ============================================================
 */

import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/db';
import { Btn, Card, C, Header, IconBtn } from '../components/UI';
import { Student, Subject } from '../types';


/**
 * ============================================================
 * KOMPONEN FIELD
 * ============================================================
 *
 * Field merupakan komponen input reusable.
 *
 * Tujuannya agar TextInput pada form tambah/edit mempunyai
 * tampilan dan perilaku yang konsisten.
 *
 * Parameter:
 * - v   : nilai TextInput.
 * - set : fungsi untuk mengubah nilai.
 * - p   : placeholder.
 */
const Field = ({
  v,
  set,
  p
}: {
  v: string;
  set: (x: string) => void;
  p: string;
}) => (
  <TextInput
    value={v}
    onChangeText={set}
    placeholder={p}
    style={s.input}
  />
);


/**
 * ============================================================
 * HALAMAN DATA SISWA
 * ============================================================
 *
 * Komponen Students menangani operasi CRUD:
 *
 * CREATE -> Tambah siswa
 * READ   -> Menampilkan dan mencari siswa
 * UPDATE -> Mengubah siswa
 * DELETE -> Menghapus siswa
 */
export function Students({
  refresh
}: {
  refresh: () => void;
}) {

  /**
   * q menyimpan kata kunci pencarian.
   */
  const [q, setQ] = useState('');


  /**
   * open menentukan apakah Modal form ditampilkan.
   *
   * false = Modal tertutup
   * true  = Modal terbuka
   */
  const [open, setOpen] = useState(false);


  /**
   * edit menyimpan ID siswa yang sedang diedit.
   *
   * null   = mode tambah data
   * number = mode edit data
   */
  const [edit, setEdit] = useState<number | null>(null);


  /**
   * f menyimpan isi form siswa.
   *
   * Urutan:
   * f[0] = NIS
   * f[1] = Nama
   * f[2] = Kelas
   * f[3] = Jurusan
   */
  const [f, setF] = useState([
    '',
    '',
    '',
    ''
  ]);


  /**
   * ==========================================================
   * READ + SEARCH DATA SISWA
   * ==========================================================
   *
   * LIKE digunakan untuk melakukan pencarian sebagian teks.
   *
   * Contoh:
   * Jika q = "Ahmad"
   *
   * maka parameter menjadi:
   * %Ahmad%
   *
   * sehingga SQLite dapat mencari nama/NIS yang mengandung
   * kata tersebut.
   */
  const rows = db.getAllSync<Student>(
    'SELECT * FROM students WHERE name LIKE ? OR nis LIKE ? ORDER BY name',
    `%${q}%`,
    `%${q}%`
  );


  /**
   * ==========================================================
   * MEMBUKA FORM TAMBAH / EDIT SISWA
   * ==========================================================
   *
   * Jika parameter r diberikan:
   * -> form berada pada mode EDIT.
   *
   * Jika r tidak diberikan:
   * -> form berada pada mode TAMBAH.
   */
  const show = (r?: Student) => {

    // Simpan ID siswa jika sedang melakukan edit.
    setEdit(
      r?.id ?? null
    );

    /**
     * Jika r tersedia, form diisi dengan data siswa.
     * Jika tidak, form dikosongkan.
     */
    setF(
      r
        ? [
            r.nis,
            r.name,
            r.class_name,
            r.major
          ]
        : [
            '',
            '',
            '',
            ''
          ]
    );

    // Tampilkan Modal form.
    setOpen(true);
  };


  /**
   * ==========================================================
   * MENYIMPAN DATA SISWA
   * ==========================================================
   *
   * Fungsi save() digunakan untuk dua operasi:
   *
   * 1. INSERT -> jika edit = null.
   * 2. UPDATE -> jika edit memiliki ID siswa.
   */
  const save = () => {

    /**
     * VALIDASI FORM
     *
     * some() memeriksa apakah terdapat field yang kosong.
     * trim() menghapus spasi pada awal dan akhir teks.
     */
    if (f.some((x) => !x.trim())) {
      return Alert.alert(
        'Validasi',
        'Semua data wajib diisi.'
      );
    }


    try {

      /**
       * Jika edit memiliki nilai ID, jalankan UPDATE.
       * Jika tidak, jalankan INSERT.
       */
      edit
        ? db.runSync(
            'UPDATE students SET nis=?,name=?,class_name=?,major=? WHERE id=?',
            ...f,
            edit
          )
        : db.runSync(
            'INSERT INTO students(nis,name,class_name,major) VALUES(?,?,?,?)',
            ...f
          );


      // Tutup Modal setelah data berhasil disimpan.
      setOpen(false);


      /**
       * Memanggil refresh() agar tampilan membaca ulang
       * data terbaru dari database.
       */
      refresh();

    } catch {

      /**
       * Kolom NIS pada database memiliki constraint UNIQUE.
       *
       * Jika pengguna memasukkan NIS yang sudah tersedia,
       * SQLite akan menghasilkan error dan ditangani di sini.
       */
      Alert.alert(
        'Gagal',
        'NIS sudah digunakan.'
      );
    }
  };


  /**
   * ==========================================================
   * MENGHAPUS DATA SISWA
   * ==========================================================
   *
   * Sebelum DELETE dijalankan, pengguna diminta melakukan
   * konfirmasi menggunakan Alert.
   *
   * Karena tabel scores menggunakan:
   *
   * FOREIGN KEY(student_id)
   * REFERENCES students(id)
   * ON DELETE CASCADE
   *
   * maka data nilai milik siswa tersebut juga akan terhapus.
   */
  const del = (r: Student) =>
    Alert.alert(
      'Hapus Siswa',
      `Hapus ${r.name}? Nilai yang terkait juga akan terhapus.`,
      [
        {
          text: 'Batal'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {

            // Menghapus siswa berdasarkan ID.
            db.runSync(
              'DELETE FROM students WHERE id=?',
              r.id
            );

            // Memperbarui tampilan.
            refresh();
          }
        }
      ]
    );


  /**
   * ==========================================================
   * TAMPILAN HALAMAN DATA SISWA
   * ==========================================================
   */
  return (
    <>
      {/* Header menampilkan jumlah siswa hasil query */}
      <Header
        title="Data Siswa"
        subtitle={`${rows.length} siswa • CRUD master data`}
      />


      {/* Input pencarian berdasarkan nama atau NIS */}
      <TextInput
        style={s.input}
        placeholder="🔎 Cari nama atau NIS..."
        value={q}
        onChangeText={setQ}
      />


      {/* Tombol membuka form tambah siswa */}
      <Btn
        label="Tambah Siswa"
        onPress={() => show()}
      />


      <View style={{ height: 12 }} />


      {/**
       * map() digunakan untuk menampilkan seluruh siswa
       * yang dihasilkan query SQLite.
       */}
      {rows.map((r) => (
        <Card key={r.id}>
          <View style={s.row}>

            {/* Avatar menggunakan inisial nama siswa */}
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {r.name
                  .split(' ')
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join('')}
              </Text>
            </View>


            {/* Informasi siswa */}
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {r.name}
              </Text>

              <Text style={s.meta}>
                <Ionicons name="id-card-outline" /> {r.nis}
              </Text>

              <Text style={s.meta}>
                <Ionicons name="school-outline" /> {r.class_name}
              </Text>

              <Text style={s.meta}>
                <Ionicons name="git-branch-outline" /> {r.major}
              </Text>
            </View>


            {/* Tombol Edit dan Hapus */}
            <View style={s.tools}>
              <IconBtn
                icon="create-outline"
                onPress={() => show(r)}
              />

              <IconBtn
                icon="trash-outline"
                danger
                onPress={() => del(r)}
              />
            </View>

          </View>
        </Card>
      ))}


      {/**
       * ======================================================
       * MODAL TAMBAH / EDIT SISWA
       * ======================================================
       *
       * Judul Modal berubah berdasarkan nilai edit.
       */}
      <Editor
        title={edit ? 'Edit Siswa' : 'Tambah Siswa'}
        open={open}
        close={() => setOpen(false)}
        save={save}
      >
        {/**
         * Field dibuat dari array agar tidak perlu menulis
         * empat TextInput secara berulang.
         */}
        {[
          'NIS',
          'Nama siswa',
          'Kelas',
          'Jurusan'
        ].map((p, i) => (
          <Field
            key={p}
            v={f[i] ?? ''}
            set={(x) =>
              setF((a) =>
                a.map(
                  (v, j) => j === i ? x : v
                )
              )
            }
            p={p}
          />
        ))}
      </Editor>
    </>
  );
}


/**
 * ============================================================
 * HALAMAN MATA PELAJARAN
 * ============================================================
 *
 * Komponen Subjects menggunakan pola CRUD yang sama seperti
 * Students, tetapi data yang dikelola adalah mata pelajaran.
 *
 * Field:
 * - code
 * - name
 * - teacher
 */
export function Subjects({
  refresh
}: {
  refresh: () => void;
}) {

  /**
   * State untuk mengatur Modal.
   */
  const [open, setOpen] = useState(false);


  /**
   * ID mata pelajaran yang sedang diedit.
   *
   * null = tambah
   * ID   = edit
   */
  const [edit, setEdit] = useState<number | null>(null);


  /**
   * Data form mata pelajaran.
   *
   * f[0] = kode mata pelajaran
   * f[1] = nama mata pelajaran
   * f[2] = nama guru
   */
  const [f, setF] = useState([
    '',
    '',
    ''
  ]);


  /**
   * ==========================================================
   * READ DATA MATA PELAJARAN
   * ==========================================================
   *
   * Seluruh mata pelajaran dibaca dan diurutkan berdasarkan nama.
   */
  const rows = db.getAllSync<Subject>(
    'SELECT * FROM subjects ORDER BY name'
  );


  /**
   * ==========================================================
   * MEMBUKA FORM TAMBAH / EDIT MATA PELAJARAN
   * ==========================================================
   */
  const show = (r?: Subject) => {

    setEdit(
      r?.id ?? null
    );


    /**
     * Isi form dengan data lama jika mode Edit.
     * Kosongkan form jika mode Tambah.
     */
    setF(
      r
        ? [
            r.code,
            r.name,
            r.teacher
          ]
        : [
            '',
            '',
            ''
          ]
    );


    // Membuka Modal.
    setOpen(true);
  };


  /**
   * ==========================================================
   * MENYIMPAN MATA PELAJARAN
   * ==========================================================
   */
  const save = () => {

    // Pastikan semua field telah diisi.
    if (f.some((x) => !x.trim())) {
      return Alert.alert(
        'Validasi',
        'Semua data wajib diisi.'
      );
    }


    try {

      /**
       * UPDATE dijalankan jika edit memiliki ID.
       * INSERT dijalankan jika edit bernilai null.
       */
      edit
        ? db.runSync(
            'UPDATE subjects SET code=?,name=?,teacher=? WHERE id=?',
            ...f,
            edit
          )
        : db.runSync(
            'INSERT INTO subjects(code,name,teacher) VALUES(?,?,?)',
            ...f
          );


      // Tutup Modal.
      setOpen(false);


      // Refresh tampilan.
      refresh();

    } catch {

      /**
       * code pada tabel subjects bersifat UNIQUE.
       * Kode mata pelajaran tidak boleh digunakan dua kali.
       */
      Alert.alert(
        'Gagal',
        'Kode mata pelajaran sudah digunakan.'
      );
    }
  };


  /**
   * ==========================================================
   * MENGHAPUS MATA PELAJARAN
   * ==========================================================
   *
   * ON DELETE CASCADE menyebabkan data scores yang berhubungan
   * dengan mata pelajaran ini ikut terhapus.
   */
  const del = (r: Subject) =>
    Alert.alert(
      'Hapus Mata Pelajaran',
      `Hapus ${r.name}? Nilai terkait juga akan terhapus.`,
      [
        {
          text: 'Batal'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {

            db.runSync(
              'DELETE FROM subjects WHERE id=?',
              r.id
            );

            refresh();
          }
        }
      ]
    );


  /**
   * ==========================================================
   * TAMPILAN HALAMAN MATA PELAJARAN
   * ==========================================================
   */
  return (
    <>
      <Header
        title="Mata Pelajaran"
        subtitle={`${rows.length} mapel • CRUD master data`}
      />


      {/* Membuka Modal tambah mata pelajaran */}
      <Btn
        label="Tambah Mata Pelajaran"
        onPress={() => show()}
      />


      <View style={{ height: 12 }} />


      {/* Menampilkan seluruh mata pelajaran */}
      {rows.map((r) => (
        <Card key={r.id}>
          <View style={s.row}>

            {/* Ikon mata pelajaran */}
            <View
              style={[
                s.avatar,
                {
                  backgroundColor: '#ede9fe'
                }
              ]}
            >
              <Ionicons
                name="book-outline"
                size={24}
                color={C.violet}
              />
            </View>


            {/* Informasi mata pelajaran */}
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {r.name}
              </Text>

              <Text style={s.code}>
                {r.code}
              </Text>

              <Text style={s.meta}>
                <Ionicons name="person-outline" /> {r.teacher}
              </Text>
            </View>


            {/* Tombol Edit dan Hapus */}
            <View style={s.tools}>
              <IconBtn
                icon="create-outline"
                onPress={() => show(r)}
              />

              <IconBtn
                icon="trash-outline"
                danger
                onPress={() => del(r)}
              />
            </View>

          </View>
        </Card>
      ))}


      {/* Modal tambah/edit mata pelajaran */}
      <Editor
        title={
          edit
            ? 'Edit Mata Pelajaran'
            : 'Tambah Mata Pelajaran'
        }
        open={open}
        close={() => setOpen(false)}
        save={save}
      >
        {[
          'Kode mapel',
          'Nama mata pelajaran',
          'Nama guru'
        ].map((p, i) => (
          <Field
            key={p}
            v={f[i] ?? ''}
            set={(x) =>
              setF((a) =>
                a.map(
                  (v, j) => j === i ? x : v
                )
              )
            }
            p={p}
          />
        ))}
      </Editor>
    </>
  );
}


/**
 * ============================================================
 * KOMPONEN EDITOR
 * ============================================================
 *
 * Editor merupakan Modal reusable yang digunakan oleh:
 *
 * - Form Tambah/Edit Siswa
 * - Form Tambah/Edit Mata Pelajaran
 *
 * Dengan pendekatan reusable component, struktur Modal tidak
 * perlu ditulis berulang kali.
 *
 * Parameter:
 * - title    : Judul Modal.
 * - open     : Status tampil/tidaknya Modal.
 * - close    : Fungsi menutup Modal.
 * - save     : Fungsi menyimpan data.
 * - children : Isi form yang ditempatkan di dalam Modal.
 */
function Editor({
  title,
  open,
  close,
  save,
  children
}: {
  title: string;
  open: boolean;
  close: () => void;
  save: () => void;
  children: React.ReactNode;
}) {

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
    >
      {/* Overlay gelap di belakang Modal */}
      <View style={s.overlay}>

        {/* Container utama Modal */}
        <View style={s.modal}>

          {/* Judul form */}
          <Text style={s.modalTitle}>
            {title}
          </Text>


          {/* Field form dikirim melalui children */}
          {children}


          {/* Tombol Simpan */}
          <Btn
            label="Simpan Data"
            icon="save-outline"
            onPress={save}
          />


          {/* Tombol Batal */}
          <TouchableOpacity onPress={close}>
            <Text style={s.cancel}>
              Batal
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}


/**
 * ============================================================
 * STYLE
 * ============================================================
 */
const s = StyleSheet.create({

  // TextInput untuk pencarian dan form.
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 13,
    borderRadius: 13,
    marginBottom: 10
  },


  // Menyusun isi Card secara horizontal.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },


  // Avatar siswa / mata pelajaran.
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center'
  },


  // Inisial nama siswa pada avatar.
  avatarText: {
    fontWeight: '900',
    color: C.blue,
    fontSize: 17
  },


  // Nama siswa / mata pelajaran.
  name: {
    fontSize: 16,
    fontWeight: '900',
    color: C.navy
  },


  // Informasi tambahan.
  meta: {
    color: C.muted,
    marginTop: 4,
    fontSize: 12
  },


  // Kode mata pelajaran.
  code: {
    color: C.violet,
    fontWeight: '900',
    marginTop: 3
  },


  // Container tombol Edit dan Hapus.
  tools: {
    gap: 7
  },


  /**
   * Overlay Modal.
   *
   * backgroundColor '#0007' menghasilkan background
   * hitam transparan.
   */
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#0007'
  },


  // Panel utama Modal.
  modal: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26
  },


  // Judul Modal.
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: C.navy,
    marginBottom: 14
  },


  // Tombol teks Batal.
  cancel: {
    textAlign: 'center',
    padding: 14,
    color: C.muted,
    fontWeight: '800'
  }
});
