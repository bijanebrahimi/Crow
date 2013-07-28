# from python
import os
import tornado.web

# from application
from core import statusnet

# Tornado application setting
SETTINGS = {"static_path": os.path.join(os.path.dirname(__file__) + '/../', "static"),
            "debug": False}

# Tornado application URL
ROUTS = [
    (r"/account/login", statusnet.LoginHandler),
    (r"/account/info", statusnet.InfoHandler),
    
    (r'/', statusnet.HomeHandler),
    (r'/statuses/home', statusnet.HomeHandler),
    (r'/statuses/conversation', statusnet.ConversationHandler),
    (r'/statuses/update', statusnet.UpdateHandler),
    
    (r'/statuses/repeat', statusnet.RepeatHandler),
    (r'/statuses/reply', statusnet.ReplyHandler),
    (r'/statuses/favorite', statusnet.FavoriteHandler),
    
    (r'/attachment/text_html', statusnet.AttachmentHandler),
    
    (r'/plugins/short_url', statusnet.PluginShorturl),
    (r'/plugins/force_rtl', statusnet.PluginForceRTL),
    
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
