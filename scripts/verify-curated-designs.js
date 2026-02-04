
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load env for base URL if needed, but we'll assume localhost:3000
const BASE_URL = 'http://localhost:3000/api';

async function runVerification() {
    console.log('Starting Curated Designs Verification...');

    // 1. Create a Design
    console.log('\n[1] Creating Design...');
    let designId = '';
    try {
        const createRes = await axios.post(`${BASE_URL}/admin/designs`, {
            title: 'Test Design ' + Date.now(),
            category: 'Suits',
            style_aesthetic: 'Modern',
            description: 'A test design for verification.',
            base_price_range: '50k - 100k',
            is_active: true
        });

        if (createRes.data.design) {
            designId = createRes.data.design.id;
            console.log('✅ Created Design:', designId);
        } else {
            console.error('❌ Creation failed:', createRes.data);
            return;
        }
    } catch (err) {
        console.error('❌ Creation Error:', err.message);
        return;
    }

    // 2. Fetch Publicly
    console.log('\n[2] Fetching Public Designs...');
    try {
        const publicRes = await axios.get(`${BASE_URL}/curated-designs`);
        const found = publicRes.data.designs.find(d => d.id === designId);
        if (found) {
            console.log('✅ Found design in public list');
        } else {
            console.error('❌ Design not found in public list (is_active=true)');
        }
    } catch (err) {
        console.error('❌ Fetch Error:', err.message);
    }

    // 3. Update Design
    console.log('\n[3] Updating Design...');
    try {
        const updateRes = await axios.put(`${BASE_URL}/admin/designs/${designId}`, {
            title: 'Updated Test Design',
            is_active: false
        });
        if (updateRes.data.design.title === 'Updated Test Design') {
            console.log('✅ Updated title successfully');
        } else {
            console.error('❌ Update failed');
        }
    } catch (err) {
        console.error('❌ Update Error:', err.message);
    }

    // 4. Verify Invisible (since is_active=false)
    console.log('\n[4] Verifying Visibility (should be hidden)...');
    try {
        const publicRes = await axios.get(`${BASE_URL}/curated-designs`);
        const found = publicRes.data.designs.find(d => d.id === designId);
        if (!found) {
            console.log('✅ Design correctly hidden from public list');
        } else {
            console.error('❌ Design still visible despite is_active=false');
        }
    } catch (err) {
        console.error('❌ Fetch Error:', err.message);
    }

    // 5. Delete Design
    console.log('\n[5] Deleting Design...');
    try {
        const deleteRes = await axios.delete(`${BASE_URL}/admin/designs/${designId}`);
        if (deleteRes.data.success) {
            console.log('✅ Deleted successfully');
        } else {
            console.error('❌ Delete failed');
        }
    } catch (err) {
        console.error('❌ Delete Error:', err.message);
    }

    console.log('\nVerification Complete.');
}

// Check if server is running
axios.get(BASE_URL.replace('/api', ''))
    .then(() => runVerification())
    .catch(() => console.error('❌ Server is not running at http://localhost:3000. Please start it first.'));
