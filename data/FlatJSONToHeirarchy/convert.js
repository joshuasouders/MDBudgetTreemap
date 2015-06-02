/*
PRE LEAVING WORK NOTES - all department entries for each agency need to be together. all office entries for each department need to be together. otherwise there's a bunch of different entries with different fund types for one office, at the office level instead of one entry at the office level that leads to a couple at the fund level. So that needs to be fixed, maybe in the department and then the office loops. This may only be happening because under the current iteration we're only taking into account the agency level instead of processing the whole thing. also, everything is only applied to the agency level right now (like the 15% threshhold, stuff like that). That needs to apply to ever level, minus the fund level. One issue is that we have a record of where each agency falls in approp level in relation to each other, but we don't have that for department or office so we're probably going to have to calculate that on the fly while generating the heirarchical json.*/











$.getJSON( "FY14.json", function( data ) {
	currAgency = "";
	currOffice = "";
	currDept = "";

	$("#placeholder").append('{');
	$("#placeholder").append('"name": "Maryland Appropriations Budget FY14","children": [');

	for(var i = 0; i < data.length; i++){
		if(data[i].agency_code != currAgency){
			if(currAgency != ""){
				$("#placeholder").append(']}]}]},');
			}
			$("#placeholder").append('{"name": "' + data[i].agency + '", "children": [');
			currAgency = data[i].agency_code;

			$("#placeholder").append('{"name": "' + data[i].office + '", "children": [');
			currOffice = data[i].office_code;

			$("#placeholder").append('{"name": "' + data[i].dept + '", "children": [');
			currDept = data[i].dept_code;

			$("#placeholder").append('{"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
		}
		else{
			if(data[i].office_code != currOffice){
				if(currOffice != ""){
					$("#placeholder").append(']}]},');
				}

				$("#placeholder").append('{"name": "' + data[i].office + '", "children": [');
				currOffice = data[i].office_code;

				$("#placeholder").append('{"name": "' + data[i].dept + '", "children": [');
				currDept = data[i].dept_code;

				$("#placeholder").append('{"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
			}
			else{
				if(data[i].dept_code != currDept){
					$("#placeholder").append(']}, {"name": "' + data[i].dept + '", "children": [');
					currDept = data[i].dept_code;

					$("#placeholder").append('{"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
				}
				else{
					console.log("same dept");
					$("#placeholder").append(', {"name": "' + data[i].fund + '", "value": ' + data[i].approp + '}');
				}
			}
		}
	}

	$("#placeholder").append(']}]}]}]}');
});