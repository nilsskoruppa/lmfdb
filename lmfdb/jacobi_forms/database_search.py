# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

from parser import LatticeIndex
import pymongo
from database import DataBase



def prepare_query( qargs):

    wts = qargs.get( 'weight_field')

    dct = qargs['index_field']
    lats = []    
    for name in dct:
        L = LatticeIndex( dct[name])
        print L
        L.name( name)
        lats.append( L)
    print lats
    chars = qargs.get( 'character_field')

    def fun( L):
        G = L.gram_matrix()
        return [ int(G[i,j]) for i in range(L.rank()) for j in range( i,L.rank())]
    
    query = {}
    if None != wts:
        query['fl_weight'] = { '$in': wts }
    query['lattice'] = { '$in': map( fun, lats) }
    if None != chars:
        query['char'] = { '$in': chars }
    
    return query


        
def find( qargs):
    
    query = prepare_query( qargs)

    # import lmfdb.base
    # client = lmfdb.base.getDBConnection()
    # db = client.jacobi_forms
    # smpls = db.thetablocks
    # results = smpls.find( query)
    # client.close()

    db = DataBase()
    results = db.find( query, collection = 'thetablocks')
    
    return [ x for x in results] + [query]
