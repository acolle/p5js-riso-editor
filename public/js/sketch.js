let ctx;

let img;
let imgRatio;
let imgWidth;
let imgHeight;

let risoColours;
let risoColoursNames;
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
  // img = loadImage('img/temp.webp');
}

function setup() {
  //
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
  // Create array of Riso colour names
  risoColoursNames = risoColours.map(colour => colour.elt.innerHTML);

  // Add Riso selection
  addRisoSelection(risoColours);
  // Add Riso palettes suggestions
  addRisoSuggestion(risoColours, CURATEDRISOPALETTES);
  // Add customisation options for each Riso layer
  addRisoLayerOptions(risoColours);

  for (let i = 0; i < risoColoursNames.length; i++) {
    // Add eventListener on riso colours of the selection list
    selectAll(`.riso-${risoColoursNames[i]}`)[1].mouseClicked(selectUnselectColour);
  }

  // Create all Riso objects
  risoObjects = createRisoObjects(risoColoursNames);

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
        let risoLayer = risoObjects[risoColoursNames[i]];
        risoLayer.imageMode(CENTER);

        // Get all options
        let fillSlider = select(`#${risoColoursNames[i]}_fill_slider`);
        risoLayer.fill(fillSlider.value());

        let positionXSlider = select(`#${risoColoursNames[i]}_posX_slider`);
        let positionYSlider = select(`#${risoColoursNames[i]}_posY_slider`);

        // Draw the Riso
        if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
          risoLayer.image(
            img,
            positionXSlider.value(),
            positionYSlider.value(),
            imgWidth,
            imgHeight
          );
        } else {
          risoLayer.image(
            img,
            positionXSlider.value(),
            positionYSlider.value(),
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
  }
  // TODO: Add instructions when no colours are selected
}

function addRisoSuggestion(allRisoColours, curatedRisoColours) {

  for (let i = 0; i < curatedRisoColours.length; i++) {

    let palette = createDiv(`${curatedRisoColours[i].palette} `);

    for (let j = 0; j < curatedRisoColours[i].colours.length; j++) {
      // Create all curated riso colours in the palette
      let risoColour = createSpan(`${curatedRisoColours[i].colours[j].name.toLowerCase()}`);
      // risoColour.id(`riso-${risoElements[i].elt.innerHTML}--element`);
      risoColour.class(`riso-colour riso-${curatedRisoColours[i].colours[j].name}--alt`);
      risoColour.style('background-color', `${curatedRisoColours[i].colours[j].colour_hex}`);
      risoColour.parent(palette);
    }
    palette.mouseClicked(function() {
      selectPalette(curatedRisoColours[i].colours);
    });
    palette.style('cursor', 'pointer');
    palette.parent('recommended-colours');
  }

}

