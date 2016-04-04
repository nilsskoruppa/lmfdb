# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

from parser import LatticeIndex
import pymongo
from database import DataBase
import caller


def prepare_query( qargs):

    wts = qargs.get( 'weight_field')

    dct = qargs.get('index_field')
    if None != dct:
        lats = []    
        for name in dct:
            L = LatticeIndex( dct[name])
            print L
            L.name( name)
            lats.append( L)
    chars = qargs.get( 'character_field')
    dets = qargs.get( 'determinant_field')
    ranks = qargs.get( 'rank_field')

    def fun( L):
        G = L.gram_matrix()
        return [ int(G[i,j]) for i in range(L.rank()) for j in range( i,L.rank())]
    
    query = {}
    if None != wts:
        query['fl_weight'] = { '$in': wts }
    if None != dct:
        query['lattice'] = { '$in': map( fun, lats) }
    if None != chars:
        query['char'] = { '$in': chars }
    if None != dets:
        query['det'] = { '$in': dets }
    if None != ranks:
        query['rank'] = { '$in': ranks }
    return query


class Response:

    def __init__( self, qargs, context = 'thetablocks', limit = 100):
        
        self._qargs = qargs
        self._context = context
        self.limit = limit
        self._query = prepare_query( qargs)
        self.hits = self._count()
        self.data = self._find()

    def _count( self):
        db = DataBase()
        return db.count( self._query, collection = self._context)

    def _find( self):
        db = DataBase()
        if self.hits > self.limit:
            results = db.find( self._query, collection = self._context, limit = self.limit)
        else:
            results = db.find( self._query, collection = self._context)
        if 'eigenforms' == self._context:
            from eigenform import Eigenform 
            return [ Eigenform(**x) for x in results]
        return [ x for x in results]


                               
                               
# def find( qargs, collection = 'thetablocks', limit = 10):
    
#     query = prepare_query( qargs)
#     db = DataBase()

#     hits = db.count( query, collection = collection)
#     print '>>>>>>>>>>>>>> %d <<<<<<<<<<<<<<<<<' % hits
#     if hits > limit:
#         results = db.find( query, collection = collection, limit = limit)
#     else:
#         results = db.find( query, collection = collection)
#     if 'eigenforms' == collection:
#         from eigenform import Eigenform 
#         return [ Eigenform(**x) for x in results] + [query]
#     return [ x for x in results] + [query]

