
const fixOrder = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/diag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: '1770192237055_5sv6sggiv',
                assignmentStatus: 'shortlisted'
            })
        });
        const data = await res.json();
        console.log('Result:', data);
    } catch (e) {
        console.error('Error:', e);
    }
};

fixOrder();
