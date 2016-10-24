function Card(container, drawing_fn){
	this.container = container;
	this.draw = drawing_fn;
	this.store = {};
	this.default_data = null;
	this.dom = {};
	
	this.data_cache = [];
	this.data_cache_on = true;
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

Card.prototype.update = function(data, prop, suppress_redraw){
	if(arguments.length==1){
		this.default_data = data;
	}
	else if(arguments.length > 1){
		this.store[prop] = data;
	}

	if(!!this.draw && !suppress_redraw){
		//draw is called as a method of the card (the this-object will ref the container)
		this.draw();
	}
}

Card.prototype.json = function(uri, prop){
	var self = this;
	var arglen = arguments.length;
	
	//check if data has been cached -- if so, use it
	var cached_data = this.check_cache(uri);
	if(cached_data !== null){
		if(arglen==1){
			this.update(cached_data);
		}
		else if(arglen > 1){
			this.update(cached_data, prop);
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
				self.update(data);
			}
			else if(arglen > 1){
				self.update(data, prop);
			}
		});
	}
}

Card.prototype.cache = function(){
	this.data_cache_on = !this.data_cache_on;
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

export default Card;