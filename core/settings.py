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
import tornado.web

# from application
from core import engine

# Tornado application setting
SETTINGS = {"static_path": os.path.join(os.path.dirname(__file__) + '/../', "static"),
            "debug": False}

# Tornado application URL
ROUTS = [
    (r'/', engine.HomeHandler),
    (r"/user/login", engine.UserLoginHandler),
    (r"/user/info", engine.UserInfoHandler),
    (r"/user/timeline", engine.UserTimelineHandler),
    (r"/user/replies", engine.UserRepliesHandler),
    (r"/user/autocompletion", engine.UserAutocompletionHandler),
    (r"/server/info", engine.ServerInfoHandler),
    (r"/notice/send", engine.NoticeSendHandler),
    (r"/notice/repeat", engine.NoticeRepeatHandler),
    (r"/notice/fav", engine.NoticeFavHandler),
    (r"/notice/attachment", engine.NoticeAttachmentHandler),
    (r"/notice/conversation", engine.NoticeConversationHandler),
    (r"/static/(.*)", engine.StaticFileHandlerCustomized, dict(path=SETTINGS['static_path'])),
]

APPLICATION = {'source': 'Crow'}

SN = {}
