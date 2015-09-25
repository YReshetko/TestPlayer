/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 05.03.15
 * Time: 12:36
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.TextFieldController = function(options){
    this.layer = options.layer;
    this.blackLayer = options.blackLayer;
    this.controller = options.controller;
    this.diap = options.diap;
    this.textFieldArray = new Array();


};
InteractiveTask.TextFieldController.prototype.add = function(xml){
    var id = this.textFieldArray.length;
    if(xml.TYPE["-name"]!="INPUT"){
        this.textFieldArray.push(new InteractiveTask.SampleTextField({
            layer : this.layer,
            blackLayer : this.blackLayer,
            diap : this.diap,
            controller : this,
            xml : xml
        }));
    }else{
        this.textFieldArray.push(new InteractiveTask.InputTextField({
            layer : this.layer,
            controller : this,
            xml : xml
        }));
    };
};
InteractiveTask.TextFieldController.prototype.area = function(area){
    var i,l;
    l = this.textFieldArray.length;
    for(i=0;i<l;i++){
        this.textFieldArray[i].area(area);
    };
};
InteractiveTask.TextFieldController.prototype.checkTask = function(){
    this.controller.checkTask();
};
InteractiveTask.TextFieldController.prototype.isComplate = function(){
    var i,l;
    l = this.textFieldArray.length;
    for(i=0;i<l;i++){
        if(!this.textFieldArray[i].isComplate()) return false;
    };
    return true;
};

InteractiveTask.TextFieldController.prototype.clear = function(){
	while(this.textFieldArray.length>0){
		InteractiveTask.disposeObject(this.textFieldArray[0]);
		this.textFieldArray[0] = null;
		this.textFieldArray.shift();
	};
};
/*****************************************************************************************************************************/
InteractiveTask.SampleTextField = function(options){
    this.layer = options.layer;
    this.blackLayer = options.blackLayer;
    this.controller = options.controller;
    this.diap = options.diap;


    this.xml = options.xml;

    this.textField = new Kinetic.Text({
        x: 3,
        y: 3,
        fontFamily: this.xml.FONT,
        text: InteractiveTask.getCorrectText(this.xml.TEXT),
        fontSize: parseInt(this.xml.SIZE),
        align : this.xml.ALIGN,
        fontFamily: 'Calibri',
        fill: InteractiveTask.formatColorFlashToCanvas(this.xml.TEXTCOLOR)
    });
    var style = 'normal';
    if(this.xml.BOLD == 'true'){
        style = 'bold';
    };
    if(this.xml.ITALIC == 'true'){
        style = 'italic';
    };
    this.textField.fontStyle(style);

    this.field = new Kinetic.Group();

    if((this.xml.BORDER=="true")||(this.xml.BACKGROUND=="true")){
        var borderColor = InteractiveTask.formatColorFlashToCanvasRGBA(this.xml.BORDERCOLOR, 0);
        if(this.xml.BORDER=="true"){
            borderColor = InteractiveTask.formatColorFlashToCanvasRGBA(this.xml.BORDERCOLOR, 1);
        };
        var backGroundColor = InteractiveTask.formatColorFlashToCanvasRGBA(this.xml.BACKGROUNDCOLOR, 0);
        if(this.xml.BACKGROUND=="true"){
            backGroundColor = InteractiveTask.formatColorFlashToCanvasRGBA(this.xml.BACKGROUNDCOLOR, 1);
        };
        console.log("border color", borderColor);
        console.log("background color", backGroundColor);
        this.background = new Kinetic.Rect({
            width : parseFloat(this.xml.WIDTH),
            height : parseFloat(this.xml.HEIGHT),
            stroke : borderColor,
            fill : backGroundColor,
            strokeWidth : 1
        });
        this.field.add(this.background);
        if(this.xml.ALIGN == 'center'){
            this.textField.x((parseFloat(this.xml.WIDTH) - this.textField.width())/2);
            this.textField.y((parseFloat(this.xml.HEIGHT) - this.textField.height())/2);
        };
        if(this.xml.ALIGN == 'right'){
            this.textField.x(parseFloat(this.xml.WIDTH) - this.textField.width());
        };
    };
    this.field.x(parseFloat(this.xml.X));
    this.field.y(parseFloat(this.xml.Y));

    this.field.isFree = false;

    if(this.xml.TYPE["-name"]=="STATIC"){
        if(this.xml.TYPE.DRAGANDDROP["-tan"] == "true"){
            this.enterArea = false;
            this.blackTan = new Kinetic.Rect({
                width : parseFloat(this.xml.WIDTH),
                height : parseFloat(this.xml.HEIGHT),
                x :  parseFloat(this.xml.TYPE.DRAGANDDROP.X),
                y :  parseFloat(this.xml.TYPE.DRAGANDDROP.Y),
                stroke : 'black',
                fill : 'black',
                strokeWidth : 1
            });
            this.blackTan.opacity(parseFloat(this.xml.TYPE.DRAGANDDROP.ALPHA));
            this.field.isFree = true;
            this.field.draggable(true);
            this.field.blackTan = this.blackTan;
            this.field.controller = this;
            this.field.xml = this.xml;
            this.field.diap = this.diap;
            this.field.on("mousedown touchstart", function(){
                if(this.xml.TYPE.DRAGANDDROP.ISDINAMYC == "true"){
                    this.isFree = false;
                }else{
                    this.isFree = true;
                };

            });
            this.field.on("mouseup touchend", function(){
                if(this.xml.TYPE.DRAGANDDROP.ISDINAMYC == "true"){
                    this.isFree = false;
                    return;
                };
                if(this.controller.isEnterArea()){
                    this.controller.controller.checkTask();
                    return;
                };
                if(Math.sqrt((this.x() - this.blackTan.x())*(this.x() - this.blackTan.x())+(this.y() - this.blackTan.y())*(this.y() - this.blackTan.y()))<this.diap){
                    //console.log("Drop this tan");

                    this.x(this.blackTan.x());
                    this.y(this.blackTan.y());
                    if(this.xml.TYPE.DRAGANDDROP.ISDROPBACK != "true"){
                        this.off("mousedown touchstart");
                        this.off("mouseup touchend");
                        this.draggable(false);

                    };
                    this.isFree = false;
                    this.controller.layer.draw();
                    this.controller.controller.checkTask();
                };

            });
            this.blackLayer.add(this.blackTan);
        };
    };


    this.field.add(this.textField);
    if(this.layer!=null) this.layer.add(this.field);
    if(this.layer!=null) this.layer.draw();


};

