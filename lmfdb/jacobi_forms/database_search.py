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
            return [ Eigenform(**x) for x in results]
        return [ x for x in results]




"""    
def ObjectId( s):
    return s


entry = { "_id" : ObjectId("56fc0ae39d1fa26c05330b90"), "newform_label" : "37.2.1.a", "newform_weight" : 2, "newform_level" : 37, "newform_sign" : -1, "modular_symbol" : "(1,23)", "modular_symbol_base_ring_minpol" : "", "hecke_eigenvalues" : [ "-2", "-3", "-2", "-1", "-5", "-2", "0", "0", "2", "6", "-4", "-1", "-9", "2", "-9", "1", "8", "-8", "8", "9", "-1", "4", "-15", "4", "4" ], "atkin_lehner_eigenvalues" : { "37" : 1 }, "is_holomorphic" : true, "weight" : "2", "fl_weight" : 2, "lattice" : [ 74 ], "rank" : 1, "coefficients" : { "(-75, 43)" : -1, "(-247, 7)" : -4, "(-447, 21)" : 1, "(-40, 16)" : 2, "(-419, 5)" : 3, "(-336, 58)" : 2, "(-11, 27)" : 1, "(-3, 21)" : 1, "(-160, 32)" : -4, "(-391, 41)" : 0, "(-248, 14)" : 0, "(-12, 42)" : -1, "(-443, 73)" : -1, "(-396, 60)" : 4, "(-139, 3)" : 0, "(-260, 6)" : 2, "(-299, 53)" : -2, "(-444, 0)" : -6, "(-176, 34)" : 0, "(-255, 39)" : 0, "(-28, 34)" : 3, "(-27, 11)" : -3, "(-215, 65)" : 0, "(-184, 36)" : 0, "(-408, 6)" : 4, "(-303, 57)" : -1, "(-11, 47)" : 1, "(-284, 30)" : -3, "(-112, 68)" : -4, "(-223, 43)" : -3, "(-432, 30)" : 0, "(-472, 40)" : -2, "(-243, 41)" : 6, "(-456, 32)" : -2, "(-75, 31)" : -1, "(-175, 63)" : 1, "(-308, 42)" : 1, "(-115, 25)" : -6, "(-115, 49)" : -6, "(-152, 12)" : -2, "(-84, 66)" : -1, "(-212, 26)" : 3, "(-215, 9)" : 0, "(-211, 23)" : 3, "(-7, 57)" : -1, "(-360, 48)" : -4, "(-71, 59)" : 1, "(-27, 63)" : -3, "(-104, 28)" : 0, "(-83, 19)" : -1, "(-480, 38)" : 4, "(-152, 62)" : -2, "(-403, 39)" : -6, "(-175, 11)" : 1, "(-48, 10)" : 0, "(-120, 18)" : -2, "(-260, 68)" : 2, "(-491, 29)" : -2, "(-151, 53)" : -2, "(-303, 17)" : -1, "(-155, 57)" : 2, "(-344, 64)" : 0, "(-123, 69)" : 3, "(-195, 29)" : 2, "(-488, 54)" : -2, "(-287, 71)" : -1, "(-95, 41)" : 0, "(-443, 1)" : -1, "(-367, 59)" : -2, "(-271, 69)" : -1, "(-67, 9)" : 6, "(-287, 3)" : -1, "(-247, 67)" : -4, "(-416, 56)" : 0, "(-127, 61)" : 1, "(-428, 4)" : 0, "(-371, 43)" : -1, "(-491, 45)" : -2, "(-159, 47)" : 1, "(-212, 48)" : 3, "(-423, 61)" : 4, "(-28, 40)" : 3, "(-492, 10)" : -3, "(-404, 52)" : -1, "(-123, 5)" : 3, "(-139, 71)" : 0, "(-292, 2)" : 1, "(-323, 63)" : -2, "(-147, 1)" : -2, "(-332, 38)" : 1, "(-432, 44)" : 0, "(-451, 57)" : -5, "(-340, 20)" : 4, "(-460, 24)" : 6, "(-307, 47)" : 5, "(-159, 27)" : 1, "(-268, 56)" : -6, "(-308, 32)" : 1, "(-63, 23)" : 2, "(-231, 55)" : -1, "(-188, 16)" : 3, "(-155, 17)" : 2, "(-107, 35)" : 0, "(-164, 50)" : -1, "(-219, 59)" : 1, "(-84, 8)" : -1, "(-359, 23)" : -1, "(-359, 51)" : -1, "(-451, 17)" : -5, "(-275, 61)" : -3, "(-312, 24)" : -4, "(-164, 24)" : -1, "(-120, 56)" : -2, "(-67, 65)" : 6, "(-408, 68)" : 4, "(-428, 70)" : 0, "(-312, 50)" : -4, "(-300, 62)" : 1, "(-471, 11)" : 1, "(-460, 50)" : 6, "(-268, 18)" : -6, "(-380, 8)" : 0, "(-407, 37)" : 2, "(-395, 7)" : 2, "(-416, 18)" : 0, "(-48, 64)" : 0, "(-440, 2)" : -2, "(-292, 72)" : 1, "(-456, 42)" : -2, "(-271, 5)" : -1, "(-151, 21)" : -2, "(-480, 36)" : 4, "(-136, 44)" : 4, "(-404, 22)" : -1, "(-275, 13)" : -3, "(-371, 31)" : -1, "(-299, 21)" : -2, "(-259, 37)" : -6, "(-160, 42)" : -4, "(-492, 64)" : -3, "(-3, 53)" : 1, "(-391, 33)" : 0, "(-188, 58)" : 3, "(-136, 30)" : 4, "(-336, 16)" : 2, "(-63, 51)" : 2, "(-99, 67)" : -4, "(-307, 27)" : 5, "(-127, 13)" : 1, "(-455, 27)" : 2, "(-231, 19)" : -1, "(-367, 15)" : -2, "(-323, 11)" : -2, "(-192, 20)" : 2, "(-255, 35)" : 0, "(-111, 37)" : 2, "(-263, 49)" : 1, "(-455, 47)" : 2, "(-332, 36)" : 1, "(-363, 65)" : -4, "(-47, 29)" : -1, "(-295, 73)" : 4, "(-380, 66)" : 0, "(-423, 13)" : 4, "(-195, 45)" : 2, "(-411, 49)" : -2, "(-448, 62)" : 2, "(-108, 22)" : 3, "(-295, 1)" : 4, "(-248, 60)" : 0, "(-83, 55)" : -1, "(-147, 73)" : -2, "(-471, 63)" : 1, "(-95, 33)" : 0, "(-379, 55)" : 7, "(-343, 45)" : 1, "(-395, 67)" : 2, "(-403, 35)" : -6, "(-411, 25)" : -2, "(-132, 4)" : 3, "(-440, 72)" : -2, "(-263, 25)" : 1, "(-99, 7)" : -4, "(-252, 28)" : -6, "(-280, 70)" : -6, "(-71, 15)" : 1, "(-44, 20)" : -1, "(-344, 10)" : 0, "(-340, 54)" : 4, "(-7, 17)" : -1, "(-176, 40)" : 0, "(-435, 3)" : 2, "(-132, 70)" : 3, "(-148, 0)" : -6, "(-396, 14)" : 4, "(-296, 0)" : 0, "(-223, 31)" : -3, "(-12, 32)" : -1, "(-363, 9)" : -4, "(-47, 45)" : -1, "(-300, 12)" : 1, "(-44, 54)" : -1, "(-280, 4)" : -6, "(-284, 44)" : -3, "(-104, 46)" : 0, "(-112, 6)" : -4, "(-107, 39)" : 0, "(-419, 69)" : 3, "(-211, 51)" : 3, "(-40, 58)" : 2, "(-343, 29)" : 1, "(-252, 46)" : -6, "(-435, 71)" : 2, "(-192, 54)" : 2, "(-232, 66)" : 6, "(-243, 33)" : 6, "(-360, 26)" : -4, "(-472, 34)" : -2, "(-232, 8)" : 6, "(-448, 12)" : 2, "(-184, 38)" : 0, "(-447, 53)" : 1, "(-488, 20)" : -2, "(-379, 19)" : 7, "(-219, 15)" : 1, "(-108, 52)" : 3 }, "admissable_pairs" : [ [ -4, 12 ], [ -7, 17 ] ] }
"""

class Eigenform (object):
    
    def __init__( self, **db_entry):
        # self.__dict__.update( db_entry)
        d = dict( ('_'+it, db_entry[it]) for it in db_entry)
        print d
        self.__dict__.update( d)
        
    def weight( self):
        return int( self._weight)

    def index( self):
        return int( self._lattice[0])//2

    def coefficients( self):
        d = self._coefficients
        return dict( (eval(k), d[k]) for k in d)

    def eigenvalues_( self):
        pass

    def type( self):
        return 'holomorphic' if self._is_holomorphic else 'skew_holomorphic'

    def field( self):
        if '' == self._modular_symbol_base_ring_minpol:
            return '\Q'
        else:
            return 'Q(a) where %s' % self._modular_symbol_base_ring_minpol

    def label( self):
        return 'jf-' + self._newform_label
