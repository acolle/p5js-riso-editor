let black;
let img;
let ditherType = 'atkinson';
let s = 200;

function preload() {
  img = loadImage('/img/rosa.jpg');
}

function setup() {
  pixelDensity(1);
  createCanvas(11 * 150, 8 * 150);

  black = new Riso('black', 11 * 150, 8 * 150);

  noLoop();
}


function draw() {

  clearRiso();

  for (var x = 1; x < 5; x = x + 1) {
    for (var y = 0; y < 5; y = y + 1) {
      ditherTypes(x); //custom function to set dither type
      let dithered = ditherImage(img, ditherType, y * 50); //dither img object
      black.image(dithered, x * s, (black.height - 300) - y * s, s, s); //draw image to black layer
      if (x == 1) { //write numbers along first column
        black.text(y * 50, x * s - 25, (black.height - 300) - y * s + 100, s, s);
      }
    }
  }

  //draw dither labels
  black.text('atkinson', 200, 90);
  black.text('floydsteinberg', 400, 90);
  black.text('bayer', 600, 90);
  black.text('none', 800, 90);
  drawRiso();
  noLoop();
}

function inverseColor(r,g,b){
  //get the mathmatical inverse
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;
  return color(r,g,b);
}

function ditherTypes(x) {
  if (x == 1) ditherType = 'atkinson';
  else if (x == 2) ditherType = 'floydsteinberg';
  else if (x == 3) ditherType = 'bayer';
  else if (x == 4) ditherType = 'none';
}
