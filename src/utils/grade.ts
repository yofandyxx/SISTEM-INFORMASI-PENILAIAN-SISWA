/**
 
 * Rumus nilai akhir:
 *
 * Nilai Akhir =
 * (Tugas × 30%) +
 * (UTS   × 30%) +
 * (UAS   × 40%)
 *
 * Aturan Grade:
 *
 * A = nilai >= 85
 * B = nilai >= 75
 * C = nilai >= 65
 * D = nilai >= 55
 * E = nilai < 55
 *
 * Konsep penting yang dipelajari:
 * - Function
 * - Parameter
 * - Return Value
 * - Pure Function
 * - Weighted Calculation / Perhitungan Berbobot
 * - Number()
 * - toFixed()
 * - Arrow Function
 * - Operator Ternary
 * - Pemisahan Business Logic dari User Interface
 * ============================================================
 */


/**
 * ============================================================
 * FUNGSI calculateFinal()
 * ============================================================
 *
 * Fungsi ini digunakan untuk menghitung nilai akhir siswa
 * berdasarkan tiga komponen nilai:
 *
 * 1. assignment = Nilai Tugas
 * 2. midterm    = Nilai UTS
 * 3. finalExam  = Nilai UAS
 *
 * Bobot masing-masing:
 *
 * Tugas = 30%
 * UTS   = 30%
 * UAS   = 40%
 *
 * Total bobot:
 *
 * 30% + 30% + 40% = 100%
 *
 * Fungsi ini merupakan PURE FUNCTION karena:
 *
 * - Hasil hanya ditentukan oleh parameter yang diberikan.
 * - Tidak membaca atau mengubah state aplikasi.
 * - Tidak mengubah database.
 * - Tidak mempunyai efek samping (side effect).
 *
 * Contoh:
 *
 * calculateFinal(80, 70, 90)
 *
 * Perhitungan:
 *
 * Tugas = 80 × 30% = 24
 * UTS   = 70 × 30% = 21
 * UAS   = 90 × 40% = 36
 *
 * Nilai Akhir:
 *
 * 24 + 21 + 36 = 81
 *
 * Hasil:
 *
 * 81.00
 */
export const calculateFinal = (
  assignment: number,
  midterm: number,
  finalExam: number
) =>
  Number(
    (
      assignment * 0.30 +
      midterm * 0.30 +
      finalExam * 0.40
    ).toFixed(2)
  );


/**
 * ============================================================
 * FUNGSI getGrade()
 * ============================================================
 *
 * Fungsi ini digunakan untuk mengubah nilai akhir menjadi
 * Grade A, B, C, D, atau E.
 *
 * Parameter:
 *
 * score = nilai akhir siswa.
 *
 * Aturan:
 *
 * score >= 85 -> A
 * score >= 75 -> B
 * score >= 65 -> C
 * score >= 55 -> D
 * score <  55 -> E
 *
 * Contoh:
 *
 * getGrade(90) -> 'A'
 * getGrade(80) -> 'B'
 * getGrade(70) -> 'C'
 * getGrade(60) -> 'D'
 * getGrade(50) -> 'E'
 *
 * Operator ternary digunakan untuk membuat percabangan
 * kondisi secara ringkas.
 *
 * Bentuk dasar operator ternary:
 *
 * kondisi ? nilaiJikaBenar : nilaiJikaSalah
 */
export const getGrade = (
  score: number
) =>
  score >= 85
    ? 'A'
    : score >= 75
      ? 'B'
      : score >= 65
        ? 'C'
        : score >= 55
          ? 'D'
          : 'E';
