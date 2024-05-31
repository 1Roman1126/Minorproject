// AWS SDK Configuration
AWS.config.update({
    region: 'us-east-1', 
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:8059f8ce-6b06-4913-96aa-c63ce3cda46e'
    })
});

const s3 = new AWS.S3();

document.addEventListener('DOMContentLoaded', function () {
    const stockSelect = document.getElementById('stock-select');
    const chartContainer = document.getElementById('chart-container');

    stockSelect.addEventListener('change', function () {
        const selectedStock = stockSelect.value;
        updateChart(selectedStock);
    });

    async function updateChart(stock) {
        try {
            const data = await fetchCsv(stock);
            chartContainer.innerHTML = ''; // Clear existing chart/data
            renderChart(data); // Render the chart with the fetched data
        } catch (error) {
            chartContainer.innerHTML = `<p>Error loading data for ${stock}: ${error.message}</p>`;
            console.error('Error fetching or parsing CSV:', error);
        }
    }

    function fetchCsv(stock) {
        let key = '';
        switch (stock) {
            case 'company1':
                key = 'nepse_data_2024-05-30.csv';
                break;
            case 'company2':
                key = 'Today\'s Price_2024-05-15.csv';
                break;
            default:
                key = 'manifest.json'; // Default case, or handle appropriately
                break;
        }

        const params = {
            Bucket: 'minorproject-forbes', // Your S3 bucket name
            Key: key
        };

        return new Promise((resolve, reject) => {
            s3.getObject(params, function(err, data) {
                if (err) {
                    console.error('Error fetching from S3:', err);
                    reject(new Error(`Failed to fetch ${key} from S3: ${err.message}`));
                } else {
                    // Ensure correct encoding and handle potential BOM
                    const csvData = new TextDecoder("utf-8").decode(data.Body).replace(/^\uFEFF/, '');
                    Papa.parse(csvData, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        complete: function(results) {
                            if (results.errors.length > 0) {
                                console.error('Papa Parse Errors:', results.errors);
                                reject(new Error('Errors occurred while parsing CSV.'));
                            } else {
                                resolve(results.data);
                            }
                        },
                        error: function(err) {
                            console.error('Papa Parse Parsing Error:', err);
                            reject(new Error(`Parsing error: ${err.message}`));
                        }
                    });
                }
            });
        });
    }

    function renderChart(data) {
        const ctx = document.createElement('canvas');
        chartContainer.appendChild(ctx);

        new Chart(ctx, {
            type: 'line', // Change this to 'bar', 'pie', etc. based on your preference
            data: {
                labels: data.map(item => item.Date), // Make sure 'Date' matches your CSV column name
                datasets: [{
                    label: 'Stock Price',
                    data: data.map(item => item.Price), // Make sure 'Price' matches your CSV column name
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Initialize with the first stock selected
    updateChart(stockSelect.value);
});
