/**
 
 * Informasi yang ditampilkan:
 * 1. Jumlah siswa.
 * 2. Jumlah mata pelajaran.
 * 3. Jumlah data nilai.
 * 4. Rata-rata seluruh nilai akhir.
 * 5. Distribusi Grade A, B, C, D, dan E.
 * 6. Siswa dengan rata-rata nilai tertinggi.
 *
 * Konsep penting yang dipelajari:
 * - Query SQLite
 * - COUNT()
 * - AVG()
 * - COALESCE()
 * - JOIN
 * - GROUP BY
 * - ORDER BY
 * - Array map()
 * - Array find()
 * - Rendering data dinamis pada React Native
 * - Perhitungan persentase untuk grafik sederhana
 * ============================================================
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/db';
import { Card, C, Header } from '../components/UI';


/**
 * ============================================================
 * DASHBOARD
 * ============================================================
 *
 * Komponen Dashboard membaca data langsung dari SQLite kemudian
 * mengolahnya menjadi informasi ringkas untuk pengguna.
 */
export default function Dashboard() {

  /**
   * ----------------------------------------------------------
   * 1. MENGHITUNG JUMLAH SISWA
   * ----------------------------------------------------------
   *
   * COUNT(*) digunakan untuk menghitung seluruh record
   * yang terdapat pada tabel students.
   *
   * Jika query tidak menghasilkan nilai, maka digunakan 0.
   */
  const st = db.getFirstSync<{
    n: number;
  }>(
    'SELECT COUNT(*) n FROM students'
  )?.n ?? 0;


  /**
   * ----------------------------------------------------------
   * 2. MENGHITUNG JUMLAH MATA PELAJARAN
   * ----------------------------------------------------------
   *
   * Query menghitung seluruh record pada tabel subjects.
   */
  const su = db.getFirstSync<{
    n: number;
  }>(
    'SELECT COUNT(*) n FROM subjects'
  )?.n ?? 0;


  /**
   * ----------------------------------------------------------
   * 3. STATISTIK DATA NILAI
   * ----------------------------------------------------------
   *
   * Query menghasilkan dua informasi sekaligus:
   *
   * n = jumlah seluruh data nilai
   * a = rata-rata nilai akhir
   *
   * COALESCE() digunakan agar AVG(final_score) menghasilkan
   * nilai 0 apabila tabel scores belum memiliki data.
   */
  const sc = db.getFirstSync<{
    n: number;
    a: number;
  }>(
    'SELECT COUNT(*) n,COALESCE(AVG(final_score),0) a FROM scores'
  );


  /**
   * ----------------------------------------------------------
   * 4. MENCARI SISWA DENGAN RATA-RATA TERTINGGI
   * ----------------------------------------------------------
   *
   * Query menggunakan JOIN untuk menghubungkan:
   *
   * students.id
   *      ↓
   * scores.student_id
   *
   * AVG(sc.final_score)
   * menghitung rata-rata nilai setiap siswa.
   *
   * GROUP BY
   * mengelompokkan data berdasarkan siswa.
   *
   * ORDER BY avg DESC
   * mengurutkan rata-rata dari terbesar ke terkecil.
   *
   * LIMIT 1
   * mengambil hanya siswa dengan rata-rata tertinggi.
   */
  const best = db.getFirstSync<{
    name: string;
    avg: number;
  }>(`
    SELECT
      st.name,
      AVG(sc.final_score) avg
    FROM students st
    JOIN scores sc
      ON sc.student_id = st.id
    GROUP BY st.id
    ORDER BY avg DESC
    LIMIT 1
  `);


  /**
   * ----------------------------------------------------------
   * 5. DISTRIBUSI GRADE
   * ----------------------------------------------------------
   *
   * GROUP BY grade digunakan untuk mengelompokkan data
   * berdasarkan grade.
   *
   * Contoh hasil:
   *
   * A -> 3 siswa
   * B -> 2 siswa
   * C -> 1 siswa
   *
   * Data ini digunakan untuk membuat grafik distribusi grade.
   */
  const gs = db.getAllSync<{
    grade: string;
    n: number;
  }>(
    'SELECT grade,COUNT(*) n FROM scores GROUP BY grade'
  );


  /**
   * ----------------------------------------------------------
   * TOTAL DATA NILAI
   * ----------------------------------------------------------
   *
   * Total digunakan sebagai pembagi ketika menghitung panjang
   * grafik distribusi grade.
   *
   * Nilai default 1 digunakan agar tidak terjadi pembagian
   * dengan angka 0 ketika tabel scores masih kosong.
   */
  const total = sc?.n || 1;


  /**
   * ----------------------------------------------------------
   * DATA KARTU STATISTIK
   * ----------------------------------------------------------
   *
   * Array stats digunakan agar empat kartu statistik dapat
   * ditampilkan menggunakan satu pola map().
   *
   * Struktur setiap item:
   *
   * [
   *   nama ikon,
   *   label,
   *   nilai,
   *   warna
   * ]
   */
  const stats = [
    [
      'people',
      'Siswa',
      st,
      C.blue
    ],
    [
      'book',
      'Mapel',
      su,
      C.violet
    ],
    [
      'clipboard',
      'Data Nilai',
      sc?.n ?? 0,
      C.orange
    ],
    [
      'analytics',
      'Rata-rata',
      Number(sc?.a ?? 0).toFixed(1),
      C.cyan
    ]
  ] as const;


  /**
   * ==========================================================
   * TAMPILAN DASHBOARD
   * ==========================================================
   */
  return (
    <>
      {/* Header halaman Dashboard */}
      <Header
        title="Dashboard Penilaian"
        subtitle="Relational Database • Calculation • Academic Insight"
      />


      {/* =====================================================
          KARTU STATISTIK
          =====================================================

          stats.map() membaca setiap data pada array stats,
          kemudian membuat satu kartu statistik untuk setiap item.
      */}
      <View style={s.grid}>
        {stats.map(([i, l, n, c]) => (
          <View
            key={l}
            style={[
              s.stat,
              {
                borderTopColor: c
              }
            ]}
          >
            {/* Ikon statistik dibuat dinamis berdasarkan data i */}
            <Ionicons
              name={`${i}-outline` as any}
              size={23}
              color={c}
            />

            {/* Nilai statistik */}
            <Text style={s.num}>
              {n}
            </Text>

            {/* Label statistik */}
            <Text style={s.lbl}>
              {l}
            </Text>
          </View>
        ))}
      </View>


      {/* =====================================================
          DISTRIBUSI GRADE
          ===================================================== */}
      <Card>
        <Text style={s.h}>
          Distribusi Grade
        </Text>

        {/*
         * Grade dibuat tetap dari A sampai E agar semua kategori
         * tetap dapat ditampilkan walaupun suatu grade belum
         * mempunyai data.
         */}
        {['A', 'B', 'C', 'D', 'E'].map((g) => {

          /**
           * find() mencari jumlah data untuk grade yang sedang
           * diproses.
           *
           * Jika grade tidak ditemukan pada hasil query,
           * jumlahnya dianggap 0.
           */
          const n = gs.find(
            (x) => x.grade === g
          )?.n ?? 0;


          return (
            <View
              key={g}
              style={s.barRow}
            >
              {/* Nama grade */}
              <Text style={s.grade}>
                {g}
              </Text>


              {/* Area latar belakang grafik */}
              <View style={s.track}>

                {/*
                 * Panjang grafik dihitung dengan rumus:
                 *
                 * jumlah grade / total data × 100%
                 *
                 * Contoh:
                 * Grade A = 3
                 * Total   = 10
                 *
                 * 3 / 10 × 100 = 30%
                 */}
                <View
                  style={[
                    s.bar,
                    {
                      width: `${n / total * 100}%`
                    }
                  ]}
                />
              </View>


              {/* Jumlah data pada masing-masing grade */}
              <Text style={s.count}>
                {n}
              </Text>
            </View>
          );
        })}
      </Card>


      {/* =====================================================
          SOROTAN AKADEMIK
          ===================================================== */}
      <Card>
        <Text style={s.h}>
          Sorotan Akademik
        </Text>

        {/* Nama siswa dengan rata-rata tertinggi */}
        <Text style={s.best}>
          🏆 {best?.name ?? '-'}
        </Text>

        {/* Nilai rata-rata tertinggi */}
        <Text style={s.note}>
          Rata-rata tertinggi:{' '}
          {Number(best?.avg ?? 0).toFixed(1)}
        </Text>

        {/* Informasi rumus perhitungan nilai akhir */}
        <Text style={s.note}>
          Rumus nilai akhir: Tugas 30% + UTS 30% + UAS 40%
        </Text>
      </Card>
    </>
  );
}


