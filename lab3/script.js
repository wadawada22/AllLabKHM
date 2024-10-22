const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');
let rotationAngle = 0;
let projectionMode = 0;

if (!gl) {
    console.error("Неможливо ініціалізувати WebGL.");
}

const vertexShaderSource = `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uMatrix;
varying vec4 vColor;
void main(void) {
    gl_Position = uMatrix * aPosition;
    vColor = aColor;
}
`;

const fragmentShaderSource = `
precision mediump float;
varying vec4 vColor;
void main(void) {
    gl_FragColor = vColor;
}
`;


//допоміжні функції
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking program", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getAttribLocation(program, "aColor");
const matrixLocation = gl.getUniformLocation(program, "uMatrix");

const positions = new Float32Array([ //вершини кубу
    // передня сторона
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    // задня сторона
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,
    // верхня сторона
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
    // нижня сторона
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    // права сторона
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,
    // ліва сторона
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
]);

const colors = new Float32Array([ //кольори кубу
    // червоний 
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
    // зелений
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 0, 1,
    // синій
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    // жовтий
    1, 1, 0, 1,
    1, 1, 0, 1,
    1, 1, 0, 1,
    1, 1, 0, 1,
    // фіолетоввий
    1, 0, 1, 1,
    1, 0, 1, 1,
    1, 0, 1, 1,
    1, 0, 1, 1,
    // блакитнийц
    0, 1, 1, 1,
    0, 1, 1, 1,
    0, 1, 1, 1,
    0, 1, 1, 1,
]);

//кожна сторона складатиметься з двох трикутників.
const indices = new Uint16Array([
    // передня сторона
    0, 1, 2,    0, 2, 3,
    // задня сторона
    4, 5, 6,    4, 6, 7,
    // верхня сторона
    8, 9, 10,   8, 10, 11,
    // нижня сторона
    12, 13, 14, 12, 14, 15,
    // права сторона
    16, 17, 18, 16, 18, 19,
    // ліва сторона
    20, 21, 22, 20, 22, 23
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

function setOrthogonalProjection() {
    projectionMode = 0;
    
    const left = -1;
    const right = 1;
    const bottom = -1;
    const top = 1;
    const near = 0.1;
    const far = 100;

    const orthogonalMatrix = mat4.create();
    mat4.ortho(orthogonalMatrix, left, right, bottom, top, near, far);
    mat4.translate(orthogonalMatrix, orthogonalMatrix, [0, 0, -2]);

    drawScene(orthogonalMatrix);
}

function setPerspectiveProjection() {
    projectionMode = 1;

    const fov = Math.PI / 4;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 100;

    const perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, fov, aspect, near, far);
    mat4.translate(perspectiveMatrix, perspectiveMatrix, [0, 0, -2]);

    drawScene(perspectiveMatrix);
}

function drawScene(matrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.rotateX(matrix, matrix, rotationAngle);
    mat4.rotateY(matrix, matrix, rotationAngle);
    mat4.rotateZ(matrix, matrix, rotationAngle);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}


function animate() {
    rotationAngle += 0.01;

    projectionMode == 0? setOrthogonalProjection(): setPerspectiveProjection();

    requestAnimationFrame(animate);
}

gl.clearColor(0, 0, 0, 0.1);
gl.enable(gl.DEPTH_TEST);

setOrthogonalProjection();
animate();