/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 17.06.15
 * Time: 9:40
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.TestProgress = function(options){
  	this.xml = options.xml;
	this.contID = options.containerID;
	this.width = InteractiveTask.STAGE.width();
	this.height = InteractiveTask.CONST.TEST_PROGRESS_HEIGHT;
	this.progressStage = new Konva.Stage({
		container : this.contID,
		width: this.width,
		height: this.height
	});
	this.layer = new Konva.Layer();
	var tasksArray = InteractiveTask.getArrayObjectsByTag(this.xml, "TASK");
	this.equalsArray = new Array();
	var i,l;
	var counterPoints = 0;
	l =  tasksArray.length;
	if(this.xml.TEST == "true"){
		for(i=0;i<l;i++){
			if(tasksArray[i].MNIMOE != "true"){
				++counterPoints;
				this.addPoint(tasksArray[i]["-id"], counterPoints);
			};
		};
	}else{
		for(i=0;i<l;i++){
			if(tasksArray[i].MNIMOE != "true" && tasksArray[i]["-level"] == "1"){
				++counterPoints;
				this.addPoint(tasksArray[i]["-id"], counterPoints);
			};
		};
	};

	this.deltaX = (((InteractiveTask.CONST.TEST_PROGRESS_WIDTH + InteractiveTask.CONST.TEST_PROGRESS_DELTA_X)*counterPoints) - this.width);
	if(this.deltaX>0){
		this.deltaX = this.deltaX/counterPoints;
	}else{
		this.deltaX = 0;
	};

	InteractiveTask.log("this.deltaX = " + this.deltaX);
	this.progressStage.add(this.layer);
};

InteractiveTask.TestProgress.prototype.addPoint = function(taskID, pointID){
	var id = this.equalsArray.length;
	var currentPoint = new InteractiveTask.TestProgressPoint({
		number : pointID,
		x :  (pointID-1) * (InteractiveTask.CONST.TEST_PROGRESS_WIDTH + InteractiveTask.CONST.TEST_PROGRESS_DELTA_X),
		y : 0
	});
	this.equalsArray[id] = {
		taskID : taskID,
		progressPointID : pointID,
		point : currentPoint
	};
	this.layer.add(this.equalsArray[id].point.getPoint());
};
InteractiveTask.TestProgress.prototype.scale = function(size){
	this.progressStage.scaleX(size);
	this.progressStage.scaleY(size);
	this.progressStage.width(this.width*size);
	this.progressStage.height(this.height*size);
};

InteractiveTask.TestProgress.prototype.select = function(taskID){
	var i, l,num, pos;
	l = this.equalsArray.length;
	for(i=0;i<l;i++){
		if(taskID == this.equalsArray[i].taskID){
			this.equalsArray[i].point.select();
			num = (i>((l-1)/2))?(i+1):(i);
			pos = ((-1)*this.deltaX) * num;
			InteractiveTask.log("num = " + num);
			InteractiveTask.log("new position = " + pos);

			this.layer.x(pos);
			this.layer.batchDraw();
			return;
		};
	};
};
InteractiveTask.TestProgress.prototype.setComplate = function(taskID, flag){
	var i,l;
	l = this.equalsArray.length;
	for(i=0;i<l;i++){
		if(taskID == this.equalsArray[i].taskID){
			if(flag){
				this.equalsArray[i].point.setTrue();
			}else{
				this.equalsArray[i].point.setFalse();
			};
			this.layer.batchDraw();
			return;
		};
	};
};

InteractiveTask.TestProgress.prototype.clear = function(){
	while(this.equalsArray.length>0){
		InteractiveTask.disposeObject(this.equalsArray[0].point);
		this.equalsArray[0] = null;
		this.equalsArray.shift();
	};
	this.progressStage.destroyChildren();
	InteractiveTask.disposeObject(this);
};



InteractiveTask.TestProgressPoint = function(options){
	this.number = options.number;
	this.group = new Konva.Group({
	    x : options.x,
		y : options.y
	});

	this.point = new Konva.Sprite({
		x : 0,
		y : 0,
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.TEST_PROGRESS),
		animation : 'standing',
		animations : {
			standing: InteractiveTask.CONST.PROGRESS_POSITION
		},
		frameRate :10,
		frameIndex : InteractiveTask.CONST.PROGRESS_POINT_DEFAULT_POSITION
	});
	this.text = new Konva.Text({
		x : 0,
		y : 0,
		text : this.number,
		fontSize : 14,
		fontStyle : 'bold',
		fontFamily : 'Verdana',
		fill : 'black',
		align : 'center'
	});
	this.group.add(this.point);
	this.group.add(this.text);
	var tX = ((InteractiveTask.CONST.TEST_PROGRESS_WIDTH - this.text.width())/ 2) - 1,
		tY = (InteractiveTask.CONST.TEST_PROGRESS_HEIGHT - this.text.height())/ 2;
	this.text.x(tX);
	this.text.y(tY);
};

InteractiveTask.TestProgressPoint.prototype.getPoint = function(){
  	return this.group;
};
InteractiveTask.TestProgressPoint.prototype.select = function(){
	this.point.frameIndex(InteractiveTask.CONST.PROGRESS_POINT_CURRENT_POSITION);
};
InteractiveTask.TestProgressPoint.prototype.setTrue = function(){
	this.point.frameIndex(InteractiveTask.CONST.PROGRESS_POINT_SUCCESS_POSITION);
};
InteractiveTask.TestProgressPoint.prototype.setFalse = function(){
	this.point.frameIndex(InteractiveTask.CONST.PROGRESS_POINT_FAIL_POSITION);
};

