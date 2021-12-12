"use strict";

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();

function init() {}

function buildPrefsWidget() {
  // const schema_source = Gio.SettingsSchemaSource.new_from_directory(
  //   Extension.dir.get_child("schemas").get_path(),
  //   Gio.SettingsSchemaSource.get_default(),
  //   false
  // );
  // const schema_id = Extension.metadata["settings-schema"];
  // const schema = schema_source.lookup(schema_id, true);
  // this.settings = new Gio.Settings({ settings_schema: schema });

  this.settings = ExtensionUtils.getSettings(
    'org.gnome.shell.extensions.hotedge');

  const prefsWidget = new Gtk.Grid({
    margin: 18,
    column_spacing: 12,
    row_spacing: 12,
    visible: true,
  });

  // Left Hotedge label
  const leftHotedgeActiveLabel = new Gtk.Label({
    label: "Left",
    halign: Gtk.Align.START,
    visible: true,
  });
  prefsWidget.attach(leftHotedgeActiveLabel, 0, 1, 1, 1);

  // left Hotedge widget
  const leftSwitch = new Gtk.Switch({
      active: this.settings.get_boolean('left-hotedge-active'),
      halign: Gtk.Align.END,
      visible: true
  });
  prefsWidget.attach(leftSwitch, 1, 1, 1, 1);

  // Bind the switch to the `left-hotedge-active` key
  this.settings.bind(
      'left-hotedge-active',
      leftSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
  );

   // Bottom Hotedge label
   const bottomHotedgeActiveLabel = new Gtk.Label({
    label: "Bottom",
    halign: Gtk.Align.START,
    visible: true,
  });
  prefsWidget.attach(bottomHotedgeActiveLabel, 0, 2, 1, 1);

  // Bottom Hotedge widget
  const bottomSwitch = new Gtk.Switch({
    active: this.settings.get_boolean('bottom-hotedge-active'),
    halign: Gtk.Align.END,
    visible: true
});
prefsWidget.attach(bottomSwitch, 1, 2, 1, 1);

// Bind the switch to the `bottom-hotedge-active` key
this.settings.bind(
    'bottom-hotedge-active',
    bottomSwitch,
    'active',
    Gio.SettingsBindFlags.DEFAULT
);

   // Right Hotedge label
   const rightHotedgeActiveLabel = new Gtk.Label({
    label: "Right",
    halign: Gtk.Align.START,
    visible: true,
  });
  prefsWidget.attach(rightHotedgeActiveLabel, 0, 3, 1, 1);

  // Right Hotedge widget
  const rightSwitch = new Gtk.Switch({
    active: this.settings.get_boolean('right-hotedge-active'),
    halign: Gtk.Align.END,
    visible: true
  });
  prefsWidget.attach(rightSwitch, 1, 3, 1, 1);

  // Bind the switch to the `right-hotedge-active` key
  this.settings.bind(
      'right-hotedge-active',
      rightSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
  );


   // Pressure Threshold label
   const pressureThresholdLabel = new Gtk.Label({
    label: "Pressure Threshold",
    halign: Gtk.Align.START,
    visible: true,
  });
  prefsWidget.attach(pressureThresholdLabel, 0, 4, 1, 1);

  const adjustment = new Gtk.Adjustment({
    lower: 5,
    upper: 500,
    step_increment: 5
  });
  const setting_int = new Gtk.SpinButton({adjustment: adjustment, visible: true});
  setting_int.set_value(25);
  prefsWidget.attach(setting_int, 1, 4, 1, 1);

  return prefsWidget;
}
