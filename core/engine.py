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
import re
import json
import urllib
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
                core.SN['username'] = username
                # core.INSTANCE['password'] = password
                self.write(json.dumps({'success': True, 'redirect': '/'}))
        except:
            self.write(json.dumps({'success': False, 'error': 'Failed to login'}))

class UserInfoHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'user': {}, 'error': ''}
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
        self.write(json.dumps(response))

class NoticeHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'notices': {}, 'olders': False, 'error': ''}
        MAX_NOTICES = 20
        sn = core.SN['sn']
        params = dict(count=MAX_NOTICES)

        notify_enabled = False
        try:
            import pynotify
            notify_enabled = True
        except:
            pass
        try:
            response['olders'] = self.get_argument("olders") == 'true'
        except:
            response['olders'] = False
        try:
            req_type = self.get_argument("type")
        except:
            req_type = 'home'
        try:
            req_value = self.get_argument("value")
        except:
            req_value = None
        try:
            req_first = int(self.get_argument("first_id"))
        except:
            req_first = None
        try:
            req_last = int(self.get_argument("last_id"))
        except:
            req_last = None
        
        try:
            if req_type == 'home':
                if response['olders'] == True and req_first:
                    home_timeline = sn.statuses_home_timeline(max_id=req_first, count=MAX_NOTICES)
                elif req_last:
                    home_timeline = sn.statuses_home_timeline(since_id=req_last, count=MAX_NOTICES)
                else:
                    home_timeline = sn.statuses_home_timeline(count=MAX_NOTICES)
            elif req_type == 'replies':
                if response['olders'] == True and req_first:
                    home_timeline = sn.statuses_replies(max_id=req_first, count=MAX_NOTICES)
                elif req_last:
                    home_timeline = sn.statuses_replies(since_id=req_last, count=MAX_NOTICES)
                else:
                    home_timeline = sn.statuses_replies(count=MAX_NOTICES)
            elif req_type == 'public':
                # TODO: implement public timeline
                if response['olders'] == True and req_first:
                    home_timeline = sn.statuses_public_timeline(max_id=req_first, count=MAX_NOTICES)
                elif req_last:
                    home_timeline = sn.statuses_public_timeline(since_id=req_last, count=MAX_NOTICES)
                else:
                    home_timeline = sn.statuses_public_timeline(count=MAX_NOTICES)
                pass
            elif req_type == 'group':
                if req_value.isdigit():
                    params['group_id'] = int(req_value)
                elif len(req_value) > 0:
                    params['nickname'] = req_value
                if response['olders'] == True and req_first:
                    params['max_id'] = req_first
                elif req_last:
                    params['since_id'] = req_last
                home_timeline = sn.statusnet_groups_timeline(**params)
            else:
                # That would be `profile`
                if req_value.isdigit():
                    params['user_id'] = int(req_value)
                elif len(req_value) > 0:
                    params['screen_name'] = req_value
                if response['olders'] == True and req_first:
                    params['max_id'] = req_first
                elif req_last:
                    params['since_id'] = req_last
                home_timeline = sn.statuses_user_timeline(**params)

            if response['olders'] == False and notify_enabled and home_timeline:
                pynotify.init("Crow")
                notification = None
                notification_count = 0
                for notice in home_timeline:
                    if core.SN.get('notified') is None:
                        core.SN['notified'] = []
                    if notice['id'] in core.SN['notified']:
                        # Skipped already notified notices
                        continue
                    notification = pynotify.Notification(notice['user']['screen_name'], notice['text'], core.SETTINGS['static_path'] + '/img/favicon.png')
                    # if core.SN['user_info'] and core.SN.get['user_info']['id'] == notice['in_reply_to_user_id']:
                        # notification.set_urgency(pynotify.URGENCY_CRITICAL)
                    # el
                    if re.search('(\W|^)(@%s)(\W|$)' % core.SN['username'], notice['text']):
                        notification.set_urgency(pynotify.URGENCY_CRITICAL)
                    elif config.CRW_NOTIFY_PUBLICS == False:
                        continue
                    if config.CRW_NOTIFY_MAXIMUM == 0 or notification_count <= config.CRW_NOTIFY_MAXIMUM:
                        notification.show()
                        notification_count += 1
                    core.SN['notified'].append(notice['id'])
                        
            response['success'] = True
            response['notices'] = home_timeline
        except Exception as e:
            response['error'] = '%s' % e.message
        self.write(json.dumps(response))

class ServerInfoHandler(tornado.web.RequestHandler):
    def get(self):
        response = {'success': False, 'server': {}, 'error': ''}
        try:
            # instance_refresh()
            server_info = {'length_limit': core.SN['sn'].length_limit,
                           'triggered_text': ['@%s' % core.SN['username']]}
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
        response = {'success': False, 'notices': {}, 'error': ''}
        try:
            # instance_refresh()
            conversation_id = self.get_argument("conversation_id")
            conversation = core.SN['sn'].statusnet_conversation(id=conversation_id)
            response['success'] = True
            response['notices'] = conversation
        except:
            response['error'] = 'failed to get conversation'
        self.write(json.dumps(response))

class NoticeAttachmentHandler(tornado.web.RequestHandler):
    def post(self):
        response = {'success': False, 'content': '', 'error': ''}
        try:
            import urllib
            import re
            url = self.get_argument("url")
            type = self.get_argument("type")
            html = urllib.urlopen(url).read()
            if type == 'attachment':
                body = re.search(r"<body>(.*)</body>", html).groups()[0]
            else:
                body = re.search("entry-content\">(.*)\s*</div>", html).groups()[0]
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

class CheckUpdate(tornado.web.RequestHandler):
    def get(self):
        try:
            version = urllib.urlopen(config.CRW_UPSTREAM_VERSION).read()
        except:
            version = "{'success': false}"
        self.write(version)
