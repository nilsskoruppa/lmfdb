function pack_args( desc) {

    var form = event.target;
    var queryObj = new Object();    

    try {
	for (var key in desc) {
	    if ( !desc.hasOwnProperty( key)) {
		continue;
	    }
	    var f = form.elements.namedItem( key);
	    var input = f.value.trim();
	    if ( "" == input) {
		if ( f.required) throw "Fields with a '*' must be filled in";
		continue;
	    }
	    var inp = desc[key]( input);
	    queryObj[key] = new Object( inp);
	}
    }
    catch( err) {
	alert( err);
	return false;
    }
    form.elements.namedItem( "args").value = JSON.stringify( queryObj);
    return true;
}


function half_ints ( input) {
    lst = list_machine( input);
    return expand( lst);
}


function index ( input) {

    var eos = '\0'; sep = ',', col = ':';
    var white = new RegExp(/\s/);
    var inp = input.trim() + eos;
    var c, key, value;

    var dct = new Object();
    var state = 0, t = "";
    
    for ( var i = 0; i < inp.length; i++) {
	c = inp[i];
	
	switch (state) {
	case 0:
	    if ( c == col) {
		t = t.trim();
		if ( t.length == 0) throw col + "  without name at place " + i + " in " + input;
		key = t;
		t = "";
		state = 1;
	    }
	    else if ( c == sep | c == eos) {
		t = t.trim();
		if ( t.length == 0) throw "no definition before place " + i + " in " + input;
		dct[t] = t;
		t = "";
	    }
	    else t += c;
	    break;
	case 1:
	    if( c == col) throw "Not allowed character " + col + " at place " + i + " in " + input;
	    if ( c == sep | c == eos) {
		t = t.trim();
		if ( t.length == 0) throw "no definition after place " + i + " in " + input;
		dct[key] = t;
		t = "";
		state = 0;
	    }
	    else t += c;
	    break;
	}
    }

    return dct;
}


function mod24 ( input) {
    
    var sep = new RegExp(/\./);
    
    if ( sep.test( input))
	throw "Invalid character '.' in " + input;
    lst = list_machine( input);
    return expand( lst, 24);
}





function range( x, y) {

    var l = [];
    
    while ( x < y) {
	l.push( x);
	x++;
    }
    return l;
}


function expand( lst, mod) {

    // make a list of numbers
    var nlst = lst.reduce( function(l,s) {
	var x = eval( s);	    	    
	if ( typeof x == "number") l.push( x);
	else l = l.concat( x);
	return l;
    } , []);
    // reduce if necessary
    if ( typeof mod != "undefined")
	nlst = nlst.map( function(x) { return x%24});
    // sort
    nlst.sort( function( a, b){return a-b;})
    // delete duplicates
    nlst = nlst.reduce( function(l, x) {
	if ( l.indexOf( x) == -1) l.push( x);
	return l;
    }, []);
    return nlst;
}




