/// <reference path="jquery1_9_1.js" />
/// <reference path="Cmn.js" />

//检查Cmn有没有定义，如果没有定义就定义下
if (typeof (Cmn) == "undefined") { Cmn = {}; }
if (typeof (Cmn.Func) == "undefined") { Cmn.Func = {}; }
//---------------------------------------

(function () {
    /// <field name="Cmn.Func.BaiduMapKey" type="String">百度key</field>
    Cmn.Func.BaiduMapKey = "9KAiuPrKKoy1soPCrBrmskPg";
    //---------------------------------------
    Cmn.Func.GetAddrByLbs = function (callBackFunc, baiduMapKey) {
        /// <summary>获取当前用户地址根据经纬度和百度地图接口</summary>
        /// <param name="callBackFunc" type="function">回调函数,成功返回参数：{"city":"南通市","district":"海门市","province":"江苏省","street":"云富北路","street_number":""},错误回调参数为：null</param>
        /// <param name="baiduMapKey" type="String">百度地图的key,如果不传取得是Cmn.Func.BaiduMapKey </param>

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(GetPositionCallBack, function () {
                callBackFunc(null);
            });
        }
        else { callBackFunc(null); }

        function GetPositionCallBack(position) {
            var _badiduMapKey = baiduMapKey;

            if (_badiduMapKey == undefined || _badiduMapKey == "") {
                _badiduMapKey = Cmn.Func.BaiduMapKey;
            }

            $.ajax({
                type: "Post",
                url: "http://api.map.baidu.com/geocoder/v2/?ak=" + _badiduMapKey + "&location=" +
                    position.coords.latitude + "," + position.coords.longitude + "&output=json&pois=0",

                contentType: "application/x-www-form-urlencoded",
                dataType: "jsonp",
                jsonp: "callback",
                success: function (retData) {
                    //{"status":0,"result":{"location":{"lng":121.32298703305,"lat":31.983423980434},"formatted_address":"江苏省南通市海门市云富北路","business":"","addressComponent":{"city":"南通市","district":"海门市","province":"江苏省","street":"云富北路","street_number":""},"cityCode":161}}

                    if (retData.status == 0) { callBackFunc(retData.result.addressComponent); }
                    else { callBackFunc(null); }

                    return true;
                },
                error: function (httpRequest) {
                    callBackFunc(null);

                    return false;
                }
            });
        }
    }
    //---------------------------------------
    Cmn.Func.GetCurPosition = function (callBackFunc) {
        /// <summary>获取当前位置</summary>
        /// <param name="callBackFunc" type="function">回调函数，失败返回参数 null,成功返回参数{"coords":{"latitude":"longitude",""}}</param>

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(callBackFunc, function () {
                callBackFunc(null);
            });
        }
        else { callBackFunc(null); }
    }
    //---------------------------------------
    Cmn.Func.IsHorizontalScreen = function () {
        /// <summary>是否是横屏</summary>
        /// <returns type="bool" />

        if (window.orientation == 0 || window.orientation == 180) {
            return false;
        }
        else if (window.orientation == 90 || window.orientation == -90) {
            return true;
        }
    }
    //---------------------------------------
    Cmn.Func.GetWindowsWidth = function () {
        /// <summary>获取windows的宽度（和默认的不一样，由于设置了viewport的放大倍数）</summary>

        return $("body").width();
    }
    //---------------------------------------
    Cmn.Func.GetWindowsHeight = function () {
        /// <summary>获取windows的高度（和默认的不一样，由于设置了viewport的放大倍数）</summary>

        return $("body").width() * $(window).height() / $(window).width();
    }
    //---------------------------------------
    //记录浏览器窗口初始的宽度
    var _InitWindowWidth = null; //竖屏时的宽
    var _InitWindowHeight = null; //竖屏时的高
    var _HasBindOrientationchange = false; //是否绑定过转屏事件

    Cmn.Func.MobileAdaptiveMode = {
        /// <field name="name" type="String">只适应宽度</field>
        Width: "Width",
        /// <field name="name" type="String">宽高都适应，在一屏内显示全部内容</field>
        WidthHeight: "WidthHeight",
        /// <field name="name" type="String">适应宽度，如果屏幕高度大于主要内容高度的时候裁剪</field>
        WidthCutOutHeight: "WidthCutOutHeight"
    }

    var ProcessAdviseVerticalImg = function (adviseVerticalImgUrl) {
        /// <summary>处理竖屏提示</summary>
        /// <param name="adviseVerticalImgUrl" type="String">建议竖屏图片url</param>
        /// <returns type="bool" />


        //判断是否有竖屏提示图片
        if (adviseVerticalImgUrl != undefined && adviseVerticalImgUrl != "" && Cmn.Func.IsString(adviseVerticalImgUrl)) {
            //Cmn.DebugLog("有提示图片");

            if (Cmn.Func.IsHorizontalScreen()) {
                Cmn.DebugLog("是横屏" + Cmn.Func.GetWindowsHeight() + " window.height:" + $(window).height() +
                    "window.width:" + $(window).width());

                var _zoom = window.screen.width / window.screen.height;

                if (_zoom > 1) { _zoom = 1 / _zoom; }

                var _width = $(window).width(); //Cmn.Func.GetWindowsWidth();

                //处理iphone上没有撑满宽度的情况，可能自动调整了放大倍数
                if (Cmn.Func.IsIOS() && _width < Cmn.Func.GetWindowsWidth()) { _width = Cmn.Func.GetWindowsWidth(); }

                var _height = _width * _zoom;

                if ($("body .AdviseVerticalImg").length <= 0) {
                    $("body").append("<div class='AdviseVerticalImg' " +
                        "style='position:fixed;left:0px;top:0px;z-index:10001;" +
                        "background:rgba(00, 00, 00, 1) none repeat scroll 0 0 !important;filter:Alpha(opacity=100);" +
                        "background:#000000;width:" + _width + "px;height:100%;text-align:center;'> " +
                        "<img height='" + (_height * 0.8) + "px' src='" + adviseVerticalImgUrl + "' /></div>");
                }
                else {
                    $(".AdviseVerticalImg").width(_width);
                    $(".AdviseVerticalImg img").height(_height * 0.8);

                    $(".AdviseVerticalImg").fadeIn(100);
                }

                $(".AdviseVerticalImg").off("touchstart").on("touchstart", function (e) {
                    e.preventDefault();
                    Cmn.DebugLog("触摸横屏提示层");
                });


                ////防止有时候没有显示出来
                //setTimeout(function () {
                //    $(".AdviseVerticalImg img").height(_height * 0.8-1);
                //    $(".AdviseVerticalImg").show();
                //    alert("hhh");
                //}, 2000);

                return true;
            }
            else {
                $(".AdviseVerticalImg").hide();
                $(".AdviseVerticalImg").off("touchstart");
                //$(".AdviseVerticalImg").off("touchmove");
            }
        }

        return false;
    }

    Cmn.Func.MobileAdaptive = function (mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode, onOrientationchange) {
        /// <summary>移动设备网页宽度自适应(body宽度需要定宽，否则安卓下有问题；viewport为<meta content="width=device-width,user-scalable=no;" name="viewport" />)</summary>
        /// <param name="mainContentWidth" type="int">主要内容区域的宽度</param>
        /// <param name="mainContentHeight" type="int">主要内容区域的高度</param>
        /// <param name="adviseVerticalImgUrl" type="String">建议竖屏提示图片</param>
        /// <param name="adaptiveMode" type="Cmn.Func.MobileAdaptiveMode">自适应方案(默认为Width只适应宽度)</param>
        /// <param name="onOrientationchange" type="function">转屏处理结束回调事件</param>

        Cmn.DebugLog(navigator.userAgent + "  自适应方案：" + adaptiveMode);

        if (adaptiveMode == undefined) { adaptiveMode = Cmn.Func.MobileAdaptiveMode.Width; }

        if (!ProcessAdviseVerticalImg(adviseVerticalImgUrl)) {
            if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.Width || adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthCutOutHeight) {
                $("body").width(mainContentWidth);

                if (Cmn.Func.IsIOS()) {
                    Cmn.DebugLog("是IOS系统");


                    $("[name='viewport']").attr("content",
                        "width=" + mainContentWidth + ",user-scalable=no;");
                }
                else if (navigator.userAgent.match(/Nexus/i) != null) {
                    Cmn.DebugLog("操作系统Nexus");

                    $("body").css("zoom", $(window).width() / mainContentWidth * 100 + "%");
                }
                    //else if (navigator.userAgent.match(/Android\s*4.4/i) != null) {
                else if (navigator.userAgent.match(/android\s*[\d\.]+/i) != null) { //是安卓手机
                    Cmn.DebugLog("是安卓系统");

                    var _androidVersion = navigator.userAgent.match(/android\s*[\d\.]+/i)[0].replace(/android\s*/i, "");

                    if (_androidVersion.indexOf(".") > 0) { //存在点例如4.4.2
                        _androidVersion = _androidVersion.match(/[\d]+\.[\d]+/i);
                    }

                    if (_androidVersion >= 4.4) {
                        Cmn.DebugLog("安卓版本大于等于4.4:" + _androidVersion);

                        $("body").css("zoom", $(window).width() / mainContentWidth * 100 + "%");
                    }
                    else { //小于4.4版本
                        Cmn.DebugLog("安卓版本小于4.4:.." + _androidVersion);

                        //if (navigator.userAgent.match(/Android\s*4.2.2/i) != null) {
                        Cmn.DebugLog("安卓版本 4.2.2,window.screen.width:" + window.screen.width +
                            " window.devicePixelRatio:" + window.devicePixelRatio);

                        var _densitydpi = mainContentWidth / window.screen.width * window.devicePixelRatio * 160;

                        $("[name='viewport']").attr("content",
                            "width=" + mainContentWidth + ", user-scalable=no, target-densitydpi=" + _densitydpi.toFixed(0) + ";");
                        //}
                        //else {

                        //    _InitWindowWidth = $(window).width();
                        //    _InitWindowHeight = $(window).height();

                        //    Cmn.DebugLog("window.Width:" + _InitWindowWidth + "window.Height:" + _InitWindowHeight);

                        //    var _multiple = _InitWindowWidth / mainContentWidth;

                        //    $("[name='viewport']").attr("content",
                        //        "width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                        //        ",minimum-scale=" + _multiple + ",user-scalable=no;");
                        //}
                    }
                }
                else { //其他操作系统
                    Cmn.DebugLog("是其他操作系统");

                    _InitWindowWidth = $(window).width();
                    _InitWindowHeight = $(window).height();

                    Cmn.DebugLog("window.Width:" + _InitWindowWidth + "window.Height:" + _InitWindowHeight);

                    var _multiple = _InitWindowWidth / mainContentWidth;

                    $("[name='viewport']").attr("content",
                        "width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                        ",minimum-scale=" + _multiple + ",user-scalable=no;");


                    ////旋转事件
                    //var _onOrientationchange = function (event) {
                    //    $(".AdviseVerticalImg").hide(); //隐藏竖屏提示

                    //    var _widthBeforChange = $(window).width(); //旋转之前的宽度

                    //    $("[name='viewport']").attr("content", "width=device-width,user-scalable=no;");

                    //    Cmn.DebugLog("旋转" + window.orientation);

                    //    var _setTimeoutCount = 0;

                    //    function AdaptiveAfterChange() {
                    //        /// <summary>改变viewport后需要自适应</summary>

                    //        _setTimeoutCount++;

                    //        if (_setTimeoutCount > 10) {
                    //            Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                    //            return;
                    //        }

                    //        setTimeout(function () {
                    //            if (_widthBeforChange != $(window).width()) {
                    //                Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                    //            }
                    //            else { AdaptiveAfterChange(); }
                    //        }, 50);
                    //    }

                    //    AdaptiveAfterChange();
                    //}


                    ////绑定旋转事件
                    //if (_HasBindOrientationchange == false) {    
                    //    $(window).on("orientationchange", _onOrientationchange);
                    //    _HasBindOrientationchange = true;
                    //}
                }

                //处理高度超出裁剪
                if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthCutOutHeight) {
                    Cmn.DebugLog("是WidthCutOutHeight  GetWindowsHeight:" + Cmn.Func.GetWindowsHeight() +
                        " mainContentHeight：" + mainContentHeight + " bodyHeight:" + $("body").height());

                    if (Cmn.Func.GetWindowsHeight() > mainContentHeight) {
                        Cmn.DebugLog("满足条件，需要隐藏滚动条");

                        if ($("body").height() > Cmn.Func.GetWindowsHeight()) {
                            $("body").height(Cmn.Func.GetWindowsHeight());
                            $("body").css("overflow-y", "hidden");
                        }
                    }
                    else { $("body").css("overflow-y", "scroll"); }
                }
            }
            else if (adaptiveMode == Cmn.Func.MobileAdaptiveMode.WidthHeight) { //宽高都需要适应，一屏内显示
                if (Cmn.Func.IsIOS()) {
                    var _width = mainContentWidth;// 1024 / $(window).height() * 640;

                    if (mainContentWidth * $(window).height() / $(window).width() < mainContentHeight) {
                        _width = mainContentHeight / ($(window).height() / $(window).width());
                    }

                    //_width = 900;

                    $("[name='viewport']").attr("content",
                        "width=" + _width + ",user-scalable=no;");

                    $("body").width(_width);


                    Cmn.DebugLog("windowWidth11:" + $(window).width() + " windowHeight:" + $(window).height());
                }
                else if (navigator.userAgent.match(/Android\s*4.4/i) != null) {
                    Cmn.DebugLog("Android 4.4");

                    $("body").css("zoom", $(window).width() / mainContentWidth * 100 + "%");
                }
                else { //安卓等其他的
                    _InitWindowWidth = $(window).width();
                    _InitWindowHeight = $(window).height();

                    var _multiple = _InitWindowWidth / mainContentWidth;

                    if (_InitWindowHeight / mainContentHeight < _multiple) { _multiple = _InitWindowHeight / mainContentHeight; }

                    $("body").width(_InitWindowWidth / _multiple);

                    Cmn.DebugLog("window.Width:" + _InitWindowWidth + "window.Height:" + _InitWindowHeight + " _multiple：" + _multiple);

                    //$("[name='viewport']").attr("content",
                    //    "width=device-width,initial-scale=" + _multiple + ",maximum-scale=" + _multiple +
                    //    ",minimum-scale=" + _multiple + ",user-scalable=no;");

                    //Cmn.DebugLog("设置viewport后window.Width:" + $(window).width() + "window.Height:" + $(window).height());



                    var _densitydpi = _InitWindowWidth / _multiple / window.screen.width * window.devicePixelRatio * 160;

                    $("[name='viewport']").attr("content",
                        "width=" + (_InitWindowWidth / _multiple) + ", user-scalable=no, target-densitydpi=" + _densitydpi.toFixed(0) + ";");
                }
            }
        }



        //旋转事件
        var _onOrientationchange = function (event) {
            $(".AdviseVerticalImg").hide(); //隐藏竖屏提示

            var _widthBeforChange = $(window).width(); //旋转之前的宽度

            //重置viewport
            $("[name='viewport']").attr("content", "width=device-width,user-scalable=no;");

            Cmn.DebugLog("旋转" + window.orientation + "  _widthBeforChange:" + _widthBeforChange +
                "  window.width:" + $(window).width());

            //var _setTimeoutCount = 0;

            function AdaptiveAfterChange() {
                /// <summary>改变viewport后需要自适应</summary>

                //_setTimeoutCount++;

                //if (_setTimeoutCount > 10) {
                //    Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                //    if (onOrientationchange != undefined) { onOrientationchange(); }
                //    return;
                //}

                setTimeout(function () {
                    //if (_widthBeforChange != $(window).width()) {
                    //Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                    //if (onOrientationchange != undefined) { onOrientationchange(); }
                    //}
                    //else { AdaptiveAfterChange(); }


                    //判断是否转屏完成
                    if ((Cmn.Func.IsHorizontalScreen() && $(window).width() >= $(window).height()) ||
                        (Cmn.Func.IsHorizontalScreen() == false && $(window).width() <= $(window).height())) {
                        Cmn.Func.MobileAdaptive(mainContentWidth, mainContentHeight, adviseVerticalImgUrl, adaptiveMode);
                        if (onOrientationchange != undefined) { onOrientationchange(); }
                    }
                    else { AdaptiveAfterChange(); }
                }, 50);
            }

            AdaptiveAfterChange();
        }


        //绑定旋转事件
        if (_HasBindOrientationchange == false) {
            $(window).on("orientationchange", _onOrientationchange);
            _HasBindOrientationchange = true;
        }

        Cmn.DebugLog("自适应后viewport:" + $("[name='viewport']").attr("content"));
        //setTimeout(function () {
        //    Cmn.DebugLog("设置viewport500后window.Width:" + $(window).width() + "window.Height:" + $(window).height());
        //}, 500);
    }
    //---------------------------------------
    Cmn.Func.SaveImgToLocal = function (imgUrl) {
        imgUrl = Cmn.Func.GetAbsoluteUrl(imgUrl);

        if (Cmn.Func.IsWeiXin()) {
            var _list = new Array();

            _list[0] = imgUrl;

            WeixinJSBridge.invoke('imagePreview', { 'current': $(this).attr('src'), 'urls': _list });
        }
        else { //不是微信浏览器

            //保存图片
            //var downloadMime = 'image/octet-stream';
            //strData = strData.replace("image/jpeg", downloadMime);
            //document.location.href = strData;


            var _oPop = window.open(imgUrl, "", "width=1, height=1, top=5000, left=5000");

            for (; _oPop.document.readyState != "complete";) {
                if (_oPop.document.readyState == "complete") break;
            }

            _oPop.document.execCommand("SaveAs");
            _oPop.close();
        }
    }
    //---------------------------------------
    //摇一摇
    Cmn.Func.Shake = function (threshold, fn) {
        /// <summary>摇一摇</summary>
        /// <param name="threshold" type="int">摇一摇灵敏度 默认800</param>
        /// <param name="fn" type="function">摇一摇触发之后执行的函数</param>
        if (arguments.length == 1) {
            threshold = 800;
            if (typeof arguments[0] == "function") { fn = arguments[0]; }

            if (typeof arguments[0] == "boolean") {
                window.IsShake = true;
                return 'undefined';
            }
        }

        var SHAKE_THRESHOLD = threshold || 800;
        var lastUpdate = 0;
        var x, y, z, last_x, last_y, last_z;
        window.IsShake = true;
        function deviceMotionHandler(eventData) {
            if (IsShake == false) { return; }
            var acceleration = eventData.accelerationIncludingGravity;
            var curTime = new Date().getTime();
            if ((curTime - lastUpdate) > 100) {
                var diffTime = (curTime - lastUpdate);
                lastUpdate = curTime;
                x = acceleration.x;
                y = acceleration.y;
                z = acceleration.z;
                var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
                if (speed > SHAKE_THRESHOLD) {
                    if (!!fn && IsShake) { IsShake = false; fn(); }

                }
                last_x = x;
                last_y = y;
                last_z = z;
            }
        }
        window.addEventListener("devicemotion", deviceMotionHandler, false);

    }

    //------------------------------------待测试。。。
    //触摸滑动
    Cmn.Func.TouchSlide = function (selector, touchThreshold, moveFn, endFn, model) {
        /// <summary>触摸滑动</summary>
        /// <param name="selector" type="string">触摸的容器选择器</param>
        /// <param name="touchThreshold" type="int">触摸滑动的距离</param>
        /// <param name="moveFn" type="function">touchmove触发之后执行的函数</param>
        /// <param name="endFn" type="function">touchend 触发之后执行的函数</param>
        /// <param name="model" type="string">1：touchmove 的时候触发一次 2：:touchmove的时候总是触发 默认为1</param>
        var _$touchSlideBox = $(selector);
        if (_$touchSlideBox.length < 1) { return false; }
        var _startX = null;//起始x坐标
        var _startY = null;//其实y坐标
        var _direction = "";//滑动的方向


        _$touchSlideBox.off("touchstart").on("touchstart", function (e) {
            e = event.touches ? event.touches[0] : e;
            if (_startX == null && _startY == null) _startX = e.pageX; _startY = e.pageY;
        });

        _$touchSlideBox.off("touchmove").on("touchmove", function (ev) {

            if (_startX == null && _startY == null) { e.preventDefault(); return; }

            var e = event.touches ? event.touches[0] : ev;
            var _transverseThreshold = Math.abs(e.pageX - _startX);
            var _vertical = Math.abs(e.pageY - _startY);

            if (_transverseThreshold > _vertical) {

                if (e.pageX - _startX > 0) {
                    if (Math.abs(e.pageX - _startX) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "right";
                        if (!!moveFn) { moveFn(_direction, _transverseThreshold); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                    }
                }
                else if (e.pageX - _startX < 0) {

                    if (Math.abs(e.pageX - _startX) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "left";
                        if (!!moveFn) { moveFn(_direction, _transverseThreshold); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                    }
                }
                ev.preventDefault();
            }
            else if (_transverseThreshold < _vertical) {

                if (e.pageY - _startY > 0) {
                    if (Math.abs(e.pageY - _startY) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "down";
                        if (!!moveFn) { moveFn(_direction, _transverseThreshold); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                    }
                }

                else if (e.pageY - _startY < 0) {

                    if (Math.abs(e.pageY - _startY) > touchThreshold) {
                        //fn 第一个参数方向 第二个参数移动距离
                        _direction = "up";
                        if (!!moveFn) { moveFn(_direction, _transverseThreshold); }

                        if (!model || model == "1") { _startX = null; _startY = null; }
                    }
                }
                ev.preventDefault();
            }
        });

        _$touchSlideBox.off("touchend").on("touchend", function (e) {
            _startX = null; _startY = null;
            if (!!_direction && !!endFn) { endFn(_direction); }
            _direction = "";
        });
    }


})();