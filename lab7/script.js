const canvas = document.getElementById("myCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL не підтримується.");
}

const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;

    void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

const vertices = new Float32Array([
    // Позиції      // Коорд.Текстури
    -0.5,  0.5,      0.0, 1.0,
    -0.5, -0.5,      0.0, 0.0,
     0.5,  0.5,      1.0, 1.0,
     0.5, -0.5,      1.0, 0.0
]);

const indices = new Uint16Array([
    0, 1, 2,
    2, 1, 3
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const aPositionLocation = gl.getAttribLocation(program, "a_position");
const aTexCoordLocation = gl.getAttribLocation(program, "a_texCoord");

gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(aPositionLocation);

gl.vertexAttribPointer(aTexCoordLocation, 2, gl.FLOAT, false, 16, 8);
gl.enableVertexAttribArray(aTexCoordLocation);

const textures = [];
let currentTextureIndex = 0;

function loadTexture(imageSrc) {
    const texture = gl.createTexture();
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        textures.push(texture);
        if (textures.length === 1) {
            requestAnimationFrame(render);
        }
    };
}

loadTexture('texture1r.png');
loadTexture('texture2r.png'); 

canvas.addEventListener("click", () => {
    currentTextureIndex = (currentTextureIndex + 1) % textures.length;
    requestAnimationFrame(render);
});

const uTextureLocation = gl.getUniformLocation(program, "u_texture");

function render() {
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, textures[currentTextureIndex]);
    gl.uniform1i(uTextureLocation, 0);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

requestAnimationFrame(render);