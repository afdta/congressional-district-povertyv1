//All data for each build/view must be tightly coupled.
//E.g. if data is fetched asynchronously, you must take measures to ensure that any additional data used at the time of
//callback execution is tightly coupled -- e.g. if you set some data, A, with set_data (synchronously), then you execute
//card.json(B) and the card build function relies on both A and B, there's no guarantee that data A will be relevant to 
//data B if the UI is such that the user is able to execute set_data() again or execute card.json() again while they
//are waiting for the first card.json result to return. 

//the appropriate data can be bound together in a callback passed to card.json(). until a build queuing/data coupling 
//scheme is implemented, this is the safest way to use the Card class

//responsiveness at the card level is currently disabled until further edits to the API are made. specifically, the above
//issues need to be taken into consideration and safeguards need to be implemented to prevent browser resize events calling
//build when no data exists yet (or the wrong data exists, per above).  

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

	//awaiting data?
	this.fetching_data = false;
}

//register card building functions
Card.prototype.build = function(fn, view_name){
	if(arguments.length > 0 && typeof fn === "function"){
		var fn_name = !!view_name ? view_name : "View " + (++this.build_count);
		this.build_fns.push({fn:fn, name: fn_name});
	}
	else if(arguments.length == 0 && this.build_index < this.build_fns.length ){
		try{
			this.build_fns[this.build_index].fn.call(this, this.default_data);
		}
		catch(e){
			this.error();
		}
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
Card.prototype.set_data = function(data, prop){
	if(arguments.length==1){
		this.default_data = data;
	}
	else if(arguments.length > 1){
		this.store[prop] = data;
	}

	return this;
}

//to do: create a build queue that associates each call to build with data availability
Card.prototype.json = function(uri, callback, prop){
	var self = this;
	var default_data = !prop;
	
	//check if data has been cached -- if so, use it
	var cached_data = this.check_cache(uri);
	if(cached_data !== null){
		if(default_data){
			this.set_data(cached_data);
		}
		else{
			this.set_data(cached_data, prop);
		}

		if(!callback){this.build();}
		else{callback.call(this, cached_data);}
	}
	else{
		self.fetching_data = true;
		d3.json(uri, function(error, data){
			if(error){
				data = null;
			}
			else if(self.data_cache_on){
				self.data_cache.push({uri:uri, data:data});
			}
			
			if(default_data){
				self.set_data(data);
			}
			else{
				self.set_data(data, prop);
			}

			if(!callback){self.build();}
			else{callback.call(self, data);}

			self.fetching_data = false;
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
	var wrap = d3.select(this.container);
	wrap.selectAll("*").remove();
	wrap.append("p").style("padding","20px").append("em").html("An error has occured.<br />Please reload the page.")
	return this;
}

Card.prototype.responsive = function(){
	//for now, no-op until there is greater robustness in data handling/coupling of data to build events
	return null;

	if(!this.responsive_on){
		this.responsive_on = true;
		var tiptimer;
		var self = this;
		window.addEventListener("resize", function(){
			clearTimeout(tiptimer);
			tiptimer = setTimeout(function(){
				self.build();
			}, 150);
		});
	}
	return this;
}

//wrapper for the Card class to avoid having to use the new keyword
function card(container){
	var c = new Card(container);
	return c;
}

export default card;
