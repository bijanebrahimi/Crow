# from python
import os
import tornado.web

# from application
from core import engine

# Tornado application setting
SETTINGS = {"static_path": os.path.join(os.path.dirname(__file__) + '/../', "static"),
            "debug": True}

# Tornado application URL
ROUTS = [
    (r'/', engine.HomeHandler),
    (r"/user/login", engine.UserLoginHandler),
    (r"/user/info", engine.UserInfoHandler),
    (r"/user/timeline", engine.UserTimelineHandler),
    (r"/user/replies", engine.UserRepliesHandler),
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
