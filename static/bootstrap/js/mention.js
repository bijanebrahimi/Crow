// This file is part of Crow.
// Copyright (C) 2013 Bijan Ebrahimi <bijanebrahimi@lavabit.com>
// added optional delimiter value to user's list
// 
// Crow is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Crow is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Crow.  If not, see <http://www.gnu.org/licenses/>.
// 
// 
// Original License
// Copyright (c) 2013 Jacob Kelley
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

;(function($) {
    $.fn.extend({
        mention: function(options) {
            this.opts = {
                users: [],
                delimiter: '@',
                sensitive: true,
                emptyQuery: false,
                key: 'screen_name',
                name: 'name',
                image: 'image',
                queryBy: [],
                
                typeaheadOpts: {}
            };

            var settings = $.extend({}, this.opts, options),
                _checkDependencies = function() {
                    if (typeof $ == 'undefined') {
                        throw new Error("jQuery is Required");
                    }
                    else {
                        if (typeof $.fn.typeahead == 'undefined') {
                            throw new Error("Typeahead is Required");
                        }
                    }
                    return true;
                },
                _extractCurrentQuery = function(query, caratPos) {
                    var i;
                    for (i = caratPos; i >= 0; i--) {
                        if (query[i] == settings.delimiter) {
                            break;
                        }
                    }
                    return query.substring(i, caratPos);
                },
                _matcher = function(itemProps) {
                    var i;
                    if(settings.emptyQuery){
	                    var q = (this.query.toLowerCase()),
	                    	caratPos = this.$element[0].selectionStart,
	                    	lastChar = q.slice(caratPos-1,caratPos),
                            current_delimiter = (itemProps['delimiter'] ? itemProps['delimiter'] : settings.delimiter);
                        if(lastChar==current_delimiter){
		                    if(!q.match(new RegExp(current_delimiter + itemProps[settings.key], 'g')))
                                return true;
	                    }
                    }
                    
                    if(!settings.queryBy.length)
                        settings.queryBy = [settings.key, settings.name]
                    for (i in settings.queryBy) {
                        if (itemProps[settings.queryBy[i]]) {
                            var item = itemProps[settings.queryBy[i]].toLowerCase(),
                                usernames = (this.query.toLowerCase()).match(new RegExp((itemProps['delimiter'] ? itemProps['delimiter'] : settings.delimiter) + '\\w+', "g")),
                                j;
                            if ( !! usernames) {
                                for (j = 0; j < usernames.length; j++) {
                                    var username = (usernames[j].substring(1)).toLowerCase(),
                                        re = new RegExp((itemProps['delimiter'] ? itemProps['delimiter'] : settings.delimiter) + item, "g"),
                                        used = ((this.query.toLowerCase()).match(re));
                                    if (item.indexOf(username) != -1 && used === null) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                },
                _updater = function(item, delimiter) {
                    var data = this.query,
                        caratPos = this.$element[0].selectionStart,
                        i;
                    
                    for (i = caratPos; i >= 0; i--) {
                        if (data[i] == delimiter) {
                            break;
                        }
                    }
                    var replace = data.substring(i, caratPos),
                    	textBefore = data.substring(0, i),
                    	textAfter = data.substring(caratPos),
                    	data = textBefore + delimiter + item + textAfter;
                    	
                    this.tempQuery = data;

                    return data;
                },
                _sorter = function(items) {
                    if (items.length && settings.sensitive) {
                        var currentUser = _extractCurrentQuery(this.query, this.$element[0].selectionStart).substring(1),
                            i, len = items.length,
                            priorities = {
                                highest: [],
                                high: [],
                                med: [],
                                low: []
                            }, finals = [];
                        if (currentUser.length == 1) {
                            for (i = 0; i < len; i++) {
                                var currentRes = items[i];

                                if ((currentRes[settings.key][0] == currentUser)) {
                                    priorities.highest.push(currentRes);
                                }
                                else if ((currentRes[settings.key][0].toLowerCase() == currentUser.toLowerCase())) {
                                    priorities.high.push(currentRes);
                                }
                                else if (currentRes[settings.key].indexOf(currentUser) != -1) {
                                    priorities.med.push(currentRes);
                                }
                                else {
                                    priorities.low.push(currentRes);
                                }
                            }
                            for (i in priorities) {
                                var j;
                                for (j in priorities[i]) {
                                    finals.push(priorities[i][j]);
                                }
                            }
                            return finals;
                        }
                    }
                    return items;
                },
                _render = function(items) {
                    var that = this;
                    items = $(items).map(function(i, item) {

                        i = $(that.options.item).attr('data-value', item[settings.key]);

                        var _linkHtml = $('<div />');

                        if (item[settings.image]) {
                            _linkHtml.append('<img class="mention_image" src="' + item[settings.image] + '">');
                        }
                        if (item[settings.name]) {
                            _linkHtml.append('<b class="mention_name">' + item[settings.name] + '</b>');
                        }
                        if (item[settings.key]) {
                            _linkHtml.append('<span class="mention_username"> ' + (item['delimiter'] ? item['delimiter'] : settings.delimiter) + item[settings.key] + '</span>');
                        }
                        i.find('a').attr('data-delimiter', (item['delimiter'] ? item['delimiter'] : settings.delimiter)).html(that.highlighter(_linkHtml.html()));
                        return i[0];
                    });
                    items.first().addClass('active');
                    this.$menu.html(items);
                    return this;
                };

            $.fn.typeahead.Constructor.prototype.render = _render;

            return this.each(function() {
                var _this = $(this);
                if (_checkDependencies()) {
                    _this.typeahead($.extend({
                        source: settings.users,
                        matcher: _matcher,
                        updater: _updater,
                        sorter: _sorter
                    }, settings.typeaheadOpts));
                }
            });
        }
    });
})(jQuery);
