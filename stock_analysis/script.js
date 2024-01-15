let chartCanvas = document.querySelector('#chart');
let btn_container = document.querySelector('#buttonSection-chart');
let button_list = document.querySelector('.company_profit_lists');
let currentChart=null;
let peakElement = document.querySelector('.peak');
let lowElement = document.querySelector('.low');


// function displayHelper(values,timestamp,companyName){

//     if(currentChart){
//         currentChart.destroy();
//     }
//     const peakValue = Math.max(...values);
//     const lowValue = Math.min(...values);

//     currentChart =  new Chart(chartCanvas, {
//         type: 'line',
//         data: {
//         labels: timestamp,
//         datasets: [{
//             label:companyName,
//             data: values,
//             borderWidth: 2,
//             borderColor: 'rgb(51, 216, 17)',
//         }]
//         },
//         options: {
//             scales: {
//                 x: {
//                     display:false
//                   },
//                   y: {
//                     grid: {
//                       display: false
//                     }
//                   }
//             },
//             tooltips: {
//                 mode: 'index',
//                 intersect: false
//              },
//              hover: {
//                 mode: 'index',
//                 intersect: false
//              }
//         },
//         plugins: {
//             tooltip: {
//                 mode: 'index',
//                 intersect: false,
//             },
//             annotation: {
//                 annotations: [{
//                     type: 'line',
//                     mode: 'vertical',
//                     scaleID: 'x',
//                     borderWidth: 1,
//                     borderColor: 'rgba(0, 0, 0, 0.1)',
//                     value: timestamp[0], // Initial position of the line
//                     label: {
//                         content: '', // Initial label content
//                         enabled: true,
//                         position: 'top',
//                     }
//                 }]
//             }
//         },
//         hover: {
//             mode: 'index',
//             intersect: false
//         }
//     });

//     chartCanvas.addEventListener('mousemove', function (e) {
//         let activePoints = currentChart.getElementsAtEventForMode(e, 'index', { intersect: false }, true);

//         if (activePoints.length > 0) {
//             let index = activePoints[0].index;
//             let value = currentChart.data.datasets[0].data[index];
//             let label = currentChart.scales['x'].getValueForPixel(e.x).toFixed(2); // x-value with 2 decimal places

//             // Move the vertical line to the hovered point
//             currentChart.options.plugins.annotation.annotations[0].value = timestamp[index];
//             currentChart.options.plugins.annotation.annotations[0].label.content = `${label}: ${value.toFixed(2)}`;
//             currentChart.update();
//         }
//     });
// }

function displayHelper(values, timestamp, companyName) {
    if (currentChart) {
        currentChart.destroy();
    }

    let peak = Math.max(...values);
    let low = Math.min(...values);

    peakElement.textContent =parseFloat(peak).toFixed(2);
    lowElement.textContent = parseFloat(low).toFixed(2);

    currentChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: timestamp,
            datasets: [{
                label: "Company : "+companyName,
                data: values,
                borderWidth: 3,
                borderColor: 'rgb(51, 216, 17)',
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    display:false
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                point:{
                    radius: 0
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                annotation: {
                    annotations: [{
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x',
                        borderWidth: 4,
                        borderColor: 'red',
                        value: timestamp[0],
                        label: {
                            content: '', 
                            enabled: true,
                            position: 'top',
                        }
                    }]
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            }
        },
    });

    // Event listener for hover over the chart
    chartCanvas.addEventListener('mousemove', (e)=> {
        let activePoints = currentChart.getElementsAtEventForMode(e, 'index', { intersect: false }, true);

        if (activePoints.length > 0) {
            let index = activePoints[0].index;
            let value = currentChart.data.datasets[0].data[index];
            let label = currentChart.scales['x'].getValueForPixel(e.x).toFixed(2); // x-value with 2 decimal places

            // Move the vertical line to the hovered point
            currentChart.options.plugins.annotation.annotations[0].value = timestamp[index];
            currentChart.options.plugins.annotation.annotations[0].label.content = `${label}: ${value.toFixed(2)}`;
            currentChart.update();
        }
    });
}



