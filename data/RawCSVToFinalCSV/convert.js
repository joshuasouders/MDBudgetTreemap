$.getJSON( "approp_data_unformatted.json", function( data ) {
	$("#placeholder").append('{');
	$("#placeholder").append('"name": "Maryland Appropriations Budget FY14","children": [');

	var currAgency = "";
	var currDept = "";

	for(var i = 0; i < data.length; i++){
		if(data[i].agency != currAgency){
			if(currAgency != ""){
				$("#placeholder").append(']}]},');
			}
			$("#placeholder").append('{"name": "' + data[i].agency + '", "children": [');
			currAgency = data[i].agency;

			$("#placeholder").append('{"name": "' + data[i].dept + '", "children": [');
			currDept = data[i].dept;

			$("#placeholder").append('{"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
		}
		else{
			if(data[i].dept != currDept){
				$("#placeholder").append(']}, {"name": "' + data[i].dept + '", "children": [');
				currDept = data[i].dept;

				$("#placeholder").append('{"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
			}
			else{
				$("#placeholder").append(', {"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
			}
		}
	}

	$("#placeholder").append(']}]}]}');
});