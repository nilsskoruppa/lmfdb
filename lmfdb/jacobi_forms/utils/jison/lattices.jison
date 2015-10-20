/* description: Parses a sequence of lattice definitions. */

/* lexical grammar */
%lex

%%

\s+                   /* skip whitespace */
"-"?[0-9]+            return 'INT'
"*"                   return '*'
"+"                   return '+'
"("                   return '('
")"                   return ')'
"["                   return '['
"]"                   return ']'
"<"                   return '<'
">"                   return '>'
("A_"|"B_"|"C_"|"D_"|"Z^")[1-9]+[0-9]*|"E_6"|"E_7"|"E_8"|"G_2"|"F_4|Z"        return 'STRING'
[a-z]+                return 'NAME'
","                   return ","
":"                   return ":"
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex


/* operator associations and precedence */

%left "+"
%left "*"

%start lat_seq

%% /* language grammar */

lat_seq
    : lat
        {$$ = [[String($1),$1]];}
    | NAME ":" lat
        {$$ = [[$1,$3]];}
    | lat_seq "," lat
        {$$ = $1.concat([[$3.toString(),$3]]);}
    | lat_seq "," NAME ":" lat
        {$$ = $1.concat([[$3,$5]]);}
    | lat_seq EOF
        {return $1;}
    ;

lat
    : INT
        {$$ = parseInt(yytext);}
    | '[' seq ']'
        {$$ = $2;}
    | STRING
        {$$ = yytext;}
    | lat "<" INT ">"
        {$$ = ["r", $1, parseInt($3)];}
    | "(" lat ")"
        {$$ = $2;}
    | INT "*" lat
        {$$ = ["s", $3, parseInt($1)];}
    | lat "+" lat
        {$$ = ["+", $1, $3];}
    ;

seq
    : INT
      {$$ = [ parseInt(yytext) ];}
    | seq INT
      {$$ = $1.concat(parseInt($2));}
    ;
