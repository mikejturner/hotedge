/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { Clutter, GObject, GLib, Meta, Shell} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Logger = Me.imports.logger.Logger;
const Layout = imports.ui.layout;
const Main = imports.ui.main;

const SETTINGS_SCHEMA = 'org.gnome.shell.extensions.hotedge';
const HOT_EDGE_PRESSURE_TIMEOUT = 1000; // ms
const LOGGER = new Logger('HotEdge', SETTINGS_SCHEMA);

const EDGE = {
    Left: 'Left',
    Top: 'Top',
    Bottom: 'Bottom',
    Right: 'Right'
}


function init() {
    return new Extension();
}


class Extension {
    constructor() {
        this._edgeHandlerId = null;
        this._settingsHandlerId = null;
        this._settings = null;
    }

    enable() {
        this._settings = ExtensionUtils.getSettings(SETTINGS_SCHEMA);
        this._settingsHandlerId = this._settings.connect('changed', this._onSettingsChange.bind(this));
        this._edgeHandlerId = Main.layoutManager.connect('hot-corners-changed', this._updateHotEdges.bind(this));
        
        Main.layoutManager._updateHotCorners();
    }

    disable() {
        Main.layoutManager.disconnect(this._edgeHandlerId);
        this._settings.disconnect(this._settingsHandlerId);
        this._settings = null;
        
        Main.layoutManager._updateHotCorners();
    }

    _onSettingsChange() {
        Main.layoutManager._updateHotCorners();
    }
    
    _updateHotEdges() {
        LOGGER.debug('Updating hot edges for primary monitor');
        let pressureThreshold = this._settings.get_uint('pressure-threshold');
        let fallbackTimeout = this._settings.get_uint('fallback-timeout');
        let cornerDeadzone = this._settings.get_uint('corner-deadzone');
        let leftHotedgeActive = this._settings.get_boolean('left-hotedge-active');
        let rightHotedgeActive = this._settings.get_boolean('right-hotedge-active');
        let bottomHotedgeActive = this._settings.get_boolean('bottom-hotedge-active');
        
        // build new hot edge for primary monitor only
        let primaryMonitorIndex = Main.layoutManager.primaryIndex
        let monitor = Main.layoutManager.monitors[primaryMonitorIndex];
        let edge = null;
        if (leftHotedgeActive) {
            edge = new HotEdge(Main.layoutManager, monitor, EDGE.Left, pressureThreshold, fallbackTimeout, cornerDeadzone);
            Main.layoutManager.hotCorners.push(edge);                    
        }
        if (bottomHotedgeActive) {
            edge = new HotEdge(Main.layoutManager, monitor, EDGE.Bottom, pressureThreshold, fallbackTimeout, cornerDeadzone);
            Main.layoutManager.hotCorners.push(edge);
        }
        if (rightHotedgeActive) {
            edge = new HotEdge(Main.layoutManager, monitor, EDGE.Right, pressureThreshold, fallbackTimeout, cornerDeadzone);
            Main.layoutManager.hotCorners.push(edge);
        }
    }
}


