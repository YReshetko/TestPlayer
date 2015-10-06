/**
 * Created by Даша on 02.05.15.
 */

InteractiveTask.ListingImagesController = function (options) {
    this.xml = options.xml;
    this.controller = options.controller;
    this.path = InteractiveTask.PATH;
};
InteractiveTask.ListingImagesController.prototype.addToLayer = function(layer){
	this.handler.addToLayer(layer);
	layer.add(this.resultArea);
	layer.add(this.resultText);
	var handler = this.handler;
	var resultText = this.resultText;
	var control =  this.controller;
	var picturesCount = this.picturesCount;
	layer.on('click tap', function () {
		//updating result
		if (handler.checkImages()){
			resultText.setText(handler.completedImagesCount + ' / ' + picturesCount);
		};
		layer.draw();
		control.checkTask();
	});
};
InteractiveTask.ListingImagesController.prototype.init = function () {
    var imageObjs = new Array(),
        pwidth = this.controller.player.width,
        pheight = this.controller.player.height,
        x = parseInt(this.xml.X), y = parseInt(this.xml.Y),
        fileNames = this.xml.SETTINGS.LISTINGIMAGES.NAMESPACE.FILENAME,
	    picturesCount = this.picturesCount = fileNames.length,
        layer = this.ObjLayer, sample, thiscontroller = this,
        i, j,
    //config for creating pieces handler
        conf = {
            numLine: parseInt(this.xml.SETTINGS.LISTINGIMAGES.NUMLINE),
            numCol: parseInt(this.xml.SETTINGS.LISTINGIMAGES.NUMCOLUMN),
            width: parseInt(this.xml.SETTINGS.LISTINGIMAGES.WIDTH),
            height: parseInt(this.xml.SETTINGS.LISTINGIMAGES.HEIGHT),
            path: this.path
        };
    //creating images from array of file names isDone field described that image collectedor not, img - image
    this.handler = new PiecesHandler(conf, fileNames);
	//this.handler.addToLayer(layer);

    //creating rectangle with count of completed images
    this.resultArea = new Konva.Rect({
        width: 100,
        height: 30,
        stroke: 'black',
        strokeWidth: 2,
        x: pwidth / 2 - 100,
        y: pheight - 35
    });

    this.resultText = new Konva.Text({
        x: this.resultArea.getX(),
        y: this.resultArea.getY(),
        text: this.handler.completedImagesCount + ' / ' + picturesCount,
        width: this.resultArea.getWidth(),
        fontSize: 30,
        align: 'center',
        fill: 'black'
    });




    this.getResult = function () {
        return this.handler.isComplete();
    };
};

InteractiveTask.ListingImagesController.prototype.isComplate = function () {
    return this.getResult();
};
InteractiveTask.ListingImagesController.prototype.clear = function(){
	InteractiveTask.disposeObject(this);
};

function PiecesHandler(conf, fileNames) {
    this.imageObjs = [];
    this.completedImagesCount = 0;
    this.completed = {};
    for (var i in fileNames) {

        var name = fileNames[i]['#text'];
        if (!!name) {
            imageObj = {isDone: false};
            imageObj.img = InteractiveTask.LIBRARY.getImage(name);
            this.imageObjs.push(imageObj);
        };

    };

    this.piecesArray = [];
        item = 0;
        picturesCount = fileNames.length;

    var data = {
        pieceWidth: conf.width,
        pieceHeight: conf.height,
        imageObjects: this.imageObjs,
        picturesCount: picturesCount,

    };
    for (i = 0; i < conf.numCol; i++) {
        for (j = 0; j < conf.numLine; j++) {

            var imageId = Math.floor(Math.random() * picturesCount);
            data.imageId = imageId;
            data.i = i;
            data.j = j;
            this.piecesArray[item] = new PieceItem(data);
            item++;
        };
    };


};

PiecesHandler.prototype.checkImages = function () {
    imageId = this.piecesArray[0].imageId;
    for (var i in this.piecesArray) {
        if (this.piecesArray[i].imageId !== imageId) {
            return false;
        };
    };
    this.completed[imageId] = true;
    this.completedImagesCount = Object.keys(this.completed).length;
    this.shuffle();
    return true;
};

PiecesHandler.prototype.shuffle = function () {
    for (var i in this.piecesArray) {
        var piece = this.piecesArray[i];
        var imageId = Math.floor(Math.random() * picturesCount);
        piece.imageId = imageId;
        piece.imgObj.setImage(this.imageObjs[imageId].img);
    };
};

PiecesHandler.prototype.addToLayer = function (layer) {
    for (var i in this.piecesArray) {
        layer.add(this.piecesArray[i].imgObj);
    };
};

PiecesHandler.prototype.isComplete = function () {
    return this.completedImagesCount == picturesCount;
};


function PieceItem(data) {
    var that = this;

    that.imageId = data.imageId;
    that.imgObj = new Konva.Image({
        image: data.imageObjects[that.imageId].img,
        crop: {
            x: data.i * data.pieceWidth,
            y: data.j * data.pieceHeight,
            width: data.pieceWidth,
            height: data.pieceHeight
        },
        x: data.i * data.pieceWidth + data.i,
        y: data.j * data.pieceHeight + data.j,
        width: data.pieceWidth,
        height: data.pieceHeight
    });

    that.imgObj.on('click tap', function () {

        that.imageId = (that.imageId + 1 >= data.picturesCount) ? 0 : that.imageId + 1;
        this.setImage(data.imageObjects[that.imageId].img);
    });


    return that;
};