/*
 Установка области внесения в случае если это нобходимо  ///////////////////////////////////////////////////////////////////////////////////
 */
InteractiveTask.SampleTextField.prototype.area = function(value){
    if(this.xml.TYPE.DRAGANDDROP["-tan"] != "true") return;
    this.arrTruePosition = new Array();
    this.arrFalsePosition = new Array();
    var x,y;
    x = parseFloat(this.xml.TYPE.DRAGANDDROP.X)+ parseFloat(this.xml.WIDTH)/2;
    y = parseFloat(this.xml.TYPE.DRAGANDDROP.Y)+ parseFloat(this.xml.HEIGHT)/2;
    var i,l;
    l = value.length;
    for(i=0;i<l;i++){
        if(x>value[i][0] && x<value[i][2] && y>value[i][1] && y<value[i][3]){
            this.arrTruePosition.splice(0,0,value[i]);
        }else{
            this.arrFalsePosition.splice(0,0,value[i]);
        };
    };
    if(this.arrTruePosition.length>0) {
        this.enterArea = true;
        //this.blackTan.isFree = false;
        /*colorContainer.removeEventListener(MouseEvent.MOUSE_DOWN, COLOR_MOUSE_DOWN);
         colorContainer.removeEventListener(MouseEvent.MOUSE_UP, COLOR_MOUSE_UP);


         colorContainer.addEventListener(MouseEvent.MOUSE_DOWN, SIMPLE_MOUSE_DOWN);
         colorContainer.addEventListener(MouseEvent.MOUSE_UP, SIMPLE_MOUSE_UP); */
    };
};
InteractiveTask.SampleTextField.prototype.isEnterArea = function(){
    return this.enterArea;
};
InteractiveTask.SampleTextField.prototype.isEnter = function(){
    var i,l;
    l = this.arrTruePosition.length;
    var X = this.field.x()+ parseFloat(this.xml.WIDTH)/2;
    var Y = this.field.y()+ parseFloat(this.xml.HEIGHT)/2;
    for(i=0;i<l;i++){
        if(X<this.arrTruePosition[i][0] || X>this.arrTruePosition[i][2] || Y<this.arrTruePosition[i][1] || Y>this.arrTruePosition[i][3]) return false;
    };
    l = this.arrFalsePosition.length;
    for(i=0;i<l;i++){
        if(X>this.arrFalsePosition[i][0] && X<this.arrFalsePosition[i][2] && Y>this.arrFalsePosition[i][1] && Y<this.arrFalsePosition[i][3]) return false;
    };
    return true;
};

InteractiveTask.SampleTextField.prototype.isComplate = function(){

    if(!this.field.isFree) return true;
    if(this.isEnterArea()){
        if(this.isEnter()) return true;
    };
    return false;
};

InteractiveTask.SampleTextField.prototype.getObject = function(){
    return this.field;
};
InteractiveTask.SampleTextField.prototype.setCache = function(width, height){
   this.textField.cache({
        x : 0,
        y : 0,
        width : width,
        height : height
    });
    console.log("Text cach = ",this.background.cache());
    if(this.background!=undefined){
        this.background.cache({
            x : 0,
            y : 0,
            width : width,
            height : height
        });
    };
};


/*************************************************************************************************************************************/
InteractiveTask.InputTextField = function(options){
    this.layer = options.layer;
    this.controller = options.controller;
    this.xml = options.xml;

    this.input = new CanvasInput({
        canvas : this.layer.canvas._canvas,
        x : parseFloat(this.xml.X),
        y : parseFloat(this.xml.Y),
        width : parseFloat(this.xml.WIDTH),
        height : parseFloat(this.xml.HEIGHT),
        fontSize : parseInt(this.xml.SIZE),
        fontFamily : this.xml.FONT,
        fontColor : InteractiveTask.formatColorFlashToCanvas(this.xml.TEXTCOLOR),
        fontWeight : (this.xml.BOLD == "true")?("bold"):("normal"),
        fontStyle : (this.xml.ITALIC == "true")?("italic"):("normal"),
        placeHolder : this.xml.TYPE.DEFAULTTEXT,
        value : ""
    });
    this.trueText = this.xml.TEXT;
    this.input.controller = this.controller;
    this.input.onkeydown(function(){
        var controller = this.controller;
        setTimeout(function(){
            controller.checkTask();
        }, 150);
    });
    //this.layer.draw();
    this.input.renderCanvas();
    this.input.render();

};
InteractiveTask.InputTextField.prototype.area = function(value){
    return;
};

InteractiveTask.InputTextField.prototype.isComplate = function(){
    if(this.input.value() == this.trueText) {
        this.input.onkeydown(function(){});
       // this.input.readonly(true);
        return true;
    };
    return false;
};