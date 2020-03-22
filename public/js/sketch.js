const risoColours = [
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
let risoObjects;
let risoLayersSelected = [];

function preload() {
  img = loadImage('/img/picasso_copy.jpg');
}

function setup() {
  let canvas = document.getElementById('canvas');
  let options = document.getElementById('options');
  myCanvas = createCanvas(8.5 * 72, 11 * 72);
  myCanvas.parent("canvas");

  // Position options div
  options.style.position = "absolute";
  options.style.top = "10px";
  options.style.left = "10px";

  risoObjects = createRisoObjects(risoColours);
  addColourSelectors();

  pixelDensity(1);
  // noLoop();
}

function draw() {
  background(255);

  clearRiso();

  for (let i = 0; i < risoLayersSelected.length; i++) {
    if (risoLayersSelected[i]) {
      let risoLayer = risoObjects[risoColours[i]];
      // let extractedColour = extractRGBChannel(img, `${colour}`);
      risoLayer.imageMode(CENTER);
      risoLayer.image(img, width / 2, height / 2);
    }
  }

  drawRiso();
}

function addColourSelectors() {
  for (let i = 0; i < risoColours.length; i++) {
    let colourCheckbox = createCheckbox(`${risoColours[i].charAt(0).toUpperCase() + risoColours[i].slice(1).toLowerCase()}`, false);
    colourCheckbox.changed(colourChanged);
    colourCheckbox.parent("options");
  }
}

function colourChanged() {
  if (this.checked()){
    risoLayersSelected[risoColours.indexOf(this.value().toUpperCase())] = true;
  } else {
    risoLayersSelected[risoColours.indexOf(this.value().toUpperCase())] = false;
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
