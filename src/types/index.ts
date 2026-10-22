/**
 
 * 
 * Type yang tersedia:
 * 1. Student -> Struktur data siswa.
 * 2. Subject -> Struktur data mata pelajaran.
 * 3. Score   -> Struktur data nilai siswa.
 * 4. Screen  -> Daftar halaman yang tersedia pada aplikasi.
 *
 * Konsep penting yang dipelajari:
 * - TypeScript Type
 * - Strong Typing
 * - Konsistensi struktur data
 * - Optional Property (?)
 * - Union Type
 * - Mapping struktur tabel SQLite ke TypeScript
 *
 * Manfaat penggunaan TypeScript:
 * - Mengurangi kesalahan tipe data.
 * - Membantu autocomplete pada editor.
 * - Memastikan hasil query mempunyai struktur yang konsisten.
 * - Membuat kode lebih mudah dibaca dan dipelihara.
 * ============================================================
 */


/**
 * ============================================================
 * TYPE STUDENT
 * ============================================================
 *
 * Type Student menggambarkan struktur satu data siswa.
 *
 * Struktur ini sesuai dengan field pada tabel:
 *
 * students
 *
 * +------------+---------+
 * | Field      | Type    |
 * +------------+---------+
 * | id         | number  |
 * | nis        | string  |
 * | name       | string  |
 * | class_name | string  |
 * | major      | string  |
 * +------------+---------+
 *
 * Type ini digunakan ketika mengambil data siswa dari SQLite.
 *
 * Contoh penggunaan:
 *
 * db.getAllSync<Student>('SELECT * FROM students')
 */
export type Student = {

  // Primary Key siswa pada database.
  id: number;

  // Nomor Induk Siswa.
  nis: string;

  // Nama lengkap siswa.
  name: string;

  // Nama kelas siswa.
  class_name: string;

  // Jurusan siswa.
  major: string;
};


/**
 * ============================================================
 * TYPE SUBJECT
 * ============================================================
 *
 * Type Subject menggambarkan struktur data mata pelajaran.
 *
 * Struktur ini sesuai dengan tabel:
 *
 * subjects
 *
 * +---------+---------+
 * | Field   | Type    |
 * +---------+---------+
 * | id      | number  |
 * | code    | string  |
 * | name    | string  |
 * | teacher | string  |
 * +---------+---------+
 */
export type Subject = {

  // Primary Key mata pelajaran.
  id: number;

  // Kode unik mata pelajaran.
  code: string;

  // Nama mata pelajaran.
  name: string;

  // Nama guru/dosen pengampu.
  teacher: string;
};


/**
 * ============================================================
 * TYPE SCORE
 * ============================================================
 *
 * Type Score menggambarkan struktur data nilai siswa.
 *
 * Data utama berasal dari tabel:
 *
 * scores
 *
 * Relasi:
 *
 * students (1) --------< scores >-------- (1) subjects
 *
 * scores.student_id -> students.id
 * scores.subject_id -> subjects.id
 */
export type Score = {

  // Primary Key data nilai.
  id: number;

  /**
   * Foreign Key menuju tabel students.
   *
   * Digunakan untuk mengetahui siswa pemilik nilai.
   */
  student_id: number;

  /**
   * Foreign Key menuju tabel subjects.
   *
   * Digunakan untuk mengetahui mata pelajaran
   * dari data nilai.
   */
  subject_id: number;

  // Nilai tugas siswa.
  assignment: number;

  // Nilai UTS / ujian tengah semester.
  midterm: number;

  // Nilai UAS / ujian akhir semester.
  final_exam: number;

  /**
   * Nilai akhir hasil perhitungan dari:
   *
   * Tugas + UTS + UAS
   *
   * sesuai rumus yang digunakan aplikasi.
   */
  final_score: number;

  // Grade hasil konversi nilai akhir.
  grade: string;


  /**
   * ==========================================================
   * OPTIONAL PROPERTY
   * ==========================================================
   *
   * Tanda ? berarti property ini bersifat opsional.
   *
   * student_name tidak selalu tersedia pada tabel scores.
   * Property ini biasanya muncul dari hasil JOIN dengan
   * tabel students.
   *
   * Contoh query:
   *
   * SELECT
   *   sc.*,
   *   st.name student_name
   * FROM scores sc
   * JOIN students st
   *   ON st.id = sc.student_id
   */
  student_name?: string;


  /**
   * subject_name juga merupakan optional property.
   *
   * Nilainya biasanya diperoleh dari JOIN antara:
   *
   * scores.subject_id
   *
   * dengan:
   *
   * subjects.id
   */
  subject_name?: string;
};


/**
 * ============================================================
 * TYPE SCREEN
 * ============================================================
 *
 * Screen menggunakan konsep UNION TYPE pada TypeScript.
 *
 * Artinya nilai bertipe Screen HANYA boleh berisi salah satu
 * dari lima string berikut:
 *
 * - dashboard
 * - students
 * - subjects
 * - scores
 * - recap
 *
 * Contoh:
 *
 * const [screen, setScreen] = useState<Screen>('dashboard');
 *
 * BENAR:
 * setScreen('students');
 *
 * SALAH:
 * setScreen('login');
 *
 * Karena 'login' tidak terdaftar dalam union type Screen.
 *
 * Penggunaan union type membantu mencegah kesalahan penulisan
 * nama halaman pada sistem navigasi aplikasi.
 */
export type Screen =
  | 'dashboard'
  | 'students'
  | 'subjects'
  | 'scores'
  | 'recap';
