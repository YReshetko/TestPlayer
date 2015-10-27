/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 16.02.15
 * Time: 9:23
 * To change this template use File | Settings | File Templates.
 */

if(typeof(InteractiveTask) == 'undefined') InteractiveTask = function(){};
InteractiveTask.VERSION = "2.0.6";

InteractiveTask.STAGE;
InteractiveTask.BACKGROUND_LAYER;
InteractiveTask.COMPONENTS_LAYER;
InteractiveTask.ANIMATION_LAYER;
InteractiveTask.DRAGANDDROP_LAYER;
InteractiveTask.BUTTONS_LAYER;
InteractiveTask.LIBRARY;
InteractiveTask.PATH;
InteractiveTask.CONST;
InteractiveTask.EVENTS;
InteractiveTask.ANSFRAME;
InteractiveTask.PROGRESS;
InteractiveTask.AUDIO;


/**
 *
 * @param options - JSON string format:
 *      - xml - TaskObject full package task
 *      - containerID - ID <div> container on parent page
 *      - errorCallback() - run if canvas can't be created
 *      - successCallback() - run if canvas is created (return in callback prototype of player)
 *      - taskComplateCallback(json) - run if task is complate (return in callback json object)
 * @constructor - return player prototype or run callback function
 */
InteractiveTask.Player = function(options){

    InteractiveTask.CONST = new InteractiveTask.Const();
	//  Попытка загрузить и перенастроить константы плеера
	try{
		if (window.XMLHttpRequest){
			this.xhttp=new XMLHttpRequest();
		}else{
			this.xhttp=new ActiveXObject("Microsoft.XMLHTTP");
		};
		this.xhttp.open("GET",options.imagesPath+"config.json",false);
		this.xhttp.send();
		InteractiveTask.CONST.setProperty(JSON.parse(this.xhttp.responseText));
		this.xhttp.responseText = null;
		this.xhttp = null;
	}catch(e){
		InteractiveTask.log(e);
	};
	if(options.isPrintLog){
		InteractiveTask.CONST.IS_PRINT_LOG = options.isPrintLog;
	};
	InteractiveTask.log("[Player] - start init - ", this);

	InteractiveTask.log("[Player] - init UI congig");
	InteractiveTask.EVENTS = new InteractiveTask.Events();
    if(options.xml == undefined){
        alert("Task can't be created without xml file");
        return null;
    }else{
        this.xml = options.xml;
    };
    //Default stage size
    this.width = 742;
    this.height = 530;
	this.isFullScreen = false;

	// Containers initialisation
	this.containerID = options.containerID;
	this.progressContainerID = options.progressContainerID;
    //If size should be changed
    if(this.xml.WIDTH!=undefined && this.xml.HEIGHT!=undefined){
        this.width = parseInt(this.xml.WIDTH);
        this.height = parseInt(this.xml.HEIGHT);
    };
	InteractiveTask.log("[Player] - start init stage");
    InteractiveTask.STAGE = new Konva.Stage({
        container : options.containerID,
        width: this.width,
        height: this.height
    });
	InteractiveTask.log("[Player] - complate init stage");
	InteractiveTask.BACKGROUND_LAYER = new Konva.Layer();
	var bgRectangle = new Konva.Rect({
		width : this.width,
		height : this.height,
		fill : InteractiveTask.formatColor("0", 0)
	});
	InteractiveTask.BACKGROUND_LAYER.add(bgRectangle);

	InteractiveTask.COMPONENTS_LAYER = new Konva.Layer();
	InteractiveTask.ANIMATION_LAYER = new Konva.Layer();
	InteractiveTask.DRAGANDDROP_LAYER = new Konva.Layer();
	InteractiveTask.BUTTONS_LAYER = new Konva.Layer();

	InteractiveTask.STAGE.add(InteractiveTask.BACKGROUND_LAYER);
	InteractiveTask.STAGE.add(InteractiveTask.COMPONENTS_LAYER);
	InteractiveTask.STAGE.add(InteractiveTask.ANIMATION_LAYER);
	InteractiveTask.STAGE.add(InteractiveTask.DRAGANDDROP_LAYER);
	InteractiveTask.STAGE.add(InteractiveTask.BUTTONS_LAYER);
	InteractiveTask.log("[Player] - complate init layers");

	InteractiveTask.BACKGROUND_LAYER.canvas._canvas.id = "background_layer";
	InteractiveTask.COMPONENTS_LAYER.canvas._canvas.id = "components_layer";
	InteractiveTask.ANIMATION_LAYER.canvas._canvas.id = "animation_layer";
	InteractiveTask.DRAGANDDROP_LAYER.canvas._canvas.id = "draganddrop_layer";
	InteractiveTask.BUTTONS_LAYER.canvas._canvas.id = "buttons_layer";

	InteractiveTask.BACKGROUND_LAYER.draw();
	InteractiveTask.log("[Player] - draw background");

   /* }catch(error){
        if(options.errorCallback != 'undefined'){
            options.errorCallback();
        }else{
            alert("Your sourece doesn't have 'errorCallback' function");
        }
        return null;
    }   */
    //remember task complate callback function

	this.eventDispatcher =  options.callBack;

    //this.taskComplateCallbackFunction = options.taskComplateCallback;

    //try call success function if canvas is created
    /*if(options.successCallback!='undefined'){
       // options.successCallback();
        this.successCallback = options.successCallback;
    }  */
    InteractiveTask.PATH = options.xml.RESOURCE;

	InteractiveTask.AUDIO = new InteractiveTask.audioControl(this);
	InteractiveTask.log("[Player] - start init library");
    InteractiveTask.LIBRARY = new InteractiveTask.ImageLibrary(options.xml, this, options.imagesPath);
    InteractiveTask.LIBRARY.findImages();

	window.onresize = function(){
		self.resizePlayer();
	};

	var self = this;
	if(InteractiveTask.isMobileBrowser()){
		InteractiveTask.StartFrame(this);
	}else{
		this.startFillLibrary();
	};
};
InteractiveTask.Player.prototype.startFillLibrary = function(){
	if(InteractiveTask.LIBRARY.hasAudio()){
		InteractiveTask.LIBRARY.loadAudio();
	};
    InteractiveTask.LIBRARY.startLoading();
	InteractiveTask.log("[Player] - start loading images");
};

/*Метод очистки плеера после его отработки*/
InteractiveTask.Player.prototype.clear = function(){
	InteractiveTask.log("[Player] - start clearing");
	try{
		InteractiveTask.log("[Player] - try clear current timeout for next task");
		if(this.startTaskTimeout){
			try{
				clearTimeout(this.startTaskTimeout);
			}catch(e){
				InteractiveTask.log(e);
			};
		};
		InteractiveTask.log("[Player] - clear current task");
		if(this.currentTask){
			this.currentTask.clear();
			InteractiveTask.disposeObject(this.currentTask);
		};
		InteractiveTask.log("[Player] - dispose ansframe");
		InteractiveTask.disposeObject(InteractiveTask.ANSFRAME);
		InteractiveTask.ANSFRAME = null;
		InteractiveTask.log("[Player] - clear progress bar");
		if(InteractiveTask.PROGRESS!=undefined){
			InteractiveTask.PROGRESS.clear();
			InteractiveTask.PROGRESS = null;
		};
		InteractiveTask.log("[Player] - clear buttons layer");
		InteractiveTask.BUTTONS_LAYER.clear();
		InteractiveTask.BUTTONS_LAYER.destroyChildren();

		InteractiveTask.PATH = null;
		InteractiveTask.CONST = null;
		InteractiveTask.EVENTS = null;

		InteractiveTask.log("[Player] - clear stage");
		InteractiveTask.STAGE.clear();
		InteractiveTask.STAGE.clearCache();
		InteractiveTask.LIBRARY.clear();
		InteractiveTask.STAGE.destroyChildren();
		InteractiveTask.STAGE.destroy();

		InteractiveTask.log("[Player] - clear layers");
		InteractiveTask.BACKGROUND_LAYER = null;
		InteractiveTask.COMPONENTS_LAYER = null;
		InteractiveTask.ANIMATION_LAYER = null;
		InteractiveTask.DRAGANDDROP_LAYER = null;
		InteractiveTask.BUTTONS_LAYER = null;
		InteractiveTask.STAGE = null;

		InteractiveTask.AUDIO.clear();
		InteractiveTask.AUDIO = null;

		window.onresize = function(){
			return;
		};
		InteractiveTask.log("[Player] - dispose player");
		//InteractiveTask.disposeObject(this);
	}catch(e){
		InteractiveTask.log("[Player] - clear error:");
		InteractiveTask.error(e);
	}
};

