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
    
    # (r'/', statusnet.HomeHandler),
    # (r'/statuses/conversation', statusnet.ConversationHandler),
    # (r'/statuses/update', statusnet.UpdateHandler),
    # 
    # (r'/statuses/repeat', statusnet.RepeatHandler),
    # (r'/statuses/reply', statusnet.ReplyHandler),
    # (r'/statuses/favorite', statusnet.FavoriteHandler),
    # 
    # (r'/statuses/read', statusnet.ReadHandler),
    # 
    # (r'/attachment/text_html', statusnet.AttachmentHandler),
    # 
    # (r'/plugins/short_url', statusnet.PluginShorturl),
    # (r'/plugins/force_rtl', statusnet.PluginForceRTL),
    
    (r"/static/(.*)", tornado.web.StaticFileHandler, dict(path=SETTINGS['static_path'])),
]

APPLICATION = {'source': 'Crow'}

INSTANCE = {'conn': None,
            'username': '',
            'password': '',
            'history': {'home_timeline': {'last_id': None,
                                           'first_id': None},
                         'info': {'user': {},
                                  'server': {}},
                         'notices': []}}

SN = {}
