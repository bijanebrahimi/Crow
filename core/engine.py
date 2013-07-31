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
            user_info = core.SN['sn'].users_show()
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

        try:
            # instance_refresh()
            home_timeline = []
            
            if previous_page == 'true' and core.SN.get('first_id') is not None:
                home_timeline = core.SN['sn'].statuses_home_timeline(max_id=core.SN.get('first_id')-1, count=20, page=1)
                core.SN['first_id'] = int(home_timeline[len(home_timeline)-1]['id'])
                response['previous_page'] = True
            elif core.SN.get('last_id'):
                home_timeline = core.SN['sn'].statuses_home_timeline(since_id=core.SN['last_id'], count=20)
            else:
                home_timeline = core.SN['sn'].statuses_home_timeline(count=20)

            if home_timeline and not response['previous_page']:
                core.SN['last_id'] = int(home_timeline[0]['id'])

            if core.SN.get('first_id') is None:
                core.SN['first_id'] = int(home_timeline[len(home_timeline)-1]['id'])
            response['notices'] = home_timeline
            response['success'] = True
        except:
            response['error'] = 'Failed to get home timeline'
        self.write(json.dumps(response))

class UserRepliesHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'notices': {}, 'previous_page': False, 'error': ''}
        try:
            previous_page = self.get_argument("previous_page")
        except:
            previous_page = None

        try:
            # instance_refresh()
            home_timeline = []
            
            if previous_page == 'true' and core.SN.get('replies_first_id') is not None:
                home_timeline = core.SN['sn'].statuses_replies(max_id=core.SN.get('replies_first_id')-1, count=20, page=1)
                core.SN['replies_first_id'] = int(home_timeline[len(home_timeline)-1]['id'])
                response['previous_page'] = True
            elif core.SN.get('replies_last_id'):
                home_timeline = core.SN['sn'].statuses_replies(since_id=core.SN['replies_last_id'], count=20)
            else:
                home_timeline = core.SN['sn'].statuses_replies(count=20)

            if home_timeline and not response['previous_page']:
                core.SN['replies_last_id'] = int(home_timeline[0]['id'])

            if core.SN.get('replies_first_id') is None:
                core.SN['replies_first_id'] = int(home_timeline[len(home_timeline)-1]['id'])
            response['notices'] = home_timeline
            response['success'] = True
        except:
            response['error'] = 'Failed to get home timeline'
        self.write(json.dumps(response))

class ServerInfoHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'server': {}, 'error': ''}
        try:
            # instance_refresh()
            server_info = {'length_limit': core.SN['sn'].length_limit}
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