function list_machine( input) {

    var state = 0
    var c, t = '';
    var lst = [];
    var white = new RegExp(/\s/);
    var digit = new RegExp(/\d/);
    var sep = '.', den = '5';
    var	inp = input + '\0';
    
    for (var j=0; j < inp.length; j++) {
	c = inp[j]
	switch ( state) {
	case 0:
	    if ( white.test( c)) {}
	    else if ( digit.test( c)) {
		t += c;
		state = 1;
	    }
	    // else if ( c == sep) {
	    // 	t += c;
	    // 	state = 4;
	    // }
	    else if ( c == '\0') {
		state = 100;
	    }
	    else throw "Invalid character at place " + j + " of " + input;
	    break;
	case 1:
	    if ( white.test( c)) {
		lst.push( t);
		t = '';
		state = 7
	    }
	    else if ( digit.test( c)) {
		t += c;
	    }
	    else if ( c == sep) {
		t += c;
		state = 4;
	    }
	    else if ( c == '+') {
		lst.push( t)
		t = '';
		state = 2;
	    }
	    else if ( c == '\0') {
		lst.push(t);
		state = 100;
	    }
	    else throw "Invalid character at place " + j + " of " + input
	    break;

	case 7:
	    if ( white.test( c)) {
	    }
	    else if ( digit.test( c)) {
		t += c;
		state = 1
	    }
	    else if ( c == sep) {
		t = lst.pop()
		t += c;
		state = 4;
	    }
	    else if ( c == '+') {
		state = 2;
	    }
	    else if ( c == '\0') {
		lst.push(t);
		state = 100;
	    }
	    else throw "Invalid character at place " + j + " of " + input
	    break;
	    
	case 2:
	    if ( white.test( c)) {}
	    else if ( digit.test( c)) {
		t += c;
		state = 3;
	    }
	    else throw "Invalid character at place " + j + " of " + input;
	    break;
	case 3:
	    if ( white.test( c) | c == '\0') {	
		t = parseInt(t)
		if (t > 0) {
		    u = lst.pop()
		    t = t + 1 + parseInt(u); 
		    lst.push( "range(" + u + "," + t + ")")  
		}
		t = '';
		if (white.test( c)) state = 0;
		else state = 100;
	    }
	    else if ( digit.test( c)) {
		t += c;
	    }
	    else throw "Invalid character at place " + j + " of " + input;
	    break;

	case 4:
	    if ( white.test( c)) {}
	    else if ( c == den) {
		t += c;
		lst.push( t);
		t = '';
		state = 5;
	    }
	    else throw "Invalid character at place " + j + " of " + input;
	    break;

	case 5:
	    if ( white.test( c)) {
		state = 6;
	    }
	    else if ( c == '+')
		state = 2;
	    else if ( c == '\0')
		state = 100
	    else throw "Invalid character at place " + j + " of " + input;
	    break;
	    
	case 6:
	    if (white.test( c)) {}
	    else if ( digit.test( c)) {
		t += c;
		state = 1;
	    }
	    else if ( c == '+')
		state = 2
	    else if ( c == '\0')
		state = 100
	    else throw "Invalid character at place " + j + " of " + input;
	    break;
	}
    }
 
    return lst;
}


function index_machine( input) {

    // var in = in.replace(/\s+/g,'');

    return input
    
}





//     var form = event.target;
//     var fields = form.getElementsByTagName( "input")
//     var args;  
//     var f = form.getElementsByName( "args");
//     alert (f[0].id);
//     try {   
// 	for ( var i = 0; i < fields.length; i++) {
// 	    var f = fields[i];

// 	    if ( f.type == "hidden" & f.name == "args") args = f;
// 	    // Here could go another field keeping the functiom to be called
// 	    // and another the include for the results view

// 	    var input = f.value.trim();
// 	    if ( "" == input) {
// 		if ( f.required) throw "Fields with a '*' must be filled in";
// 		continue;
// 	    }
// 	    var inp = desc[key]( input);
// 	    eval( "queryObj." + fields[i] + " = new Object( inp)");
// 	}
//     }
//     catch( err) {
// 	alert( err);
// 	return false;
//     }
    
//     args.value = JSON.stringify( queryObj);
//     return true;

//     alert( fields.length);
//     for ( var i = 0; i < fields.length; i++) {
// 	alert( "i -> " + fields[i].optional);
//     }

//     var fields = [ "weight_field", "index_field", "character_field"];
//     var queryObj = new Object();
//     var c=0;
    
//     try {
// 	for ( var i=0; i<fields.length; i++) {

// 	    var input = document.getElementById( fields[i]).value.trim();
// 	    if ( "" == input) {
// 		c++;
// 		continue;
// 	    }
// 	    var inp = parseOurArg( fields[i], input)
// 	    eval( "queryObj." + fields[i] + " = new Object( inp)");
// 	}
//     }
//     catch( err) {
// 	alert( err);
// 	return false;
//     }
    
//     if ( 4 == c) return false;    
//     document.getElementById("dim_args").value = JSON.stringify( queryObj);
//     return true;
// }



// function parseOurArg( field, input) {

//     var lst;
    
//     if ("weight_field" == field) {
// 	lst = list_machine( input);
// 	return expand( lst);
//     }

//      if ("index_field" == field) {
// 	 return index_machine( input);
//      }

//     if ("character_field" == field) {
// 	var sep = new RegExp(/\./);
// 	if ( sep.test( input))
// 	    throw "Invalid character '.' in " + input;
// 	lst = list_machine( input);
// 	return expand( lst, 24);	
//     }

//     if ("eigenvalue_field" == field) {
// 	throw "not yet defined";
//     }      
//     return "None";
// }



