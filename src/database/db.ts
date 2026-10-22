/**
 
 * Fitur utama:
 *
 * 1. Membuka atau membuat database student_assessment.db.
 * 2. Mengaktifkan aturan relasi Foreign Key pada SQLite.
 * 3. Membuat tabel students untuk master data siswa.
 * 4. Membuat tabel subjects untuk master mata pelajaran.
 * 5. Membuat tabel scores untuk transaksi penilaian siswa.
 * 6. Menentukan Primary Key pada setiap tabel.
 * 7. Menerapkan UNIQUE Constraint pada NIS dan kode mapel.
 * 8. Mencegah duplikasi nilai siswa pada mapel yang sama.
 * 9. Mengatur ON DELETE CASCADE pada relasi tabel scores.
 * 10. Memeriksa ketersediaan data awal sebelum proses seed.
 * 11. Menambahkan lima data contoh siswa.
 * 12. Menambahkan empat data contoh mata pelajaran.
 * 13. Menambahkan tujuh data contoh penilaian siswa.
 * 14. Menghitung nilai akhir menggunakan calculateFinal().
 * 15. Menentukan grade menggunakan getGrade().
 * 16. Menyimpan nilai akhir dan grade ke tabel scores.
 *
 * Konsep pembelajaran:
 *
 * - SQLite Local Database
 * - Relational Database
 * - Database Initialization
 * - SQL Data Definition Language (DDL)
 * - CREATE TABLE IF NOT EXISTS
 * - Primary Key dan Auto Increment
 * - Foreign Key dan Referential Integrity
 * - UNIQUE Constraint dan NOT NULL
 * - ON DELETE CASCADE
 * - SQL INSERT dan SELECT COUNT(*)
 * - Parameterized Query / SQL Placeholder
 * - Seed Data dan Conditional Initialization
 * - TypeScript Tuple dan Type Annotation
 * - Array forEach() dan Destructuring
 * - Spread Operator
 * - Nullish Coalescing Operator (??)
 * - Optional Chaining (?.)
 * - Reusable Function
 * - Weighted Score Calculation
 * - Grade Classification
 *
 * Catatan arsitektur:
 *
 * Database menggunakan tiga tabel yang saling berhubungan:
 *
 * students (1) --------< scores >-------- (1) subjects
 *
 * Tabel students dan subjects menyimpan master data.
 * Tabel scores menyimpan transaksi penilaian dan menjadi
 * penghubung antara siswa dan mata pelajaran.
 *
 * Setiap siswa dapat memiliki banyak data nilai untuk
 * mata pelajaran yang berbeda, tetapi hanya satu nilai
 * untuk kombinasi siswa dan mata pelajaran yang sama.
 *
 * Nilai akhir dihitung menggunakan rumus:
 *
 * Nilai Akhir = (Tugas * 30%) +
 *               (UTS   * 30%) +
 *               (UAS   * 40%)
 *
 * Perhitungan dan penentuan grade dilakukan melalui
 * fungsi calculateFinal() dan getGrade() yang berada
 * pada file src/utils/grade.ts.
 *
 * Data awal hanya dimasukkan apabila tabel students
 * masih kosong. Proses ini digunakan untuk menyediakan
 * data contoh ketika aplikasi pertama kali dijalankan.
 *
 * Seluruh data disimpan secara lokal menggunakan SQLite.
 * Aplikasi tidak menggunakan REST API atau cloud database.
 * ============================================================
 */

import * as SQLite from 'expo-sqlite';
import { calculateFinal, getGrade } from '../utils/grade';


/**
 * ============================================================
 * MEMBUKA DATABASE SQLITE
 * ============================================================
 *
 * openDatabaseSync() akan membuka database jika sudah tersedia.
 * Jika database belum tersedia, SQLite akan membuat database baru.
 *
 * Data SQLite disimpan secara lokal pada perangkat sehingga data
 * tetap tersedia walaupun aplikasi ditutup.
 */
export const db = SQLite.openDatabaseSync(
  'student_assessment.db'
);


/**
 * ============================================================
 * TYPE DATA SEED
 * ============================================================
 *
 * Tuple digunakan agar TypeScript mengetahui dengan pasti:
 * - jumlah elemen array,
 * - tipe setiap elemen,
 * - serta urutan data yang digunakan.
 *
 * Dengan demikian TypeScript tidak menganggap elemen array
 * dapat bernilai undefined ketika digunakan pada proses INSERT.
 */

// Struktur data Student:
// [nis, nama, kelas, jurusan]
type S = [
  string,
  string,
  string,
  string
];

// Struktur data Subject:
// [kode mata pelajaran, nama mata pelajaran, guru/dosen]
type M = [
  string,
  string,
  string
];

// Struktur data Nilai:
// [student_id, subject_id, tugas, UTS, UAS]
type N = [
  number,
  number,
  number,
  number,
  number
];


/**
 * ============================================================
 * INISIALISASI DATABASE
 * ============================================================
 *
 * Fungsi initDatabase() dijalankan ketika aplikasi pertama kali
 * mempersiapkan database.
 *
 * Proses yang dilakukan:
 * 1. Mengaktifkan Foreign Key.
 * 2. Membuat tabel students.
 * 3. Membuat tabel subjects.
 * 4. Membuat tabel scores.
 * 5. Memeriksa apakah data siswa sudah tersedia.
 * 6. Jika belum, memasukkan data awal (seed data).
 */
