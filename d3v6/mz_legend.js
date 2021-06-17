"use strict";

// 2021-05-22
// 2021-05-28: calc show when undefined
// 2021-0-30: add symbol1, symbol2

const mz_legend = () => {

  const p = {

    // legend
    // external function and parameters
    cbp: {},
    cbfun: '', // eval, when legend is changed
    show: undefined, // data to show
    legend_data: undefined, // data.name and color

    // legend
    legend: 'none', //  "bottom", "right"
    legend_left: 0.23, // for point of legend
    legend_top: 0.95,
    legend_space: 0.25,
    legend_class: 'mz_text_small mz_text_color',

    symbol1: '\u2611',
    symbol2: '\u2610', 
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



    // plot legend 
    // -------------------------------------------------------------------------

    let mz_dummy_space = p.legend == "bottom" ? p.div_width : p.div_height; // space between legend elements
    let mz_dummy_offset = p.legend == "bottom" ? p.div_height : p.div_width; // space from chart


    let mz_legend_space =
      p.legend_space === undefined ?
      0.06 * mz_dummy_space :
      p.legend_space * mz_dummy_space;

    const legend_left = p.legend_left * p.div_width,
      legend_top = p.legend_top * p.div_height;


    p.chart_svg
      .append("g")
      .selectAll("text")
      .data(p.legend_data)
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
        legend_top + i * mz_legend_space
      )
      .style("text-anchor", "start")
      .style("dominant-baseline", "middle")
      .text(d => d.label);

    //console.log(p.show);


    p.chart_svg
      .append("g")
      .selectAll("text")
      .data(p.legend_data)
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
      .text(d => p.show.filter(a => a.label == d.label).map(a => a.show) == 'TRUE' ? p.symbol1 : p.symbol2)
      .style('stroke', d => d.color)
      .style('fill', d => d.color)
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


  };
  return {
    par,
    render
  };
};