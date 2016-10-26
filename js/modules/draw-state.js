//draw congressional district maps
//the exported function is a decorator that gives the returned function access to the lookup table 
import dimensions from './dimensions.js';

export default function draw_state(lookup){

	var state_cuts = d3.nest().key(function(d,i){return d.state}).object(lookup);

	//the this-object is called as a method of a card object and will have access to
  	//container: the dom object containing the map
	var fn = function(default_data){

		var wrap = d3.select(this.container).style("margin","0px auto");
		var json = this.get_data();

		var path = d3.geoPath();
		var geoj = topojson.feature(json, json.objects.districts);

		wrap.selectAll("*").remove();

		var legend = wrap.append("div");
		var republicans = legend.append("div");
			republicans.append

		var svg = wrap.append("div").classed("mi-interactive-container c-fix", true).append("svg");

		var map_group = svg.append("g");
			map_group.datum(geoj);

		var chart_group = svg.append("g");
			chart_group.datum(lookup);
		
		//get viewport dimensions
		var dims = dimensions();
		console.log(dims);

		//map
		var shapes_u = map_group.selectAll("path").data(function(d,i){return d.features});
		shapes_u.exit().remove();
		var shapes = shapes_u.enter().append("path").merge(shapes_u);

		shapes.attr("d", path)
		 .attr("stroke","#eeeeee")
		 .attr("fill",function(d, i){
		 	return d.properties.party === "D" ? "#5555ff" : (d.properties.party === "R" ? "#ff5555" : "#dddddd");
		 })
		 .attr("stroke-width", 1);

		try{
			var gbox = map_group.node().getBoundingClientRect();
			var sbox = svg.node().getBoundingClientRect();
			var offset = gbox.top - sbox.top;
			var gheight = gbox.bottom - gbox.top;
			svg.style("min-height", gheight+"px");
		} 
		catch(e){
			svg.style("min-height","450px");
		}

	};

	return fn;
}