function fetchChartAPI(companyName,time){
    let request = fetch('https://stocks3.onrender.com/api/stocks/getstocksdata');

    request.then((response)=>{
        return response.json();
    })
    .then((data)=>{
        let dataArray = data.stocksData[0];

        let timeObject = dataArray[companyName][time];

        let timestamp = timeObject.timeStamp;

        for(let time of timestamp){
            time = new Date(time*1000).toLocaleDateString();
        }

        let values = timeObject.value;
        displayHelper(values,timestamp,companyName);
    })
    .catch((err)=>{
        console.log('Error fetching Date '+err);
    })
}


function addTimeButtons(text_content,value,id_name){
    let btn = document.createElement('btn');
    btn.textContent = text_content;
    btn.value = value;
    btn.id = id_name;
    
    btn.classList.add('time_button');
    btn_container.appendChild(btn);

    btn.addEventListener('click',()=>{
        let allBtns = document.querySelectorAll('.time_button');
        allBtns.forEach((ele)=>{
            ele.classList.remove('active');
        })

        btn.classList.add('active');
        fetchChartAPI(btn.id,btn.value);
    })
}

function addCompanyElementsRHS(){
    fetch('https://stocks3.onrender.com/api/stocks/getstockstatsdata').then((response)=>{
        return response.json();
    })
    .then((stockData)=>{
        let stockArray = stockData.stocksStatsData[0];

        for(const key in stockArray){
            if(key!='_id'){
                let listItem = document.createElement('li');
                listItem.classList.add('profit_button_listItem');

                let btn = document.createElement('button');
                btn.textContent = key;
                btn.className = 'profit_button'
                

                let bookValue = document.createElement('p');
                bookValue.className = 'book-value';
                let profit = document.createElement('p');
                profit.className = 'profits';

                bookValue.textContent = `$ ${stockArray[key].bookValue}`;
                profit.textContent = `${(stockArray[key].profit).toFixed(2)}%`;

                if(stockArray[key].profit<=0){
                    profit.style.color = 'rgb(243, 32, 32)';
                }
                else{
                    profit.style.color = 'rgb(0, 255, 0)';
                }

                
                listItem.appendChild(profit);
                listItem.appendChild(bookValue);
                listItem.appendChild(btn);

                button_list.appendChild(listItem);

                // whenever we click on any button on the RHS the data of company is shown
                btn.addEventListener('click',()=>{
                    showCompanyDetails(btn.textContent,bookValue.textContent,profit.textContent);

                    // by default show 1 month data
                    fetchChartAPI(key,"1mo");
                    btn_container.innerHTML = '';
                    addTimeButtons('1 Month','1mo',key);
                    addTimeButtons('3 Month','3mo',key);
                    addTimeButtons('1 Year','1y',key);
                    addTimeButtons('5 Year','5y',key);

                });

            }
        }
    })
}


function showCompanyDetails(companyName,bookValue,profitValue){
    let comp_name = document.querySelector('#company_name');
    let book_value = document.querySelector('#company_bookValue');
    let profit = document.querySelector('#company_profit');
    let company_summary = document.querySelector('#company-summary');


    comp_name.innerHTML = '';
    bookValue.innerHTML = '';
    profit.innerHTML = '';

    comp_name.textContent = companyName;
    book_value.textContent = bookValue;
    profit.textContent = profitValue;

    if(profitValue==='0.00%'){
        profit.style.color = 'rgb(243, 32, 32)';
    }
    else{
        profit.style.color = 'rgb(0, 255, 0)';
    }

    company_summary.innerHTML = '';

    fetch('https://stocks3.onrender.com/api/stocks/getstocksprofiledata').then((res)=>{
        return res.json();
    })
    .then((stocks)=>{
        let allStockObjects = stocks.stocksProfileData[0];
        let currentCompany = allStockObjects[companyName]; 
        company_summary.textContent = currentCompany.summary;
    })

}


function render() {

    window.onload = function() {
        fetchChartAPI('AAPL','1mo');
        addTimeButtons('1 Month','1mo','AAPL');
        addTimeButtons('3 Month','3mo','AAPL');
        addTimeButtons('1 Year','1y','AAPL');
        addTimeButtons('5 Year','5y','AAPL');
        showCompanyDetails('AAPL',3.953,'0.24%');
    };

    addCompanyElementsRHS();


}

render();


















