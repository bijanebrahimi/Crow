Crow
====
Crow is a small client for Free and OpenSource microblogging platform, StatusNet.

Version
---------------
0.0.2

Install
---------------

### Requirements?

crow contains a small web server written in *python 2.7+* and the reset is HTML and Javascript.

#### Debian & Ubuntu Friends

        sudo apt-get install python-pip python-notify
        sudo pip install tornado

#### Fedora

        sudo yum install python-pip python-notify
        sudo python-pip install tornado

Run
---------------

download the latest version from [here](https://github.com/bijanebrahimi/Crow)
or clone the code:

        mkdir crow
        cd crow
        git clone git@github.com:bijanebrahimi/Crow.git ./

crows uses html as GUI so you need to run it on your browser. 
first you need to run the server.

        chmod +x run.py
        ./run.py

next, you need to open the URL in you browser. browsers such as `google Chrome` or `firefox`
(`chromium` and `iceweasel` are the Free versions of these browsers) provids possibility to
view a web page in an application mode which is ideal for our job. remember not to close
the server you ran above. in a separated terminal run:

        chromium --app=http://127.0.0.1:8888/
        iceweasel -chrome http://127.0.0.1:8888/

Configuration
---------------

the only configuration available right now is the `api_path` which is necessary for statusnet federal instances.
edit `config.py` and change the api path to your statusnet instance api path.
read [this manual](http://status.net/wiki/API_discovery) to find out what your api path should change to.

        STATUSNET = {'api_path': 'http://quitter.se/api/'}

currently working on
---------------
* show retweets
* favorite button

Todo List
---------------
* follow/unfollow users
* user/group profile view

Known Issues
---------------
this is an alpha version so there are (/should be) a lot of issues but they
needed to be documented. please submitt any issue [here](https://github.com/bijanebrahimi/Crow/issues).

License
---------------
GPL v3.0 or later