function validate() {
    var col = eval("(" + document.getElementById("col_select").value + ")");
    var args = document.getElementById("args_field").value;

    var e = "\\s*(\\d{1,4})\\s*"
    var p1 = "^" + e;
    var p2 = "^\\s*(\\d{1,4})\\s*\\+\\s*(\\d{1,2})\\s*";

    for (var i=1; i < col['args'].length; i++) {
	p1 += "\\s+" + e;
	p2 += "\\s+" + e;	    
    }
    p1 += "$";
    p2 += "$";
    var opt1 = new RegExp(p1);
    var opt2 = new RegExp(p2);

    var result = p1;

    if ( m = args.match(opt1)) {
	result = "[range(" + m[1] + "," + (eval(m[1])+19) + ")";
	for (var i = 2; i < m.length; i++) {
	    result += "," + m[i];
	}
	result += "]";
	document.getElementById("col_name").value = col['name']
	document.getElementById("dim_args").value = result;
	return true
    }
    else if ( m = args.match(opt2)) {
	result = "[range(" + m[1] + "," + (eval(m[1])+eval(m[2])+1) + ")";
	for (var i = 3; i < m.length; i++) {
	    result += "," + m[i];
	}
	result += "]";
	document.getElementById("col_name").value = col['name'];
	document.getElementById("dim_args").value = result;
	return true
    }
    else {
	alert( "Error: invalid input: " + args + "\n\n Valid input: x for scalar valued and x j for vector valued modular forms. Here x is a non-negative integer k <= 9999 or a range in the form k+n, where k and n are non-negative integers <= 9999 and <= 99, respectively. Moreover, 'j' is a non-negative integer <= 99.\n\n The short hand 'k+n' stands for 'k plus n more succesive integers'.");
	return false;
    }
    alert( "Error: input too big");
    return false;
}


function prepare_query() {
    
    var fields = [ "weight", "degree_of_field", "degree", "representation"]
    var queryObj = new Object();

    var opt1 = "^\\s*([1-9][0-9]*)\\s*$";
    var opt2 = "^\\s*[1-9][0-9]*(\\s+[1-9][0-9]*)+\\s*$";
    var opt3 = "^\\s*([1-9][0-9]*)\\s*\\+\\s*([1-9][0-9]*)\\s*$";
    var c = 0;
    
    try {
	for (var i=0; i<fields.length; i++) {

	    if ("representation" == fields[i] | "weight" == fields[i]) {
		opt1 = "^\\s*([0-9]+)\\s*$";
		opt2 = "^\\s*[0-9]+(\\s+[0-9]+)+\\s*$";
		opt3 = "^\\s*([0-9]+)\\s*\\+\\s*([1-9][0-9]*)\\s*$";
	    }
	    else {
		opt1 = "^\\s*([1-9][0-9]*)\\s*$";
		opt2 = "^\\s*[1-9][0-9]*(\\s+[1-9][0-9]*)+\\s*$";
		opt3 = "^\\s*([1-9][0-9]*)\\s*\\+\\s*([1-9][0-9]*)\\s*$";
	    }
	    
	    var input = document.getElementById(fields[i]).value.trim()

	    if ( "" == input) {
		c++;
		continue;
	    }
	    else if ( m = input.match( opt1)) {
		a = String( parseInt(m[1]))
		eval( "queryObj." + fields[i] + "=a")
		continue;
	    }
	    else if ( m = input.match( opt2)) {
		a = input.split(/\s+/);
		for( var j=0; j < a.length; j++) {
		    a[j] = String( parseInt(a[j]));
		}
		eval( "queryObj." + fields[i] + "=new Object( {'$in': a})");
		continue;
	    }
	    else if ( m = input.match( opt3)) {
		a = m[1];
		b = m[2];
		c = [];
		for ( var j=0; j<=b; j++) {
		    c[j] = String( parseInt(a) + j);
		}
		eval( "queryObj." + fields[i] + "=new Object( {'$in': c})");
		continue;
	    }
	    else {
		alert( "Error: confusing input: '" + input + "'.\n\nValid input: one ore more space separated non-negative integers, or a range in the form 'k+n' (meaning 'k plus n more integers').\n\nDo not complain when you ask for degree '0' and have to read this message.");
		return false;
	    }
	    
	}
    }
    catch( err) {
	alert( err + "\n\nError: confusing input: '" + input + "'.\n\nValid input: one ore more space separated non-negative integers, or a range in the form 'k+n' (meaning 'k plus n more integers').\n\nDo not complain when you ask for degree '0' and have to read this message.");
	return false;
    }
    if ( 4 == c) return false;
    // q_dict = JSON.stringify( queryObj);
    // alert( '<'+q_dict+'>');
    document.getElementById("query").value = JSON.stringify( queryObj);
    return true;
}