function addRisoLayerOptions(risoElements) {

  let ctxWidth = Math.round(ctx.width);
  let ctxHeight = Math.round(ctx.height);
  let ctxWidthHalf = Math.round(ctxWidth / 2);
  let ctxHeightHalf = Math.round(ctxHeight / 2);

  let allOptionsContainer = createDiv();
  allOptionsContainer.id('options--customisation-container');

  for (let i = 0; i < risoElements.length; i++) {

    let container = createDiv();
    container.id(`riso-${risoElements[i].elt.innerHTML}--options-container`);
    container.style('padding', '4px 0');

    let risoColour = createSpan(risoElements[i].elt.innerHTML);
    risoColour.id(`riso-${risoElements[i].elt.innerHTML}--options`);
    risoColour.class(`riso-colour riso-${risoElements[i].elt.innerHTML} riso--options`);
    risoColour.style('background-color', risoElements[i].elt.style.backgroundColor);
    risoColour.style('display', 'block');
    risoColour.style('textAlign', 'center');
    risoColour.html(`${risoElements[i].elt.innerHTML}`);
    risoColour.parent(container);

    // Add options
    let optionsContainer = createDiv();
    optionsContainer.style('padding', '8px');

    // Fill / Opacity
    let fillSliderContainer = createSpan('Fill (0 to 255)');
    let fillSliderValue = createSpan('128');
    fillSliderValue.id(`${risoElements[i].elt.innerHTML}_fill_slider_value`);
    fillSliderValue.style('float', 'right');
    fillSliderValue.parent(fillSliderContainer);
    let fillSlider = createSlider(0, 255, 128, 1);
    fillSlider.id(`${risoElements[i].elt.innerHTML}_fill_slider`);
    fillSlider.style('width', '100%');
    fillSlider.input(showInputValue);
    fillSlider.parent(fillSliderContainer);

    fillSliderContainer.parent(optionsContainer);

    // Layer X position
    let positionXContainer = createSpan(`Pos. x (0 to ${ctxWidth})`);
    let positionXValue = createSpan(`${ctxWidthHalf}`);
    positionXValue.id(`${risoElements[i].elt.innerHTML}_posX_slider_value`);
    positionXValue.style('float', 'right');
    positionXValue.parent(positionXContainer);
    let positionXSlider = createSlider(0, ctxWidth, ctxWidthHalf, 1);
    positionXSlider.id(`${risoElements[i].elt.innerHTML}_posX_slider`);
    positionXSlider.style('width', '100%');
    positionXSlider.input(showInputValue);
    positionXSlider.parent(positionXContainer);

    positionXContainer.parent(optionsContainer);

    // Layer Y position
    let positionYContainer = createSpan(`Pos. y (0 to ${ctxHeight})`);
    let positionYValue = createSpan(`${ctxHeightHalf}`);
    positionYValue.id(`${risoElements[i].elt.innerHTML}_posY_slider_value`);
    positionYValue.style('float', 'right');
    positionYValue.parent(positionYContainer);
    let positionYSlider = createSlider(0, ctxHeight, ctxHeightHalf, 1);
    positionYSlider.id(`${risoElements[i].elt.innerHTML}_posY_slider`);
    positionYSlider.style('width', '100%');
    positionYSlider.input(showInputValue);
    positionYSlider.parent(positionYContainer);

    positionYContainer.parent(optionsContainer);

    // Add dithering selector
    let ditheringContainer = createSpan('Dithering');
    let ditheringSelector = createSelect();
    ditheringSelector.id(`${risoElements[i].elt.innerHTML}_dithering_selector`);
    ditheringSelector.style('width', '100%');
    ditheringSelector.option('image');
    ditheringSelector.option('atkinson');
    ditheringSelector.option('floydsteinberg');
    ditheringSelector.option('bayer');
    ditheringSelector.option('none');
    ditheringSelector.selected('image');
    ditheringSelector.changed(handleDitheringChange);
    ditheringSelector.parent(ditheringContainer);

    let ditheringThresholdContainer = createSpan('Threshold (0 to 255)');
    ditheringThresholdContainer.id(`${risoElements[i].elt.innerHTML}_dithering_threshold`);
    let ditheringThresholdValue = createSpan('128');
    ditheringThresholdValue.id(`${risoElements[i].elt.innerHTML}_dithering_threshold_value`);
    ditheringThresholdValue.style('float', 'right');
    ditheringThresholdValue.parent(ditheringThresholdContainer);

    let ditheringThresholdSlider = createSlider(0, 255, 128, 1);
    ditheringThresholdSlider.id(`${risoElements[i].elt.innerHTML}_dithering_threshold_slider`);
    ditheringThresholdSlider.style('width', '100%');
    ditheringThresholdSlider.input(showInputValue);
    ditheringThresholdSlider.parent(ditheringThresholdContainer);

    ditheringThresholdContainer.parent(ditheringContainer);
    ditheringThresholdContainer.style('display', 'none');
    ditheringContainer.parent(optionsContainer);

    optionsContainer.parent(container);
    container.style('display', 'none');
    container.parent(allOptionsContainer);
  }
  allOptionsContainer.parent('options--customisation');
}

function showInputValue(event) {
  // Update value of inputs
  let value = event.target.value;
  let feedbackElt = select(`#${event.target.id}_value`);
  feedbackElt.elt.innerHTML = value;
}

function handleDitheringChange(event) {
  let ditherType = event.target.value;
  let ditheringOption = select(`#${event.target.id.split('_')[0]}_dithering_threshold`);

  if (ditherType === 'bayer' || ditherType === 'none') {
    ditheringOption.elt.style.display = 'block';
  } else {
    ditheringOption.elt.style.display = 'none';
  }
}

function selectUnselectColour() {
  // Unhide the Riso colour in the selection section
  let selectedRiso = select(`#riso-${this.elt.innerHTML}--element`);

  // Unhide the Riso colour in the customisation options section
  let selectedRisoOptions = (`#riso-${this.elt.innerHTML}--options-container`);

  if (selectedRiso.elt.style.display === 'none') {
    risoMode = true;
    selectedRiso.style('display', 'inline');
    selectedRisoOptions.style('display', 'block');
    // Update index of selected colour
    risoLayersSelected[risoColoursNames.indexOf(this.elt.innerHTML.toUpperCase())] = true;
  } else {
    selectedRiso.style('display', 'none');
    selectedRisoOptions.style('display', 'none');
    risoLayersSelected[risoColoursNames.indexOf(this.elt.innerHTML.toUpperCase())] = false;
  }

  // Enable Riso mode if at least one colour has been selected
  if (risoLayersSelected.includes(true)) {
    risoMode = true;
  } else {
    risoMode = false;
  }
}

function selectPalette(palette) {
  // Hide all selected colours/options and unhide only those in palette
  let selectedColours = select('#selected-colours');
  palette = palette.map(colour => colour.name);
  // Customisation options
  let selectedRisoOptions = select('#options--customisation-container');

  for (let i = 0; i < selectedColours.elt.childNodes.length; i++) {
    let colour = selectedColours.elt.childNodes[i];
    let colourOptions = selectedRisoOptions.elt.childNodes[i];
    if (palette.includes(colour.innerHTML)) {
      risoMode = true;
      colour.style.display = 'inline';
      colourOptions.style.display = 'block';
      risoLayersSelected[risoColoursNames.indexOf(colour.innerHTML.toUpperCase())] = true;
    } else {
      colour.style.display = 'none';
      colourOptions.style.display = 'none';
      risoLayersSelected[risoColoursNames.indexOf(colour.innerHTML.toUpperCase())] = false;
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
  console.log(risoMode);
}

function refresh() {
  // Rerun draw() function once to apply Riso selections
  redraw();
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
