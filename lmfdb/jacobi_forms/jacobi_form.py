# -*- coding: utf-8 -*-
#
# Author: Nils Skoruppa <nils.skoruppa@gmail.com>

from flask import render_template, url_for, request, send_file
import pickle
import urllib
from sage.all_cmdline import *
import os
from lmfdb.base import app
from lmfdb.jacobi_forms import jf_page
from lmfdb.jacobi_forms import jf_logger
import json
import StringIO
import caller
import database_search



@app.route('/JacobiForm/Q')
@app.route('/JacobiForm/Q/')
@app.route('/JacobiForm/Q/<page>')
@app.route('/JacobiForm/Q/<page>/')
def JacobiForm_Q_top_level( page = None):

    bread = [('Jacobi forms', url_for('JacobiForm_Q_top_level'))]        

    # parse the request
    if not page:
        name = request.args.get( 'download')
        if name:
            a,b = name.split('.')
            f = StringIO.StringIO( sample.export( a, b))
            print f.getvalue()
            f.seek(0)
            return send_file( f,
                              attachment_filename = name + '.json',
                              as_attachment = True)
        
        else:
            return prepare_main_page( bread)
    if 'dimensions' == page:
        return prepare_dimensions_page( request.args, bread)
    if 'modules' == page:
        return prepare_modules_page( request.args, bread)
    if 'thetablocks' == page:
        return prepare_thetablocks_page( request.args, bread)
    if 'singular-form' == page:
        return prepare_singular_forms_page( request.args, bread)
    if 'eigenforms' == page:
        return prepare_eigenforms_page( request.args, bread)
    # return an error: better emit a 500    
    info = { 'error': 'Requested page does not exist' }
    return render_template("None.html", **info)



##########################################################
## HOME PAGE OF Jacobi FORMS
##########################################################
def prepare_main_page( bread):

    info = {}
    info['learnmore'] = [
        ('Source of the data', url_for('JacobiForm_Q_top_level', page='jf-source')),
        ('Search for data', url_for('JacobiForm_Q_top_level', page='jf-seach')),
        ('Range of the database', url_for('JacobiForm_Q_top_level', page='jf-db'))
    ]
    return render_template( 'jf-index.html',
                            title='Jacobi Forms',
                            bread=bread,
                            **info)



##########################################################
## DIMENSIONS REQUEST
##########################################################
def prepare_dimensions_page( args, bread):

    info = { 'args': args}
    args = args.get( 'args')

    try:
        nargs = json.loads( args)
        header, table = caller.dimension( nargs)
        info.update( { 'table': table,
                       'table_headers': header,
                       'viewer': 'dimensions/jf-table.html'
                      })
    except Exception as e:
        info.update( {'error': str(e)})    

    bread.append( ('dimensions', 'dimensions'))
    return render_template( "dimensions/jf-dimensions.html",
                            title='Dimensions of spaces of Jacobi forms',
                            bread=bread, **info)



##########################################################
## MODULE REQUEST
##########################################################
def prepare_modules_page( args, bread):
    
    info = { 'args': args}
    args = args.get( 'args')

    try:
        nargs = json.loads( args)
        header, table = caller.module( nargs)
        info.update( { 'table': table,
                       'table_headers': header,
                       'viewer': 'modules/jf-table.html'
        })
    except Exception as e:
        info.update( {'error': str(e)})    
    
    bread.append( ('modules', 'modules'))
    return render_template( "modules/jf-modules.html",
                            title='Modules of Jacobi forms',
                            bread=bread, **info)



##########################################################
## THETABLOCK REQUEST
##########################################################
def prepare_thetablocks_page( args, bread):
   
    info = { 'args': args}
    skip = int(args.get( 'skip', 0))
    args = args.get( 'args')
    
    try:
        query = json.loads( args)
        response = database_search.Response( query, limit = 50, skip = skip)
        info.update( {
            'response' : response,
            'viewer': 'thetablocks/jf-table.html'
        })
    except Exception as e:
        info.update( {'error': '%s' % str(e)})
    
    bread.append( ('Thetablocks', 'Thetablocks'))
    return render_template( "thetablocks/jf-thetablocks.html",
                            title='Theta blocks',
                            bread=bread, **info)

 

##########################################################
## SINGULAR FORM REQUEST
##########################################################
def prepare_singular_forms_page( args, bread):
   
    info = { 'args': args}
    args = args.get( 'args')
    
    bread.append( ('Singular forms', 'Singular forms'))
    return render_template( "singular_forms/jf-singular_forms.html",
                            title='Singular Forms',
                            bread=bread, **info)

 


##########################################################
## EIGENFORM REQUEST
##########################################################
def prepare_eigenforms_page( args, bread):
   
    info = { 'args': args}
    skip = int(args.get( 'skip', 0))
    args = args.get( 'args')

    try:
        query = json.loads( args)
        response = database_search.Response( query, context = 'eigenforms', limit = 2, skip = skip)
        info.update( { 'response': response,
                       'viewer': 'eigenforms/jf-table.html'
        })
        info['friends'] =  [
            ( 'Elliptic modular form', ''), ( 'Number field ', ''), ( 'Ellliptic curve', '')]
    except Exception as e:
        info.update( {'error': '%s' % str(e)})

    bread.append( ('Hecke eigenforms', 'Hecke eigenforms'))
    return render_template( "eigenforms/jf-eigenforms.html",
                            title='Hecke eigenforms',
                            bread=bread, **info)
