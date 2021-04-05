let ctx;

let img;
let imgRatio;
let imgWidth;
let imgHeight;

let blue, bubblegum, yellow;

let randomPosX = true;
let randomPosXMin = -10;
let randomPosXMax = 10;

let randomPosY = true;
let randomPosYMin = -10;
let randomPosYMax = 10;

function preload() {
  // img = loadImage('/img/picasso_copy.jpg');
  // img = loadImage('https://uploads4.wikiart.org/images/pablo-picasso/a-muse-1935.jpg'); // test landscape
  img = loadImage('img/rosa.jpg');
  // img = loadImage('/img/gradient.png');
  // img = loadImage('/img/lips.jpg');
  // img = loadImage('/img/squat.jpg');
  // img = loadImage('/img/temp_2.webp');
}

function setup() {
  ctx = createCanvas(windowWidth * 0.9, windowHeight * 0.9);
  // get image ratio: > 1 if portrait; < 1 if landscape
  imgRatio = img.width / img.height;
  // depending on ratio, scale down width or height of the image
  imgWidth = imgRatio > 1 ? ctx.width : (img.width * (ctx.height / img.height));
  imgHeight = imgRatio > 1 ? (img.height * (ctx.width / img.width)) : ctx.height;

  // create riso layers
  blue = new Riso('blue');
  bubblegum = new Riso('bubblegum');
  yellow = new Riso('yellow');

  pixelDensity(1);
  noLoop();
}

function draw() {

  clearRiso();

  blue.imageMode(CENTER);
  bubblegum.imageMode(CENTER);
  yellow.imageMode(CENTER);

  let dithered_1 = ditherImage(img, 'none', 255);
  let dithered_2 = ditherImage(img, 'none', 200);
  let dithered_3 = ditherImage(img, 'none', 120);

  if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
    yellow.image(
      dithered_1,
      ctx.width / 2 + (randomPosX ? random(randomPosXMin, randomPosXMax) : 0),
      ctx.height / 2 + (randomPosY ? random(randomPosYMin, randomPosYMax) : 0),
      imgWidth,
      imgHeight
    );

    bubblegum.image(
      dithered_2,
      ctx.width / 2 + (randomPosX ? random(randomPosXMin, randomPosXMax) : 0),
      ctx.height / 2 + (randomPosY ? random(randomPosYMin, randomPosYMax) : 0),
      imgWidth,
      imgHeight
    );

    blue.image(
      dithered_3,
      ctx.width / 2 + (randomPosX? random(randomPosXMin, randomPosXMax) : 0),
      ctx.height / 2 + (randomPosY ? random(randomPosYMin, randomPosYMax) : 0),
      imgWidth,
      imgHeight
    );

  } else {
    yellow.image(
      dithered_1,
      ctx.width / 2 + (randomPosX ? random(randomPosXMin, randomPosXMax) : 0),
      ctx.height / 2 + (randomPosY ? random(randomPosYMin, randomPosYMax) : 0),
      img.width,
      img.height
    );

    bubblegum.image(
      dithered_2,
      ctx.width / 2 + (randomPosX ? random(randomPosXMin, randomPosXMax) : 0),
      ctx.height / 2 + (randomPosY ? random(randomPosYMin, randomPosYMax) : 0),
      img.width,
      img.height
    );

    blue.image(
      dithered_3,
      ctx.width / 2 + (randomPosX ? random(randomPosXMin, randomPosXMax) : 0),
      ctx.height / 2 + (randomPosY ? random(randomPosYMin, randomPosYMax) : 0),
      img.width,
      img.height
    );

  }

  yellow.cutout(bubblegum);
  bubblegum.cutout(blue);
  blue.cutout(yellow);

  drawRiso();
}

function keyPressed() {
  switch(key) {
    case 's':
      exportRiso();
      break;
    default:
      break;
  }
}
