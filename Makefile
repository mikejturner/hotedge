build/hotedge@mikejturner.shell-extension.zip : extension.js logger.js metadata.json stylesheet.css schemas/org.gnome.shell.extensions.hotedge.gschema.xml schemas/gschemas.compiled
	mkdir -p build
	gnome-extensions pack --force --extra-source=logger.js -o build
	
schemas/gschemas.compiled : schemas/org.gnome.shell.extensions.hotedge.gschema.xml
	glib-compile-schemas schemas/
	
install : build/hotedge@mikejturner.shell-extension.zip
	gnome-extensions install --force build/hotedge@mikejturner.shell-extension.zip

clean :
	rm -rf build
	rm -f schemas/gschemas.compiled
	
