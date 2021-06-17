"use strict";

// 2020-11-29 -> d3v6
// 2021-04-15 -> function to function factory
// 2021-05-04 improve color values
// 2021-05-16 add date axis
// 2021-05-28 x_scale: add numeric; add domain_x


const mz_lollipop = () => {

  const p = {

    div_id: 'box1',
    svg_id: 'box1_svg',
    chart_id: 'box1_xy',

    data: [], // array of objects

    // which data to show
    label: "Segment",
    value: 'Kundenanzahl',
    sort: "noTRUE",
    order: undefined,

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
    domain_x: undefined,   // extern domain for x-Axis
    axis_value: "noTRUE",
    axis_label: "TRUE",
    axis_left_class: "path_none mz_text_small",
    axis_bottom_class: "path_none mz_text_small",
    padding_axis_value: 0.02, // extra space for value-axis
    grid_value: "noTRUE",
    grid_label: "noTRUE",
    ticks_nb_left: 3,
    ticks_nb_bottom: 5,

    // direct labeling 
    text: "TRUE",
    textsize: 15,
    textcolor: '#A9A9A9',
    text_dx: 0,
    text_dy: 0,
    // text_format: "+" + mz_text_format[mz_vbox1_start], //"+$0.1s"
    text_format: "0.3s",
    text_class: 'mz_small_text_light',

    // tooltip
    tooltip_text: 'd[p.label] + "<br>"+ p.value + ": " + d3.format(p.tooltip_format)(d[p.value])',
    tooltip_text_pre: undefined, // e.g "Vgl. Vorperiode",
    tooltip_format: ",~f",
    tooltip_class: 'toolTip',

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
        return a[p.value] - b[p.value];
      });
    }

    // sort data - predefined order
    if (p.order !== undefined) {
      p.data.sort((a, b) => (p.order.indexOf(a[p.label]) - p.order.indexOf(b[p.label])));
    }

    // Prepare Scale

    // max and min values
    let dummy_max = d3.max(p.data, d => d[p.value]);
    let dummy_min = d3.min(p.data, d => d[p.value]);

    if (dummy_min > 0) {
      dummy_min = 0;
    }
    if (dummy_max < 0) {
      dummy_max = 0;
    }

    // extra space for value-axis
    const pad_value =
      p.orientation == "horizontal" ?
      p.padding_axis_value * chart_height :
      p.padding_axis_value * chart_width;

