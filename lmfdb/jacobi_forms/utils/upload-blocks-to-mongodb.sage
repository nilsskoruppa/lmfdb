#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# Script for adding Siegel data to Warwicks mongodb
#
# author: Nils Skoruppa <nils.skoruppa@gmail.com>
#
####################################################

import pymongo
import sys
import json

DB_URL = 'mongodb://localhost:40000/'

# Before running this script for uploading to Warwick,
# run the script warwick.py in the top level of lmfdb.
# Then uncomment
# DB_URL = 'mongodb://localhost:37010/'


def upload_to_mongodb( filename, scalar_index = False):
    """
    INPUT
        A path to one of the theta block files in the format
    
            det lattice embedding co-rank min_value

        or, for scalar valued Jacobi forms,

            (embedding,weight,index,character,min_value)
    """
    with open( filename, 'r') as fip:

        try:
            client = pymongo.MongoClient( DB_URL)
            db = client.jacobi_forms
            smpls = db.thetablocks

            ct = 0
            for line in fip:
                if scalar_index == True:
                    e,wt,m,c,v = sage_eval(line)
                    l = [2*m]
                    d = 2*m
                    n = 1
                    e = map( lambda x: [int(x[0]),int(x[1])], e)
                    N = sum( x[1] for x in e)
                else:
                    d,l,e,N,min_val = line.split()
                    l = eval(l)
                    n = len(l)
                    e = map( lambda x:list(x), eval(e))
                    v = sage_eval( min_val)

                r = floor(24*v)
                wt = (N - r)/2
                h = (3*N - r)%24

                sample = { 'lattice': map( lambda x: int(x), l),
                           'det': int(d),
                           'rank': int(n),
                           'weight': str(wt),
                           'fl_weight': float(wt),
                           'char': int(h), 
                           'embedding': e,
                           'co-rank': int(N),
                           'val_min': str(v - r/24),
                           'val_min_fl': float(v - r/24)
                }
                # print json.dumps(sample)
                # The embedding defines the thetablock uniquely
                # smpls.remove({'embedding': e})
                id = smpls.insert( sample)

                ct += 1
                if ct%10000 == 0: print ct
            client.close()
        except:
            client.close()
            print 'Error: %s' % sys.exc_info()
            return

    print '%s: Done' % filename    
    return 0



if __name__ == '__main__':

    import sys
    filename = sys.argv[1]
    try:
        scalar_index = eval(sys.argv[2])
    except:
        scalar_index = False
    upload_to_mongodb( filename, scalar_index = scalar_index)
