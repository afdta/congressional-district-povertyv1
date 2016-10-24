//get element width, height, in pixels
//in future, ensure this is run in next tick of event loop using setTimeout(0) and native promises, if supported
function getdim(el, maxwidth, maxheight){
	if(arguments.length > 0){
		var element = el;
	}
	else{
		var element = document.documentElement;
	}

	var floor = 50;
	var err = false;

	try{
		var box = element.getBoundingClientRect();
		var w = Math.floor(box.right - box.left);
		var h = Math.floor(box.bottom - box.top);
		if(w < floor || h < floor){throw "badWidth"}
	}
	catch(e){
		var box = {};
		var w = floor;
		var h = floor;
		err = true;
	}

	if(!!maxwidth && w > maxwidth){w = maxwidth}
	if(!!maxheight && h > maxheight){h = maxheight}

	var dim = {width:w, height:h, error:err, box:box};

	return dim;
}


//place tooltip relative to container; 
//xbuffer (ybuffer) is how far left or right (top or bottom) the tooltip is from the targetXY (mouse/touch position)
//fbr is the fixed banner height (or vertical distance at the top of the viewport that should be considered off limits)
export default function place_tip(tip_node, container_node, xbuffer, ybuffer, fbr){
	
	//default to showing tooltip on right, don't flip orientations unless forced
	var tipRight = true;
	var pad = !!xbuffer ? xbuffer : 35;
	fbr = !!fbr ? fbr : 85;

	try{
		if(tip_node.style.width == ""){
			tip_node.style.width = "400px";
		};
	}
	catch(e){
		//no-op
	}

	var xy = function(target_xy){
		var tipdim = getdim(tip_node);
		var contdim = getdim(container_node);

		var mouseX = target_xy[0];
		var mouseY = target_xy[1];

		var errorX = false;

		try{
			var wdiff = contdim.width - tipdim.width;
			if(wdiff > 0 && wdiff < pad){
				pad = wdiff;
			}
			else if(wdiff < 0){
				pad = 0;
			}

			if(tipRight){
				if((mouseX + tipdim.width + pad) > contdim.width){
					tipRight = false;
					var newX = mouseX - tipdim.width - pad;
				}
				else{
					var newX = mouseX + pad;
				}
			}
			else{
				if((mouseX - tipdim.width - pad) < 0){
					tipRight = true;
					var newX = mouseX + pad;
				}
				else{
					var newX = mouseX - tipdim.width - pad;
				}
			}

			if((newX + tipdim.width) >= contdim.width || newX < 0){throw "tooWide"}
		}
		catch(e){
			var newX = 0;
			errorX = true;
		}

		//y pos
		try{
			if(errorX){throw "badX"}

			var viewport = {};
			viewport.w = Math.max(document.documentElement.clientWidth, (window.innerWidth || 0));
			viewport.h = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));

			var hdiff = viewport.h - tipdim.height - fbr;
			
			var quarterh = Math.round(tipdim.height/4);
			if(hdiff > quarterh){
				var ypad = quarterh;
			}
			else if(hdiff >= 0){
				var ypad = hdiff;
			}
			else{
				var ypad = 0;
			}

			if(tipdim.height+fbr >= viewport.h || contdim.box.top + mouseY - ypad <= fbr){
				var newY = fbr-contdim.box.top;
			}
			else if((contdim.box.top + mouseY + tipdim.height - ypad) > viewport.h){
				var newY = viewport.h - contdim.box.top - tipdim.height;
			}
			else{
				var newY = mouseY - ypad;
			}
		}
		catch(e){
			var newY = mouseY + 15;
		}

		return [newX, newY];
	}

	return xy;
}