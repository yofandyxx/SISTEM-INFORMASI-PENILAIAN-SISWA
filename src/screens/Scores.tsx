/**
 * ============================================================
 * PROJECT 03 - SISTEM INFORMASI PENILAIAN SISWA
 * File        : Scores.tsx
 * Lokasi file : src/screens/Scores.tsx
 * Fungsi      : Mengelola data nilai siswa.
 * Dibuat oleh : Amrizal,S.Kom, M.Kom
 * 
 * Fitur utama:
 * 1. Menampilkan seluruh data nilai.
 * 2. Menghubungkan siswa dan mata pelajaran melalui Foreign Key.
 * 3. Menambah data nilai.
 * 4. Mengubah data nilai.
 * 5. Menghapus data nilai.
 * 6. Memilih siswa dan mata pelajaran melalui Modal.
 * 7. Validasi nilai Tugas, UTS, dan UAS pada rentang 0-100.
 * 8. Menghitung nilai akhir secara otomatis.
 * 9. Menentukan grade secara otomatis.
 *
 * Konsep penting yang dipelajari:
 * - CRUD SQLite
 * - Relational Database
 * - Primary Key dan Foreign Key
 * - SQL JOIN
 * - Parameterized Query
 * - React useState()
 * - Modal
 * - Array map()
 * - Array find()
 * - Form Validation
 * - Number Conversion
 * - Automatic Calculation
 * - Error Handling
 *
 * Relasi data:
 *
 * students (1) --------< scores >-------- (1) subjects
 *
 * student_id pada scores -> students.id
 * subject_id pada scores -> subjects.id
 * ============================================================
 */

import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/db';
import { Btn, Card, C, Header, IconBtn } from '../components/UI';
import { Score, Student, Subject } from '../types';
import { calculateFinal, getGrade } from '../utils/grade';


/**
 * ============================================================
 * HALAMAN PENILAIAN SISWA
 * ============================================================
 *
 * Scores mengelola data nilai yang menghubungkan:
 *
 * - Student
 * - Subject
 * - Score
 *
 * melalui student_id dan subject_id pada tabel scores.
 */
