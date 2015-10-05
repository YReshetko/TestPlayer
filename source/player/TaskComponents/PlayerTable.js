/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 25.02.15
 * Time: 7:45
 * To change this template use File | Settings | File Templates.
 */
/*************************************************************************************/
/****************************** TABLE ************************************************/
/*************************************************************************************/
InteractiveTask.TableController = function(options){

    this.task = options.task;
    //this.diap = options.diap;
    //this.isUniq = options.uniq;
    //alert(this.task);
    this.tableArray = new Array();
};

InteractiveTask.TableController.prototype.add = function(options){
    var id = this.tableArray.length;
    options.controller = this;

    this.tableArray[id] = new InteractiveTask.SampleTable(options);
    this.tableArray[id].init();
};
InteractiveTask.TableController.prototype.area = function(){
    var outArray = new Array();
    var i,l;
    l = this.tableArray.length;
    for(i=0;i<l;i++){
        if(this.tableArray[i].area()){
            outArray = this.addArray(outArray, this.tableArray[i].arrArea());
        };
    };
    if(outArray.length == 0) return null;
    return outArray;
};
InteractiveTask.TableController.prototype.addArray = function(arr1, arr2){
    var i,l;
    l = arr2.length;
    for(i=0;i<l;i++){
        arr1.push(arr2[i]);
    };
    return arr1;
};
InteractiveTask.TableController.prototype.isArea = function(){
    var i,l;
    l = this.tableArray.length;
    for(i=0;i<l;i++){
        if(this.tableArray[i].area())return true;
    };
    return false;
};

InteractiveTask.TableController.prototype.clear = function(){
	while(this.tableArray.length>0){
		InteractiveTask.disposeObject(this.tableArray[0]);
		this.tableArray[0] = null;
		this.tableArray.shift();
	};
};
InteractiveTask.TableController.prototype.addToLayer = function(layer){
	var i,l;
	l = this.tableArray.length;
	for(i=0;i<l;i++){
		layer.add(this.tableArray[i].table);
	};
};

/***************************************************************************************************************************/

InteractiveTask.SampleTable = function(options){
    this.controller = options.controller;
    this.xml = options.xml;

    this.arrRasst = new Array();
    this.entarArea = false;

};

InteractiveTask.SampleTable.prototype.init = function(){
    this.wTable = parseFloat(this.xml.WIDTH);
    this.hTable = parseFloat(this.xml.HEIGHT);
    this.xTable = parseFloat(this.xml.X);
    this.yTable = parseFloat(this.xml.Y);
    this.tTable = parseInt(this.xml.THICK);
    this.tColor = InteractiveTask.formatColor(this.xml.COLOR, 1);

    this.numLine = parseInt(this.xml.LINE);
    if(this.numLine<1) this.numLine = 1;
    this.numColumn = parseInt(this.xml.COLUMN);
    if(this.numColumn<1) this.numColumn = 1;

    this.entarArea = (this.xml.ENTERAREA == "true");

    var X, Y, W, H, numLine, numCol;
    X = this.xTable;
    Y = this.yTable;
    W = this.wTable;
    H = this.hTable;
    numLine = this.numLine;
    numCol = this.numColumn;
    this.table = new Konva.Shape({
        fillEnabled : false,
        strokeWidth : this.tTable,
        stroke : this.tColor,
        x : 0,
        y : 0,
        sceneFunc : function(context){
            context.beginPath();
            var i,j;
            context.moveTo(X,Y);
            context.lineTo(X+W,Y);
            context.lineTo(X+W,Y+H);
            context.lineTo(X,Y+H);
            context.lineTo(X,Y);
            //numLine
            for(i=1;i<numLine;i++){
                context.moveTo(X,Y+((H/numLine)*i));
                context.lineTo(X+W,Y+((H/numLine)*i));
            };
            //numCol
            for(i=1;i<numCol;i++){
                context.moveTo(X+((W/numCol)*i),Y);
                context.lineTo(X+((W/numCol)*i),Y+H);
            };
            context.closePath();
            context.fillStrokeShape(this);
        }
    });
    var i,j;
    this.arrRasst = new Array();
    if(this.entarArea){
        console.log(this , ': TABLE IS ENTER AREA');
        entarArea = true;
        for(i=0;i<this.numColumn;i++){
            for(j=0;j<this.numLine;j++){
                this.arrRasst[this.arrRasst.length] = new Array();
                this.arrRasst[this.arrRasst.length-1][0] = X+i*W/this.numColumn;
                this.arrRasst[this.arrRasst.length-1][1] = Y+j*H/this.numLine;
                this.arrRasst[this.arrRasst.length-1][2] = X+(i+1)*W/this.numColumn;
                this.arrRasst[this.arrRasst.length-1][3] = Y+(j+1)*H/this.numLine;
            };
        };
    };
    console.log("Complate table create");
};

InteractiveTask.SampleTable.prototype.area = function(){
    return this.entarArea;
};
InteractiveTask.SampleTable.prototype.arrArea = function(){
    return this.arrRasst;
};