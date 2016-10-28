//gig economy interactive - oct 2016
import card from './card-api.js';
import draw_state from './draw-state.js';
import state_select from './state-select.js';
import history from './history.js';

function mainfn(){
	var datarepo = "./assets/";

	//enable browser history
	var h = history();
	var initial_hash = h.get_hash();

	//layout
	var wrap = document.getElementById("congressional-district-poverty");
	var d3wrap = d3.select(wrap).style("position","relative");

	var select_wrap = d3wrap.append("div").classed("c-fix",true).attr("id","state-select-wrap").append("div").style("float","right");
	var all_states = state_select.setup(select_wrap.node());
	
	//determine default state
	var selected_state = all_states[0];	
	for(var st=0; st<all_states.length; st++){
		if(all_states[st].abbr === initial_hash){
			selected_state = all_states[st];
			break;
		}
	}

	var graphics_wrap = d3wrap.append("div");
	var main_card = card(graphics_wrap.node()); 
	main_card.set_data(datarepo, "repo");

	function update_card(state){
		//validate and reassign state, otherwise redraw current state
		var valid_parameter = false;
		if(!!state && !!state.abbr){
			for(var st=0; st<all_states.length; st++){
				if(all_states[st].abbr === state.abbr){
					selected_state = all_states[st];
					valid_parameter = true;
					break;
				}
			}
		}
		
		main_card.json(datarepo + "st" + selected_state.fips + ".json", function(){
			this.set_data(selected_state, "state");
			this.build();

			//keep select menu in sync
			state_select.update(selected_state.fips);

			//push the state when the update is complete
			h.push(selected_state, "#"+selected_state.abbr);

			phantomPrep();

			if(valid_parameter){console.log(selected_state.abbr);}
		});
	}

	//get primary data
	d3.json(datarepo + "poverty_trends.json", function(e, d){
		if(e){
			//error condition
			//console.log(e);
		}
		else{
			//chart drawing function
			var df = draw_state(d);

			//register the build function
			main_card.build(df);

			//register the callback on the state select
			state_select.onchange(update_card);		
			
			update_card(selected_state);

			h.pop(update_card);
			//update_card_recurse(selected_state);
		}
	});

	//remove for production, in addition to function referance above
	var phantomPrepped = false;
	function phantomPrep(){
		if(!phantomPrepped){
			try{
				var ua = window.navigator.userAgent;
				if(ua=="PhantomJS.Render.PDF"){
					select_wrap.style("visibility","hidden").style("margin-bottom","20px");
					d3.select("#print-to-pdf").style("visibility","hidden");
					d3wrap.append("div").style("position","absolute")
										 .style("top","20px")
										 .style("right","10px")
										 .style("height","50px")
										 .style("width","320px")
										 .append("img")
										 .attr("src","./logo.png")
										 .style("width","100%");
				}
			}
			catch(e){
				//no-op
			}
			finally{
				phantomPrepped = true;
			}
		}
	}

}

document.addEventListener("DOMContentLoaded", function(){
	mainfn();
});

/*
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
*/