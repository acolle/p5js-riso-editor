let ctx;

let img;
let imgRatio;
let imgWidth;
let imgHeight;

let risoColours;
let risoColoursNames;
let risoObjects;
let risoLayersPrinted = [];
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

    let selected

    for (let i = 0; i < risoObjects.length; i++) {
      if (risoObjects[i].selected) {

        risoLayersPrinted.push(risoObjects[i]);

        let src = img;

        let risoLayer = risoObjects[i].riso;
        risoLayer.imageMode(CENTER);

        // Get all options
        let fillSlider = select(`#${risoObjects[i].name}_fill_slider`);
        risoLayer.fill(fillSlider.value());

        let positionXSlider = select(`#${risoObjects[i].name}_posX_slider`);
        let positionYSlider = select(`#${risoObjects[i].name}_posY_slider`);

        let ditherType = select(`#${risoObjects[i].name}_dithering_selector`).value();
        let threshold = select(`#${risoObjects[i].name}_dithering_threshold_slider`).value();

        if (ditherType !== 'image') {
          src = ditherImage(img, ditherType, threshold);
        }

        // Draw the Riso
        if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
          risoLayer.image(
            src,
            positionXSlider.value(),
            positionYSlider.value(),
            imgWidth,
            imgHeight
          );
        } else {
          risoLayer.image(
            src,
            positionXSlider.value(),
            positionYSlider.value(),
            img.width,
            img.height
          );
        }
      }
    }

    handleCutout(risoLayersPrinted);
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

function handleCutout(layers) {
  for (let i = 0; i < layers.length; i++) {
    let risoLayer = layers[i];
    let otherRisoLayers = layers.filter(riso => riso.name != risoLayer.name);
    for (let j = 0; j < otherRisoLayers.length; j++) {
      let checkbox = select(`#${risoLayer.name}_cutout_${otherRisoLayers[j].name}`);
      if (checkbox.selected()) {
        risoLayer.riso.cutout(otherRisoLayers[j].riso);
      }
    }
  }
}

