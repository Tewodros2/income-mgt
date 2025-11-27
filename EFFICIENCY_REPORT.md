# Code Efficiency Analysis Report

## Overview
This report identifies several efficiency issues in the income-mgt codebase that could be improved for better performance.

## Backend Issues

### 1. Sequential Database Queries in `getDataGajiPegawai` (HIGH IMPACT)
**File:** `Backend/controllers/TransaksiController.js` (lines 386-477)

**Problem:** The function makes 4 separate database calls sequentially:
```javascript
const resultDataPegawai = await getDataPegawai();
const resultDataJabatan = await getDataJabatan();
const resultDataKehadiran = await getDataKehadiran();
const resultDataPotongan = await getDataPotongan();
```

**Impact:** Each database call waits for the previous one to complete, significantly increasing response time.

**Solution:** Use `Promise.all()` to execute these independent queries in parallel:
```javascript
const [resultDataPegawai, resultDataJabatan, resultDataKehadiran, resultDataPotongan] = await Promise.all([
  getDataPegawai(),
  getDataJabatan(),
  getDataKehadiran(),
  getDataPotongan()
]);
```

### 2. Redundant Database Queries in `createDataKehadiran` (MEDIUM IMPACT)
**File:** `Backend/controllers/TransaksiController.js` (lines 88-155)

**Problem:** Makes 4 separate database queries, including two queries to the same table (DataPegawai):
- Query 1: `DataPegawai.findOne` for nama_pegawai
- Query 2: `DataJabatan.findOne` for nama_jabatan
- Query 3: `DataPegawai.findOne` for nik (duplicate table query)
- Query 4: `DataKehadiran.findOne` for nama_sudah_ada

**Solution:** 
- Combine the two DataPegawai queries into one
- Use `Promise.all()` for the remaining independent queries

### 3. Inefficient O(n*m) Filtering in `getDataGajiPegawai` (MEDIUM IMPACT)
**File:** `Backend/controllers/TransaksiController.js` (lines 392-411)

**Problem:** Uses nested `.filter()` and `.find()` operations:
```javascript
const gaji_pegawai = resultDataPegawai
  .filter((pegawai) =>
    resultDataJabatan.some(
      (jabatan) => jabatan.nama_jabatan === pegawai.jabatan_pegawai
    )
  )
  .map((pegawai) => {
    const jabatan = resultDataJabatan.find(
      (jabatan) => jabatan.nama_jabatan === pegawai.jabatan_pegawai
    );
    // ...
  });
```

**Impact:** O(n*m) complexity where n is employees and m is positions.

**Solution:** Create a Map/Object lookup for jabatan data first:
```javascript
const jabatanMap = new Map(resultDataJabatan.map(j => [j.nama_jabatan, j]));
const gaji_pegawai = resultDataPegawai
  .filter(pegawai => jabatanMap.has(pegawai.jabatan_pegawai))
  .map(pegawai => {
    const jabatan = jabatanMap.get(pegawai.jabatan_pegawai);
    // ...
  });
```

### 4. Duplicate Code in LaporanController.js (LOW IMPACT - Maintainability)
**File:** `Backend/controllers/LaporanController.js`

**Problem:** Nearly identical functions:
- `viewLaporanGajiPegawaiByName` (lines 64-85) and `viewSlipGajiByName` (lines 149-170)
- `viewLaporanGajiPegawaiByMonth` (lines 18-47) and `viewSlipGajiByMonth` (lines 173-203)

**Solution:** Extract common logic into shared helper functions.

### 5. Client-Side Filtering Instead of Database Queries (MEDIUM IMPACT)
**File:** `Backend/controllers/LaporanController.js`

**Problem:** Multiple functions fetch ALL data and filter in JavaScript:
```javascript
const dataLaporanGajiByMonth = await getDataGajiPegawai(req, res);
const filteredData = dataLaporanGajiByMonth.filter((data) => {
    return data.bulan.toLowerCase() === month.toLowerCase();
});
```

**Solution:** Add WHERE clauses to database queries to filter at the database level.

## Frontend Issues

### 6. Duplicate Pagination Logic (LOW IMPACT - Maintainability)
**Files:** 
- `Frontend/src/pages/Admin/MasterData/DataPegawai/index.jsx`
- `Frontend/src/pages/Admin/Transaksi/DataGaji/index.jsx`

**Problem:** The `paginationItems()` function is duplicated across multiple components.

**Solution:** Extract into a reusable custom hook or component.

### 7. Missing Memoization in DataGaji Component (LOW IMPACT)
**File:** `Frontend/src/pages/Admin/Transaksi/DataGaji/index.jsx` (lines 235-249)

**Problem:** Uses `.reduce()` to find unique entries on every render:
```javascript
filteredDataGaji.reduce((uniqueEntries, data) => {
    const isEntryExist = uniqueEntries.find(entry => entry.bulan === data.bulan && entry.tahun === data.tahun);
    // ...
}, [])
```

**Solution:** Use `useMemo` to memoize this computation.

## Recommendations

1. **Priority 1:** Fix the sequential database queries in `getDataGajiPegawai` using `Promise.all()` - this will have the most immediate performance impact.

2. **Priority 2:** Optimize the O(n*m) filtering by using Map lookups.

3. **Priority 3:** Refactor duplicate code for better maintainability.

4. **Priority 4:** Add database-level filtering where possible.

## Implementation Note

The PR accompanying this report implements the fix for Issue #1 (Sequential Database Queries) as it provides the most significant performance improvement with minimal risk of breaking changes.
