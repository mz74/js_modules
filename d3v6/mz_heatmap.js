"use strict";

// 2020-11-29 -> d3v6
// 2021-04-15 -> function to function factory
// 2021-05-04 improve color values
// 2021-05-04 convert to bar diagram

const mz_heatmap = () => {

  const p = {

    div_id: 'box1',
    svg_id: 'box1_svg',
    chart_id: 'box1_xy',

    data: [], // array of objects

    // which data to show
    label_x: "Segment",
    value: 'Kundenanzahl',
    label_y: "group",
    mode: 'selected', // show percent 
    sort: "noTRUE",
    // order data
    order_label: undefined,
    order_group: undefined,

    // bar properties
    color: ['#F5F5F5', '#808080'],
    orientation: "nohorizontal",
    bar_margin: 0.15,

    // chart corners
    left: 0.2,
    top: 0.12,
    right: 0.885,
    bottom: 0.9,

    // extra data line
    show_data_line: 'TRUE',
    line_orientation: 'nohorizontal',
    line_color: '#cb5e38',
    line_thickness: 3,

    // axes
    axis_value: "noTRUE",
    axis_label: "TRUE",
    axis_left_class: "path_none mz_text_small",
    axis_bottom_class: "path_none mz_text_small",
    padding_axis_value: 0.02, // extra space for value-axis
    grid_value: "noTRUE",
    grid_label: "noTRUE",

    // legends
    legend_percent: true,
    legend_percent_left: 0.25,
    legend_percent_top: 0.97,
    legend_class: 'mz_text_small mz_text_color',

    // direct labeling 
    text: "TRUE",
    textsize: 15,
    textcolor: '#A9A9A9',
    text_dx: 0,
    text_dy: 0,
    // text_format: "+" + mz_text_format[mz_vbox1_start], //"+$0.1s"
    text_format: "0.3s",
    text_class: 'mz_text_tiny mz_text_dark',

    // tooltip
    tooltip_text: 'd[p.label] + " " + d[p.group] + "<br>"+ chart_value + ": " + d3.format(p.tooltip_format)(d[chart_value])',
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

    // prepare data
    let chart_value = p.value;

    // calc percents
    // the y_values -> 100%
    for (let i in p.data) {
      let d_data = p.data.filter(a => a[p.label_y] == p.data[i][p.label_y]);
      let d_max = d3.max(d_data, d => d[p.value]);
      p.data[i].percent = p.data[i][p.value] / d_max;
    }
    if (p.mode === 'selected') {
      chart_value = 'percent';
      p.text_format = '.2p';
    }

    // console.log(p.data);
    // console.log(chart_value);

    // sort data - decreasing
    if (p.sort == "TRUE") {
      p.data.sort(function (a, b) {
        return a[p.value] - b[p.value];
      });
    }

    // sort data - predefined order
    if (p.order_label !== undefined) {
      p.data.sort((a, b) => (p.order_label.indexOf(b[p.label]) - p.order_label.indexOf(a[p.label])));
    }
    if (p.order_group !== undefined) {
      p.data.sort((a, b) => (p.order_group.indexOf(a[p.group]) - p.order_group.indexOf(b[p.group])));
    }

    // Prepare Scale

    // max and min values
    let dummy_max = d3.max(p.data, d => d[chart_value]);
    let dummy_min = d3.min(p.data, d => d[chart_value]);
    let dummy_med = d3.median(p.data, d => d[chart_value]);
    if (2.5 * dummy_med < dummy_max) {
      dummy_med = 2 * dummy_med;
    }

    // define colors

    let color_med = d3.scaleLinear()
      .domain([dummy_min, dummy_max])
      .range(p.color)
      .interpolate(d3.interpolateLab)(0.5 * (dummy_max + dummy_min));

    let col_scale = d3.scaleLinear()
      .domain([dummy_min, dummy_med, dummy_max])
      .range([p.color[0], color_med, p.color[1]])
      .interpolate(d3.interpolateLab);

    for (let i in p.data) {
      p.data[i].color = col_scale(p.data[i][chart_value]);
    }





    // extra space for value-axis
    const pad_value = p.padding_axis_value * chart_width;

    // axis scales
    // horizontal axis (x)
    const x_scale =
      d3
      .scaleBand()
      .range([chart_left, chart_right])
      .domain(p.data.map(d => d[p.label_x]))
      .padding(p.bar_margin)

    // vertical axis (y)
    const y_scale =
      d3
      .scaleBand()
      .range([chart_bottom, chart_top])
      .domain(p.data.map(d => d[p.label_y]))
      .padding(p.bar_margin);

    // inner scales


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

    // console.log(p.data);

    let mz_chart = chart_svg
      .selectAll("mz_bar")
      .data(p.data);

    mz_chart
      .join("rect")
      .attr("class", p.chart_id)
      //  .attr("id", (d, i) => p.chart_id + "l" + i)
      .attr("x", d => x_scale(d[p.label_x]))
      .attr("y", d => y_scale(d[p.label_y]))
      .attr("height", d => y_scale.bandwidth())
      // to have transition
      // .attr("fill", d => p.color == undefined ? p.color_value : d[p.color])
      // .attr("r", 0)
      .attr("opacity", 1)

      .on("mousemove", function (event, d) {
        d3.select(this)
          .transition()
          .attr("opacity", 0.5)


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
        // tooltip.html(window.innerHeight - event.pageY);
      })

      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .attr("opacity", 1)
        // .attr("r", p.radius);
        tooltip.style("display", "none");
      })

      .transition()
      .duration(p.transition_duration)
      .attr("width", d => x_scale.bandwidth())
      .attr("fill", d => d.color);

    // -----------------------------------------------------------------------------------------------
    // add line

    if (p.show_data_line == "TRUE") {



      mz_chart
        .join("line")
        // .append("line")
        // .attr("class", p.chart_id)
        .attr('pointer-events', 'none')
        .attr("x1", d =>
          p.line_orientation == "horizontal" ?
          x_scale(d[p.label_x]) :
          x_scale(d[p.label_x]) + 0.95 * x_scale.bandwidth()
        )
        .attr("x2", d =>
          p.line_orientation == "horizontal" ?
          x_scale(d[p.label_x]) :
          x_scale(d[p.label_x]) + 0.95 * x_scale.bandwidth()
        )
        .attr("y1", d =>
          p.line_orientation == "horizontal" ?
          y_scale(d[p.label_y]) + y_scale.bandwidth() * (1 - d[chart_value] / dummy_max) :
          y_scale(d[p.label_y]) + y_scale.bandwidth()
        )
        .attr("y2", d =>
          p.line_orientation == "horizontal" ?
          y_scale(d[p.label_y]) + y_scale.bandwidth() * (1 - d[chart_value] / dummy_max) :
          y_scale(d[p.label_y]) + y_scale.bandwidth()
        )
        .transition()
        .duration(p.transition_duration)
        .attr("x2", d =>
          p.line_orientation == "horizontal" ?
          x_scale(d[p.label_x]) + x_scale.bandwidth() :
          x_scale(d[p.label_x]) + 0.95 * x_scale.bandwidth()
        )
        .attr("y1", d =>
          p.line_orientation == "horizontal" ?
          y_scale(d[p.label_y]) + y_scale.bandwidth() * (1 - d[chart_value] / dummy_max) :
          y_scale(d[p.label_y]) + y_scale.bandwidth() * (1 - d[chart_value] / dummy_max)
        )
        // .attr("stroke", d => p.color == undefined ? p.color_value : d[p.color])
        .attr('stroke', p.line_color)
        .attr("opacity", 1)
        .attr("stroke-width", p.line_thickness);
    }



    // Text

    if (p.text == "TRUE") {
      let mdx = p.text_dx * chart_width; // + 0.05 * chart_width;
      let mdy = p.text_dy * chart_height;

      let mz_chart_text = mz_chart
        .join("text")
        .attr("class", p.text_class);
      mz_chart_text
        .text(d => d3.format(p.text_format)(d[chart_value]))
        .attr('pointer-events', 'none')
        .attr("x", d => x_scale(d[p.label_x]) + 0.5 * x_scale.bandwidth())
        .attr("y", d => y_scale(d[p.label_y]) + 0.5 * y_scale.bandwidth())
        .attr("dx", d => mdx)
        .attr("dy", d => mdy)
        .attr("text-anchor", 'middle')
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
          .ticks(4)
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
          .ticks(4)
          .tickSize(ticksize_axis_bott)
        );
    }

    // Legend Percent ---------------------------------------------------------------------

    if (p.legend_percent == true) {

      const legend_percent_left = p.legend_percent_left * div_width,
        legend_percent_top = p.legend_percent_top * div_height;

      chart_svg
        .append("text")
        .attr("class", p.legend_class)
        .attr("x", legend_percent_left)
        .attr("y", legend_percent_top)
        .style("text-anchor", "start")
        .style("dominant-baseline", "middle")
        .style('cursor', 'pointer')
        .text(d => p.mode == 'selected' ? '\u2611' : '\u2610')
        .on("click", (event, d) => {
          p.mode = p.mode == 'selected' ? 'unselected' : 'selected';
          p.cbfun();
        });

      chart_svg
        .append("text")
        .attr("class", p.legend_class)
        .attr("x", legend_percent_left + 20)
        .attr("y", legend_percent_top)
        .style("text-anchor", "start")
        .style("dominant-baseline", "middle")
        .text('Kohorte auf Maximum skalieren')
    }
  };
  return {
    par,
    render
  };
};