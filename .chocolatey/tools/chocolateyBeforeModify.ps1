$headsetProcess = Get-Process "Headset" -ErrorAction SilentlyContinue

if ($headsetProcess) {
  $headsetProcess | Stop-Process -Force
}

Remove-Variable headsetProcess
