//viewport dimensions
export default function dimensions(el, maxwidth, maxheight){
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
