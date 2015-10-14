(function($) {
    /*缓存DOM*/
    var keepElements = function() {
        var _this = this;
        _this.intvalGo;
        _this.timeOutGo;
        _this.roll = $("#raffle-roll");
        _this.mockRoll = $("#raffle-mock");
        _this.numTwo = $("#numberTwo");
        _this.numOther = $("#numberOther");

        _this.startBtn = $("#raffle-start"); 
        _this.endBtn = $("#raffle-end");
        _this.viewBtn = $("#raffle-view");
        _this.againBtn = $("#raffle-again");

        _this.winningNum = $("#raffle-win");
        _this.cal = $("#rnd-state");

        _this.raffleBlk = $("#raffle-blk");
        _this.raffleResultBlk = $("#raffle-result-blk");

        _this.isRandom = false;
    }
    /**初始化事件*/
    var initEvents = function() {
        var _this = this;
        _this.startBtn.on('click', function() {
            if (handleClickFrequency() == true){
                handleStartRaffle();
            }
        });

        _this.endBtn.on('click', function() {
            if (handleClickFrequency() == true){
                handleStopRaffle();    
            }
        });

        _this.viewBtn.on('click', function() {
            handleViewRaffle();
        });

        _this.againBtn.on('click',function() {
            _this.raffleBlk.show();
            _this.raffleResultBlk.hide();
        })

        $('body').on('keypress',function(event) {
            handleKeyPress(event);
        })
    }

    var handleStartRaffle = function() {
            var _this = this;
            
            _this.isRandom = true;
            _this.mockRoll.show();
            _this.roll.hide();

            $.get('mockData/mobiles.json', function(res) {
                if (res.code == 0) {
                    if (res.content=='') {
                        _this.mockRoll.html('暂无数据');
                        _this.viewBtn.show();
                        _this.isRandom = false;
                    } else {
                        _this.viewBtn.hide();
                        var teleArr = res.content.split(",");//将字符串转化为数组
                        var len = teleArr.length; 
                        _this.intvalGo = setInterval(function(){

                            _this.numTwo.html(handleRandNum(true));
                            _this.numOther.html(handleRandNum());

                            var num = Math.floor(Math.random()*len);//获取real随机数 
                            var number = teleArr[num]; //对应的随机号码
                            var filterNum = String(number).replace(/(\d{3})\d{4}(\d{4})/,"$1****$2")//中间四位替换为*
                            _this.winningNum.val(number);
                            _this.roll.html(filterNum);                
                            
                        },50); //每隔0.05秒随机一次手机号
                        
                        _this.startBtn.hide();
                        _this.endBtn.parent().removeClass('displayfalse');
                    }
                } else {
                    _this.roll.html('找不到数据');
                }
            });
    }

    var handleStopRaffle = function() {
        //这里数据提交到后端去处理
        var _this = this;
        
        _this.isRandom = false;
        _this.mockRoll.hide();
        _this.roll.show();
        _this.viewBtn.show();

        clearInterval(_this.intvalGo);

        var mid = $("#mid").val(); 
        $.post("mockData/post.json",{mobile:_this.winningNum.val()},function(res){ 
            if(res.code==0){
                console.log('OK');
                _this.cal.attr("cal", "0");
                clearTimeout(_this.timeOutGo);
            } else {
                alert('获取数据错误');
            }
            _this.endBtn.parent().addClass('displayfalse');
            _this.startBtn.show();
            
        }); 
    }

    var handleViewRaffle = function() {
        var _this = this;
        _this.raffleBlk.hide();
        _this.raffleResultBlk.show();

        $.get("mockData/getRaffle.json",function(res){
            if(res.code==0){ 
                var str = '';
                var r = $("#raffle-result");
                if (res.content.length != 0) {
                   $.each(res.content, function(k,v) {
                        str+='<tr><td>'+v.order+'</td><td>'+v.nickname+'</td><td>'+v.mobile+'</td></tr>';
                    }) 
                } else {
                    str+='<tr><td colspan="3">暂无中奖数据！</td></tr>';
                }
                
                r.html(str);

            } else {
                alert('获取数据错误');
            }
            _this.endBtn.parent().addClass('displayfalse');
            _this.startBtn.show(); 
        });
    }

    var handleKeyPress = function(e) {
       var key = e.which,_this = this;
        if (key == 13 || key == 32) {
            if (handleClickFrequency() == true) {
                if(_this.isRandom) {
                    handleStopRaffle();
                } else {
                    handleStartRaffle();
                }
            }
        }
    }

    var handleClickFrequency = function() {
        var _this = this;
        if (_this.cal.attr("cal") != "1") {
            handleResetTimer();
            return true;
        } else {
            console.log('频率太快');
            return false;
        }
    }

    var handleResetTimer = function() {
        var _this = this;
        _this.cal.attr("cal", "1");
        _this.timeOutGo = setTimeout(function() {
            _this.cal.attr("cal", "0")
        }, 3000);
    }

    var handleRandNum = function(second) {
        var twoArr = ['3','5','7','8']; //手机号第二位
        var otherArr = ['0','1','2','3','4','5','6','7','8','9'];
        if (second) {
            return twoArr[Math.floor(Math.random()*4)] + otherArr[Math.floor(Math.random()*10)];
        } else {           
            var num = '';
            for(var i=0;i<4;i++) {
                var randomAtom = otherArr[Math.floor(Math.random()*10)];
                num += randomAtom;
            }
            return num;
        }
    }
    
    var init = function() {
        keepElements();
        initEvents();
    }

    init();
    
})(jQuery);