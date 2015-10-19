/* description: Parses a description of weight ranges */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
[0-9]+"."5            return 'HALFINT'
[0-9]+                return 'INT'
"+"                   return '+'
","                   return ','
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start expressions

%% /* language grammar */

expressions
    : e
        {$$ = [$1]}
    | expressions e
        {$$ = $1.concat([$2]);}
    | expressions EOF
        {return $1;}
    ;

e
    : INT '+' INT ',' INT
        {$$ = [parseInt($1),parseInt($3),parseInt($5)];}
    | HALFINT '+' INT ',' INT
        {$$ = [parseFloat($1),parseInt($3),parseInt($5)];}
    | HALFINT '+' INT ',' HALFINT
        {$$ = [parseFloat($1),parseInt($3),parseFloat($5)];}
    | INT '+' INT ',' HALFINT
        {$$ = [parseInt($1),parseInt($3),parseFloat($5)];}
    | INT '+' INT
        {$$ = [parseInt($1),parseInt($3)];}
    | HALFINT '+' INT
        {$$ = [parseFloat($1),parseInt($3)];}
    | INT
        {$$ = [parseInt($1)];}
    | HALFINT
        {$$ = [parseFloat($1)];}
    ;
