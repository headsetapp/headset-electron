# Headset
![](https://travis-ci.org/headsetapp/headset-electron.svg?branch=master)

A music player for the busy ones. [http://headsetapp.co](http://headsetapp.co)

## Install on debian based OS:
```
$ wget -q https://packagecloud.io/headsetapp/headset-electron/gpgkey -O- | sudo apt-key add -
$ echo "deb https://packagecloud.io/headsetapp/headset-electron/ubuntu/ trusty main" | sudo tee /etc/apt/sources.list.d/headsetapp_headset-electron.list
```

After those two commands are run, just install headset with:

```
$ sudo apt update && sudo apt install headset
```

## Building from source

Since this project is using electron js, it can work on any platform that can run node js. The maintainers of Headset only support macOs, Windows and Ubuntu. If you would like to create a build for a different environment (e.g Manjaro or Aur, etc.) please follow these steps:

0. Install NodeJs 6.2.0 or later

1. Clone the Repo
```bash
$ git clone https://github.com/headsetapp/headset-electron.git
```
2. install `electron-packager`
```
$ npm install -g electron-packager
```
3. Create your build:
```bash
cd headset-electron
electron-packager . \
  --ignore=node_modules/electron-prebuilt \
  --ignore=node_modules/electron-packager \
  --out build/ \
  --overwrite \
  --platform=linux \
  --arch=x64 \
```
4. [Optional] For the Ubuntu build, we're using `electron-installer-debian`. There might be an installer for your specifc version, just have to google for it.
