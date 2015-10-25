# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

import joli
from sage.rings.integer import Integer


def LatticeIndex( defn):
    """
    Parses a lattice definition given in the
    'simplified lattice grammar' and returns the
    lattice.
    """
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
