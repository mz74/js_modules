"use strict";

const mz_svg_icon = () => {
	// define parameters
	const p = {

		div_id: 'box1',
		svg_id: 'box1_svg',
		chart_id: 'box1_xy',

		icon: 'anja',
		fill: '#675f50',
		stroke: 'none',
		stroke_width: 20,

		width_svg: 1,
		height_svg: 1,

		translate_x: 0,
		translate_y: 0,
		scale_x: 1,
		scale_y: 1,
		scale: 1,

		// chart position
		left: undefined,
		top: undefined,
		right: undefined,
		bottom: undefined,

		anja: '<svg id="id_anja" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"><path d="M9.007 4.4l.034-.498-.034.498zM2.955 8.139l-.461-.194.46.194zM7.5 14c-1.627 0-3.1-.958-3.762-2.444l-.913.406A5.116 5.116 0 007.5 15v-1zm3.761-2.444A4.116 4.116 0 017.5 14v1a5.116 5.116 0 004.675-3.038l-.914-.406zM2 15V6H1v9h1zM7.5 1A5.5 5.5 0 0113 6.5h1A6.5 6.5 0 007.5 0v1zM2 6.5A5.5 5.5 0 017.5 1V0A6.5 6.5 0 001 6.5h1zm11 0V15h1V6.5h-1zM8.974 4.9l1.493.099.066-.998-1.492-.1-.067.998zM11 4.5V3h-1v1.5h1zM3.416 8.331A5.624 5.624 0 018.974 4.9l.067-.997a6.624 6.624 0 00-6.547 4.042l.922.387zm6.73-3.477c.47.47 1.33 1.49 1.69 3.342l.98-.19c-.406-2.1-1.394-3.291-1.962-3.86l-.708.708zM6.5 13H8v-1H6.5v1zM8 13a2 2 0 002-2H9a1 1 0 01-1 1v1zm4.5-4h-2v1h2V9zm-4-1H12V7H8.5v1zm-5 0h3V7h-3v1zm3 0h2V7h-2v1zm-2 1h-2v1h2V9zM6 7.5A1.5 1.5 0 014.5 9v1A2.5 2.5 0 007 7.5H6zM10.5 9A1.5 1.5 0 019 7.5H8a2.5 2.5 0 002.5 2.5V9zm-6.762 2.556c-.495-1.116-.73-2.255-.322-3.225l-.922-.387c-.57 1.36-.2 2.826.33 4.018l.914-.406zm8.437.406c.53-1.19.91-2.574.642-3.957l-.982.19c.212 1.09-.08 2.25-.574 3.36l.914.407z"></path></svg>',
		// shopping cart - fa
		cart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"/></svg>'
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

		const svg_width = div_width * p.width_svg;
		const svg_height = div_height * p.height_svg;

		const transx = div_width * p.translate_x;
		const transy = div_height * p.translate_y;

		let scalx = p.scale_x;
		let scaly = p.scale_y;
		if (p.scale !== 1) {
			scalx = p.scale;
			scaly = p.scale;
		}

		// console.log(this[this._icon]);
		ddiv
			.style('position', 'relative')
			.append('div')
			// .style('border-style', 'solid')
			// .style('border-width', '5px')
			.style('position', 'absolute')
			.style('left', 0)
			.style('top', 0)
			.style('width', div_width + 'px')
			.style('height', div_height + 'px')
			.html(p[p.icon])
			.select('svg')
			.attr("width", svg_width)
			.attr("height", svg_height)
			.attr(
				"transform",
				`
					translate(${transx}, ${transy})
					scale(${scalx}, ${scaly})
					
					`)
			.attr('fill', p.fill)
			.attr('stroke', p.stroke)
			.attr('stroke-width', p.stroke_width);
	};
	return {
		par,
		render
	};
};


// const ic1 = mz_svg_icon();
//   ic1
//   .par('div_id', 'nav1')
//   .par('svg_id', 'nav1_svg')
//   .par('chart_id', 'nav1_ip')
// 	.par('icon', 'cart')
//   .par('scale', 0.33)
//   .par('translate_x', 0.25)
//   .par('fill', 'red')
//   .render();