# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

import pymongo

DB = None
# DB_URL = 'mongodb://localhost:40000/'
    
class DataBase():
    """
    DB_URL = 'mongodb://localhost:40000/'
    """
    def __init__( self, DB_URL = None):
        if DB_URL:
            self.__client = pymongo.MongoClient( DB_URL)
        else:
            import lmfdb.base
            self.__client = lmfdb.base.getDBConnection()
        self.__db = self.__client.jacobi_forms
        
    def find_one( self, *dct, **kwargs):
        collection = kwargs.get( 'collection', 'samples')
        col = self.__db[collection]
        return col.find_one( *dct)

    def find( self, *dct, **kwargs):
        collection = kwargs.get( 'collection', 'samples')
        col = self.__db[collection]
        return col.find( *dct)

    def __del__( self):
        self.__client.close()