InteractiveTask.Player.prototype.changeFullScreen = function(){
	this.isFullScreen = !this.isFullScreen;
};
InteractiveTask.Player.prototype.resizePlayer = function(){
	var contWidth = $("#"+this.containerID).width();
	var contHeight = parseInt($("#"+this.containerID).css('max-height'), 10) || $("#"+this.containerID).height();
	var scaleX, scaleY, minScale;
	InteractiveTask.log("[Player] - parent width = " + contWidth + "; parent height = " + contHeight);
	if(!this.isFullScreen){
		//InteractiveTask.log("not full screen");
		if(contWidth<this.width || contHeight<this.height){
			scaleX = contWidth/this.width;
			scaleY = contHeight/this.height;
			minScale = (scaleX<scaleY)?scaleX:scaleY;
		}else{
			var minScale = 1;
		};
	}else{
		scaleX = window.screen.availWidth/this.width;
		scaleY = window.screen.availHeight/this.height;
		minScale = (scaleX<scaleY)?scaleX:scaleY;
	};
	//InteractiveTask.log("min scale = " + minScale);
	InteractiveTask.STAGE.scaleX(minScale);
	InteractiveTask.STAGE.scaleY(minScale);
	InteractiveTask.STAGE.width(this.width*minScale);
	InteractiveTask.STAGE.height(this.height*minScale);

	if(InteractiveTask.PROGRESS!=undefined){
		InteractiveTask.PROGRESS.scale(minScale);
	};
};
InteractiveTask.Player.prototype.progressSelect = function(taskID){
	if(InteractiveTask.PROGRESS!=undefined){
		InteractiveTask.PROGRESS.select(taskID);
	};
};
InteractiveTask.Player.prototype.progressSetAnswer = function(taskID, flag){
	if(InteractiveTask.PROGRESS!=undefined){
		InteractiveTask.PROGRESS.setComplate(taskID, flag);
	};
};

InteractiveTask.Player.prototype.libraryLoadComplate = function(){
    //this.library.printImages();
    //this.successCallback()
	/*this.buttonLayers = {
		restart : new Konva.Layer(),
		dontknow : new Konva.Layer(),
		understand : new Konva.Layer(),
		check : new Konva.Layer(),
		sound : new Konva.Layer(),
		fullscreen : new Konva.Layer(),
		pause : new Konva.Layer()
	};  */
	InteractiveTask.log("[Player] - complate loading images");
	InteractiveTask.ANSFRAME = new InteractiveTask.TestChangeFrame(this.width, this.height, this);
	 try{
		InteractiveTask.PROGRESS = new InteractiveTask.TestProgress({
			xml : this.xml,
			containerID : this.progressContainerID
		});
	 }catch(e){
		 //InteractiveTask.log(e);
		 this.eventDispatcher(InteractiveTask.EVENTS.INIT_PROGRESS_ERROR, null);
	 };
	InteractiveTask.log("[Player] - dispatch init playe");
	this.eventDispatcher(InteractiveTask.EVENTS.INIT_PLAYER_SUCCESS, null);
};

InteractiveTask.Player.prototype.setEvent = function(event){
	//InteractiveTask.log(event.keyCode);
    switch (event.type){
        case "keyboard":
            switch (event.keyCode){
                case 87:
                   // alert("UP");

                    break;
                case 83:
                    //alert("DOWN");
                    break;
                case 65:
                    //alert("LEFT");
                    this.currentTask.rotate(22.5);
                    break;
                case 68:
                    //alert("RIGHT");
                    this.currentTask.rotate(-22.5);
                    break;

            };
            break;
    };
    InteractiveTask.STAGE.draw();
};
InteractiveTask.Player.prototype.buttonEvents = function(value, event){
	this.eventDispatcher(InteractiveTask.EVENTS.MOUSE_OVER_OUT_BUTTON, {
		button : value,
		event : event
	});
};

InteractiveTask.Player.prototype.pause = function(){
	//InteractiveTask.log("pause select");
	this.currentTask.timer.stop();
	InteractiveTask.ANSFRAME.wait();
	var self = this;
	InteractiveTask.ANSFRAME.waitFrame.on("mousedown touchstart", function(evt){
		self.resume();
	});
};
InteractiveTask.Player.prototype.resume = function(){
	InteractiveTask.ANSFRAME.close();
	this.currentTask.timer.resume();
	InteractiveTask.ANSFRAME.waitFrame.off("mousedown touchstart");
};
InteractiveTask.Player.prototype.complatePackage = function(){
	InteractiveTask.log("[Player] - dispatch TASK_COMPLATE");
	this.eventDispatcher(InteractiveTask.EVENTS.TASK_COMPLATE, this.getOutResult());
};
InteractiveTask.Player.prototype.getOutResult = function(){
	var i,l;
	l = this.outResult.length;
	var tableResult = new Array();
	var maxScore = 0;
	var currentScore = 0;
	var cTaskResult = 0; // результат только для текущего задания
	var taskID = 0;
	var deltaScore;
	var deltaTime;
	this.outResult.numComplateTask = 0;
	if(this.isTest()){
		for(i=0;i<l;i++){
			if(!this.outResult[i].isImaginary) {
				++taskID;
				maxScore += this.outResult[i].maximumResult;
				if(this.outResult[i].isComplate){
					++this.outResult.numComplateTask;
					cTaskResult = this.calculateResultForTask(i);
					tableResult.push({taskID : taskID, currentResult : cTaskResult, maximumResult : this.outResult[i].maximumResult});
					currentScore += cTaskResult;
				}else{
					tableResult.push({taskID : taskID, currentResult : 0, maximumResult : this.outResult[i].maximumResult});
				};

			};
		};
	}else{
		for(i=0;i<l;i++){
			if(!this.outResult[i].isImaginary && this.outResult[i].level == "1") {
				++taskID;
				maxScore += this.outResult[i].maximumResult;
				if(this.outResult[i].isComplate){
					++this.outResult.numComplateTask;
					cTaskResult = this.calculateResultForTask(i);
					tableResult.push({taskID : taskID, currentResult : cTaskResult, maximumResult : this.outResult[i].maximumResult});
					currentScore += cTaskResult;
				}else{
					tableResult.push({taskID : taskID, currentResult : 0, maximumResult : this.outResult[i].maximumResult});
				};
			};
		};
	};
	this.outResult.links = InteractiveTask.getIDLessons(this.xml);
	this.outResult.tableResult = tableResult;
	this.outResult.maxScore = maxScore;
	this.outResult.currentScore = currentScore;
	return this.outResult;
};
/**
 * Вычисление результата для i-ого задания с учетом факторов влияющих на понижение балла (подводящие, жизни, таймер)
 * @param i
 * @returns {number}
 */
InteractiveTask.Player.prototype.calculateResultForTask = function(i){
	var cTaskResult = 0; // результат только для текущего задания
	var deltaScore;
	var deltaTime;
	cTaskResult = this.outResult[i].maximumResult * Math.pow(InteractiveTask.CONST.DECREASING_COEFFICIENT, this.outResult[i].numHelping);
	if(this.outResult[i].maxHealth>0){
		deltaScore = (1-(1/this.outResult[i].maxHealth));
		cTaskResult = cTaskResult*Math.pow(deltaScore, (this.outResult[i].maxHealth - this.outResult[i].numHealth));
	};
	if(this.outResult[i].time>0){
		if(this.outResult[i].timeForMaxScore==0){
			deltaTime = this.outResult[i].time/InteractiveTask.CONST.FULL_TIME_DIVIDER;
			deltaScore = cTaskResult/InteractiveTask.CONST.FULL_TIME_DIVIDER;
			cTaskResult = cTaskResult - deltaScore * Math.floor((this.outResult[i].time - this.outResult[i].currentTime)/deltaTime);
		};
		if(this.outResult[i].timeForMaxScore>0 && this.outResult[i].currentTime+1<(this.outResult[i].time - this.outResult[i].timeForMaxScore)){
			deltaTime = (this.outResult[i].time - this.outResult[i].timeForMaxScore)/InteractiveTask.CONST.TIME_DIVIDER;
			deltaScore = cTaskResult/InteractiveTask.CONST.TIME_DIVIDER;
			cTaskResult = cTaskResult - deltaScore * Math.floor((this.outResult[i].time - this.outResult[i].timeForMaxScore - this.outResult[i].currentTime)/deltaTime);
		};
	};
	return cTaskResult;
};


