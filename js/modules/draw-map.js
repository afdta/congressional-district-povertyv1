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
		
		var pov_extent = d3.extent(geoj.features, function(d,i){return d.properties.pov1014});
		var chgpoor_extent = d3.extent(geoj.features, function(d,i){return d.properties.chgpoor});

		var int = d3.interpolateLab("steelblue", "brown");
		var pov_scale = d3.scaleSequential(int).domain(pov_extent);
		var chgpoor_scale = d3.scaleSequential(int).domain(chgpoor_extent);

		//console.log(pov_scale(0.15));

		//map groups
		var map_groups_u = wrap.selectAll("div.map-groups").data([
			{
				title:"Poverty rates during 2010–14",
				parties:[
					{party:"D", features:geoj.features, indicator:"pov1014", scale:pov_scale},
					{party:"R", features:geoj.features, indicator:"pov1014", scale:pov_scale}
				]				
			},
			{
				title:"Percent change in the poor population, 2000 to 2010–14",
				parties:[
					{party:"D", features:geoj.features, indicator:"chgpoor", scale:chgpoor_scale},
					{party:"R", features:geoj.features, indicator:"chgpoor", scale:chgpoor_scale}
				]
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
		var maps_u = map_groups.selectAll("div.metro-interactive-map")
							   .data(function(d,i){return d.parties});
		maps_u.exit().remove();
		var maps_e = maps_u.enter().append("div").classed("metro-interactive-map",true);
			maps_e.append("p").append("span");
			maps_e.append("svg");
		var maps = maps_e.merge(maps_u);

		maps.select("p")
			.style("margin","3px 10px 15px 0px")
			.style("text-align","center")
			.style("line-height","16px")
			.select("span")
			.text(function(d,i){return d.party == "D" ? "Democratic incumbents" : "Republican incumbents"})
			.classed("r-district", function(d,i){return d.party=="R"})
			.classed("d-district", function(d,i){return d.party=="D"})
			;

		var svg = maps.select("svg");
		
		svg.each(function(D,I){
			var thiz = d3.select(this);
			var gu = thiz.selectAll("g").data([D,D]);
			var g = gu.enter().append("g").merge(gu);

			g.each(function(d,i){
				var thiz = d3.select(this);
				var districts_u = thiz.selectAll("path").data(d.features);
				districts_u.exit().remove();
				var districts = districts_u.enter().append("path").merge(districts_u);
				districts.attr("d", path)
						 .attr("stroke","#e0e0e0")
						 .attr("fill",function(dd, ii){
						 	if(i==0 && dd.properties.party == d.party){
						 		return d.scale(dd.properties[d.indicator]);
						 	}
						 	else{
						 		return "none";
						 	}
						 })
						 .attr("stroke-width", function(dd, ii){
						 	return i===0 ? "0" : "1";
						 });				
			});

			try{
				var box = g.node().getBoundingClientRect();
				var boxw = Math.ceil(box.right - box.left);
				var boxh = Math.ceil(box.bottom - box.top);
			}
			catch(e){
				var boxw = 320;
				var boxh = 320;
			}

			thiz.style("height",boxh+"px").style("width",boxw+"px");

		});
	}

	return fn;
}