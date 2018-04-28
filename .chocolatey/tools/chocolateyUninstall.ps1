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

if (Test-Path "$env:LOCALAPPDATA\$name\") {
  If (!(Test-Path $packageArgs.file)) {
    throw "Could not find $name uninstaller - because this software is always installed to a user profile folder, it must be uninstalled in the context of the user who installed it."
  } else {
    Try {
      Uninstall-ChocolateyPackage @packageArgs

      #Remove leftovers so new install will succeed
      If (Test-Path "$env:LOCALAPPDATA\$name\.dead") {
        Remove-Item "$env:LOCALAPPDATA\$name" -Recurse -Force -ErrorAction 'SilentlyContinue'
      }
    } Catch {
      throw $_.Exception
    }
  }
} else {
    Write-Warning "$name has already been uninstalled by other means or it is installed to a user's profile who is not the current user ($env:username)."
}
