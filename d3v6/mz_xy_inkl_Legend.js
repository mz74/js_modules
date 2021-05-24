"use strict";

// 2020-11-29 -> d3v6
// 2021-04-15 -> function to function factory
// 2021-05-04 improve color values
// 2021-05-16 add date axis
// 2021-05-22 change to xy chart

const mz_xy = () => {

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
    axis_value: "noTRUE",
    axis_label: "TRUE",
    axis_left_class: "path_none mz_text_small",
    axis_bottom_class: "path_none mz_text_small",
    padding_axis_value: 0.02, // extra space for value-axis
    grid_value: "noTRUE",
    grid_label: "noTRUE",
    ticks_nb: 2,

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

    // legend
    // external function and parameters
    cbp: {},
    cbfun: '', // eval, when legend is changed
    show: undefined, // data to show

    // legend
    legend: 'none', //  "bottom", "right"
    legend_left: 0.23, // for point of legend
    legend_top: 0.95,
    legend_space: 0.25,
    legend_class: 'mz_text_small mz_text_color',

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
    if (p.show !== undefined) {
      for (let i of p.show)
        if (i.show != 'TRUE') {
          mz_data = mz_data.filter(a => a[p.group] != i.label);
        }
      // console.log(mz_data);
    }

    // Prepare Scale

    // max and min values
    let dummy_max = d3.max(mz_data, d => d[p.value]);
    let dummy_min = d3.min(mz_data, d => d[p.value]);

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
      .data(mz_data)

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
    // -----------------------------------------------------------------

    if (p.show_data_line == "TRUE") {

      console.log(mz_data);



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
          .attr("stroke-width", 1)
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

    // plot legend 
    // -------------------------------------------------------------------------

    if (p.legend == "right" || p.legend == "bottom") {

      let mz_dummy_space = p.legend == "bottom" ? div_width : div_height; // space between legend elements
      let mz_dummy_offset = p.legend == "bottom" ? div_height : div_width; // space from chart


      let mz_legend_space =
        p.legend_space === undefined ?
        0.06 * mz_dummy_space :
        p.legend_space * mz_dummy_space;

      const legend_left = p.legend_left * div_width,
        legend_top = p.legend_top * div_height;

      // legend data

      const legend_data = [];
      const map = new Map();
      for (const item of p.data) {
        if (!map.has(item[p.group])) {
          map.set(item[p.group], true); // set any value to Map
          legend_data.push({
            label: item[p.group],
            color: item[p.color]
          });
        }
      }

      console.log(legend_data);

      chart_svg
        .append("g")
        .selectAll("text")
        .data(legend_data)
        .join("text")
        .attr("class", p.legend_class)
        .attr("x", (d, i) =>
          p.legend == "bottom" ?
          legend_left + i * mz_legend_space + 20 :
          legend_left + 20
        )
        .attr("y", (d, i) =>
          p.legend == "bottom" ?
          legend_top :
          legend_top + i * p.legend_space
        )
        .style("text-anchor", "start")
        .style("dominant-baseline", "middle")
        .text(d => d.label);

      //console.log(p.show);

      chart_svg
        .append("g")
        .selectAll("text")
        .data(legend_data)
        .join("text")
        .attr("class", p.legend_class)
        .attr("x", (d, i) =>
          p.legend == "bottom" ?
          legend_left + i * mz_legend_space :
          legend_left
        )
        .attr("y", (d, i) =>
          p.legend == "bottom" ?
          legend_top :
          legend_top + i * mz_legend_space
        )
        .style("text-anchor", "start")
        .style("dominant-baseline", "middle")
        // .text(d => d.show == 'TRUE' ? '\u2611' : '\u2610')
        .text(d => p.show.filter(a => a.label == d.label).map(a => a.show) == 'TRUE' ? '\u2611' : '\u2610')
        .style('stroke', d => d.color)
        .style('font-weight', 'bold')
        .style('cursor', 'pointer')
        .on("click", (event, d) => {
          const dshow = p.show.filter(a => a.label == d.label).map(a => a.show)[0] == "TRUE" ? "FALSE" : "TRUE";
          const obj_index = p.show.findIndex((a => a.label == d.label));
          p.show[obj_index].show = dshow;
          p.cbfun();
          // if (p.cols.filter(a => a.show == 'TRUE').length < 2) { // min 2 data
          //   d.show = 'TRUE';
          // } else {
          //   p.cbfun();
          // }

        });
    }

  };
  return {
    par,
    render
  };
};