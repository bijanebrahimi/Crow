#!/usr/bin/python
# -*- coding: UTF-8 -*-

# from python
import os
import tornado.ioloop

# from application
from core import ROUTS, SETTINGS

if __name__ == "__main__":
    app = tornado.web.Application(ROUTS, **SETTINGS)
    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
