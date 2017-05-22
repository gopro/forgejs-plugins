var ForgePlugins = ForgePlugins || {};

ForgePlugins.GamepadMonitor = function()
{
    this._gui = null;

    this._gamepadUids = [];
    this._gamepads = [];
    this._gamepadGuis = [];
};

ForgePlugins.GamepadMonitor.prototype =
{
    boot: function()
    {
        this._gui = new dat.GUI();

        var gamepads = this.viewer.gamepad.all;

        // Displaying already connected gamepads
        while (gamepads.length > 0)
        {
           this._onGamepadConnectedHandler(gamepads.pop());
        }

        this.viewer.gamepad.onGamepadConnected.add(this._onGamepadConnectedHandler, this);
        this.viewer.gamepad.onGamepadDisconnected.add(this._onGamepadDisconnectedHandler, this);
    },

    _onGamepadConnectedHandler: function(gamepad)
    {
        if (typeof gamepad.name !== "string")
        {
            gamepad = gamepad.data;
        }

        if (this._gamepadUids.indexOf(gamepad.name) !== -1)
        {
            return;
        }

        this._gamepadUids.push(gamepad.name);
        this._gamepads.push(gamepad);

        gui = this._gui.addFolder(gamepad.name);
        this._gamepadGuis.push(gui);

        // Get the Gamepad object (not the FORGE one)
        gamepad = gamepad.gamepad;

        if (typeof gamepad.axes !== "undefined")
        {
            for (var i = 0, ii = gamepad.axes.length; i < ii; i++)
            {
                gui.add(gamepad.axes, i, -1, 1).name("Axis " + i);
            }
        }

        if (typeof gamepad.buttons !== "undefined")
        {
            for (var i = 0, ii = gamepad.buttons.length; i < ii; i++)
            {
                gui.add(gamepad.buttons[i], "value", 0, 1).name("Button " + i).listen();
            }
        }
    },

    _onGamepadDisconnectedHandler: function(name)
    {
        var index = this._gamepadUids.indexOf(name);
        this._gamepadUids.splice(index, 1);
        this._gamepads.splice(index, 1);
        this._gamepadGuis.splice(index, 1);
    },

    update: function()
    {
        var i, ii, j, jj, folder, controller, gamepad;

        for (i = 0, ii = this._gamepadGuis.length; i < ii; i++)
        {
            folder = this._gamepadGuis[i];
            gamepad = this._gamepads[i].gamepad;

            for (j = 0, jj = gamepad.axes.length; j < jj; j++)
            {
                controller = folder.__controllers[j];
                controller.setValue(gamepad.axes[j]);
            }
        }
    },

    destroy: function()
    {
        this._gui = null;

        this._gamepadUids = null;
        this._gamepads = null;
        this._gamepadGuis = null;
    }
};
