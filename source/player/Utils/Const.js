/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 06.04.15
 * Time: 8:06
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.Const = function(){
    this.STANDARD_IMAGES_PATH = "http://kidnet.ru/sites/default/files/TaskPlayer/Images/";
};

InteractiveTask.Const.prototype.setProperty = function(json){
	for(var e in json){
		this[e] = json[e];
	};
};
//  Определяет устанавливать ли таны назад на свою глубину в слое (для перемещения и анимации)
InteractiveTask.Const.prototype.IS_SET_BACK = false;
InteractiveTask.Const.prototype.PRELOADER_IMAGE = "load.png";

InteractiveTask.Const.prototype.RESTART_BUTTON = 1;
InteractiveTask.Const.prototype.DONT_KNOW_BUTTON = 2;
InteractiveTask.Const.prototype.UNDERSTAND_BUTTON = 3;
InteractiveTask.Const.prototype.COMPLATE_BUTTON = 4;
InteractiveTask.Const.prototype.MARK_BUTTON = 5;

InteractiveTask.Const.prototype.POSITIONING_QUESTION = 6;
InteractiveTask.Const.prototype.POSITIONING_FAIL = 7;

InteractiveTask.Const.prototype.BAD_FRAME = 8;
InteractiveTask.Const.prototype.GOOD_FRAME = 9;

InteractiveTask.Const.prototype.HEALTH = 10;
InteractiveTask.Const.prototype.TEST_PROGRESS = 11;

InteractiveTask.Const.prototype.CHECKBOX_BUTTON = 12;
InteractiveTask.Const.prototype.RADIO_BUTTON = 13;
InteractiveTask.Const.prototype.SOUND_BUTTON = 14;
InteractiveTask.Const.prototype.FULLSCREEN_BUTTON = 15;
InteractiveTask.Const.prototype.PAUSE_BUTTON = 16;
InteractiveTask.Const.prototype.WAIT_FRAME = 17;

InteractiveTask.Const.prototype.BUTTONS = {
    0  : "Buttons/restart.png",
    1  : "Buttons/dontknow.png",
    2  : "Buttons/understand.png",
    3  : "Buttons/complate.png",
    4  : "Mark.png",
	5  : "Positioning/Question.png",
	6  : "Positioning/Fail.png",
	7  : "Frames/badnews.png",
	8  : "Frames/welldone.png",
	9  : "health.png",
	10 : "progress.png",
	11 : "CheckBox/CheckButton.png",
	12 : "CheckBox/RadioButton.png",
	13 : "Buttons/sound.png",
	14 : "Buttons/fullscreen.png",
	15 : "Buttons/pause.png",
	16 : "Frames/wait.png",
    length : 17
};
InteractiveTask.Const.prototype.BUTTON_POSITION = [  0, 0, 60, 41,
												    60, 0, 60, 41,
												   120, 0, 60, 41];
InteractiveTask.Const.prototype.RESTART_BUTTON_POSITION = [  0, 0, 60, 41,
													         60, 0, 60, 41,
													         120, 0, 60, 41];
InteractiveTask.Const.prototype.DONT_KNOW_BUTTON_POSITION = [  0, 0, 60, 41,
													           60, 0, 60, 41,
													           120, 0, 60, 41];
InteractiveTask.Const.prototype.UNDERSTAND_BUTTON_POSITION = [  0, 0, 60, 41,
													            60, 0, 60, 41,
													            120, 0, 60, 41];
InteractiveTask.Const.prototype.CHECK_BUTTON_POSITION = [   0, 0, 117, 29,
															117, 0, 117, 29,
															234, 0, 117, 29];

InteractiveTask.Const.prototype.SOUND_BUTTON_POSITION = [   0, 0, 60, 41,
															60, 0, 60, 41,
															120, 0, 60, 41];
InteractiveTask.Const.prototype.FULLSCREEN_BUTTON_POSITION = [   0, 0, 60, 41,
																60, 0, 60, 41,
																120, 0, 60, 41];

InteractiveTask.Const.prototype.PAUSE_BUTTON_POSITION = [   0, 0, 60, 41,
															60, 0, 60, 41,
															120, 0, 60, 41];