const HotEdge = GObject.registerClass(
class HotEdge extends Clutter.Actor {
    _init(layoutManager, monitor, edgePosition, pressureThreshold, fallbackTimeout, cornerDeadzone) {
        LOGGER.debug('Creating hot edge');
        super._init();

        this._monitor = monitor;
        this._edgePosition = edgePosition;
        this._fallbackTimeout = fallbackTimeout;
        this._cornerDeadzone = cornerDeadzone;

        this._setupFallbackEdgeIfNeeded(layoutManager);

        this._pressureBarrier = new Layout.PressureBarrier(pressureThreshold,
                                                    HOT_EDGE_PRESSURE_TIMEOUT,
                                                    Shell.ActionMode.NORMAL |
                                                    Shell.ActionMode.OVERVIEW);
        this._pressureBarrier.connect('trigger', this._toggleOverview.bind(this));

        this.connect('destroy', this._onDestroy.bind(this));
        this._setBarrierSize();
    }

    _destroyBarrier() {
        if (this._barrier) {
            this._pressureBarrier.removeBarrier(this._barrier);
            this._barrier.destroy();
            this._barrier = null;
        }
    }

    _setBarrierSize() {

        this._destroyBarrier();

        switch (this._edgePosition) {
            case EDGE.Left:
                this._barrier = this._createLeftBarrier();
                break;
            case EDGE.Bottom:
                this._barrier = this._createBottomBarrier();
                break;
            case EDGE.Right:
                this._barrier = this._createRightBarrier();
                break;
            default:
                break;
        }
        if (this._barrier) {
            this._pressureBarrier.addBarrier(this._barrier);
        }
    }

    _createLeftBarrier() {
        let size = this._monitor.height - (2 * this._cornerDeadzone); // We always want the size to be the full height of the monitor, minus the corner dead-zones (if any).
        let direction = Meta.BarrierDirection.POSITIVE_X;
        let x1 = this._monitor.x;
        let x2 = x1;
        let y1 = this._monitor.y + this._cornerDeadzone;
        let y2 = y1 + size;
        LOGGER.debug('Setting barrier size to ' + size);
        return new Meta.Barrier({ display: global.display,
                                                   x1: x1, x2: x2, 
                                                   y1: y1, y2: y2,
                                                   directions: direction }); 
    }

    _createRightBarrier() {
        let size = this._monitor.height - (2 * this._cornerDeadzone); // We always want the size to be the full height of the monitor, minus the corner dead-zones (if any).
        let direction = Meta.BarrierDirection.NEGATIVE_X;
        let x1 = this._monitor.x + this._monitor.width;
        let x2 = x1;
        let y1 = this._monitor.y + this._cornerDeadzone;
        let y2 = y1 + size;
        LOGGER.debug('Setting barrier size to ' + size);
        return new Meta.Barrier({ display: global.display,
                                                   x1: x1, x2: x2, 
                                                   y1: y1, y2: y2,
                                                   directions: direction }); 
    }

    _createBottomBarrier() {
        let size = this._monitor.width - (2 * this._cornerDeadzone); // We always want the size to be the full width of the monitor, minus the corner dead-zones (if any).
        let direction = Meta.BarrierDirection.NEGATIVE_Y;
        let x1 = this._monitor.x + this._cornerDeadzone;
        let x2 = x1 + size;
        let y1 = this._monitor.y + this._monitor.height;
        let y2 = y1;
        LOGGER.debug('Setting barrier size to ' + size);
        return new Meta.Barrier({ display: global.display,
                                                   x1: x1, x2: x2, 
                                                   y1: y1, y2: y2,
                                                   directions: direction });
    }


    
    _setupFallbackEdgeIfNeeded(layoutManager) {
        if (!global.display.supports_extended_barriers()) {
            LOGGER.warn('Display does not support extended barriers, using fallback path.');
            this.set({
                name: 'hot-edge',
                x: this._x + this._cornerDeadzone,
                y: this._y - 1,
                width: this._monitor.width - (2 * this._cornerDeadzone),
                height: 1,
                reactive: true,
                _timeoutId: null
            });
            layoutManager.addChrome(this);
        }
    }

    _onDestroy() {
        this._destroyBarrier();
        this._pressureBarrier.destroy();
        this._pressureBarrier = null;
    }

    _toggleOverview() {
        if (this._monitor.inFullscreen && !Main.overview.visible)
            return;

        if (Main.overview.shouldToggleByCornerOrButton()) {
            Main.overview.toggle();
        }
    }

    vfunc_enter_event(crossingEvent) {
        if (!this._timeoutId) {
            this._timeoutId = GLib.timeout_add(GLib.PRIORITY_HIGH, this._fallbackTimeout, () => {
                this._toggleOverview();
                return GLib.SOURCE_REMOVE;
            });
        }
        return Clutter.EVENT_PROPAGATE;
    }

    vfunc_leave_event(crossingEvent) {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }
        return Clutter.EVENT_PROPAGATE;
    }
});

