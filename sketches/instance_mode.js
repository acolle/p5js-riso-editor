let mediaSource;

// p5js sketch - instance mode
let sketch = function(p) {

  // variables
  let ctx;

  let img;
  let imgRatio;
  let imgWidth;
  let imgHeight;

  let risoColours;
  let risoColoursNames;
  let risoObjects = [];
  let risoLayersPrinted = [];
  let risoLayersPrintedQty = 0;
  let risoMode = false;

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

  p.preload = function() {
    // img = loadImage('/img/picasso_copy.jpg');
    // img = loadImage('https://uploads4.wikiart.org/images/pablo-picasso/a-muse-1935.jpg'); // test landscape
    // img = p.loadImage('img/rosa.jpg');
    // THP - page 79 included no polaroid format
    // img = loadImage('/img/lips.jpg');
    // img = loadImage('/img/squat.jpg');
    // img = loadImage('img/temp.webp');
    img = p.loadImage(mediaSource);
  };

  p.setup = function() {
    reset();
  };

  p.draw = function() {

    p.background(248, 248, 255);

    if (risoMode) {
      // reset imageMode
      p.imageMode(p.CORNER);

      clearRiso();

      for (let i = 0; i < risoObjects.length; i++) {

        let src = img;

        let risoLayer = risoObjects[i].riso;
        risoLayer.imageMode(p.CENTER);

        // Get all options
        let fillSlider = p.select(`#${risoObjects[i].name}_fill_slider`);
        risoLayer.fill(fillSlider.value());

        let positionXSlider = p.select(`#${risoObjects[i].name}_posX_slider`);
        let positionYSlider = p.select(`#${risoObjects[i].name}_posY_slider`);

        let ditherType = p.select(`#${risoObjects[i].name}_dithering_selector`).value();
        let threshold = p.select(`#${risoObjects[i].name}_dithering_threshold_slider`).value();

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

      handleCutout(risoObjects);
      drawRiso();

    } else {
      // display original image if riso mode not enabled
      p.imageMode(p.CENTER);
      // check if the image width or height needs to its rescaled value
      if (imgRatio > 1 ? img.width > ctx.width : img.height > ctx.height) {
        // image(img, x, y, [width], [height]) where x and y are position of the img
        p.image(
          img,
          ctx.width / 2,
          ctx.height / 2,
          imgWidth,
          imgHeight,
        );
      } else {
        // neither the w or the h of the image is larger than the canvas - no resclaling needed
        p.image(img, ctx.width / 2, ctx.height / 2, img.width , img.height);
      }
    }
  };

  function reset() {
    // create canvas
    ctx = p.createCanvas(p.windowWidth * 0.9, p.windowHeight * 0.9);
    ctx.parent("canvas");

    // get image ratio: > 1 if portrait; < 1 if landscape
    imgRatio = img.width / img.weight;
    // depending on ratio, scale down width or height of the image
    imgWidth = imgRatio > 1 ? ctx.width : (img.width * (ctx.height / img.height));
    imgHeight = imgRatio > 1 ? (img.height * (ctx.width / img.width)) : ctx.height;

    // Get all riso elements from the DOM
    risoColours = p.selectAll('.riso-colour');
    // Add Riso colours in the selection area
    addRisoSelection(risoColours);
    // Add suggestions of Riso colours
    addRisoSuggestion(risoColours, CURATEDRISOPALETTES);

    // Add an eventListener on them to handle selection
    for (let i = 0; i < risoColours.length; i++) {
      p.selectAll(`.riso-${risoColours[i].elt.innerHTML}`)[1].mouseClicked(selectUnselectColour);
    }

    // Create div for Riso layers options
    let allOptionsContainer = p.createDiv();
    allOptionsContainer.id('options--customisation-container');
    allOptionsContainer.parent('options--customisation');

    // Change eventListener on button
    let btn = p.select('#button--action button');
    btn.html('Print');
    btn.mouseClicked(refresh);

    p.pixelDensity(1);
    p.noLoop();
  }

  function handleCutout(layers) {
    for (let i = 0; i < layers.length; i++) {
      let risoLayer = layers[i];
      let otherRisoLayers = layers.filter(riso => riso.name != risoLayer.name);
      for (let j = 0; j < otherRisoLayers.length; j++) {
        // not working
        // let checkbox = p.select(`#${risoLayer.name}_cutout_${otherRisoLayers[j].name}`);
        // if (checkbox.selected()) {
        //   risoLayer.riso.cutout(otherRisoLayers[j].riso);
        // }
        let checkbox = document.querySelector(`#${risoLayer.name}_cutout_${otherRisoLayers[j].name} input`);
        if (checkbox.checked) {
          risoLayer.riso.cutout(otherRisoLayers[j].riso);
        }
      }
    }
  }

  function addRisoSelection(risoElements) {
    for (let i = 0; i < risoElements.length; i++) {
      // Create all selected riso colours
      let risoColour = p.createSpan(risoElements[i].elt.innerHTML);
      risoColour.id(`riso-${risoElements[i].elt.innerHTML}--element`);
      risoColour.class(`riso-colour riso-${risoElements[i].elt.innerHTML}`);
      risoColour.style('background-color', risoElements[i].elt.style.backgroundColor);
      risoColour.style('display', 'none');
      risoColour.html(`${risoElements[i].elt.innerHTML}`);
      risoColour.mouseClicked(selectUnselectColour);
      risoColour.parent('selected-colours');
    }
  }

  function addRisoSuggestion(allRisoColours, curatedRisoColours) {

    for (let i = 0; i < curatedRisoColours.length; i++) {

      let palette = p.createDiv(`${curatedRisoColours[i].palette}`);

      for (let j = 0; j < curatedRisoColours[i].colours.length; j++) {
        // Create all curated riso colours in the palette
        let risoColour = p.createSpan(`${curatedRisoColours[i].colours[j].name.toLowerCase()}`);
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

  function addRisoLayerOption(risoName) {

    let ctxWidth = Math.round(ctx.width);
    let ctxHeight = Math.round(ctx.height);
    let ctxWidthHalf = Math.round(ctxWidth / 2);
    let ctxHeightHalf = Math.round(ctxHeight / 2);

    let risoColour = p.select(`#riso-${risoName}--element`).elt.style.backgroundColor;

    let container = p.createDiv();
    container.id(`riso-${risoName}--options-container`);
    let [r, g, b] = risoColour.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g);
    container.style('background-color', `rgba(${r},${g},${b},0.1)`);

    // Riso label
    let risoLabel = p.createSpan(risoName);
    risoLabel.id(`riso-${risoName}--options`);
    risoLabel.class(`riso-colour riso-${risoName} riso--options`);
    risoLabel.style('background-color', risoColour);
    risoLabel.style('display', 'block');
    risoLabel.style('textAlign', 'center');
    risoLabel.html(`${risoName}`);
    risoLabel.parent(container);

    // Layer Position
    let layerPositionContainer = p.createDiv('Print order');
    layerPositionContainer.class('option--container');
    let layerPositionValue = p.createElement('input');
    layerPositionValue.id(`${risoName}_position_value`);
    layerPositionValue.attribute('type', 'number');
    layerPositionValue.attribute('min', '1');
    layerPositionValue.attribute('value', '1');
    layerPositionValue.style('width', '70px');
    layerPositionValue.style('float', 'right');
    layerPositionValue.changed(updateLayerPosition);
    layerPositionValue.parent(layerPositionContainer);
    layerPositionContainer.parent(container);

    // Fill / Opacity
    let fillSliderContainer = p.createDiv('Opacity');
    fillSliderContainer.class('option--container');
    let fillSliderValue = p.createElement('input');
    fillSliderValue.id(`${risoName}_fill_slider_value`);
    fillSliderValue.attribute('type', 'number');
    fillSliderValue.attribute('min', '0');
    fillSliderValue.attribute('max', '255');
    fillSliderValue.attribute('value', '255');
    fillSliderValue.style('width', '70px');
    fillSliderValue.style('float', 'right');
    fillSliderValue.changed(updateRangeInput);
    fillSliderValue.parent(fillSliderContainer);
    let fillSlider = p.createSlider(0, 255, 255, 1);
    fillSlider.id(`${risoName}_fill_slider`);
    fillSlider.style('width', '100%');
    fillSlider.input(updateNumberInput);
    fillSlider.parent(fillSliderContainer);
    fillSliderContainer.parent(container);

    // Layer X position
    let positionXContainer = p.createDiv('Position x');
    positionXContainer.class('option--container');
    let positionXValue = p.createElement('input');
    positionXValue.id(`${risoName}_posX_slider_value`);
    positionXValue.attribute('type', 'number');
    positionXValue.attribute('min', '0');
    positionXValue.attribute('max', ctxWidth);
    positionXValue.attribute('value', ctxWidthHalf);
    positionXValue.style('width', '70px');
    positionXValue.style('float', 'right');
    positionXValue.parent(positionXContainer);
    let positionXSlider = p.createSlider(0, ctxWidth, ctxWidthHalf, 1);
    positionXSlider.id(`${risoName}_posX_slider`);
    positionXSlider.style('width', '100%');
    positionXSlider.input(updateNumberInput);
    positionXSlider.parent(positionXContainer);
    positionXContainer.parent(container);

    // Layer Y position
    let positionYContainer = p.createDiv('Position y');
    positionYContainer.class('option--container');
    let positionYValue = p.createElement('input');
    positionYValue.id(`${risoName}_posY_slider_value`);
    positionYValue.attribute('type', 'number');
    positionYValue.attribute('min', '0');
    positionYValue.attribute('max', ctxHeight);
    positionYValue.attribute('value', ctxHeightHalf);
    positionYValue.style('width', '70px');
    positionYValue.style('float', 'right');
    positionYValue.parent(positionYContainer);
    let positionYSlider = p.createSlider(0, ctxHeight, ctxHeightHalf, 1);
    positionYSlider.id(`${risoName}_posY_slider`);
    positionYSlider.style('width', '100%');
    positionYSlider.input(updateNumberInput);
    positionYSlider.parent(positionYContainer);
    positionYContainer.parent(container);

    // Add dithering selector
    let ditheringContainer = p.createDiv('Dithering');
    ditheringContainer.class('option--container');

    let ditheringSelector = p.createSelect();
    ditheringSelector.id(`${risoName}_dithering_selector`);
    ditheringSelector.style('float', 'right');
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
    let ditheringThresholdContainer = p.createDiv('Threshold');
    ditheringThresholdContainer.id(`${risoName}_dithering_threshold`);
    ditheringThresholdContainer.class('option--container');

    let ditheringThresholdValue = p.createElement('input');
    ditheringThresholdValue.id(`${risoName}_dithering_threshold_slider_value`);
    ditheringThresholdValue.attribute('type', 'number');
    ditheringThresholdValue.attribute('min', '0');
    ditheringThresholdValue.attribute('max', '255');
    let rgbSum = risoColour.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g).reduce((a, b) => a + parseInt(b), 0);
    ditheringThresholdValue.attribute('value', `${Math.round(rgbSum / 3)}`);
    ditheringThresholdValue.style('width', '70px');
    ditheringThresholdValue.style('float', 'right');
    ditheringThresholdValue.parent(ditheringThresholdContainer);

    let ditheringThresholdSlider = p.createSlider(0, 255, Math.round(rgbSum / 3), 1);
    ditheringThresholdSlider.id(`${risoName}_dithering_threshold_slider`);
    ditheringThresholdSlider.style('width', '100%');
    ditheringThresholdSlider.input(updateNumberInput);
    ditheringThresholdSlider.parent(ditheringThresholdContainer);

    ditheringThresholdContainer.parent(container);
    ditheringThresholdContainer.style('display', 'none'); // hide at first

    // Add empty container for cutout options
    let cutoutContainer = p.createDiv('Cutout');
    cutoutContainer.class('option--container');
    cutoutContainer.style('display', 'none');
    let cutoutContent = p.createDiv();
    cutoutContent.id(`${risoName}_cutout`);
    cutoutContent.parent(cutoutContainer);
    cutoutContainer.parent(container);
    cutoutContainer.style('display', 'none');

    let allOptionsContainer = p.select('#options--customisation-container');
    container.parent(allOptionsContainer);
  }

  function deleteRisoLayerOption(risoName) {
    let risoOptionContainer = p.select(`#riso-${risoName}--options-container`);
    if (risoOptionContainer) {
      risoOptionContainer.remove();
    }
  }

  function updateNumberInput(event) {
    // Update value of inputs of type number
    let value = event.target.value;
    let feedbackElt = p.select(`#${event.target.id}_value`);
    feedbackElt.elt.value = value;
  }

  function updateRangeInput(event) {
    // Update value of inputs of type range (sliders)
    let value = event.target.value;
    let element = `#${event.target.id}`
    let feedbackElt = p.select(element.replace('_value', ''));
    feedbackElt.elt.value = value;
  }

  function updateLayerPosition(event) {
    // Update position of Riso layer for printing and in options menu
    let positionInput = p.select(`#${event.target.id}`);
    let risoOptionElement = positionInput.elt.parentNode.parentNode;

    let risoOptionElementBefore = risoOptionElement.previousElementSibling;
    let positionInputBefore = risoOptionElementBefore ? risoOptionElementBefore.querySelector(`input`) : undefined;

    let risoOptionElementAfter = risoOptionElement.nextElementSibling;
    let positionInputAfter = risoOptionElementAfter ? risoOptionElementAfter.querySelector(`input`) : undefined;

    let risoOptionsContainer = risoOptionElement.parentNode;

    // Get index of Riso layer in options menu
    const length = risoOptionsContainer.childNodes.length;
    const index = Array.from(risoOptionsContainer.childNodes).indexOf(risoOptionElement);
    const currPosition = index + 1;
    const newPosition = event.target.value;

    if (currPosition === 1 && newPosition === 0) {
      // Layer already in first position - no change
      positionInput.elt.value = 1;
    } else if (currPosition === length && newPosition > length) {
      // Layer already in last position - no change
      positionInput.elt.value = length;
    } else if (newPosition  > currPosition && positionInputAfter) {
      // Swap layer with the next one
      positionInput.elt.value = newPosition;
      positionInputAfter.value = currPosition;
      swapHTMLNodes(risoOptionElement, risoOptionElementAfter);
      swapRisoObjects(currPosition - 1, currPosition);
    } else if (newPosition < currPosition && positionInputBefore) {
      // Swap the layer with the previous one
      positionInput.elt.value = newPosition;
      positionInputBefore.value = currPosition;
      swapHTMLNodes(risoOptionElement, risoOptionElementBefore);
      swapRisoObjects(currPosition - 1, currPosition - 2);
    }
  }

  function swapHTMLNodes(nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);
    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
  };

  function swapRisoObjects(index, swappedIndex) {
    risoObjects.splice(swappedIndex, 0, risoObjects.splice(index, 1)[0]);
  }

  function toggleCutoutOptions({ selectedRisoName, selectedRisoColours, operation }) {

    if (selectedRisoName && operation === 'add') {
      // Handle single Riso layer added
      for (var i = 0; i < risoObjects.length; i++) {
        if (risoObjects[i].name !== selectedRisoName) {
          // Add new Riso layer as a cutout option to the other already selected Riso layers
          let checkbox = p.createCheckbox(`${selectedRisoName.toLowerCase()}`, false);
          checkbox.id(`${risoObjects[i].name}_cutout_${selectedRisoName}`);
          let cutoutContainer = p.select(`#${risoObjects[i].name}_cutout`);
          checkbox.parent(cutoutContainer);
          cutoutContainer.style('display', 'flex');
          cutoutContainer.style('flex-wrap', 'wrap');
          cutoutContainer.parent().style.display = 'block';

          // Update the cutout options of the new Riso layer with the already selected Riso layers
          let checkbox_ = p.createCheckbox(`${risoObjects[i].name.toLowerCase()}`, false);
          checkbox_.id(`${selectedRisoName}_cutout_${risoObjects[i].name}`);
          let cutoutContainer_ = p.select(`#${selectedRisoName}_cutout`);
          checkbox_.parent(cutoutContainer_);
          cutoutContainer_.style('display', 'flex');
          cutoutContainer.style('flex-wrap', 'wrap');
          cutoutContainer_.parent().style.display = 'block';
        }
      }
    } else if (selectedRisoName && operation === 'remove') {
      // Handle single Riso layer removed
      for (var i = 0; i < risoObjects.length; i++) {
        if (risoObjects[i].name !== selectedRisoName) {
          // Remove the deselected Riso layer as a cutout option from the other selected Riso layers
          let cutoutCheckboxRemoved = p.select(`#${risoObjects[i].name}_cutout_${selectedRisoName}`);
          cutoutCheckboxRemoved.remove();

          // Remove all the cutout options of the deleted Riso layer
          let cutoutCheckboxRemoved_ = p.select(`#${selectedRisoName}_cutout_${risoObjects[i].name}`);
          cutoutCheckboxRemoved_.remove();

          // In case we remove the second last Riso layer, no cutout option left
          if (risoObjects.length === 2) {
            let cutoutContainer = p.select(`#${risoObjects[i].name}_cutout`);
            cutoutContainer.parent().style.display = 'none';
          }
        }
      }
    } else {
      // Handle colours palette added
      for (let i = 0; i < risoObjects.length; i++) {

        let currentlySelectedColour = risoObjects[i];
        let otherSelectedColours = risoObjects.filter(riso => riso.name != currentlySelectedColour.name);

        for (let j = 0; j < otherSelectedColours.length; j++) {
          // Add new Riso layer as a cutout option to the other already selected Riso layers
          if (! p.select(`#${otherSelectedColours[j].name}_cutout_${currentlySelectedColour.name}`)) {
            let checkbox = p.createCheckbox(`${currentlySelectedColour.name.toLowerCase()}`, false);
            checkbox.id(`${otherSelectedColours[j].name}_cutout_${currentlySelectedColour.name}`);
            let cutoutContainer = p.select(`#${otherSelectedColours[j].name}_cutout`);
            checkbox.parent(cutoutContainer);
            cutoutContainer.style('display', 'flex');
            cutoutContainer.style('flex-wrap', 'wrap');
            cutoutContainer.parent().style.display = 'block';
          }
        }
      }
    }
  }

  function handleDitheringChange() {
    let ditherType = this.elt.value;
    // let ditheringOption = p.select(`#${this.elt.id.split('_')[0]}_dithering_threshold`);
    // if (ditherType === 'bayer' || ditherType === 'none') {
    //   ditheringOption.elt.style.display = 'block';
    // } else {
    //   ditheringOption.elt.style.display = 'none';
    // }

    let ditheringOption = document.getElementById(`${this.elt.id.split('_')[0]}_dithering_threshold`);
    if (ditherType === 'bayer' || ditherType === 'none') {
      ditheringOption.style.display = 'block';
    } else {
      ditheringOption.style.display = 'none';
    }
  }

  function selectUnselectColour() {

    let selectedRisoName = this.elt.innerHTML;
    let selectedRisoElt = p.select(`#riso-${selectedRisoName}--element`);

    if (selectedRisoElt.elt.style.display === 'none') {
      risoMode = true;
      selectedRisoElt.style('display', 'inline');
      addRisoLayerOption(selectedRisoName);
      createRisoObject(selectedRisoName, risoLayersPrintedQty);
      // Add cutout checkbox once the Riso object is created
      toggleCutoutOptions({selectedRisoName, operation: 'add'});
      p.select(`#${selectedRisoName}_position_value`).elt.value = risoLayersPrintedQty + 1;
      risoLayersPrintedQty++;
    } else {
      selectedRisoElt.style('display', 'none');
      // Remove cutout checkbox before deleting the Riso
      toggleCutoutOptions({selectedRisoName, operation: 'remove'});
      deleteRisoLayerOption(selectedRisoName);
      destroyRisoObject(selectedRisoName);
      risoLayersPrintedQty--;
    }

    // Enable Riso mode if at least one colour has been selected
    if (risoObjects.length > 0 ) {
      risoMode = true;
    } else {
      risoMode = false;
    }
  }

  function selectPalette(palette) {
    // Hide all selected colours/options and unhide only those in palette
    let selectedRisoColours = p.select('#selected-colours').elt.childNodes;
    palette = palette.map(colour => colour.name);

    // Reset number of Riso layers selected
    risoLayersPrintedQty = 0;

    for (let i = 0; i < selectedRisoColours.length; i++) {
      let colour = selectedRisoColours[i];

      if (palette.includes(colour.innerHTML)) {
        risoMode = true;
        colour.style.display = 'inline';
        createRisoObject(colour.innerHTML, risoLayersPrintedQty);
        addRisoLayerOption(colour.innerHTML);
        p.select(`#${colour.innerHTML}_position_value`).elt.value = risoLayersPrintedQty + 1;
        risoLayersPrintedQty++;
      } else {
        colour.style.display = 'none';
        destroyRisoObject(colour.innerHTML);
        deleteRisoLayerOption(colour.innerHTML);
      }
    }
    toggleCutoutOptions({selectedRisoColours});
  }

  function createRisoObject(colour, position) {
    let riso = new Riso({ channelColor: colour, p5instance: p });
    risoObjects.push({
      name: colour,
      riso,
      position
    })
  }

  function destroyRisoObject(colour) {
    risoObjects = risoObjects.filter(obj => obj.name != colour);
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
    p.redraw();
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

};

export default function initSketch(mediaSrc) {
  mediaSource = mediaSrc;
  let myp5 = new p5(sketch);
}
