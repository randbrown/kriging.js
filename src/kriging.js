/**
  *
  * kriging.js
  *
  * Copyright 2012
  */


/**
 * Extend the Array class
 */
Array.prototype.max = function() {
  return Math.max.apply(null, this)
}

Array.prototype.min = function() {
  return Math.min.apply(null, this)
}

Array.prototype.mean = function() {
  for(var i=0, sum=0; i<this.length;i++) {
    sum += this[i];
  }
  return sum / this.length;
}

/* Linear algebra functions */
Array.prototype.inverse = function() {
  var n = this.length;
  var m = this.length[0];

  
}

/* Point-in-polygon */
var pip = function(X, Y, x, y) {
  var i, j;
  var c = false;
  for(i=0, j=X.length-1; i<X.length; j = i++) {
    if( ((Y[i]>y) != (Y[j]>y)) && (x<(X[j]-X[i]) * (y-Y[i]) / (Y[j]-Y[i]) + X[i]) ) {
      c = !c;
    }
  }
  return c;
}


/**
 * Defines the kriging class
 * 
 */
function kriging(id) {
  /* Output testing */
  var o = document.getElementById("output");

  /* Global vars */
  var canvaspad = 50;
  var pixelsize = 4;
  var yxratio = 1;

  /* Canvas element */
  var canvasobj = document.getElementById(id);
  this.canvas = document.getElementById(id);
  this.canvas.ctx = this.canvas.getContext("2d");


  /* Kriging method 
   * Usage: kriging(longitude, latitude, response, polygons)
   */
  this.krig = function(x, y, response, polygons) {
    /* Bring the polygons and frame properties into the DOM */
    this.canvas.polygons = polygons;
   
    /**
      * Calculate the euclidean distance matrix for the coordinates 
      * and the outcome variable
      */
    var i, j, k;
    var n = response.length;
    var p = 2;
    var D = new Array(n);
    var V = new Array(n);
    for(i=0; i<n; i++) {
      D[i] = new Array(n);
      V[i] = new Array(n);
      for(j=0; j<n; j++) { 
        D[i][j] = Math.sqrt(Math.pow(x[i]-x[j], 2) + Math.pow(y[i]-y[j], 2));
        V[i][j] = Math.abs(response[i] - response[j]);
      }
    }

    /* Fit the observations to the variogram */
    var lags = 10;
    cutoff = Math.sqrt(Math.pow(x.max() - x.min(), 2) + Math.pow(y.max() - y.min(), 2)) / 3;
    for(i=cutoff/lags; i<=cutoff; i+=cutoff/lags) {
        
    }

    /* Model parameters */
    this.canvas.model = new Object();
    this.canvas.model.nugget = 0;
    this.canvas.model.range = 0;
    this.canvas.model.sill = 0;
  }


  /**
   * Set up the map properties, event handlers and initialize the map.
   */
  this.map = function(center, zoom) {
    /* Set up the canvas frame */
    this.canvas.height = window.innerHeight - this.canvas.offsetTop - canvaspad;
    this.canvas.style.border = "";


    /**
     * Loop through the polygons to determine the limits based on the 
     * area of each of the polygons.
     * AND
     * Create an Array containing the center coordinates for each polygon 
     * to be used during the sorting algorithm. 
     */
    var i, j;
    this.canvas.polygoncenters = new Array(this.canvas.polygons.length);
    this.canvas.polygonsorted = new Array(this.canvas.polygons.length);

    for(i=0;i<this.canvas.polygons.length;i++) {
      if(i==0) {
	this.canvas.xlim = [this.canvas.polygons[i][0].min(), this.canvas.polygons[i][0].max()];
      }
      else {
        if(this.canvas.polygons[i][0].min()<this.canvas.xlim[0]) this.canvas.xlim[0] = this.canvas.polygons[i][0].min();
        if(this.canvas.polygons[i][0].max()>this.canvas.xlim[1]) this.canvas.xlim[1] = this.canvas.polygons[i][0].max();
      }
      this.canvas.polygoncenters[i] = [this.canvas.polygons[i][0].mean(), this.canvas.polygons[i][1].mean()];
      this.canvas.polygonsorted[i] = 0;
    }


    /**
     * Calculate the ratio and pixel size for conversion 
     * between units.
     */
    this.canvas.xratio = (this.canvas.xlim[1]-this.canvas.xlim[0]) / this.canvas.width;
    this.canvas.yratio = this.canvas.xratio * yxratio;

    this.canvas.xlim = [center[0] - 0.5 * this.canvas.width * this.canvas.xratio, center[0] + 0.5 * this.canvas.width * this.canvas.xratio];
    this.canvas.ylim = [center[1] - 0.5 * this.canvas.height * this.canvas.yratio, center[1] + 0.5 * this.canvas.height * this.canvas.yratio];

    this.canvas.xpixel = pixelsize * this.canvas.xratio;
    this.canvas.ypixel = pixelsize * this.canvas.yratio;


    /* Mouse event properties */
    this.canvas.mousex = 0;
    this.canvas.mousey = 0;
    this.canvas.startx = 0;
    this.canvas.starty = 0;
    this.canvas.mousedown = false;

    /* Resize event handlers */
    window.onresize = function(e) {
      canvasobj.height = window.innerHeight - canvasobj.offsetTop - canvaspad;
      canvasobj.ylim[0] = canvasobj.ylim[1] - canvasobj.height * canvasobj.yratio;
      canvasobj.render();
    }


    /**
     * Mouse event handlers  
     */
    document.addEventListener("mousemove", function(e) {
      /* Reset mouse coordinates */
      canvasobj.mousex = e.pageX - canvasobj.offsetLeft;
      canvasobj.mousey = e.pageY - canvasobj.offsetTop;

     /* Drag the map if mouse is clicked */
      if(canvasobj.mousedown) {
	//document.onselectstart = function() { return false; }

        canvasobj.xlim = [canvasobj.xlim[0] + canvasobj.xratio*(canvasobj.startx-canvasobj.mousex), canvasobj.xlim[1] + canvasobj.xratio*(canvasobj.startx-canvasobj.mousex)]; 
        canvasobj.ylim = [canvasobj.ylim[0] - canvasobj.yratio*(canvasobj.starty-canvasobj.mousey), canvasobj.ylim[1] - canvasobj.yratio*(canvasobj.starty-canvasobj.mousey)]; 
        canvasobj.startx = canvasobj.mousex;
        canvasobj.starty = canvasobj.mousey;
        canvasobj.render();
      }
    });

    this.canvas.addEventListener("mousedown", function(e) {
      this.startx = this.mousex;
      this.starty = this.mousey;
      this.mousedown = true;
    });

    document.addEventListener("mouseup", function(e) {
      canvasobj.mousedown = false;
    });


    /**
     * Navigation event handlers (zoom-in / zoom-out buttons)
     */
    var zoomin = document.createElement("input");
    var zoomout = document.createElement("input");
    zoomin.style.position = "absolute";
    zoomout.style.position = "absolute";
    zoomout.style.top = zoomin.size*2;
    zoomin.type = "button";
    zoomout.type = "button";
    zoomin.value = "+";
    zoomout.value = "~";
    zoomin.onclick = function() { canvasobj.zoom(0.8, yxratio, pixelsize);}
    zoomout.onclick = function() { canvasobj.zoom(1.2, yxratio, pixelsize);}
    this.canvas.parentNode.insertBefore(zoomin, this.canvas);
    this.canvas.parentNode.insertBefore(zoomout, this.canvas);
    
    /* Start the map */
    this.canvas.zoom(zoom, yxratio, pixelsize);
  }


  /**
   * Navigation
   */
  this.canvas.zoom = function(zoom, yxratio, pixelsize) {
    /* Re-size the limits */
    var newlen = [zoom * (this.xlim[1]-this.xlim[0])/2,
                  zoom * (this.ylim[1]-this.ylim[0])/2];
    var center = [(this.xlim[1]-this.xlim[0])/2 + this.xlim[0], 
                  (this.ylim[1]-this.ylim[0])/2 + this.ylim[0]];

    /* Reset the properties */
    this.xlim = [center[0]-newlen[0], center[0]+newlen[0]];
    this.ylim = [center[1]-newlen[1], center[1]+newlen[1]];
    this.xratio = (this.xlim[1]-this.xlim[0]) / this.width;
    this.yratio = this.xratio * yxratio;
    this.xpixel = pixelsize * this.xratio;
    this.ypixel = pixelsize * this.yratio;

    /* Render the map */
    this.render();
  }


  /** 
   * Methods for drawing onto the canvas
   */
  this.canvas.render = function() {
    this.clear();
    this.background();
  }  

  this.canvas.pixel = function(x, y, col) {
    this.ctx.fillStyle = col;
    this.ctx.fillRect((x-this.xlim[0])/this.xratio - pixelsize/2 + 1, this.height - (y-this.ylim[0])/this.yratio - pixelsize/2 + 1, pixelsize - 2, pixelsize - 2);
  }
  
  this.canvas.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }


  /* Fills the background with the polygons */
  this.canvas.background = function() {
    /**
      * 1) Nearest-neighbor
      * 2) Loop through sorted polygons 
      * 3) Point-in-polygon for eligible points
      * 4) Break if no points in polygon
      */

    var i, j, k;
    for(i=0; i<this.polygoncenters.length; i++) {
      this.polygonsorted[i] = Math.sqrt(Math.pow(this.polygoncenters[i][0] - this.xlim.mean(), 2) + Math.pow(this.polygoncenters[i][1] - this.ylim.mean(), 2));
    }
    var maxVal = this.polygonsorted.max();
    var nearest = this.polygonsorted.indexOf(this.polygonsorted.min());
    var xbox = [0,0];
    var ybox = [0,0];

    for(i=0;i<this.polygons.length;i++) {
      /* Calculate the intersecting box */
      if(this.xlim[0]>this.polygons[nearest][0].min()) xbox[0] = this.xpixel * Math.floor(this.xlim[0]/this.xpixel);
      else xbox[0] = this.xpixel * Math.floor(this.polygons[nearest][0].min()/this.xpixel);

      if(this.xlim[1]<this.polygons[nearest][0].max()) xbox[1] = this.xpixel * Math.ceil(this.xlim[1]/this.xpixel);
      else xbox[1] = this.xpixel * Math.ceil(this.polygons[nearest][0].max()/this.xpixel);

      if(this.ylim[0]>this.polygons[nearest][1].min()) ybox[0] = this.ypixel * Math.floor(this.ylim[0]/this.ypixel);
      else ybox[0] = this.ypixel * Math.floor(this.polygons[nearest][1].min()/this.ypixel);

      if(this.ylim[0]<this.polygons[nearest][1].max()) ybox[1] = this.ypixel * Math.ceil(this.ylim[1]/this.ypixel);
      else ybox[1] = this.ypixel * Math.ceil(this.polygons[nearest][1].max()/this.ypixel);

      for(j = xbox[0]; j <= xbox[1]; j += this.xpixel) {
        for(k = ybox[0]; k <= ybox[1]; k += this.ypixel) {
	    if(pip(this.polygons[nearest][0], this.polygons[nearest][1], j, k)) {
	      this.pixel(j, k, "black");
	    }
        }
      }

      this.polygonsorted[nearest] = maxVal;
      nearest = this.polygonsorted.indexOf(this.polygonsorted.min());

    }
  }

  return true;
}