//draw congressional district maps
//the exported function is a decorator that gives the returned function access to the lookup table 

export default function draw_map(lookup){

	//the this-object is called as a method of a card object and will have access to
  	//container: the dom object containing the map
	var fn = function(){
		var wrap = d3.select(this.container).style("margin","0px auto");
		var json = this.get_data();

		var path = d3.geoPath();
		var geoj = topojson.feature(json, json.objects.districts);
		console.log(geoj);

		//map groups
		var map_groups_u = wrap.selectAll("div.map-groups").data([
			{
				title:"Group 1",
				indicator:"",
				data:geoj
			},
			{
				title:"Group 2",
				indicator:"",
				data:geoj
			}
		]);
		var map_groups_e = map_groups_u.enter().append("div")
			.classed("map-groups c-fix",true)
			.style("float","left")
			.style("margin","10px 0px");
		map_groups_e.append("p");

		var map_groups = map_groups_e.merge(map_groups_u);
		map_groups.select("p").text(function(d,i){return d.title})
							  .style("padding","0px 0px 3px 0px")
							  .style("border-bottom","1px solid #aaaaaa")
							  .style("margin","3px 10px 3px 0px").style("text-align","center");

		//maps
		var maps_u = map_groups.selectAll("div.metro-interactive-map").data([{party:"D", geo:geoj}, {party:"R", geo:geoj}]);
		maps_u.exit().remove();
		var maps_e = maps_u.enter().append("div").classed("metro-interactive-map",true);
			maps_e.append("p");
		var svg_e = maps_e.append("svg");
		var g0 = svg_e.append("g");
		var g1 = svg_e.append("g");
		var maps = maps_e.merge(maps_u);

		maps.select("p")
			.style("margin","3px 10px 15px 0px")
			.style("text-align","center")
			.text(function(d,i){return d.party == "D" ? "Democratic incumbents" : "Republican incumbents"});

		var svg = maps.select("svg");
		var g = svg.select("g");

		var districts_u = g.selectAll("path").data(function(d,i){
			return d.geo.features;
		});
		districts_u.exit().remove();
		var districts = districts_u.enter().append("path").merge(districts_u);
		districts.attr("d", path).attr("stroke","#666666").attr("fill","none");


		try{
			var box = g.node().getBoundingClientRect();
			var boxw = Math.ceil(box.right - box.left);
			var boxh = Math.ceil(box.bottom - box.top);
		}
		catch(e){
			var boxw = 320;
			var boxh = 320;
		}
		svg.style("height",boxh+"px").style("width",boxw+"px");
	}

	return fn;
}