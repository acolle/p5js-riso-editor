let ctx;

let img;
let imgRatio;
let imgWidth;
let imgHeight;

let risoColours;
let risoObjects;
let risoLayersSelected = [];
let risoMode = false;
let ditherType = 'atkinson';

const CURATEDRISOPALETTES = [
  { palette: 'comics', colours: [
    { name: 'BLUE', colour_hex: '#0078bf', colour_arr: [0, 120, 191]},
    { name: 'BUBBLEGUM', colour_hex: '#f984ca', colour_arr: [249, 132, 202]},
    { name: 'YELLOW', colour_hex: '#ffe800', colour_arr: [255, 232, 0]}
  ] },
  { palette: 'azerty', colours: [
    { name: 'AQUA', colour_hex: '#5ec8e5', colour_arr: [94, 200, 229]},
    { name: 'BRIGHTRED', colour_hex: '#f15060', colour_arr: [241, 80, 96]}
  ] },
  { palette: 'valorant', colours: [
    { name: 'MINT', colour_hex: '#82d8d5', colour_arr: [130, 216, 213]},
    { name: 'YELLOW', colour_hex: '#ffe800', colour_arr: [255, 232, 0]},
    { name: 'STEEL', colour_hex: '#375e77', colour_arr: [55, 94, 119]}
  ] },
  { palette: 'kingdom', colours: [
    { name: 'MINT', colour_hex: '#82d8d5', colour_arr: [130, 216, 213]},
    { name: 'FLUORESCENTORANGE', colour_hex: '#ff7477', colour_arr: [255, 116, 119]},
    { name: 'STEEL', colour_hex: '#375e77', colour_arr: [55, 94, 119]}
  ] }
]

// Randomise overlay of layers
let randomPosX = true;
let randomPosXMin = -10;
let randomPosXMax = 10;
let randomPosY = true;
let randomPosYMin = -10;
let randomPosYMax = 10;

function preload() {
  // img = loadImage('/img/picasso_copy.jpg');
  // img = loadImage('https://uploads4.wikiart.org/images/pablo-picasso/a-muse-1935.jpg'); // test landscape
  // img = loadImage('/img/picasso_stravinsky.jpg');
  // img = loadImage('/img/skull.jpg');
  img = loadImage('img/rosa.jpg');
  // img = loadImage('/img/gradient.png');
  // THP - page 79 included no polaroid format
  // img = loadImage('/img/lips.jpg');
  // img = loadImage('/img/squat.jpg');
}

function setup() {
  // Separate actions in another function to allow reset canvas without refresh
  reset();
}

function reset() {
  // create canvas
  ctx = createCanvas(windowWidth * 0.9, windowHeight * 0.9);
  ctx.parent("canvas");

  // get image ratio: > 1 if portrait; < 1 if landscape
  imgRatio = img.width / img.weight;
  // depending on ratio, scale down width or height of the image
  imgWidth = imgRatio > 1 ? ctx.width : (img.width * (ctx.height / img.height));
  imgHeight = imgRatio > 1 ? (img.height * (ctx.width / img.width)) : ctx.height;

  // Get all riso elements from the DOM
  risoColours = selectAll('.riso-colour');
  // Add
  addRisoSelection(risoColours);
  addRisoSuggestion(risoColours, CURATEDRISOPALETTES);

  // Create array of Riso colour names
  risoColours = risoColours.map(colour => colour.elt.innerHTML);

  for (let i = 0; i < risoColours.length; i++) {
    // Add eventListener on riso colours of the selection list
    selectAll(`.riso-${risoColours[i]}`)[1].mouseClicked(selectUnselectColour);
  }

  // Create all Riso objects
  risoObjects = createRisoObjects(risoColours);

  pixelDensity(1);
  noLoop();
}

