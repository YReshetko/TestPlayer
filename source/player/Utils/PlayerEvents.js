/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 23.05.15
 * Time: 18:16
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.Events = function(){};
InteractiveTask.Events.prototype.INIT_PLAYER_ERROR = 1;
InteractiveTask.Events.prototype.INIT_PLAYER_SUCCESS = 2;
InteractiveTask.Events.prototype.TASK_COMPLATE = 3;
InteractiveTask.Events.prototype.TEST_START = 4;
InteractiveTask.Events.prototype.TEST_SUCCESS_COMPLATE = 5;
InteractiveTask.Events.prototype.TEST_FAIL_COMPLATE = 6;

InteractiveTask.Events.prototype.INIT_PROGRESS_ERROR = 7;

InteractiveTask.Events.prototype.MOUSE_OVER_OUT_BUTTON = 8;
InteractiveTask.Events.prototype.FULL_SCREEN_CHANGE = 9;

InteractiveTask.Events.prototype.CURRENT_TASK_COMPLATE = 10;

/*Inner events*/
InteractiveTask.Events.prototype.TASK_SUCCESS_COMPLATE = 101;
InteractiveTask.Events.prototype.TASK_MISSTAKE_MNIMOE = 102;
InteractiveTask.Events.prototype.TASK_MISSTAKE = 103;
InteractiveTask.Events.prototype.TASK_DONT_KNOW = 104;
InteractiveTask.Events.prototype.TASK_UNDERSTAND = 105;
InteractiveTask.Events.prototype.TASK_RESTART = 106;
InteractiveTask.Events.prototype.TASK_DOUBLE_MISSTAKE = 107;


