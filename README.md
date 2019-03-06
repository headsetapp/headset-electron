# Headset

[![Linux/macOS Build Status](https://img.shields.io/travis/headsetapp/headset-electron/master.svg?logo=travis&label=Linux%2FmacOS)](https://travis-ci.org/headsetapp/headset-electron)
[![Windows Build status](https://img.shields.io/appveyor/ci/danielravina/headset-electron/master.svg?logo=appveyor&label=Windows)](https://ci.appveyor.com/project/danielravina/headset-electron/branch/master)

[Headset](http://headsetapp.co) is a simple music player for Mac, Windows and Linux with integrated YouTube search, a home screen with popularity list by genres and eras, and best of all, a radio powered by Reddit. Headset takes the songs that are shared in over 80 music subreddits, categorizes them and plays them automatically. It's a great and pretty unique way to find new music as it is chosen by other humans like you and not by algorithms.

Have a question? Join our Slack workspace: https://tinyurl.com/y7m8y5x4

Want to start contributing? Check out our [contributing](./CONTRIBUTING.md) doc.

## Installation

### macOS (Homebrew)

Update Homebrew and install `headset` using Hombrew Cask

```
brew update
brew cask install headset
```

### Windows (Chocolatey)

To install, run the following command from the command line or from PowerShell:
```
C:\> choco install headset
```

To upgrade, run the following command from the command line or from PowerShell:
```
C:\> choco upgrade headset
```

More details in the chocolatey page: https://chocolatey.org/packages/headset

### Linux
As an alternative to `.deb` and `.rpm` packages on the website, you can also install it directly from the command-line:

#### Debian
```
wget -q http://headsetapp.co/headset-electron/debian/headset.asc -O- | sudo apt-key add -
echo "deb [arch=amd64] http://headsetapp.co/headset-electron/debian stable non-free" | sudo tee /etc/apt/sources.list.d/headset.list
sudo apt-get update
sudo apt-get install headset
```

#### Redhat
```
sudo dnf config-manager --add-repo http://headsetapp.co/headset-electron/redhat/headset.repo
sudo dnf install headset
```
--- Or ---
```
sudo yum-config-manager --add-repo http://headsetapp.co/headset-electron/redhat/headset.repo
sudo yum install headset
```

#### Build from source

If you would like to create a build for a different environment (e.g Manjaro or Aur, etc.) please follow these steps:

1. Install _NodeJs_ 8 or later

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
electron-packager . \
  --executable-name headset \
  --ignore "(bin|Procfile|sig|gh-pages)" \
  --prune true \
  --out build/ \
  --overwrite \
  --asar \
  --platform=linux \
  --arch=x64
```

5. [Optional] For the Ubuntu build, we're using `electron-installer-debian` and for the Fedora build, we're using `electron-installer-redhat`. There might be an installer for your specific version, just have to google it.