function draw_() {
  // RGB/CNYK Channels & Dither serve as the masters
  let red_c = extractRGBChannel(img, "red");
  let green_c = extractRGBChannel(img, "green");
  let blue_c = extractRGBChannel(img, "blue");
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
    let [r, g, b] = risoElements[i].elt.style.backgroundColor.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g);
    container.style('background-color', `rgba(${r},${g},${b},0.1)`);

    // Riso label
    let risoColour = createSpan(risoElements[i].elt.innerHTML);
    risoColour.id(`riso-${risoElements[i].elt.innerHTML}--options`);
    risoColour.class(`riso-colour riso-${risoElements[i].elt.innerHTML} riso--options`);
    risoColour.style('background-color', risoElements[i].elt.style.backgroundColor);
    risoColour.style('display', 'block');
    risoColour.style('textAlign', 'center');
    risoColour.html(`${risoElements[i].elt.innerHTML}`);
    risoColour.parent(container);

    // Fill / Opacity
    let fillSliderContainer = createDiv('Opacity');
    fillSliderContainer.class('option--container');
    let fillSliderValue = createElement('input');
    fillSliderValue.id(`${risoElements[i].elt.innerHTML}_fill_slider_value`);
    fillSliderValue.attribute('type', 'number');
    fillSliderValue.attribute('min', '0');
    fillSliderValue.attribute('max', '255');
    fillSliderValue.attribute('value', '128');
    fillSliderValue.style('width', '70px');
    fillSliderValue.style('float', 'right');
    fillSliderValue.changed(updateRangeInput);
    fillSliderValue.parent(fillSliderContainer);
    let fillSlider = createSlider(0, 255, 128, 1);
    fillSlider.id(`${risoElements[i].elt.innerHTML}_fill_slider`);
    fillSlider.style('width', '100%');
    fillSlider.input(updateNumberInput);
    fillSlider.parent(fillSliderContainer);
    fillSliderContainer.parent(container);

    // Layer X position
    let positionXContainer = createDiv('Position x');
    positionXContainer.class('option--container');
    let positionXValue = createElement('input');
    positionXValue.id(`${risoElements[i].elt.innerHTML}_posX_slider_value`);
    positionXValue.attribute('type', 'number');
    positionXValue.attribute('min', '0');
    positionXValue.attribute('max', '255');
    positionXValue.attribute('value', `${ctxWidthHalf}`);
    positionXValue.style('width', '70px');
    positionXValue.style('float', 'right');
    positionXValue.parent(positionXContainer);
    let positionXSlider = createSlider(0, ctxWidth, ctxWidthHalf, 1);
    positionXSlider.id(`${risoElements[i].elt.innerHTML}_posX_slider`);
    positionXSlider.style('width', '100%');
    positionXSlider.input(updateNumberInput);
    positionXSlider.parent(positionXContainer);
    positionXContainer.parent(container);

    // Layer Y position
    let positionYContainer = createDiv('Position y');
    positionYContainer.class('option--container');
    let positionYValue = createElement('input');
    positionYValue.id(`${risoElements[i].elt.innerHTML}_posY_slider_value`);
    positionYValue.attribute('type', 'number');
    positionYValue.attribute('min', '0');
    positionYValue.attribute('max', '255');
    positionYValue.attribute('value', `${ctxHeightHalf}`);
    positionYValue.style('width', '70px');
    positionYValue.style('float', 'right');
    positionYValue.parent(positionYContainer);
    let positionYSlider = createSlider(0, ctxHeight, ctxHeightHalf, 1);
    positionYSlider.id(`${risoElements[i].elt.innerHTML}_posY_slider`);
    positionYSlider.style('width', '100%');
    positionYSlider.input(updateNumberInput);
    positionYSlider.parent(positionYContainer);
    positionYContainer.parent(container);

    // Add dithering selector
    let ditheringContainer = createDiv('Dithering');
    ditheringContainer.class('option--container');
    let ditheringSelector = createSelect();
    ditheringSelector.id(`${risoElements[i].elt.innerHTML}_dithering_selector`);
    ditheringSelector.style('float', 'right');

    // ditheringSelector.style('width', '100%');
    ditheringSelector.option('image');
    ditheringSelector.option('atkinson');
    ditheringSelector.option('floydsteinberg');
    ditheringSelector.option('bayer');
    ditheringSelector.option('none');
    ditheringSelector.selected('image');
    ditheringSelector.changed(handleDitheringChange);
    ditheringSelector.parent(ditheringContainer);
    ditheringContainer.parent(container);

    // Add dithering threshold for bayer and none dither types
    let ditheringThresholdContainer = createDiv('Threshold');
    ditheringThresholdContainer.class('option--container');
    ditheringThresholdContainer.id(`${risoElements[i].elt.innerHTML}_dithering_threshold`);
    ditheringThresholdContainer.style('display', 'none');

    let ditheringThresholdValue = createElement('input');
    ditheringThresholdValue.id(`${risoElements[i].elt.innerHTML}_dithering_threshold_slider_value`);
    ditheringThresholdValue.attribute('type', 'number');
    ditheringThresholdValue.attribute('min', '0');
    ditheringThresholdValue.attribute('max', '255');
    let rgbSum = risoElements[i].elt.style.backgroundColor.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g).reduce((a, b) => a + parseInt(b), 0);
    ditheringThresholdValue.attribute('value', `${Math.round(rgbSum / 3)}`);
    ditheringThresholdValue.style('width', '70px');
    ditheringThresholdValue.style('float', 'right');
    ditheringThresholdValue.parent(ditheringThresholdContainer);

    let ditheringThresholdSlider = createSlider(0, 255, Math.round(rgbSum / 3), 1);
    ditheringThresholdSlider.id(`${risoElements[i].elt.innerHTML}_dithering_threshold_slider`);
    ditheringThresholdSlider.style('width', '100%');
    ditheringThresholdSlider.input(updateNumberInput);
    ditheringThresholdSlider.parent(ditheringThresholdContainer);

    ditheringThresholdContainer.parent(container);

    // Add empty container for cutout options
    let cutoutContainer = createDiv('Cutout');
    cutoutContainer.class('option--container');
    cutoutContainer.style('display', 'none');
    let cutoutContent = createDiv();
    cutoutContent.id(`${risoElements[i].elt.innerHTML}_cutout`);
    cutoutContent.parent(cutoutContainer);
    cutoutContainer.parent(container);
    cutoutContainer.style('display', 'none');

    container.style('display', 'none');
    container.parent(allOptionsContainer);
  }
  allOptionsContainer.parent('options--customisation');
}

