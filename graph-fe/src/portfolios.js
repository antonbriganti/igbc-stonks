import Chart from 'chart.js/auto'

function getColor(index, opacity) {
    const colors = [
        `rgba(54, 162, 235, ${opacity})`, // blue
        `rgba(255, 99, 132, ${opacity})`, // red
        `rgba(255, 206, 86, ${opacity})`, // yellow
        `rgba(75, 192, 192, ${opacity})`, // teal
        `rgba(153, 102, 255, ${opacity})`, // purple
        `rgba(255, 159, 64, ${opacity})`, // orange
        `rgba(201, 203, 207, ${opacity})`, // grey
        `rgba(111, 214, 155, ${opacity})`, // green
        `rgba(204, 102, 153, ${opacity})`, // pink
        `rgba(95, 162, 206, ${opacity})` // light blue
    ];

    return colors[index % colors.length];
}

// Example data - multiple portfolios with dynamic stocks
var fs = require('fs');
const portfoliosData = JSON.parse(fs.readFileSync('sharedata.json', 'utf8'))

// Process the data to create datasets
function processPortfolioData(portfoliosData) {
    // Get all unique stock names across all portfolios
    const allStocks = new Set();
    portfoliosData.forEach(portfolioData => {
        Object.keys(portfolioData.portfolio).forEach(stock => {
            allStocks.add(stock);
        });
    });

    // Convert to array and sort alphabetically
    const stocksArray = Array.from(allStocks).sort();

    // Create a dataset for each stock
    const datasets = stocksArray.map((stock, index) => {
        const data = portfoliosData.map(portfolioData => {
            if (portfolioData.portfolio[stock]) {
                return portfolioData.portfolio[stock].value;
            }
            return 0; // Portfolio doesn't have this stock
        });

        return {
            label: stock,
            data: data,
            backgroundColor: getColor(index, 0.7),
            borderColor: getColor(index, 1),
            borderWidth: 1
        };
    });

    // Get labels from portfolio names
    const labels = portfoliosData.map(portfolio => portfolio.name);

    // Calculate the total values for display
    const totals = portfoliosData.map(portfolio => portfolio.portfolio_value);

    return {
        datasets,
        labels,
        totals,
        stocksArray
    };
}

// Process data
const {
    datasets,
    labels,
    totals,
    stocksArray
} = processPortfolioData(portfoliosData);

// Create a mapping of stocks to price per share and shares info
const stocksInfo = {};
portfoliosData.forEach(portfolioData => {
    const portfolioName = portfolioData.name;

    if (!stocksInfo[portfolioName]) {
        stocksInfo[portfolioName] = {};
    }

    Object.keys(portfolioData.portfolio).forEach(stock => {
        const shares = portfolioData.portfolio[stock]['shares held'];
        const value = portfolioData.portfolio[stock]['value'];
        const pricePerShare = value / shares;

        stocksInfo[portfolioName][stock] = {
            shares: shares,
            value: value,
            pricePerShare: pricePerShare
        };
    });
});

// Create the chart
function createChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    const portfolioChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Portfolios'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value (cryo)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Portfolios',
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        afterTitle: function(context) {
                            const portfolioIndex = context[0].dataIndex;
                            const portfolioName = labels[portfolioIndex];
                            return `Total Value: ${totals[portfolioIndex]} cryo`;
                        },
                        label: function(context) {
                            const stockName = context.dataset.label;
                            const portfolioIndex = context.dataIndex;
                            const portfolioName = labels[portfolioIndex];

                            if (stocksInfo[portfolioName] && stocksInfo[portfolioName][stockName]) {
                                const info = stocksInfo[portfolioName][stockName];
                                return [
                                    `${stockName}: ${info.value} cryo`,
                                    `Price per Share: ${info.pricePerShare} cryo`,
                                    `Shares Held: ${info.shares}`
                                ];
                            }
                            return `${stockName}: $0 (not in portfolio)`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}
createChart()