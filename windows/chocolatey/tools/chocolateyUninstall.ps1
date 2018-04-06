$ErrorActionPreference = 'Stop';
$name = 'headset'

$packageArgs = @{
  packageName = $name
  softwareName = 'Headset'
  fileType = 'exe'
  validExitCodes = @(0)
  file = "$env:LOCALAPPDATA\$name\Update.exe"
  silentArgs = '--uninstall -s'
}

 Uninstall-ChocolateyPackage @packageArgs

 Remove-Item -Path "$env:LOCALAPPDATA\$name" -Recurse -Force