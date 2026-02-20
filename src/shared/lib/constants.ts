export const QUESTIONS = [
  // A. PRODUKSI MINYAK (SEBUM LEVEL)
  {
    key: "q1_sebum_after_wash",
    label: "Bagaimana kondisi kulit wajah Anda 2–3 jam setelah mencuci muka tanpa skincare?", // [cite: 3]
    options: [
      "Terasa sangat kering atau tertarik", // [cite: 4]
      "Terasa nyaman dan tidak berminyak", // [cite: 5]
      "Sedikit berminyak di area hidung & dahi", // [cite: 6]
      "Mengilap dan berminyak di hampir seluruh wajah" // [cite: 7]
    ]
  },
  {
    key: "q2_sebum_morning",
    label: "Ketika bangun tidur, kulit wajah Anda biasanya terlihat…", // [cite: 9]
    options: [
      "Kusam, kering, atau bersisik", // [cite: 10]
      "Segar dan normal", // [cite: 11]
      "Berminyak hanya di area T (dahi, hidung, dagu)", // [cite: 12]
      "Sangat berminyak dan mengilap" // [cite: 13]
    ]
  },
  {
    key: "q3_sebum_blot",
    label: "Seberapa sering Anda merasa perlu menghapus minyak di wajah?", // [cite: 15]
    options: [
      "Hampir tidak pernah", // [cite: 16]
      "Kadang-kadang", // [cite: 17]
      "Sering di area tertentu saja", // [cite: 18]
      "Sangat sering di seluruh wajah" // [cite: 19]
    ]
  },

  // B. TINGKAT KELEMBAPAN & BARRIER KULIT
  {
    key: "q4_hydration_wash",
    label: "Setelah mencuci muka, kulit terasa…", // [cite: 23]
    options: [
      "Ketarik dan tidak nyaman", // [cite: 24]
      "Sedikit kering tapi cepat membaik", // [cite: 25]
      "Nyaman", // [cite: 26]
      "Berminyak" // [cite: 27]
    ]
  },
  {
    key: "q5_hydration_look",
    label: "Apakah kulit Anda terlihat…", // [cite: 29]
    options: [
      "Bersisik atau mudah mengelupas", // [cite: 30]
      "Terlihat kusam dan kurang segar", // [cite: 31]
      "Lembut dan halus", // [cite: 32]
      "Berminyak tapi tetap terasa kering" // [cite: 33]
    ]
  },

  // C. SENSITIVITAS & REAKSI KULIT
  {
    key: "q6_sensitivity_product",
    label: "Saat mencoba produk baru, kulit Anda biasanya…", // [cite: 36]
    options: [
      "Sering terasa perih, gatal, atau merah", // [cite: 37]
      "Kadang terasa tidak nyaman", // [cite: 38]
      "Hampir tidak pernah bereaksi", // [cite: 39]
      "Tidak pernah bermasalah" // [cite: 40]
    ]
  },
  {
    key: "q7_sensitivity_redness",
    label: "Kulit Anda sering terlihat kemerahan tanpa sebab jelas?", // [cite: 42]
    options: [
      "Sering", // [cite: 43]
      "Kadang", // [cite: 44]
      "Jarang", // [cite: 45]
      "Tidak pernah" // [cite: 46]
    ]
  },

  // D. JERAWAT & PORI
  {
    key: "q8_acne_frequency",
    label: "Seberapa sering Anda mengalami jerawat atau komedo?", // [cite: 49]
    options: [
      "Hampir tidak pernah", // [cite: 50]
      "Kadang saat hormon atau stres", // [cite: 51]
      "Cukup sering di area tertentu", // [cite: 52]
      "Sangat sering di banyak area" // [cite: 53]
    ]
  },
  {
    key: "q9_acne_pores",
    label: "Ukuran pori-pori di wajah Anda terlihat…", // [cite: 55]
    options: [
      "Hampir tidak terlihat", // [cite: 56]
      "Normal", // [cite: 57]
      "Besar di area tertentu", // [cite: 58]
      "Besar di hampir seluruh wajah" // [cite: 59]
    ]
  },

  // E. WARNA KULIT & BEKAS
  {
    key: "q10_pigmentation_scars",
    label: "Setelah jerawat sembuh, biasanya…", // [cite: 62]
    options: [
      "Tidak meninggalkan bekas", // [cite: 63]
      "Bekas hilang cepat", // [cite: 64]
      "Bekas gelap bertahan lama", // [cite: 65]
      "Sering muncul flek gelap" // [cite: 66]
    ]
  },

  // F. TANDA PENUAAN
  {
    key: "q11_aging_signs",
    label: "Garis halus atau kulit kendur mulai terlihat?", // [cite: 69]
    options: [
      "Tidak ada", // [cite: 70]
      "Sedikit", // [cite: 71]
      "Mulai terlihat jelas", // [cite: 72]
      "Cukup banyak" // [cite: 73]
    ]
  },

  // G. MASALAH KULIT
  {
    key: "q12_skin_concerns",
    label: "Apa saja masalah kulit yang sedang Anda alami? (Bisa pilih lebih dari satu)",
    multiple: true,
    options: [
      "Jerawat atau Beruntusan",
      "Komedo (Blackhead/Whitehead)",
      "Bekas Jerawat Kehitaman (PIH)",
      "Bekas Jerawat Kemerahan (PIE)",
      "Kusam atau Warna Kulit Tidak Merata",
      "Kemerahan atau Kulit Sensitif",
      "Garis Halus atau Kerutan",
      "Pori-pori Besar"
    ]
  }
] as const;
