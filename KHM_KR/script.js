const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

const vertexShaderSrc = `
    attribute vec4 a_Position;
    uniform mat4 u_TranslationMatrix;
    void main() {
        gl_Position = u_TranslationMatrix * a_Position;
    }
`;

const fragmentShaderSrc = `
precision mediump float;
void main() {
    gl_FragColor = vec4(0.258, 0.443, 1.0, 1.0);
}
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);


function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
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
        console.error('Program link failed:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

let translation = [0, 0.25, 0];
const translationSpeed = 0.01;
const uTranslationMatrix = gl.getUniformLocation(program, 'u_TranslationMatrix');

function render() {
    translation[1] -= translationSpeed;
    if (translation[1] < -2.5) {
        translation[1] = 0.25; 
    }

    const translationMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        translation[0], translation[1], translation[2], 1.0,
    ]);

    gl.clearColor(1.0, 0.97, 0.79, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(uTranslationMatrix, false, translationMatrix);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 10);  // Б
    gl.drawArrays(gl.TRIANGLE_FAN, 10, 4);  // І
    gl.drawArrays(gl.TRIANGLE_FAN, 14, 4);  // І

    requestAnimationFrame(render); 
}

function main() {
    const points = new Float32Array([
        // Б 1               2              3               4
        -0.4, 1.4,      -0.05, 1.4,     -0.1, 1.3,      -0.3, 1.3,
        //  5                6               7               8
        -0.3, 1.1,      -0.2, 0.9,      -0.3, 1.0,      -0.05, 1.0,
        //   9              10
        -0.1, 0.8,     -0.4, 0.8,

        //I
        0.0, 1.4,       0.1, 1.4,      0.1, 0.8,      0.0, 0.8,

        //I
        0.2, 1.4,       0.3, 1.4,      0.3, 0.8,      0.2, 0.8
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    render(); 
}

window.onload = main;