/***********************************************************************
 * Block of start task                                                 *
 ***********************************************************************/
InteractiveTask.Player.prototype.startTask = function(){
   // this.buttonLayer = new Konva.Layer();
	/*this.buttonLayers = {
		restart : new Konva.Layer(),
		dontknow : new Konva.Layer(),
		understand : new Konva.Layer(),
		check : new Konva.Layer(),
		sound : new Konva.Layer(),
		fullscreen : new Konva.Layer()
	}; */
	InteractiveTask.log("[Player] - start task");
	InteractiveTask.log("[Player] - create button system");
    this.buttonSystem = new InteractiveTask.ButtonSystem(this.width, this.height, this);
	InteractiveTask.log("[Player] - create ans frames");
	InteractiveTask.ANSFRAME.setFscreenButton(this.buttonSystem.fullscreen.button);
	InteractiveTask.log("[Player] - prepare task");
    this.prepareArrayTaskOptions();
    this.currentTaskID = 0;
	this.oldTaskID = 0;
	InteractiveTask.log("[Player] - start current task/ id = "+ this.currentTaskID);
    this.startCurrentTask();
};
InteractiveTask.Player.prototype.prepareArrayTaskOptions = function(){
    this.xmlTaskArray = new Array();
    this.outResult = new Object();
    if(this.xml.TASK[0]==undefined){
        this.xmlTaskArray[0] = this.xml.TASK;
    }else{
        /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*
         * TODO: mix tasks or block of tasks (for MNIMOE) if isRandom == true and Equivalent != 1 *
         *!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
        this.xmlTaskArray = this.xml.TASK;
    };
    var i,l;
    l = this.xmlTaskArray.length;
	var maxResult;
    for(i=0;i<l;i++){
	    maxResult = (this.xmlTaskArray[i]["-eval"]!=undefined)?(parseInt(this.xmlTaskArray[i]["-eval"])):1;
        this.outResult[i] = {
            level : this.xmlTaskArray[i]["-level"],
            id : i,
            isImaginary : this.isMnimoe(i),
            isComplate : false,
	        maximumResult : maxResult,  // взять данный результат из файла задания (разработать в конструкторе установку баллов)
	        numHelping : 0, // указывать уровень подводящего задания для определения понижающего бала
            comment : "",

	        maxHealth : (this.xmlTaskArray[i].HEALTH)?parseInt(this.xmlTaskArray[i].HEALTH):0,
	        numHealth : (this.xmlTaskArray[i].HEALTH)?parseInt(this.xmlTaskArray[i].HEALTH):0,

	        time : (this.xmlTaskArray[i].TIMER)?InteractiveTask.getTimeByString(this.xmlTaskArray[i].TIMER):0,
	        timeForMaxScore : (this.xmlTaskArray[i].MAX_SCORE_TIMER)?InteractiveTask.getTimeByString(this.xmlTaskArray[i].MAX_SCORE_TIMER):-1,
	        currentTime : -1
        };
    };
    this.outResult.length = l;
    this.outResult.maxTasks = this.getNumberResultTask();
    this.outResult.numComplateTask = 0;
};
/************************************************************************************
/************************************************************************************
/************************************************************************************
 *    БЛОК КОНТРОЛЯ СМЕНЫ ЗАДАНИЙ
 ************************************************************************************/
/************************************************************************************/
/************************************************************************************/
InteractiveTask.Player.prototype.finishTask = function(isComplate){
	// останавливаем таймер
	this.currentTask.stopTimer();
	// записываем в результат успешное завершение задания
	this.outResult[this.currentTaskID].isComplate = isComplate;
	//  Записываем в результат сколько жизней осталось
	this.outResult[this.currentTaskID].numHealth = this.currentTask.getCurrentHealth();
	//  Записываем время потраченое на решение задания
	this.outResult[this.currentTaskID].currentTime = this.currentTask.getCurrentTimer();

	//  в прогресс баре устанавливаем результат завершения задания
	this.progressSetAnswer(this.xmlTaskArray[this.currentTaskID]["-id"], isComplate);
	//  запоминаем последнее задание (его номер)
	this.oldTaskID = this.currentTaskID;
	//  Диспатчим событие завершения текущего задания
	this.eventDispatcher(InteractiveTask.EVENTS.CURRENT_TASK_COMPLATE, null);
};

// Задание завершилось успешно
InteractiveTask.Player.prototype.complateCurrentTask = function(){
	this.finishTask(true);
	if(this.isTaskChangeAnimation()){InteractiveTask.ANSFRAME.success();};
	this.currentTaskID = this.nextTask(InteractiveTask.EVENTS.TASK_SUCCESS_COMPLATE);
	this.dispatchIsTaskComplate(true, this.oldTaskID);
};
// Завершение задания при ошибке
// - Закончился таймер
// - Закончились жизни
// - Нажата кнопка "Не знаю" в тесте
InteractiveTask.Player.prototype.misstake = function(){
	this.finishTask(false);
	if(!this.isMnimoe(this.currentTaskID)){

		if(this.isTaskChangeAnimation()){InteractiveTask.ANSFRAME.fail();};
		this.currentTaskID = this.nextTask(InteractiveTask.EVENTS.TASK_MISSTAKE);
	}else{
		this.currentTaskID = this.nextTask(InteractiveTask.EVENTS.TASK_MISSTAKE_MNIMOE);
	};
	this.dispatchIsTaskComplate(false, this.oldTaskID);
};
// Завершение задания гибридного режима при повторной ошибке
// - закончился таймер дважды
// - закончились ошибки дважды
InteractiveTask.Player.prototype.doubleMisstake = function(){
	this.finishTask(false);
	if(this.isTaskChangeAnimation()){InteractiveTask.ANSFRAME.fail();};
	this.currentTaskID = this.nextTask(InteractiveTask.EVENTS.TASK_DOUBLE_MISSTAKE);
	this.dispatchIsTaskComplate(false, this.oldTaskID);
};
//  Нажата кнопка "Не знаю"
InteractiveTask.Player.prototype.dontKnow = function(){
	if(this.isTest()){
		this.misstake();
	} else{
		this.finishTask(false);
		this.currentTaskID = this.nextTask(InteractiveTask.EVENTS.TASK_DONT_KNOW);
		this.startCurrentTask();
	};
};
// Нажата кнопка "Я понял"
InteractiveTask.Player.prototype.understand = function(){
	// останавливаем таймер
	this.currentTask.stopTimer();
	this.oldTaskID = this.currentTaskID;
	this.currentTaskID = this.nextTask(InteractiveTask.EVENTS.TASK_UNDERSTAND);
	this.startCurrentTask();
};
// Нажата кнопка "Рестарт" или перезагрузка задания по другой причине

InteractiveTask.Player.prototype.restart = function(){
	// останавливаем таймер
	this.currentTask.stopTimer();
	this.oldTaskID = this.currentTaskID;
	this.startCurrentTask();
};
// Есть ли у задания связанное аудио и диспатчит в случае необходимости
InteractiveTask.Player.prototype.dispatchIsTaskComplate = function(flag, id){
	 if(flag){
		 if(this.hasSuccessAudio(id)){
			 //this.eventDispatcher(InteractiveTask.EVENTS.TEST_SUCCESS_COMPLATE, this.getSuccessAudioID(id));
			 InteractiveTask.AUDIO.init(this.getSuccessAudioID(id), true);
			 return;
		 };
	 } else{
		 if(this.hasFailAudio(id)){
			 //this.eventDispatcher(InteractiveTask.EVENTS.TEST_FAIL_COMPLATE, this.getFailAudioID(id));
			 InteractiveTask.AUDIO.init(this.getFailAudioID(id), true);
			 return;
		 };
	 };
	if(this.isTaskChangeAnimation()){
		var self = this;
		this.startTaskTimeout = setTimeout(function(){
			self.startTaskTimeout = null;
			self.startCurrentTask();
		}, InteractiveTask.CONST.SHOWING_FINAL_FRAME_TIME);
	}else{
		 this.startCurrentTask();
	};
};

