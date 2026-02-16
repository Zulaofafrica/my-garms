import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { FABRICS, TEMPLATES } from '@/lib/data';

export async function GET() {
    try {
        // 1. Create Tables
        await query(`
            CREATE TABLE IF NOT EXISTS fabrics (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT,
                price NUMERIC,
                image TEXT,
                color TEXT,
                description TEXT,
                in_stock BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT,
                image TEXT,
                base_price NUMERIC,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Seed Data
        const results = [];

        // Seed Fabrics
        for (const fabric of FABRICS) {
            const { rows } = await query('SELECT id FROM fabrics WHERE id = $1', [fabric.id]);
            if (rows.length === 0) {
                await query(
                    `INSERT INTO fabrics (id, name, type, price, image, color, description, in_stock)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [fabric.id, fabric.name, fabric.type, fabric.price, fabric.image, fabric.color, fabric.description, true]
                );
                results.push(`Inserted Fabric: ${fabric.name}`);
            } else {
                results.push(`Skipped Fabric: ${fabric.name} (exists)`);
            }
        }

        // Seed Templates
        for (const tmpl of TEMPLATES) {
            const { rows } = await query('SELECT id FROM templates WHERE id = $1', [tmpl.id]);
            if (rows.length === 0) {
                // Determine a base price if not in data (mocking for now or using default)
                // data.js templates don't have price, let's assume 0 or a standard starting price
                const basePrice = 0;
                await query(
                    `INSERT INTO templates (id, name, category, image, base_price, description)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [tmpl.id, tmpl.name, tmpl.category, `/images/template-${tmpl.id}.jpg`, basePrice, 'Standard template']
                );
                results.push(`Inserted Template: ${tmpl.name}`);
            } else {
                results.push(`Skipped Template: ${tmpl.name} (exists)`);
            }
        }

        return NextResponse.json({ message: 'Content tables setup complete', results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
