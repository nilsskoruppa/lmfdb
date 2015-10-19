# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

import joli
from sage.rings.rational import Rational
from sage.rings.integer import Integer


def LatticeIndex( defn):

    try:
        defn = [2*Integer( defn)]
    except:
        pass
    try:
        return joli.LatticeIndex( defn)
    except:
        pass

    if 'r' == defn[0]:
        L = LatticeIndex( defn[1])
        return L.twist( defn[2])
    if 's' == defn[0]:
        M = L = LatticeIndex( defn[1])
        for i in range( 1, defn[2]):
            M = M.orthogonal_sum( L)
        return M
    if '+' == defn[0]:
        return LatticeIndex( defn[1]).orthogonal_sum( LatticeIndex( defn[2]))

            
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
        L = joli.LatticeIndex( dct[name])
        L.name( name)
        lats.append( L)

    chars = nargs.get( 'character_field')
    if None == chars:
        chars = [0]

    table = dict((L, dict((h, dict((p, joli.JoliModule( L, h, parity = p, uterm = None)) for p in ['odd', 'even'] )) for h in chars)) for L in lats)
    return 0, table