InteractiveTask.Const.prototype.BIG_BUTTON_POSITION = [   0, 0, 117, 29,
													117, 0, 117, 29,
													234, 0, 117, 29];

InteractiveTask.Const.prototype.HEALTH_POSITION = [ 0, 0, 45, 34,
												   45, 0, 45, 34];

InteractiveTask.Const.prototype.PROGRESS_POSITION = [  0, 0, 34, 35,
													  34, 0, 34, 35,
													  68, 0, 34, 35,
													 102, 0, 34, 35];

InteractiveTask.Const.prototype.CHECKBOX_BUTTON_POSITION = [ 0, 0, 15, 15,
															15, 0, 15, 15];


InteractiveTask.Const.prototype.WAIT_FRAME_POSITION = [ 0   ,0,150,150,
														150 ,0,150,150,
														300 ,0,150,150,
														450 ,0,150,150,
														600 ,0,150,150,
														750 ,0,150,150,
														900 ,0,150,150,
														1050,0,150,150,
														1200,0,150,150,
														1350,0,150,150,
														1500,0,150,150,
														1650,0,150,150,
														1800,0,150,150,
														1950,0,150,150,
														2100,0,150,150,
														2250,0,150,150,
														2400,0,150,150,
														2550,0,150,150,
														2700,0,150,150,
														2850,0,150,150,];

InteractiveTask.Const.prototype.DELTA_BOTTOM = 5;
InteractiveTask.Const.prototype.DELTA_RIGHT = 5;

//  Допустимые константы для выравнивания кнопки звука по вертикали: top, center, bottom
InteractiveTask.Const.prototype.SOUND_VERTICAL_ALIGN = "top";
//  Допустимые константы для выравнивания кнопки звука по горизонтали: left, center, right
InteractiveTask.Const.prototype.SOUND_HORIZONTAL_ALIGN = "left";

//  Отступ от определенного края по оси Х
InteractiveTask.Const.prototype.SOUND_DELTA_X = 70;
//  Отступ от определенного края по оси Y
InteractiveTask.Const.prototype.SOUND_DELTA_Y = 5;

//  Допустимые константы для выравнивания кнопки полноэкранного режима по вертикали: top, center, bottom
InteractiveTask.Const.prototype.FULLSCREEN_VERTICAL_ALIGN = "top";
//  Допустимые константы для выравнивания кнопки полноэкранного режима по горизонтали: left, center, right
InteractiveTask.Const.prototype.FULLSCREEN_HORIZONTAL_ALIGN = "left";

//  Отступ от определенного края по оси Х
InteractiveTask.Const.prototype.FULLSCREEN_DELTA_X = 5;
//  Отступ от определенного края по оси Y
InteractiveTask.Const.prototype.FULLSCREEN_DELTA_Y = 5;

//  Допустимые константы для выравнивания кнопки паузы по вертикали: top, center, bottom
InteractiveTask.Const.prototype.PAUSE_VERTICAL_ALIGN = "top";
//  Допустимые константы для выравнивания кнопки паузы по горизонтали: left, center, right
InteractiveTask.Const.prototype.PAUSE_HORIZONTAL_ALIGN = "right";

//  Отступ от определенного края по оси Х
InteractiveTask.Const.prototype.PAUSE_DELTA_X = 5;
//  Отступ от определенного края по оси Y
InteractiveTask.Const.prototype.PAUSE_DELTA_Y = 5;

InteractiveTask.Const.prototype.HEALTH_START_X = 10;
InteractiveTask.Const.prototype.HEALTH_START_Y = 10;
InteractiveTask.Const.prototype.HEALTH_DELTA_X = 5;
InteractiveTask.Const.prototype.HEALTH_WIDTH = 45;
InteractiveTask.Const.prototype.HEALTH_HEIGHT = 34;

InteractiveTask.Const.prototype.CHECKBOX_BUTTON_SIZE = 15;

InteractiveTask.Const.prototype.TEST_PROGRESS_WIDTH = 34;
InteractiveTask.Const.prototype.TEST_PROGRESS_HEIGHT = 35;
InteractiveTask.Const.prototype.TEST_PROGRESS_DELTA_X = 5;

