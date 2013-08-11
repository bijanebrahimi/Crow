Crow
====
[**crow**](https://github.com/bijanebrahimi/crow) is a StatusNet microblogging client. i decided not to stick with [other clients](http://federation.skilledtests.com/Statusnet_clients.html) just because i needed one which can be easy contribute to and fast to grow and lots of crazy features. i choosed `HTML` and `javascript` for it's user interface since it's very flexible and `python` for a small web server which acts as a proxy between the user interface and statusnet federated server. currently it lacks the library to run the interface independently (definitely webkit) so it needs to be run on a web browser like an web application.

Version
---------------
0.2.0

Requirements
---------------
Crow contains a small web server written in *python 2.7+* and the rest is HTML and Javascript.

In Debian/Ubuntu friends:

        sudo apt-get install python-pip python-notify
        sudo pip install tornado

In Fedora:

        sudo yum install python-pip python-notify
        sudo python-pip install tornado

In Windows; thanks to @[shabgard](http://quitter.se/shabgard):

1. Get Python 2.x from Phython.org and install it
2. Get distribute from http://python-distribute.org/distribute_setup.py and install it by executing it.
3. Get pip from https://raw.github.com/pypa/pip/master/contrib/get-pip.py and istall it like distribute.
4. Install tornado using 

        $ pip install tornado

**Note**: installing `python-notify` is optional since it only gets loaded when available

Get the code
---------------

### Download

to get the latest code, you can download the source code from either the [stable version](https://github.com/bijanebrahimi/crow) or the [developing version](https://github.com/bijanebrahimi/crow/tree/develop).

### Git Clone

i suggest you to clone the project on your computer which makes the future updates very easy:

        mkdir crow-src
        cd crow-src
        git clone https://github.com/bijanebrahimi/Crow.git ./
        git checkout develop

the last git command switches to `develop` branch which. to use the stable version you can checkout to `master` anytime. and to update the latest changes:


Run
---------------

Crow uses html as GUI so you need to run it in your browser. 
First you need to run the server.

        chmod +x run.py
        ./run.py

Next, you need to open the URL in your browser. Browsers such as `google Chrome` or `firefox`
(`chromium` and `iceweasel` are the Free versions of these browsers) provide possibility to
view a web page in an application mode which is ideal for our job. Remember not to close
the server you ran above. In a separated terminal run:

        git pull origin

Configuration
---------------

* `API_PATH` which is necessary for statusnet federal instances.
edit `config.py` and change the api path to your statusnet instance api path.
read [this manual](http://status.net/wiki/API_discovery) to find out what your api path should change to.

        API_PATH = 'http://quitter.se/api/'

* `SRV_PORT` which is the port crow will be listening on it. change it to
any port number that is open

        SRV_PORT = 8888

* `CRW_NOTIFY_PUBLICS` which will turn off notification for public notices when **False**

Run
---------------

to run Crow, you first need to run the server side program which will listen on TCP port `8888`. you can change the port number in `config.py`.

        chmod +x run.py
        ./run.py

now you can open the `http://127.0.0.1:8888/` address in yout browser. you can open it in your browser in a tab, pin it or open it as an app. many modern browser support it and it's the best way since they're designed for web application in the first place:

* in google chrome: `chromium --app=http://127.0.0.1:8888/`
* in firefox: `firefox -P Default --no-remote -width 380 -height 700 -chromehttp://127.0.0.1:8888/`

License
---------------
crow is published under GPL version 3.0 or later license but the libraries
used in project may be different, for that you can check the header of each
library. but basically, crow is a Free and OpenSource software. you can fork
the project and improve the code as longs as you keep the code Free :)
