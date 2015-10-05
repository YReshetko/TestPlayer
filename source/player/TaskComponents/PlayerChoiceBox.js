/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 01.07.15
 * Time: 11:22
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.ChoiceBoxController = function(options){
	this.controller = options.controller;
	this.boxes = new Array();
};

InteractiveTask.ChoiceBoxController.prototype.add = function(xml){
	var id = this.boxes.length;

	this.boxes[id] = new InteractiveTask.BoxSystem({
		xml : xml,
		controller : this
	});

};

InteractiveTask.ChoiceBoxController.prototype.minusHealth = function(){
	this.controller.minusHealth();
};
InteractiveTask.ChoiceBoxController.prototype.checkComplate = function(){
	this.controller.checkTask();
};
InteractiveTask.ChoiceBoxController.prototype.isComplate = function(){
	var i,l;
	l = this.boxes.length;
	for(i=0;i<l;i++){
		if(!this.boxes[i].isComplate()) return false;
	};
	return true;
};

InteractiveTask.ChoiceBoxController.prototype.clear = function(){
	while(this.boxes.length>0){
		this.boxes.clear();
		InteractiveTask.disposeObject(this.boxes[0]);
		this.boxes[0] = null;
		this.boxes.shift();
	};
};

InteractiveTask.ChoiceBoxController.prototype.addToLayer = function(layer){
	var i,l;
	l = this.boxes.length;
	for(i=0;i<l;i++){
		layer.add(this.boxes[i].boxSystem);
	};
};


/****************************************************************************/
/********************************BOX SYSTEM**********************************/
/****************************************************************************/
InteractiveTask.BoxSystem = function(options){
	this.xml = options.xml;
	this.controller = options.controller;

	this.isChoice = (this.xml.CHOICE == "true");

	this.format = this.xml.FORMAT;
	this.xmlBoxArray = InteractiveTask.getArrayObjectsByTag(this.xml, "BOX");

	this.boxSystem = new Konva.Group();
	this.boxSystem.x(parseFloat(this.xml["-x"]));
	this.boxSystem.y(parseFloat(this.xml["-y"]));

	var i,l;
	l = this.xmlBoxArray.length;
	this.boxes = new Array();
	for(i=0;i<l;i++){
		this.boxes[i] = new  InteractiveTask.OneBox({
			boxSystem : this.boxSystem,
			xml : this.xmlBoxArray[i],
			format : this.format,
			controller : this
		});
	};
};
InteractiveTask.BoxSystem.prototype.minusHealth = function(){
	this.controller.minusHealth();
};
InteractiveTask.BoxSystem.prototype.checkComplate = function(){
	this.boxSystem.getLayer().batchDraw();
	this.controller.checkComplate();
};
InteractiveTask.BoxSystem.prototype.isComplate = function(){
	var i,l;
	l = this.boxes.length;
	for(i=0;i<l;i++){
		if(!this.boxes[i].isComplate()) return false;
	};
	return true;
};
InteractiveTask.BoxSystem.prototype.clearAll = function(){
	var i,l;
	l = this.boxes.length;
	for(i=0;i<l;i++){
		this.boxes[i].clear();
	};
};
InteractiveTask.BoxSystem.prototype.clear = function(){
  	while(this.boxes.length>0){
	    InteractiveTask.disposeObject(this.boxes[0]);
	    this.boxes[0] = null;
	    this.boxes.shift();
    };
};

/****************************************************************************/
/******************************** ONE BOX ***********************************/
/****************************************************************************/

InteractiveTask.OneBox = function(options){
  	this.layer = options.boxSystem;
	this.xml = options.xml;
	this.format = options.format;
	this.controller = options.controller;

	var image;
	if(this.xml.TYPE == "classic"){
	  	image = InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.CHECKBOX_BUTTON);
	}else{
		image = InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.RADIO_BUTTON);
	};

	this.point = new Konva.Sprite({
		x : 0,
		y : 0,
		image : image,
		animation : 'standing',
		animations : {
			standing: InteractiveTask.CONST.CHECKBOX_BUTTON_POSITION
		},
		frameRate :10,
		frameIndex : 0
	});
	var boxText;
	if(this.xml.TEXT==undefined){
		boxText = " ";
	}else{
		if(this.xml.TEXT["#cdata-section"] == undefined){
			boxText = " ";
		}else{
			boxText = this.xml.TEXT["#cdata-section"];
		};
	};
	this.textField = new Konva.Text({
		x: InteractiveTask.CONST.CHECKBOX_BUTTON_SIZE + 5,
		y: 0,
		fontFamily: this.format.FONT,
		text: boxText,
		fontSize: parseInt(this.format.SIZE),
		align : "left",
		fill: InteractiveTask.formatColorFlashToCanvas(this.format.TEXTCOLOR)
	});

	this.createBackground();

	this.group = new Konva.Group();

	this.textField.y((InteractiveTask.CONST.CHECKBOX_BUTTON_SIZE - this.textField.height())/2);
	this.backgroung.y((InteractiveTask.CONST.CHECKBOX_BUTTON_SIZE - this.backgroung.height())/2);
	this.backgroung.x(InteractiveTask.CONST.CHECKBOX_BUTTON_SIZE + 3);
	this.group.add(this.point);
	this.group.add(this.backgroung);
	this.group.add(this.textField);

	this.group.x(parseFloat(this.xml["-x"]));
	this.group.y(parseFloat(this.xml["-y"]));

	this.isSelect = false;
	this.isCorrect = (this.xml.SELECT == "true");

	this.group.controller = this;

	this.group.on("mousedown touchstart", function(event){
		this.controller.select();
	});

	this.layer.add(this.group);
};
InteractiveTask.OneBox.prototype.createBackground = function(){
	var line;
	if(this.format.BORDER == "true"){
		line = InteractiveTask.formatColorFlashToCanvasRGBA(this.format.BORDERCOLOR, 1);
	}else{
		line = InteractiveTask.formatColorFlashToCanvasRGBA(this.format.BORDERCOLOR, 0);
	};
	var fill;
	if(this.format.BACKGROUND == "true"){
	    fill = InteractiveTask.formatColorFlashToCanvasRGBA(this.format.BACKGROUNDCOLOR, 1);
	}else{
		fill = InteractiveTask.formatColorFlashToCanvasRGBA(this.format.BACKGROUNDCOLOR, 0);
	};
	this.backgroung = new Konva.Rect({
		x : 0,
		y : 0,
		width : parseFloat(this.xml["-width"]),
		height : parseFloat(this.xml["-height"]),
		strokeWidth : 1,
		stroke : line,
		fill : fill
	});
};

InteractiveTask.OneBox.prototype.select = function(){
	if(this.controller.isChoice){
		this.controller.clearAll();
	};

	if(this.isSelect){
	 this.clear();
	}else{
	 this.point.frameIndex(1);
	 this.isSelect = true;
	};
	if(this.isSelect && !this.isCorrect){
		this.controller.minusHealth();
	};
	this.controller.checkComplate();
};
InteractiveTask.OneBox.prototype.clear = function(){
	this.isSelect = false;
	this.point.frameIndex(0);
};

InteractiveTask.OneBox.prototype.isComplate = function(){
   return (this.isSelect == this.isCorrect);
};
