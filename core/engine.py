# -*- coding: UTF-8 -*-

# from python
import json
import tornado.web
# import pynotify

# from application
import core
import config
from libs import StatusNet

class UserLoginHandler(tornado.web.RequestHandler):
    def initialize(self):
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
                core.SN['sn'] = StatusNet(config.STATUSNET['api_path'], username, password)
                # core.INSTANCE['username'] = username
                # core.INSTANCE['password'] = password
                self.write(json.dumps({'success': True, 'redirect': '/'}))
        except:
            # TODO: send HTTP Specific Error
            self.write(json.dumps({'success': False, 'error': 'Failed to login'}))

class UserInfoHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'notices': {}, 'error': ''}
        try:
            # instance_refresh()
            # user_info = core.SN['sn'].users_show()
            user_info = {u'status': {u'favorited': False, u'truncated': False, u'statusnet_conversation_id': 1891942, u'text': u'@shabgard \u0627\u0648\u06a9\u06cc. \u0633\u062a \u0645\u06cc\u200c\u06a9\u0646\u0645 \u0627\u06af\u0647 \u06a9\u062a\u0627\u0628\u062e\u0648\u0646\u0647\u200c\u0627\u0634 \u0628\u0648\u062f \u0646\u0648\u062a\u06cc\u0641\u0627\u06cc \u0631\u0648 \u0644\u0648\u062f \u06a9\u0646\u0647 :) \u0645\u06cc\u200c\u062a\u0648\u0646\u06cc \u0645\u0631\u0627\u062d\u0644 \u0646\u0635\u0628 \u062a\u0648 \u0648\u06cc\u0646\u062f\u0648\u0632 \u0631\u0648 \u0645\u0634\u0631\u0648\u062d \u0628\u0647\u0645 \u0628\u0631\u0633\u0648\u0646\u06cc\u061f', u'created_at': u'Tue Jul 30 10:41:36 +0200 2013', u'uri': u'http://quitter.se/notice/2090817', u'statusnet_html': u'@<span class="vcard"><a href="http://quitter.se/user/114760" class="url" title="Alfred Shabgardian"><span class="fn nickname mention">shabgard</span></a></span> \u0627\u0648\u06a9\u06cc. \u0633\u062a \u0645\u06cc\u200c\u06a9\u0646\u0645 \u0627\u06af\u0647 \u06a9\u062a\u0627\u0628\u062e\u0648\u0646\u0647\u200c\u0627\u0634 \u0628\u0648\u062f \u0646\u0648\u062a\u06cc\u0641\u0627\u06cc \u0631\u0648 \u0644\u0648\u062f \u06a9\u0646\u0647 :) \u0645\u06cc\u200c\u062a\u0648\u0646\u06cc \u0645\u0631\u0627\u062d\u0644 \u0646\u0635\u0628 \u062a\u0648 \u0648\u06cc\u0646\u062f\u0648\u0632 \u0631\u0648 \u0645\u0634\u0631\u0648\u062d \u0628\u0647\u0645 \u0628\u0631\u0633\u0648\u0646\u06cc\u061f', u'source': u'Crow', u'in_reply_to_status_id': 2090789, u'in_reply_to_screen_name': u'shabgard', u'in_reply_to_user_id': 114760, u'geo': None, u'id': 2090817}, u'utc_offset': u'7200', u'favourites_count': 70, u'description': u'web developer and a FreeSoftware fan. beware, i may bite', u'friends_count': 58, u'notifications': True, u'url': u'http://RoutinesExcluded.tk/', u'created_at': u'Wed Jul 10 19:32:05 +0200 2013', u'time_zone': u'Europe/Stockholm', u'profile_image_url': u'http://quitter.se/avatar/114757-48-20130710202211.png', u'name': u'bijan ebrahimi', u'statusnet_blocking': False, u'followers_count': 41, u'protected': False, u'location': None, u'following': True, u'statuses_count': 735, u'statusnet_profile_url': u'http://quitter.se/bijan', u'id': 114757, u'screen_name': u'bijan'}
            response['user'] = user_info
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

class UserTimelineHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'user': {}, 'previous_page': False, 'error': ''}
        try:
            previous_page = self.get_argument("previous_page")
        except:
            previous_page = None

        # try:
            # instance_refresh()
        home_timeline = []
        
        if previous_page == 'true':
            print 'paging max_id: ' + str(core.SN.get('first_id'))
            home_timeline = core.SN['sn'].statuses_home_timeline(max_id=core.SN.get('first_id')-1, count=20, page=1)
            core.SN['first_id'] = int(home_timeline[len(home_timeline)-1]['id'])
            response['previous_page'] = True
        elif core.SN.get('last_id'):
            print 'last_id: ' + str(core.SN.get('last_id'))
            home_timeline = core.SN['sn'].statuses_home_timeline(since_id=core.SN['last_id'], count=20)
        else:
            print 'fresh '
            home_timeline = core.SN['sn'].statuses_home_timeline(count=20)

        if home_timeline and not response['previous_page']:
            core.SN['last_id'] = int(home_timeline[0]['id'])
            print 'last_id = ' + str(core.SN['last_id'])

        if core.SN.get('first_id') is None:
            core.SN['first_id'] = int(home_timeline[len(home_timeline)-1]['id'])
            print 'first_id = ' + str(core.SN['first_id'])
        response['notices'] = home_timeline
        response['success'] = True
        print '--------------'
        # except:
            # response['error'] = 'Failed to get home timeline'
        self.write(json.dumps(response))

class ServerInfoHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'server': {}, 'error': ''}
        try:
            # instance_refresh()
            # server_info = {'length_limit': core.SN['sn'].length_limit}
            server_info = {'length_limit': 140}
            response['server'] = server_info
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

class NoticeFavHandler(tornado.web.RequestHandler):
    def post(self):
        response = {'success': False, 'notice': {}, 'error': ''}
        try:
            # instance_refresh()
            notice_id = int(self.get_argument("id"))
            action = self.get_argument("action")
            if action == 'create':
                favorited = core.SN['sn'].favorites_create(id=notice_id)
            else:
                favorited = core.SN['sn'].favorites_destroy(id=notice_id)
            response['notice'] = favorited
            response['success'] = True
        except:
            response['error'] = 'failed to ' + action +' favorite'
        self.write(json.dumps(response))

class NoticeRepeatHandler(tornado.web.RequestHandler):
    def post(self):
        response = {'success': False, 'notice': {}, 'error': ''}
        try:
            # instance_refresh()
            notice_id = self.get_argument("id")
            repeated = core.SN['sn'].statuses_retweet(notice_id, source="Crow")
            response['notice'] = repeated
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

class NoticeSendHandler(tornado.web.RequestHandler):
    def post(self):
        response = {'success': False, 'notice': {}, 'error': ''}
        try:
            # instance_refresh()
            # server_info = {'length_limit': core.SN['sn'].length_limit}
            notice_status = self.get_argument("status")
            notice_id = self.get_argument("id")
            update = core.SN['sn'].statuses_update(notice_status, source='Crow', in_reply_to_status_id=notice_id, long_dent="truncate")
            response['notice'] = update
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

class NoticeConversationHandler(tornado.web.RequestHandler):
    def post(self):
        response = {'success': False, 'notice': {}, 'error': ''}
        try:
            # instance_refresh()
            # server_info = {'length_limit': core.SN['sn'].length_limit}
            import time
            time.sleep(2)
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

class NoticeAttachmentHandler(tornado.web.RequestHandler):
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

class HomeHandler(tornado.web.RequestHandler):
    def get(self):
        content = ''
        if core.SN.get('sn') is None:
            self.redirect("/user/login")
            return True

        try:
            with open(core.SETTINGS['static_path'] + '/html/home.html', 'r') as content_file:
                content = content_file.read()
            self.write(content)
        except:
            # TODO: send HTTP Specific Error
            self.write('home failed')

