!macro preInit
	SetRegView 64
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\UJApp\mcm"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\UJApp\mcm"
	SetRegView 32
	WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\UJApp\mcm"
	WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "D:\UJApp\mcm"
!macroend