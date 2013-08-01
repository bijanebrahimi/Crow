#!/usr/bin/env python2
# -*- coding: UTF-8 -*-

# from python
import os
import tornado.ioloop

# from application
from core import ROUTS, SETTINGS

if __name__ == "__main__":
    app = tornado.web.Application(ROUTS, **SETTINGS)
    app.listen(8888)
    print 'plese open http://127.0.0.1:8888/ in your browser'
    tornado.ioloop.IOLoop.instance().start()
