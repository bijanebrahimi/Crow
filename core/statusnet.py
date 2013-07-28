# -*- coding: UTF-8 -*-

# from python
import json
import tornado.web
import pynotify

# from application
import core
import config
from libs import StatusNet

CACHE = {'instance': None, 'notices':[], 'last_id': None, 'first_id': None}

def instance_refresh():
    if CACHE['instance'] is None:
        print 'AUTHENTICATING ...'
        CACHE['instance'] = StatusNet(config.STATUSNET['api_path'],
                                          core.INSTANCE['username'],
                                          core.INSTANCE['password'])
        print 'AUTHENTICATED'

def is_rtl(status):
    if status is None:
        return False
    if  status[0] == u'\u202b':
        return True
    import unicodedata
    ltr_chars = 0
    rtl_chars = 0
    for ch in status:
        ch_code = unicodedata.bidirectional(ch)
        if ch_code in ['L', 'LRO', 'LRE']:
            ltr_chars += 1
        elif ch_code in ['R', 'AL', 'RLO', 'RLE']:
            rtl_chars += 1
    return rtl_chars > ltr_chars

def parse_notices(notices):
    tmp_notices = []
    for notice in notices:
        notice['is_rtl'] = is_rtl(notice['text'])
        if notice.get('read') is None:
            notice['read'] = False
        tmp_notices.append(notice)
    return tmp_notices


class LoginHandler(tornado.web.RequestHandler):
    def initialize(self):
        # self.static_path = core.SETTINGS['static_path']
        # self.api_path = core.SETTINGS['api_path']
        pass

    def get(self):
        content = ''
        try:
            with open(core.SETTINGS['static_path'] + '/html/login.html', 'r') as content_file:
                content = content_file.read()
            self.write(content)
        except:
            # TODO: send HTTP Specific Error
            self.write('failed')

    def post(self):
        try:
            username = self.get_argument("username")
            password = self.get_argument("password")
            if username == '':
                self.write(json.dumps({'success': False, 'error': 'please enter your username'}))
            elif password == '':
                self.write(json.dumps({'success': False, 'error': 'please enter your password'}))
            else:
                CACHE['instance'] = StatusNet(config.STATUSNET['api_path'], username, password)
                core.INSTANCE['username'] = username
                core.INSTANCE['password'] = password
                self.write(json.dumps({'success': True, 'redirect': '/statuses/home'}))
        except:
            # TODO: send HTTP Specific Error
            self.write(json.dumps({'success': False, 'error': 'Failed to login'}))

class InfoHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def post(self):
        response = {'success': False, 'user': {}, 'server': {}, 'notices':{}, 'error': ''}
        try:
            if core.INSTANCE['history']['info']['user'] != {}:
                response['user'] = core.INSTANCE['history']['info']['user']
                response['server'] = core.INSTANCE['history']['info']['server']
            else:
                instance_refresh()
                user_info = CACHE['instance'].users_show()
            
                core.INSTANCE['history']['info']['user']['id'] = user_info['id']
                core.INSTANCE['history']['info']['user']['avatar'] = user_info['profile_image_url']
                core.INSTANCE['history']['info']['user']['nickname'] = user_info['screen_name']
                core.INSTANCE['history']['info']['user']['name'] = user_info['name']
                core.INSTANCE['history']['info']['user']['utc_offset'] = user_info['utc_offset']
                core.INSTANCE['history']['info']['user']['profile_url'] = user_info['statusnet_profile_url']
                core.INSTANCE['history']['info']['user']['friends'] = CACHE['instance'].statuses_friends(user_id=core.INSTANCE['history']['info']['user']['id'])
                core.INSTANCE['history']['info']['server']['length_limit'] = CACHE['instance'].length_limit
                
                response['user'] = core.INSTANCE['history']['info']['user']
                response['server'] = core.INSTANCE['history']['info']['server']
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

    def get(self):
        pass

# Plugins
class PluginShorturl(tornado.web.RequestHandler):
    def initialize(self):
        self.api_path = "http://tinyurl.com/api-create.php?url=%s"
        self.min_length = 15

    def replace_url(self, matched):
        link = matched.groups()[0]
        if len(link) <= self.min_length:
            return link
        import urllib
        short_url = urllib.urlopen(self.api_path % link).read()
        if len(short_url) < len(link):
            return short_url
        return link

    def get(self):
        pass

    def post(self):
        try:
            import re
            status = self.get_argument("status")
            
            status = re.sub(r"((ht|f)tps?://[^ ]+)", self.replace_url, status)
            self.write(json.dumps({'success': True, 'status': status}))
        except:
            self.write(json.dumps({'success': False, 'error': 'failed to shorten url'}))

