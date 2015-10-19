/* description: Parses a description of character ranges */
/* Feed into http://zaach.github.io/jison/try/ for generating javascript*/

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
[0-9]+                return 'NUMBER'
"+"                   return '+'
","                   return ','
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start range_seq

%% /* language grammar */

range_seq
    : range
        {$$ = [$1]}
    | range_seq range
        {$$ = $1.concat([$2]);}
    | range_seq EOF
        {return $1;}
    ;

range
    : NUMBER '+' NUMBER ',' NUMBER
        {$$ = [parseInt($1)%24,parseInt($3),parseInt($5)%24];}
    | NUMBER '+' NUMBER
        {$$ = [parseInt($1)%24,parseInt($3)];}
    | NUMBER
        {$$ = [parseInt($1)%24];}
    ;
