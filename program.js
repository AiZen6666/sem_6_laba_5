const marginX = 50;
const marginY = 50;
const height = 400;
const width = 800;

let svg = d3.select("svg")
     .attr("height", height)
     .attr("width", width);


d3.select("#showTable").on("click", function(){
    let buttonValue = d3.select(this);

    if (buttonValue.property("value") === "Показать таблицу"){

        buttonValue.property("value", "Скрыть таблицу");
        let table = d3.select("div.table").select("table");

        let rows = table.select("tbody")
             .selectAll("tr")
             .data(stats)
             .enter()
             .append('tr')
             .style("display", "");

        let cells = rows.selectAll("td")
             .data(d => Object.values(d))
             .enter()
             .append("td")
             .text(d => d);
             
        let head = table.select("thead")
             .selectAll("th")
             .data(d => Object.keys(stats[0]))
             .enter()
             .append("th") 
             .text(d => d);

    } else {
        buttonValue.property("value", "Показать таблицу");
        d3.select("div.table").select("tbody").selectAll("tr").remove();
    }
});

function createArrGraph(data, key) {

    groupObj = d3.group(data, d => d[key]);
    let arrGraph =[];

    for(let entry of groupObj) {
        let minMax = d3.extent(entry[1].map(d => d['K/D']));
        arrGraph.push({labelX : entry[0], values : minMax});
    }
    return arrGraph;
}


function drawGraph(data) {
    // значения по оси ОХ
    const keyX = data.ox.value;
    const isMin = data.oy[1].checked;
    const isMax = data.oy[0].checked;

    if (!isMin && !isMax) {
        console.error("Выберите хотя бы одну категорию для построения графика по оси OY");
        return;
    }

    // создаем массив для построения графика
    const arrGraph = createArrGraph(stats, keyX);
    svg.selectAll('*').remove();
   
    // создаем шкалы преобразования и выводим оси
    const [scX, scY] = createAxis(arrGraph, isMin, isMax);
   
    // рисуем графики
    if (isMax) {
        createChart(arrGraph, scX, scY, 1, "red")
    }
    if (isMin) {
        createChart(arrGraph, scX, scY, 0, "blue")
    }
}

function createAxis(data, isFirst, isSecond){
    // в зависимости от выбранных пользователем данных по OY
    // находим интервал значений по оси OY
    let firstRange = d3.extent(data.map(d => d.values[0]));
    let secondRange = d3.extent(data.map(d => d.values[1]));
    let min = firstRange[0];
    let max = secondRange[1];
    // функция интерполяции значений на оси
    let scaleX = d3.scaleBand()
     .domain(data.map(d => d.labelX))
     .range([0, width - 2 * marginX]);

    let scaleY;
    
    if (isFirst && isSecond){
        scaleY = d3.scaleLinear()
         .domain([min * 0.85, max * 1.1 ])
         .range([height - 2 * marginY, 0]);
    } else if (!isFirst){
        scaleY = d3.scaleLinear()
         .domain([min * 0.85, max * 1.1 ])
         .range([height - 2 * marginY, 0]);
    } else if (!isSecond){
        scaleY = d3.scaleLinear()
         .domain([min * 0.85, max * 1.05])
         .range([height - 2 * marginY, 0]);
    }
    
   
    // создание осей
    let axisX = d3.axisBottom(scaleX); 
    let axisY = d3.axisLeft(scaleY); 

    svg.append("g")
     .attr("transform", `translate(${marginX}, ${height - marginY})`)
     .call(axisX)
     .selectAll("text")
     .style("text-anchor", "end")
     .attr("dx", "-.8em")
     .attr("dy", ".15em")
     .attr("transform", d => "rotate(-45)");
   
    svg.append("g")
     .attr("transform", `translate(${marginX}, ${marginY})`)
     .call(axisY);
   
    return [scaleX, scaleY]
}

function createChart(data, scaleX, scaleY, index, color) {
    const r = 4;
    
    let ident = (index == 0)? -r / 2 : r / 2;
    
    if (document.querySelector('input[name="chartType"]:checked').value === "scatter") {
      svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", r)
        .attr("cx", d => scaleX(d.labelX) + scaleX.bandwidth() / 2)
        .attr("cy", d => scaleY(d.values[index]) + ident)
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .style("fill", color);
    } else if(document.querySelector('input[name="chartType"]:checked').value === "bar") {
      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => scaleX(d.labelX))
        .attr("y", d => scaleY(d.values[index]))
        .attr("width", scaleX.bandwidth())
        .attr("height", d => height - scaleY(d.values[index]) - marginY*2)
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .style("fill", color)
        .style("stroke", "white")
        .style("stroke-width", 3)
    }
}


document.addEventListener("DOMContentLoaded", function() {
    const defaultData = {
        ox: { value: "Team" },
        oy: [
            { value: "Максимальное K/D", checked: true },
            { value: "Минимальный K/D", checked: false },
        ],
        chartType: { value: "scatter" }
    };

    drawGraph(defaultData);
});