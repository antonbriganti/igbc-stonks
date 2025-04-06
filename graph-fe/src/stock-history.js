import Chart from 'chart.js/auto'
// Global variables
let stockChart = null;
let originalDatasets = [];
let stockData = null;

// Function to create the chart
function createChart(data) {
    stockData = data;
    // Get all unique sessions from the data
    const sessions = new Set();
    Object.values(stockData).forEach(stockSessions => {
        Object.keys(stockSessions).forEach(session => {
            sessions.add(parseInt(session));
        });
    });
    
    // Convert to sorted array
    const sortedSessions = Array.from(sessions).sort((a, b) => a - b);

    // Generate random colors for stocks
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Sort stock names alphabetically
    const sortedStockNames = Object.keys(stockData).sort();
    
    // Prepare datasets for Chart.js
    const datasets = [];
    for (const stockName of sortedStockNames) {
        const sessionPrices = stockData[stockName];
        const color = getRandomColor();
        
        // Create price array in order of sessions
        const prices = sortedSessions.map(session => 
            sessionPrices[session] !== undefined ? sessionPrices[session] : null
        );
        
        datasets.push({
            label: stockName,
            data: prices,
            borderColor: color,
            backgroundColor: color + '20', // 20 is hex for 12% opacity
            pointBackgroundColor: color,
            pointRadius: 4,
            tension: 0.1,
            hidden: false
        });
    }
    
    // Store original datasets for filtering
    originalDatasets = [...datasets];
    
    // Create the chart
    // Select the element from the page and add it
    const ctx = document.getElementById('stockChart').getContext('2d');
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedSessions,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {
                mode: 'index',
                intersect: false
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Prices by Session',
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: false,
                    callbacks: {
                        // Customize the tooltip to show only the hovered dataset
                        title: function(tooltipItems) {
                            return 'Session ' + tooltipItems[0].label;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ${value.toFixed(0)} cryo`;
                        },
                        // Override the footer to be empty
                        footer: function() {
                            return '';
                        },
                        // Filter tooltipItems to only include the item being hovered
                        beforeBody: function(tooltipItems) {
                            return '';
                        }
                    },
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12
                },
                legend: {
                    display: false // Hide default legend since we're creating our own
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Session'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (Cryo)'
                    }
                }
            }
        }
    });
    
    // Create stock checkboxes
    createStockCheckboxes(sortedStockNames);
}

// Add stock checkbockes dynamically based on how many stock names there are
function createStockCheckboxes(stockNames) {
    const stockDropdown = document.getElementById('stockDropdown');
    stockDropdown.innerHTML = ''; // Clear any existing checkboxes
    
    stockNames.forEach((stockName, index) => {
        const checkbox = document.createElement('label');
        checkbox.className = 'stock-checkbox';
        checkbox.title = stockName; // Add tooltip for long stock names
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = stockName;
        input.checked = true;
        input.dataset.index = index;
        input.addEventListener('change', updateChartVisibility);
        
        checkbox.appendChild(input);
        checkbox.appendChild(document.createTextNode(stockName));
        stockDropdown.appendChild(checkbox);
    });
}

// Function to update chart visibility based on checkboxes
function updateChartVisibility() {
    const checkboxes = document.querySelectorAll('#stockDropdown input[type="checkbox"]');
    const visibleStocks = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    stockChart.data.datasets.forEach(dataset => {
        dataset.hidden = !visibleStocks.includes(dataset.label);
    });
    
    stockChart.update();
}

// Function to sort and recreate checkboxes
function sortCheckboxes() {
    const stockDropdown = document.getElementById('stockDropdown');
    const checkboxes = Array.from(stockDropdown.querySelectorAll('.stock-checkbox'));
    
    // Get current checked state
    const checkedStates = {};
    checkboxes.forEach(checkbox => {
        const input = checkbox.querySelector('input');
        checkedStates[input.value] = input.checked;
    });
    
    // Sort checkboxes alphabetically
    checkboxes.sort((a, b) => {
        const textA = a.textContent.trim();
        const textB = b.textContent.trim();
        return textA.localeCompare(textB);
    });
    
    // Clear and re-add checkboxes in sorted order
    stockDropdown.innerHTML = '';
    checkboxes.forEach(checkbox => {
        // Restore checked state
        const input = checkbox.querySelector('input');
        input.checked = checkedStates[input.value];
        stockDropdown.appendChild(checkbox);
    });
}

// Event listeners for buttons
document.getElementById('selectAll').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#stockDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    updateChartVisibility();
});

document.getElementById('selectNone').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#stockDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateChartVisibility();
});

document.getElementById('sortAlphabetical').addEventListener('click', sortCheckboxes);

// load in stock history + load into chart
var fs = require('fs');
var stockHistory = JSON.parse(fs.readFileSync('stockdata.json', 'utf8'))
createChart(stockHistory)