function updateNumberInput(event) {
  // Update value of inputs of type number
  let value = event.target.value;
  let feedbackElt = select(`#${event.target.id}_value`);
  feedbackElt.elt.value = value;
}

function updateRangeInput(event) {
  // Update value of inputs of type number
  let value = event.target.value;
  let element = `#${event.target.id}`
  let feedbackElt = select(element.replace('_value', ''));
  feedbackElt.elt.value = value;
}

function toggleCutoutOptions({ selectedRisoName, selectedRisoColours, operation }) {

  let risoCustomisationContainer = select(`#riso-${selectedRisoName}--options-container`);
  let currentlySelectedColours = risoObjects.filter(riso => riso.selected);

  if (selectedRisoName && operation === 'add') {
    // Handle single Riso layer added
    for (var i = 0; i < currentlySelectedColours.length; i++) {
      if (currentlySelectedColours[i].name !== selectedRisoName) {
        // Add new Riso layer as a cutout option to the other already selected Riso layers
        let checkbox = createCheckbox(`${selectedRisoName.toLowerCase()}`, false);
        checkbox.id(`${currentlySelectedColours[i].name}_cutout_${selectedRisoName}`);
        let cutoutContainer = select(`#${currentlySelectedColours[i].name}_cutout`);
        checkbox.parent(cutoutContainer);
        cutoutContainer.style('display', 'flex');
        cutoutContainer.style('flex-wrap', 'wrap');
        cutoutContainer.parent().style.display = 'block';

        // Update the cutout options of the new Riso layer with the already selected Riso layers
        let checkbox_ = createCheckbox(`${currentlySelectedColours[i].name.toLowerCase()}`, false);
        checkbox_.id(`${selectedRisoName}_cutout_${currentlySelectedColours[i].name}`);
        let cutoutContainer_ = select(`#${selectedRisoName}_cutout`);
        checkbox_.parent(cutoutContainer_);
        cutoutContainer_.style('display', 'flex');
        cutoutContainer.style('flex-wrap', 'wrap');
        cutoutContainer_.parent().style.display = 'block';
      }
    }
  } else if (selectedRisoName && operation === 'remove') {
    // Handle single Riso layer removed
    for (var i = 0; i < currentlySelectedColours.length; i++) {
      if (currentlySelectedColours[i].name !== selectedRisoName) {
        // Remove the deselected Riso layer as a cutout option from the other selected Riso layers
        let cutoutCheckboxRemoved = select(`#${currentlySelectedColours[i].name}_cutout_${selectedRisoName}`);
        cutoutCheckboxRemoved.remove();

        // Remove all the cutout options of the deleted Riso layer
        let cutoutCheckboxRemoved_ = select(`#${selectedRisoName}_cutout_${currentlySelectedColours[i].name}`);
        cutoutCheckboxRemoved_.remove();

        // In case we remove the second last Riso layer, no cutout option left
        if (currentlySelectedColours.length === 2) {
          let cutoutContainer = select(`#${currentlySelectedColours[i].name}_cutout`);
          cutoutContainer.parent().style.display = 'none';
        }
      }
    }
  } else {
    // Handle colours palette added
    for (let i = 0; i < currentlySelectedColours.length; i++) {

      let currentlySelectedColour = currentlySelectedColours[i];
      let otherSelectedColours = currentlySelectedColours.filter(riso => riso.name != currentlySelectedColour.name);

      for (let j = 0; j < otherSelectedColours.length; j++) {
        // Add new Riso layer as a cutout option to the other already selected Riso layers
        if (! select(`#${otherSelectedColours[j].name}_cutout_${currentlySelectedColour.name}`) && otherSelectedColours[j].name !== currentlySelectedColour.name) {
          let checkbox = createCheckbox(`${currentlySelectedColour.name.toLowerCase()}`, false);
          checkbox.id(`${otherSelectedColours[j].name}_cutout_${currentlySelectedColour.name}`);
          let cutoutContainer = select(`#${otherSelectedColours[j].name}_cutout`);
          checkbox.parent(cutoutContainer);
          cutoutContainer.style('display', 'flex');
          cutoutContainer.style('flex-wrap', 'wrap');
          cutoutContainer.parent().style.display = 'block';
        }
      }
    }
  }
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
  let selectedRisoName = this.elt.innerHTML;
  let selectedRisoElt = select(`#riso-${selectedRisoName}--element`);

  // Unhide the Riso colour in the customisation options section
  let selectedRisoOption = select(`#riso-${selectedRisoName}--options-container`);

  if (selectedRisoElt.elt.style.display === 'none') {
    risoMode = true;
    toggleCutoutOptions({selectedRisoName, operation: 'add'});
    selectedRisoElt.style('display', 'inline');
    selectedRisoOption.style('display', 'block');
    // Update index of selected colour
    let obj = risoObjects.find(riso => riso.name === selectedRisoName.toUpperCase());
    obj.selected = true;
  } else {
    toggleCutoutOptions({selectedRisoName, operation: 'remove'});
    selectedRisoElt.style('display', 'none');
    selectedRisoOption.style('display', 'none');
    let obj = risoObjects.find(riso => riso.name === selectedRisoName.toUpperCase());
    obj.selected = false;
  }

  // Enable Riso mode if at least one colour has been selected
  let obj = risoObjects.find(riso => riso.selected);
  if (risoObjects.find(riso => riso.selected)) {
    risoMode = true;
  } else {
    risoMode = false;
  }
}

