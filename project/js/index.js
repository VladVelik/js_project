let baseTableData = "<tr style='height: 40px'><th>Дата</th><th>Минимум</th><th>Средняя</th><th>Максимум</th><th>Осадки (мм)</th></tr>";

let results = [];
let minTempValue = 0, maxTempValue = 0, avgTempValue = 0,
    sumRainValue = 0;

// Метод для загрузки данных таблицы.
async function loadFile() {
    let selectFile = document.getElementById("select_file");
    let selectMonth = document.getElementById("select_month");
    let table = document.getElementById("table1");

    table.innerHTML = baseTableData;

    let raw = await(await fetch("./csv/" + selectFile.value)).text();

    let month = selectMonth.value.toLowerCase();
    results = raw.split("\n").map(u => u.split(";")).filter(u => u[1] !== undefined && u[1].toLowerCase() === month);

    for (let i = 0; i < results.length; i++) {
        let current = results[i];
        table.innerHTML += buildRecord(current[0], current[2], current[3], current[4], current[5]);
    }
}

// Цвета для температур в таблице.
function buildRecord(day, min, avg, max, rain) {
    return `<tr><td>${day}</td><td style='color: blue'>${min}</td><td style='color: green'>${avg}</td><td style='color: red'>${max}</td><td>${rain}</td>`;
}

// Метод для построения линии температуры для графика.
function drawCanvasLine(current, next, pointsFromRecord, pointsFromValue, color, graphics, i, height) {
    graphics.beginPath();
    graphics.lineWidth = 1;

    graphics.moveTo((i + 1) * pointsFromRecord, height - 15 - current * pointsFromValue);
    graphics.lineTo((i + 2) * pointsFromRecord,height - 15 - next * pointsFromValue);
    graphics.strokeStyle = color;
    graphics.stroke();
}

// Построение графика по данным.
function drawGraph() {
    let canvas = document.getElementById("graph");
    let graphics = canvas.getContext('2d');

    canvas.width = 820;
    canvas.height = 415;

    let pointsFromRecord = (canvas.width - 20) / results.length;
    let pointsFromValue = (canvas.height - 15) / (maxTempValue - minTempValue);

    for (let i = 0; i < maxTempValue - minTempValue + 1; i++) {
        graphics.beginPath();
        graphics.lineWidth = 2;
        graphics.moveTo(0, pointsFromValue * i);
        graphics.lineTo(canvas.width, pointsFromValue * i);
        graphics.fillText((maxTempValue - i).toString(), 11, pointsFromValue * i + 10);
        graphics.strokeStyle = "lightgray";
        graphics.stroke();

        graphics.beginPath();
        graphics.lineWidth = 2;
        graphics.moveTo(0, pointsFromValue * i);
        graphics.lineTo(10, pointsFromValue * i);
        graphics.strokeStyle = "lightgray";
        graphics.stroke();
    }


    for (let i = 0; i < results.length; i++) {
        graphics.beginPath();
        graphics.lineWidth = 2;
        graphics.moveTo(i * pointsFromRecord + 25, 0);
        graphics.lineTo(i * pointsFromRecord + 25, canvas.height);
        graphics.strokeStyle = "lightgray";
        graphics.stroke();

        graphics.fillText((i + 1).toString(), i * pointsFromRecord + 27, canvas.height - 3);
    }

    for (let i = 0; i < results.length - 1; i++) {
        let current = results[i], next = results[i + 1];
        drawCanvasLine(Number(current[2]) - minTempValue, Number(next[2]) - minTempValue, pointsFromRecord, pointsFromValue, "blue", graphics, i, canvas.height);
        drawCanvasLine(Number(current[3])- minTempValue, Number(next[3]) - minTempValue, pointsFromRecord, pointsFromValue, "green", graphics, i, canvas.height);
        drawCanvasLine(Number(current[4]) - minTempValue, Number(next[4]) - minTempValue, pointsFromRecord, pointsFromValue, "red", graphics, i, canvas.height);
    }
}

// Анализ данных (подсчет данных)
function calc() {
    let minTemp = document.getElementById("min_temp"),
        maxTemp = document.getElementById("max_temp"),
        avgTemp = document.getElementById("avg_temp"),
        sumRain = document.getElementById("sum_rain");

    minTempValue = Number.MAX_VALUE;
    maxTempValue = Number.MIN_VALUE;
    avgTempValue = 0;
    sumRainValue = 0;

    for (let i = 0; i < results.length; i++) {
        let current = results[i];
        let minTemp = Number(current[2]);

        if (minTemp < minTempValue) {
            minTempValue = minTemp;
        }

        let maxTemp = Number(current[4]);

        if (maxTemp > maxTempValue) {
            maxTempValue = maxTemp;
        }

        avgTempValue += Number(current[3]);
        sumRainValue += Number(current[5].replace(",", "."));
    }

    sumRain.innerHTML = (Math.round(sumRainValue * 10) / 10).toString();
    minTemp.innerHTML = minTempValue.toString();
    maxTemp.innerHTML = maxTempValue.toString();
    avgTemp.innerHTML = (Math.round(avgTempValue / results.length * 10) / 10).toString();

    maxTempValue += 1;
}

// Метод для сохранения графика.
function save() {
    let canvas = document.getElementById('graph');

    canvas.toBlob(function(blob) {
        let url = URL.createObjectURL(blob);
        window.open(url);
    });
}
