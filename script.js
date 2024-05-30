document.addEventListener('DOMContentLoaded', function () {
    const stockSelect = document.getElementById('stock-select');
    const chartContainer = document.getElementById('chart-container');

    stockSelect.addEventListener('change', function () {
        const selectedStock = stockSelect.value;
        updateChart(selectedStock);
    });

    function updateChart(stock) {
        chartContainer.innerHTML = `<p>Displaying data for ${stock}</p>`;
        // Here, you would use a chart library like Chart.js or D3.js to render the actual chart
        // Example:
        // renderChart(stock);
    }

    // Initialize with the first stock selected
    updateChart(stockSelect.value);
});
