Crow
====
[**crow**](https://github.com/bijanebrahimi/crow) is a StatusNet microblogging client. I decided not to stick with [other clients](http://federation.skilledtests.com/Statusnet_clients.html) just because i needed one which can be easy contribute to and fast to grow and lots of crazy features. I chose `HTML` and `javascript` for it's user interface since it's very flexible and `python` for a small web server which acts as a proxy between the user interface and a statusnet federated server. Currently it lacks the library to run the interface independently (definitely webkit) so it needs to be run on a web browser like an web application.

Version
---------------
You can get [current stable version](https://github.com/bijanebrahimi/crow) or [develop version](https://github.com/bijanebrahimi/crow/tree/develop) which has no version, just the bleeding edge code which I strongly recommend it to use since the entire code is still beta and unstable and developing version contains up to date bug fixes and new features.


Current Version
---------------
0.3.develop-2


Installing dependencies
---------------

Crow contains a small web server written in *python 2.7+* and uses the pyhton tornado library.  The rest is HTML and Javascript.

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

In OSX:

The easiest way is to install [Homebrew](http://brew.sh/) and then use Homebrew to install python. 

To install Homebrew: 

	$ ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

Then insert the Homebrew directory in your PATH environment variable of  ~/.bashrc:

	export PATH=/usr/local/bin:$PATH

Now install Python:

	$ brew install python

Then add the new Python scripts directory to your PATH environment variable of  ~/.bashrc:

	export PATH=/usr/local/share/python:$PATH

Now python is installed install tornado: 

	$ pip install tornado

If `Git` tools aren't installed already download the latest [Git installer package](http://code.google.com/p/git-osx-installer/downloads/list?can=3), double click on the installer to start the installation wizard. You wil be prompted for your system password in order for the installer to complete.


Get the code
---------------

### Download

to get the latest code, you can download the source code from either the [stable version](https://github.com/bijanebrahimi/crow) or the [developing version](https://github.com/bijanebrahimi/crow/tree/develop).

### Git Clone

I suggest you to clone the project on your computer which makes the future updates very easy:

        mkdir crow-src
        cd crow-src
        git clone https://github.com/bijanebrahimi/Crow.git ./
        git checkout develop

the last git command switches to `develop` branch which. To use the stable version (for instance after an update has caused instability) you can run

	git checkout master 

at anytime.


Run
---------------

Crow uses html as GUI so you need to run it in your browser. 
First you need to run the server.

        chmod +x run.py
        ./run.py

Now you can open the `http://127.0.0.1:8888/` address in your web browser. Browsers such as `google Chrome` or `firefox`
(`chromium` and `iceweasel` are the Free versions of these browsers) provide possibility to
view a web page in an application mode which is ideal for our job.

* in Google Chrome: `chromium --app=http://127.0.0.1:8888/`
* in Firefox: `firefox -P Default --no-remote -width 380 -height 700 -chromehttp://127.0.0.1:8888/`

Remember not to close the terminal you ran Crow from as that will stop the Crow process.


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

* `CRW_NOTIFY_MAXIMUM` which will limit number of notifies in one go. zero means unlimited


Update
---------------

To update to your Crow installation make sure you are in the folder you originally copied the Crow files to (crow-src in the instructions above) and run

	git pull origin

Authors
---------------

* [Bijan Ebrahimi](https://quitter.se/bijan)
* [Erkan Yılmaz](http://oracle.skilledtests.com/erkanyilmaz) (typo/grammar fixes)
* [Shabgard](https://quitter.se/shabgard) (added Windows Installation constructions)
* [Luke](luke@quitter.se) (added OSX Installation constructions)

License
---------------
crow is published under GPL version 3.0 or later license but the libraries
used in project may be different, for that you can check the header of each
library. but basically, crow is a Free and OpenSource software. you can fork
the project and improve the code as longs as you keep the code Free :)
