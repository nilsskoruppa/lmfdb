# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

import joli
from sage.rings.rational import Rational
from sage.rings.integer import Integer


def dimension( nargs):

    L = joli.LatticeIndex( nargs['index_field'])
    n = L.rank()

    chars = nargs.get( 'character_field')
    if None == chars:
        chars = [0]

    wts = nargs.get( 'weight_field')
    if None == wts:
        # k - h/2 must be integral since otherwise $J_{k,L}(\varepsilon^h)=0$
        ps = set( map( lambda h: Integer(h)%2, chars))
        wts = [ ((n-p)/2).ceil() + p/2 + k for k in range(10) for p in ps]
        print ps, ((n-p)/2).ceil() + p/2
    else:
        wts = map( lambda k: Rational(k), wts)

    def fun( k, L, h):
        try:
            return joli.dim_Joli( k, L, h)
        except NotImplementedError:
            return '?'

    table = { L: dict( (h, dict( (k, fun( k, L, h)) for k in wts)) for h in chars)}
    return 0, table



def module( nargs):

    L = joli.LatticeIndex( nargs['index_field'])
    n = L.rank()

    chars = nargs.get( 'character_field')
    if None == chars:
        chars = [0]

    table = { L: dict( (h, dict( (p, joli.JoliModule( L, h, parity = p, uterm = None)) for p in ['odd', 'even'] )) for h in chars) }
    return 0, table