// Получение следующего задания при различных событиях
InteractiveTask.Player.prototype.nextTask = function(value){
	 switch (value){
		 case InteractiveTask.EVENTS.TASK_MISSTAKE_MNIMOE:
		 case InteractiveTask.EVENTS.TASK_SUCCESS_COMPLATE:
			if(this.isTest()) return this.getNextTaskInList(this.currentTaskID);
			return this.getNextTaskInDiffTreeWithPositive(this.currentTaskID);
		 case InteractiveTask.EVENTS.TASK_MISSTAKE:
			 if(this.isTest()) return this.getNextTaskInList(this.currentTaskID);
			 return this.getPodvodjashee(this.currentTaskID);
		 case InteractiveTask.EVENTS.TASK_DONT_KNOW:
			 return this.getPodvodjashee(this.currentTaskID);
		 case InteractiveTask.EVENTS.TASK_UNDERSTAND:
			 if(this.isTest()){
				if(this.isMnimoe(this.currentTaskID))return this.getNextTaskInList(this.currentTaskID);
			 }else{
				 if(this.isMnimoe(this.currentTaskID)) return this.getNextTaskInDiffTreeWithPositive(this.currentTaskID);
				 if(!this.isEqualLevels(this.currentTaskID, 0)) return this.getKornevoe(this.currentTaskID)
			 };
		 case InteractiveTask.EVENTS.TASK_RESTART:
			 return this.currentTaskID;
		 case InteractiveTask.EVENTS.TASK_DOUBLE_MISSTAKE:
			 return this.getNextTaskInDiffTreeWithPositive(this.currentTaskID);
	 };
};
// Получение номера следующего задания в дифференцированном дереве  при позитивном переходе:
// - успешное завершение
// - кнопка я понял
// - ошибка в мнимом
InteractiveTask.Player.prototype.getNextTaskInDiffTreeWithPositive = function(value){
	switch(this.getPositionInTree(value)){
		case 'lastTask':
			return -1;
		case 'midleVetv':
			return this.getNext(value);
		case 'lastVetv':
			return this.getKornevoe(value);
	};
};
InteractiveTask.Player.prototype.getPositionInTree = function(value){
    var i,l;
    l = this.xmlTaskArray.length;
    if(this.isEqualLevels(value, 0) && this.isFinaly(value)) return 'lastTask';
    if(!this.isEqualLevels(value, 0) && this.isFinaly(value)) return 'lastVetv';
    for(i=value+1;i<l;i++){
        if(this.isEqualLevels(value, i)) return 'midleVetv';
        if(this.isLevelBigger(value, i)) return 'lastVetv';
    };
    if(this.isEqualLevels(value, 0)) return 'lastTask';
    return 'lastVetv';
};
InteractiveTask.Player.prototype.getKornevoe = function(value){
    var i,l;
    l = this.xmlTaskArray.length;
    for(i=value-1;i>=0;i--){
        if(this.isLevelBigger(value, i)) return i;
    };
    return 0;
};
InteractiveTask.Player.prototype.getMainRoot = function(value){
   	if(this.isEqualLevels(value, 0)) return value;
	if(value == 0) return 0;
	var i = value-1;
	while(!this.isEqualLevels(i, 0)){
		if(i==0) return 0;
		--i;
	};
	return i;
};
InteractiveTask.Player.prototype.getNext = function(value){
    var i,l;
    l = this.xmlTaskArray.length;
    for(i=value+1;i<l;i++){
        if(this.isEqualLevels(value, i)) return i;
    };
    return value;
};
InteractiveTask.Player.prototype.getRestartDiffTree = function(value){
    var i,l;
    l = this.xmlTaskArray.length;
    if(value==0) return 0;
    if(!this.isMnimoe(value-1) && this.isEqualLevels(value, value-1)) return value;
    if(!this.isEqualLevels(value, value-1)) return value;
    for(i=value-1;i>=0;i--){
        if(!this.isMnimoe(i) && this.isEqualLevels(i, i+1)) return (i+1);
        if(!this.isEqualLevels(i, i+1)) return (i+1);
    };
    return value;
};
InteractiveTask.Player.prototype.getPodvodjashee = function(value){
    if(this.isFinaly(value)) return this.getRestartDiffTree(value);
    if(this.isLevelBigger(value+1, value)) return (value+1);
    return this.getRestartDiffTree(value);
};
// Получение номера следующего задания в линейном списке
// возвращает -1 если следующего нет
// возвращает ID если есть
InteractiveTask.Player.prototype.getNextTaskInList = function(value){
    if(this.isFinaly(value)) return -1;
	return value+1;
};

InteractiveTask.Player.prototype.isFinaly = function(value){
    if(value >= this.xmlTaskArray.length-1) return true;
    return false;
};
InteractiveTask.Player.prototype.getTaskLevel = function(value){
    return parseInt(this.xmlTaskArray[value]["-level"]);
};
InteractiveTask.Player.prototype.isEqualLevels = function(value1, value2){
    if(this.getTaskLevel(value1)==this.getTaskLevel(value2)) return true;
    return false;
};
InteractiveTask.Player.prototype.isLevelBigger = function(value1, value2){
    if(this.getTaskLevel(value1)>this.getTaskLevel(value2)) return true;
    return false;
};

/***********************************************************************
 * Работа с экраном                                                    *
 ***********************************************************************/
InteractiveTask.Player.prototype.fullscreenPress = function(){
	this.eventDispatcher(InteractiveTask.EVENTS.FULL_SCREEN_CHANGE, null);
};
/***********************************************************************
 * Работа со звуком                                                    *
 ***********************************************************************/
InteractiveTask.Player.prototype.repeatSound = function(){
	//this.eventDispatcher(InteractiveTask.EVENTS.TEST_START, this.getStartAudioID(this.currentTaskID));
	InteractiveTask.AUDIO.init(this.getStartAudioID(this.currentTaskID), false);
};
//
/* БЛОК ПРОВЕРКИ НАЛИЧИЯ ПРИКРЕПЛЕННОГО АУДИО И ВОЗВРАЩЕНИЯ НОМЕРОВ ФАЙЛОВ*/
//
InteractiveTask.Player.prototype.hasStartAudio = function(value){
	return this.hasAudio({
		id : value,
		audioType : "STARTAUDIO"
	});
};
InteractiveTask.Player.prototype.getStartAudioID = function(value){
	return this.getAudioID({
		id : value,
		audioType : "STARTAUDIO"
	});
};
InteractiveTask.Player.prototype.hasSuccessAudio = function(value){
	return this.hasAudio({
		id : value,
		audioType : "SUCCESSAUDIO"
	});
};
InteractiveTask.Player.prototype.getSuccessAudioID = function(value){
	return this.getAudioID({
		id : value,
		audioType : "SUCCESSAUDIO"
	});
};
InteractiveTask.Player.prototype.hasFailAudio = function(value){
	return this.hasAudio({
		id : value,
		audioType : "FAILAUDIO"
	});
};
InteractiveTask.Player.prototype.getFailAudioID = function(value){
	return this.getAudioID({
		id : value,
		audioType : "FAILAUDIO"
	});
};

InteractiveTask.Player.prototype.hasAudio = function(value){
	if(this.xmlTaskArray[value.id].AUDIO == undefined) return false;
	return (this.xmlTaskArray[value.id].AUDIO[value.audioType]["-isRun"] == "true");
};
InteractiveTask.Player.prototype.getAudioID = function(value){
	if(this.xmlTaskArray[value.id].AUDIO[value.audioType]["#cdata-section"]!=undefined){
		if(this.xmlTaskArray[value.id].AUDIO[value.audioType]["#cdata-section"]!=""){
			if(this.xmlTaskArray[value.id].AUDIO[value.audioType]["#cdata-section"].indexOf(" ")==-1){
				return this.xmlTaskArray[value.id].AUDIO[value.audioType]["#cdata-section"];
			};
		};
	};
	return this.xmlTaskArray[value.id].AUDIO[value.audioType]["-id"];
};
// TODO: Create frame and control buttons

