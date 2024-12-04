const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

const vertexShaderSrc = `
    attribute vec2 a_Position;
    attribute vec3 a_Color;
    attribute vec2 a_TexCoord;
    varying vec3 v_Color;
    varying vec2 v_TexCoord;

    uniform mat4 u_ModelViewProjectionMatrix;

    void main() {
        gl_Position = u_ModelViewProjectionMatrix * vec4(a_Position, 0.0, 1.0);
        v_Color = a_Color;
        v_TexCoord = a_TexCoord;
    }

`;


const fragmentShaderSrc = `
    precision mediump float;

    varying vec3 v_Color;
    varying vec2 v_TexCoord;

    uniform sampler2D u_Sampler;
    uniform vec3 u_LightPosition;
    uniform vec3 u_ViewPosition;

    void main() {
        vec3 ambient = 0.1 * v_Color;

        vec3 lightDir = normalize(u_LightPosition - vec3(v_TexCoord, 0.0));
        float diff = max(dot(lightDir, normalize(v_Color)), 0.0);
        vec3 diffuse = diff * v_Color;

        vec3 viewDir = normalize(u_ViewPosition - vec3(v_TexCoord, 0.0));
        vec3 reflectDir = reflect(-lightDir, normalize(v_Color));
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = spec * vec3(1.0, 1.0, 1.0);

        vec4 textureColor = texture2D(u_Sampler, v_TexCoord);

        gl_FragColor = vec4((ambient + diffuse + specular) * textureColor.rgb, 1.0);
    }

`;

const program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
gl.useProgram(program);

// функція для створення шейдера
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// функція для створення програми
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// кінцевий рендер
function render(gl, program) {
    const u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    const lightPosition = [1.0, 0.0, 1.0]; // положення світла
    gl.uniform3fv(u_LightPosition, lightPosition);

    const u_ModelViewProjectionMatrix = gl.getUniformLocation(program, 'u_ModelViewProjectionMatrix');
    const modelViewProjectionMatrix = mat4.create(); 
    mat4.perspective(modelViewProjectionMatrix, Math.PI / 4, 1, 0.1, 10);
    mat4.translate(modelViewProjectionMatrix, modelViewProjectionMatrix, [0, -1, -1]); // трохи пересуваємо фігуру

    gl.uniformMatrix4fv(u_ModelViewProjectionMatrix, false, modelViewProjectionMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 21);
}


function main() {
    const points = new Float32Array([
        -0.4, 1.4, -0.05, 1.4, -0.1, 1.3,  // Трикутник 1
        -0.4, 1.4, -0.1, 1.3, -0.3, 1.3,  // Трикутник 2
        -0.4, 1.4, -0.3, 1.3, -0.3, 1.1,  // Трикутник 3
        -0.4, 1.4, -0.3, 1.1, -0.4, 1.1,  // Трикутник 4
        -0.4, 1.1, -0.3, 1.1, -0.05, 1.0, // Трикутник 5
        -0.4, 1.1, -0.05, 1.0, -0.1, 0.8, // Трикутник 6
        -0.4, 1.1, -0.1, 0.8, -0.4, 0.8,  // Трикутник 7
    ]);

    const colors = new Float32Array([
        1.0, 1.0, 0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0, 0.3, 0.4,
        0.4, 1.0, 0.2, 1.0, 0.0, 1.0,
        0.5, 0.5, 0.5, 1.0, 0.5, 0.0,
        0.0, 0.5, 0.5, 0.5, 0.0, 0.5,
        1.0, 0.0, 0.5, 0.5, 0.0, 0.5,
        0.5, 0.5, 0.5, 1.0, 0.5, 0.0,
        0.5, 0.5, 0.5, 1.0, 0.5, 0.0,
        0.0, 0.5, 0.5, 0.5, 0.0, 0.5,
        1.0, 1.0, 0.5, 1.0, 0.5, 1.0,
        0.5, 1.0, 0.5, 1.0, 0.3, 0.4,
    ]);

    const texCoords = new Float32Array([
        1.0, 0.0, 
        0.5, 0.5, 
        0.3, 0.1, 
        1.0, 0.0, 
        0.5, 0.5, 
        0.3, 0.1, 

        1.0, 0.0, 
        0.5, 0.5, 
        0.3, 0.1, 
        1.0, 0.0, 
        0.5, 0.5,
        0.3, 0.1,
        
        1.0, 0.0,
        0.5, 0.5,
        0.3, 0.1,
        1.0, 0.0,
        0.5, 0.5, 
        0.3, 0.1,

        1.0, 0.0,
        0.5, 0.5,
        0.3, 0.1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.enableVertexAttribArray(a_Color);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
    gl.enableVertexAttribArray(a_TexCoord);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);

    //застосування текстури
    const u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
    const texture = gl.createTexture();
    const image = new Image();
    image.onload = () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(u_Sampler, 0);

        render(gl, program);
    };
    image.src = 'texture.png';
}

window.onload = main;
