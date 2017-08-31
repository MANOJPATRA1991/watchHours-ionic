# watchHours-ionic

## Introduction

This is the Ionic version of the [watchours](https://watch-hours.herokuapp.com/) project.

## Description

#### Prerequisites

1. Before running this project ensure that you have installed cordova and ionic globally. If not, run this command `npm install cordova ionic -g`.

2. Replace host addresses with your computer's IP addresses specifically in these files:
    
    1. bin/www
    
    2. app.js
    
    3. www/js/services.js

#### How to run this project on local computer?

1. Clone the project repo to a folder on your local computer.
2. `cd` into the folder where you cloned the project.
3. `npm install` to install all node packages.
4. `bower install` to install all bower packages.
5. To install cordova plugins `cordova plugin add <plugin-name>`.
  To get list of all cordova plugins, run `cordova plugin list` command.
  Also here is a list of all Cordova plugins required for this project.
  i. cordova-plugin-app-event 1.2.0 "Application Events"
  ii. cordova-plugin-console 1.0.5 "Console"
  iii. cordova-plugin-device 1.1.4 "Device"
  iv. cordova-plugin-splashscreen 4.0.3 "Splashscreen"
  v. cordova-plugin-statusbar 2.2.1 "StatusBar"
  vi. cordova-plugin-whitelist 1.3.1 "Whitelist"
  vii. cordova-plugin-x-toast 2.6.0 "Toast"
  viii. de.appplant.cordova.plugin.local-notification 0.8.5 "LocalNotification"
  ix. ionic-plugin-keyboard 2.2.1 "Keyboard"
6. As this project is specifically built for android, I recommend running it on an Android device for best experience. However, the project can be built and run on an iOS device if you choose to do so.
7. To build for android, `ionic build android`.
8. To deploy to android device, `ionic run android`.
  >NOTE: Make sure to keep the node server running while accessing the app. To stat the server, `npm start`.
9. To run the project on ionic-lab, `ionic serve --lab`.

### Reference
1. [Ionic Framework](http://ionicframework.com/docs/v1/)
2. [ngCordova](http://ngcordova.com/)
3. [jshint](http://jshint.com/)

### License
The content of this repository is licensed under [MIT](https://choosealicense.com/licenses/mit/).
