#!/usr/bin/env python2.7
# -*- coding: UTF-8 -*-
# This file is part of Crow.
# Copyright (C) 2013 Bijan Ebrahimi <bijanebrahimi@lavabit.com>
# 
# Crow is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Crow is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with Crow.  If not, see <http://www.gnu.org/licenses/>.


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
