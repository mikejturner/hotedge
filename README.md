# Hot Edge

A GNOME Shell extension that adds a hot edge that activates the overview. 

This extension is based off the excellent [HotEdge by jdoda](https://github.com/jdoda/hotedge) but allows the hot edge to be positioned either on the left, bottom or right edge of the screen. On multi-monitor configurations, one hot edge is added to the primary monitor only, rather than a full-width hot edge spanning all monitors.

This version also includes settings (See [Configuration](#configuration)) that can be set through the Extensions GUI rather than just through the CLI.

## Installation

This fork of hot edge is currently unavailable on https://extensions.gnome.org.

Instead, install Hot Edge using git with the following commands:

```
git clone https://github.com/mikejturner/hotedge.git
cd hotedge
make install
```

## Configuration

The position of the hot edge can be set through the settings cog in the Extensions App. The available positions are Left, Right or Bottom of the screen. The [pressure threshold](#pressure-threshold) can also be set here.

Hot Edge does not disable the existing hot-corner. The hot-corner can be disabled using the GNOME Tweaks tool, using the setting **Top Bar > Activities Overview Hot Corner**.

Hot Edge exposes two gsettings keys that can modify it's behaviour : `pressure-threshold` and `fallback-timeout`. These keys control the sensitivity of the bottom edge to activation but only one of the keys is active at a time, depending on whether your system supports pressure barriers or has to use the timeout based fallback code. You can check this on your system by running the command `journalctl -g hotedge /usr/bin/gnome-shell` and checking for a line like `HotEdge: Display does not support extended barriers, falling back to old method.`. This indicates that you're using the fallback code, and need to adjust the `fallback-timeout` key and not the `pressure-threshold` key. Otherwise, you must adjust the `pressure-threshold` key and the `fallback-timeout` key has no effect.

### pressure-threshold

`pressure-threshold` is the distance the cursor must be moved "into" the bottom edge in order for it to activate. It's measured in pixels and the default value is 100 px. 

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@mikejturner/schemas set org.gnome.shell.extensions.hotedge pressure-threshold 200`

### fallback-timeout

`fallback-timeout` is the time the cursor must be touching the bottom edge in order for it to activate when using the fallback path. It's measure in milliseconds and the default value is 250 ms.

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@mikejturner/schemas set org.gnome.shell.extensions.hotedge fallback-timeout 500`

### corner-deadzone

`corner-deadzone` is a region extending in from each corner of the screen where the hot edge cannot be activated. It's measured in pixels, and the default value is 0 px.

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@mikejturner/schemas set org.gnome.shell.extensions.hotedge corner-deadzone 24`

### min-log-level
`min-log-level` is the minimum level of log statement that will be logged. Log levels increase in order of severity with 0 (DEBUG) being the lowest and 4 (FATAL) being the highest. The default value is 1 (INFO).

#### Example
`gsettings --schemadir ~/.local/share/gnome-shell/extensions/hotedge@mikejturner/schemas set org.gnome.shell.extensions.hotedge min-log-level 0`
 
