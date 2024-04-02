# Headset

This project is currently not being actively maintained and is not accepting new pull requests or issues. Thank you for your understanding.

> **ATTENTION**: Headset no longer uses a shared YouTube API Key. Please create your own key by [Following this quick guide](https://github.com/headsetapp/headset-electron/wiki/Get-Youtube-API-Key) and make sure you are running the latest version.

![Build Status](https://github.com/headsetapp/headset-electron/workflows/CI/badge.svg)

[Headset](https://headsetapp.co) is a simple music player for Mac, Windows and Linux with integrated YouTube search, a home screen with popularity list by genres and eras, and best of all, a radio powered by Reddit. Headset takes the songs that are shared in over 80 music subreddits, categorizes them and plays them automatically. It's a great and pretty unique way to find new music as it is chosen by other humans like you and not by algorithms.

Have a question? Join our Slack workspace: https://tinyurl.com/8ejkcdac

Want to start contributing? Check out our [contributing](./CONTRIBUTING.md) doc.

## Installation

### macOS (Homebrew)

Update Homebrew and install `headset` using Homebrew Cask

```shell
brew update
brew install --cask headset
```

### Windows (Chocolatey)

To install, run the following command from the command line or from PowerShell:

```shell
C:\> choco install headset
```

To upgrade, run the following command from the command line or from PowerShell:

```shell
C:\> choco upgrade headset
```

More details in the chocolatey page: https://chocolatey.org/packages/headset

### Linux

<a href='https://flathub.org/apps/details/co.headsetapp.headset' target="_blank" ><img height='56' width='auto' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>
<a href='https://snapcraft.io/headset' target="_blank" ><img height='56' width='auto' alt='Get it from the Snap Store' src='https://snapcraft.io/static/images/badges/en/snap-store-black.svg'/></a>

As an alternative to `.deb` and `.rpm` packages on the website, you can also install it directly from the command-line:

#### Debian

```shell
wget -q https://headsetapp.co/headset-electron/headset.gpg -O- | sudo tee /usr/share/keyrings/headset-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/headset-archive-keyring.gpg] https://headsetapp.co/headset-electron/debian stable non-free" | sudo tee /etc/apt/sources.list.d/headset.list
sudo apt-get update
sudo apt-get install headset
```

#### RedHat

```shell
sudo dnf config-manager --add-repo https://headsetapp.co/headset-electron/redhat/headset.repo
sudo dnf install headset
```

--- Or ---

```shell
sudo yum-config-manager --add-repo https://headsetapp.co/headset-electron/redhat/headset.repo
sudo yum install headset
```

#### Build from source

If you would like to create a build for a different environment (e.g Manjaro or Aur, etc.) please follow these steps:

1. Install _NodeJs_ 8 or later

2. Clone the Repo

```shell
$ git clone https://github.com/headsetapp/headset-electron.git
```

3. Install dependencies

```shell
$ cd headset-electron
$ npm ci
```

4. Create your build:

```shell
electron-packager . \
  --executable-name headset \
  --ignore "(^/bin$|^/sig$|^/gh-pages$|^/player$|^/test$|Procfile|\.md$|^\.|^\/\.)" \
  --prune true \
  --out build/ \
  --overwrite \
  --asar \
  --platform=linux \
  --arch=x64
```

5. [Optional] For the Ubuntu build, we're using `electron-installer-debian` and for the Fedora build, we're using `electron-installer-redhat`. There might be an installer for your specific version, just have to google it.

## Contributors

[//]: contributor-faces

<a href="https://github.com/fcastilloec"><img src="https://avatars3.githubusercontent.com/u/1280530?v=4" title="fcastilloec" width="80" height="80"></a>
<a href="https://github.com/danielravina"><img src="https://avatars0.githubusercontent.com/u/3150871?v=4" title="danielravina" width="80" height="80"></a>
<a href="https://github.com/miniscruff"><img src="https://avatars1.githubusercontent.com/u/8585244?v=4" title="miniscruff" width="80" height="80"></a>
<a href="https://github.com/trueskawka"><img src="https://avatars2.githubusercontent.com/u/3491502?v=4" title="trueskawka" width="80" height="80"></a>
<a href="https://github.com/ChangJoo-Park"><img src="https://avatars0.githubusercontent.com/u/1451365?v=4" title="ChangJoo-Park" width="80" height="80"></a>
<a href="https://github.com/Jackymancs4"><img src="https://avatars2.githubusercontent.com/u/6209647?v=4" title="Jackymancs4" width="80" height="80"></a>
<a href="https://github.com/m1guelpf"><img src="https://avatars0.githubusercontent.com/u/23558090?v=4" title="m1guelpf" width="80" height="80"></a>
<a href="https://github.com/rajatkverma"><img src="https://avatars3.githubusercontent.com/u/20157169?v=4" title="rajatkverma" width="80" height="80"></a>

[//]: contributor-faces

App Design by Hélène Giraud <a href="http://girographe.com" target="_blank">www.girographe.com</a>
