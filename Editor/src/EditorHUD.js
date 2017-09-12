
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorHUD = function(editor)
{
    this._editor = editor;

    this._canvas = null;

    this._options = { cross: true };

    this._boot();
};

ForgePlugins.EditorHUD.prototype =
{

    _boot: function()
    {
        this._canvas = this._editor.plugin.create.canvas();
        this._canvas.maximize(true);
        this._editor.plugin.container.addChild(this._canvas);
    },

    update: function()
    {
        var ctx = this._canvas.context2D;
        ctx.clearRect(0, 0, this._canvas.pixelWidth, this._canvas.pixelHeight);

        if(this._options.cross === true)
        {
            var center = { x: this._canvas.pixelWidth / 2, y: this._canvas.pixelHeight / 2 };

            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(center.x - 11, center.y);
            ctx.lineTo(center.x + 11, center.y);
            ctx.moveTo(center.x, center.y - 11);
            ctx.lineTo(center.x, center.y + 11);
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(center.x - 10, center.y);
            ctx.lineTo(center.x + 10, center.y);
            ctx.moveTo(center.x, center.y - 10);
            ctx.lineTo(center.x, center.y + 10);
            ctx.stroke();
        }
    },

    destroy: function()
    {
        this._canvas = null;
    }
};
