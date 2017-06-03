# Headset

A music player for the busy ones. [http://headsetapp.co](http://headsetapp.co)

## Building for other systems

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


## Known Issues

### Missing icon in Ubuntu

electron-packager ignores the Icon argument. You can add the icon path to the `.desktop` file like so:
```
# in /usr/share/applications/Headset.desktop

[Desktop Entry]
...
Icon=/usr/lib/Headset/resources/app/icon.png
...
```
