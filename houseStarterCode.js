"use strict";

var canvas;
var gl;

var points = [
    vec4(-2.5, 2.5, 0, 1), // 0 main house
    vec4(-2.5, 0, 0, 1),
    vec4(2.5, 0, 0, 1),
    vec4(2.5, 2.5, 0, 1),
    vec4(0, 3.75, 0, 1),

    vec4(-0.5, 0, 0, 1), // 5 window
    vec4(0.5, 0, 0, 1),
    vec4(0.5, 0.5, 0, 1),
    vec4(-0.5, 0.5, 0, 1),

    vec4(-0.75, 0, 0, 1), // 9 door
    vec4(0.75, 0, 0, 1),
    vec4(0.75, 1.45, 0, 1),
    vec4(-0.75, 1.45, 0, 1),

    vec4(0, 0.4, 0, 1), // 13 diamond
    vec4(-0.5, 0.0, 0, 1),
    vec4(0, -0.4, 0, 1),
    vec4(0.5, 0.0, 0, 1)
];

var colors = [
    vec4(0.43, 0.0, 0.5, 1.0), // 0 main house purple
    vec4(0.43, 0.0, 0.5, 1.0),
    vec4(0.43, 0.0, 0.5, 1.0),
    vec4(0.43, 0.0, 0.5, 1.0),
    vec4(0.43, 0.0, 0.5, 1.0),

    vec4(0.5, 0.75, 1.0, 1.0), // 5 window
    vec4(0.5, 0.75, 1.0, 1.0),
    vec4(0.5, 0.75, 1.0, 1.0),
    vec4(0.5, 0.75, 1.0, 1.0),

    vec4(1.0, 1.0, 0.75, 1.0), // 9 door
    vec4(1.0, 1.0, 0.75, 1.0),
    vec4(1.0, 1.0, 0.75, 1.0),
    vec4(1.0, 1.0, 0.75, 1.0),

    vec4(1.0, 0.65, 0.85, 1.0), // 13 diamond
    vec4(1.0, 0.65, 0.85, 1.0),
    vec4(1.0, 0.65, 0.85, 1.0),
    vec4(1.0, 0.65, 0.85, 1.0)
];

var numVertices  = points.length;

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye, at, up;

var number=1;

var theta=0;
var theta2=0;

var down=true;
var ty=0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
	
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(0.0, 0.0, 1.5);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	//Create your color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	//Create your vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//Model and Projection Buffers
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

	//Set up Ortho Projections
    projectionMatrix = ortho(-4, 4, 0, 4, 3, -3);
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );


    render();
}

function drawHouse(){
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
}

function drawWindows(){
    let windowMatrix = mult(modelViewMatrix, translate(-1.5, 1.65, 0)); // left top window
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(windowMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 5, 4);

    windowMatrix = mult(modelViewMatrix, translate(1.5, 1.65, 0)); // right top window
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(windowMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 5, 4);
    
    windowMatrix = mult(modelViewMatrix, mult(scalem(1, 1.5, 1), translate(-1.5, 0.35, 0))); // left bottom window
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(windowMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 5, 4);

    windowMatrix = mult(modelViewMatrix, mult(scalem(1, 1.5, 1), translate(1.5, 0.35, 0))); // right bottom window
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(windowMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 5, 4);

    let reset = mult(modelViewMatrix, translate(0, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(reset));
}

function drawDoor(){
    let doorMatrix = mult(modelViewMatrix, translate(0, ty, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(doorMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 9, 4);

    let reset = mult(modelViewMatrix, translate(0, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(reset));
}

function drawDiamond(){
    let diamondMatrix = mult(modelViewMatrix, mult(translate(0, 3, 0), rotateZ(theta)));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(diamondMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 13, 4);

    let reset = mult(modelViewMatrix, translate(0, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(reset));
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    drawWindows();
    if (down) {
        ty-=0.01;
        if (ty <= -1.45) {
            down=false;
        }
    }
    else {
        ty+=0.01;
        if (ty >= 0) {
            down=true;
        }
    }
    
    theta += 0.25;

    drawDoor();
    drawDiamond();
    drawHouse();

    window.requestAnimationFrame(render);
}
