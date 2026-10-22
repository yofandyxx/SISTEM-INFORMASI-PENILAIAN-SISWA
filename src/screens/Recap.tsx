/**
 
 * Informasi yang ditampilkan:
 * 1. Jumlah seluruh siswa.
 * 2. Rata-rata seluruh nilai.
 * 3. Jumlah siswa dengan rata-rata >= 65.
 * 4. Ranking siswa berdasarkan rata-rata nilai.
 * 5. Jumlah mata pelajaran yang sudah dinilai.
 * 6. Grade rata-rata setiap siswa.
 * 7. Filter siswa berdasarkan Grade A, B, C, D, dan E.
 *
 * Konsep penting yang dipelajari:
 * - React useState()
 * - SQLite LEFT JOIN
 * - COUNT()
 * - AVG()
 * - COALESCE()
 * - GROUP BY
 * - ORDER BY
 * - Array filter()
 * - Array map()
 * - Array findIndex()
 * - Conditional Rendering
 * - Perhitungan grade
 * - Ranking data
 * ============================================================
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../database/db';
import { Card, C, Header } from '../components/UI';


/**
 * ============================================================
 * TYPE DATA REKAP
 * ============================================================
 *
 * Type R menentukan bentuk data hasil query rekap siswa.
 *
 * Properti:
 * - id    : ID siswa.
 * - name  : Nama siswa.
 * - nis   : Nomor Induk Siswa.
 * - total : Jumlah mata pelajaran yang sudah memiliki nilai.
 * - avg   : Nilai rata-rata siswa.
 */
type R = {
  id: number;
  name: string;
  nis: string;
  total: number;
  avg: number;
};


/**
 * ============================================================
 * HALAMAN REKAP & ANALITIK
 * ============================================================
 *
 * Halaman ini mengambil data siswa dan nilai dari SQLite,
 * kemudian membentuk informasi statistik dan ranking.
 */
