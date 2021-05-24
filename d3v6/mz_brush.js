"use strict";

// 2020-11-29 -> d3v6
// 2021-04-15 -> function to function factory
// 2021-05-04 improve color values
// 2021-05-16 add date axis
// 2021-05-22 change to xy chart

const mz_brush = () => {

  const p = {

    div_id: 'box1',
    svg_id: 'box1_svg',
    chart_id: 'box1_xy',

    data: [], // array of objects

    // which data to show
    label: "Segment",
    value: 'Kundenanzahl',
    group: 'group',
    sort: "TRUE",
    order: undefined,

    // brush range and domain
    brush_range: undefined,
    brush_domain: undefined,

    label_format: 'categorical', // categorical, numeric or date

    // lollipop properties
    color: undefined,
    color_value: '#675f50',
    radius: 7,
    orientation: "nohorizontal",
    show_data_line: "TRUE",

    // chart corners
    left: 0.2,
    top: 0.12,
    right: 0.8,
    bottom: 0.9,

    // axes
    axis_show_zero: 'noTRUE',
    axis_value: "noTRUE",
    axis_label: "TRUE",
    axis_left_class: "path_none mz_text_tiny",
    axis_bottom_class: "path_none mz_text_tiny",
    padding_axis_value: 0.02, // extra space for value-axis
    grid_value: "noTRUE",
    grid_label: "noTRUE",
    ticks_nb: 2,

    // transition
    transition_duration: 1000,
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

    // parent div
    const ddiv = d3.select("#" + p.div_id),
      div_width = +ddiv.node().offsetWidth,
      div_height = +ddiv.node().offsetHeight;

    // parent svg
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

    // sort data - decreasing
    if (p.sort == "TRUE") {
      p.data.sort(function (a, b) {
        return a[p.label] - b[p.label];
      });
    }

    // sort data - predefined order
    if (p.order !== undefined) {
      p.data.sort((a, b) => (p.order.indexOf(a[p.label]) - p.order.indexOf(b[p.label])));
    }

    // which data to show
    let mz_data = p.data;

    // Prepare Scale

    // max and min values
    let dummy_max = d3.max(mz_data, d => d[p.value]);
    let dummy_min = d3.min(mz_data, d => d[p.value]);

    if (dummy_min > 0 && p.axis_show_zero == 'TRUE') {
      dummy_min = 0;
    }
    if (dummy_max < 0 && p.axis_show_zero == 'TRUE') {
      dummy_max = 0;
    }

    // extra space for value-axis
    const pad_value =
      p.orientation == "horizontal" ?
      p.padding_axis_value * chart_height :
      p.padding_axis_value * chart_width;

    // axis scales
    // horizontal axis (x)
    const x_scale =
      p.orientation == "horizontal" ?
      p.label_format == 'date' ?
      d3
      .scaleTime()
      .range([chart_left + pad_value, chart_right - pad_value])
      .domain(d3.extent(mz_data, d => d[p.label])) :
      d3
      .scalePoint()
      .range([chart_left, chart_right])
      .domain(mz_data.map(d => d[p.label]))
      .padding(0.5) :
      d3
      .scaleLinear()
      .range([
        chart_left + pad_value,
        chart_right - pad_value
      ])
      .domain([dummy_min, dummy_max]);

    // vertical axis (y)
    const y_scale =
      p.orientation == "horizontal" ?
      d3
      .scaleLinear()
      .range([
        chart_bottom - pad_value, // check if correct !!! (+-)
        chart_top + pad_value
      ])
      .domain([dummy_min, dummy_max]) :
      d3
      .scalePoint()
      .range([chart_bottom, chart_top])
      .domain(mz_data.map(d => d[p.label]))
      .padding(0.5);


    // -------------------------------------

    let mz_chart = chart_svg
      .selectAll("mz_lollipop")
      .data(mz_data)

    // The data line
    // -----------------------------------------------------------------

    if (p.show_data_line == "TRUE") {

      const line = d3
        .line()
        .x(d => x_scale(d[p.label])) // set the x values for the line generator
        .y(d => y_scale(d[p.value])) // set the y values for the line generator
        .curve(d3.curveCatmullRom); // apply smoothing to the line

      // separate line data
      // const line_groups = [...new Set(mz_data.map(a => a[p.group]))];

      const line_data = [];
      const map = new Map();
      for (const item of mz_data) {
        if (!map.has(item[p.group])) {
          map.set(item[p.group], true); // set any value to Map
          line_data.push({
            label: item[p.group],
            color: item[p.color]
          });
        }
      }

      let mz_subchart;

      line_data.forEach(d => {
        mz_subchart = mz_chart
          .join('path')
          .datum(mz_data.filter(a => a[p.group] == d.label))
          .attr("d", line)
          .attr("stroke", d.color)
          .attr("stroke-width", 0.25)
          .attr("fill", "none")

        let dpathlength = mz_subchart.node().getTotalLength();
        mz_subchart
          .attr("stroke-dasharray", dpathlength)
          .attr("stroke-dashoffset", dpathlength)
          .transition()
          .duration(p.transition_duration)
          .attr("stroke-dashoffset", 0);

      })
    }


    // Brush 
    // ---------------------------------------

    const brush = d3.brushX()
      .extent([
        [chart_left, chart_top],
        [chart_right, chart_bottom]
      ])
      // .on("brush", brushended)
      .on("end", brushended);

    if (p.brush_range === undefined) {
      p.brush_domain = x_scale.domain();
      p.brush_range = x_scale.range();
    }

    let mz_brush = chart_svg
      .append("g")
      // .attr("class", "botbrush")
      .call(brush)
      .call(brush.move, [
        // x_scale(x_scale.domain()[0]),
        // x_scale(x_scale.domain()[1])
        x_scale(p.brush_domain[0]),
        x_scale(p.brush_domain[1]),
      ]);

    function brushended({
      selection
    }) {
      if (selection) {
        if (selection[0] != p.brush_range[0] || selection[1] != p.brush_range[1]) {
          // gb.call(brush.move, defaultSelection);
          console.log(selection);
          console.log(selection.map(x_scale.invert));
          p.brush_range = selection;
          p.brush_domain = selection.map(x_scale.invert);
          p.cbfun();
        }

      }
    }





    // Axis

    let ticksize_axis_bott, ticksize_axis_left; // length of axis grid lines

    if (p.orientation == "horizontal") {
      ticksize_axis_bott =
        p.grid_label == "TRUE" ?
        -chart_height + pad_value :
        0;
      ticksize_axis_left =
        p.grid_value == "TRUE" ? -chart_width : -5;
    } else {
      ticksize_axis_bott =
        p.grid_value == "TRUE" ? -chart_height : 0;
      ticksize_axis_left =
        p.grid_label == "TRUE" ?
        -chart_width + pad_value :
        -5;
    }

    // plot axis left

    if (
      (p.axis_value == "TRUE") && (p.orientation == "horizontal") ||
      (p.axis_label == "TRUE") && (p.orientation != "horizontal")
    ) {
      chart_svg
        .append("g")
        .attr("class", p.axis_left_class)
        .attr("transform", "translate(" + chart_left + ",0)")
        .call(
          d3
          .axisLeft(y_scale)
          .ticks(p.ticks_nb)
          // .text(d => d3.format(p.text_format)(d[p.value]))
          .tickFormat(p.orientation == "horizontal" ? d3.format(p.text_format) : undefined)
          .tickSize(ticksize_axis_left)
        );
    }

    // plot axis bottom 

    if (p.axis_value == "TRUE" || p.orientation == "horizontal") {
      chart_svg
        .append("g")
        .attr("class", p.axis_bottom_class)
        // .style("font", "24px times")
        .attr("transform", "translate(0," + chart_bottom + ")")
        .call(
          d3
          .axisBottom(x_scale)
          .ticks(p.ticks_nb)
          // .tickFormat(d3.timeFormat("%x"))
          .tickFormat(p.orientation != "horizontal" ? d3.format(p.text_format) : undefined)
          .tickSize(ticksize_axis_bott)
        );
    }


  };
  return {
    par,
    render
  };
};