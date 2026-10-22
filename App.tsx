

import React, { useEffect, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';

import { Ionicons } from '@expo/vector-icons';

import { initDatabase } from './src/database/db';

import Dashboard from './src/screens/Dashboard';

import {
  Students,
  Subjects,
} from './src/screens/Masters';

import Scores from './src/screens/Scores';

import Recap from './src/screens/Recap';

import { Screen } from './src/types';


/**
 * ============================================================
 * DAFTAR BOTTOM NAVIGATION
 * ============================================================
 *
 * Format:
 *
 * [
 *   nama screen,
 *   nama icon,
 *   label menu
 * ]
 */

const tabs: [Screen, any, string][] = [
  [
    'dashboard',
    'home-outline',
    'Beranda',
  ],

  [
    'students',
    'people-outline',
    'Siswa',
  ],

  [
    'subjects',
    'book-outline',
    'Mapel',
  ],

  [
    'scores',
    'create-outline',
    'Nilai',
  ],

  [
    'recap',
    'stats-chart-outline',
    'Rekap',
  ],
];


/**
 * ============================================================
 * KOMPONEN UTAMA APLIKASI
 * ============================================================
 */

export default function App() {

  /**
   * ----------------------------------------------------------
   * STATE SCREEN
   * ----------------------------------------------------------
   *
   * Menyimpan halaman yang sedang aktif.
   *
   * Default:
   * dashboard
   */

  const [screen, setScreen] = useState<Screen>(
    'dashboard'
  );

  // Layar yang membaca SQLite tidak boleh dirender sebelum tabel
  // selesai dibuat dan data awal selesai dimasukkan.
  const [databaseReady, setDatabaseReady] = useState(false);


  /**
   * ----------------------------------------------------------
   * STATE REFRESH
   * ----------------------------------------------------------
   *
   * rev digunakan untuk memicu render ulang setelah
   * terjadi perubahan data SQLite.
   */

  const [rev, setRev] = useState(0);


  /**
   * ----------------------------------------------------------
   * INISIALISASI DATABASE
   * ----------------------------------------------------------
   *
   * Dijalankan satu kali ketika aplikasi pertama dibuka.
   */

  useEffect(
    () => {
      initDatabase();
      setDatabaseReady(true);
    },
    []
  );


  /**
   * ----------------------------------------------------------
   * FUNGSI REFRESH
   * ----------------------------------------------------------
   *
   * Dipanggil setelah:
   *
   * INSERT
   * UPDATE
   * DELETE
   *
   * Perubahan rev menyebabkan komponen yang terkait
   * membaca kembali data terbaru dari SQLite.
   */

  const refresh = () => {
    setRev(
      (value) => value + 1
    );
  };


  /**
   * ----------------------------------------------------------
   * MENENTUKAN SCREEN YANG DITAMPILKAN
   * ----------------------------------------------------------
   */

  let body = !databaseReady
    ? (
        <View style={s.loading}>
          <Text style={s.loadingText}>Menyiapkan database...</Text>
        </View>
      )
    :

    screen === 'dashboard'
      ? (
          <Dashboard
            key={rev}
          />
        )

      : screen === 'students'
        ? (
            <Students
              refresh={refresh}
            />
          )

        : screen === 'subjects'
          ? (
              <Subjects
                refresh={refresh}
              />
            )

          : screen === 'scores'
            ? (
                <Scores
                  refresh={refresh}
                />
              )

            : (
                <Recap
                  key={rev}
                />
              );


  /**
   * ==========================================================
   * TAMPILAN UTAMA
   * ==========================================================
   */

  return (

    <SafeAreaProvider>

      <SafeAreaView
        style={s.safe}
        edges={[
          'top',
          'left',
          'right',
        ]}
      >

        {/*
         * Status bar menggunakan icon gelap karena
         * area bagian atas aplikasi berwarna terang.
         */}

        <StatusBar
          style="dark"
        />


        {/*
         * =====================================================
         * AREA KONTEN
         * =====================================================
         *
         * ScrollView memungkinkan halaman digulir jika
         * konten lebih panjang daripada layar HP.
         */}

        <ScrollView
          style={s.page}
          contentContainerStyle={s.content}
        >

          {body}

        </ScrollView>


        {/*
         * =====================================================
         * BOTTOM NAVIGATION
         * =====================================================
         *
         * PERUBAHAN DESAIN:
         *
         * - Background menggunakan navy gelap.
         * - Icon tidak aktif menggunakan warna terang.
         * - Icon aktif menggunakan ungu muda.
         * - Menu aktif mempunyai background transparan ungu.
         * - Kontras lebih tinggi agar mudah dilihat.
         */}

        <View style={s.nav}>

          {tabs.map(
            ([key, icon, label]) => {

              /**
               * Menentukan apakah tab ini
               * merupakan halaman aktif.
               */

              const isActive =
                screen === key;


              return (

                <TouchableOpacity
                  key={key}

                  style={[
                    s.tab,

                    isActive &&
                      s.tabActive,
                  ]}

                  activeOpacity={0.75}

                  onPress={() => {
                    setScreen(key);
                  }}
                >

                  {/*
                   * Icon menu.
                   *
                   * Aktif:
                   * #ddd6fe
                   *
                   * Tidak aktif:
                   * #e2e8f0
                   */}

                  <Ionicons
                    name={icon}
                    size={
                      isActive
                        ? 24
                        : 22
                    }
                    color={
                      isActive
                        ? '#ddd6fe'
                        : '#e2e8f0'
                    }
                  />


                  {/*
                   * Label menu.
                   */}

                  <Text
                    style={[
                      s.tabText,

                      isActive &&
                        s.active,
                    ]}
                  >

                    {label}

                  </Text>


                  {/*
                   * Garis indikator kecil di bawah
                   * menu yang sedang aktif.
                   */}

                  {isActive && (

                    <View
                      style={s.activeIndicator}
                    />

                  )}

                </TouchableOpacity>

              );
            }
          )}

        </View>

      </SafeAreaView>

    </SafeAreaProvider>

  );
}


/**
 * ============================================================
 * STYLE UTAMA APLIKASI
 * ============================================================
 */

const s = StyleSheet.create({

  /**
   * ----------------------------------------------------------
   * SAFE AREA
   * ----------------------------------------------------------
   */

  safe: {
    flex: 1,

    backgroundColor:
      '#f1f5f9',
  },


  /**
   * ----------------------------------------------------------
   * AREA HALAMAN
   * ----------------------------------------------------------
   */

  page: {
    flex: 1,
  },


  /**
   * ----------------------------------------------------------
   * AREA KONTEN
   * ----------------------------------------------------------
   */

  content: {
    padding: 16,

    /**
     * Memberikan ruang sebelum
     * Bottom Navigation.
     */
    paddingBottom: 24,
  },

  loading: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#475569',
    fontWeight: '700',
  },


  /**
   * ==========================================================
   * BOTTOM NAVIGATION
   * ==========================================================
   *
   * Background dibuat navy gelap agar menu bawah
   * mempunyai kontras tinggi.
   */

  nav: {

    flexDirection:
      'row',

    alignItems:
      'center',

    /**
     * Navy gelap.
     */
    backgroundColor:
      '#172554',

    /**
     * Garis pemisah dengan area konten.
     */
    borderTopWidth:
      1,

    borderTopColor:
      '#1e3a8a',

    /**
     * Ruang atas dan bawah navigation.
     */
    paddingTop:
      8,

    paddingBottom:
      8,

    paddingHorizontal:
      6,


    /**
     * Shadow untuk iOS.
     */
    shadowColor:
      '#000',

    shadowOffset: {
      width: 0,
      height: -3,
    },

    shadowOpacity:
      0.18,

    shadowRadius:
      6,


    /**
     * Shadow/elevation Android.
     */
    elevation:
      12,
  },


  /**
   * ----------------------------------------------------------
   * TAB MENU
   * ----------------------------------------------------------
   *
   * flex: 1 membuat lima menu mempunyai
   * lebar yang sama.
   */

  tab: {

    flex:
      1,

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingVertical:
      5,

    marginHorizontal:
      2,

    borderRadius:
      12,

    minHeight:
      52,
  },


  /**
   * ----------------------------------------------------------
   * TAB AKTIF
   * ----------------------------------------------------------
   *
   * Background transparan ungu membuat menu aktif
   * lebih mudah dikenali.
   */

  tabActive: {

    backgroundColor:
      'rgba(124, 58, 237, 0.25)',
  },


  /**
   * ----------------------------------------------------------
   * LABEL MENU
   * ----------------------------------------------------------
   */

  tabText: {

    fontSize:
      10,

    /**
     * Abu-putih terang.
     */
    color:
      '#cbd5e1',

    marginTop:
      3,

    fontWeight:
      '700',
  },


  /**
   * ----------------------------------------------------------
   * LABEL MENU AKTIF
   * ----------------------------------------------------------
   */

  active: {

    /**
     * Ungu sangat terang.
     */
    color:
      '#ddd6fe',

    fontWeight:
      '800',
  },


  /**
   * ----------------------------------------------------------
   * INDIKATOR MENU AKTIF
   * ----------------------------------------------------------
   *
   * Garis kecil di bawah label.
   */

  activeIndicator: {

    width:
      22,

    height:
      3,

    borderRadius:
      2,

    backgroundColor:
      '#a78bfa',

    marginTop:
      4,
  },

});
