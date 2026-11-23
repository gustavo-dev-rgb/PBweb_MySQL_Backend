const pool = require('./db');

async function main() {
    try {
        //--- 1. INSERT DATA MENGGUNAKAN PARAMETERIZED QUERY ---
        console.log('\n--- Menambahkan Data Penulis ---');
        const insertAuthorSql = 'INSERT INTO authors (name, email) VALUES (?, ?)';
        const [authorResult] = await pool.execute(insertAuthorSql, ['Tere Liye', 'tereliye@example.com']);
        const authorId = authorResult.insertId;
        console.log(`✅ Penulis berhasil ditambahkan dengan ID: ${authorId}`);

        console.log('\n--- Menambahkan Data Buku (Termasuk Stock) ---');
        const insertBookSql = 'INSERT INTO books (title, author_id, published_year, stock) VALUES (?, ?, ?, ?)';
        await pool.execute(insertBookSql, ['Bumi', authorId, 2014, 10]);
        await pool.execute(insertBookSql, ['Bulan', authorId, 2015, 15]);
        console.log(`✅ Buku-buku berhasil ditambahkan.`);

        // --- 2. SELECT DATA (READ DENGAN JOIN) ---
        console.log('\n--- Menampilkan Semua Data Buku dan Penulisnya ---');
        const selectSql = `
            SELECT books.id, books.title, books.published_year, books.stock, authors.name AS author_name 
            FROM books 
            JOIN authors ON books.author_id = authors.id
        `;
        const [books] = await pool.execute(selectSql);
        console.table(books);

        // --- 3. OPERASI UPDATE (Tugas Praktikum) ---
        console.log('\n--- Memperbarui Judul Buku ---');
        const updateSql = 'UPDATE books SET title = ? WHERE id = ?';
        await pool.execute(updateSql, ['Bumi & Bulan (Revised)', 1]);
        console.log('✅ Judul buku dengan ID 1 berhasil diperbarui.');

        // Tampilkan ulang setelah update
        const [updatedBooks] = await pool.execute('SELECT id, title, stock FROM books');
        console.table(updatedBooks);

        // --- 4. AMBIL DATA DENGAN FILTER AMAN ---
        console.log('\n--- Mencari Buku Berdasarkan Tahun Terbit ---');
        const searchYear = 2014;
        const searchSql = 'SELECT * FROM books WHERE published_year = ?';
        const [filteredBooks] = await pool.execute(searchSql, [searchYear]);
        console.log(`Buku yang terbit tahun ${searchYear}:`, filteredBooks);

        // --- 5. OPERASI DELETE & ON DELETE CASCADE (Tugas Praktikum) ---
        console.log('\n--- Menghapus Data Penulis ---');
        // Menghapus penulis akan otomatis menghapus buku miliknya karena ada aturan ON DELETE CASCADE
        const deleteAuthorSql = 'DELETE FROM authors WHERE id = ?';
        await pool.execute(deleteAuthorSql, [authorId]);
        console.log(`✅ Penulis dengan ID ${authorId} berhasil dihapus.`);

       // Verifikasi apakah buku ikut terhapus otomatis
        const [remainingBooks] = await pool.execute('SELECT * FROM books');
        console.log('Sisa buku di database setelah penulis dihapus (Harusnya kosong):', remainingBooks);

    } catch (error) {
        console.error('❌ Terjadi kesalahan operasi database:', error);
    } finally {
        await pool.end();
        console.log('\n🔒 Koneksi database ditutup dengan aman.');
    }
}

main();