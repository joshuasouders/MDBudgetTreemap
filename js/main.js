var FYPath = [
	{
		"name": "FY15",
		"path": "data/FY15_Heirarchical.json"
	},
	{
		"name": "FY14",
		"path": "data/FY14_Heirarchical.json"
	}
];

var pathStack = [];
var depth = 0;

$(".dropdown-menu").on('click','li',function(){
	for(var x = 0; x < FYPath.length; x++){
		if(FYPath[x].name == $(this).text()){
			$("#chart").html("");
			runNewChart(FYPath[x]);
		}
	}
});


runNewChart(FYPath[0]);

function runNewChart(FYNamePath){

var margin = {top: 20, right: 0, bottom: 0, left: 0},
	width = 960,
	height = 600 - margin.top - margin.bottom,
	formatNumber = d3.format(",d"),
	transitioning;

	/* create x and y scales */
	var x = d3.scale.linear()
		.domain([0, width])
		.range([0, width]);

	var y = d3.scale.linear()
		.domain([0, height])
		.range([0, height]);

	var treemap = d3.layout.treemap()
		.children(function(d, depth) { return depth ? null : d.children; })
		.sort(function(a, b) { return a.value - b.value; })
		.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
		.round(false);

	/* create svg */
	var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.bottom + margin.top)
		.style("margin-left", -margin.left + "px")
		.style("margin.right", -margin.right + "px")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.style("shape-rendering", "crispEdges");

	var color = d3.scale.category20c();

	var grandparent = svg.append("g")
		.attr("class", "grandparent");

	grandparent.append("rect")
		.attr("y", -margin.top)
		.attr("width", width)
		.attr("height", margin.top);

	grandparent.append("text")
		.attr("x", 6)
		.attr("y", 6 - margin.top)
		.attr("dy", ".75em");

	loadData(FYNamePath);

	function loadData(FYNamePath, root){
		var numTimesTransitioned = 0;
		var localDepth = 0;

		/* load in data, display root */
		d3.json(FYNamePath.path, function(root) {

			console.log(root);

				initialize(root);
				accumulate(root);
				layout(root);
				display(root);

			function initialize(root) {
				root.x = root.y = 0;
				root.dx = width;
				root.dy = height;
				root.depth = 0;
			}

			// Aggregate the values for internal nodes. This is normally done by the
			// treemap layout, but not here because of the custom implementation.
			function accumulate(d) {
				return d.children
				? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
				: d.value;
			}

			// Compute the treemap layout recursively such that each group of siblings
			// uses the same size (1×1) rather than the dimensions of the parent cell.
			// This optimizes the layout for the current zoom state. Note that a wrapper
			// object is created for the parent node for each group of siblings so that
			// the parent’s dimensions are not discarded as we recurse. Since each group
			// of sibling was laid out in 1×1, we must rescale to fit using absolute
			// coordinates. This lets us use a viewport to zoom.
			function layout(d) {
				if (d.children) {
					treemap.nodes({children: d.children});
					d.children.forEach(function(c) {
					c.x = d.x + c.x * d.dx;
					c.y = d.y + c.y * d.dy;
					c.dx *= d.dx;
					c.dy *= d.dy;
					c.parent = d;
					layout(c);
					});
				}
			}

			/* display shows the treemap and writes the embedded transition function */
			function display(d) {
				if(d.name.indexOf("Maryland Appropriations Budget") > -1){
					document.getElementById("back-button").style.display = "none";
				}
				else{
					document.getElementById("back-button").style.display = "inline-block";
					$("#back-button").click(function(){
						$(".grandparent").d3Click();
					});
				}

				/* create grandparent bar at top */
				grandparent
					.datum(d.parent)
					.on("click", transitionUp)
					.select("text")
					.text(d.name + " - $" + formatNumber(d.value));

				var g1 = svg.insert("g", ".grandparent")
					.datum(d)
					.attr("class", "depth");
				/* add in data */
				var g = g1.selectAll("g")
					.data(d.children)
					.enter().append("g");

				/* transition on child click */
				g.filter(function(d) { return d.children; })
					.classed("children", true)
					.on("click", transitionDown);

				/* write parent rectangle */
				g.append("rect")
					.attr("class", "parent")
					.call(rect)
					.append("title")
					.text(function(d) { return d.name + " - $" + formatNumber(d.value); });
					
				if((navigator.userAgent.toLowerCase().indexOf('chrome') > -1) || (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)){
					/* Adding a foreign object instead of a text object, allows for text wrapping */
					g.append("foreignObject")
						.attr("class","foreignobj")
						.call(rect)
						.append("xhtml:div") 
						.attr("dy", ".75em")
						.text(function(d) { return d.name + " - $" + numberWithCommas(d.value); 
					})
					.attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS
				}
				else{
					g.append("text")
			        .attr("dy", ".75em")
			        .text(function(d) { return d.name + " - $" + numberWithCommas(d.value);  })
			        .call(text);
				}

		

				if(localDepth != depth){
					setTimeout(function(){
					if(d.name != pathStack[pathStack.length-1]){
						console.log(d);
						firstTime = false;
						var foundSomething = false;

						console.log("in the name statement");

							for(var j = 0; j < d.children.length; j++){
								console.log(d.children[j].name + "   " + pathStack[numTimesTransitioned]);
								if(d.children[j].name == pathStack[numTimesTransitioned]){
									foundSomething = true;
									console.log("MATCH FOUND - transitioning");
									numTimesTransitioned++;
										localDepth += 1;
										transition(d.children[j]);
									break;
								}
							}

							if(!foundSomething){
								pathStack = pathStack.slice(0, numTimesTransitioned);
							}
					}
					else if (localDepth < depth){
						console.log(d);
						firstTime = false;
						var foundSomething = false;

						console.log("in the <= statement");

							for(var j = 0; j < d.children.length; j++){
																console.log(d.children[j].name + "   " + pathStack[numTimesTransitioned]);

								if(d.children[j].name == pathStack[numTimesTransitioned]){
									foundSomething = true;
									console.log("MATCH FOUND - transitioning");
									numTimesTransitioned++;
									
										localDepth += 1;
										transition(d.children[j]);
									break;
								}
							}

							if(!foundSomething){
								pathStack = pathStack.slice(0, numTimesTransitioned);
							}
					}
					else{
						console.log(d.name + " is equal to " + pathStack[pathStack.length-1]);
					}
				}, 500);
				}


				function transitionDown(d) {
					if (!transitioning && d){
						pathStack.push(d.name);
						depth += 1;
						localDepth += 1;
						transition(d);
					}
				}

				function transitionUp(d) {
					if (!transitioning && d){
						pathStack.pop();
						depth -= 1;
						localDepth += 1;
						transition(d);
					}
				}

				/* create transition function for transitions */
				function transition(d) {
					console.log(d);
					console.log(pathStack);
					if (transitioning || !d){
						pathStack.pop(); 
						return;
					}
					transitioning = true;

					var g2 = display(d),
					t1 = g1.transition().duration(200),
					t2 = g2.transition().duration(200);

					// Update the domain only after entering new elements.
					x.domain([d.x, d.x + d.dx]);
					y.domain([d.y, d.y + d.dy]);

					// Enable anti-aliasing during the transition.
					svg.style("shape-rendering", null);

					// Draw child nodes on top of parent nodes.
					svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

					// Fade-in entering text.
					g2.selectAll("text").style("fill-opacity", 0);
					g2.selectAll("foreignObject div").style("display", "none"); /*added*/

					// Transition to the new view.
					t1.selectAll("text").call(text).style("fill-opacity", 0);
					t2.selectAll("text").call(text).style("fill-opacity", 1);
					t1.selectAll("rect").call(rect);
					t2.selectAll("rect").call(rect);

					t1.selectAll(".textdiv").style("display", "none"); /* added */
					t1.selectAll(".foreignobj").call(foreign); /* added */
					t2.selectAll(".textdiv").style("display", "block"); /* added */
					t2.selectAll(".foreignobj").call(foreign); /* added */ 

					// Remove the old node when the transition is finished.
					t1.remove().each("end", function() {
					svg.style("shape-rendering", "crispEdges");
					transitioning = false;
					});

				}

				setDropdown(FYNamePath)

				return g;
			}//endfunc display

			function text(text) {
				text.attr("x", function(d) { return x(d.x) + 6; })
				.attr("y", function(d) { return y(d.y) + 6; });
			}



			function rect(rect) {
				rect.attr("x", function(d) { return x(d.x); })
				.attr("y", function(d) { return y(d.y); })
				.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
				.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
				.style("background", function(d) { return d.parent ? color(d.name) : null; });
			}

			function foreign(foreign){ /* added */
				foreign.attr("x", function(d) { return x(d.x); })
				.attr("y", function(d) { return y(d.y); })
				.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
				.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
			}

			function numberWithCommas(x) {
			    x = x.toString();
			    var pattern = /(-?\d+)(\d{3})/;
			    while (pattern.test(x))
			        x = x.replace(pattern, "$1,$2");
			    return x;
			}

			function name(d) {
				return d.parent
				? name(d.parent) + "." + d.name
				: d.name;
				}
			});

			jQuery.fn.d3Click = function () {
			  this.each(function (i, e) {

			    var evt = document.createEvent("MouseEvents");
			    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);


			    e.dispatchEvent(evt);
			  });
			};

			function setDropdown(FYNamePath){
				$("#dropdown").html(FYNamePath.name + ' <span class="caret"></span>');

				var liText = "";

				for(var i = 0; i < FYPath.length; i++){
					if(FYPath[i] != FYNamePath){
						liText += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + FYPath[i].name + '</a></li>';
					}
				}

				$(".dropdown-menu").html(liText);
			}
		}
	}