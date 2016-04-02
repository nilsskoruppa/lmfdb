# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

import joli
from sage.rings.rational import Rational
from sage.rings.integer import Integer
from parser import LatticeIndex



def dimension( nargs):
    
    def fun( k, L, h):
        try:
            return joli.dim_Joli( k, L, h)
        except NotImplementedError:
            return 'n/a'

    wts = nargs.get( 'weight_field')

    dct = nargs.get('index_field')
    if None == dct:
        dct = {u'A_4': u'A_4', u'A_3': u'A_3', u'A_2': u'A_2', u'A_1': u'A_1'}
    lats = []    
    for name in dct:
        L = LatticeIndex( dct[name])
        L.name( name)
        lats.append( L)
        
    chars = nargs.get( 'character_field')
    if None == chars:
        chars = [0]

    if None == wts:
        # k - h/2 must be integral since otherwise $J_{k,L}(\varepsilon^h)=0$
        n = min( L.rank() for L in lats)
        ps = set( map( lambda h: Integer(h)%2, chars))
        wts = [ ((n-p)/2).ceil() + p/2 + k for k in range(10) for p in ps]
    else:
        wts = map( lambda k: Rational(k), wts)

    table = dict((L, dict((h, dict((k, fun( k, L, h)) for k in wts)) for h in chars)) for L in lats)
    return 0, table



def module( nargs):

    dct = nargs.get('index_field')
    if None == dct:
        dct = {u'A_2': u'A_2'}
    lats = []    
    for name in dct:
        L = LatticeIndex( dct[name])
        L.name( name)
        lats.append( L)

    chars = nargs.get( 'character_field')
    if None == chars:
        chars = [0]

    table = dict((L, dict((h, dict((p, joli.JoliModule( L, h, parity = p)) for p in ['odd', 'even'] )) for h in chars)) for L in lats)

    # a hack to get sometimes the special weight
    has_neg_coeff = lambda f: len( filter( lambda x: x < 0, f.coefficients())) > 0
    for L in table:
        for h in table[L]:
            for p in table[L][h]:
                M = table[L][h][p]
                s,f = M.Poincare_pol()
                x = f.parent().gens()[0]
                g = 1 - x**4 - x**6 + x**10
                n = 0
                while has_neg_coeff(f+n*g):
                    n += 1
                if has_neg_coeff(f + (n+1)*g):
                    M.set_uterm( n)
    # endhack

    return 0, table



        #     X = a list of lists of equals length with integer entries

        # if multiplicity_notation is true,
        # the list X describes the thetablock
        # $\prod_{x\in X} \vartheta_{x[0]}^{x[1]}\eta^{-r}$,
        # otherwise the block
        # $\prod_{x\in X} \vartheta_{x[0]*z_1+x[1]*z_2+\cdots}\eta^{-r}$.
        # Here $r$ is chosen so that the thetablock has smallest weight
        # (i.e. so that the minimum of it valuaion is strictly smaller $1/24$. 

        # We do not admit an empty list (i.e. the trivial thetablock).
