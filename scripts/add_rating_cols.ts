import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { query } from '../src/lib/db';

async function addRatingColumns() {
    console.log('Adding rating and review_count columns to designer_profiles...');

    try {
        // Check if columns already exist
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'designer_profiles' 
            AND column_name IN ('rating', 'review_count')
        `;

        const result = await query(checkQuery);
        const existingColumns = result.rows.map(row => row.column_name);

        if (existingColumns.includes('rating') && existingColumns.includes('review_count')) {
            console.log('Columns already exist. No changes needed.');
            return;
        }

        // Add rating column if it doesn't exist
        if (!existingColumns.includes('rating')) {
            await query(`
                ALTER TABLE designer_profiles 
                ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0
            `);
            console.log('Added rating column');
        }

        // Add review_count column if it doesn't exist
        if (!existingColumns.includes('review_count')) {
            await query(`
                ALTER TABLE designer_profiles 
                ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0
            `);
            console.log('Added review_count column');
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

addRatingColumns();
