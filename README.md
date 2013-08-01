Crow
====
Crow is a small client for the Free and OpenSource microblogging platform, StatusNet.
Also you can read the Crow page at my blog [here](http://routinesexcluded.tk/crow.html).

Current Version
---------------
0.0.4

Install
---------------

### Requirements?

Crow contains a small web server written in *python 2.7+* and the rest is HTML and Javascript.

#### Debian & Ubuntu Friends

        sudo apt-get install python-pip python-notify
        sudo pip install tornado

#### Fedora

        sudo yum install python-pip python-notify
        sudo python-pip install tornado

* installing `python-notify` is optional since it only gets loaded when available

Run
---------------

Download the latest version from [here](https://github.com/bijanebrahimi/Crow)
or clone the code:

        mkdir crow
        cd crow
        git clone git@github.com:bijanebrahimi/Crow.git ./

Crow uses html as GUI so you need to run it in your browser. 
First you need to run the server.

        chmod +x run.py
        ./run.py

Next, you need to open the URL in your browser. Browsers such as `google Chrome` or `firefox`
(`chromium` and `iceweasel` are the Free versions of these browsers) provide possibility to
view a web page in an application mode which is ideal for our job. Remember not to close
the server you ran above. In a separated terminal run:

        chromium --app=http://127.0.0.1:8888/
        iceweasel -chrome http://127.0.0.1:8888/

Configuration
---------------

The only configuration available right now is the `api_path` which is necessary for statusnet federal instances.
Edit `config.py` and change the api path to your statusnet instance api path.
Read [this manual](http://status.net/wiki/API_discovery) to find out what your api path should change to.

        STATUSNET = {'api_path': 'http://quitter.se/api/'}

Currently working on
---------------
* follow/unfollow users
* user/group profile view

Todo List
---------------
* you suggest :)

Known Issues
---------------
This is an alpha version, so there are (/should be) a lot of issues but they
need to be documented. Please submit any issues [here](https://github.com/bijanebrahimi/Crow/issues).

License
---------------
GPL v3.0 or later
