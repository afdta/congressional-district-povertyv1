//syncronous json load

export default function sync_json(path){
	var xml = new XMLHttpRequest();

	//synchronous GET request
	xml.open("GET", path, false);
	xml.send();
	if(xml.status==200){
		return JSON.parse(xml.responseText);
	}
	else{
		return null;
	}
}