/***********************************************************************
 * Select and run task                                                 *
 ***********************************************************************/
InteractiveTask.Player.prototype.startCurrentTask = function(){
	InteractiveTask.log("[Player] - start current task");
	if(this.currentTaskID!=-1){
		//  перед началом задания, в случае необходимости снижаем балл за полученную помощь
		this.downScore();

		if(this.currentTask!=null){
			this.currentTask.clear();
			InteractiveTask.disposeObject(this.currentTask);
		};
		InteractiveTask.log("[Player] - create current task");
		this.currentTask = new InteractiveTask.SampleTask(this.xmlTaskArray[this.currentTaskID], this);
		InteractiveTask.log("[Player] - change button visible");
		this.visibleButtonsControl();
		InteractiveTask.log("[Player] - progress select");
		this.progressSelect(this.xmlTaskArray[this.currentTaskID]["-id"]);
		InteractiveTask.log("[Player] - create controllers and elements");
		this.currentTask.checkProto();


		if(this.isTaskChangeAnimation()){InteractiveTask.ANSFRAME.close();};
		InteractiveTask.log("[Player] - try start sound");
		if(this.hasStartAudio(this.currentTaskID)){
			this.repeatSound();
		};
	}else{
		InteractiveTask.log("[Player] - complate package");
		this.complatePackage();
	};
    /**
     * Test of RUN One Task
     */
    //this.currentTask.addEventListener("CurrentTaskComplate", this.complateCurrentTask);
    //new InteractiveTask.AnimationController();

};
/************************************************************************************
 * Контроль визуализации кнопок
 */
InteractiveTask.Player.prototype.visibleButtonsControl = function(){
   if(this.isTest()){
	   if(this.isMnimoe(this.currentTaskID)){
		   this.buttonSystem.understand.visible(true);
	   }else{
		   this.buttonSystem.understand.visible(false);
	   };
   }else{
	    if(this.hasRootTask(this.currentTaskID)){
		    this.buttonSystem.understand.visible(true);
	    }else{
		    if(this.isMnimoe(this.currentTaskID)){
			    this.buttonSystem.understand.visible(true);
		    }else{
			    this.buttonSystem.understand.visible(false);
		    };
	    };
	   if(this.hasHelpingTask(this.currentTaskID)){
		   this.buttonSystem.dontknow.visible(true);
	   }else{
		   this.buttonSystem.dontknow.visible(false);
	   };
   };
	if(this.hasStartAudio(this.currentTaskID)){
		this.buttonSystem.sound.visible(true);
	}else{
		this.buttonSystem.sound.visible(false);
	};
	this.buttonSystem.pause.visible(false);
	this.buttonSystem.fullscreen.visible(true);
	this.buttonSystem.replace();

};
/********************************************
 * устанавливаем снижающий балл на задние
 * @returns {*}
 */
InteractiveTask.Player.prototype.downScore = function(){
	if(this.oldTaskID+1 == this.currentTaskID){
	  	var downTaskID = this.getMainRoot(this.oldTaskID);
		var level = parseInt(this.xmlTaskArray[this.currentTaskID]["-level"]);
		if(this.outResult[downTaskID].numHelping<level-1){
			this.outResult[downTaskID].numHelping=level-1;
		};
	};
};

/************************************************************************************
 /************************************************************************************
 /************************************************************************************
 *    БЛОК КОНТРОЛЯ СМЕНЫ ЗАДАНИЙ    ОКОНЧЕН
 ************************************************************************************/
/************************************************************************************/
/************************************************************************************/
/***********************************************************************
 * Options of task package                                             *
 ***********************************************************************/

InteractiveTask.Player.prototype.isTest = function(){
    return this.isTag("TEST", false);
};
InteractiveTask.Player.prototype.isCheck = function(){
    return this.isTag("CHECK", false);
};
InteractiveTask.Player.prototype.isRandom = function(){
    return this.isTag("RANDOM", false);
};
InteractiveTask.Player.prototype.isDelivery = function(){
    return this.isTag("DELIVERY", false);
};
InteractiveTask.Player.prototype.isAutoDelivery = function(){
    return this.isTag("ISAUTODELIVERY", false);
};
InteractiveTask.Player.prototype.isTaskChangeAnimation = function(){
	return this.isTag("TESTANIMATION", false);
};
InteractiveTask.Player.prototype.isMnimoe = function(value){
    if(this.xmlTaskArray[value].MNIMOE == "true") return true;
    return false;
};

InteractiveTask.Player.prototype.hasRootTask = function(value){
  	if(this.xmlTaskArray[value]["-level"] != "1") return true;
	return false;
};
InteractiveTask.Player.prototype.hasHelpingTask = function(value){
	if(this.xmlTaskArray.length-1 == value) return false;
	var thisTaskLevel = parseInt(this.xmlTaskArray[value]["-level"]);
	var nextTaskLevel = parseInt(this.xmlTaskArray[value+1]["-level"]);
	if(nextTaskLevel>thisTaskLevel) return true;
	return false;
};
InteractiveTask.Player.prototype.getNumberResultTask = function(){
    var i,l;
    var numTasks = 0;
    l = this.xmlTaskArray.length;
    if(this.isTest()){
        for(i=0;i<l;i++){
            if(!this.isMnimoe(i)) ++numTasks;
        };
    }else{
        for(i=0;i<l;i++){
            if(!this.isMnimoe(i) && this.isEqualLevels(i, 0)) ++numTasks;
        };
    };
    return numTasks;
};

InteractiveTask.Player.prototype.isTag = function(label, defaultout){
    if(this.xml[label] == undefined) return defaultout;
    return (this.xml[label] == 'true');
};

InteractiveTask.Player.prototype.getTimeDelivery = function(){
    if(this.xml.TIMERDELIVERY==undefined) return 0;
    return (parseInt(this.xml.TIMERDELIVERY.substr(0, 2))*60+parseInt(this.xml.TIMERDELIVERY.substr(3, 2)));
};
InteractiveTask.Player.prototype.getEquivalentTask = function(){
    if(this.xml.EQUIVALENT==undefined) return 1;
    return parseInt(this.xml.EQUIVALENT);
};
InteractiveTask.Player.prototype.getNoMoreTask = function(){
    if(this.xml.NOMORE==undefined) return 0;
    return parseInt(this.xml.NOMORE);
};



/*////////////////////////////////////////////////////////////////////////////////////////////*/
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
/*|||||||||||||||||||||||||||||||||||||| SAMPLE TASK (START)||||||||||||||||||||||||||||||||||*/
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/
/**
 * SimpleTask realise one task
 * @param xml - <TAST>...</TASK> - tree of one task
 * @constructor - Object of onne task
 */
InteractiveTask.SampleTask = function(xml, player){
    this.xml = xml;
    this.player = player;
    this.initLayers();
};
/**
 * Method for checking of other methods, only for developers
 * In future this method will be parser of task
 */
