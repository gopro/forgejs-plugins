var ForgePlugins = ForgePlugins || {};

/**
 * This plugin displays a simple google maps, that can be loaded with GPX data.
 */
ForgePlugins.GoogleMaps = function()
{
    // The reference to the video, for synchronization
    this._video = null;

    // Main container of the plugin
    this._container = null;

    // Tween allowing animation of the container
    this._containerTween = null;

    // Is any GPX loaded
    this._gpxLoaded = false;

    // The Google maps object
    this._map = null;

    // Array containing each point to draw on the maps
    this._points = [];

    // The bounds where the map is centered
    this._bounds = null;

    // The line describing the path to follow
    this._poly = null;

    // Marker indicating the current position
    this._marker = null;

    // Reference for the previous point
    this._prevPoint = null;

    // Reference for the next point
    this._nextPoint = null;

    // The style of the Google maps
    // See https://developers.google.com/maps/documentation/javascript/styling
    this._style = null;
};

ForgePlugins.GoogleMaps.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        // Setup the reference to the video
        this._setupVideo();

        if (typeof google === "undefined" || !("maps" in google))
        {
            this._loadGoogleMapScript();
        }
    },

    /**
     * The reset function, reload the gpx and synchronize it given the new video
     * of the scene.
     */
    reset: function()
    {
        if (this._poly !== null)
        {
            this._poly.setMap(null);
            this._poly = null;
        }

        if (this._marker !== null)
        {
            this._marker.setMap(null);
            this._marker = null;
        }

        this._points = [];
        this._gpxLoaded = false;

        this._clearVideo();
        this._setupVideo();

        if (typeof google !== "undefined" && "maps" in google)
        {
            this._createMap();
            this._loadGpx();
        }
    },

    /**
     * Setup a video as media or plugin
     */
    _setupVideo: function()
    {
        if (this.plugin.options.source === "media")
        {
            this._video = this.viewer.story.scene.media.displayObject;
        }
        else if (FORGE.UID.isTypeOf(this.plugin.options.source, "Plugin") === true)
        {
            var plugin = FORGE.UID.get(this.plugin.options.source);

            if (plugin.instanceReady === true)
            {
                this._video = plugin.instance.video;
            }
            else
            {
                if (plugin.onInstanceReady.has(this._setupVideo, this) === false)
                {
                    plugin.onInstanceReady.addOnce(this._setupVideo, this);
                }
            }
        }
    },

    /**
     * Clean the video object
     */
    _clearVideo: function()
    {
        this._video = null;
    },

    /**
     * Load the Google Maps script
     */
    _loadGoogleMapScript: function()
    {
        var key = this.plugin.data.googleMapsKey;

        if (typeof key === "string" && key !== "")
        {
            this.viewer.load.script("https://maps.googleapis.com/maps/api/js?key=" + key, this._googleMapScriptLoadComplete, this);
        }
        else
        {
            this.plugin.warn("Plugin maps can't load the google maps script: wrong API key!");
        }
    },

    /**
     * Actions to do on Google Maps script loaded
     */
    _googleMapScriptLoadComplete: function()
    {
        this._createMap();
        this._loadGpx();
    },

    /**
     * Create the container and the map
     */
    _createMap: function()
    {
        // Create the container for the maps
        this._container = this.plugin.create.displayObjectContainer();

        // Set properties to the container
        this._container.width = this.plugin.options.width;
        this._container.height = this.plugin.options.height;
        this._container.top = this.plugin.options.top;
        this._container.left = this.plugin.options.left;
        this._container.right = this.plugin.options.right;
        this._container.bottom = this.plugin.options.bottom;

        // Add events with the mouse
        this._container.pointer.enabled = true;
        this._container.drag.enabled = true;
        this._container.pointer.onOver.add(this._onMouseOver, this);
        this._container.pointer.onOut.add(this._onMouseOut, this);

        // Add it to the main container
        this.plugin.container.addChild(this._container);

        // Tween on the container for animation when hovering
        this._containerTween = this.plugin.create.tween(this._container);
        this._containerTween.onProgress.add(this._tweenProgressHandler, this);
        this._containerTween.onComplete.add(this._tweenProgressHandler, this);

        // Instantiate the google map
        this._map = new google.maps.Map(this._container.dom,
        {
            disableDefaultUI: true,
            styles: this.plugin.options.googleMapsStyle
        });
    },

    /**
     * Load the GPX data
     */
    _loadGpx: function()
    {
        var gpx = this.plugin.data.gpx;

        if (typeof gpx === "string" && gpx !== "")
        {
            this.viewer.load.xml(this.plugin.uid + "_gpx", gpx, this._gpxLoadComplete.bind(this), this);
        }
        else
        {
            this.plugin.warn("Plugin maps can't load gpx track: invalid URL!");
        }
    },

    /**
     * On GPX loaded, read and parse it to create a Google Maps Marker.
     */
    _gpxLoadComplete: function(file)
    {
        // Init the bounds
        this._bounds = new google.maps.LatLngBounds();

        // Root of the GPX file
        var trkpt = file.data.getElementsByTagName("trkpt");

        // Point, latitude, longitude, timestamp
        var pt, lat, lon, ts;

        // For each point in the GPX file
        for (var i = 0, ii = trkpt.length; i < ii; i++)
        {
            lat = trkpt[i].getAttribute("lat");
            lon = trkpt[i].getAttribute("lon");
            pt = new google.maps.LatLng(lat, lon);

            pt.time = new Date(trkpt[i].getElementsByTagName("time")[0].textContent);

            // Add it to the list
            this._points.push(pt);

            // Extends the bounds with the last point
            this._bounds.extend(pt);
        }

        // Sort point by time
        this._points.sort(function(a, b)
        {
            return a.time - b.time;
        });

        var timeRef = new Date(this._points[0].time);

        // Set the time from the reference point (first position)
        this._points.forEach(function(e, i, a)
        {
            e.time = (e.time - timeRef) / 1000;
        });

        // Draw the line given the point from the GPX
        this._poly = new google.maps.Polyline(
        {
            path: this._points,
            strokeColor: this.plugin.options.strokeColor,
            strokeOpacity: this.plugin.options.strokeOpacity,
            strokeWeight: this.plugin.options.strokeWeight
        });

        // Add the line to the map
        this._poly.setMap(this._map);

        // Create a marker to follow the progression
        var marker = this.plugin.options.marker;

        var icon =
        {
            origin: new google.maps.Point(0, 0)
        }

        // Load the image of the marker if necessary
        if (typeof marker === "object" && marker !== null)
        {
            if(typeof marker.url === "string")
            {
                icon.url = marker.url;
            }

            if(typeof marker.width === "number" && typeof marker.height === "number")
            {
                icon.size = new google.maps.Size(marker.width, marker.height);
            }

            if(typeof marker.anchorX === "number" && typeof marker.anchorY === "number")
            {
                icon.size = new google.maps.Size(marker.anchorX, marker.anchorY);
            }
        }

        if(typeof icon.url !== "string")
        {
            icon = null;
        }

        this._marker = new google.maps.Marker(
        {
            position: this._points[0],
            title: this.plugin.options.marker.title,
            icon: icon
        });

        // Link the marker to the map
        this._marker.setMap(this._map);

        // Extends the bounds again with the marker
        this._bounds.extend(this._marker.position);

        // Make the map fit those bounds
        this._map.fitBounds(this._bounds);

        // Event binder when clicking on the line representing the movement
        google.maps.event.addListener(this._poly, 'click', this._polyClickHandler.bind(this));

        // GPX is fully loaded
        this._gpxLoaded = true;
    },

    /**
     * Mouse over handler, extends the size of the map using the tween.
     */
    _onMouseOver: function()
    {
        this._containerTween.to(
        {
            width: this.plugin.options.overWidth,
            height: this.plugin.options.overHeight
        }, 150).start();
    },

    /**
     * Mouse out handler, reduces the size of the map using the tween.
     */
    _onMouseOut: function()
    {
        this._containerTween.to(
        {
            width: this.plugin.options.width,
            height: this.plugin.options.height
        }, 150).start();
    },

    /**
     * When the tween is executing, adapt the map to its new bounds.
     */
    _tweenProgressHandler: function()
    {
        this._map.fitBounds(this._bounds);
        google.maps.event.trigger(this._map, 'resize');
    },

    /**
     * Handle the click on the line, and move the timestamp of the video to the
     * timestamp bind to the new position on the line.
     */
    _polyClickHandler: function(event)
    {
        var time = this._getTimeFromPos(event.latLng);
        this._video.currentTime = time;
    },

    /**
     * Get the time given a space position (latitude and longitude)
     */
    _getTimeFromPos: function(pPos)
    {
        // Get the interval between points
        var idx = this._points.indexOf(this._getClosestPointFromLatLng(pPos));
        var inter = {
            prev: idx > 0 ? idx - 1 : this._points.length,
            next: idx
        };

        var distSeg = google.maps.geometry.spherical.computeDistanceBetween(this._points[inter.prev], this._points[inter.next]);
        var distPrevToPos = google.maps.geometry.spherical.computeDistanceBetween(this._points[inter.prev], pPos);

        var ratioPosSeg = distPrevToPos / distSeg;

        var totalSegTime = this._points[inter.next].time - this._points[inter.prev].time;

        var time = this._points[inter.prev].time + (totalSegTime * ratioPosSeg);

        return time;
    },

    /**
     * Get the closest point given a latitude and longitude (when a click occurs
     * on the map, it isn't always exactly on the tracking line).
     */
    _getClosestPointFromLatLng: function(pLatLng)
    {
        var bestDist = Infinity;
        var index = -1;

        var dist, i;

        for (var i = 0, ii = this._points.length; i < ii; i++)
        {
            dist = google.maps.geometry.spherical.computeDistanceBetween(pLatLng, this._points[i]);

            if (dist < bestDist)
            {
                bestDist = dist;
                index = i;
            }
        }

        return this._points[index];
    },

    /**
     * Get the position given a time.
     */
    _getPosFromTime: function(pTime)
    {
        if (!this._prevPoint || !this._nextPoint || (this._nextPoint !== null && this._points[this._nextPoint].time <= pTime) || (this._prevPoint && this._points[this._prevPoint].time > pTime))
        {
            this._updateInterPointsFromTime(pTime);
        }

        if (this._nextPoint === null || this._prevPoint === null)
        {
            return null;
        }

        var ratioTimeSeg = (pTime - this._points[this._prevPoint].time) / (this._points[this._nextPoint].time - this._points[this._prevPoint].time);

        var distLat = this._points[this._nextPoint].lat() - this._points[this._prevPoint].lat();
        var distLng = this._points[this._nextPoint].lng() - this._points[this._prevPoint].lng();

        var lat = this._points[this._prevPoint].lat() + distLat * ratioTimeSeg;
        var lng = this._points[this._prevPoint].lng() + distLng * ratioTimeSeg;

        var pos = new google.maps.LatLng(lat, lng);

        return pos;
    },

    /**
     * Set the previous and next points given a time
     */
    _updateInterPointsFromTime: function(pTime)
    {
        for (var i = 0, ii = this._points.length, p; i < ii; i++)
        {
            p = this._points[i];

            if (pTime >= p.time && typeof this._points[i + 1] !== "undefined" && pTime < this._points[i + 1].time)
            {
                this._prevPoint = i;
                this._nextPoint = i + 1;
                break;
            }
        }
    },

    /**
     * Update the position of the marker given the current time
     */
    update: function()
    {
        if (this._gpxLoaded === false || this._video.playing === false || (this._video.duration - this._video.currentTime) < 1)
        {
            return;
        }

        var time = this._video.currentTime;
        var pos = this._getPosFromTime(time);

        if (pos !== null)
        {
            this._marker.setPosition(pos);
        }
    },

    /**
     * Destroy routine
     */
    destroy: function()
    {
        if (typeof google !== "undefined" && "maps" in google && this._poly !== null)
        {
            google.maps.event.clearListeners(this._poly, 'click');
        }

        this._video = null;
        this._container = null;
        this._containerTween = null;
        this._map = null;
        this._points = null;
        this._bounds = null;
        this._poly = null;
        this._marker = null;
        this._gpxLoadCompleteBind = null;
        this._polyClickBind = null;
    }

};