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
    
    var erg = parser.parse( input)
    erg = expand1( erg, 24)
    return erg
}


function expand1( lst, mod) {

    var nlst = lst.reduce( function(l,x) {
	var tmp = [];

	if ( x.length == 1) {
	    tmp = x
	}
	else if ( x.length == 2) {
	    u = x[0];
	    while ( u <= x[0]+x[1]) {
		tmp.push( u);
		u++;
	    }
	}
	else {
	    u = x[0];
	    while ( u <= x[0]+x[1]*x[2]) {
		tmp.push( u);
		u += x[2];
	    }
	}
	l = l.concat( tmp);
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





/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace(){},
yy: {},
symbols_: {"error":2,"range_seq":3,"range":4,"EOF":5,"NUMBER":6,"+":7,",":8,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"NUMBER",7:"+",8:","},
productions_: [0,[3,1],[3,2],[3,2],[4,5],[4,3],[4,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
/**/) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:this.$ = [$$[$0]]
break;
case 2:this.$ = $$[$0-1].concat([$$[$0]]);
break;
case 3:return $$[$0-1];
break;
case 4:this.$ = [parseInt($$[$0-4])%24,parseInt($$[$0-2]),parseInt($$[$0])%24];
break;
case 5:this.$ = [parseInt($$[$0-2])%24,parseInt($$[$0])];
break;
case 6:this.$ = [parseInt($$[$0])%24];
break;
}
},
table: [{3:1,4:2,6:[1,3]},{1:[3],4:4,5:[1,5],6:[1,3]},{1:[2,1],5:[2,1],6:[2,1]},{1:[2,6],5:[2,6],6:[2,6],7:[1,6]},{1:[2,2],5:[2,2],6:[2,2]},{1:[2,3],5:[2,3],6:[2,3]},{6:[1,7]},{1:[2,5],5:[2,5],6:[2,5],8:[1,8]},{6:[1,9]},{1:[2,4],5:[2,4],6:[2,4]}],
defaultActions: {},
parseError: function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{throw new Error(str)}},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},

// resets the lexer, sets new input
setInput:function (input){this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},

// consumes and returns one char from the input
input:function (){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},

// unshifts one char (or a string) into the input
unput:function (ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},

// When called from action, caches matched text and appends it on next action
more:function (){this._more=true;return this},

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function (){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},

// retain first n characters of the match
less:function (n){this.unput(this.match.slice(n))},

// displays already matched input, i.e. for error messages
pastInput:function (){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},

// displays upcoming input, i.e. for error messages
upcomingInput:function (){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function (){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match,indexed_rule){var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this[k]=backup[k]}return false}return false},

// return next match in input
next:function (){if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this.options.backtrack_lexer){token=this.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this._backtrack){match=false;continue}else{return false}}else if(!this.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},

// return next match that has a token
lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition){this.conditionStack.push(condition)},

// pop the previously active lexer condition state off the condition stack
popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},

// alias for begin(condition)
pushState:function pushState(condition){this.begin(condition)},

// return the number of states currently on the stack
stateStackSize:function stateStackSize(){return this.conditionStack.length},
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
/**/) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 6
break;
case 2:return 7
break;
case 3:return 8
break;
case 4:return 5
break;
case 5:return 'INVALID'
break;
}
},
rules: [/^(?:\s+)/,/^(?:[0-9]+)/,/^(?:\+)/,/^(?:,)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
