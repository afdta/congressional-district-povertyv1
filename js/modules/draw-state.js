//draw congressional district maps
//the exported function is a decorator that gives the returned function access to the lookup table 
import dimensions from './dimensions.js';
import table from './table.js';
import format from './formats.js';

export default function draw_state(lookup_data){

	var lookup_filtered = lookup_data.filter(function(d,i){
		return (d.state !== "US" && d.state !== "US_R" && d.state !== "US_D");
	});

	var lookup = lookup_filtered.map(function(d,i){
		var s = d.cdid+"";
   		var len = s.length;
   		var district = s.substring(len-2);

   		d.cdshort = d.state + "-" + district;

   		d.repdr = d.rep + " (" + d.party + ")";
   		return d;
	});

	var state_cuts = d3.nest().key(function(d,i){return d.state}).object(lookup);
	var cols = {D:"#5555ff", R:"#ff5555", I:"#dddddd"}

	var extents = {};
	extents.pov1014 = d3.extent(lookup, function(d,i){return d.pov1014});
	extents.chgpoor = d3.extent(lookup, function(d,i){return d.chgpoor});
	extents.chgpov = d3.extent(lookup, function(d,i){return d.chgpov});

	var scales = {};
	scales.pov1014 = d3.scaleLinear().domain(extents.pov1014).range([10,290]);
	scales.chgpoor = d3.scaleLinear().domain(extents.chgpoor).range([10,290]);
	scales.chgpov = d3.scaleLinear().domain(extents.chgpov).range([10,290]);

	var medians = {};
	medians.pov1014 = d3.median(lookup, function(d,i){return d.pov1014});
	medians.chgpoor = d3.median(lookup, function(d,i){return d.chgpoor});
	medians.chgpov = d3.median(lookup, function(d,i){return d.chgpov});

	var apply_med = function(line, indicator){
		var x = scales[indicator](medians[indicator]);
		line.attr("x1", x).attr("x2", x).attr("y1","7").attr("y2","33").attr("stroke","#333333").attr("stroke-width","2").style("shape-rendering","crispEdges");
	}

	var colfn = function(d, state, altcolor){
			if(state.abbr == d.state){
				var c = d.party == "R" ? cols.R : (d.party == "D" ? cols.D : cols.I);
			}
			else{
				var c = altcolor;
			}
			return c;			
		}

	var apply_attr = function(circles, state, indicator){
		circles.attr("cx",function(d,i){
				return scales[indicator](d[indicator])
			})
			.attr("cy", function(d,i){
				if(state.abbr == d.state){
					return d.party == "R" ? "19" : "21";
				}
				else{
					return "20";
				}
				
			})
			.attr("r", function(d,i){
				return state.abbr == d.state ? 4 : 2.5;
			})
			.attr("stroke", function(d,i){
				return colfn(d, state, "#ffffff")
			})
			.attr("stroke-width", function(d,i){
				return state.abbr == d.state ? "1" : "1";
			})
			.attr("fill", function(d,i){
				return colfn(d, state, "#999999")
			})
			.attr("fill-opacity","0.6");

		circles.sort(function(a,b){
			if(a.state == b.state){
				return a[indicator] - b[indicator];
			}
			else if(a.state == state.abbr){
				return 1;
			}
			else if(b.state == state.abbr){
				return -1;
			}
			else{
				return 0;
			}
		});
	}

	//the this-object is called as a method of a card object and will have access to
  	//container: the dom object containing the map
  	var initialized = false;
  	var metro_title, right_rail, left_rail, table_wrap, state_table, print_link;
  	var path = d3.geoPath();
	var fn = function(default_data){
		var wrap = d3.select(this.container).style("margin","0px auto").classed("c-fix",true);
		var json = this.get_data();
		var state = this.get_data("state");
		var stdat = state_cuts[state.abbr];

		//one time code
		if(!initialized){
			var title_box = wrap.append("div")
								.style("padding","7px 0px")
								.style("border-bottom","1px solid #aaaaaa")
								.style("margin-bottom","2em")
								.style("position","relative")
								.classed("c-fix", true);
			
			print_link = title_box.append("div").style("float","right")
												.attr("id","print-to-pdf")
												.style("margin","2em 0em 0em 0em")
												.append("p")
												.style("margin","0.5em 0em 0em 0em")
												.style("display","inline-block")
												.style("vertical-align","bottom")
												.style("line-height","normal")									   		
										   		.append("a").text("Printable PDF »").attr("target","_blank");

			
			var title_text = title_box.append("div")
									    .style("float","left")
										.style("margin","2em 0em 0em 0em")
										.append("p")
										.style("margin","0em")
										.style("display","inline-block")
										.style("vertical-align","bottom")
										.style("line-height","normal")
									    .style("font-size","1.5em");


			title_text.append("span").text("Poverty in ");
			metro_title = title_text.append("strong");
			title_text.append("span").text(" by Congressional district");

			left_rail = wrap.append("div").classed("metro-interactive-left-rail add-divider", true);
			right_rail = wrap.append("div").classed("metro-interactive-right-rail",true);
			table_wrap = right_rail.append("div").style("padding","0px").style("width","100%").style("min-height","700px");
			table_wrap.append("p").text("Poverty rates during 2010–14 and change in the number of poor from 2000 to 2010–14")
								  .style("text-align","left")
								  .style("margin","0em 1em 1.5em 0em")
								  .style("font-style","italic")
								  .style("font-size","1.25em");

			//build table structure once
			state_table = table(table_wrap.node());

			var chgpoor_formatter = function(d){
				var fmt = format.fn(d, "pct1");
				return this.sigpoor == "*" ? fmt : '<em style="color:#666666">'+fmt + "*</em>";
			}

			//add columns: function(key, alias, ascending, formatter, default_sort)
			state_table.column("cdshort", "District", true)
					.column("party", "Party", true)
				   .column("rep", "Representative", true)
				   .column("pov1014","Poverty rate,<br/> 2010–14", false, format.fn0("sh1"), true)
				   .column("chgpoor","Change in the poor pop., 2000 to 2010–14",false, chgpoor_formatter);

			state_table.set_ta([-1, -1, -1, 1, 1])
			state_table.widths([14, 14, 30, 20, 22])
			state_table.notes("Source: Brookings Institution analysis of decennial census and American Community Survery 5-year estimates data");
			state_table.notes("*Not statistically significant at the 90% confidence level")
		} //end one time use code
		
		state_table.truncate(15);
		metro_title.text(state.name);

		print_link.attr("href",this.get_data("repo")+"docs/"+state.abbr+".pdf");

		var num_d = d3.sum(stdat, function(d,i){return d.party=="D" ? 1 : 0});
		var num_r = d3.sum(stdat, function(d,i){return d.party=="R" ? 1 : 0});

		var geoj = topojson.feature(json, json.objects.districts);

		//RIGHT RAIL - TABLE
		var cell_style = function(cells){
			cells.style("color", function(d,i){
				if(d.key == "party"){
					return d.val == "R" ? cols.R : (d.val == "D" ? cols.D : "#111111");
				}
				else{
					return "#111111";
				}
			}).style("font-weight", function(d,i){
				if(d.key == "party"){
					return "bold";
				}
				else{
					return "normal";
				}				
			});
		}

		//refresh data and rebuild
		state_table.data(stdat).build(cell_style).cells(cell_style);

		//LEFT RAIL
		left_rail.selectAll(".left-rail-content").remove(); //start from scratch on each redraw
		var left_rail_content = left_rail.append("div").classed("left-rail-content",true);

	
		var map_legend = left_rail_content.append("div").style("margin-left","10px");
		var map_wrap = left_rail_content.append("div").style("padding","15px")
											  .style("width","310px")
											  .style("height","310px")
											  .style("background-color","#e0e0e0")
											  .style("border","1px solid #dddddd")
											  .style("border-radius","1em");
		
		var map_svg = map_wrap.append("svg");
		
			map_legend.append("p").text("Congressional district landscape").style("margin","0em").style("font-style","italic").style("font-size","1.25em");
			map_legend.append("p").style("margin","0.5em 0em 0em 1.75em").classed("r-district",true).text(num_r + " Republican incumbent" + (num_r==1 ? "" : "s"));
			map_legend.append("p").style("margin","0.5em 0em 1em 1.75em").classed("d-district",true).text(num_d + " Democratic incumbent" + (num_d==1 ? "" : "s"));

		var map_group = map_svg.append("g");
			map_group.datum(geoj);

		var chart_height = 250;
		var chart_shift = 20;
		var chart_wrap = left_rail_content.append("div").style("margin","2em 0em");
		var chart_svg = chart_wrap.append("svg").style("height",chart_height+"px");

		//map
		var shapes_u = map_group.selectAll("path").data(function(d,i){return d.features});
		shapes_u.exit().remove();
		var shapes = shapes_u.enter().append("path").merge(shapes_u);

		shapes.attr("d", path)
		 .attr("stroke","#ffffff")
		 .attr("fill",function(d, i){
		 	return d.properties.party === "D" ? cols.D : (d.properties.party === "R" ? cols.R : cols.I);
		 })
		 .attr("stroke-width", 1);

		//charts
		var rate_group = chart_svg.append("g").attr("transform","translate(10,"+chart_shift+")");
		var chg_group = chart_svg.append("g").attr("transform","translate(10,"+((chart_height/3)+chart_shift)+")");
		var chg_rate_group = chart_svg.append("g").attr("transform","translate(10,"+(((chart_height*2)/3)+chart_shift)+")");

		var rate_median = rate_group.append("line");
		var chg_median = chg_group.append("line");
		var chg_rate_median = chg_rate_group.append("line");		

		var rate_circles = rate_group.selectAll("circle").data(lookup.slice(0)).enter().append("circle");
		var chg_circles = chg_group.selectAll("circle").data(lookup.slice(0)).enter().append("circle");
		var chg_rate_circles = chg_rate_group.selectAll("circle").data(lookup.slice(0)).enter().append("circle");
		
		apply_med(rate_median, "pov1014");
		apply_med(chg_median, "chgpoor");
		apply_med(chg_rate_median, "chgpov");

		apply_attr(rate_circles, state, "pov1014");
		apply_attr(chg_circles, state, "chgpoor");
		apply_attr(chg_rate_circles, state, "chgpov");

		//id is the numeric congressional district ID (no leading zeros)
		function linkem(id, reset){
			var reset = !!reset;
			shapes.filter(function(d,i){
				return id == +d.id;
			}).attr("stroke-width", !reset ? 5 : 1)
			  .attr("fill-opacity", !reset ? 0.75 : 1)
			  .raise();

			state_table.rows().classed("row-highlighted", function(d,i){
				return id==d.full_data.cdid && !reset;
			});

			chart_svg.selectAll("circle").filter(function(d,i){
				return id==d.cdid;
			})
			.attr("r", reset ? 4 : 9)
			.attr("fill-opacity", reset ? "0.6" : "1")
			.raise();
		}

		state_table.rows(function(r){
			r.on("mouseenter", function(d,i){
				linkem(d.full_data.cdid);
			});
			r.on("mouseleave", function(d,i){
				linkem(d.full_data.cdid, true);
			})
		});
		
		//chart titles
		rate_group.append("text").style("font-style","italic").text("Poverty rate, 2010–14");
		
		chg_group.append("text").style("font-style","italic").text("Change in poor pop., 2000 to 2010–14").attr("fill","#ffffff").attr("stroke-width","3").attr("stroke","#ffffff");
		chg_group.append("text").style("font-style","italic").text("Change in poor pop., 2000 to 2010–14");

		chg_rate_group.append("text").style("font-style","italic").text("Change in poverty rate, 2000 to 2010–14").attr("fill","#ffffff").attr("stroke-width","3").attr("stroke","#ffffff");
		chg_rate_group.append("text").style("font-style","italic").text("Change in poverty rate, 2000 to 2010–14");


		
		initialized = true;

	};

	return fn;
}