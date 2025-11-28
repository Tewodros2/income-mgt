import {
    getDataGajiPegawai,
    getDataKehadiran,
    viewDataGajiPegawaiByYear
} from "./TransaksiController.js"

// Helper function to filter data by name (reduces duplicate code)
const filterDataByName = (data, name) => {
    const searchKeywords = name.toLowerCase().split(" ");
    return data.filter((item) => {
        const formattedName = item.nama_pegawai.toLowerCase();
        return searchKeywords.every((keyword) => formattedName.includes(keyword));
    });
};

// Helper function to filter gaji data by month and format it
const filterGajiByMonth = (data, month, includeYear = false) => {
    const filteredData = data.filter((item) => 
        item.bulan.toLowerCase() === month.toLowerCase()
    );
    
    return filteredData.map((item) => ({
        bulan: item.bulan,
        ...(includeYear && { tahun: item.tahun }),
        nama_pegawai: item.nama_pegawai,
        jabatan: includeYear ? item.jabatan : item.jabatan_pegawai,
        gaji_pokok: item.gaji_pokok,
        tj_transport: item.tj_transport,
        uang_makan: item.uang_makan,
        potongan: item.potongan,
        total_gaji: item.total
    }));
};

// Helper function to format absensi data
const formatAbsensiData = (data) => ({
    tahun: data.tahun || data.year,
    bulan: data.bulan,
    nik: data.nik,
    nama_pegawai: data.nama_pegawai,
    jabatan_pegawai: data.jabatan_pegawai,
    hadir: data.hadir,
    sakit: data.sakit,
    alpha: data.alpha
});

// method untuk melihat laporan gaji pegawai
export const viewLaporanGajiPegawai = async(req, res) => {
    try {
        const laporanGajiPegawai = await getDataGajiPegawai(req, res);
        res.status(200).json(laporanGajiPegawai);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// method untuk melihat laporan gaji pegawai berdasarkan bulan
export const viewLaporanGajiPegawaiByMonth = async (req, res) => {
    try {
        const { month } = req.params;
        const dataLaporanGajiByMonth = await getDataGajiPegawai(req, res);
        const formattedData = filterGajiByMonth(dataLaporanGajiByMonth, month, false);

        if (formattedData.length === 0) {
            res.status(404).json({ msg: 'Data tidak ditemukan' });
        } else {
            res.json(formattedData);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// method untuk melihat laporan gaji pegawai berdasarkan tahun
export const viewLaporanGajiPegawaiByYear = async (req, res) => {
    try {
         await viewDataGajiPegawaiByYear(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// method untuk melihat laporan gaji pegawai berdasarkan nama
export const viewLaporanGajiPegawaiByName = async (req, res) => {
    try {
        const dataGajiPegawai = await getDataGajiPegawai(req, res);
        const foundData = filterDataByName(dataGajiPegawai, req.params.name);

        if (foundData.length === 0) {
          res.status(404).json({ msg: "Data not found" });
        } else {
          res.json(foundData);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
      }
  };

// method untuk melihat laporan absensi pegawai berdasarkan bulan (menggunakan DROP DOWN)
export const viewLaporanAbsensiPegawaiByMonth = async (req, res) => {
    try {
        const dataAbsensiByMonth = await getDataKehadiran();
        const { month } = req.params;

        const dataAbsensi = dataAbsensiByMonth
            .filter((absensi) => absensi.bulan.toLowerCase() === month.toLowerCase())
            .map(formatAbsensiData);

        if (dataAbsensi.length === 0) {
            res.status(404).json({ msg: 'Data tidak ditemukan' });
        } else {
            res.json(dataAbsensi);
        }
    } catch (error) {
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};


// method untuk melihat laporan absensi pegawai berdasarkan tahun
export const viewLaporanAbsensiPegawaiByYear = async (req, res) => {
    try {
        const dataAbsensiByYear = await getDataKehadiran();
        const { year } = req.params;

        const dataAbsensi = dataAbsensiByYear
            .filter((absensi) => absensi.tahun.toString() === year.toString())
            .map(formatAbsensiData);

        if (dataAbsensi.length === 0) {
            res.status(404).json({ msg: 'Data tidak ditemukan' });
        } else {
            res.json(dataAbsensi);
        }
    } catch (error) {
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};



// method untuk melihat Slip Gaji Pegawai By Name (uses shared helper function)
export const viewSlipGajiByName = async (req, res) => {
    try {
        const dataGajiPegawai = await getDataGajiPegawai(req, res);
        const foundData = filterDataByName(dataGajiPegawai, req.params.name);

        if (foundData.length === 0) {
          res.status(404).json({ msg: "Data not found" });
        } else {
          res.json(foundData);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
      }
}

// method untuk melihat Slip Gaji Pegawai By Month (uses shared helper function)
export const viewSlipGajiByMonth = async (req, res) => {
    try {
        const { month } = req.params;
        const dataLaporanGajiByMonth = await getDataGajiPegawai(req, res);
        const formattedData = filterGajiByMonth(dataLaporanGajiByMonth, month, true);

        if (formattedData.length === 0) {
            res.status(404).json({ msg: `Data dengan bulan ${month} tidak ditemukan ` });
        } else {
            res.json(formattedData);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// method untuk melihat Slip Gaji Pegawai By Year
export const viewSlipGajiByYear = async (req, res) => {
    try {
        await viewDataGajiPegawaiByYear(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