/**
 * ============================================================
 * STYLE DASHBOARD
 * ============================================================
 *
 * StyleSheet.create() digunakan untuk mengelompokkan seluruh
 * pengaturan tampilan Dashboard.
 */
const s = StyleSheet.create({

  /**
   * Container kartu statistik.
   *
   * flexWrap memungkinkan kartu berpindah ke baris berikutnya
   * ketika ruang horizontal tidak mencukupi.
   */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4
  },


  /**
   * Kartu statistik individual.
   *
   * width 48% membuat dua kartu dapat tampil dalam satu baris.
   */
  stat: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 15,
    borderTopWidth: 4,
    elevation: 2
  },


  // Angka utama pada kartu statistik.
  num: {
    fontSize: 25,
    fontWeight: '900',
    color: C.navy,
    marginTop: 7
  },


  // Label kartu statistik.
  lbl: {
    color: C.muted,
    fontWeight: '700'
  },


  // Judul bagian/card.
  h: {
    fontSize: 16,
    fontWeight: '900',
    color: C.navy,
    marginBottom: 12
  },


  // Satu baris grafik distribusi grade.
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 5
  },


  // Label Grade A, B, C, D, atau E.
  grade: {
    fontWeight: '900',
    width: 18
  },


  /**
   * Track merupakan background dari grafik.
   * Grafik sebenarnya (bar) berada di dalam track.
   */
  track: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    flex: 1,
    overflow: 'hidden'
  },


  // Grafik jumlah grade.
  bar: {
    height: 12,
    backgroundColor: C.violet,
    borderRadius: 8
  },


  // Jumlah data pada masing-masing grade.
  count: {
    width: 20,
    textAlign: 'right',
    fontWeight: '800'
  },


  // Nama siswa dengan nilai rata-rata tertinggi.
  best: {
    fontSize: 18,
    fontWeight: '900',
    color: C.violet
  },


  // Informasi tambahan pada Sorotan Akademik.
  note: {
    color: C.muted,
    marginTop: 6
  }
});
