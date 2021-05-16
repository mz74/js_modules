// 2021-05-13 new parameters: y_relative, x_relative; removed pos_relative

"use strict";

const mz_svg_text = () => {
  // define parameters
  const p = {

    div_id: 'box1',
    svg_id: 'box1_svg',
    chart_id: 'box1_xy',

    // text
    // use 'u\xxxx' or 'u\{xxxxx}' for unicode characters
    text: 'test',

    // xy positions
    x: 0.5,
    y: 0.5,

    // relative or absolute xy position values
    x_relative: 'TRUE',
    y_relative: 'TRUE',

    // css class
    class: undefined,

    // text properties (if not defined in css)
    font_size: undefined,
    font_weight: undefined,
    color: undefined,
    baseline: 'middle', // dominant-baseline in vertical direction e.g auto, middle, hanging
    anchor: undefined, // horizontal direction e.g. start, middle, end

  };

  // function to change or get parameter
  // use: 
  // .par(parameter)
  // .par(parameter, value)

  const par = (...args) => {
    if (args.length == 0) return null;
    if (args.length == 1) return p[args[0]];
    if (args.length == 2) {
      p[args[0]] = args[1];
    }
    return {
      par,
      render
    };
  };

  const render = () => {

    const ddiv = d3.select('#' + p.div_id);
    const div_width = +ddiv.node().offsetWidth,
      div_height = +ddiv.node().offsetHeight;

    const chart_svg = d3
      .select("#" + p.svg_id)
      .attr("width", div_width)
      .attr("height", div_height);

    // absolute or relative xy position values
    const x_scale = p.x_relative ==  "TRUE" ? div_width :  1;
    const y_scale = p.y_relative ==  "TRUE" ? div_height :  1;

    console.log(p.text);
    console.log(x_scale);
    console.log(y_scale);

    chart_svg.append("text")
      .text(p.text)
      .attr("class", p.class)
      .attr("x", p.x * x_scale)
      .attr("y", p.y * y_scale)
      .attr("fill", p.color)
      .attr("dominant-baseline", p.baseline)
      .attr("text-anchor", p.anchor)
      .attr("font-size", p.font_size)
      .attr("font-weight", p.font_weight);

  };
  return {
    par,
    render
  };
};

// how to use

//const dtext = mz_svg_text();
// dtext
//   .par("div_id", did)
//   .par("svg_id", did + "_svg")
//   .par("chart_id", did + "_head8")
//   .par('text', '\u{1F647}')
//   .par('class', 'text_large_bold')
//   .par('anchor', 'middle')
//   .render();