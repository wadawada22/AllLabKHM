const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL не підтримується, спроба експериментального WebGL.');
    gl = canvas.getContext('experimental-webgl');
}

const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_PointSize = 10.0;
        gl_Position = vec4(a_position, 0, 1);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// Компілюю та лінкую шейдери
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Знаходжу позицію для даних для вершин
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

// Буфер
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.useProgram(program);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

let currentColor = [1, 0, 0, 1]; // Поточний колір
let backgroundColor = [0, 0, 0, 0]; // Колір фону

let points = []; // Масив точок
let triangles = []; // Масив трикутників
let circles = []; // Масив кіл

let tempTrianglePoints = []; // тимчасовий масив дшля трикутників
let tempCirclePoints = []; // тимчасовий масив для кіл
let tempCircleCenter = null; // тимчасовий масив для центра кола

let drawingMode = 0; // Режим малювання

//малювання точок
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.width * 2 - 1;
    const y = (event.clientY - rect.top) / canvas.height * -2 + 1;

    if (drawingMode === 0) { //якщо обрано режим точок
        points.push([x, y]); 
    } else if (drawingMode === 1) { //якщо обрано режим трикутників
        tempTrianglePoints.push([x, y]);
        points.push([x, y]);

        if (tempTrianglePoints.length === 3) { //якщо трикутник завершено
            triangles.push(...tempTrianglePoints);

            points.splice(points.length - 3, 3);

            tempTrianglePoints = [];
        }
    } else if (drawingMode === 2) { //якщо обрано режим кіл
        if (!tempCircleCenter) {
            tempCircleCenter = [x, y];
            points.push([x, y]); 
        } else { //якщо коло завершено
            const radius = Math.sqrt((x - tempCircleCenter[0]) ** 2 + (y - tempCircleCenter[1]) ** 2);
            const circleVertices = createCircleVertices(tempCircleCenter, radius, 40); // 40 сеґментів

            circles.push(circleVertices);

            points.splice(points.length - 1, 1); 
            points.push([x, y]); 
            points.splice(points.length - 1, 1); 

            tempCircleCenter = null;
        }
    }
    drawAll();
});

// хендлінг кнопки для очищення канвасу
document.getElementById('clearButton').addEventListener('click', function() {
    points = [];
    triangles = [];
    circles = [];
    tempTrianglePoints = [];
    tempCircleCenter = null;
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
});

// хендлінг вибору кольора
document.getElementById('colorPicker').addEventListener('input', function(event) {
    const hexColor = event.target.value;
    currentColor = hexToRGBArray(hexColor);
    drawAll();
});

document.getElementById('bgColorPicker').addEventListener('input', function(event) {
    const hexColor = event.target.value;
    backgroundColor = hexToRGBArray(hexColor);
});

document.getElementById('pointButton').addEventListener('click', function() {
    drawingMode = 0;
    document.getElementById('chosenMode').innerText = "Обрано: ■";
});

document.getElementById('triangleButton').addEventListener('click', function() {
    drawingMode = 1;
    document.getElementById('chosenMode').innerText = "Обрано: ▲";
});

document.getElementById('circleButton').addEventListener('click', function() {
    drawingMode = 2;
    document.getElementById('chosenMode').innerText = "Обрано: ⬤";
});

// Функція для переводу з хекса в RGB
function hexToRGBArray(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255,
        1.0
    ];
}

function drawAll() {
    gl.uniform4fv(colorUniformLocation, currentColor);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    if (points.length > 0) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points.flat()), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, points.length);
    }

    if (triangles.length >= 3) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles.flat()), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
    }

    circles.forEach(circleVertices => {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices.flat()), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length);
    });
}

//Допоміжні функції
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createCircleVertices(center, radius, segments) {
    const vertices = [center];
    const angleStep = (Math.PI * 2) / segments;

    for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        const x = center[0] + radius * Math.cos(angle);
        const y = center[1] + radius * Math.sin(angle);
        vertices.push([x, y]);
    }

    return vertices;
}

gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
gl.clear(gl.COLOR_BUFFER_BIT);