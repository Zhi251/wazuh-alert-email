#!/usr/bin/env node

import { Client } from 'pg';
import 'dotenv/config';

const testConnection = async () => {
    console.log('測試 PostgreSQL 連接...');
    console.log(`主機: ${process.env.PGHOST}`);
    console.log(`端口: ${process.env.PGPORT}`);
    console.log(`資料庫: ${process.env.PGDATABASE}`);
    console.log(`用戶: ${process.env.PGUSER}`);

    const client = new Client({
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
    });

    try {
        await client.connect();
        console.log('✅ PostgreSQL 連接成功！');

        const result = await client.query('SELECT version()');
        console.log('PostgreSQL 版本:', result.rows[0].version);

        // 測試 LISTEN 功能
        await client.query('LISTEN test_channel');
        console.log('✅ LISTEN 功能正常');

    } catch (error) {
        console.error('❌ 連接失敗:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
};

testConnection();
