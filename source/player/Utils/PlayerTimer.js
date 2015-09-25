/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 14.06.15
 * Time: 8:48
 * To change this template use File | Settings | File Templates.
 */

// controller - main player
InteractiveTask.Timer = function(options){
	this.xml = options.xml;
	this.controller = options.controller;

	/*init object variables*/
	this.currentTime = 0;
	this.interval = null;

	this.isMnimoe = (this.xml.MNIMOE == "true");
	this.isTest = this.controller.isTest();
	this.isFirstLevel = (this.xml["-level"] == "1");

	this.field = null;
	this.layer = null;
};

InteractiveTask.Timer.prototype.isInitTimer = function(){
  	if(this.xml.MISSTAKE_COUNTER==undefined){
	    this.xml.MISSTAKE_COUNTER = 2;
    };
	if(this.xml.BACK_TIMER==undefined){
		this.updateBackTimer();
	};
	if(this.xml.BACK_TIMER == 0){
		if(this.isTest){
			this.controller.misstake();
			return false;
		}else{
			this.updateBackTimer();
		};
	};
	this.currentTime = this.xml.BACK_TIMER;
	return true;
};
InteractiveTask.Timer.prototype.setHealth = function(health){
	this.health = health;
};

InteractiveTask.Timer.prototype.start = function(){
	//var totalTimer = parseInt(this.xml.TIMER.substr(0,2))*60 +  parseInt(this.xml.TIMER.substr(3,2));
	this.field = new Kinetic.Text({
		x: 10,
		y: InteractiveTask.STAGE.height() - 30,
		fontSize: 30,
		fontFamily: 'Calibri',
		fill: 'green'
	});
	this.layer = new Kinetic.Layer();
	this.layer.add(this.field);
	InteractiveTask.STAGE.add(this.layer);
	this.currentSeconds = 0;
	this.currentMinutes = 0;
	this.resume();
};


InteractiveTask.Timer.prototype.tick = function(){
	this.currentMinutes = Math.floor(this.currentTime / 60);
	this.currentSeconds = this.currentTime % 60;
	if(this.currentMinutes <= 9) this.currentMinutes = "0" + this.currentMinutes;
	if(this.currentSeconds <= 9) this.currentSeconds = "0" + this.currentSeconds;
	if(this.currentTime<=10) this.field.fill('red');
	this.currentTime--;
	this.xml.BACK_TIMER = this.currentTime;
	this.field.text(this.currentMinutes + ":" + this.currentSeconds); //Set the element id you need the time put into.
	this.layer.draw();
	if(this.currentTime <= -1) {
		this.timeIsOver();
	};
};
InteractiveTask.Timer.prototype.timeIsOver = function(){
	this.xml.BACK_TIMER = 0;
	//this.xml.TIMER_COUNTER = 0;
	if(this.isTest){
		this.controller.misstake();
	}else{
		if(this.isFirstLevel){
			--this.xml.MISSTAKE_COUNTER;
			if(this.health!=undefined){
				this.health.updateCurrentHealth();
			};
			if(this.xml.MISSTAKE_COUNTER<=0){
				this.controller.doubleMisstake();
			}else{
				this.controller.misstake();
			};
		}else{
			this.controller.misstake();
		};
	};
};

InteractiveTask.Timer.prototype.stop = function(){
	clearInterval(this.interval);
};
InteractiveTask.Timer.prototype.resume = function(){
	var self = this;
	this.interval = setInterval(function(){self.tick();},1000);
};

InteractiveTask.Timer.prototype.getCurrentTime = function(){
	return this.currentTime;
};
InteractiveTask.Timer.prototype.clear = function(){
	if(!this.layer) return;
	this.interval = null;
	this.field.remove();
	this.layer.remove();
	this.field = null;
	this.layer = null;
};



InteractiveTask.Timer.prototype.updateBackTimer = function(){
	var time = this.getTimeFromString(this.xml.TIMER);
	this.xml.BACK_TIMER = time;
};
InteractiveTask.Timer.prototype.getTimeFromString = function(str){
	//return parseInt(str.substr(0,2))*60 +  parseInt(str.substr(3,2));
	return InteractiveTask.getTimeByString(str);
};