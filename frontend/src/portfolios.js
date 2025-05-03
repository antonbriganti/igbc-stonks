import Chart from 'chart.js/auto'

function getColour(index, opacity) {
    const colours = [
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

    return colours[index % colours.length];
}

function convertDataIntoDataset(portfoliosData){
    // convert data to datasets
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
    // Each dataset contains an array which says what the value is the stock in the person's portfolio
    // The person is determined via array index, e.g. 0 is Julian
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
            backgroundColour: getColour(index, 0.7),
            borderColour: getColour(index, 1),
            borderWidth: 1
        };
    });

    return datasets;
}

function createStockInfo(portfoliosData){
    let stocksInfo = {}
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

    return stocksInfo
}

// Create the chart
function createChart(portfoliosData) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    
    const datasets = convertDataIntoDataset(portfoliosData)
    console.log(datasets)

    // Get labels from portfolio names
    const labels = portfoliosData.map(portfolio => portfolio.name);

    // Calculate the total values for display
    const totals = portfoliosData.map(portfolio => portfolio.portfolio_value);

    const stocksInfo = createStockInfo(portfoliosData)

    portfolioChart = new Chart(ctx, {
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
                        text: 'Value (wowza(s))'
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
                            return `Total Value: ${totals[portfolioIndex]} wowza(s)`;
                        },
                        label: function(context) {
                            const stockName = context.dataset.label;
                            const portfolioIndex = context.dataIndex;
                            const portfolioName = labels[portfolioIndex];

                            if (stocksInfo[portfolioName] && stocksInfo[portfolioName][stockName]) {
                                const info = stocksInfo[portfolioName][stockName];
                                return [
                                    `${stockName}: ${info.value} wowza(s)`,
                                    `Price per Share: ${info.pricePerShare} wowza(s)`,
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

// load in portfolio file + create chart from it
var fs = require('fs');
const portfoliosData = JSON.parse(fs.readFileSync('sharedata.json', 'utf8'))
createChart(portfoliosData)