InteractiveTask.Const.prototype.PROGRESS_POINT_DEFAULT_POSITION = 0;
InteractiveTask.Const.prototype.PROGRESS_POINT_CURRENT_POSITION = 1;
InteractiveTask.Const.prototype.PROGRESS_POINT_SUCCESS_POSITION = 2;
InteractiveTask.Const.prototype.PROGRESS_POINT_FAIL_POSITION = 3;
/*
// классы кнопок
InteractiveTask.Const.prototype.BUTTON_CLASS = "IT_Button";
InteractiveTask.Const.prototype.BUTTON_CLASS_UNDERSTAND = "IT_Understand";
InteractiveTask.Const.prototype.BUTTON_CLASS_DONT_KNOW = "IT_Dontknow";
InteractiveTask.Const.prototype.BUTTON_CLASS_RESTART = "IT_Restart";
InteractiveTask.Const.prototype.BUTTON_CLASS_CHECK = "IT_Check";
InteractiveTask.Const.prototype.BUTTON_CLASS_SOUND = "IT_Sound";
InteractiveTask.Const.prototype.BUTTON_CLASS_FULLSCREEN = "IT_Fullscreen";
InteractiveTask.Const.prototype.BUTTON_CLASS_PAUSE = "IT_Pause";      */


// Время отображения окон переходов между заданиями (успех/неудача) в милисекундах
InteractiveTask.Const.prototype.SHOWING_FINAL_FRAME_TIME = 2000;

//  Понижающий коэффициент для заданий
InteractiveTask.Const.prototype.DECREASING_COEFFICIENT = 0.9;

//  Параметр числа кадров в секунду для анимации объектов (линейная анимация созданная в конструкторе)
InteractiveTask.Const.prototype.ANIMATION_FRAME_RATE = 24;

//  Коэффициенты для вычисления дельта отрезков таймера
InteractiveTask.Const.prototype.FULL_TIME_DIVIDER = 100;
InteractiveTask.Const.prototype.TIME_DIVIDER = 10;

/*Параметры хинтов*/
//  Выводить ли хинты
InteractiveTask.Const.prototype.IS_ADD_HINT = true;
//  базовые настройки хинта opacity - прозрачность хинта, visible - видим ли изначально хинт, listening - доступен ли для прослушивания событий
InteractiveTask.Const.prototype.LABEL_SETTINGS = {
	opacity: 0.75,
	visible: false,
	listening: false
};

//  Визуализация фона хинта
InteractiveTask.Const.prototype.TAG_SETTINGS = {
	fill: 'black',
	pointerDirection: 'down',
	pointerWidth: 10,
	pointerHeight: 10,
	lineJoin: 'round',
	shadowColor: 'black',
	shadowBlur: 10,
	shadowOffset: 10,
	shadowOpacity: 0.2
};
//  Настройки текста хинта
InteractiveTask.Const.prototype.TEXT_SETTINGS = {
	text : '',
	fontFamily: 'Calibri',
	fontSize: 18,
	padding: 5,
	fill: 'white'
};
//  Тексты хинтов для кнопок
InteractiveTask.Const.prototype.RESTART_HINT_TEXT = "Restart";
InteractiveTask.Const.prototype.DONT_KNOW_HINT_TEXT = "Don't know";
InteractiveTask.Const.prototype.UNDERSTAND_HINT_TEXT = "Understand";
InteractiveTask.Const.prototype.COMPLATE_HINT_TEXT = "Complate";
InteractiveTask.Const.prototype.SOUND_HINT_TEXT = "Replay task sound";
InteractiveTask.Const.prototype.FULLSCREEN_HINT_TEXT = "Fullscreen";
InteractiveTask.Const.prototype.PAUSE_HINT_TEXT = "Pause";

//  Направление стрелки в хинте
InteractiveTask.Const.prototype.RESTART_PD = "down";
InteractiveTask.Const.prototype.DONT_KNOW_PD = "down";
InteractiveTask.Const.prototype.UNDERSTAND_PD = "down";
InteractiveTask.Const.prototype.COMPLATE_PD = "down";
InteractiveTask.Const.prototype.SOUND_PD = "up";
InteractiveTask.Const.prototype.FULLSCREEN_PD = "up";
InteractiveTask.Const.prototype.PAUSE_PD = "up";