InteractiveTask.SampleTask.prototype.checkProto = function(){
    //alert("check proto");
    //this.stage = stage;
	this.player.resizePlayer();
    this.postLoading = 1;
    var i=0;

	var marks = this.getArrayObjectsByTag("MARK");
	if(marks.length!=0){
		this.markController = new InteractiveTask.MarkController({
			//layer : this.getLayerByName("layer20"),
			task : this
		});
		for(i=0;i<marks.length;i++){
			this.markController.add(marks[i]);
		};
		this.markController.startCreating();
	};


    var palitra = this.getArrayObjectsByTag("PALITRA");
    if(palitra.length!=0){
        //alert("Palitra exist");
        this.palitraController = new InteractiveTask.PalitraController({
            //layer : this.getLayerByName("layer3"),
            xml : palitra[0]
        });
        this.palitraController.init();
    };
    var userTans = this.getArrayObjectsByTag("USERTAN");
    if(userTans.length!=0){
        this.userTanController = new InteractiveTask.UserTanController({
            //colorLayer:this.getLayerByName("layer18"),
            //blackLayer:this.getLayerByName("layer8"),
            task:this,
            diap:this.getDiapasonOfMovingTan(),
            uniq:this.isUniqTans(),
        });
        for(i=0;i<userTans.length;i++){
            this.userTanController.add(userTans[i]);
        };

        if(palitra.length!=0){
            for(i=0;i<userTans.length;i++){
                this.userTanController.tanArray[i].colorableEnabled();
            };
        };
    };
    var tables = this.getArrayObjectsByTag("TABLE");
    if(tables.length!=0){
        this.tableController = new InteractiveTask.TableController({
            //layer : this.getLayerByName("layer10"),
            task : this
        });
        for(i=0;i<tables.length;i++){
            this.tableController.add({
                xml : tables[i]
            });

        };
    };

    var pictureTans = this.getArrayObjectsByTag("PICTURETAN");
    if(pictureTans.length!=0){
        ++this.postLoading;
        this.pictureTanController = new InteractiveTask.PictureTanController({
            //colorLayer : this.getLayerByName("layer17"),
            //blackLayer : this.getLayerByName("layer7"),
            task : this,
            diap : this.getDiapasonOfMovingTan(),
            uniq : this.isUniqTans()
        });
        for(i=0;i<pictureTans.length;i++){
            this.pictureTanController.add(pictureTans[i]);
        };
    };

    var checkBoxes = this.getArrayObjectsByTag("CHECKBOX");
    if(checkBoxes.length!=0){
        //alert("Checkbox exist");
        this.checkBoxController = new InteractiveTask.CheckBoxController({
            //layer : this.getLayerByName("layer13"),
            //xml : checkbox[0],
            task: this
        });
        for(i=0;i<checkBoxes.length;i++){
            this.checkBoxController.add(checkBoxes[i]);
        };
    };



    var pointsDraw = this.getArrayObjectsByTag("POINTDRAW");
    if(pointsDraw.length!=0){
        this.pointDrawController = new InteractiveTask.PointsDrawController({
            //layer : this.getLayerByName("layer15"),
            task : this
        });
        for(i=0;i<pointsDraw.length;i++){
            this.pointDrawController.add(pointsDraw[i]);
        };
    };

    var textFields = this.getArrayObjectsByTag("LABEL");
    if(textFields.length!=0){
        this.textFieldController = new InteractiveTask.TextFieldController({
           // layer : this.getLayerByName("layer12"),
           // blackLayer : this.getLayerByName("layer7"),
            diap : this.getDiapasonOfMovingTan(),
            controller : this
        });
        for(i=0;i<textFields.length;i++){
            this.textFieldController.add(textFields[i]);
        };
    };

    var shiftFields = this.getArrayObjectsByTag("SHIFTFIELD");
    if(shiftFields.length!=0){
        this.shiftFieldController = new InteractiveTask.ShiftFieldController({
            //layer : this.getLayerByName("layer2"),
            controller : this,
            diap : this.getDiapasonOfMovingTan()
        });
        for(i=0;i<shiftFields.length;i++){
            this.shiftFieldController.add(shiftFields[i]);
        };
    };

	 var swfobject = this.getArrayObjectsByTag("SWFOBJECT");
	 for (i=0;i<swfobject.length;i++){
		 var puzzle = swfobject[i].SETTINGS.PAZZLE;
		 if(puzzle){
			 //alert("Puzzle exists");
			 this.puzzleController = new InteractiveTask.PuzzleController({
				 //ObjLayer : this.getLayerByName("layer21"),
				 //TanLayer : this.getLayerByName("layer19"),
				 xml : swfobject[i],
				 controller :  this,
			 });
		 };
		 var listingImages = swfobject[i].SETTINGS.LISTINGIMAGES;

		 if(listingImages){
			 this.listingImagesController = new InteractiveTask.ListingImagesController({
				 //ObjLayer : this.getLayerByName("layer21"),
				 xml : swfobject[i],
				 controller :  this,
				 path : 'TestTask/demidovich'
			 });
			 this.listingImagesController.init();
		 };
	 };
	 //this.puzzleController.init();

	var positioning = this.getArrayObjectsByTag("POSITIONING");
	if(positioning.length!=0){
		//alert("Positioning exists");
		for (i=0;i<positioning.length;i++){
			this.positioningController = new InteractiveTask.PositioningController({
				//layer : this.getLayerByName("layer1"),
				xml : positioning[i],
				controller : this/*,
				path : "http://localhost:63342/CanvasPlayer/.idea/source/lib/pictures"  */
			});
		};
	};
	//this.positioningController.init();



    var groupFields = this.getArrayObjectsByTag("GROUPFIELD");
    if(groupFields.length != 0){
         this.groupFieldController = new InteractiveTask.GroupFieldController({
             //colorLayer : this.getLayerByName("layer5"),
             //blackLayer : this.getLayerByName("layer4"),
             controller : this,
             diap : this.getDiapasonOfMovingTan()
         });
        for(i=0;i<groupFields.length;i++){
            this.groupFieldController.add(groupFields[i]);
        };
    };

	var choiceBoxes = this.getArrayObjectsByTag("CHOICEBOX");
	if(choiceBoxes.length != 0){
		this.choiceBoxController = new InteractiveTask.ChoiceBoxController({
			//layer : this.getLayerByName("layer14"),
			controller : this
		});
		for(i=0;i<choiceBoxes.length;i++){
			this.choiceBoxController.add(choiceBoxes[i]);
		};
	};

    this.complateLoadingTask();
	this.player.resizePlayer();
};
InteractiveTask.SampleTask.prototype.complateLoadingTask = function(){
    this.checkPainting();
    this.addLayersToStage();
    //this.createTimer();
    if(this.animationController!=undefined){
        this.animationController.totalPlaye();
    };
    this.isEntaerArea();
	this.initHealth();
	this.initTimer();

	if(this.timer!=undefined && this.health!=undefined){
		this.timer.setHealth(this.health);
		this.health.setTimer(this.timer);
	};
};
InteractiveTask.SampleTask.prototype.initTimer = function(){
	if(this.xml.TIMER!=undefined){
		this.player.buttonSystem.pause.visible(true);
		this.player.buttonSystem.replace();
		this.timer = new InteractiveTask.Timer({
			xml : this.xml,
			controller : this.player
		});
		if(this.timer.isInitTimer()){
			this.timer.start();
		};
	};
};
InteractiveTask.SampleTask.prototype.stopTimer = function(){
	if(this.timer!=undefined){
		this.timer.stop();
	};
};
InteractiveTask.SampleTask.prototype.getCurrentTimer = function(){
	if(this.timer!=undefined){
		return this.timer.getCurrentTime();
	};
	return -1;
};
InteractiveTask.SampleTask.prototype.initHealth = function(){
	if(this.xml.HEALTH!=undefined){
		this.health = new InteractiveTask.Health({
			xml : this.xml,
			controller : this.player
		});
		if(this.health.isInitHealth()){
			this.health.start();
		};
	};
};
InteractiveTask.SampleTask.prototype.minusHealth = function(){
	if(this.health!=undefined){
		this.health.makeMisstake();
	};
};
InteractiveTask.SampleTask.prototype.getCurrentHealth = function(){
   if(this.health!=undefined){
	    return this.health.getCurrentHealth();
   };
	return 0;
};

/**************************************************************/
/********************CONTROL METHODS***************************/
/**
 * - rotate
 * - select
 * - check task
 * - check paint
 * - animation
 */