export default function Scores({
  refresh
}: {
  refresh: () => void;
}) {

  /**
   * ==========================================================
   * MEMBACA MASTER DATA SISWA
   * ==========================================================
   *
   * Data siswa dibutuhkan untuk pilihan siswa ketika pengguna
   * menambahkan atau mengubah nilai.
   */
  const students = db.getAllSync<Student>(
    'SELECT * FROM students ORDER BY name'
  );


  /**
   * ==========================================================
   * MEMBACA MASTER DATA MATA PELAJARAN
   * ==========================================================
   *
   * Data subjects digunakan sebagai pilihan mata pelajaran
   * pada form penilaian.
   */
  const subjects = db.getAllSync<Subject>(
    'SELECT * FROM subjects ORDER BY name'
  );


  /**
   * ==========================================================
   * MEMBACA DATA NILAI DENGAN JOIN
   * ==========================================================
   *
   * Tabel scores hanya menyimpan:
   *
   * student_id
   * subject_id
   *
   * Agar nama siswa dan nama mata pelajaran dapat ditampilkan,
   * tabel scores dihubungkan dengan students dan subjects.
   *
   * Relasi:
   *
   * scores.student_id
   *        ↓
   * students.id
   *
   * scores.subject_id
   *        ↓
   * subjects.id
   *
   * Alias:
   *
   * st = students
   * su = subjects
   * sc = scores
   */
  const rows = db.getAllSync<Score>(`
    SELECT
      sc.*,
      st.name student_name,
      su.name subject_name
    FROM scores sc
    JOIN students st
      ON st.id = sc.student_id
    JOIN subjects su
      ON su.id = sc.subject_id
    ORDER BY
      st.name,
      su.name
  `);


  /**
   * ==========================================================
   * STATE FORM
   * ==========================================================
   */

  // Mengatur Modal tambah/edit nilai.
  const [open, setOpen] = useState(false);


  /**
   * ID data nilai yang sedang diedit.
   *
   * null   = mode Tambah
   * number = mode Edit
   */
  const [edit, setEdit] = useState<number | null>(null);


  /**
   * ID siswa yang dipilih.
   *
   * Secara default menggunakan siswa pertama jika tersedia.
   */
  const [sid, setSid] = useState(
    students[0]?.id ?? 0
  );


  /**
   * ID mata pelajaran yang dipilih.
   *
   * Secara default menggunakan mata pelajaran pertama.
   */
  const [mid, setMid] = useState(
    subjects[0]?.id ?? 0
  );


  /**
   * v menyimpan tiga nilai dalam bentuk string:
   *
   * v[0] = Nilai Tugas
   * v[1] = Nilai UTS
   * v[2] = Nilai UAS
   *
   * TextInput menggunakan string sehingga nilai baru dikonversi
   * menjadi number ketika proses penyimpanan dilakukan.
   */
  const [v, setV] = useState([
    '',
    '',
    ''
  ]);


  /**
   * pick menentukan Modal pilihan yang sedang dibuka.
   *
   * 's'  = memilih siswa
   * 'm'  = memilih mata pelajaran
   * null = Modal pilihan tertutup
   */
  const [pick, setPick] = useState<'s' | 'm' | null>(
    null
  );


  /**
   * ==========================================================
   * MEMBUKA FORM TAMBAH / EDIT
   * ==========================================================
   *
   * Jika r tersedia:
   * -> mode Edit.
   *
   * Jika r tidak tersedia:
   * -> mode Tambah.
   */
  const show = (r?: Score) => {

    // Simpan ID nilai jika mode Edit.
    setEdit(
      r?.id ?? null
    );


    /**
     * Pilih siswa dari data lama ketika Edit.
     * Jika Tambah, gunakan siswa pertama.
     */
    setSid(
      r?.student_id ??
      students[0]?.id ??
      0
    );


    /**
     * Pilih mata pelajaran dari data lama ketika Edit.
     * Jika Tambah, gunakan mata pelajaran pertama.
     */
    setMid(
      r?.subject_id ??
      subjects[0]?.id ??
      0
    );


    /**
     * Jika Edit:
     * isi TextInput menggunakan nilai lama.
     *
     * String() digunakan karena value pada TextInput
     * membutuhkan data berbentuk string.
     */
    setV(
      r
        ? [
            String(r.assignment),
            String(r.midterm),
            String(r.final_exam)
          ]
        : [
            '',
            '',
            ''
          ]
    );


    // Membuka Modal form nilai.
    setOpen(true);
  };


  /**
   * ==========================================================
   * MENYIMPAN DATA NILAI
   * ==========================================================
   *
   * Tahapan:
   *
   * 1. Mengubah nilai input menjadi number.
   * 2. Memastikan siswa dan mata pelajaran dipilih.
   * 3. Memvalidasi rentang nilai 0-100.
   * 4. Menghitung nilai akhir.
   * 5. Menentukan grade.
   * 6. Menjalankan INSERT atau UPDATE.
   */
  const save = () => {

    /**
     * TextInput menghasilkan string.
     *
     * map(Number) mengubah seluruh isi array menjadi number.
     *
     * Contoh:
     *
     * ['80', '85', '90']
     *
     * menjadi:
     *
     * [80, 85, 90]
     */
    const n = v.map(Number);


    /**
     * VALIDASI SISWA DAN MATA PELAJARAN
     *
     * Data nilai tidak dapat disimpan tanpa student_id
     * dan subject_id.
     */
    if (!sid || !mid) {
      return Alert.alert(
        'Validasi',
        'Siswa dan mata pelajaran wajib dipilih.'
      );
    }


    /**
     * VALIDASI NILAI
     *
     * Kondisi yang dianggap tidak valid:
     *
     * - TextInput kosong.
     * - Nilai kurang dari 0.
     * - Nilai lebih dari 100.
     * - Nilai bukan angka (NaN).
     */
    if (
      v.some((x) => x.trim() === '') ||
      n.some(
        (x) =>
          x < 0 ||
          x > 100 ||
          Number.isNaN(x)
      )
    ) {
      return Alert.alert(
        'Validasi',
        'Nilai harus berada pada rentang 0–100.'
      );
    }


    /**
     * ========================================================
     * MENGHITUNG NILAI AKHIR
     * ========================================================
     *
     * calculateFinal() menerima:
     *
     * n[0] = Tugas
     * n[1] = UTS
     * n[2] = UAS
     *
     * Hasil perhitungan disimpan ke variabel f.
     */
    const f = calculateFinal(
      n[0]!,
      n[1]!,
      n[2]!
    );


    try {

      /**
       * ======================================================
       * UPDATE ATAU INSERT
       * ======================================================
       *
       * Jika edit memiliki ID:
       * -> UPDATE data lama.
       *
       * Jika edit = null:
       * -> INSERT data baru.
       *
       * getGrade(f) menentukan grade berdasarkan nilai akhir.
       */
      edit
        ? db.runSync(
            'UPDATE scores SET student_id=?,subject_id=?,assignment=?,midterm=?,final_exam=?,final_score=?,grade=? WHERE id=?',
            sid,
            mid,
            ...n,
            f,
            getGrade(f),
            edit
          )
        : db.runSync(
            'INSERT INTO scores(student_id,subject_id,assignment,midterm,final_exam,final_score,grade) VALUES(?,?,?,?,?,?,?)',
            sid,
            mid,
            ...n,
            f,
            getGrade(f)
          );


      // Tutup Modal setelah data berhasil disimpan.
      setOpen(false);


      /**
       * Meminta parent component melakukan refresh agar
       * tampilan membaca data terbaru dari SQLite.
       */
      refresh();

    } catch {

      /**
       * Pada database terdapat constraint:
       *
       * UNIQUE(student_id, subject_id)
       *
       * Artinya satu siswa hanya boleh mempunyai satu data
       * nilai untuk mata pelajaran yang sama.
       */
      Alert.alert(
        'Gagal',
        'Nilai siswa untuk mata pelajaran tersebut sudah ada.'
      );
    }
  };


  /**
   * ==========================================================
   * MENGHAPUS DATA NILAI
   * ==========================================================
   *
   * Alert digunakan sebagai konfirmasi agar data tidak
   * terhapus tanpa sengaja.
   */
  const del = (r: Score) =>
    Alert.alert(
      'Hapus Nilai',
      `Hapus nilai ${r.student_name} - ${r.subject_name}?`,
      [
        {
          text: 'Batal'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {

            // Hapus nilai berdasarkan Primary Key id.
            db.runSync(
              'DELETE FROM scores WHERE id=?',
              r.id
            );


            // Refresh tampilan setelah penghapusan.
            refresh();
          }
        }
      ]
    );


  /**
   * ==========================================================
   * MENCARI NAMA SISWA YANG DIPILIH
   * ==========================================================
   *
   * sid hanya menyimpan ID siswa.
   *
   * find() digunakan untuk mencari object siswa berdasarkan ID,
   * kemudian mengambil properti name.
   */
  const sname =
    students.find(
      (x) => x.id === sid
    )?.name ?? 'Pilih siswa';


  /**
   * ==========================================================
   * MENCARI NAMA MATA PELAJARAN YANG DIPILIH
   * ==========================================================
   */
  const mname =
    subjects.find(
      (x) => x.id === mid
    )?.name ?? 'Pilih mata pelajaran';


  /**
   * ==========================================================
   * TAMPILAN HALAMAN PENILAIAN
   * ==========================================================
   */
  return (
    <>
      {/* Header halaman */}
      <Header
        title="Penilaian Siswa"
        subtitle="CRUD nilai • kalkulasi otomatis • grade"
      />


      {/* Membuka Modal Tambah Nilai */}
      <Btn
        label="Tambah Nilai"
        onPress={() => show()}
      />


      <View style={{ height: 12 }} />


      {/* =====================================================
          DAFTAR NILAI
          =====================================================

          rows.map() menampilkan seluruh hasil JOIN dari SQLite.
      */}
      {rows.map((r) => (
        <Card key={r.id}>

          <View style={st.row}>

            {/* Informasi siswa dan mata pelajaran */}
            <View style={{ flex: 1 }}>

              {/* Nama siswa */}
              <Text style={st.name}>
                {r.student_name}
              </Text>


              {/* Nama mata pelajaran */}
              <Text style={st.subject}>
                {r.subject_name}
              </Text>


              {/* Nilai komponen */}
              <View style={st.mini}>
                <Text>
                  Tugas {r.assignment}
                </Text>

                <Text>
                  UTS {r.midterm}
                </Text>

                <Text>
                  UAS {r.final_exam}
                </Text>
              </View>

            </View>


            {/* Grade dan nilai akhir */}
            <View style={st.grade}>
              <Text style={st.g}>
                {r.grade}
              </Text>

              <Text style={st.final}>
                {r.final_score}
              </Text>
            </View>

          </View>


          {/* Tombol Edit dan Hapus */}
          <View style={st.actions}>
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

        </Card>
      ))}


      {/* =====================================================
          MODAL TAMBAH / EDIT NILAI
          ===================================================== */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
      >
        <View style={st.overlay}>

          <View style={st.modal}>

            {/* Judul berubah berdasarkan mode Tambah/Edit */}
            <Text style={st.title}>
              {edit ? 'Edit Nilai' : 'Tambah Nilai'}
            </Text>


            {/* =================================================
                PILIH SISWA
                ================================================= */}
            <Text style={st.label}>
              Siswa
            </Text>

            <TouchableOpacity
              style={st.select}
              onPress={() => setPick('s')}
            >
              <Text>
                {sname}
              </Text>

              <Ionicons name="chevron-down" />
            </TouchableOpacity>


            {/* =================================================
                PILIH MATA PELAJARAN
                ================================================= */}
            <Text style={st.label}>
              Mata Pelajaran
            </Text>

            <TouchableOpacity
              style={st.select}
              onPress={() => setPick('m')}
            >
              <Text>
                {mname}
              </Text>

              <Ionicons name="chevron-down" />
            </TouchableOpacity>


            {/* =================================================
                INPUT NILAI
                =================================================

                Tiga TextInput dibuat menggunakan map():
                - Nilai Tugas
                - Nilai UTS
                - Nilai UAS
            */}
            {[
              'Nilai Tugas',
              'Nilai UTS',
              'Nilai UAS'
            ].map((p, i) => (
              <TextInput
                key={p}
                style={st.input}
                keyboardType="numeric"
                placeholder={p}
                value={v[i]}
                onChangeText={(x) =>
                  setV((a) =>
                    a.map(
                      (z, j) => j === i ? x : z
                    )
                  )
                }
              />
            ))}


            {/* Hitung nilai akhir kemudian simpan */}
            <Btn
              label="Hitung & Simpan"
              icon="calculator-outline"
              onPress={save}
            />


            {/* Menutup Modal tanpa menyimpan */}
            <TouchableOpacity
              onPress={() => setOpen(false)}
            >
              <Text style={st.cancel}>
                Batal
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


      {/* =====================================================
          MODAL PILIH SISWA / MATA PELAJARAN
          =====================================================

          Modal yang sama digunakan untuk dua kebutuhan:
          pick = 's' -> daftar siswa
          pick = 'm' -> daftar mata pelajaran
      */}
      <Modal
        visible={!!pick}
        transparent
        animationType="fade"
      >
        <View style={st.center}>

          <View style={st.picker}>

            {/* Judul Modal menyesuaikan jenis data */}
            <Text style={st.title}>
              {
                pick === 's'
                  ? 'Pilih Siswa'
                  : 'Pilih Mata Pelajaran'
              }
            </Text>


            {/**
             * Jika pick = 's', gunakan array students.
             * Jika pick = 'm', gunakan array subjects.
             */}
            {(pick === 's' ? students : subjects).map(
              (x: any) => (
                <TouchableOpacity
                  key={x.id}
                  style={st.option}
                  onPress={() => {

                    /**
                     * Jika memilih siswa:
                     * simpan ID ke sid.
                     *
                     * Jika memilih mata pelajaran:
                     * simpan ID ke mid.
                     */
                    pick === 's'
                      ? setSid(x.id)
                      : setMid(x.id);


                    // Tutup Modal pilihan.
                    setPick(null);
                  }}
                >

                  {/* Nama siswa / mata pelajaran */}
                  <Text style={st.optText}>
                    {x.name}
                  </Text>


                  {/* NIS siswa atau kode mata pelajaran */}
                  <Text style={st.optSub}>
                    {
                      pick === 's'
                        ? x.nis
                        : x.code
                    }
                  </Text>

                </TouchableOpacity>
              )
            )}


            {/* Menutup Modal pilihan */}
            <TouchableOpacity
              onPress={() => setPick(null)}
            >
              <Text style={st.cancel}>
                Tutup
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </>
  );
}


/**
 * ============================================================
 * STYLE
 * ============================================================
 */
const st = StyleSheet.create({

  // Baris utama informasi nilai.
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },


  // Nama siswa.
  name: {
    fontWeight: '900',
    fontSize: 16,
    color: C.navy
  },


  // Nama mata pelajaran.
  subject: {
    color: C.violet,
    fontWeight: '800',
    marginTop: 3
  },


  /**
   * Container nilai Tugas, UTS, dan UAS.
   * flexDirection row membuat ketiganya tampil horizontal.
   */
  mini: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },


  // Container Grade dan nilai akhir.
  grade: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center'
  },


  // Huruf Grade A/B/C/D/E.
  g: {
    fontWeight: '900',
    fontSize: 24,
    color: C.orange
  },


  // Nilai akhir.
  final: {
    color: C.orange,
    fontWeight: '800'
  },


  // Container tombol Edit dan Hapus.
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10
  },


  /**
   * Overlay Modal Tambah/Edit.
   * Modal ditempatkan pada bagian bawah layar.
   */
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#0007'
  },


  // Panel Modal Tambah/Edit.
  modal: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26
  },


  // Judul Modal.
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: C.navy,
    marginBottom: 10
  },


  // Label form.
  label: {
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 5
  },


  // Tombol pilihan siswa / mata pelajaran.
  select: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 13,
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },


  // Input nilai.
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 13,
    borderRadius: 13,
    marginTop: 10
  },


  // Tombol teks Batal / Tutup.
  cancel: {
    textAlign: 'center',
    padding: 14,
    color: C.muted,
    fontWeight: '800'
  },


  /**
   * Background Modal picker.
   * justifyContent center menempatkan picker di tengah layar.
   */
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0008'
  },


  // Panel pilihan siswa / mata pelajaran.
  picker: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 18
  },


  // Satu pilihan siswa / mata pelajaran.
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },


  // Nama pada daftar pilihan.
  optText: {
    fontWeight: '900',
    color: C.navy
  },


  // NIS atau kode mata pelajaran.
  optSub: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2
  }
});
