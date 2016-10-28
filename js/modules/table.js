//the table function takes a container and an array of associative array objects.

export default function table(container, height){
	var columns = [];
	var callbacks = {row:null, cell:null};
	
	var sortcol = null;
	var last_sortcol = null;

	var cell_widths = [];
	var alignments = []; //-1-left 0-middle 1-right

	var nrows = null;

	var notes = [];

	var data = null;
	var wrap = d3.select(container).append("div").style("width","100%").style("height","100%").style("padding","0px");

	if(!height){height = 500}

	//append two tables. thead holds header. tbody holds body
	var thead_wrap = wrap.append("div").style("border-bottom","1px solid #aaaaaa");
	var thead = thead_wrap.append("table")
						  .style("table-layout","fixed")
						  .style("width","100%")
						  .style("border-collapse","collapse")
						  .append("tbody");
	
	var tbody_wrap = wrap.append("div");
	var tbody = tbody_wrap.append("table")
						  .style("table-layout","fixed")
						  .style("width","100%")
						  .style("height","100%")
						  .style("border-collapse","collapse")
						  .append("tbody");

	var tfoot = wrap.append("div");
	var tnotes = wrap.append("div").style("margin-top","2em").style("text-align","left");

	//var rows
	var thr, tbr;

	//table header and table body td
	var thd, tbd;
	
	var T = {};

	T.data = function(d){
		data = d;
		return T;
	}

	T.truncate = function(n){
		if(n==null){
			nrows = null;
		}
		else{
			nrows = n;
		}
		return T;
	}

	T.notes = function(text){
		notes = notes.concat(text);
		
		var tu = tnotes.selectAll("p").data(notes);
		var t = tu.enter().append("p").merge(tu);
		t.html(function(d,i){return d}).style("margin","0px").style("line-height","1.65em");
		return T;
	}

	T.rows = function(fn){
		if(arguments.length > 0){
			callbacks.row = fn;
			if(!!tbr){fn(tbr)}
		}
		return tbr;
	}

	T.cells = function(fn){
		if(arguments.length > 0){
			callbacks.cell = fn;
			if(!!tbd){fn(tbd)}			
		}
		return tbd;
	}

	//the column method registers a new column
	  //key is used to extract data values from each associative array in data
	  //alias is used to label the column header
	  //formatter is used to print the value, it is called with the full row of data as the this-object
	  //the default sort is descending, default_sort_ascending reverses this
	var col_index = -1;
	T.column = function(key, alias, ascending, formatter, default_sort){
		var col = {};
		if(!formatter){ formatter = function(v){return v} }

		col.get = function(d){
			var val = d[key];
			var fmt = formatter.call(d, val);
			return {val: val, print: fmt, key:key}
		}
		col.key = key;
		col.index = ++col_index;
		col.name = alias;
		col.asc = !!ascending ? true : false;
		columns.push(col);

		if(col.index == 0){
			sortcol = col;
			last_sortcol = col;
		}
		else if(!!default_sort){sortcol = col}

		return T;
	}

	//pass in an array of widths, representing percentages
	T.widths = function(w){
		cell_widths = cell_widths.concat(w);
		return T;
	}
	T.width = T.widths;

	T.set_ta = function(w){
		alignments = alignments.concat(w);
		return T;
	}

	//sort data according to current value of sortcol
	function sort_row_data(row_data){
		var index = sortcol.index;
		var index_tb = last_sortcol.index;

		var order = sortcol.asc ? 1 : -1;

		row_data.sort(function(a,b){
			var va = a[index].val;
			var vb = b[index].val;

			if(va == vb){
				var va_tb = a[index_tb].val;
				var vb_tb = b[index_tb].val;

				var last_order = last_sortcol.asc ? 1 : -1;
				var c = last_order*(va_tb < vb_tb ? -1 : (va_tb == vb_tb ? 0 : 1)); 

				//console.log("a == b // a: " + va + " | b: " + vb);
				//console.log("second comp // a: " + va_tb + " | b: " + vb_tb + " | comparison: " + c);
			}
			else if(va==null){
				var c = 1;
			}
			else if(vb==null){
				var c = -1;
			}
			else if(va < vb){
				var c = order*(-1);
				//console.log("a < b // a: " + va + " | b: " + vb + " | comparison: " + c);
			}
			else{
				var c = order;
				//console.log("a > b // a: " + va + " | b: " + vb + " | comparison: " + c);
			}


			return c;
		});

		return row_data;
	}

	T.build = function(){

		//build rows
		var rows = data.map(function(from_row){
			var row = columns.map(function(column){
				return column.get(from_row);
			});
			row.full_data = from_row;
			return row;
		});

		sort_row_data(rows);

		if(nrows!=null && nrows < rows.length){
			var truncated = true;
			rows = rows.slice(0,nrows);

			var showmore0 = tfoot.selectAll("p.show-more-results").data([0]);
			var showmore1 = showmore0.enter().append("p").classed("show-more-results",true).merge(showmore0);
				showmore1
					.html("Results limited to " + nrows + ". <span>Show all " + data.length + " »</span>")
					.style("font-style","italic")
					.style("text-align","right")
					.style("cursor","pointer")
					.classed("disable-highlight",true);

			showmore1.on("mousedown", function(){
				nrows = null;
				T.build();
			});
		}
		else{
			tfoot.selectAll(".show-more-results").remove();
		}

		//table header rows
		var thr_u = thead.selectAll("tr").data([columns]);
		thr_u.exit().remove();
		thr = thr_u.enter().append("tr").merge(thr_u);

		//table header cells
		var thd_u = thr.selectAll("td").data(function(d,i){return d});
		thd_u.exit().remove();
		
		thd = thd_u.enter().append("td").merge(thd_u);
		thd.html(function(d,i){return d.name}).style("font-weight","bold").style("cursor","pointer");
		thd.style("text-align", function(d,i){
			if(i < alignments.length){
				var a = alignments[i];
				return a==1 ? "right" : (a==-1 ? "left" : "center");
			}
		}).style("padding","0.25em 0.5em 0.25em .5em")
		  .style("vertical-align","bottom")
		  .style("line-height","1.25em")
		  .classed("disable-highlight",true)
		  .classed("sort-asc", function(d,i){
		  	return i==sortcol.index && sortcol.asc;
		  })
		  .classed("sort-desc", function(d,i){
		  	return i==sortcol.index && !sortcol.asc;
		  });
		  ;

		//table body rows
		var tbr_u = tbody.selectAll("tr").data(rows);
		tbr_u.exit().remove();
		tbr = tbr_u.enter().append("tr").merge(tbr_u);

		//table body cells
		var tbd_u = tbr.selectAll("td").data(function(d,i){return d});
		tbd_u.exit().remove();
		
		tbd = tbd_u.enter().append("td").merge(tbd_u);
		tbd.html(function(d,i){return d.print});
		tbd.style("text-align", function(d,i){
			if(i < alignments.length){
				var a = alignments[i];
				return a==1 ? "right" : (a==-1 ? "left" : "center");
			}
		}).style("padding","1.5em 0.5em 0.25em 0.5em")
		  .style("vertical-align","bottom")
		  .style("line-height","1.25em")
		  .style("border-bottom","1px dotted #aaaaaa");

		if(cell_widths.length >= columns.length){
			thd.style("width", function(d,i){return cell_widths[i] + "%"});
			tbd.style("width", function(d,i){return cell_widths[i] + "%"});
		}

		thd.on("mousedown", function(d,i){
			if(d.key==sortcol.key){
				sortcol.asc = !sortcol.asc;
			}
			else{
				last_sortcol = sortcol;
				sortcol = d;
			} 

			//rebuild the table
			T.build();
		})

		if(!!callbacks.row){callbacks.row(tbr)}
		if(!!callbacks.cell){callbacks.cell(tbd)}	

		return T;
	}

	T.resize = function(){
		setTimeout(function(){
			try{
				var box = scope.outerWrap.node().getBoundingClientRect();
				
				var t1box = t1.node().getBoundingClientRect();
				
				//row 1 of second table
				var r1 = t2.selectAll("tr").node();
				var r1box = r1.getBoundingClientRect();
				var r1width = Math.round(r1box.right - r1box.left);

				two_tables.filter(function(d,i){return i==0}).style("width", r1width + "px");


				var boxh = Math.round(box.bottom - box.top);
				var h = boxh - (t1box.bottom-box.top);
				var w = box.right - box.left;
				if(w > 900){
					var fs = "1em";
				}
				else if(w > 500){
					var fs = "0.8em";
				}
				else{
					var fs = "0.65em";
				}

				table_cells.style("font-size", fs);
				//console.log(scope.outerWrap.node());
				//console.log(t2.node())
				if(h < 250){throw "badH"}
				
				two_table_sections.style("height",function(d,i){return i==1 ? h+"px" : "auto"});
			}
			catch(e){
				//no-op
			}

		},0);
	}

	return T;
}