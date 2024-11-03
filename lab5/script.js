const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

const vertexShaderSourceBox = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    attribute vec3 aNormal;
    
    uniform mat4 uMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightPosition;
    uniform vec3 uViewPosition;

    varying vec4 vColor;
    varying vec3 vNormal;
    varying vec3 vLightDirection;
    varying vec3 vViewDirection;

    void main(void) {
        gl_Position = uMatrix * aPosition;
        vColor = aColor;
        vNormal = mat3(uNormalMatrix) * aNormal;
        vLightDirection = uLightPosition - (uMatrix * aPosition).xyz;
        vViewDirection = uViewPosition - (uMatrix * aPosition).xyz;
    }
`;

const fragmentShaderSourceBox = `
    precision mediump float;

    varying vec4 vColor;
    varying vec3 vNormal;
    varying vec3 vLightDirection;
    varying vec3 vViewDirection;

    uniform vec3 uLightColor;
    uniform float uShininess;

    void main(void) {
        vec3 normalizedNormal = normalize(vNormal);
        vec3 normalizedLightDirection = normalize(vLightDirection);
        vec3 normalizedViewDirection = normalize(vViewDirection);

        // амбієнт
        vec3 ambient = 0.1 * uLightColor;

        // Ламберт
        float diff = max(dot(normalizedNormal, normalizedLightDirection), 0.0);
        vec3 diffuse = diff * uLightColor;

        // Фонг
        vec3 reflectDir = reflect(-normalizedLightDirection, normalizedNormal);
        float spec = pow(max(dot(normalizedViewDirection, reflectDir), 0.0), uShininess);
        vec3 specular = spec * uLightColor;

        vec3 finalColor = (ambient + diffuse + specular) * vColor.rgb;
        gl_FragColor = vec4(finalColor, vColor.a);
    }
`;


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
const indicesBox = new Uint16Array([
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
const normalsBox = new Float32Array([
    // передня сторона
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    // задня сторона
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // верхня сторона
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    // нижня сторона
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // права сторона
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    // ліва сторона
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
]);

let programBox;
let boxLoc, normalMatrixLoc, lightPosLoc, viewPosLoc, lightColorLoc, shininessLoc;

function initGL() {
    programBox = createShaderProgram(vertexShaderSourceBox, fragmentShaderSourceBox);
    gl.useProgram(programBox);

    boxLoc = gl.getUniformLocation(programBox, 'uMatrix');
    normalMatrixLoc = gl.getUniformLocation(programBox, 'uNormalMatrix');
    lightPosLoc = gl.getUniformLocation(programBox, 'uLightPosition');
    viewPosLoc = gl.getUniformLocation(programBox, 'uViewPosition');
    lightColorLoc = gl.getUniformLocation(programBox, 'uLightColor');
    shininessLoc = gl.getUniformLocation(programBox, 'uShininess');

    setupAttributesAndBuffers(programBox, positionsBox, colorsBox, normalsBox, indicesBox);

    gl.uniform3fv(lightColorLoc, [1.0, 1.0, 1.0]);
    gl.uniform1f(shininessLoc, 32.0); 
}

function setupAttributesAndBuffers(program, positions, colors, normals, indices) {
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

    const normalLoc = gl.getAttribLocation(program, 'aNormal');
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

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
        console.error("Помилка при лінкуванні шейдерної програми: ", gl.getProgramInfoLog(shaderProgram));
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
let angle = 0;
function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    angle += 0.01;

    const uMatrix = mat4.create();
    const uNormalMatrix = mat4.create();
    mat4.perspective(uMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
    mat4.translate(uMatrix, uMatrix, [0, 0, -5]);
    mat4.rotateY(uMatrix, uMatrix, angle);
    //mat4.rotateX(uMatrix, uMatrix, angle);

    mat4.invert(uNormalMatrix, uMatrix);
    mat4.transpose(uNormalMatrix, uNormalMatrix);

    
    const lightX = 3.0; 
    const lightY = 3.0;
    const lightZ = Math.cos(angle) * 2.5;

    gl.uniformMatrix4fv(boxLoc, false, uMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, uNormalMatrix);
    gl.uniform3fv(lightPosLoc, [lightX, lightY, lightZ]);
    gl.uniform3fv(viewPosLoc, [0, 0, 5]);

    gl.drawElements(gl.TRIANGLES, indicesBox.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(animate);
}

initGL();
gl.clearColor(0.8, 0.8, 0.8, 1.0);
gl.enable(gl.DEPTH_TEST);
animate();