var format = {};
export default format;


format.rank = function(r){
	try{
	    if(r == null){
	        throw "badInput";
	    }
	    else{
	        
	        var c = r + "";
	        var f = +(c.substring(c.length-1)); //take last letter and coerce to an integer
	         
	        var e = ["th","st","nd","rd","th","th","th","th","th","th"];
	 
	        var m = (+r)%100; 
	        var r_ = (m>10 && m<20) ? c + "th" : (c + e[f]); //exceptions: X11th, X12th, X13th, X14th
	    }
	}
	catch(e){
	    var r_ = r+"";
	}

	return r_; 
}

//percent change
format.pct0 = d3.format("+,.0%");
format.pct1 = d3.format("+,.1%");

//percent change
format.ch0 = d3.format("+,.0f");
format.ch1 = d3.format("+,.1f");

//shares
format.sh0 = d3.format(",.0%");
format.sh1 = d3.format(",.1%");

//numeric
format.num0 = d3.format(",.0f");
format.num1 = d3.format(",.1f");
format.num2 = d3.format(",.2f");
format.num3 = d3.format(",.3f");

//USD
format.doll0 = function(v){return "$" + format.num0(v)};
format.doll1 = function(v){return "$" + format.num1(v)};
format.doll2 = function(v){return "$" + format.num2(v)};

format.dolle30 = function(v){return "$" + format.num0(v*1000)};

//id
format.id = function(v){return v};

format.fn = function(v, fmt){
	if(format.hasOwnProperty(fmt)){
		var fn = format[fmt];
	}
	else{
		var fn = format.id;
	}
	return v==null ? "N/A" : fn(v);
}