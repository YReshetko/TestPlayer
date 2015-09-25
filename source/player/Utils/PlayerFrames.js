/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 23.05.15
 * Time: 19:26
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.TestChangeFrame = function(width, height, buttons){
	this.width = width;
	this.height = height;
	this.fullscreenLayer = buttons.fullscreen;
	this.successFrame = new Kinetic.Group();
	this.failFrame = new Kinetic.Group();
	this.waitFrame = new Kinetic.Group();

	var successBackground = new Kinetic.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColorFlashToCanvasRGBA("0x999999", 0.2),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 0),
		strokeWidth : 1
	});

	var failBackground = new Kinetic.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColorFlashToCanvasRGBA("0x999999", 0.2),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 0),
		strokeWidth : 1
	});

	var waitBackground = new Kinetic.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColorFlashToCanvasRGBA("0xBBBBBB", 1),
		stroke : InteractiveTask.formatColorFlashToCanvasRGBA("0x666666", 1),
		strokeWidth : 1
	});

	var successImage = new Kinetic.Image({
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.GOOD_FRAME)
	});
	var failImage = new Kinetic.Image({
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.BAD_FRAME)
	});
	this.waitSprite = new Kinetic.Sprite({
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
	this.layer = new Kinetic.Layer();
};

InteractiveTask.TestChangeFrame.prototype.success = function(){
	this.layer.add(this.successFrame);
	InteractiveTask.STAGE.add(this.layer);
	this.layer.batchDraw();
	this.isSuccess = true;
	this.fullscreenLayer.moveToTop();
};
InteractiveTask.TestChangeFrame.prototype.fail = function(){
	this.layer.add(this.failFrame);
	InteractiveTask.STAGE.add(this.layer);
	this.layer.batchDraw();
	this.isFail = true;
	this.fullscreenLayer.moveToTop();
};
InteractiveTask.TestChangeFrame.prototype.wait = function(){
	this.layer.add(this.waitFrame);
	InteractiveTask.STAGE.add(this.layer);
	this.layer.batchDraw();
	this.isWait = true;
	this.waitSprite.start();
	this.fullscreenLayer.moveToTop();
};
InteractiveTask.TestChangeFrame.prototype.close = function(){
	if(this.isSuccess){
		this.successFrame.remove();
		this.isSuccess = false;
	};
	if(this.isFail){
		this.failFrame.remove();
		this.isFail = false;
	};
	if(this.isWait){
		this.waitSprite.stop();
		this.waitFrame.remove();
		this.isWait = false;
	};
	this.layer.remove();
};

InteractiveTask.TestChangeFrame.prototype.clear = function(){
	InteractiveTask.disposeObject(this);
};

