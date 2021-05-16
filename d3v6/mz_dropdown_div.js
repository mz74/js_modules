// replace eval by using functions
// 2021-05-13 add parameter min_width

"use strict";

const mz_dropdown_div = () => {
  // define parameters 
  const p = {

    div_id: 'box1',
    svg_id: 'box1_svg',
    chart_id: 'box1_xy',

    // chart position
    left: undefined,
    top: undefined,
    right: undefined,
    bottom: undefined,

    // text
    text_selection: "\u2630", // '_selection', '_selection_arrow', also: \u22ee (kebab), \u2b07 (downarrow), \u2913 (downarrow)

    style: 'right', // option dropdown: connect left or right 
    type: 'click', // click or hover 

    // minwidth of dropdown field in px
    min_width: 0,

    // selection and options
    selection: '',
    options: [],
    test: {
      'one': 'go',
      'two': 'stop'
    },

    // extern parameters and function to evaluate
    cbp: '',
    cbfun: '', //function(){console.log('run_me');},

    // css style, cf _dropdown.css
    class_button: 'mz_button-droptown mz_text_small',
    class_button_hover: 'mz_button-droptown_hover', // extra class for hover button
    class_dropdown: 'mz_dropdown-content', // add mz_dropdown-minwidth
    class_option: 'mz_dropdown-content-opt',
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

  const render = function () {
    //p.cbfun();
    if (p.type === 'hover') p.class_button = p.class_button + ' ' + p.class_button_hover;

    // prepare text_selection
    let text_selection = p.text_selection;
    if (p.text_selection == '_selection') text_selection = p.selection;
    if (p.text_selection == '_selection_arrow') text_selection = p.selection + ' \u25BC';

    let chart_div = d3.select('#' + p.div_id);
    let chart_width = +chart_div.node().offsetWidth,
      chart_height = +chart_div.node().offsetHeight;

    //console.log(chart_svg);

    let mz_width = (p.right - p.left) * chart_width;
    let mz_height = (p.bottom - p.top) * chart_height;

    let chart_left = p.left * chart_width,
      chart_right = p.right * chart_width,
      chart_top = p.top * chart_height,
      chart_bottom = p.bottom * chart_height;

    // console.log(chart_left);
    // console.log(chart_top);
    // console.log(chart_right);
    // console.log(chart_bottom);

    let dclicked = false;

    let chart_button =
      chart_div
      .append('div')
      .style('left', chart_left + 'px')
      .style('top', chart_top + 'px')
      .style('right', chart_right + 'px')
      .style('bottom', chart_bottom + 'px')
      .attr("class", p.class_button + ' ' + p.chart_id)
      .text(text_selection)
      .on('mouseleave', (event, d) => {
        //document.getElementById(p.chart_id).classList.toggle("show");
        let d_check = d3.select('#' + p.chart_id);
        //d_check.style('display', () => d_check.style('display') == 'block' ? 'none' : 'block');
        d_check.classed('mz_show', false);
      })
      .on('click', (event, d) => {
        //document.getElementById(p.chart_id).classList.toggle("show");
        let d_check = d3.select('#' + p.chart_id);
        //d_check.style('display', () => d_check.style('display') == 'block' ? 'none' : 'block');
        //d_check.classed('mz_show', () => d_check.classed('mz_show') == true ? false : true);
        d_check.classed('mz_show', () => d_check.classed('mz_show') == true || dclicked == true ? false : true);
      });

    chart_button
      .append('div')
      .attr("class", p.class_dropdown)
      .classed("mz_show", false)
      .attr('id', p.chart_id) // to be changed
      .style('right', () => p.style === 'right' ? 0 + 'px' : 'undefined')
      .style('left', () => p.style !== 'right' ? 0 + 'px' : 'undefined')
      .style('min-width', p.min_width + 'px')
      .selectAll('opt_divs')
      .data(p.options)
      .join('div')
      .attr("class", p.class_option)
      .text(d => d)
      .on("click", (event, d) => {
        let d_check = d3.select('#' + p.chart_id);
        d_check.classed('mz_show', false);
        dclicked = true;
        p.selection = d;
        p.cbfun();
        //eval(p.cbfun);
      });



    // window.onclick = (event) => {
    //   if (!event.target.matches('.' + p.chart_id)) {
    //     let d_check = d3.select('#' + p.chart_id);
    //     d_check.classed('mz_show', false);
    //   }
    //}

  };
  return {
    par,
    render
  };
};

// how to start

// const value_button = mz_dropdown_div();
//     value_button
//       .par('div_id', 'box1_23')
//       .par('svg_id', 'box1_23_svg')
//       .par('chart_id', 'box1_23_val2')
//       .par('top', defs.top_button)
//       .par('right', 0)
//       .par('style', 'right')
//       .par('type', 'click')
//       .par('text_selection', '_selection_arrow')
//       .par('selection', defs.gesamt_start)
//       .par('options', defs.options)
//       .par('cbp', {p1:tl_parameters})
//       .par("cbfun", function(){_render_box1_23(this.cbp.p1, 1000);})
//  old:      .par('cbfun', "_render_box1_23(this.cbp().p1, this, this.cbp().p1.defs.Mandant, 1000);");