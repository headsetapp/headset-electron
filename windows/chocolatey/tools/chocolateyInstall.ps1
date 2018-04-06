$version = '1.7.0'
$url = "https://github.com/headsetapp/headset-electron/releases/download/v$version/HeadsetSetup.exe"

$packageArgs = @{
  packageName    = 'headset'
  softwareName   = 'Headset'
  fileType       = 'exe'
  url            = $url
  checksum       = 'NEEDS_TO_BE_REPLACED_BY_APPVEYOR!'
  checksumType   = 'sha256'
  validExitCodes = @(0)
}

Install-ChocolateyPackage @packageArgs
