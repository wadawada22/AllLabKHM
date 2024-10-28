const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

const vertexShaderSourceBox = `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uMatrix;
varying vec4 vColor;
void main(void) {
    gl_Position = uMatrix * aPosition;
    vColor = aColor;
}
`;

const fragmentShaderSourceBox = `
precision mediump float;
varying vec4 vColor;
void main(void) {
    gl_FragColor = vColor;
}
`;

const vertexShaderSourceLid = vertexShaderSourceBox;

const fragmentShaderSourceLid = fragmentShaderSourceBox;

const positionsBox = new Float32Array([ //вершини кубу
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
const colorsBox = new Float32Array([ //кольори кубу
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
const indicesBox = new Uint16Array([// передня сторона
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

const positionsLid = new Float32Array(positionsBox);  
const colorsLid = new Float32Array(colorsBox);
const indicesLid = new Uint16Array(indicesBox);

let thetaY = 0;                    
let lidRotationX = 0;             
const MAX_LID_ROTATION = Math.PI / 2;  // 90 
const INITIAL_ROTATION_X = Math.PI / 6;  // 30 

const aspectRatio = canvas.clientWidth / canvas.clientHeight;
const fieldOfView = Math.PI / 4;  // 45 
const near = 0.1;
const far = 100.0;

let programBox, programLid;
let boxLoc, lidLoc;
let perspectiveMatrix = mat4.create();
mat4.perspective(perspectiveMatrix, fieldOfView, aspectRatio, near, far);

function initGL_1() {
    programBox = createShaderProgram(vertexShaderSourceBox, fragmentShaderSourceBox);
    boxLoc = gl.getUniformLocation(programBox, 'uMatrix');
    setupAttributesAndBuffers(programBox, positionsBox, colorsBox, indicesBox);
}

function initGL_2() {
    programLid = createShaderProgram(vertexShaderSourceLid, fragmentShaderSourceLid);
    lidLoc = gl.getUniformLocation(programLid, 'uMatrix');
    setupAttributesAndBuffers(programLid, positionsLid, colorsLid, indicesLid);
}

function setupAttributesAndBuffers(program, positions, colors, indices) {
    gl.useProgram(program);

    const positionLoc = gl.getAttribLocation(program, 'aPosition');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    const colorLoc = gl.getAttribLocation(program, 'aColor');
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    if (indices) {
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }
}


function createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Помилка при лінкуванні шейдерної програми:", gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return null;
    }
    return shaderProgram;
}

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Помилка при компіляції шейдера: ${type}`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const skeletonPoint = [0.5, 0.5, 0.5];

function draw_crate() {
    gl.useProgram(programBox);

    const boxPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsBox, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(programBox, 'aPosition');
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    const colorLoc = gl.getAttribLocation(programBox, 'aColor');
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorsBox, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBox, gl.STATIC_DRAW);

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [0, 0, -3.0]);
    mat4.rotateX(modelMatrix, modelMatrix, INITIAL_ROTATION_X);
    mat4.rotateY(modelMatrix, modelMatrix, thetaY);

    const finalMatrix = mat4.create();
    mat4.multiply(finalMatrix, perspectiveMatrix, modelMatrix);
    gl.uniformMatrix4fv(boxLoc, false, finalMatrix);

    gl.drawElements(gl.TRIANGLES, indicesBox.length, gl.UNSIGNED_SHORT, 0);
}

function draw_lid() {
    gl.useProgram(programLid);

    const lidPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lidPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsLid, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(programLid, 'aPosition');
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    const colorLoc = gl.getAttribLocation(programLid, 'aColor');
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorsLid, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesLid, gl.STATIC_DRAW);

    const modelMatrix = mat4.create();

    mat4.translate(modelMatrix, modelMatrix, [0, 0, -3.0]);

    mat4.rotateX(modelMatrix, modelMatrix, INITIAL_ROTATION_X);
    mat4.rotateY(modelMatrix, modelMatrix, thetaY);

    mat4.translate(modelMatrix, modelMatrix, skeletonPoint);
    mat4.rotateX(modelMatrix, modelMatrix, lidRotationX);
    mat4.scale(modelMatrix, modelMatrix, [1, 0.1, 1]);
    mat4.translate(modelMatrix, modelMatrix, [-skeletonPoint[0], -skeletonPoint[1], -skeletonPoint[2]]);

    // mat4.translate(modelMatrix, modelMatrix, [0, -0.05, 3.0]);
    // mat4.scale(modelMatrix, modelMatrix, [1, 0.1, 1]);
    // mat4.translate(modelMatrix, modelMatrix, [0, 0.05, -3.0]);

    const finalMatrix = mat4.create();
    mat4.multiply(finalMatrix, perspectiveMatrix, modelMatrix);
    gl.uniformMatrix4fv(lidLoc, false, finalMatrix);

    gl.drawElements(gl.TRIANGLES, indicesLid.length, gl.UNSIGNED_SHORT, 0);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_crate();
    draw_lid();
    requestAnimationFrame(render);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        thetaY -= 0.1;
    } else if (event.key === 'ArrowRight') {
        thetaY += 0.1;
    } else if (event.key === 'ArrowUp') {
        if (lidRotationX < MAX_LID_ROTATION) {
            lidRotationX += 0.05;
        }
    } else if (event.key === 'ArrowDown') {
        if (lidRotationX > 0) {
            lidRotationX -= 0.05;
        }
    }
});

function main() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    initGL_1();
    initGL_2();

    // console.log(programBox);
    // console.log(programLid);

    render();
}

main();
