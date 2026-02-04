
import { readCollection } from '../src/lib/db';

async function main() {
    try {
        console.log('--- Checking Curated Designs ---');
        const designs = await readCollection('curated_designs');
        designs.forEach((d: any) => {
            console.log(`ID: ${d.id}, Title: ${d.title}, Category: ${d.category}, Active: ${d.is_active}`);
        });

        console.log('\n--- Checking Designer Profiles ---');
        const designers = await readCollection('designer_profiles');
        designers.forEach((d: any) => {
            console.log(`ID: ${d.id}, Name: ${d.name}, Specialties: [${d.specialties.join(', ')}], Status: ${d.status}, Load: ${d.currentLoad}/${d.maxCapacity}`);
        });

        console.log('\n--- Done ---');
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
