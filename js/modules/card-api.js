function Card(container){
	//hold references to the dom, specific to this card
	this.dom = {};
	this.container = this.dom.container = container;

	//generic data store for helper data
	this.store = {};

	//default card data
	this.default_data = null;
	
	//for xhr data requests (e.g. d3.json), cache data by default to avoid unnecessary network requests
	this.data_cache_on = true;
	this.data_cache = [];

	//hold functions used to build the data card contents
	this.build_fns = [];
	this.build_index = 0;
	this.build_count = 0;

	this.responsive_on = false;
}

//register card building functions
Card.prototype.build = function(fn, view_name){
	
	if(arguments.length > 0 && typeof fn === "function"){
		this.build_fns.push({fn:fn, name: !!view_name ? view_name : "View " + (++this.build_count) });
	}
	else if(arguments.length == 0 && this.build_index < this.build_fns.length ){
		this.build_fns[this.build_index].fn.call(this, this.default_data);
	}

	return this;
}

Card.prototype.set_view = function(view){
	//no-op for now

	return this;
}

//get data
Card.prototype.get_data = function(prop){
	if(arguments.length==0){
		return this.default_data;
	}
	else if(arguments.length > 0){
		return this.store.hasOwnProperty(prop) ? this.store[prop] : null;
	}
	else{
		return null;
	}
}

//set data (and optionally redraw)
Card.prototype.set_data = function(data, prop, redraw){
	if(arguments.length==1){
		this.default_data = data;
	}
	else if(arguments.length > 1){
		this.store[prop] = data;
	}

	//redraw with current granularity
	if(!!redraw){
		//draw is called as a method of the card (the this-object will ref the container)
		this.build();
	}

	return this;
}

Card.prototype.json = function(uri, prop){
	var self = this;
	var arglen = arguments.length;
	
	//check if data has been cached -- if so, use it
	var cached_data = this.check_cache(uri);
	if(cached_data !== null){
		if(arglen==1){
			this.set_data(cached_data);
		}
		else if(arglen > 1){
			this.set_data(cached_data, prop);
		}
	}
	else{
		d3.json(uri, function(error, data){
			if(error){
				data = null;
			}
			else if(self.data_cache_on){
				self.data_cache.push({uri:uri, data:data});
			}
			
			if(arglen==1){
				self.set_data(data);
			}
			else if(arglen > 1){
				self.set_data(data, prop);
			}
		});
	}

	return this;
}

Card.prototype.cache = function(){
	this.data_cache_on = !this.data_cache_on;

	return this;
}

Card.prototype.check_cache = function(uri){
	
	if(this.data_cache_on && this.data_cache.length > 0){
		var datindex = 0;
		for(var i=0; i<this.data_cache.length; i++){
			if(this.data_cache[i].uri === uri){
				datindex = i;
				break;
			}
		}
		return this.data_cache[datindex].uri === uri ? this.data_cache[datindex].data : null;
	}
	else{
		return null;
	}

}

Card.prototype.error = function(){
	console.log("Error building visual")
	var wrap = d3.select(this.container);
	wrap.selectAll("*").remove();
	wrap.append("p").style("padding","20px").append("em").html("An error has occured.<br />Please reload the page.")
	return this;
}

Card.prototype.responsive = function(){
	if(!this.responsive_on){
		this.responsive_on = true;
		var tiptimer;
		var self = this;
		window.addEventListener("resize", function(){
			clearTimeout(tiptimer);
			self.build();
		}, 150);
	}
	return this;
}

//wrapper for the Card class to avoid having to use the new keyword
function card(container){
	var c = new Card(container);
	return c;
}

export default card;
