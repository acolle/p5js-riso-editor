const risoColours_ = [
  'BLACK',
  'BURGUNDY',
  'BLUE',
  'GREEN',
  'MEDIUMBLUE',
  'BRIGHTRED',
  'RISOFEDERALBLUE',
  'PURPLE',
  'TEAL',
  'FLATGOLD',
  'HUNTERGREEN',
  'RED',
  'BROWN',
  'YELLOW',
  'MARINERED',
  'ORANGE',
  'FLUORESCENTPINK',
  'LIGHTGRAY',
  'METALLICGOLD',
  'CRIMSON',
  'FLUORESCENTORANGE',
  'CORNFLOWER',
  'SKYBLUE',
  'SEABLUE',
  'LAKE',
  'INDIGO',
  'MIDNIGHT',
  'MIST',
  'GRANITE',
  'CHARCOAL',
  'SMOKYTEAL',
  'STEEL',
  'SLATE',
  'TURQUOISE',
  'EMERALD',
  'GRASS',
  'FOREST',
  'SPRUCE',
  'MOSS',
  'SEAFOAM',
  'KELLYGREEN',
  'LIGHTTEAL',
  'IVY',
  'PINE',
  'LAGOON',
  'VIOLET',
  'ORCHID',
  'PLUM',
  'RAISIN',
  'GRAPE',
  'SCARLET',
  'TOMATO',
  'CRANBERRY',
  'MAROON',
  'RASPBERRYRED',
  'BRICK',
  'LIGHTLIME',
  'SUNFLOWER',
  'MELON',
  'APRICOT',
  'PAPRIKA',
  'PUMPKIN',
  'BRIGHTOLIVEGREEN',
  'BRIGHTGOLD',
  'COPPER',
  'MAHOGANY',
  'BISQUE',
  'BUBBLEGUM',
  'LIGHTMAUVE',
  'DARKMAUVE',
  'WINE',
  'GRAY',
  'CORAL',
  'WHITE',
  'AQUA',
  'MINT',
  'CLEARMEDIUM',
  'FLUORESCENTYELLOW',
  'FLUORESCENTRED',
  'FLUORESCENTGREEN'
]

let img;
let imgRatio;
let imgWidth;
let imgHeight;
let ctx;
let risoColours;
let risoObjects;
let risoLayersSelected = [];
let risoMode = false;

//
let blue, red;

function preload() {

  img = loadImage('/img/picasso_copy.jpg'); // test portrait
  // img = loadImage('https://uploads4.wikiart.org/images/pablo-picasso/a-muse-1935.jpg'); // test landscape
  // img = loadImage('https://64.media.tumblr.com/ed593c97761ec4b4f3a7530aa6feb332/tumblr_o2huotdmcU1utardvo1_500.jpg'); // test smaller than canvas
  // img = loadImage('https://64.media.tumblr.com/b48a167e61792906739a7aa57f56e285/098e9abddf2179ec-a1/s500x750/c1f4ca69b90d44fc99c084bf3509352437096ced.jpg'); //NSFW
}

function setup_() {
  // create canvas
  // ctx = createCanvas(8.5 * 72, 11 * 72);
  ctx = createCanvas(windowWidth * 0.9, windowHeight * 0.9);
  ctx.parent("canvas");

  // get image ratio: > 1 if portrait; < 1 if landscape
  imgRatio = img.width / img.weight;
  // depending on ratio, scale down width or height of the image
  imgWidth = imgRatio > 1 ? ctx.width : (img.width * (ctx.height / img.height));
  imgHeight = imgRatio > 1 ? (img.height * (ctx.width / img.width)) : ctx.height;

  // Get all riso colours
  // risoColours = selectAll('.riso-color');
  // for (let i = 0; i < risoColours.length; i++) {
  //   // Add eventListener on riso colours of the selection list
  //   selectAll(`.riso-${risoColours[i].elt.innerHTML}`)[0].mouseClicked(selectUnselectColour);
  // }

  risoObjects = createRisoObjects(risoColours_);
  addColourOptions();

  pixelDensity(1);
  // noLoop();
}

function draw_() {

  background(248, 248, 255);

  if (risoMode) {

    // reset imageMode
    imageMode(CORNER);

    clearRiso();

    for (let i = 0; i < risoLayersSelected.length; i++) {
      if (risoLayersSelected[i]) {
        let risoLayer = risoObjects[risoColours[i]];
        // let extractedColour = extractRGBChannel(img, `${colour}`);
        risoLayer.imageMode(CENTER);
        let slider = select(`#${risoColours[i]}_slider`);
        risoLayer.fill(slider.value());
        if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
          risoLayer.image(
            img,
            ctx.width / 2,
            ctx.height / 2,
            imgWidth,
            imgHeight
          );
        } else {
          risoLayer.image(
            img,
            ctx.width / 2,
            ctx.height / 2,
            img.width,
            img.height
          );
        }
      }
    }

    drawRiso();

  } else {
    // display original image if riso mode not enabled
    imageMode(CENTER);
    // check if the image width or height needs to its rescaled value
    if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
      // image(img, x, y, [width], [height]) where x and y are position of the img
      image(
        img,
        ctx.width / 2,
        ctx.height / 2,
        imgWidth,
        imgHeight,
      );
    } else {
      // neither the w or the h of the image is larger than the canvas - no resclaling needed
      image(img, ctx.width / 2, ctx.height / 2, img.width , img.height);
    }
  }

}

