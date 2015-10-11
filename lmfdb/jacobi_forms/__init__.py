# -*- coding: utf-8 -*-
from lmfdb.base import app
from lmfdb.utils import make_logger
from flask import Blueprint

jf_page = Blueprint('jacobi_forms', __name__,
                     template_folder='templates', static_folder='static')
jf_logger = make_logger(jf_page)


@jf_page.context_processor
def body_class():
    return {'body_class': 'jacobi_forms'}

from jacobi_form import *

app.register_blueprint(jf_page, url_prefix='/JacobiForm/Q')
