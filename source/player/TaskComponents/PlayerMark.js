/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 02.03.15
 * Time: 14:35
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.MarkController = function(options){
    this.layer = options.layer;
    this.controller = options.task;
    this.markArray = new Array();
    this.xmlMarkArray = new Array();

	var self = this.controller;
	InteractiveTask.BACKGROUND.on("mousedown touchstart", function(event){
		self.minusHealth();
	});
};

InteractiveTask.MarkController.prototype.add = function(xml){
    this.xmlMarkArray.push(xml);
};
InteractiveTask.MarkController.prototype.startCreating = function(){
    var i,l;
    l = this.xmlMarkArray.length;
    for(i=0;i<l;i++){
        this.markArray.push(new InteractiveTask.SampleMark({
            xml : this.xmlMarkArray[i],
            layer : this.layer,
            image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.MARK_BUTTON),
            controller : this,
        }));
    };
};

InteractiveTask.MarkController.prototype.selectClass = function(value){
    var i,l;
    l = this.markArray.length;
    for(i=0;i<l;i++){
        if(value == this.markArray[i].getClass()){
            this.markArray[i].start();
        };
    };
};

InteractiveTask.MarkController.prototype.runLabelAnimation = function(label){
	this.controller.runLabelAnimation(label);
};

InteractiveTask.MarkController.prototype.checkComplate = function(){
    this.controller.checkTask();
};
InteractiveTask.MarkController.prototype.isComplate = function(){
    var i,l;
    l = this.markArray.length;
    for(i=0;i<l;i++){
        if(!this.markArray[i].isComplate()) return false;
    };
    return true;
};
InteractiveTask.MarkController.prototype.clear = function(){
	while(this.markArray.length>0){
		InteractiveTask.disposeObject(this.markArray[0]);
		this.markArray[0] = null;
		this.markArray.shift();
	};
};

/*****************************************************************************************************************************/
InteractiveTask.SampleMark = function(options){
    this.xml = options.xml;
    this.layer = options.layer;
    this.image = options.image;
    this.controller = options.controller;



    var width = parseFloat(this.xml.WIDTH);
    var height = parseFloat(this.xml.HEIGHT);
    var x = parseFloat(this.xml.X);
    var y = parseFloat(this.xml.Y);
    var scaleX = width/100;
    var scaleY = height/100;
    this.mark = new Kinetic.Sprite({
        x : x,
        y : y,
        image : this.image,
        animation : 'standing',
        animations : {
            standing: [
                  0, 0, 100, 100,
                100, 0, 100, 100,
                200, 0, 100, 100,
                300, 0, 100, 100,
                400, 0, 100, 100,
                500, 0, 100, 100,
                600, 0, 100, 100,
                700, 0, 100, 100,
                800, 0, 100, 100,
                900, 0, 100, 100,
                ]
            },
        frameRate :60,
        frameIndex : 0
    });
    this.mark.scaleX(scaleX);
    this.mark.scaleY(scaleY);
    this.layer.add(this.mark);
    this.mark.controller = this.controller;
    this.mark.currentClass = parseInt(this.xml.CLASS);

	if(this.xml.STARTANIMATIONCOMPLATE != undefined){
		//this.startLabelComplate = this.xml.STARTANIMATIONCOMPLATE;
		/*
		 меняем на создание массива меток анимации
		 */
		this.startLabelComplate = new Array();
		if(this.xml.STARTANIMATIONCOMPLATE.indexOf(",")!=-1){
			var lblArr = this.xml.STARTANIMATIONCOMPLATE.split(",");
			var i,l;
			l = lblArr.length;
			for(i=0;i<l;i++){
				this.startLabelComplate[i] = lblArr[i];
			}
		}else{
			this.startLabelComplate[0] = this.xml.STARTANIMATIONCOMPLATE;
		}

	} else{
		this.startLabelComplate = "";
	};
	if(this.xml.STARTANIMATIONDOWN != undefined){
		//this.startLabelMouseDown = this.xml.STARTANIMATIONDOWN;
		/*
		 меняем на создание массива меток анимации
		 */
		this.startLabelMouseDown = new Array();
		if(this.xml.STARTANIMATIONDOWN.indexOf(",")!=-1){
			var lblArr = this.xml.STARTANIMATIONDOWN.split(",");
			var i,l;
			l = lblArr.length;
			for(i=0;i<l;i++){
				this.startLabelMouseDown[i] = lblArr[i];
			}
		}else{
			this.startLabelMouseDown[0] = this.xml.STARTANIMATIONDOWN;
		}
	} else{
		this.startLabelMouseDown = "";
	};

	this.mark.startLabelComplate = this.startLabelComplate;
	this.mark.startLabelMouseDown = this.startLabelMouseDown;

    //this.mark.start();
    this.mark.isSelect = false;
    //TODO: ввести touchstart и проверить на планшетах
    this.mark.on("mousedown touchstart", function(){
	    if(this.startLabelMouseDown!=""){
		    this.controller.runLabelAnimation(this.startLabelMouseDown);
		    this.startLabelMouseDown = "";
	    };
        this.controller.selectClass(this.currentClass);
    });


};
InteractiveTask.SampleMark.prototype.getClass = function(){
    return parseInt(this.xml.CLASS);
};

InteractiveTask.SampleMark.prototype.start = function(){
    this.mark.start();
    this.mark.off("mousedown touchstart");
    this.mark.on("frameIndexChange", function(){
        if(this.frameIndex()==9){
            this.stop();
            this.draw();
            this.off("frameIndexChange");
            this.isSelect = true;

	        if(this.startLabelComplate!=""){
		        this.controller.runLabelAnimation(this.startLabelComplate);
		        this.startLabelComplate = "";
	        };

            this.controller.checkComplate();
        };
    });
};
InteractiveTask.SampleMark.prototype.isComplate = function(){
    return this.mark.isSelect;
};