class PluginForceRTL(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def force_rtl(self, status):
        # TODO: do if only it's not there
        if status[0] != u"\u202b":
            status = u"\u202b" + status
        return status

    def force_ltr(self, status):
        import re
        return re.sub(ur"(^[\u202b]*)", "", status)

    def get(self):
        pass

    def post(self):
        response = {'success': False, 'rtl': False, 'status': None}
        try:
            status = self.get_argument("status")
            response['rtl'] = is_rtl(status)
            if response['rtl']:
                response['status'] = self.force_rtl(status)
            else:
                response['status'] = self.force_ltr(status)
            response['success'] = True
            self.write(json.dumps(response))
        except:
            self.write(json.dumps({'success': False, 'error': 'failed to shorten url'}))


# Conversation
class ConversationHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def post(self):
        response = {'success': False, 'conversation': [], 'error': ''}
        try:
            instance_refresh()
            conversation = self.get_argument("conversation")
            response['conversation'] = parse_notices(CACHE['instance'].statusnet_conversation(conversation))
            tmp = CACHE['notices'] + response['conversation']
            CACHE['notices'] = sorted(tmp, key=lambda k: k['id'], reverse=True)
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

    def get(self):
        pass

class AttachmentHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def post(self):
        response = {'success': False, 'content': '', 'error': ''}
        try:
            import urllib
            import re
            url = self.get_argument("url")
            html = urllib.urlopen(url).read()
            body = re.search(r"<body>(.*)</body>", html).groups()[0]
            response['content'] = body
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

    def get(self):
        pass


# Pages
class HomeHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def get(self):
        content = ''
        if CACHE['instance'] is None:
            self.redirect("/account/login")
            return True

        try:
            with open(core.SETTINGS['static_path'] + '/html/home.html', 'r') as content_file:
                content = content_file.read()
            self.write(content)
        except:
            # TODO: send HTTP Specific Error
            self.write('home failed')
    
    def post(self):
        global CACHE
        try:
            event = self.get_argument("event")
            instance_refresh()
            home_timeline = []
            
            if CACHE['last_id']:
                if event == 'refresh' and CACHE['notices']:
                    home_timeline = CACHE['notices']
                else:
                    home_timeline = CACHE['instance'].statuses_home_timeline(since_id=CACHE['last_id'])
                    tmp = home_timeline + CACHE['notices']
                    CACHE['notices'] = sorted(tmp, key=lambda k: k['id'], reverse=True)
            else:
                home_timeline = CACHE['instance'].statuses_home_timeline(count=40)
                CACHE['notices'] = home_timeline

            if home_timeline:
                CACHE['last_id'] = home_timeline[0]['id']
                if len(home_timeline) < 10:
                    pynotify.init("Crow")
                    notification = None
                    for notice in home_timeline:
                        notification = pynotify.Notification(notice['user']['screen_name'], notice['text'], core.SETTINGS['static_path'] + '/img/favicon.png')
                        if notice['text'] and notification:
                            if core.INSTANCE['history']['info']['user']['id'] == notice['in_reply_to_user_id']:
                                notification.set_urgency(pynotify.URGENCY_CRITICAL)
                            # TODO: prevent from notification flooding
                            notification.show()


            CACHE['notices'] = parse_notices(CACHE['notices'])
            if CACHE['first_id'] is None:
                CACHE['first_id'] = home_timeline[len(home_timeline)-1]['id']

            self.write(json.dumps({'success': True, 'home_timeline': parse_notices(home_timeline)}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to get home timeline'}))

# Status
class UpdateHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def get(self):
        pass
    
    def post(self):
        status = self.get_argument("status")
        try:
            instance_refresh()
            status_update = CACHE['instance'].statuses_update(status, source=core.APPLICATION['source'], in_reply_to_status_id=0, latitude=-200, longitude=-200, place_id="", display_coordinates=False, long_dent="split", dup_first_word=False)
            self.write(json.dumps({'success': True, 'notice': parse_notices([status_update])}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to update the status'}))

class RepeatHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def get(self):
        pass
    
    def post(self):
        try:
            # FIXME: status is not necessary
            # status = self.get_argument("status")
            notice = self.get_argument("notice")
            instance_refresh()
            status_repeat = CACHE['instance'].statuses_retweet(notice, source=core.APPLICATION['source'])
            self.write(json.dumps({'success': True, 'notice': parse_notices([status_repeat])}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to repeat status'}))

class ReplyHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def get(self):
        pass
    
    def post(self):
        try:
            # FIXME: status is not necessary
            status = self.get_argument("status")
            notice = self.get_argument("notice")
            instance_refresh()
            status_reply = CACHE['instance'].statuses_update(status, source="Crow", in_reply_to_status_id=notice, latitude=-200, longitude=-200, place_id="", display_coordinates=False, long_dent="split", dup_first_word=False)
            self.write(json.dumps({'success': True, 'notice': parse_notices([status_reply])}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to reply to status'}))

class FavoriteHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def get(self):
        pass
    
    def post(self):
        try:
            notice_id = int(self.get_argument("notice"))
            action = self.get_argument("action")
            instance_refresh()
            if action == 'create':
                favorited = CACHE['instance'].favorites_create(id=notice_id)
            else:
                favorited = CACHE['instance'].favorites_destroy(id=notice_id)
            # Update the cache
            tmp_notices = []
            for notice in CACHE['notices']:
                if notice['id'] == notice_id:
                    tmp_notices.append(favorited)
                else:
                    tmp_notices.append(notice)
            CACHE['notices'] = tmp_notices
            self.write(json.dumps({'success': True, 'notice': parse_notices([favorited])}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to favorite the notice'}))

class ReadHandler(tornado.web.RequestHandler):
    def initialize(self):
        pass

    def get(self):
        pass
    
    def post(self):
        try:
            notice_id = int(self.get_argument("notice"))
            tmp_notices = []
            for notice in CACHE['notices']:
                if notice['id'] == notice_id:
                    notice['read'] = True
                    tmp_notices.append(notice)
                else:
                    tmp_notices.append(notice)
            CACHE['notices'] = tmp_notices
            self.write(json.dumps({'success': True, 'notice_id': notice_id}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to flag notice as read'}))
