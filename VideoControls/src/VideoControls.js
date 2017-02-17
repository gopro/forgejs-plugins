var ForgePlugins = ForgePlugins || {};

ForgePlugins.VideoControls = function()
{
    this._video = null;

    this._poster = null;
    this._posterTween = null;

    this._splash = null;
    this._splashTween = null;

    this._bottomContainer = null;
    this._bottomContainerTween = null;
    this._bottomContainerTweening = false;

    this._seekBar = null;

    this._buttonBar = null;
    this._playbackButton = null;
    this._fsButton = null;
    this._qualityButton = null;

    this._volumeContainer = null;
    this._volumeContainerTween = null;
    this._volumeButton = null;
    this._volumeContainer = null;
    this._volumeBar = null;
    this._volumeCursor = null;

    this._timeContainer = null;
    this._timeContainerTween = null;
    this._currentTime = null;
    this._timeSeparator = null;
    this._totalTime = null;

    this._qualityNames = ["LOW", "MEDIUM", "HIGH", "ULTRA"];
    this._qualityBar = null;
    this._qualityContainer = null;
    this._qualityButtons = null;
    this._qualityHighlight = null;
    this._qualityHighlightTween = null;
    this._qualityButtonWidth = 120;

    this._spinner = null;
};

ForgePlugins.VideoControls.prototype =
{

    boot: function()
    {
        this.viewer.container.pointer.enabled = true;
        this.viewer.container.pointer.onMove.add(this._onMouseMove, this);
        this.viewer.container.pointer.onLeave.add(this._onMouseLeave, this);

        this._splash = this.plugin.create.displayObjectContainer();
        this._splash.maximize(true);
        this._splash.background = this.plugin.options.splashColor;
        this._splash.alpha = 1.0;
        this._splash.pointer.enabled = true;
        this._splash.pointer.onClick.add(this._splashClickHandler, this);
        this.plugin.container.addChild(this._splash);

        if(this.plugin.options.poster !== null)
        {
            this._poster = this.plugin.create.image(this.plugin.options.poster, false);
            this._poster.verticalCenter = true;
            this._poster.horizontalCenter = true;
            if (window.innerWidth > window.innerHeight || this._poster.width > this._poster.height)
            {
                this._poster.width = window.innerWidth;
            }
            else
            {
                this._poster.height = window.innerHeight;
            }
            this._splash.addChild(this._poster);
        }

        this._bottomContainer = this.plugin.create.displayObjectContainer();
        this._bottomContainer.width = "100%";
        this._bottomContainer.height = "128px";
        this._bottomContainer.bottom = 0;
        this.plugin.container.addChild(this._bottomContainer);

        this._bottomContainerTween = this.plugin.create.tween(this._bottomContainer);
        this._bottomContainerTween.onComplete.add(this._bottomContainerTweenComplete, this);

        this._buttonBar = this.plugin.create.displayObjectContainer();
        this._buttonBar.width = "100%";
        this._buttonBar.height = "60px";
        this._buttonBar.bottom = 0;
        this._bottomContainer.addChild(this._buttonBar);

        //Playback button ================================

        var playSkin = new FORGE.ButtonSkin("play");
        playSkin.out.image = {key: "play-out", url: this.plugin.fullUrl+"assets/button-play.svg"};
        playSkin.out.align = "center";
        playSkin.out.autoWidth = false;
        playSkin.out.autoHeight = false;
        playSkin.out.background = "#00A3DA";

        var pauseSkin = new FORGE.ButtonSkin("pause");
        pauseSkin.out.image = {key: "pause-out", url: this.plugin.fullUrl+"assets/button-pause.svg"};
        pauseSkin.out.align = "center";
        pauseSkin.out.autoWidth = false;
        pauseSkin.out.autoHeight = false;
        pauseSkin.out.background = "rgba(0, 0, 0, 0.5)";
        pauseSkin.over.background = "#00A3DA";

        this._playbackButton = this.plugin.create.button({skins: [playSkin, pauseSkin], default: "play"});
        this._playbackButton.pointer.enabled = true;
        this._playbackButton.pointer.onClick.add(this._playbackClickHandler, this);
        this._playbackButton.width = 60;
        this._playbackButton.height = 40;
        this._playbackButton.top = 10;
        this._playbackButton.left = 15;
        this._buttonBar.addChild(this._playbackButton);

        // Volume ==================================

        this._volumeContainer = this.plugin.create.displayObjectContainer();
        this._volumeContainer.pointer.enabled = true;
        this._volumeContainer.pointer.onEnter.add(this._volumeContainerEnterHandler, this);
        this._volumeContainer.pointer.onLeave.add(this._volumeContainerLeaveHandler, this);
        this._volumeContainer.pointer.onWheel.add(this._volumeContainerWheelHandler, this);
        this._volumeContainer.width = "30px"; //"130px";
        this._volumeContainer.height = "100%";
        this._volumeContainer.left = 90;
        this._buttonBar.addChild(this._volumeContainer);

        this._volumeContainerTween = this.plugin.create.tween(this._volumeContainer);

        var volume0 = new FORGE.ButtonSkin("volume-0");
        volume0.out.image = {key: "volume-0", url: this.plugin.fullUrl+"assets/sound-state-0.svg"};
        volume0.out.align = "center";
        volume0.out.autoWidth = false;
        volume0.out.autoHeight = false;

        var volume1 = new FORGE.ButtonSkin("volume-1");
        volume1.out.image = {key: "volume-1", url: this.plugin.fullUrl+"assets/sound-state-1.svg"};
        volume1.out.align = "center";
        volume1.out.autoWidth = false;
        volume1.out.autoHeight = false;

        var volume2 = new FORGE.ButtonSkin("volume-2");
        volume2.out.image = {key: "volume-2", url: this.plugin.fullUrl+"assets/sound-state-2.svg"};
        volume2.out.align = "center";
        volume2.out.autoWidth = false;
        volume2.out.autoHeight = false;

        this._volumeButton = this.plugin.create.button({skins: [volume0, volume1, volume2], default: "volume0"});
        this._volumeButton.pointer.enabled = true;
        this._volumeButton.pointer.onClick.add(this._volumeClickHandler, this);
        this._volumeButton.width = 30;
        this._volumeButton.height = 30;
        this._volumeButton.top = 15;
        this._volumeButton.left = 0;
        this._volumeContainer.addChild(this._volumeButton);

        this._volumeBar = this.plugin.create.canvas();
        this._volumeBar.pointer.enabled = true;
        this._volumeBar.pointer.cursor = FORGE.Pointer.cursors.POINTER;
        this._volumeBar.pointer.onClick.add(this._volumeBarClickHandler, this);
        this._volumeBar.background = "#211F20";
        this._volumeBar.width = "60px";
        this._volumeBar.height = "5px";
        this._volumeBar.left = 40;
        this._volumeBar.verticalCenter = true;
        this._volumeContainer.addChild(this._volumeBar);

        this._volumeCursor = this.plugin.create.image({key: "volume-cursor", url: "assets/sound-cursor.svg"});
        this._volumeCursor.pointer.enabled = true;
        this._volumeCursor.pointer.cursor = FORGE.Pointer.cursors.POINTER;
        this._volumeCursor.top = 21;
        this._volumeCursor.drag.enabled = true;
        this._volumeCursor.drag.constrain = this._volumeBar;
        this._volumeCursor.drag.axis = "x";
        this._volumeCursor.drag.handle = this._volumeContainer;
        this._volumeCursor.drag.onDrag.add(this._volumeCursorDragHandler, this);
        this._volumeContainer.addChild(this._volumeCursor);

        //Time =============================

        this._timeContainer = this.plugin.create.displayObjectContainer();
        this._timeContainer.width = "95px";
        this._timeContainer.height = "100%";
        this._timeContainer.left = 120; //220
        this._buttonBar.addChild(this._timeContainer);

        this._timeContainerTween = this.plugin.create.tween(this._timeContainer);

        this._totalTime = this.plugin.create.textField();
        this._totalTime.value = "00:00";
        this._totalTime.width = "40px";
        this._totalTime.height = "100%";
        this._totalTime.lineHeight = "60px";
        this._totalTime.right = 0;
        this._totalTime.color = "white";
        this._totalTime.fontFamily = "pfdintextprobold,frutigerbold";
        this._timeContainer.addChild(this._totalTime);

        this._timeSeparator = this.plugin.create.textField();
        this._timeSeparator.textAlign = "center";
        this._timeSeparator.value = "/";
        this._timeSeparator.width = "15px";
        this._timeSeparator.height = "100%";
        this._timeSeparator.lineHeight = "60px";
        this._timeSeparator.right = this._totalTime.pixelWidth;
        this._timeSeparator.color = "white";
        this._timeContainer.addChild(this._timeSeparator);

        this._currentTime = this.plugin.create.textField();
        this._timeContainer.addChild(this._currentTime);
        this._currentTime.value = "00:00";
        this._currentTime.width = "40px";
        this._currentTime.height = "100%";
        this._currentTime.lineHeight = "60px";
        this._currentTime.color = "white";
        this._currentTime.fontFamily = "pfdintextprolight,frutigerlight";
        this._currentTime.right = (this._timeContainer.width - this._timeSeparator.x);

        //Seek bar ================================

        this._seekBar = this.plugin.create.canvas();
        this._seekBar.width = "100%";
        this._seekBar.height = 8;
        this._seekBar.bottom = 60;
        this._seekBar.background = "rgb(33, 31, 32)";
        this._seekBar.pointer.enabled = true;
        this._seekBar.pointer.cursor = FORGE.Pointer.cursors.POINTER;
        this._seekBar.pointer.onClick.add(this._seekBarClickHandler, this);
        this._bottomContainer.addChild(this._seekBar);

        //Fullscreen button =================================

        var fsEnterSkin = new FORGE.ButtonSkin("fs-enter");
        fsEnterSkin.out.image = {key: "fs-enter", url: this.plugin.fullUrl+"assets/button-fs-enter.svg"};
        fsEnterSkin.out.autoWidth = false;
        fsEnterSkin.out.autoHeight = false;
        fsEnterSkin.out.align = "center";

        var fsExitSkin = new FORGE.ButtonSkin("fs-exit");
        fsExitSkin.out.image = {key: "fs-exit", url: this.plugin.fullUrl+"assets/button-fs-exit.svg"};
        fsExitSkin.out.autoWidth = false;
        fsExitSkin.out.autoHeight = false;
        fsExitSkin.out.align = "center";

        this._fsButton = this.plugin.create.button({skins:[fsEnterSkin, fsExitSkin], default: "fs-enter"});
        this._fsButton.pointer.enabled = true;
        this._fsButton.pointer.onClick.add(this._fsClickHandler, this);
        this._fsButton.width = 30;
        this._fsButton.height = 30;
        this._fsButton.top = 15;
        this._fsButton.right = 15;
        this._buttonBar.addChild(this._fsButton);

        this.viewer.container.onFullscreenEnter.add(this._onFullscreenEnterHandler, this);
        this.viewer.container.onFullscreenExit.add(this._onFullscreenExitHandler, this);

        //Button showing the current quality in the bottom main button bar ================

        var qualityMenuButtonSkin = new FORGE.ButtonSkin("qualityMenu");
        qualityMenuButtonSkin.out.label = {value: "QUALITY", color: "white", fontFamily: "pfdintextprobold,frutigerbold", fontSize: 18};
        qualityMenuButtonSkin.out.autoWidth = false;
        qualityMenuButtonSkin.out.autoHeight = false;

        this._qualityMenuButton = this.plugin.create.button({skins: [qualityMenuButtonSkin], default: this._qualityNames[0]});
        this._qualityMenuButton.pointer.enabled = true;
        this._qualityMenuButton.pointer.onClick.add(this._qualityMenuBtnClickHandler, this);
        this._qualityMenuButton.width = 80;
        this._qualityMenuButton.height = 60;
        this._qualityMenuButton.right = 65;

        //Spinner ===================================

        this._spinner = this.plugin.create.sprite({url: "assets/spinner/spinner_30x30.png", frames: "assets/spinner/spinner_30x30.json"});
        this._spinner.top = 15;
        this._spinner.right = (this._qualityMenuButton.right + this._qualityMenuButton.pixelWidth / 2) - 15;
        this._spinner.animations.add(null, null, null, 30);
        this._spinner.play(null, true);
        this._spinner.visible = false;

        //Add the spinner then the quality button
        this._buttonBar.addChild(this._spinner);
        this._buttonBar.addChild(this._qualityMenuButton);

        this._setupVideo();
    },

    reset: function()
    {
        this._clearVideo();
        this._setupVideo();
    },

    _setupVideo: function()
    {
        if(this.viewer.renderer.media !== null)
        {
            this._video = this.viewer.renderer.media.displayObject;

            this._video.onQualitiesLoaded.add(this._onQualitiesLoadedHandler, this);
            this._video.onLoadedMetaData.add(this._onLoadedMetaDataHandler, this);
            this._video.onPlay.add(this._onPlayHandler, this);
            this._video.onPause.add(this._onPauseHandler, this);
            this._video.onVolumeChange.add(this._onVolumeChangeHandler, this);
            this._video.onQualityRequest.add(this._onQualityRequestHandler, this);
            this._video.onQualityChange.add(this._onQualityChangeHandler, this);
            this._video.onQualityModeChange.add(this._onQualityModeChangeHandler, this);
        }
        else
        {
            if(this.viewer.renderer.onMediaReady.has(this._setupVideo, this) === false)
            {
                this.viewer.renderer.onMediaReady.addOnce(this._setupVideo, this);
            }
        }
    },

    _clearVideo: function()
    {
        if(this._video !== null)
        {
            this._video.onQualitiesLoaded.remove(this._onQualitiesLoadedHandler, this);
            this._video.onLoadedMetaData.remove(this._onLoadedMetaDataHandler, this);
            this._video.onPlay.remove(this._onPlayHandler, this);
            this._video.onPause.remove(this._onPauseHandler, this);
            this._video.onVolumeChange.remove(this._onVolumeChangeHandler, this);
            this._video.onQualityRequest.remove(this._onQualityRequestHandler, this);
            this._video.onQualityChange.remove(this._onQualityChangeHandler, this);
            this._video.onQualityModeChange.remove(this._onQualityModeChangeHandler, this);
        }

        this._video = null;
    },

    _createQualityUI: function()
    {
        var qualities = this._video.qualities;
        var qualitySkins = [];
        var qualitySkinsSelected = [];
        var skin, btn;
        for(var i = 0, ii = qualities.length; i < ii; i++)
        {
            qualities[i].name = this._qualityNames[i];

            skin = new FORGE.ButtonSkin("light");
            skin.out.label = {value: this._qualityNames[i], color: "white", fontFamily: "pfdintextprolight,frutigerlight", fontSize: 28};
            skin.out.autoWidth = false;
            skin.out.autoHeight = false;
            skin.out.align = "center";
            qualitySkins.push(skin);

            skin = new FORGE.ButtonSkin("bold");
            skin.out.label = {value: this._qualityNames[i], color: "white", fontFamily: "pfdintextprobold,frutigerbold"};
            skin.out.autoWidth = false;
            skin.out.autoHeight = false;
            skin.out.align = "center";
            qualitySkinsSelected.push(skin);
        }

        //Bar that will contain the qualities width 100%
        this._qualityBar = this.plugin.create.displayObjectContainer();
        this._qualityBar.width = "100%";
        this._qualityBar.height = "60px";
        this._qualityBar.background = "rgba(33,31,32,0.50)";
        this._qualityBar.top = 0;
        this._qualityBar.visible = false;
        this._bottomContainer.addChild(this._qualityBar);

        //Highliter
        this._qualityHighlight = this.plugin.create.displayObject();
        this._qualityHighlight.id = "qualityHighlight";
        this._qualityHighlight.width = this._qualityButtonWidth;
        this._qualityHighlight.height = 60;
        this._qualityHighlight.background = "#00A3DA";
        this._qualityBar.addChild(this._qualityHighlight);

        //Container for the buttons
        this._qualityContainer = this.plugin.create.displayObjectContainer();
        this._qualityContainer.width = (qualities.length + 1) * this._qualityButtonWidth;
        this._qualityContainer.height = 60;
        this._qualityContainer.horizontalCenter = true;
        this._qualityBar.addChild(this._qualityContainer);

        //Tween for the quality highlighter
        this._qualityHighlightTween = this.plugin.create.tween(this._qualityHighlight);

        //Skin for the AUTO button
        var skinAuto = new FORGE.ButtonSkin("light");
        skinAuto.out.label = {value: "AUTO", color: "white", fontFamily: "pfdintextprolight,frutigerlight", fontSize: 28};
        skinAuto.out.autoWidth = false;
        skinAuto.out.autoHeight = false;
        skinAuto.out.align = "center";

        var skinAutoSelected = new FORGE.ButtonSkin("bold");
        skinAutoSelected.out.label = {value: "AUTO", color: "white", fontFamily: "pfdintextprobold,frutigerbold", fontSize: 28};
        skinAutoSelected.out.autoWidth = false;
        skinAutoSelected.out.autoHeight = false;
        skinAutoSelected.out.align = "center";

        //The AUTO button
        this._qualityAutoButton = this.plugin.create.button({skins: [skinAuto, skinAutoSelected]});
        this._qualityAutoButton.width = this._qualityButtonWidth;
        this._qualityAutoButton.height = 60;
        this._qualityAutoButton.pointer.onClick.add(this._qualityAutoButtonClickHandler, this);
        this._qualityContainer.addChild(this._qualityAutoButton);

        //Creation of buttons for all the qualities
        this._qualityButtons = [];
        for(var j = 0, jj = qualities.length; j < jj; j++)
        {
            btn = this.plugin.create.button({skins: [qualitySkins[j], qualitySkinsSelected[j]]});
            btn.width = this._qualityButtonWidth;
            btn.height = 60;
            btn.left = this._qualityButtonWidth * (j+1);
            btn.data = {qualityIndex: j};
            btn.pointer.onClick.add(this._qualityButtonClickHandler, this);
            this._qualityContainer.addChild(btn);
            this._qualityButtons.push(btn);
        }

        this._updateQualityButtons();
    },

    _playbackClickHandler: function()
    {
        this._video.togglePlayback();
    },

    _volumeContainerEnterHandler: function()
    {
        this._volumeContainerTween.to({ pixelWidth: 130 }, 100 ).start();
        this._timeContainerTween.to({ left: 220 }, 100 ).start();
    },

    _volumeContainerLeaveHandler: function()
    {
        this._volumeContainerTween.to({ pixelWidth: 30 }, 100 ).start();
        this._timeContainerTween.to({ left: 120 }, 100 ).start();
    },

    _volumeContainerWheelHandler: function(event)
    {
        var modifier = 0.1;
        if(event.data.deltaY > 0)
        {
            modifier *= -1;
        }

        this._video.volume += modifier;
    },

    _volumeClickHandler: function()
    {
        this._video.muted = !this._video.muted;
    },

    _volumeBarClickHandler: function(event)
    {
        var offset = FORGE.Dom.getMouseEventOffset(event.data);
        var volume = offset.x / this._volumeBar.pixelWidth;
        this._video.volume = volume;
    },

    _volumeCursorDragHandler: function(event)
    {
        var progress = this._volumeCursor.drag.progress;
        this._video.volume = progress.x;
    },

    _volumeBarDraw: function()
    {
        var ctx = this._volumeBar.context2D;
        ctx.clearRect(0, 0, this._volumeBar.pixelWidth, this._volumeBar.pixelHeight);

        ctx.fillStyle = "#4A90E2";
        ctx.fillRect(0, 0, this._video.volume * this._volumeBar.pixelWidth, this._volumeBar.pixelHeight);

        this._volumeCursor.x = this._volumeBar.x + (this._video.volume * (this._volumeBar.innerWidth - this._volumeCursor.pixelWidth));
    },

    _fsClickHandler: function()
    {
        this.viewer.fullscreen = !this.viewer.fullscreen;
    },

    _onFullscreenEnterHandler: function()
    {
        this._fsButton.skin = "fs-exit";
    },

    _onFullscreenExitHandler: function()
    {
        this._fsButton.skin = "fs-enter";
    },

    _qualityMenuBtnClickHandler:function()
    {
        this._qualityBar.toggleVisibility();
        this._updateQualityButtons(false);
    },

    _qualityButtonClickHandler: function(event)
    {
        var index = event.emitter.data.qualityIndex
        this._video.quality = index;
    },

    _qualityAutoButtonClickHandler: function()
    {
        this._video.qualityMode = FORGE.VideoQualityMode.AUTO;
    },

    _highlightQualityLabel: function(index)
    {
        this._qualityContainer.children[index].skin = "bold";
        this._qualityHighlightTween.to({ x: this._qualityContainer.x + (index * this._qualityButtonWidth) }, 400).start();
    },

    _updateQualityButtons: function(tween)
    {
        var buttonIndex;
        var buttonBoldIndexes;

        if(this._video.qualityMode === FORGE.VideoQualityMode.AUTO)
        {
            buttonHiglightIndex = 0;
            buttonBoldIndexes = [0, (this._video.currentIndex + 1) ];

            this._qualityMenuButton.skin.out.label = "AUTO";
            this._qualityMenuButton.updateSkin();
        }
        else
        {
            var index = this._video.requestIndex >= 0 ? this._video.requestIndex : this._video.currentIndex;
            buttonHiglightIndex = index + 1;
            buttonBoldIndexes = [buttonHiglightIndex];

            this._qualityMenuButton.skin.out.label = this._qualityNames[index];
            this._qualityMenuButton.updateSkin();
        }

        var highlighterX = this._qualityContainer.x + (buttonHiglightIndex * this._qualityButtonWidth);
        if(tween === false)
        {
            this._qualityHighlight.x = highlighterX;
        }
        else
        {
            this._qualityHighlightTween.to({ x: highlighterX }, 400).start();
        }

        for(var i = 0, ii = this._qualityContainer.children.length; i < ii; i++)
        {
            this._qualityContainer.children[i].skin = buttonBoldIndexes.indexOf(i) !== -1 ? "bold" : "light";
        }
    },

    _onQualityRequestHandler: function(event)
    {
        if(this._video.qualityMode === FORGE.VideoQualityMode.MANUAL && this._qualityContainer !== null)
        {
            this._updateQualityButtons();
            this._spinner.visible = true;
        }
    },

    _onQualityChangeHandler: function()
    {
        if(this._video.qualityMode === FORGE.VideoQualityMode.AUTO && this._qualityContainer !== null)
        {
            this._updateQualityButtons();
        }

        this._spinner.visible = false;
    },

    _onQualityModeChangeHandler: function()
    {
        if(this._qualityContainer !== null)
        {
            this._updateQualityButtons();
        }
    },

    _onLoadedMetaDataHandler: function()
    {
        this._totalTime.value = FORGE.Utils.formatTime(this._video.duration, "M:S");
    },

    _onQualitiesLoadedHandler: function()
    {
        this._createQualityUI();
    },

    _onPlayHandler: function()
    {
        this._hideSplash();
        this._playbackButton.setSkin("pause");
    },

    _onPauseHandler: function()
    {
        this._playbackButton.setSkin("play");
    },

    _onVolumeChangeHandler: function()
    {
        this._volumeButtonUpdate();
        this._volumeBarDraw();
    },

    _volumeButtonUpdate: function()
    {
        var v = this._video.volume;

        if(v == 0)
        {
            this._volumeButton.skin = "volume-0";
        }
        else if(v > 0 && v <= 0.5)
        {
            this._volumeButton.skin = 'volume-1';
        }
        else
        {
            this._volumeButton.skin = 'volume-2';
        }
    },

    _splashClickHandler: function()
    {
        this._video.play();
    },

    _hideSplash: function()
    {
        this._splash.pointer.enabled = false;

        this._splashTween = this.plugin.create.tween(this._splash).to({ alpha: 0 }, 200 );
        this._splashTween.start();

        if(this._poster !== null)
        {
            this._posterTween = this.plugin.create.tween(this._poster).to({ alpha: 0 }, 200 );
            this._posterTween.start();
        }
    },

    _onMouseMove: function(event)
    {
        if(this._bottomContainerTweening == true)
        {
            return;
        }

        var offset = FORGE.Dom.getMouseEventOffset(event.data);
        if(offset.y > this.viewer.container.pixelHeight - 130)
        {
            this._showButtonBar();
        }
        else
        {
            if(this._video !== null && this._video.playing === true && this._bottomContainer.bottom === 0)
            {
                this._hideButtonBar();
            }
        }
    },

    _onMouseLeave: function(event)
    {
        if(this._video.playing === true)
        {
            this._hideButtonBar();
        }
    },

    _bottomContainerTweenComplete: function()
    {
        this._bottomContainerTweening = false;
    },

    _showButtonBar: function()
    {
        this._bottomContainerTweening = true;
        this._bottomContainerTween.to({ bottom: 0 }, 100).start();
    },

    _hideButtonBar: function()
    {
        this._bottomContainerTweening = true;
        this._bottomContainerTween.to({ bottom: -60 }, 150).start();
        if(this._qualityBar !== null)
        {
            this._qualityBar.hide();
        }
    },

    _seekBarClickHandler: function(event)
    {
        var offset = FORGE.Dom.getMouseEventOffset(event.data);
        var time = offset.x / this._seekBar.pixelWidth * this._video.duration;
        this._video.currentTime = time;
    },

    _seekBarDraw: function()
    {
        ctx = this._seekBar.context2D;
        ctx.clearRect(0, 0, this._seekBar.pixelWidth, this._seekBar.pixelHeight);

        ctx.fillStyle = "rgba(74, 144, 226, 0.5)";

        var buffer = this._video.buffer;

        if(buffer === null)
        {
            return;
        }

        var range, start, end;
        var i = buffer.length;

        while(i--)
        {
            if(buffer.length === 0) continue;

            range = buffer.getTimeRange(i);

            if(typeof range === "undefined") continue;

            start = range.start / this._video.duration * this._seekBar.pixelWidth;
            end = range.end / this._video.duration * this._seekBar.pixelWidth;
            ctx.fillRect(start, 0, end - start, this._seekBar.pixelHeight);
        }

        ctx.fillStyle = "rgb(74, 144, 226)";
        ctx.fillRect(0, 0, this._video.currentTime / this._video.duration * this._seekBar.pixelWidth, this._seekBar.pixelHeight);
    },

    update: function()
    {
        if(this._video === null)
        {
            return;
        }

        this._seekBarDraw();
        this._volumeBarDraw();

        this._currentTime.value = FORGE.Utils.formatTime(this._video.currentTime, "M:S");
    },

    destroy: function()
    {
        this.viewer.container.pointer.onMove.remove(this._onMouseMove, this);
        this.viewer.container.pointer.onLeave.remove(this._onMouseLeave, this);

        this._clearVideo();

        this._splash = null;
        this._splashTween = null;

        this._bottomContainer = null;
        this._bottomContainerTween = null;
        this._bottomContainerTweening = false;

        this._seekBar = null;

        this._buttonBar = null;
        this._playbackButton = null;

        this._volumeContainer = null;
        this._volumeContainerTween = null;
        this._volumeButton = null;
        this._volumeContainer = null;
        this._volumeBar = null;
        this._volumeCursor = null;

        this._timeContainer = null;
        this._timeContainerTween = null;
        this._currentTime = null;
        this._timeSeparator = null;
        this._totalTime = null;

        this._fsButton = null;
        this._qualityButton = null;

        this._qualityBar = null;
        this._qualityContainer = null;
        this._qualityButtons = null;
        this._qualityHighlight = null;
        this._qualityHighlightTween = null;
    }
};