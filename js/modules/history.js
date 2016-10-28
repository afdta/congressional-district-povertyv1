//enable browser history

export default function history(){
	var H = {};
	if(window.history && window.history.pushState){
		H.push = function(d, u){
			var url = !!u ? u : null; 
			window.history.pushState(d, null, url);
		}

		H.pop = function(callback){
			var fn = function(event){
				callback.call(event, event.state);
			}
			window.addEventListener("popstate", fn);
		}
	}
	else{
		H.push = function(){};
		H.pop = function(){};
	}

	H.get_hash = function(){
		return window.location.hash.slice(1);
	}

	return H;
}
