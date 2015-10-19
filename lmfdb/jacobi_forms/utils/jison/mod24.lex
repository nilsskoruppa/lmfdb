%option noyywrap

NUM      [0-9]+  
COUNT    [1-9]?[0-9]*
SP       [ \t]*
%%

{NUM}{SP}"+"{SP}{COUNT}{SP}","{SP}{COUNT}        {printf( "%s\n", yytext);}
{NUM}{SP}"+"{SP}{COUNT}                          {printf( "%s\n", yytext);}
{NUM}                                            {printf( "%s\n", yytext);}
[ \t\n]+                                         {/* ignore white space */}
.                                                {printf( "Error <%s>\n", yytext);}

%%

int main( void) {
  yyin = stdin;
  yylex();
  return 0;
}

