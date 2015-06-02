*********************************************************
README - Data creation for the appropriation budget
visualizer
*********************************************************

First, I'd like to apologize that you're trying to add another year of data to this visualization. It was hard enough for me to come up with the process for how to do it and it's probably even harder to follow that process. The hardest part of this application is getting the data into it. All of the data is stored relationally in RSTARS tables, so when it's exported you basically just get straight relational CSV files that you need to turn into a special heirarchical JSON file that the zoomable treemap can read.

Before you begin, if the data came in a .txt file just rename the format to .csv and open it. First step is to get all of the relational CSV tables into a single CSV file. Go to data/RawCSVToFinalCSV/FY14_RawCSV.csv. That's the straight RSTARS output. You can immediately delete columns B, D, F, G, H, I, J, M, N, O, P, Q, R, S, and then U through the rest of the columns to the right. If you've done it right you should have 6 rows. Now we need to filter out our real data (in Excel, go to Data->Filter). Row C is the fund type, and it should only include 1, 3, 5, and maybe 9 depending on if you want to display reimbursable data (federal fund, general fund, special fund, and reimbursable fund, respectively). Column D should be filtered out to only include value 1 (which is APPN ORIG AMT). If you have a column with multiple years in it (see column E in our example), filter it out so it only includes your target year. So if I want to display FY14 data, that column would just include "14". Copy/paste the remaining rows into a new document and save it so that you can have a complete and accurate document without filtering. Now you can delete the row with all 1's as well as the row with the year.

Now for the hard part. You need access to some sort of a database. I did this using PHPMyAdmin via a webserver. You need to create the following tables - AGENCY, DEPT, EXPORTED, and OFFICE. I've exported my tables in data/DatabaseExport. They should remain fairly consistent from year to year, you shouldn't need to make any changes. Create one more table called FY*YOUR YEAR HERE*. Now replace "FY14" with that table name and then run this monstrosity of a SQL command.

SELECT DISTINCT EXPORTED.agency_code, EXPORTED.agency_name, CONCAT(EXPORTED.agency_code, SUBSTRING(EXPORTED.dept_code, 1, 3)) as 'office_code', OFFICE.office, EXPORTED.dept_code, EXPORTED.dept_name, REPLACE( REPLACE( REPLACE( REPLACE( FY14.fund, '1', 'General Fund' ) , '3', 'Special Fund' ) , '5', 'Federal Fund' ) , '9', 'Reimbursable Fund' ) AS 'fund', FY14.approp from FY14 LEFT JOIN EXPORTED ON FY14.agency = EXPORTED.agency_code AND FY14.dept = EXPORTED.dept_code LEFT JOIN OFFICE on CONCAT( EXPORTED.agency_code, SUBSTRING( EXPORTED.dept_code, 1, 3 ) ) = OFFICE.office_code

Export the results and congratulations, you have a flat CSV file containing all of our data. There's going to be null values in there. You're going to have to go through the data and manually fix those nulls (places where the left joins failed). Two resources to figure out what to replace those nulls with are the data from previous years (example - data/RawCSVToFinalCSV/FY14_FinalCSV.csv) and the yearly "Fiscal Digest of the State of Maryland" (Google it).

Once your flat CSV file is done, you then need to turn it into a JSON file. Here's a good site to do just that.

http://www.convertcsv.com/csv-to-json.htm

Leave all the settings to default, just copy/paste your data into the box and click "Convert CSV to JSON" and then save it in data/FlatJSONToHeirarchy. Now, in data/FlatJSONToHeirarchy/convert.js, find the line of code that goes "$.getJSON( "FY15.json", function( data ) {" and replace "FY15.json" with whatever your json's filename is. Save convert.js and open budget/data/FlatJSONToHeirarchy/index.html with a webserver. If all goes well it'll spit out a heirarchical json file. Copy/paste the contents of the page and save it into FY*Whatever year*_Heirarchical.json in the data/ directory. Now you just have to add another year into the HTML and add the path to the year in the Javascript variable that has the path to the heirarchical data files. Open the budget website and navigate to your new year. You should be able to see your data. See how the tiny agencies are all crammed down in the corner? You have to fix that manually. Check FY14_Heirarchical.json and search for "OTHER". What we do is we consolidate the smaller agencies into an other category until they're fully visible. So go into FYWhatever_Heirarchical.json and cut all of the agencies that are clearly visible and paste them in another document. Once all that remains are the agencies that aren't visible, group them all under a new OTHER box that you create so that the entire file looks like this:

{
	"name": "Maryland Appropriations Budget FY14",
	"children": [
		{
			"name": "OTHER",
			"children": [
				{small agency here},
				{small agency here},
				{small agency here},
				...
				{small agency here}
			]	
		}
	]
}

Now, copy/paste your big agencies back into the file so that it looks like this.

{
	"name": "Maryland Appropriations Budget FY14",
	"children": [
		{big agency here},
		{big agency here},
		{big agency here},
		...
		{big agency here},
		{
			"name": "OTHER",
			"children": [
				{small agency here},
				{small agency here},
				{small agency here},
				...
				{small agency here}
			]	
		}
	]
}

Now you have one layer of "OTHER". You can keep doing that, having multiple nested "OTHER"s, each containing smaller and smaller agencies. Just be sure to watch your syntax extremely carefully, between commas, brackets, quotes, and curly brackets it's really easy to screw this up.

One more level would look something like this.

{
	"name": "Maryland Appropriations Budget FY14",
	"children": [
		{big agency here},
		{big agency here},
		{big agency here},
		...
		{big agency here},
		{
			"name": "OTHER",
			"children": [
				{small agency here},
				{small agency here},
				{small agency here},
				...
				{small agency here},
				{
					"name": "OTHER",
					"children": [
						{super small agency here},
						{super small agency here},
						{super small agency here},
						...
						{super small agency here}
					]	
				}
			]	
		}
	]
}