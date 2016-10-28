//gig economy interactive - oct 2016
import card from './card-api.js';
import draw_state from './draw-state.js';
import state_select from './state-select.js';
import sync_json from './sync-json.js';

function mainfn(){
	var datarepo = "./assets/";

	//layout
	var wrap = document.getElementById("congressional-district-poverty");
	var d3wrap = d3.select(wrap);

	var select_wrap = d3wrap.append("div").classed("c-fix",true).append("div").style("float","right");
	var all_states = state_select.setup(select_wrap.node());
	var selected_state = all_states[0];	

	var graphics_wrap = d3wrap.append("div");
	var main_card = card(graphics_wrap.node()); 

	function update_card(state){
		selected_state = state;
		main_card.json(datarepo + "st" + selected_state.fips + ".json", function(){
			this.set_data(state, "state");
			this.build();

			//keep select menu in sync
			state_select.update(state.fips);
		});
	}

	var state_index = 0;
	function update_card_recurse(state){
		selected_state = state;
		select_wrap.style("visibility","hidden");
		d3.select("body").style("background-color","#ffffff");
		main_card.json(datarepo + "st" + selected_state.fips + ".json", function(){
			this.set_data(state, "state");
			this.build();

			//keep select menu in sync
			state_select.update(state.fips);

			console.log(state.abbr);


 
			setTimeout(function(){
				if(++state_index < all_states.length){
					update_card_recurse(all_states[state_index]);
				}
			}, 500);
		});
	}


	//get primary data
	d3.json(datarepo + "poverty_trends.json", function(e, d){
		if(e){
			//error condition
			console.log(e);
		}
		else{
			//chart drawing function
			var df = draw_state(d);
			main_card.build(df);

			state_select.onchange(update_card);		
			
			update_card(selected_state);
			//update_card_recurse(selected_state);
		}
	});
}

document.addEventListener("DOMContentLoaded", function(){
	mainfn();
});
