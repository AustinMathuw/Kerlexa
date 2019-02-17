@echo off
set SOURCE="C:\Users\MLH Admin\Desktop\CWRUHack\CWRUHackathon2019\Controller\KSP Controller\Output"
set DEST="C:\Program Files (x86)\Steam\steamapps\common\Kerbal Space Program\GameData"
xcopy %SOURCE% %DEST% /D /E /C /I /K /Y
call "C:\Program Files (x86)\Steam\steamapps\common\Kerbal Space Program\KSP_x64.exe"