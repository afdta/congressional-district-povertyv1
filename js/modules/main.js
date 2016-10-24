//gig economy interactive - oct 2016
import Card from './card-api.js';
import draw_map from './draw-map.js';
import state_select from './state-select.js';

function mainfn(){
	var datarepo = "./data/shapefiles/topojson/";
	var selected_state = "01";

	//layout
	var wrap = document.getElementById("congressional-district-poverty");

	var select_wrap = d3.select(wrap).append("div");
	state_select.setup(select_wrap.node());

	//map drawing fun 1
	var df = draw_map();
	var card = new Card(wrap, df);

	card.json(datarepo + "st" + selected_state + ".json");

	state_select.onchange(function(state){
		card.json(datarepo + "st" + state + ".json");
	});

}

document.addEventListener("DOMContentLoaded", function(){
	mainfn();
});
