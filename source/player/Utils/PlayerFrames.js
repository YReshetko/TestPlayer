/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 23.05.15
 * Time: 19:26
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.TestChangeFrame = function(width, height, controller){
	this.width = width;
	this.height = height;

	this.successFrame = new Konva.Group();
	this.failFrame = new Konva.Group();
	this.waitFrame = new Konva.Group();

	this.controller = controller;

	var successBackground = new Konva.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColorFlashToCanvasRGBA("0x999999", 0.2),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 0),
		strokeWidth : 1
	});

	var failBackground = new Konva.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColorFlashToCanvasRGBA("0x999999", 0.2),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 0),
		strokeWidth : 1
	});

	var waitBackground = new Konva.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColorFlashToCanvasRGBA("0xBBBBBB", 1),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 1),
		strokeWidth : 1
	});

	var successImage = new Konva.Image({
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.GOOD_FRAME)
	});
	var failImage = new Konva.Image({
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.BAD_FRAME)
	});
	this.waitSprite = new Konva.Sprite({
		x : 0,
		y : 0,
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.WAIT_FRAME),
		animation : 'standing',
		animations : {
			standing: InteractiveTask.CONST.WAIT_FRAME_POSITION
		},
		frameRate :10,
		frameIndex : 0
	});

	this.successFrame.add(successBackground);
	this.successFrame.add(successImage);
	successImage.x((this.width-successImage.width())/2);
	successImage.y((this.height-successImage.height())/2);

	this.failFrame.add(failBackground);
	this.failFrame.add(failImage);
	failImage.x((this.width-failImage.width())/2);
	failImage.y((this.height-failImage.height())/2);

	this.waitFrame.add(waitBackground);
	this.waitFrame.add(this.waitSprite);
	this.waitSprite.x((this.width-InteractiveTask.CONST.WAIT_FRAME_POSITION[2])/2);
	this.waitSprite.y((this.height-InteractiveTask.CONST.WAIT_FRAME_POSITION[3])/2);

	this.isWait = false;
	this.isSuccess = false;
	this.isFail = false;
	//this.layer = new Konva.Layer();
};
InteractiveTask.TestChangeFrame.prototype.setFscreenButton = function(value){
	this.button = value;
};

InteractiveTask.TestChangeFrame.prototype.success = function(){
	this.isSuccess = true;
	this._addFrame(this.successFrame);
	var self = this.controller;
	this.successFrame.on("mousedown touchstart", function(){
		InteractiveTask.AUDIO.clear();
		this.off("mousedown touchstart");
		self.startCurrentTask();
	});
};
InteractiveTask.TestChangeFrame.prototype.fail = function(){
	this.isFail = true;
	this._addFrame(this.failFrame);
	var self = this.controller;
	this.failFrame.on("mousedown touchstart", function(){
		InteractiveTask.AUDIO.clear();
		this.off("mousedown touchstart");
		self.startCurrentTask();
	});
};
InteractiveTask.TestChangeFrame.prototype.wait = function(){
	this.isWait = true;
	this._addFrame(this.waitFrame);
	this.waitSprite.start();
};
InteractiveTask.TestChangeFrame.prototype._addFrame = function(object){
	InteractiveTask.BUTTONS_LAYER.add(object);
	if(this.button)this.button.moveToTop();
	InteractiveTask.BUTTONS_LAYER.batchDraw();
};

InteractiveTask.TestChangeFrame.prototype.close = function(){
	if(this.isSuccess){
		this.successFrame.off("mousedown touchstart");
		this.successFrame.remove();
		this.isSuccess = false;
	};
	if(this.isFail){
		this.failFrame.off("mousedown touchstart");
		this.failFrame.remove();
		this.isFail = false;
	};
	if(this.isWait){
		this.waitSprite.stop();
		this.waitFrame.remove();
		this.isWait = false;
	};
	InteractiveTask.BUTTONS_LAYER.batchDraw();
	//this.layer.remove();
};

InteractiveTask.TestChangeFrame.prototype.clear = function(){
	InteractiveTask.disposeObject(this);
};


InteractiveTask.StartFrame = function(player){
	var background = new Konva.Rect({
		width : InteractiveTask.STAGE.width(),
		height : InteractiveTask.STAGE.height(),
		fill : InteractiveTask.formatColorFlashToCanvasRGBA(InteractiveTask.CONST.PLAY_BACKGROUND_COLOR, InteractiveTask.CONST.PLAY_BACKGROUND_ALPHA),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 0),
		strokeWidth : 1
	});
	InteractiveTask.BUTTONS_LAYER.add(background);
	var button;
	var image = new Image();
	image.onload = function(){
		this.runFunction = function(id){

			InteractiveTask.BUTTONS_LAYER.clear();
			InteractiveTask.BUTTONS_LAYER.destroyChildren();
			InteractiveTask.disposeObject(button);
			button = null;
			image = null;
			InteractiveTask.BUTTONS_LAYER.batchDraw();

			player.startFillLibrary();
		};
		this.eventFunction = function(a ,b){

		}
		button = new InteractiveTask.OneButton({
			x : (InteractiveTask.STAGE.width() - InteractiveTask.CONST.PLAY_BUTTON_POSITION[2])/2,
			y : (InteractiveTask.STAGE.height() - InteractiveTask.CONST.PLAY_BUTTON_POSITION[3])/2,
			width : InteractiveTask.CONST.PLAY_BUTTON_POSITION[2],
			height : InteractiveTask.CONST.PLAY_BUTTON_POSITION[3],
			image : image,
			butPosition : InteractiveTask.CONST.PLAY_BUTTON_POSITION,
			layer : InteractiveTask.BUTTONS_LAYER,
			controller : this,
			runFuncName : 1,
			hintText : "Start task",
			hintPD : "down"
		});
	};
	//trace(InteractiveTask.CONST.PRELOADER_IMAGE);
	try{
		//image.src = "http://kidnet.ru/sites/default/files/TaskPlayer/Images/load.png";
		image.src = InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.PLAY_BUTTON_LINK;
	}catch(error){
		InteractiveTask.log("Load start button error = ", error);
	};
	/*
	InteractiveTask.BUTTONS_LAYER.add(button);

	button.on("mousedown touchstart", function(){
		this.off("mousedown touchstart");
	    this.remove();
		InteractiveTask.BUTTONS_LAYER.batchDraw();
		player.startFillLibrary();
	});

	InteractiveTask.BUTTONS_LAYER.batchDraw();    */
};
