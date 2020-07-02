Param(
  [Parameter(Mandatory=$true)][string]$version
)

Write-Output $version
exit

$chocoInstall = '.chocolatey\tools\chocolateyInstall.ps1'
$setup = "build\installers\headset-$version-setup.exe"

if (!(Test-Path -Path "$setup")) {
  throw "The file $setup couldn't be found"
}

$sha256 = (CertUtil -hashfile "$setup" SHA256)[1].Replace(' ', '')
$choco = Get-Content $chocoInstall
$choco[11] = "  checksum       = '$sha256'"

$choco | Out-File -filepath "$chocoInstall" -Encoding UTF8

if (!(Test-Path -Path "$PWD\build")) {
  New-Item -ItemType Directory -Force -Path "$PWD\build"
}

choco pack '.chocolatey\headset.nuspec' -outputdirectory 'build'