function setup() {
  ctx = createCanvas(windowWidth * 0.9, windowHeight * 0.9);
  // get image ratio: > 1 if portrait; < 1 if landscape
  imgRatio = img.width / img.weight;
  // depending on ratio, scale down width or height of the image
  imgWidth = imgRatio > 1 ? ctx.width : (img.width * (ctx.height / img.height));
  imgHeight = imgRatio > 1 ? (img.height * (ctx.width / img.width)) : ctx.height;

  blue = new Riso('blue');
  red = new Riso('red');
  pixelDensity(1);
  noLoop();
}

function draw() {
  background(248, 248, 255);

  clearRiso();

  let reds = extractRGBChannel(img, "red");
  let blues = extractRGBChannel(img, "blue");
  // let reds = extractCMYKChannel(img, "cyan"); //extract cyan from img
  // let blues = extractCMYKChannel(img, "magenta"); //extract magenta from img

  blue.imageMode(CENTER);
  red.imageMode(CENTER);

  // blue.image(blues, width / 2, height / 2, img.width / 2, img.height / 2);
  // red.image(reds, width / 2, height / 2, img.width / 2, img.height / 2);

  if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
    blue.image(
      blues,
      ctx.width / 2,
      ctx.height / 2,
      imgWidth,
      imgHeight
    );
    red.image(
      reds,
      ctx.width / 2,
      ctx.height / 2,
      imgWidth,
      imgHeight
    );
  } else {
    blue.image(
      blues,
      ctx.width / 2,
      ctx.height / 2,
      img.width,
      img.height
    );
    red.image(
      reds,
      ctx.width / 2,
      ctx.height / 2,
      img.width,
      img.height
    );
  }


  let textGraphic = createGraphics(width, height);
  textGraphic.fill(0);
  textGraphic.textStyle(BOLD);
  textGraphic.textFont('Helvetica');
  textGraphic.textAlign(CENTER, CENTER);
  textGraphic.textSize(60);
  textGraphic.text('SQUAT', width * 0.54, height * 0.63);
  // textGraphic.text('ABOLISH', width * 0.5, height * 0.7);
  // textGraphic.text('ART', width * 0.5, height * 0.8);

  blue.cutout(textGraphic);

  drawRiso();
}


function addColourOptions() {

  // console.log(risoColours[0].elt.style.backgroundColor);

  for (let i = 0; i < risoColours.length; i++) {

    let container = createDiv();
    container.class(`riso-color--container`);
    container.id(`riso-${risoColours[i].elt.innerHTML}--container`);

    // Create all selected riso colours
    let risoColour = createSpan(risoColours[i].elt.innerHTML);
    risoColour.class(`riso-color riso-${risoColours[i].elt.innerHTML}`);
    risoColour.style('background-color', risoColours[i].elt.style.backgroundColor);
    risoColour.style('margin', 'auto');
    risoColour.html(`${risoColours[i].elt.innerHTML}`);
    risoColour.mouseClicked(selectUnselectColour);
    risoColour.parent(container);

    // Create sliders
    let slider = createSlider(0, 255, 128, 1);
    slider.id(`${risoColours[i].elt.innerHTML}_fill_slider`);
    slider.parent(container);

    // TODO: Add other sliders and options

    // Append riso colour container to the menu div
    container.style('display', 'none');
    container.parent('riso-colours--options');

  }
}

function selectUnselectColour() {

  let risoContainer = select(`#riso-${this.elt.innerHTML}--container`);
  if (risoContainer.elt.style.display === 'none') {
    risoContainer.style('display', 'flex')
  } else {
    risoContainer.style('display', 'none')
  }

  // if (this.checked()){
  //   risoMode = true;
  //   risoLayersSelected[risoColours.indexOf(this.value().toUpperCase())] = true;
  // } else {
  //   risoLayersSelected[risoColours.indexOf(this.value().toUpperCase())] = false;
  // }
  //
  // // Check if all unselected to disable risoMode
  // if (!risoLayersSelected.includes(true)) {
  //   risoMode = false;
  // }

}

function createRisoObjects(colours) {
  let risoObject = {}
  for (let i = 0; i < colours.length; i++) {
    let colour = colours[i];
    let riso = new Riso(colour);
    risoObject = {
      ...risoObject,
      [colour]: riso
    }
    risoLayersSelected.push(false);
  }
  return risoObject;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

// Handle keyboard events
function keyPressed() {
  switch(key) {
    case 's':
      exportRiso();
      break;
    default:
      break;
  }
}
