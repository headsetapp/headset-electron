# Headset

Linux: [![Build Status](https://travis-ci.org/headsetapp/headset-electron.svg?branch=master)](https://travis-ci.org/headsetapp/headset-electron)
Windows: [![Build status](https://ci.appveyor.com/api/projects/status/8mpmtejnutifoybg/branch/master?svg=true)](https://ci.appveyor.com/project/danielravina/headset-electron/branch/master)

[Headset](http://headsetapp.co) is a simple music player for Mac, Windows and Linux with integrated YouTube search, a home screen with popularity list by genres and eras, and best of all, a radio powered by Reddit. Headset takes the songs that are shared in over 80 music subreddits, categorize them and plays them automatically. It's a great way to find new music and a pretty unique one as it is chosen by other humans like you, not by algorithms.

Have a question? Join our Slack workspace: https://tinyurl.com/y7m8y5x4

# Installation

## Using Homebrew (macOS)

Update Homebrew and install `headset` using Hombrew Cask

```
brew update
brew cask install headset
```

## Linux
As an alternative to `.deb` and `.rpm` packages on the website, you can also install it directly from the command-line:

### Debian
```
wget -q http://headsetapp.co/headset-electron/debian/headset.asc -O- | sudo apt-key add -
echo "deb [arch=amd64] http://headsetapp.co/headset-electron/debian stable non-free" | sudo tee /etc/apt/sources.list.d/headset.list
sudo apt-get update
sudo apt-get install headset
```

### Redhat
```
sudo dnf config-manager --add-repo http://headsetapp.co/headset-electron/redhat/headset.repo
sudo dnf install headset
```
--- Or ---
```
sudo yum-config-manager --add-repo http://headsetapp.co/headset-electron/redhat/headset.repo
sudo yum install headset
```

### Build from source

If you would like to create a build for a different environment (e.g Manjaro or Aur, etc.) please follow these steps:

1. Install _NodeJs_ 6.2.0 or later

2. Clone the Repo
```bash
$ git clone https://github.com/headsetapp/headset-electron.git
```
3. Go into your specific OS folder and install dependencies
```
$ cd headset-electron/linux
$ npm install
```
4. Create your build:
```bash
electron-packager . headset \
  --ignore bin \
  --prune true \
  --out build/ \
  --overwrite  \
  --platform=linux \
  --arch=x64
```
5. [Optional] For the Ubuntu build, we're using `electron-installer-debian` and for the Fedora build, we're using `electron-installer-redhat`. There might be an installer for your specific version, just have to google it.
