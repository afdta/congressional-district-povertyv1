//gig economy interactive - oct 2016
import card from './card-api.js';
import draw_state from './draw-state.js';
import state_select from './state-select.js';

function mainfn(){
	var datarepo = "./assets/";

	//layout
	var wrap = document.getElementById("congressional-district-poverty");
	var d3wrap = d3.select(wrap);

	var select_wrap = d3wrap.append("div");
	var selected_state = state_select.setup(select_wrap.node());

	var title_box = d3wrap.append("div");
	var title_text = title_box.append("p").style("font-size","1.5em").style("margin","1em 0em")
										  .append("span").text("Poverty by Congressional district: ");
	var metro_title = title_text.append("strong");

	var graphics_wrap = d3wrap.append("div");
	var main_card = card(graphics_wrap.node()); 

	//get primary data
	d3.json(datarepo + "poverty_trends.json", function(e, d){
		if(e){
			//error condition
			console.log(e);
		}
		else{
			//chart drawing function
			var df = draw_state(d);
			main_card.build(df).responsive();

			var update_card = function(state){
				selected_state = state;
				d3.json(datarepo + "st" + selected_state.fips + ".json", function(e, d){
					if(e){
						main_card.error();
					}
					else{
						metro_title.text(selected_state.name);
						main_card.set_data(d).build();
					}
				});
			}

			state_select.onchange(update_card);		
			
			update_card(selected_state);	
		}
	})



}

document.addEventListener("DOMContentLoaded", function(){
	mainfn();
});
