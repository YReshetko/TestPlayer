
InteractiveTask.PositioningController = function(options) {
    this.layer = options.layer;
    this.xml = options.xml;
    this.controller = options.controller;
    //this.path = options.path;

	this.init();
};
InteractiveTask.PositioningController.prototype.clear = function(){
	InteractiveTask.disposeObject(this);
};
InteractiveTask.PositioningController.prototype.init = function(){
    var image1 = InteractiveTask.LIBRARY.getImage(this.xml.FILENAME1["#text"]),// new Image(),
	    image2 = InteractiveTask.LIBRARY.getImage(this.xml.FILENAME2["#text"]),//new Image(),
	    altQuestionImg = InteractiveTask.LIBRARY.getImage(this.xml.FILENAME3),//new Image(),
	    failImg = InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.POSITIONING_FAIL),//new Image(),
        questionImg = InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.POSITIONING_QUESTION),//new Image(),
	    trueImg = InteractiveTask.LIBRARY.getImage(this.xml.FILENAME6["#text"]),//new Image(),
	    controller = this, idMas = [], id=0, idd=0,
        x1 = parseInt(this.xml.X1), x2 = parseInt(this.xml.X2), y1 = parseInt(this.xml.Y1), y2 = parseInt(this.xml.Y2),
        numline = parseInt(this.xml.NUMLINE), numcolumn = parseInt(this.xml.NUMCOLUMN), layer = this.layer,
        width = parseInt(this.xml.WIDTH), height = parseInt(this.xml.HEIGHT), tryCol = parseInt(this.xml.TRY),
        net1 = [], net2 = [], stepX = width/numcolumn, stepY = height/numline, count = 0,
		isComplatePositioning = false;

// Создаём два массива клеток //////////////////////////////////////////////////////////////////////////////////////////
    for(i=0;i<numline;i++){
        net1[i] = [];
        net2[i] = [];
        idMas[i] = [];
        for(j=0;j<numcolumn;j++){
            net1[i][j] = new Kinetic.Rect({
                x : x1 + i*stepX,
                y : y1 + j*stepY,
                width : stepX,
                height : stepY,
                stroke : "black",
            });
            net2[i][j] = new Kinetic.Rect({
                x : x2 + i*stepX,
                y : y2 + j*stepY,
                width : stepX,
                height : stepY,
                stroke : "black",
            });
        layer.add(net1[i][j]);
        layer.add(net2[i][j]);
        idMas[i][j] = id++;
        net2[i][j].toggle = 0;
        };
    };

// Свойства картинок ///////////////////////////////////////////////////////////////////////////////////////////////////
    img1 = new Kinetic.Image({
        image: image1,
        x: x1,
        y: y1,
        width: width,
        height: height
    });
    img2 = new Kinetic.Image({
        image: image2,
        x: x2,
        y: y2,
        width: width,
        height: height
    });
    imgAltQuestion = new Kinetic.Image({
        image: altQuestionImg,
        x: net2[0][0].getX(),
        y: net2[0][0].getY(),
        width: stepX,
        height: stepY
    });
    imgFail = new Kinetic.Image({
        image: failImg,
        x: x1,
        y: x2,
        offset:{
            x:23,
            y:23
        },
        width: 46,
        height: 46
    });
    imgQuestion = new Kinetic.Image({
        image: questionImg,
        x: net2[0][0].getX(),
        y: net2[0][0].getY(),
        width: stepX,
        height: stepY
    });
    imgTrue = new Kinetic.Image({
        image: trueImg,
        x: x1,
        y: y1,
        width: stepX,
        height: stepY
    });

// Проверка: изображение или пусто /////////////////////////////////////////////////////////////////////////////////////
    if (this.xml.FILENAME1["-exists"]=="true"){
        this.layer.add(img1);
        img1.moveToBottom();
    } else {
        for(i=0;i<numline;i++){
            for(j=0;j<numcolumn;j++){
                net1[i][j].fill("blue");
            };
        };
    };
    if (this.xml.FILENAME2["-exists"]=="true"){
        this.layer.add(img2);
        img2.moveToBottom();
    } else {
        for(i=0;i<numline;i++){
            for(j=0;j<numcolumn;j++){
                net2[i][j].fill("green");
            };
        };
    };


// Проверка на случайную позицию вопроса/изображения ///////////////////////////////////////////////////////////////////
    if(this.xml.RANDOM == "true"){
        randI = Math.floor( Math.random() * net2.length );
        randJ = Math.floor( Math.random() * net2.length );
        net2[randI][randJ].toggle=1;
        imgQuestion.setX(net2[randI][randJ].getX());
        imgQuestion.setY(net2[randI][randJ].getY());
        imgAltQuestion.setX(net2[randI][randJ].getX());
        imgAltQuestion.setY(net2[randI][randJ].getY());
    };

// Проверка: вопрос или изображение ////////////////////////////////////////////////////////////////////////////////////
    if(this.xml.QUESTION == "false"){
        this.layer.add(imgAltQuestion);
    }   else {
            this.layer.add(imgQuestion);
        };

	var self = this.controller;
// Обработка клика мыши /////////////////////////////////////////////////////////////////////////////////////////////////
    for (i=0;i<numline;i++){
        for (j=0;j<numcolumn;j++){

         net1[i][j].on('click', function(e){
            mX = e.evt.layerX;
            mY = e.evt.layerY;
            if (mX>net1[randI][randJ].getX() && mX<net1[randI][randJ].getX()+stepX &&
                mY>net1[randI][randJ].getY() && mY<net1[randI][randJ].getY()+stepY){
                if (controller.xml.FILENAME6["-exists"]=="true"){
                    tempImg = imgTrue.clone();
                    tempImg.setX(net1[randI][randJ].getX());
                    tempImg.setY(net1[randI][randJ].getY());
                    layer.add(tempImg);
                    count++;
                    if (count==numcolumn*numline){
                        layer.batchDraw();
                        imgQuestion.remove();
                        //alert("Finish")
	                    isComplatePositioning = true;
	                    self.checkTask();
	                    return;
                    };
                } else {
                    net1[randI][randJ].fill("yellow");
                    count++;
                    if (count==numcolumn*numline){
                       layer.batchDraw();
                       imgQuestion.remove();
                       //alert("Finish")
	                    isComplatePositioning = true;
	                    self.checkTask();
	                    return;
                    };
                };
                getRandom = function(){
                    randI = Math.floor( Math.random() * net2.length );
                    randJ = Math.floor( Math.random() * net2.length );
                    if (net2[randI][randJ].toggle == 0){
                        imgQuestion.setX(net2[randI][randJ].getX());
                        imgQuestion.setY(net2[randI][randJ].getY());
                        net2[randI][randJ]=1;
                    } else {
                        getRandom();
                    };
                };
                getRandom();
            } else {
                tryCol--;
                tempImg = imgFail.clone();
                tempImg.setX(mX);
                tempImg.setY(mY);
                layer.add(tempImg);
                if(tryCol==0){
                    location.reload();
                };
            };
            layer.batchDraw();
         });
         net2[i][j].on('click', function(e){
            mX = e.evt.layerX;
            mY = e.evt.layerY;
            tryCol--;
            tempImg = imgFail.clone();
            tempImg.setX(mX);
            tempImg.setY(mY);
            layer.add(tempImg);
            if(tryCol==0){
                location.reload();
            };
            layer.batchDraw();
         });
        };
    };
    layer.batchDraw();

	this.getResult = function(){
		return  isComplatePositioning;
	};
};
