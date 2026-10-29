

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d C:\tiny-trotters && docker compose up -d"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "DockerComposeOnBoot" -Action $action -Trigger $trigger -Principal $principal -Description "Starts Node.js Dockerinfrastructure on system boot."