export default function Recap() {

  /**
   * grade menyimpan pilihan filter grade.
   *
   * Nilai awal "SEMUA" berarti seluruh siswa ditampilkan.
   */
  const [grade, setGrade] = useState('SEMUA');


  /**
   * ==========================================================
   * QUERY REKAP NILAI SETIAP SISWA
   * ==========================================================
   *
   * Query menggabungkan tabel:
   *
   * students
   *    |
   *    | LEFT JOIN
   *    ↓
   * scores
   *
   * LEFT JOIN digunakan agar siswa yang belum mempunyai nilai
   * tetap muncul dalam hasil query.
   *
   * COUNT(sc.id)
   * menghitung jumlah data nilai/mata pelajaran siswa.
   *
   * AVG(sc.final_score)
   * menghitung rata-rata nilai akhir siswa.
   *
   * COALESCE(..., 0)
   * membuat rata-rata menjadi 0 jika siswa belum memiliki nilai.
   *
   * GROUP BY st.id
   * mengelompokkan hasil berdasarkan siswa.
   *
   * ORDER BY avg DESC
   * mengurutkan siswa dari rata-rata tertinggi ke terendah.
   */
  const all = db.getAllSync<R>(`
    SELECT
      st.id,
      st.name,
      st.nis,
      COUNT(sc.id) total,
      COALESCE(AVG(sc.final_score), 0) avg
    FROM students st
    LEFT JOIN scores sc
      ON sc.student_id = st.id
    GROUP BY st.id
    ORDER BY avg DESC
  `);


  /**
   * ==========================================================
   * FILTER BERDASARKAN GRADE
   * ==========================================================
   *
   * Jika filter = SEMUA:
   * seluruh data ditampilkan.
   *
   * Jika filter = A/B/C/D/E:
   * hanya siswa dengan grade rata-rata tersebut yang ditampilkan.
   *
   * Penting:
   * filter() hanya menyaring data pada tampilan.
   * Data asli di SQLite tidak mengalami perubahan.
   */
  const rows =
    grade === 'SEMUA'
      ? all
      : all.filter(
          (r) => g(Number(r.avg)) === grade
        );


  /**
   * ==========================================================
   * RATA-RATA KESELURUHAN
   * ==========================================================
   *
   * Query menghitung rata-rata seluruh final_score
   * yang tersimpan pada tabel scores.
   *
   * COALESCE() memastikan hasil menjadi 0 jika tabel scores
   * belum mempunyai data.
   */
  const overall = db.getFirstSync<{
    a: number;
  }>(
    'SELECT COALESCE(AVG(final_score),0) a FROM scores'
  )?.a ?? 0;


  /**
   * ==========================================================
   * TAMPILAN REKAP & ANALITIK
   * ==========================================================
   */
  return (
    <>
      {/* Header halaman */}
      <Header
        title="Rekap & Analitik"
        subtitle="Ranking • rata-rata • filter grade"
      />


      {/* =====================================================
          RINGKASAN STATISTIK
          ===================================================== */}
      <View style={s.summary}>

        {/* Jumlah seluruh siswa */}
        <View style={s.box}>
          <Text style={s.big}>
            {all.length}
          </Text>

          <Text style={s.small}>
            Siswa
          </Text>
        </View>


        {/* Rata-rata seluruh nilai */}
        <View style={s.box}>
          <Text style={s.big}>
            {Number(overall).toFixed(1)}
          </Text>

          <Text style={s.small}>
            Rata-rata
          </Text>
        </View>


        {/**
         * Jumlah siswa dengan rata-rata >= 65.
         *
         * filter() membuat array baru yang hanya berisi siswa
         * dengan nilai rata-rata minimal 65.
         *
         * length menghitung jumlah siswa hasil filter.
         */}
        <View style={s.box}>
          <Text style={s.big}>
            {
              all.filter(
                (x) => Number(x.avg) >= 65
              ).length
            }
          </Text>

          <Text style={s.small}>
            ≥ 65
          </Text>
        </View>

      </View>


      {/* =====================================================
          FILTER GRADE
          ===================================================== */}
      <Text style={s.filterTitle}>
        Filter berdasarkan grade rata-rata
      </Text>


      <View style={s.filters}>

        {/**
         * Daftar filter dibuat dari array agar tombol tidak
         * perlu ditulis satu per satu.
         */}
        {[
          'SEMUA',
          'A',
          'B',
          'C',
          'D',
          'E'
        ].map((x) => (
          <TouchableOpacity
            key={x}
            style={[
              s.chip,
              grade === x && s.active
            ]}
            onPress={() => setGrade(x)}
          >
            <Text
              style={[
                s.chipText,
                grade === x && s.white
              ]}
            >
              {x}
            </Text>
          </TouchableOpacity>
        ))}

      </View>


      {/* =====================================================
          DAFTAR RANKING SISWA
          =====================================================

          rows.map() digunakan untuk menampilkan siswa sesuai
          filter grade yang sedang aktif.
      */}
      {rows.map((r, i) => (
        <Card key={r.id}>
          <View style={s.row}>

            {/* =================================================
                NOMOR RANKING
                =================================================

                findIndex() mencari posisi siswa pada array all.

                Ranking tetap menggunakan posisi pada data
                keseluruhan, bukan posisi setelah difilter.

                Contoh:
                Jika siswa ranking #3 mempunyai Grade B,
                ketika filter B dipilih siswa tetap tampil #3.
            */}
            <View style={s.rank}>
              <Text style={s.rankText}>
                #
                {
                  all.findIndex(
                    (x) => x.id === r.id
                  ) + 1
                }
              </Text>
            </View>


            {/* Informasi siswa */}
            <View style={{ flex: 1 }}>

              {/* Nama siswa */}
              <Text style={s.name}>
                {r.name}
              </Text>


              {/* NIS dan jumlah mata pelajaran yang dinilai */}
              <Text style={s.meta}>
                {r.nis} • {r.total} mapel dinilai
              </Text>


              {/* Grade berdasarkan nilai rata-rata */}
              <Text style={s.grade}>
                Grade rata-rata: {g(Number(r.avg))}
              </Text>

            </View>


            {/* Nilai rata-rata siswa */}
            <Text style={s.avg}>
              {Number(r.avg).toFixed(1)}
            </Text>

          </View>
        </Card>
      ))}


      {/* =====================================================
          KONDISI DATA KOSONG
          =====================================================

          Pesan hanya ditampilkan jika tidak ada siswa yang
          sesuai dengan filter grade yang dipilih.
      */}
      {rows.length === 0 && (
        <Text style={s.empty}>
          Tidak ada data untuk filter {grade}.
        </Text>
      )}
    </>
  );
}