/**************************************************************/
InteractiveTask.SampleTask.prototype.rotate = function(degree){
    if(this.userTanController!=null){
        this.userTanController.rotate(degree);
    };
    if(this.pictureTanController!=null){
        this.pictureTanController.rotate(degree);
    };
};
InteractiveTask.SampleTask.prototype.deSelect = function(){
    if(this.userTanController!=null){
        this.userTanController.deSelect();
    };
    if(this.pictureTanController!=null){
        this.pictureTanController.deSelect();
    };
};
InteractiveTask.SampleTask.prototype.checkTask = function(){
    this.checkPainting();
    if(this.userTanController!=null){
        if(!this.userTanController.isComplate()) return;
    };
    if(this.checkBoxController!=null){
        if(!this.checkBoxController.isComplate()) return;
    };
    if(this.pictureTanController!=null){
        if(!this.pictureTanController.isComplate()) return;
    };
    if(this.markController!=null){
        if(!this.markController.isComplate()) return;
    };
    if(this.pointDrawController!=null){
        if(!this.pointDrawController.isComplate()) return;
    };
    if(this.textFieldController!=null){
        if(!this.textFieldController.isComplate()) return;
    };
    if(this.shiftFieldController!=null){
       if(!this.shiftFieldController.isComplate()) return;
    };
    if(this.groupFieldController!=null){
        if(!this.groupFieldController.isComplate()) return;
    };
	if(this.listingImagesController != null){
		if(!this.listingImagesController.getResult()) return;
	};
	if(this.puzzleController!=null){
		if(!this.puzzleController.getResult()) return;
	};
	if(this.positioningController!=null){
		if(!this.positioningController.getResult()) return;
	};

	if(this.choiceBoxController!=null){
		if(!this.choiceBoxController.isComplate()) return;
	};
    this.player.complateCurrentTask();
};
InteractiveTask.SampleTask.prototype.checkPainting = function(){
    if(this.userTanController!=null){
        if(!this.userTanController.checkPainting()) return;
    };
    if(this.palitraController!=null){
        this.palitraController.complatePainting();
	    this.palitraController = null;
    };
};
InteractiveTask.SampleTask.prototype.isEntaerArea = function(){
    if(this.tableController == undefined) return;
    var area = this.tableController.area();
    if(area == null) return;

    if(this.userTanController!=undefined)this.userTanController.area(area);
    if(this.pictureTanController!=undefined)this.pictureTanController.area(area);
    if(this.textFieldController!=undefined)this.textFieldController.area(area);
};
InteractiveTask.SampleTask.prototype.getAnimation = function(object){
	this._tryCreateAnimationController();
    return this.animationController.add(object);
};
InteractiveTask.SampleTask.prototype.getSpriteAnimation = function(object){
	this._tryCreateAnimationController();
	return this.animationController.addSprite(object);
};
InteractiveTask.SampleTask.prototype._tryCreateAnimationController =function(){
	if(this.animationController == undefined){
		this.animationController = new InteractiveTask.AnimationController();
	};
};
InteractiveTask.SampleTask.prototype.runLabelAnimation = function(label){
    if(this.animationController != undefined){
        //this.animationController.playByLabel(label);
	    var i,l;
	    l = label.length;
	    for(i=0;i<l;i++){
		    this.animationController.playByLabel(label[i]);
	    }
    };
};

/**************************************************************/
/********************OBJECTS OF TASK***************************/
/**************************************************************/
InteractiveTask.SampleTask.prototype.getArrayObjectsByTag = function(tagName){
    return InteractiveTask.getArrayObjectsByTag(this.xml.OBJECTS, tagName);
};
/**************************************************************/
/*******************ATRIBUTES OF TASK**************************/
/**************************************************************/
/**
 *
 * @returns {int} - Diapason of jumping of tans
 */
InteractiveTask.SampleTask.prototype.getDiapasonOfMovingTan = function(){
    if(this.xml.DIAP == undefined) return 20;
    return parseInt(this.xml.DIAP);
};
/**
 *
 * @returns {boolean} - if true, user can put diffrent tans on equal black positions
 */
InteractiveTask.SampleTask.prototype.isUniqTans = function(){
    if(this.xml.UNIQU == undefined) return true;
    return (this.xml.UNIQU == 'true');
};
/**
 * Tasks that called "Mnimoe" don't countanted in whole score
 * @returns {boolean}
 */
InteractiveTask.SampleTask.prototype.isMnimoe = function(){
    if(this.xml.MNIMOE == undefined) return false;
    return (this.xml.MNIMOE == 'true');
};
/**
 * Show or not icons for helping of understanding a task
 * @returns {boolean}
 */
InteractiveTask.SampleTask.prototype.isIcons = function(){
    if(this.xml.ICONS == undefined) return false;
    return (this.xml.ICONS == 'true');
};
/**
 * Does current task have marks
 * @returns {boolean}
 */
InteractiveTask.SampleTask.prototype.hasMarks = function(){
	if(this.markController!=null){
		return true;
	};
	return false;
};
/*****************************************************************************/
 /** 3 methods for removing main control buttons
 * @returns {boolean}
 */
InteractiveTask.SampleTask.prototype.isRemoveDontKnowButton = function(){
    if(this.xml.DELBUT == undefined) return false;
    if(this.xml.DELBUT.split(",")[0] == "1") return true;
    return false;
};
InteractiveTask.SampleTask.prototype.isRemoveRestartButton = function(){
    if(this.xml.DELBUT == undefined) return false;
    if(this.xml.DELBUT.split(",")[1] == "1") return true;
    return false;
};
InteractiveTask.SampleTask.prototype.isRemoveUnderstandButton = function(){
    if(this.xml.DELBUT == undefined) return false;
    if(this.xml.DELBUT.split(",")[2] == "1") return true;
    return false;
};
/*****************************************************************************/
/**
 * Method for creating counter of number Marks
 * @returns {boolean}
 */
 InteractiveTask.SampleTask.prototype.isMarksCounter = function(){
     if(this.xml.MARKCOUNTER == undefined) return false;
     return (this.xml.MARKCOUNTER == 'true');
 };
/**************************************************************/
/**************************LAYERS******************************/
/**************************************************************/

InteractiveTask.SampleTask.prototype.initLayers = function(){
    this.layers = {
        0:{ name:"layer1",   index:21, isUse:false, controller: {
	        0 : "positioningController",
	        length : 1
        },  method:"addToLayer"   }, //Рисование изображений
        1:{ name:"layer2",   index:20, isUse:false, controller: {
	        0 : "shiftFieldController",
	        length : 1
        },  method:"addToLayer"   }, //Поля перестановки
        2:{ name:"layer3",   index:19, isUse:false, controller: {
	        0 : "palitraController",
	        length : 1
        },  method:"addToLayer"   }, //Кнопки
        3:{ name:"layer4",   index:18, isUse:false, controller: {
	        0 : "groupFieldController",
            length : 1
        },  method:"balckAddToLayer"   }, //Групповое поле (Ч)
        4:{ name:"layer5",   index:17, isUse:false, controller: {
	        0 : "groupFieldController",
            length : 1
        },  method:"colorAddToLayer"   }, //Групповое поле (Ц)
        5:{ name:"layer6",   index:1 , isUse:false, controller: {
	        length : 0
        },  method: null   }, //Компл. таны (Ч)
        6:{ name:"layer7",   index:2 , isUse:false, controller: {
	        0 : "pictureTanController",
	        1 : "textFieldController",
            length : 2
        },  method: "balckAddToLayer"   }, //Картинки таны (Ч)
        7:{ name:"layer8",   index:3 , isUse:false, controller: {
	        0 : "userTanController",
			length : 1
        },  method: "balckAddToLayer"   }, //Польз. таны (Ч)
        8:{ name:"layer9",   index:14, isUse:false, controller: {
	        length : 0
        } , method: null   }, //SWF таны (Ч)
        9:{ name:"layer10",  index:4 , isUse:false, controller: {
	        0 : "tableController",
            length : 1
        },  method: "addToLayer"  }, //Таблицы
        10:{name:"layer11",  index:5 , isUse:false, controller: {
	        length : 0
        },  method: null   }, //Линии
        11:{name:"layer12",  index:6 , isUse:false, controller: {
	        0 : "textFieldController",
	        length : 1
        },  method: "addToLayer"   }, //Надписи
        12:{name:"layer13",  index:7 , isUse:false, controller: {
	        0 : "checkBoxController",
	        length : 1
        },  method: "addToLayer"   }, //Перечисл. поля
        13:{name:"layer14",  index:16, isUse:false, controller: {
	        0 : "choiceBoxController",
	        length : 1
        },  method: "addToLayer"   }, //Выбор ответов
        14:{name:"layer15",  index:8 , isUse:false, controller: {
	        0 : "pointDrawController",
	        length : 1
        },  method:"addToLayer"   }, //Точки соединения
        15:{name:"layer16",  index:9 , isUse:false, controller: {
	        length : 0
        },  method: null  }, //Компл. таны (Ц)
        16:{name:"layer17",  index:10, isUse:false, controller: {
	        0 : "pictureTanController",
	        length : 1
        },  method: "colorAddToLayer"   }, //Картинки таны (Ц)
        17:{name:"layer18",  index:11, isUse:false, controller: {
	        0 : "userTanController",
	        length : 1
        },  method:"colorAddToLayer"   }, //Польз. таны (Ц)
        18:{name:"layer19",  index:15, isUse:false, controller: {
	        0 : "puzzleController",
	        length : 1
        },  method:"colorAddToLayer"   }, //SWF таны (Ц)
        19:{name:"layer20",  index:12, isUse:false, controller: {
	        0 : "markController",
	        length : 1
        },  method:"addToLayer"   }, //Области выделения
        20:{name:"layer21",  index:13, isUse:false, controller: {
	        0 : "listingImagesController",
	        length : 1
        },  method:"addToLayer"   }, //SWF объекты
        21:{name:"layer22",  index:22, isUse:false, controller:{
	        length : 0
        } , method:null   }, //Звук
        length:22
    };
};


