// 手指开始时的坐标
var startX = 0;
var startY = 0;

// 手指移动的坐标
var moveX = 0;
var moveY = 0;

// 手指开始到移动的坐标差值
var changeX = 0;
var changeY = 0;

// 蛇的尺寸
var snakeW = 15;
var snakeH = 15;

// context上下文
var ctx = null;

// 蛇头对象
var snakeHead = {
	color:"#9933CC",
	x:0,
	y:0,
	w:snakeW,
	h:snakeH
};

// 蛇身体数组
var snakeBodies = [];

// 窗口宽高
var windowW = 0;
var windowH = 0;

// 食物
var foods = [];

// 蛇头移动的方向
var snakeHeadDirection = "right";

// 总得分-吃到的食物宽度总和
var score = 0;

// standardScore的具体大小
var standardScore = 5;

// count个standardScore
var count = 1;

// 蛇身体总长度-每standarScore分加一
var snakeLength = 0;

// 是否继续变长
var whetherRemoveBody = true;

// 蛇移动的速度(速度等级)
var defaultSpeedLevel = 10;
var moveSpeedLevel = defaultSpeedLevel;

// 减慢动画
var delay = 0;

// 吃到食物的次数
var countEatFood = 0;

// 每 多少 次吃到食物时就加速
var speedupPerfood = 2;

