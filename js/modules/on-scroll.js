//on-scroll: register arbitrary scroll events

//scroll collection constructor
export default function ScrollCollection(){
	this.count = 0;
	this.listeners = {};
	this.trip_marker = 0.5; //activate when middle is in viewport
}

//register event(s) when the element comes into view (onview) or is scrolled (onscroll)
ScrollCollection.prototype.register = function(element, onview, onscroll){
	if(!!element){
		++this.count;

		var id = "e" + this.count;

		var event = {};
			event.viewed = false;
			event.viewing = false;
			event.get_box = function(){
				try{
					var box = element.getBoundingClientRect();
				}
				catch(e){
					var box = null;
				}
				return box;
			};
			event.on_view = onview;
			event.on_scroll = onscroll;
		
		this.listeners[id] = event;

		var self = this;

		setTimeout(function(){self.activate(id)},0); //attempt to activate after any rendering of view

		//on first registration, add scroll event
		if(this.count===1){
			window.addEventListener("scroll", function(){
				self.activate_all();
			});
		}

		return event; //allows for tracking of viewed/viewing state by app code
	}
}

/*ScrollCollection.prototype.trip = function(share_of_element_height_in_view){
	try{
		var tm = share_of_element_height_in_view*1;
		
		if(isNaN(tm) || tm < 0 || tm > 1 || tm == null){
			throw "badNum";
		}
	}
	catch(e){
		var tm = 0.5;
	}
	finally{
		this.trip_marker = share_of_element_height_in_view;
	}

	return this;
}*/

//run activation methods if in view
ScrollCollection.prototype.activate = function(id){
	if(this.listeners.hasOwnProperty(id)){
		var window_height = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));
		
		var activate_buffer = 0.3;
		var activate_zone = [window_height*activate_buffer, window_height*(1-activate_buffer)];

		var listener = this.listeners[id];

		var box = listener.get_box();

		if(box==null || window_height==0){
			if(!listener.viewed){listener.on_view();}
			listener.viewed = true;
			listener.viewing = false;
		}
		else{
			
			var top = box.top;
			var bottom = box.bottom;
			var middle = top + ((bottom-top)/2);

			listener.viewing = !(bottom < 0 || top > window_height);
			var in_activate_zone = !(bottom < activate_zone[0] || top > activate_zone[1]);			

			//if the graphic hasn't already been activated/viewed and is in the "activate_zone", activate it
			if(!listener.viewed && in_activate_zone){
	
				listener.on_view();
				listener.viewed = true;

				//if there isn't a scroll event registered delete after activation
				if(listener.on_scroll==null){delete this.listeners[id];}
			}

			if(listener.viewing && listener.on_scroll){
				listener.on_scroll({top:top, middle:middle, bottom:bottom});
			}

		}
	}
}

//run activation methods for all if in view
ScrollCollection.prototype.activate_all = function(){
	for(var id in this.listeners){
		if(this.listeners.hasOwnProperty(id)){ this.activate(id); }
	}	
}	
