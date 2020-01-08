$version = '3.2.0'

$url          = "https://github.com/headsetapp/headset-electron/releases/download/v$version/headset-$version-setup.exe"
$autoStartKey = 'HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Run\'
$startKey     = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run32'

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

Remove-ItemProperty $autoStartKey -Name 'headset' -ErrorAction 'SilentlyContinue'
Remove-ItemProperty $startKey -Name 'headset' -ErrorAction 'SilentlyContinue'

If (Test-Path "C:\ProgramData\SquirrelMachineInstalls\headset.exe") {
  Remove-Item "C:\ProgramData\SquirrelMachineInstalls\headset.exe" -Force -ErrorAction 'SilentlyContinue'
}