Page({
	// 设置手指开始触摸获取坐标函数
	touchStart: function(e){
		startX = e.touches[0].x;
		startY = e.touches[0].y;
	},
	touchMove: function(e){

		moveX = e.touches[0].x;
		moveY = e.touches[0].y;

		changeX = moveX - startX;
		changeY = moveY - startY;

		// 运用判断语句判断蛇头移动的方向
		if ( Math.abs(changeX) > Math.abs(changeY) && changeX>0 && !(snakeHeadDirection == "left") ){
        	snakeHeadDirection = "right";
        }else if (Math.abs(changeX) > Math.abs(changeY) && changeX<0 && !(snakeHeadDirection == "right") ){
        	snakeHeadDirection = "left";
        }else if (Math.abs(changeX) < Math.abs(changeY) && changeY>0 && !(snakeHeadDirection == "top") ){
        	snakeHeadDirection = "bottom";
        }else if (Math.abs(changeX) < Math.abs(changeY) && changeY<0 && !(snakeHeadDirection == "bottom") ){
        	snakeHeadDirection = "top";
      	}
	},
	onReady: function(event){
		// 定义一个在某个范围内的随机数生成函数
		function randomnum(min,max){
			return (Math.floor(Math.random()*(max-min))+min);
		};

		// 食物构造函数
		function Food(){
			var w = randomnum(10, 20);	// 定义随机的食物大小
			this.color = "rgb("+randomnum(0,255)+","+randomnum(0,255)+","+randomnum(0,255)+")";
			this.x = randomnum(0, windowW);
			this.y = randomnum(0, windowH);
			this.w = w;
			this.h = w;
			// 定义若食物被吃掉之后的重制函数
			this.reset = function (){
				var w = randomnum(10, 20);	// 定义随机的食物大小
				this.color = "rgb("+randomnum(0,255)+","+randomnum(0,255)+","+randomnum(0,255)+")";
				this.x = randomnum(0, windowW);
				this.y = randomnum(0, windowH);
				this.w = w;
				this.h = w;
			};
		};
		// 判断吃到食物函数
		function doesEatFood(snakeHead, food){
			// 定义蛇头坐标有关的信息
			var sL = snakeHead.x;
			var sR = sL + snakeHead.w;
			var sT = snakeHead.y;
			var sB = sT + snakeHead.w;

			// 定义食物坐标有关的信息
			var fL = food.x;
			var fR = fL + food.w;
			var fT = food.y;
			var fB = fT + food.h;

			// 运用判断语句判断是否吃到食物
			if (sR>fL && sB>fT && sL<fR && sT<fB && sL<fR){
				return true;
			}else{
				return false;
			}
		};
		// 初始化游戏环境函数
		function initialGame(){
			// 初始化游戏数据
			snakeHead.x = 0;
			snakeHead.y = 0;
			snakeBodies.splice(0, snakeBodies.length);
			snakeHeadDirection = "right";

			// 运用微信内置API创建上下文
			ctx = wx.createContext();
			foods.splice(0,foods.length);	// 

			// 游戏分数初始化
			score = 0;
			count = 0;
			// 恢复默认帧率
			moveSpeedLevel = defaultSpeedLevel;
			delay = 0;
			countEatFood = 0;

			// 往食物数组里面添加20个食物
			for (var i=0; i<20; i++){
				var food = new Food();
				foods.push(food);
			}
		};
		// 开始游戏的函数
		function beginGame(){
			// 初始化游戏环境
			initialGame();
			function drawing(obj){
				ctx.setFillStyle(obj.color);
				ctx.beginPath();
				ctx.rect(obj.x, obj.y, obj.w, obj.h);
				ctx.closePath();
				ctx.fill();
			};
			function beginDraw(){
				// 把食物数组的二十个食物绘制出来
				for (var i=0; i<foods.length; i++){
					var food = foods[i];
					drawing(food);

					// 吃到食物之后的操作
					if (doesEatFood(snakeHead, food)){
						// 重制食物
						food.reset();

						score += food.w;
						wx.showToast({
							title: '获得'+score+'分',
							icon: "success",
							duration: 500
						})

						// 增加吃到的食物个数
						countEatFood++;
						if (countEatFood%speedupPerfood==0){
							// 当每吃到speedupPerfood次数的食物时，增加蛇移动的速度
							moveSpeedLevel -= 0.5;
							if (moveSpeedLevel<=2){
								moveSpeedLevel = 2;
							}
						}
					}
				};
				if (++delay%moveSpeedLevel==0){
					// 添加蛇身
					snakeBodies.push({
						color: "#00CCCC",
						x: snakeHead.x,
						y: snakeHead.y,
						w: snakeW,
						h: snakeH
					});
					// 移除蛇身
					if (snakeBodies.length>5){
						// 如果得分满足要求，则不移除蛇身
						if (score/standardScore>=count){
							count++;
							whetherRemoveBody = false;
						}
						// 如果得分不满足要求，移除最后一个蛇身
						if (whetherRemoveBody){
							snakeBodies.shift();
						}
						whetherRemoveBody = true;
					};
					// 根据蛇头移动的方向使蛇头坐标移动
					switch (snakeHeadDirection){
						case "left":
							snakeHead.x -= snakeHead.w;
							break;
						case "right":
							snakeHead.x += snakeHead.w;
							break;
						case "top":
							snakeHead.y -= snakeHead.h;
							break;
						case "bottom":
							snakeHead.y += snakeHead.h;
							break;
					};
					if (snakeHead.x>windowW){
						snakeHead.x = 0;
					}else if (snakeHead.x<0){
						snakeHead.x = windowW;
					}else if (snakeHead.y>windowH){
						snakeHead.y = 0;
					}else if (snakeHead.y<0){
						snakeHead.y = windowH;
					}
				};
				// 绘制蛇头
				drawing(snakeHead);

				// 绘制蛇身体
				for (var i=0; i<snakeBodies.length; i++){
					var snakeBody = snakeBodies[i];
					drawing(snakeBody);
				};
				// 调用微信drawCanvas的API，绘制画布
				wx.drawCanvas({
					canvasId: "game2Canvas",
					// 获取绘制动作
					actions: ctx.getActions()
				})
				// 循环执行画布绘制，来实现动画效果
				requestAnimationFrame(beginDraw);
			}
			// 调用beginDraw函数
			beginDraw();
		};
	
		// 运用微信内置API获取手机屏幕大小信息
		wx.getSystemInfo({
	        success: function(res){
	        	// console.log(res.windowWidth);
          		// console.log(res.windowHeight);
	            windowW = res.windowWidth;
	            windowH = res.windowHeight;
	        }
	    });
	    // 运用微信内置API设置游戏开始信息框
	    wx.showModal({
	    	title: "游戏开始",
	    	content: "每获得"+standardScore+"分，蛇身长度增加1 ",
	    	success: function(res){
	    		if (res.confirm){
	    			beginGame();
	    		}else{
	    			initialGame();
	    			wx.navigateBack({
	    				delta:1
	    			})
	    		}
	    	},
	    });
	}
})