export function initDatabase() {

  /**
   * ----------------------------------------------------------
   * MEMBUAT STRUKTUR DATABASE
   * ----------------------------------------------------------
   *
   * Relasi utama:
   *
   * students (1) --------< scores >-------- (1) subjects
   *
   * Artinya:
   * - Satu siswa dapat mempunyai banyak nilai.
   * - Satu mata pelajaran dapat dimiliki banyak data nilai.
   * - Tabel scores menjadi penghubung students dan subjects.
   */
  db.execSync(`
    PRAGMA foreign_keys=ON;

    CREATE TABLE IF NOT EXISTS students(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nis TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      major TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      teacher TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scores(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      assignment REAL NOT NULL,
      midterm REAL NOT NULL,
      final_exam REAL NOT NULL,
      final_score REAL NOT NULL,
      grade TEXT NOT NULL,

      UNIQUE(student_id, subject_id),

      FOREIGN KEY(student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

      FOREIGN KEY(subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
    );
  `);


  /**
   * ----------------------------------------------------------
   * MEMERIKSA DATA SISWA
   * ----------------------------------------------------------
   *
   * COUNT(*) digunakan untuk mengetahui jumlah record pada
   * tabel students.
   *
   * Seed data hanya dimasukkan jika tabel students masih kosong.
   * Hal ini mencegah data contoh dimasukkan berulang kali setiap
   * aplikasi dijalankan.
   */
  const c = db.getFirstSync<{
    n: number;
  }>(
    'SELECT COUNT(*) n FROM students'
  )?.n ?? 0;


  /**
   * Jika jumlah siswa = 0, database dianggap belum memiliki
   * data awal sehingga proses seed dijalankan.
   */
  if (!c) {

    /**
     * --------------------------------------------------------
     * SEED DATA SISWA
     * --------------------------------------------------------
     *
     * Format setiap data:
     * [nis, nama, kelas, jurusan]
     */
    const ss: S[] = [
      [
        '2401001',
        'Ahmad Fauzan',
        'XII RPL 1',
        'Rekayasa Perangkat Lunak'
      ],
      [
        '2401002',
        'Putri Andriani',
        'XII RPL 1',
        'Rekayasa Perangkat Lunak'
      ],
      [
        '2401003',
        'Rizky Pratama',
        'XII RPL 1',
        'Rekayasa Perangkat Lunak'
      ],
      [
        '2401004',
        'Siti Rahma',
        'XII RPL 2',
        'Rekayasa Perangkat Lunak'
      ],
      [
        '2401005',
        'Fajar Ramadhan',
        'XII RPL 2',
        'Rekayasa Perangkat Lunak'
      ]
    ];


    /**
     * Memasukkan seluruh data siswa ke tabel students.
     *
     * Tanda ? disebut parameter placeholder.
     * Nilainya akan digantikan oleh data dari array x.
     *
     * Operator ...x disebut spread operator.
     */
    ss.forEach((x) =>
      db.runSync(
        'INSERT INTO students(nis,name,class_name,major) VALUES(?,?,?,?)',
        ...x
      )
    );


    /**
     * --------------------------------------------------------
     * SEED DATA MATA PELAJARAN
     * --------------------------------------------------------
     *
     * Format setiap data:
     * [kode, nama mata pelajaran, guru/dosen]
     */
    const mm: M[] = [
      [
        'MP-01',
        'Pemrograman Mobile',
        'Amrizal, S.Kom., M.Kom.'
      ],
      [
        'BD-01',
        'Basis Data',
        'Dr. Hendra'
      ],
      [
        'PW-01',
        'Pemrograman Web',
        'Putri Andriani, M.Kom.'
      ],
      [
        'JK-01',
        'Jaringan Komputer',
        'Ahmad Fauzan, M.Kom.'
      ]
    ];


    /**
     * Memasukkan seluruh data mata pelajaran
     * ke dalam tabel subjects.
     */
    mm.forEach((x) =>
      db.runSync(
        'INSERT INTO subjects(code,name,teacher) VALUES(?,?,?)',
        ...x
      )
    );


    /**
     * --------------------------------------------------------
     * SEED DATA NILAI
     * --------------------------------------------------------
     *
     * Format data:
     *
     * [
     *   student_id,
     *   subject_id,
     *   nilai tugas,
     *   nilai UTS,
     *   nilai UAS
     * ]
     *
     * Nilai akhir dan grade tidak ditulis secara manual.
     * Keduanya dihitung otomatis menggunakan:
     *
     * calculateFinal()
     * getGrade()
     */
    const nn: N[] = [
      [1, 1, 88, 82, 90],
      [1, 2, 78, 80, 84],
      [2, 1, 92, 88, 94],
      [2, 3, 80, 76, 82],
      [3, 2, 68, 72, 70],
      [4, 4, 86, 84, 88],
      [5, 3, 60, 64, 66]
    ];


    /**
     * --------------------------------------------------------
     * MENGOLAH DAN MENYIMPAN NILAI
     * --------------------------------------------------------
     *
     * Array destructuring:
     *
     * [s, m, t, u, a]
     *
     * s = student_id
     * m = subject_id
     * t = nilai tugas
     * u = nilai UTS
     * a = nilai UAS
     */
    nn.forEach(([s, m, t, u, a]) => {

      /**
       * Menghitung nilai akhir berdasarkan nilai:
       * - tugas,
       * - UTS,
       * - UAS.
       *
       * Rumus perhitungan berada pada fungsi calculateFinal()
       * di file utils/grade.
       */
      const f = calculateFinal(
        t,
        u,
        a
      );


      /**
       * Menyimpan data nilai ke tabel scores.
       *
       * getGrade(f) digunakan untuk menentukan grade berdasarkan
       * nilai akhir yang sudah dihitung.
       */
      db.runSync(
        'INSERT INTO scores(student_id,subject_id,assignment,midterm,final_exam,final_score,grade) VALUES(?,?,?,?,?,?,?)',
        s,
        m,
        t,
        u,
        a,
        f,
        getGrade(f)
      );
    });
  }
}