/**
 * ============================================================
 * FUNGSI KONVERSI NILAI MENJADI GRADE
 * ============================================================
 *
 * Fungsi g() menerima nilai rata-rata siswa kemudian
 * mengubahnya menjadi Grade A, B, C, D, atau E.
 *
 * Aturan:
 *
 * Nilai >= 85 -> A
 * Nilai >= 75 -> B
 * Nilai >= 65 -> C
 * Nilai >= 55 -> D
 * Nilai <  55 -> E
 *
 * Operator ternary digunakan untuk membuat kondisi secara
 * ringkas tanpa mengubah logika penentuan grade.
 */
const g = (n: number) =>
  n >= 85
    ? 'A'
    : n >= 75
      ? 'B'
      : n >= 65
        ? 'C'
        : n >= 55
          ? 'D'
          : 'E';


/**
 * ============================================================
 * STYLE
 * ============================================================
 *
 * StyleSheet.create() digunakan untuk mengelompokkan seluruh
 * pengaturan tampilan halaman Rekap & Analitik.
 */
const s = StyleSheet.create({

  /**
   * Container tiga kartu statistik.
   */
  summary: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },


  /**
   * Kartu statistik.
   *
   * flex: 1 membuat ketiga kartu menggunakan lebar
   * yang proporsional.
   */
  box: {
    flex: 1,
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: C.cyan
  },


  // Angka utama pada kartu statistik.
  big: {
    fontSize: 21,
    fontWeight: '900',
    color: C.navy
  },


  // Label pada kartu statistik.
  small: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700'
  },


  // Judul bagian filter.
  filterTitle: {
    fontWeight: '800',
    color: C.navy,
    marginBottom: 8
  },


  /**
   * Container tombol filter.
   *
   * flexWrap memungkinkan tombol turun ke baris berikutnya
   * apabila lebar layar tidak mencukupi.
   */
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14
  },


  // Tombol filter dalam kondisi normal.
  chip: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },


  // Tombol filter yang sedang aktif.
  active: {
    backgroundColor: C.violet
  },


  // Teks tombol filter normal.
  chipText: {
    fontWeight: '800',
    color: C.muted
  },


  // Teks putih ketika filter aktif.
  white: {
    color: 'white'
  },


  // Layout satu baris data ranking siswa.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },


  // Container nomor ranking.
  rank: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center'
  },


  // Teks nomor ranking.
  rankText: {
    fontWeight: '900',
    color: C.violet
  },


  // Nama siswa.
  name: {
    fontWeight: '900',
    color: C.navy
  },


  // NIS dan jumlah mata pelajaran yang dinilai.
  meta: {
    color: C.muted,
    marginTop: 3,
    fontSize: 12
  },


  // Grade rata-rata siswa.
  grade: {
    color: C.cyan,
    fontWeight: '800',
    marginTop: 5,
    fontSize: 12
  },


  // Nilai rata-rata pada sisi kanan Card.
  avg: {
    fontSize: 22,
    fontWeight: '900',
    color: C.violet
  },


  // Pesan ketika hasil filter kosong.
  empty: {
    textAlign: 'center',
    color: C.muted,
    padding: 25
  }
});
