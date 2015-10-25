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
            return '?'

    wts = nargs.get( 'weight_field')

    dct = nargs['index_field']
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

    dct = nargs['index_field']
    lats = []    
    for name in dct:
        L = LatticeIndex( dct[name])
        L.name( name)
        lats.append( L)

    chars = nargs.get( 'character_field')
    if None == chars:
        chars = [0]

    table = dict((L, dict((h, dict((p, joli.JoliModule( L, h, parity = p, uterm = None)) for p in ['odd', 'even'] )) for h in chars)) for L in lats)
    return 0, table
