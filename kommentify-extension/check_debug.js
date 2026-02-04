async function checkDebug() {
    try {
        const response = await fetch('https://kommentify.com/api/debug');
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDebug();