function draw() {

  background(248, 248, 255);

  if (risoMode) {
    // reset imageMode
    imageMode(CORNER);

    clearRiso();

    // let dithered_1 = ditherImage(img, 'none', 255);
    // let dithered_2 = ditherImage(img, 'none', 120);
    // let dithered_3 = ditherImage(img, 'none', 60);

    for (let i = 0; i < risoLayersSelected.length; i++) {
      if (risoLayersSelected[i]) {
        //
        let risoLayer = risoObjects[risoColours[i]];
        risoLayer.imageMode(CENTER);
        let slider = select(`#${risoColours[i]}_fill_slider`);
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

function draw_() {
  // RGB/CNYK Channels & Dither serve as the masters
  // RGB channels
  let red_c = extractRGBChannel(img, "red");
  let green_c = extractRGBChannel(img, "green");
  let blue_c = extractRGBChannel(img, "blue");
  // CMYK channels
  let cyan_c = extractCMYKChannel(img, "cyan");
  let magenta_c = extractCMYKChannel(img, "magenta");
  let yellow_c = extractCMYKChannel(img, "yellow");
  let black_c = extractCMYKChannel(img, "black");
  // dither image before applying riso layers - atkinson, floydsteinberg, bayer, none
  // dark/cool colours -> low threshold on img + RGB channels
  // warm/highlight colours -> low threshold on img + RGB channels
  // start with highlights -> all background
  // add darker and darker layers on top
  // cut if necessary
  let dithered_1 = ditherImage(img, 'none', 255);
  let dithered_2 = ditherImage(img, 'none', 120);
  let dithered_3 = ditherImage(img, 'none', 60);
}


function addRisoSelection(risoElements) {

  for (let i = 0; i < risoElements.length; i++) {
    // Create all selected riso colours
    let risoColour = createSpan(risoElements[i].elt.innerHTML);
    risoColour.id(`riso-${risoElements[i].elt.innerHTML}--element`);
    risoColour.class(`riso-colour riso-${risoElements[i].elt.innerHTML}`);
    risoColour.style('background-color', risoElements[i].elt.style.backgroundColor);
    risoColour.style('display', 'none');
    risoColour.html(`${risoElements[i].elt.innerHTML}`);
    risoColour.mouseClicked(selectUnselectColour);
    risoColour.parent('selected-colours');

    // Create sliders
    // let slider = createSlider(0, 255, 128, 1);
    // slider.id(`${risoElements[i].elt.innerHTML}_fill_slider`);
    // slider.parent(container);

    // TODO: Add other sliders and options

  }

  // TODO: Add instructions when no colours are selected

}

function addRisoSuggestion(allRisoColours, curatedRisoColours) {

  for (let i = 0; i < curatedRisoColours.length; i++) {

    let palette = createDiv(`${curatedRisoColours[i].palette}: `);

    for (let j = 0; j < curatedRisoColours[i].colours.length; j++) {
      // Create all curated riso colours in the palette
      let risoColour = createSpan(`${curatedRisoColours[i].colours[j].name.toLowerCase()}`);
      // risoColour.id(`riso-${risoElements[i].elt.innerHTML}--element`);
      risoColour.class(`riso-colour riso-${curatedRisoColours[i].colours[j].name}--alt`);
      risoColour.style('background-color', `${curatedRisoColours[i].colours[j].colour_hex}`);
      risoColour.style('cursor', 'auto');
      risoColour.parent(palette);
    }
    palette.mouseClicked(function() {
      selectPalette(curatedRisoColours[i].colours);
    });
    palette.style('cursor', 'pointer');
    palette.style('border', '1px solid blue');
    palette.parent('recommended-colours');
  }

}

function selectUnselectColour() {
  let risoContainer = select(`#riso-${this.elt.innerHTML}--element`);
  if (risoContainer.elt.style.display === 'none') {
    risoMode = true;
    risoContainer.style('display', 'inline');
    risoLayersSelected[risoColours.indexOf(this.elt.innerHTML.toUpperCase())] = true;
  } else {
    risoContainer.style('display', 'none');
    risoLayersSelected[risoColours.indexOf(this.elt.innerHTML.toUpperCase())] = false;
  }

  // Enable Riso mode if at least one colour has been selected
  if (risoLayersSelected.includes(true)) {
    // select(`#selected-colours`).html('');
    risoMode = true;
  } else {
    risoMode = false;
  }
}

function selectPalette(palette) {
  // Hide all selected colours
  let selectedColours = select(`#selected-colours`);
  palette = palette.map(colour => colour.name);

  for (let i = 0; i < selectedColours.elt.childNodes.length; i++) {
    let colour = selectedColours.elt.childNodes[i];
    if (palette.includes(colour.innerHTML)) {
      colour.style.display = 'inline';
      risoLayersSelected[risoColours.indexOf(colour.innerHTML.toUpperCase())] = true;
    } else {
      colour.style.display = 'none';
      risoLayersSelected[risoColours.indexOf(colour.innerHTML.toUpperCase())] = false;
    }
  }
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
  // both min and max are inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Change dither type
// function keyReleased() {
//   if (key == 1) ditherType = 'atkinson';
//   else if (key == 2) ditherType = 'floydsteinberg';
//   else if (key == 3) ditherType = 'bayer';
//   else if (key == 4) ditherType = 'none';
// }

function debug() {
  console.log(risoObjects);
}

// Handle keyboard events
function keyPressed() {
  switch(key) {
    case 's':
      exportRiso();
      break;
    case 'd':
      debug();
      break;
    case 'r':
      reset();
      break;
    default:
      break;
  }
}
