// 2021-05-13 new parameters: y_relative, x_relative; removed pos_relative
// 2021-05-18 value box

"use strict";

const mz_value_box = () => {
  // define parameters
  const p = {

    div_id: 'box1',
    svg_id: 'box1_svg',
    chart_id: 'box1_xy',

    // text
    // use 'u\xxxx' or 'u\{xxxxx}' for unicode characters
    text: 'test',

    // define rect
    left: 0,
    right: 1,
    top: 0,
    bottom: 1,
    color: '#808080',
    opacity: 1,
    rx: 10,   // radius
    ry: 10,

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
    // color: undefined,
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
      .attr("height", div_height)
      .append('svg') // additional svg for saving
      .attr("width", div_width)
      .attr("height", div_height)
      .attr("id", p.chart_id);

      const chart_left = p.left * div_width,
      chart_right = p.right * div_width,
      chart_top = p.top * div_height,
      chart_bottom = p.bottom * div_height;

    const chart_width = chart_right - chart_left;
    const chart_height = chart_bottom - chart_top;

     chart_svg
    .insert("rect", ":first-child")
    .attr("x", chart_left)
    .attr("y", chart_top)
    .attr("width", chart_width)
    .attr("height", chart_height)
    .attr("rx", p.rx)
    .attr("ry", p.ry)
    .attr("fill", p.color)
    .attr("opacity", p.opacity);

    p.text.forEach(function (d, i) {
      chart_svg
        .append("text")
        .text(d.text)
        // .text(d => d[chartp.text_data] === undefined ? mz_locale.format(chartp.text_format)(d[chart_value]) : d[chartp.text_data])
        .attr("x", d.x * chart_width + chart_left)
        .attr("y", d.y * chart_height + chart_top)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        //.attr("font-size", d.size*Math.min(mz_width, mz_height))
        .attr("font-size", d.size * 0.4 * (chart_width + 0.25 * chart_height))
        .attr("fill", d.color)
        // .style("stroke", "blue")
        .attr('pointer-events', 'none')
        .attr("font-weight", d.font_weight);
    });


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