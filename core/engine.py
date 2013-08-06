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
import json
import tornado.web

# from application
import core
import config
from libs import StatusNet

class StaticFileHandlerCustomized(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        self.set_header("Cache-control", "no-cache")

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
            raise tornado.web.HTTPError(404)

    def post(self):
        try:
            if core.SN.get('sn') is not None:
                self.redirect("/")
                return True
            username = self.get_argument("username")
            password = self.get_argument("password")
            if username == '':
                self.write(json.dumps({'success': False, 'error': 'please enter your username'}))
            elif password == '':
                self.write(json.dumps({'success': False, 'error': 'please enter your password'}))
            else:
                core.SN['sn'] = StatusNet(config.API_PATH, username, password)
                # core.INSTANCE['username'] = username
                # core.INSTANCE['password'] = password
                self.write(json.dumps({'success': True, 'redirect': '/'}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to login'}))

class UserInfoHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'notices': {}, 'error': ''}
        try:
            # instance_refresh()
            user_info = core.SN['sn'].users_show()
            core.SN['user_info'] = user_info
            friends = core.SN['sn'].statuses_friends(user_id=user_info['id'])
            core.SN['user_info']['friends'] = []
            for friend in friends:
                core.SN['user_info']['friends'].append({'username': friend['screen_name'], 'name': friend['name'], 'image': friend['profile_image_url']})
            
            groups = core.SN['sn'].statusnet_groups_list()
            for group in groups:
                core.SN['user_info']['friends'].append({'delimiter': '!', 'username': group['nickname'], 'name': group['fullname'], 'image': group['mini_logo']})
            
            response['user'] = core.SN['user_info']
            response['success'] = True
        except:
            response['error'] = 'failed to get info'
        self.write(json.dumps(response))

class UserAutocompletionHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'autocompletion': [], 'error': ''}
        try:
            # instance_refresh()
            friends = core.SN['sn'].statuses_friends()
            for friend in friends:
                response['autocompletion'].append({'username': friend['screen_name'], 'name': friend['name'], 'image': friend['profile_image_url']})
        except:
            pass

        try:
            groups = core.SN['sn'].statusnet_groups_list(count=200)
            for group in groups:
                response['autocompletion'].append({'delimiter': '!', 'username': group['nickname'], 'name': group['fullname'], 'image': group['mini_logo']})
        except:
            pass

        response['success'] = True
        # response['error'] = 'failed to get autocompletion list'
        self.write(json.dumps(response))

class UserTimelineHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'user': {}, 'previous_page': False, 'error': ''}
        try:
            previous_page = self.get_argument("previous_page")
        except:
            previous_page = None

        try:
            fresh_results = self.get_argument("fresh_results")
            core.SN['first_id'] = None
            core.SN['last_id'] = None
        except:
            pass

        notify_enabled = False
        try:
            import pynotify
            notify_enabled = True
        except:
            pass

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

            if notify_enabled and home_timeline:
                if len(home_timeline) < 10:
                    pynotify.init("Crow")
                    notification = None
                    for notice in home_timeline:
                        if notice['user']['id'] == core.SN['user_info']['id']:
                            continue
                        if !config.CRW_NOTIFICATION_PUBLIC and core.SN['user_info']['id'] != notice['in_reply_to_user_id']:
                            continue
                        notification = pynotify.Notification(notice['user']['screen_name'], notice['text'], core.SETTINGS['static_path'] + '/img/favicon.png')

                        if core.SN['user_info']['id'] == notice['in_reply_to_user_id']:
                            notification.set_urgency(pynotify.URGENCY_CRITICAL)
                        notification.show()
                
                
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
            fresh_results = self.get_argument("fresh_results")
            core.SN['replies_first_id'] = None
            core.SN['replies_last_id'] = None
        except:
            pass

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
            repeated = core.SN['sn'].statuses_retweet(notice_id, source=core.APPLICATION['source'])
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
            update = core.SN['sn'].statuses_update(notice_status, source=core.APPLICATION['source'], in_reply_to_status_id=notice_id, long_dent="truncate")
            response['notice'] = update
            response['success'] = True
        except:
            response['error'] = 'failed to send status'
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
        else:
            try:
                with open(core.SETTINGS['static_path'] + '/html/home.html', 'r') as content_file:
                    content = content_file.read()
                self.write(content)
            except:
                raise tornado.web.HTTPError(404)

