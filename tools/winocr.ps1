# OCR page images with the OCR engine built into Windows.
# Runs under Windows PowerShell 5.1 (powershell.exe), which can load WinRT types.
# Usage: powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools\winocr.ps1 <png-or-folder> <out.txt>
param([string]$InputPath, [string]$OutFile)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime]

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
                   $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$type) {
    $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
    $task.Wait() | Out-Null
    $task.Result
}

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { throw "No OCR engine available for the user's languages" }

if (Test-Path $InputPath -PathType Container) {
    $files = Get-ChildItem $InputPath -Filter *.png | Sort-Object Name
} else {
    $files = @(Get-Item $InputPath)
}

$sb = New-Object System.Text.StringBuilder
foreach ($f in $files) {
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    [void]$sb.AppendLine("===== " + $f.BaseName)
    foreach ($line in $result.Lines) { [void]$sb.AppendLine($line.Text) }
    $stream.Dispose()
}
[System.IO.File]::WriteAllText($OutFile, $sb.ToString())
Write-Output ("OCR'd {0} page(s) -> {1}" -f $files.Count, $OutFile)