/**
 * @returns {Array of index layers in such stack as it constructed author of task}
 */
InteractiveTask.SampleTask.prototype.getLayersArray = function(){
    return this.xml.LAYERS.split(",");
};
/**
 * If you take layer by name, automaticly this layer will be include into stack output
 * @param name
 * @returns layer{layer:Konva.Layer, name:string, index:int, isUse:Boolean}
 */
/*InteractiveTask.SampleTask.prototype.getLayerByName = function(name){
    for(i=0;i<this.layers.length;i++){
        if(name == this.layers[i].name){
            if(!this.layers[i].isUse){
                this.layers[i].isUse = true;
                this.layers[i].layer = new Konva.Layer();
            };
            return this.layers[i].layer;
        };
    };
    return null;
}; */
/**
 * You can get layer from full stack layers by index without changes
 * @param index of necessary layer from all layers
 * @returns layer{layer:Konva.Layer, name:string, index:int, isUse:Boolean}
 */
InteractiveTask.SampleTask.prototype.getLayerByIndex = function(index){
    for(i=0;i<this.layers.length;i++){
        if (index == this.layers[i].index) {
            return this.layers[i];
        };
    };
    return null;
};
/**
 * Added neccesary layers to stage (only full layers)
 */
InteractiveTask.SampleTask.prototype.addLayersToStage = function(){

   // alert("start function");
    var i=0;
    //alert(stage);
    var indexis = this.getLayersArray();
    var leng = indexis.length;
    var getLayer;
	var j;
    for(i=0;i<leng;i++){
        getLayer = this.getLayerByIndex(parseInt(indexis[i]));

	    for(j=0;j<getLayer.controller.length; j++){
		    if(this[getLayer.controller[j]]){
			    this[getLayer.controller[j]][getLayer.method](InteractiveTask.COMPONENTS_LAYER);
		    };
	    };
        /*if(getLayer.isUse){
            //alert("add layer = " + getLayer.layer + ", name = " + getLayer.name + ", index = " + getLayer.index);
            InteractiveTask.STAGE.add(getLayer.layer);
            //alert("add complate");
            getLayer.layer.batchDraw();

        };*/
    };
    if(this.shiftFieldController!=undefined){
        this.shiftFieldController.initCache();
    };
	InteractiveTask.COMPONENTS_LAYER.batchDraw();
	//InteractiveTask.DRAG_LAYER = new Konva.Layer();
	//InteractiveTask.STAGE.add(InteractiveTask.DRAG_LAYER);
	//InteractiveTask.DRAG_LAYER.batchDraw();
	/**
	 * Перерисовка кнопок интерфейса
	 */
	/*for(var lay in this.buttonLayers){
		InteractiveTask.STAGE.add(this.buttonLayers[lay]);
	};
	for(var lay in this.buttonLayers){
		this.buttonLayers[lay].draw();
	};*/
};
InteractiveTask.SampleTask.prototype.clear = function(){
	try{
		if(this.animationController != undefined){
			this.animationController.clear();
			InteractiveTask.disposeObject(this.animationController);
		};
	}catch(e){
		InteractiveTask.error(e);
	};

	/*******************************************************/
	if(this.userTanController!=null){
		this.userTanController.clear();
		InteractiveTask.disposeObject(this.userTanController);
		this.userTanController = null;
	};
	if(this.checkBoxController!=null){
		this.checkBoxController.clear();
		InteractiveTask.disposeObject(this.checkBoxController);
		this.checkBoxController = null;
	};
	if(this.pictureTanController!=null){
		this.pictureTanController.clear();
		InteractiveTask.disposeObject(this.pictureTanController);
		this.pictureTanController = null;
	};
	if(this.markController!=null){
		this.markController.clear();
		InteractiveTask.disposeObject(this.markController);
		this.markController = null;
	};
	if(this.pointDrawController!=null){
		this.pointDrawController.clear();
		InteractiveTask.disposeObject(this.pointDrawController);
		this.pointDrawController = null;
	};
	if(this.textFieldController!=null){
		this.textFieldController.clear();
		InteractiveTask.disposeObject(this.textFieldController);
		this.textFieldController = null;
	};
	if(this.shiftFieldController!=null){
		this.shiftFieldController.clear();
		InteractiveTask.disposeObject(this.shiftFieldController);
		this.shiftFieldController = null;
	};
	if(this.groupFieldController!=null){
		this.groupFieldController.clear();
		InteractiveTask.disposeObject(this.groupFieldController);
		this.groupFieldController = null;
	};
	if(this.listingImagesController != null){
		this.listingImagesController.clear();
		this.listingImagesController = null;
	};
	if(this.puzzleController!=null){
		this.puzzleController.clear();
		this.puzzleController = null;
	};
	if(this.positioningController!=null){
		this.positioningController.clear();
		this.positioningController = null;
	};

	if(this.choiceBoxController!=null){
		this.choiceBoxController.clear();
		InteractiveTask.disposeObject(this.choiceBoxController);
		this.choiceBoxController = null;
	};
	if(this.tableController!=null){
		this.tableController.clear();
		InteractiveTask.disposeObject(this.tableController);
		this.tableController = null;
	};
	if(this.palitraController!=null){
		this.palitraController.complatePainting();
		this.palitraController = null;
	};
	InteractiveTask.COMPONENTS_LAYER.clearCache();

	InteractiveTask.DRAGANDDROP_LAYER.clearCache();
	InteractiveTask.COMPONENTS_LAYER.clear();
	InteractiveTask.DRAGANDDROP_LAYER.clear();
	InteractiveTask.ANIMATION_LAYER.clear();
	InteractiveTask.COMPONENTS_LAYER.destroyChildren();
	InteractiveTask.DRAGANDDROP_LAYER.destroyChildren();
	InteractiveTask.ANIMATION_LAYER.destroyChildren();


	/*var i,l;
	l = this.layers.length;
	for(i=0;i<l;i++){
		if(this.layers[i].isUse){
			this.layers[i].layer.destroyChildren();
			this.layers[i].layer.remove();
			this.layers[i].layer = null;
			this.layers[i].isUse = false;
		};
	};
	InteractiveTask.DRAGANDDROP_LAYER.destroyChildren();   */
	//InteractiveTask.DRAGANDDROP_LAYER.destroy();
	//InteractiveTask.DRAG_LAYER = null;
	/*******************************************************/
	if(this.timer!=undefined){
		this.timer.clear();
		this.timer = null;
	};
	if(this.health!=undefined){
		this.health.clear();
		this.health = null;
	};
	try{
		InteractiveTask.BACKGROUND.off("mousedown touchstart");
	}catch(e){};

   /* if(!this.timerLayer) return;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.timerLayer.remove();
    this.timerLayer = null;   */
	/*this.buttonLayers.restart.remove();
	this.buttonLayers.dontknow.remove();
	this.buttonLayers.understand.remove();
	this.buttonLayers.check.remove();
	this.buttonLayers.fullscreen.remove();   */
    //this.buttonLayer.remove();
};

/*////////////////////////////////////////////////////////////////////////////////////////////*/
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
/*|||||||||||||||||||||||||||||||||||||| SAMPLE TASK (END)||||||||||||||||||||||||||||||||||||*/
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