function selectPalette(palette) {
  // Hide all selected colours/options and unhide only those in palette
  let selectedRisoColours = select('#selected-colours').elt.childNodes;
  palette = palette.map(colour => colour.name);
  // Customisation options
  let selectedRisoOptions = select('#options--customisation-container').elt.childNodes;

  for (let i = 0; i < selectedRisoColours.length; i++) {
    let colour = selectedRisoColours[i];
    let colourOptions = selectedRisoOptions[i];
    let obj = risoObjects.find(riso => riso.name === colour.innerHTML.toUpperCase());

    if (palette.includes(colour.innerHTML)) {
      risoMode = true;
      colour.style.display = 'inline';
      colourOptions.style.display = 'block';
      obj.selected = true;
    } else {
      colour.style.display = 'none';
      colourOptions.style.display = 'none';
      obj.selected = false;
    }
  }
  toggleCutoutOptions({selectedRisoColours});
}

function createRisoObjects(colours) {
  let allRisoObjects = [];
  for (let i = 0; i < colours.length; i++) {
    let colour = colours[i];
    let riso = new Riso(colour);
    allRisoObjects.push({
      name: colour,
      riso,
      selected: false,
    })
  }
  return allRisoObjects;
}

function getRandomIntInclusive(min, max) {
  // both min and max are inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function debug() {
  console.log(risoObjects);
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
