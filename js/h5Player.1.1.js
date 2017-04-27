/*
 * 1.1版本
 * name :h5Player.js
 * writer: wangwei
 * time: 2015.12.16
 * version:1.0
 * method: 
 
 $.h5Player({
	'src':'http://act.ci123.com/elsker2015/views/inc/allbg.mp3',
	'auto':true,
	'cool':1,    //音频下开启是否支持默认样式
	'loop':false, //是否循环
	'onPlay':function(){},//开始播放回调函数
	'pause':function(){}, //暂停或停止时回调
	'ended':function(){}, //播放结束时回调
	'timeupdate':function(currentTime, duration){} //播放实时返回时间点和总时间可用于制作进度  
 });

  $.h5Player({
	'container':'#myvideo',
	'src':'http://file2.ci123.com/act/flv/20150923.mp4',
	'auto':false,
	'cool':0,    //视频0
	'poster':"http://act.ci123.com/avent/views/images2/yuer_pic3/picc_8.jpg", //封面
	'controls':true
 });

 */
(function($) {
    $.extend({
        'h5Player': function(settings) {
            var _player, _isPlay = false,
            _ua = window.navigator.userAgent.toLowerCase(),
            _isWX = _ua.match(/MicroMessenger/i) == 'micromessenger',
            _click = "ontouchend" in document ? 'touchend': 'click',
			_this = this,
			_audioExp = /(\.mp3|\.ogg|\.wav)$/,
			_videoExp = /(\.mp4|\.webm|\.ogg)$/;

			//默认初始化设置
            var _setting = {
				//地址
                src: '',
				//播放容器
                container: '',
                id: '',
                width: 320,
                height: 150,
                auto: false,
                //是否自动播放
                loop: false,
                //是否循环播放
                onPlay: function() {},
                //开始播放后
                onPause: function() {},
                //暂停后
                onStop: function() {},
                //停止后
                timeupdate: function() {},
				ended:function(){},
                cool: 0,
                controls: false,
				poster:'',
				inline:true
            };

            _setting = $.extend(_setting, settings);

            //音乐类型检测
            if (_audioExp.test(settings.src.toLowerCase())) {
				if (!window.HTMLAudioElement) {
					alert("your brower can't surport HTMLAudioElement ");
					return false;
				}

				_player = document.createElement("AUDIO");
				var _type = "music";

            } else if (_videoExp.test(settings.src.toLowerCase())) { 

                if (!window.HTMLVideoElement) {
                    alert("your brower can't surport HTMLAudioElement ");
                    return false;
                }

				 _player = document.createElement("VIDEO");
				 var _type = "video";
            }

            if (typeof _player == 'undefined') {
                alert('media type error ');
                return false;
            }
 
			//初始化媒体
            var _id = 'h5Player20151215' + _setting.id;

            if (_setting.container != '') {
                $(_setting.container).empty().append(_player).css({"width":_setting.width,"height":_setting.height});
            } else {
                $("#" + _id).remove();
                $(document.body).append(_player);
            }

            _player.src = _setting.src;
            _player.controls = _setting.controls;
			_player.width = _setting.width;
			_player.height = _setting.height;
			
			if(_type=='video'){
				if(_setting.inline){
					_player.setAttribute("webkit-playsinline", "webkit-playsinline");
					_player.setAttribute("playsinline", "playsinline");
					_player.setAttribute("x-webkit-playsinline", "x-webkit-playsinline");
					//_player.setAttribute("x-webkit-airplay", "allow");
				}
				_player.setAttribute('poster', _setting.poster);
			}
  
            _player.loop = _setting.loop;

            if (_setting.auto) {
                _player.autoplay = true;
            }

			//多窗口音乐重复播放问题修正
			var nowStamp = '['+Math.random()+']';
			localStorage.nowStamp = nowStamp;
			
			//定位音频播放点 
			_this.setPlayStart = function(){
				if(typeof localStorage.nowName == 'undefined'){
					localStorage.nowName = _player.src;
					localStorage.nowTime = 0;
				}else {
					if(localStorage.nowName == _player.src){
						 if(_player.readyState == 4){  
							//0.4秒是可能的误差
							_player.currentTime = parseFloat(localStorage.nowTime) + 0.4;
						 }
					}else{
					   localStorage.nowName = _player.src;
					   localStorage.nowTime = 0;
					}
				}	
			}

			//监听并回调事件
            $(_player).on("play", function() {
  				_this.setPlayStart();
				//播放音乐
                _isPlay = true;
                if (_setting.cool == 1) {
                    $(".soundBtn span").show();
                }
                _setting.onPlay.call();
            }).on("pause", function() {
                if (_setting.cool == 1) {
                    $(".soundBtn span").hide();
                }
                _setting.onPause.call();
            }).on("stop", function() {
                if (_setting.cool == 1) {
                    $(".soundBtn span").hide();
                }
                _setting.onStop.call();
            }).on("ended", function() {
                localStorage.nowTime = 0;
                _setting.ended.call();
            }).on("timeupdate", function() {
				 
				if(localStorage.nowStamp != nowStamp){
					_player.pause();
				}

				localStorage.nowTime = _player.currentTime;
                _setting.timeupdate.call(this, _player.currentTime,_player.duration);
            });

            //safri浏览器不能自动播放的替代
            if (_setting.auto) {
                if (_isWX) {
                    //微信
                    document.addEventListener("WeixinJSBridgeReady",
                    function() {
                        if (!_isPlay) {
                            _isPlay = true;
                            _player.play();
                        }
                    });
                } else {
                    $('body').on(_click, function() {
                        if (!_isPlay) {
                            _isPlay = true;
                            _player.play();
                        }
                    });
                }
            }

            //cool样式1
            if (_setting.cool == 1) {
                $(document.body).append('<div class="soundBtn"><span>♫</span></div>').append('<style>.soundBtn{position:fixed;right:20px;top:20px;width:68px;height:68px;background:url(http://act.ci123.com/heinzsalt/views/images/music_note_big.png) no-repeat;background-size:cover;z-index:998}.soundBtn span{display:none;position:absolute;font-size:28px;color:#fff;-webkit-animation:sound 1.5s linear infinite alternate} @-webkit-keyframes sound{0%{-webkit-transform:translate(50px,10px)}100%{-webkit-transform:translate(16px,-20px)}}</style>');

                $(".soundBtn").delegate('', _click,function() {
                    if (_player.paused) {
                        _player.play();
                    } else {
                        _player.pause();
                    }
                })
            };
            return _player;
        }
    });
})(jQuery);