/**
 * Исправить работу со слоями
 * @param options
 * @constructor
 */
InteractiveTask.PuzzleController = function(options){
    this.ObjLayer = options.ObjLayer;
    this.xml = options.xml;
    this.controller = options.controller;
    this.path = options.path;

	this.init();
};
InteractiveTask.PuzzleController.prototype.clear = function(){
   InteractiveTask.disposeObject(this);
};
InteractiveTask.PuzzleController.prototype.init = function(){
    var imageObj = InteractiveTask.LIBRARY.getImage(this.xml.SETTINGS.PAZZLE.FILENAME),
        pwidth = this.controller.player.width,
        pheight = this.controller.player.height,
        numLine = parseInt(this.xml.SETTINGS.PAZZLE.NUMLINE),
        numCol = parseInt(this.xml.SETTINGS.PAZZLE.NUMCOLUMN),
        width = parseInt(this.xml.SETTINGS.PAZZLE.WIDTH),
        height = parseInt(this.xml.SETTINGS.PAZZLE.HEIGHT),
        x = parseInt(this.xml.X), y = parseInt(this.xml.Y),
        stepX = parseFloat((width/numCol).toFixed(2)), stepY = parseFloat((height/numLine).toFixed(2)),
        r  = 0.7*(1/2*Math.min(stepX, stepY)), jump = (this.xml.SETTINGS.PAZZLE.JUMP/100)*(1/2*Math.min(stepX, stepY)),
        size = numLine*numCol, m, dest, d = Math.sqrt((stepX*stepX)+(stepY*stepY)),
        layer = this.ObjLayer, sample, thiscontroller = this,
        state = false, refRotation=null,
        count = 0, boolean = false, id_net=0, id_pic=0,
        degree, c=1,
        mcX, mcY, mcXc, mcYc,
        rotateAngle, mouseStartXFromCenter, mouseStartYFromCenter, mouseStartAngle,
        mouseXFromCenter, mouseYFromCenter, mouseAngle,
        pic = [], net = [],
        variant = [22.5, -22.5, 45, -45, 67.5, -67.5, 90, -90, 112.5, -112.5, 135,
                  -135, 157.5, -157.5, 180, -180, 0];

// Путь до месторасположения картинки + название самой картинки ////////////////////////////////////////////////////////
   //imageObj.src = this.path + '/' + this.xml.SETTINGS.PAZZLE.FILENAME;



    helpImg = new Konva.Image({
        image: imageObj,
        x: x,
        y: y,
        width: width,
        height: height,
        opacity: 0.5,
        crop:{
            x: 0,
            y: 0,
            width: stepX*numCol,
            height: stepY*numLine
        },
    });

// Создаём массив клеток и пазлов //////////////////////////////////////////////////////////////////////////////////////
    for (i=0;i<numCol;i++){
        net[i] = [];
        pic[i] = [];
        for(j=0;j<numLine;j++){
            net[i][j] = new Konva.Rect({
                x: x+i*stepX,
                y: y+j*stepY,
                width: stepX,
                height: stepY,
                stroke: 'black',
            });
            pic[i][j] = new Konva.Image({
                image: imageObj,
                x: stepX+Math.random()*((pwidth-2*stepX)+1),
                y: stepY+Math.random()*((pheight-2*stepY)+1),
                width: stepX,
                height: stepY,
                offset:{
                    x:stepX/2,
                    y:stepY/2
                },
                crop:{
                    x: i*stepX,
                    y: j*stepY,
                    width: stepX,
                    height: stepY
                },
                draggable: false,
                rotation: variant[Math.floor( Math.random() * variant.length )]
            });

// Добавляем элементы на слой с учетом тегов xml ///////////////////////////////////////////////////////////////////////
            net[i][j].id=id_net++;
            net[i][j].done=false;
            layer.add(net[i][j]);
            net[i][j].moveToBottom();

            switch(this.xml.SETTINGS.PAZZLE.POSITIONER) {
                case "RANDOM":
                    pic[i][j].x(d/3+Math.random()*((pwidth-d)+1));
                    pic[i][j].y(d/3+Math.random()*((pheight-d)+1));
                    break;
                case "ONE COLUMN":
                    pic[i][j].x(pwidth/2);
                    pic[i][j].y(pheight/2);
                    break;
                case "AROUND FIELD":
                /*if (x>d/3 && (pwidth-(width+x))>d/3 && y>d/3 && (pheight-(height+y))>d/3){
                dest=parseInt(Math.random()*2);
                } else {
                if (x>d/3 && (pwidth-(width+x))<d/3 && y>d/3 && (pheight-(height+y))<d/3){
                //pic[i][j].x(d/3+Math.random()*((x-d)+1));
                //pic[i][j].y(d/3+Math.random()*((y-d)+1));
                if(dest==1){
                pic[i][j].x((width+x)+d/3+Math.random()*((pwidth-d/3)-((width+y)+d/3)+1));
                }
                } else {
                if (x<d/3 && (pwidth-(width+x))>d/3 && y<d/3 && (pheight-(height+y))>d/3){
                if(dest==1){
                pic[i][j].x(d/3+Math.random()*((pwidth-d)+1));
                pic[i][j].y((height+y)+d/3+Math.random()*((pheight-d/3)-((height+y)+d/3)+1));
                } else {
                pic[i][j].x((width+x)+d/3+Math.random()*((pwidth-d/3)-((width+y)+d/3)+1));
                pic[i][j].y(d/3+Math.random()*((pheight-d)+1));
                }
                } else {
                pic[i][j].x(d/3+Math.random()*((pwidth-d)+1));
                pic[i][j].y(d/3+Math.random()*((pheight-d)+1));
                }
                }
                }*/
                break;
                case "AUTHOR POSITION":
                    for(q=0;q<this.xml.SETTINGS.PAZZLE.POSITION.SAMPLE.length;q++){
                        if(this.xml.SETTINGS.PAZZLE.POSITION.SAMPLE[q]["-I"]==i &&
                           this.xml.SETTINGS.PAZZLE.POSITION.SAMPLE[q]["-J"]==j){
                                pic[i][j].setX(parseFloat(this.xml.SETTINGS.PAZZLE.POSITION.SAMPLE[q].X));
                                pic[i][j].setY(parseFloat(this.xml.SETTINGS.PAZZLE.POSITION.SAMPLE[q].Y));
                                break;
                           };
                    };
            };
            switch(this.xml.SETTINGS.PAZZLE.HELPER){
                case "SAMPLE BACKGRAUND":
                   layer.add(helpImg);
                   helpImg.moveToBottom();
                   layer.batchDraw();
            };
            pic[i][j].id=id_pic++;
            pic[i][j].done=false;
            layer.add(pic[i][j]);
            pic[i][j].moveToTop();
            layer.batchDraw();
        };
    };

// Обработка взаимодействий с пазлом (вращение, перемещение) ////////////////////////////////////////////////////////////
	var self = this.controller;
    for(n=0;n<numCol;n++){
        for(m=0;m<numLine;m++){
	        pic[n][m].on('mousedown touchstart', function(e){
		        this.moveToTop();
		        target=this;
		        var touchPos = InteractiveTask.STAGE.getPointerPosition();
		        mcXc = touchPos.x;
		        mcYc = touchPos.y;
		        mouseStartXFromCenter =   mcXc - this.getX();
		        mouseStartYFromCenter =  mcYc - this.getY();
		        mouseStartAngle = Math.atan2(mouseStartYFromCenter, mouseStartXFromCenter);
		        if(mcXc>=parseInt(this.getX()-r) && mcXc<=parseInt(this.getX()+r) &&
			        mcYc>=parseInt(this.getY()-r) && mcYc<=parseInt(this.getY()+r)){
			        this.draggable(true);
		        } else {
			        state = true;
			        //layer.on('mousemove touchmove', function(e) {
			        InteractiveTask.STAGE.on("mousemove touchmove", function(e){
				        var touchPos = InteractiveTask.STAGE.getPointerPosition();
				        mcX = touchPos.x;
				        mcY = touchPos.y;
				        mouseXFromCenter =  mcX - target.getX();
				        mouseYFromCenter = mcY - target.getY();
				        mouseAngle = Math.atan2(mouseYFromCenter, mouseXFromCenter);
				        rotateAngle = mouseAngle - mouseStartAngle;
				        mouseStartAngle = mouseAngle;
				        degree = rotateAngle*(180/Math.PI);

				        degree = target.rotation()+degree;
				        if(degree == 360 || degree == -360) degree = 0;
				        if(degree<0){
					        degree = 360+degree;
				        };
				        if(degree>360){
					        degree = degree - 360;
				        };
				        //alert("color rotation = " + rot + "; black rotation = " + this.blackTan.rotation());
				        //console.log("color rotation = ",rot,"; black rotation = ",this.blackTan.rotation())
				       // this.colorTan.rotation(rot);


				        target.rotation(degree);
				        layer.batchDraw();
			        });

			        InteractiveTask.STAGE.on("mouseup touchend" , function(e){
				        InteractiveTask.STAGE.off("mouseup touchend");
				        InteractiveTask.STAGE.off("mousemove touchmove");
				        self.checkTask();

				        var r = Math.round(target.rotation()/22.5) * 22.5;
				        if(r == 360) r = 0;

				        target.rotation(r);
				        layer.batchDraw();
			        });
		        };
	        });
            pic[n][m].on('mouseup', function(e){
                this.draggable(false);
                state=false;
	            self.checkTask();

	            var r = Math.round(target.rotation()/22.5) * 22.5;
	            if(r == 360) r = 0;

	            target.rotation(r);
	            layer.batchDraw();
            });

            pic[n][m].on('touchend', function(e){
                this.draggable(false);
                state=false;
	            self.checkTask();

	            var r = Math.round(target.rotation()/22.5) * 22.5;
	            if(r == 360) r = 0;

	            target.rotation(r);
	            layer.batchDraw();
            });

// Обработка попадания пазла в клетку и проверка на правильность ///////////////////////////////////////////////////////
            pic[n][m].on('dragend', function(e){
                var bLeft = [],
                    bRight = [],
                    bTop = [],
                    bBottom = [];
                for(i=0;i<numCol;i++){
                    bLeft[i] = [];
                    bRight[i] = [];
                    bTop[i] = [];
                    bBottom[i] = [];
                    for(j=0;j<numLine;j++){
                         bLeft[i][j] = net[i][j].getX();
                         bTop[i][j] = net[i][j].getY();
                         bRight[i][j] = parseFloat((parseFloat(bLeft[i][j]) + stepX*1).toFixed(2));
                         bBottom[i][j] = parseFloat((parseFloat(bTop[i][j]) + stepY*1).toFixed(2));
                         tmp1=((bRight[i][j]+bLeft[i][j])/2)+jump;
                         tmp2=((bRight[i][j]+bLeft[i][j])/2)-jump;
                         tmp3=((bBottom[i][j]+bTop[i][j])/2)+jump;
                         tmp4=((bBottom[i][j]+bTop[i][j])/2)-jump;
                           if(this.getX() <= tmp1 && this.getX()>=tmp2 &&
                              this.getY() <= tmp3 && this.getY()>=tmp4) {
                            this.setX(bLeft[i][j]+stepX/2);
                            this.setY(bTop[i][j]+stepY/2);
                            layer.batchDraw();
// Проверка ////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            if(this.id == net[i][j].id && this.done!=true){
                                    this.done = true;
                                    count++;
                                    if (count==numLine*numCol){
                                     //   alert("win")
                                        boolean=true;
// CALLBACK ////////////////////////////////////////////////////////////////////////////////////////////////////////////
	                                    self.checkTask();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                    };
                            };

                            if(this.id != net[i][j].id && this.done==true){
                                    this.done = false;
                                    count--;
                            };
                            return;
                         };
                    };
                };
            });
    };
};
// Функции получения подсказки и проверки результата ///////////////////////////////////////////////////////////////////
    this.showHelp = function(){
        layer.add(helpImg);
        helpImg.moveToBottom();
        layer.batchDraw();
    };

    this.getResult = function() {
        return boolean;
    };
};