// axis scales
    // horizontal axis (x)
    let x_scale;
    if (p.orientation != "horizontal") {
      x_scale = d3
        .scaleLinear()
        .range([
          chart_left + pad_value,
          chart_right - pad_value
        ])
        .domain([dummy_min, dummy_max]);
    } else if (p.label_format == 'date') {
      x_scale = d3
        .scaleTime()
        .range([chart_left + pad_value, chart_right - pad_value])
        .domain(d3.extent(p.data, d => d[p.label]));
    } else if (p.label_format == 'numeric') {
      x_scale = d3
        .scaleLinear()
        .range([chart_left + pad_value, chart_right - pad_value])
        .domain(d3.extent(p.data, d => d[p.label]));
    } else {
      x_scale = d3
        .scalePoint()
        .range([chart_left, chart_right])
        .domain(p.data.map(d => d[p.label]))
        .padding(0.5)
    }

    // change domain!
    if (p.domain_x !== undefined){
      x_scale.domain(p.domain_x);
    }

    // console.log(x_scale.domain());
    // console.log(p.domain_x);

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
      .domain(p.data.map(d => d[p.label]))
      .padding(0.5);

    //  var y_scale2 = d3.scalePoint().range([height2, 0]).padding(0.5);

    // the Tooltip
    const tooltip = d3
      .select('body')
      .append("div")
      .attr("class", p.tooltip_class);

    let tooltip_text = p.tooltip_text;
    if (p.tooltip_text_prev !== undefined) {
      tooltip_text = tooltip_text_prev + ' + "<br>" + p.tooltip_text';
    }

    // -------------------------------------

    let mz_chart = chart_svg
      .selectAll("mz_lollipop")
      .data(p.data)

    // add circles

    mz_chart
      .join("circle")
      .attr("class", p.chart_id)
      //  .attr("id", (d, i) => p.chart_id + "l" + i)
      .attr("cx", d =>
        p.orientation == "horizontal" ?
        x_scale(d[p.label]) :
        x_scale(d[p.value])
      )
      .attr("cy", d =>
        p.orientation == "horizontal" ?
        y_scale(d[p.value]) :
        y_scale(d[p.label])
      )
      // to have transition
      .attr("fill", d => p.color == undefined ? p.color_value : d[p.color])
      .attr("r", 0)
      .attr("opacity", 1)

      .on("mousemove", function (event, d) {
        d3.select(this)
          .transition()
          //.attr("opacity", 0.5)
          .attr("r", 1.5 * p.radius);

        if (event.pageX / window.innerWidth > 0.5) {
          tooltip.style("left", undefined);
          tooltip.style("right", window.innerWidth - event.pageX + 10 + "px");
        } else {
          tooltip.style("left", event.pageX + 10 + "px");
          tooltip.style("right", undefined);
        }

        if (event.pageY / window.innerHeight > 0.5) {
          tooltip.style("top", undefined);
          tooltip.style("bottom", (window.innerHeight - event.pageY - 25) + "px");
        } else {
          tooltip.style("top", event.pageY - 25 + "px");
          tooltip.style("bottom", undefined);
        }

        tooltip.style("display", "inline-block");
        tooltip.html(eval(tooltip_text));
      })

      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          // .attr("opacity", 1)
          .attr("r", p.radius);
        tooltip.style("display", "none");
      })

      .transition()
      .duration(p.transition_duration / 2)
      .attr("r", 0)
      .transition()
      .duration(p.transition_duration / 2)
      .attr("r", p.radius);


    // The data line

    if (p.show_data_line == "TRUE") {
      mz_chart
        .join("line")
        // .append("line")
        .attr("class", p.chart_id)
        .attr('pointer-events', 'none')
        .attr("x1", d =>
          p.orientation == "horizontal" ?
          x_scale(d[p.label]) :
          x_scale(0)
        )
        .attr("x2", d =>
          p.orientation == "horizontal" ?
          x_scale(d[p.label]) :
          x_scale(0)
        )
        .attr("y1", d =>
          p.orientation == "horizontal" ?
          y_scale(0) :
          y_scale(d[p.label])
        )
        .attr("y2", d =>
          p.orientation == "horizontal" ?
          y_scale(0) :
          y_scale(d[p.label])
        )
        .transition()
        .duration(p.transition_duration)
        .attr("x1", d =>
          p.orientation == "horizontal" ?
          x_scale(d[p.label]) :
          x_scale(d[p.value])
        )
        .attr("y1", d =>
          p.orientation == "horizontal" ?
          y_scale(d[p.value]) :
          y_scale(d[p.label])
        )
        .attr("stroke", d => p.color == undefined ? p.color_value : d[p.color])
        .attr("opacity", 1)
        .attr("stroke-width", 3);
    }

    // Text

    if (p.text == "TRUE") {
      let mdx = p.text_dx * chart_width; // + 0.05 * chart_width;
      let mdy = p.text_dy * chart_height;

      let mz_chart_text = mz_chart
        .join("text")
        .attr("class", p.text_class);
      mz_chart_text
        .text(d => d3.format(p.text_format)(d[p.value]))
        .attr('pointer-events', 'none')
        .attr("x", d =>
          p.orientation == "horizontal" ?
          x_scale(d[p.label]) :
          x_scale(d[p.value])
        )
        .attr("y", d =>
          p.orientation == "horizontal" ?
          y_scale(d[p.value]) :
          y_scale(d[p.label])
        )
        .attr("dx", d =>
          p.orientation == "horizontal" ?
          mdx :
          d[p.value] < 0 ?
          -mdx - 2 * p.radius :
          mdx + 2 * p.radius
        )
        .attr("dy", d =>
          p.orientation == "horizontal" ?
          d[p.value] < 0 ?
          mdy + 2 * p.radius :
          -mdy :
          mdy
        )
        .attr("text-anchor", d =>
          p.orientation == "horizontal" ?
          'middle' :
          d[p.value] < 0 ?
          'right' :
          'left'
        )

        .attr("fill", p.textcolor)
        .style("user-select", "none")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 0)
        .transition()
        .duration(p.transition_duration)
        .attr("font-size", p.textsize);
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
          .ticks(p.ticks_nb_left)
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
          .ticks(p.ticks_nb_bottom)
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