document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dataInput = document.getElementById('data-input');
    const loadBtn = document.getElementById('load-data-btn');
    const clearBtn = document.getElementById('clear-data-btn');
    const fileUpload = document.getElementById('file-upload');
    const dataPreview = document.getElementById('data-preview');
    const dataTable = document.getElementById('data-table');
    const analysisSection = document.getElementById('analysis-section');
    const chartTypeSelect = document.getElementById('chart-type');
    const xAxisSelect = document.getElementById('x-axis');
    const yAxisSelect = document.getElementById('y-axis');
    const generateBtn = document.getElementById('generate-chart-btn');
    const resultsSection = document.getElementById('results-section');
    const statsOutput = document.getElementById('stats-output');
    const ctx = document.getElementById('main-chart').getContext('2d');

    // State
    let parsedData = [];
    let headers = [];
    let myChart = null;

    // Event Listeners
    loadBtn.addEventListener('click', () => parseData(dataInput.value));

    clearBtn.addEventListener('click', () => {
        dataInput.value = '';
        parsedData = [];
        headers = [];
        hideSections();
        if (myChart) myChart.destroy();
    });

    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    handleParsedData(results.data, results.meta.fields);
                },
                error: (err) => alert('Error parsing file: ' + err.message)
            });
        }
    });

    generateBtn.addEventListener('click', generateVisualization);

    // Parsing Logic
    function parseData(csvText) {
        if (!csvText.trim()) {
            alert('Please paste some data or upload a file.');
            return;
        }

        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    alert('No valid data found.');
                    return;
                }
                handleParsedData(results.data, results.meta.fields);
            },
            error: (err) => alert('Error parsing CSV: ' + err.message)
        });
    }

    function handleParsedData(data, fields) {
        parsedData = data;
        headers = fields;

        renderTable(data, fields);
        populateSelects(fields);

        dataPreview.classList.remove('hidden');
        analysisSection.classList.remove('hidden');

        // Auto-scroll to analysis section
        analysisSection.scrollIntoView({ behavior: 'smooth' });
    }

    function renderTable(data, fields) {
        dataTable.innerHTML = '';

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        fields.forEach(field => {
            const th = document.createElement('th');
            th.textContent = field;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        dataTable.appendChild(thead);

        // Body (limit to first 100 rows for performance preview)
        const tbody = document.createElement('tbody');
        data.slice(0, 100).forEach(row => {
            const tr = document.createElement('tr');
            fields.forEach(field => {
                const td = document.createElement('td');
                td.textContent = row[field];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        dataTable.appendChild(tbody);
    }

    function populateSelects(fields) {
        xAxisSelect.innerHTML = '';
        yAxisSelect.innerHTML = '';

        fields.forEach(field => {
            const optionX = document.createElement('option');
            optionX.value = field;
            optionX.textContent = field;
            xAxisSelect.appendChild(optionX);

            const optionY = document.createElement('option');
            optionY.value = field;
            optionY.textContent = field;
            yAxisSelect.appendChild(optionY);
        });

        // Try to guess reasonable defaults
        // Look for typical categorical vs numerical fields
        const potentialNum = fields.find(f => !isNaN(parseFloat(parsedData[0][f])));
        if (potentialNum) {
            yAxisSelect.value = potentialNum;
        }
    }

    function generateVisualization() {
        const type = chartTypeSelect.value;
        const xField = xAxisSelect.value;
        const yField = yAxisSelect.value;

        // Prepare data for Chart.js
        let chartData;
        let chartLabels;

        if (type === 'scatter') {
            // Scatter plots need {x, y} structure
            chartData = parsedData.map(row => ({
                x: parseFloat(row[xField]), // Try to parse X as number
                y: parseFloat(row[yField])
            })).filter(point => !isNaN(point.y)); // Filter invalid Y, allow X to be whatever (but strictly scatter needs numbers usually)

            // If X values are NaN (categorical), scatter plot won't work well with standard linear scale
            // But let's assume for a stat tool user intends numerical X for scatter.
            // If we want to support categorical X on scatter, we'd need a different approach, but standard scatter is X-Y numeric.
            if (chartData.some(p => isNaN(p.x))) {
                alert(`Warning: Scatter plots require a numerical X-axis. The column "${xField}" contains non-numeric values.`);
            }
        } else {
            // Standard charts (Bar, Line, Pie)
            chartLabels = parsedData.map(row => row[xField]);
            chartData = parsedData.map(row => parseFloat(row[yField]));
        }

        // Basic validation for Y-axis
        if (type !== 'scatter' && chartData.some(isNaN)) {
            alert(`Warning: The column "${yField}" contains non-numeric values. Charts may not render correctly.`);
        }

        // Render Chart
        if (myChart) {
            myChart.destroy();
        }

        const colors = [
            'rgba(37, 99, 235, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(139, 92, 246, 0.7)'
        ];

        const config = {
            type: type,
            data: {
                labels: type !== 'scatter' ? chartLabels : undefined, // Scatter doesn't use the global labels array the same way
                datasets: [{
                    label: `${yField} vs ${xField}`,
                    data: chartData,
                    backgroundColor: type === 'pie' || type === 'doughnut' ? colors : colors[0],
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: (type !== 'pie' && type !== 'doughnut') ? {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yAxisSelect.options[yAxisSelect.selectedIndex].text
                        }
                    },
                    x: {
                        type: type === 'scatter' ? 'linear' : 'category', // Scatter needs linear X
                        position: 'bottom',
                        title: {
                            display: true,
                            text: xAxisSelect.options[xAxisSelect.selectedIndex].text
                        }
                    }
                } : {}
            }
        };

        myChart = new Chart(ctx, config);

        // Calculate Stats (pass the Y values)
        const statValues = type === 'scatter' ? chartData.map(p => p.y) : chartData;
        calculateStats(statValues, yField);

        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function calculateStats(values, fieldName) {
        // Filter out NaNs for stats
        const validValues = values.filter(v => !isNaN(v));

        if (validValues.length === 0) {
            statsOutput.innerHTML = '<p>No valid numeric data to analyze.</p>';
            return;
        }

        const n = validValues.length;
        const sum = validValues.reduce((a, b) => a + b, 0);
        const mean = sum / n;

        // Median
        const sorted = [...validValues].sort((a, b) => a - b);
        const mid = Math.floor(n / 2);
        const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

        // Min/Max
        const min = Math.min(...validValues);
        const max = Math.max(...validValues);

        // Standard Deviation
        const variance = validValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        const html = `
            <div class="stat-item"><span class="stat-label">Variable</span><span class="stat-value">${fieldName}</span></div>
            <div class="stat-item"><span class="stat-label">Count (N)</span><span class="stat-value">${n}</span></div>
            <div class="stat-item"><span class="stat-label">Min</span><span class="stat-value">${min.toFixed(2)}</span></div>
            <div class="stat-item"><span class="stat-label">Max</span><span class="stat-value">${max.toFixed(2)}</span></div>
            <div class="stat-item"><span class="stat-label">Mean</span><span class="stat-value">${mean.toFixed(2)}</span></div>
            <div class="stat-item"><span class="stat-label">Median</span><span class="stat-value">${median.toFixed(2)}</span></div>
            <div class="stat-item"><span class="stat-label">Std. Deviation</span><span class="stat-value">${stdDev.toFixed(2)}</span></div>
        `;
        statsOutput.innerHTML = html;
    }

    function hideSections() {
        dataPreview.classList.add('hidden');
        analysisSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
    }
});
