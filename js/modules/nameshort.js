export default function nameshort(longname, appendStateNames){
	try{
		//pull off state names
		var statesplit = longname.split(/,/);
		var states = statesplit[statesplit.length-1];

		var split0 = statesplit[0].split(/--/);
		if(split0.length > 1){
			var shortname = split0[0];
		}
		else{
			var split1 = statesplit[0].split(/-/);
			var shortname = split1[0];
		}
	}
	catch(e){
		var shortname = longname;
	}
	finally{
		var us_exceptions = {"United States":1, "U.S.":1, "US":1, "USA":1, "U.S.A":1};

		if(!!appendStateNames && !(shortname in us_exceptions) ){
			return shortname + ", " + states;
		}
		else{
			return shortname;
		}
		
	}

}