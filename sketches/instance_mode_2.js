let container;

let sketch = function(p) {

  p.setup = function() {

    container = p.createDiv();
    container.class('option--container');

    addInputElements();

    p.pixelDensity(1);
    p.noLoop();
  };

  function addInputElements() {

    // Input 1
    let selectorContainer = p.createDiv('Selector');
    selectorContainer.class('option--container');
    let selector = p.createSelect();
    selector.id('selector');
    selector.style('float', 'right');
    selector.option('option_1');
    selector.option('option_2');
    selector.option('option_3');
    selector.selected('option_1');
    selector.changed(handlechange);
    selector.parent(container);
    selectorContainer.parent(container);

    // Input 2
    let thresholdContainer = p.createDiv('Threshold');
    thresholdContainer.id(`threshold`);
    thresholdContainer.class('option--container');
    let value = p.createElement('input');
    value.id(`threshold_slider_value`);
    value.attribute('type', 'number');
    value.attribute('min', '0');
    value.attribute('max', '255');
    value.attribute('value', '128');
    value.style('width', '70px');
    value.style('float', 'right');
    value.changed(updateRangeInput);
    value.parent(thresholdContainer);
    let slider = p.createSlider(0, 255, 128, 1);
    slider.id(`threshold_slider`);
    slider.style('width', '100%');
    slider.input(updateNumberInput);
    slider.parent(thresholdContainer);
    thresholdContainer.style('display', 'none');
    thresholdContainer.parent(container);

    let optionsContainer = p.select('#options--container');
    container.parent(optionsContainer);
  }

  function updateNumberInput(event) {
    let value = event.target.value;
    let feedbackElt = p.select(`#${event.target.id}_value`);
    feedbackElt.elt.value = value;
  }

  function updateRangeInput(event) {
    let value = event.target.value;
    let element = `#${event.target.id}`
    let feedbackElt = p.select(element.replace('_value', ''));
    feedbackElt.elt.value = value;
  }

  function handlechange() {
    let ditherType = this.elt.value;
    let thresholdElt = p.select(`#threshold`);
    // element not found - new div is created instead in the DOM
    console.log(thresholdElt);

    let thresholdElt_ = document.getElementById(`threshold`);
    // element found using the base method
    console.log(thresholdElt_);
  }

};

let myp5 = new p5(sketch);
