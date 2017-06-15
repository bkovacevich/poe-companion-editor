# poe-companion-editor
Pillars Of Eternity companion stat editor
 
# About
A simple cross platform application for editing Pillars of Eternity companions base stats.  Compatible with Pillars of Eternity version 3.03 through 3.06.
 
## Installation
Download the [release](https://github.com/bkovacevich/poe-companion-editor/releases) for your application and extract.  The executable is names POECompanionEditor or POECompanionEditor.exe for windows.
 
## Use

***Use this application at your own risk***

To edit a companion's stats, you need to edit a file in the folder ```Pillars of Eternity/PillarsOfEternity_Data/assetbundles/prefabs/objectbundle``` in the steam files directory.  The name of the file is of the form ```companion_<name>.unity3d```, though some of the names are abbreviated. (For example, Eder is named companion_eder.unity3d, and Grieving Mother is "companion_gm.unity3d".)  The application will try to open this folder by default, but you will need to browse there from scratch if your steam install folder is different from the defaults.  The defailt root path is ```C:\Program Files\Steam (x86)\SteamApps\Common``` for windows, ```~/Library/Application Support/SteamSteam/Apps/common``` for Macs, and either ```~/.steam/steam/SteamApps/common``` or ```~/.local/share/Steam/SteamApps/common/``` for Linux.
 
I would *highly* recommend backing up the file before you make any changes, as the application does not do that automatically.  If this messes up your game files then you can refresh them in the steam interface. (Go to Library>Pillars of Eternity>Properties>Local Files and select "Verify Integrity of Game Files".)  Using this application doesn't directly effect your save game files, but it's possible that later gameplay will be impacted if your companion's base stats are different.
 
The numbers for character statistics are their base stats, before any racial or cultural modifiers.  Thus the in game minimum is 3 and the in game maximum is 18.  You can set them higher, or set them to a negative number, but I would not recommend this because I don't know exactly what would happen.  But if you're feeling brave, go crazy.
 
## Notes
* Windows and Darwin versions are currently untested, please let me know about any issues using them.

# Development

* Build: ```npm run build```
* Test:  ```npm run test```
* Run a dev version of this application: ```npm run start```
* Build your own application: ```npm run package```

# Licenses
 
* This package: [MIT](LICENSE)
* Pure CSS: [BSD](assets/pure/LICENSE.md)
