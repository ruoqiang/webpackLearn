$(function () {
    //分享微博按钮
    $(".Js_weibo").on("click", function () {
        var _shareUrl = "http://www.utlcenter.com/";
        var _shareImg = "http://www.utlcenter.com/appIntro/images/Share.jpg";
        var _shareTitle = "下载学子易贷APP助你梦想成真。";
        window.open("http://s.jiathis.com/?webid=tsina&title=" + encodeURIComponent(_shareTitle) + '&pic=' + encodeURIComponent(_shareImg) + "&url=" + encodeURIComponent(_shareUrl));

    });
    //分享QQ按钮
    $(".Js_QQ").on("click", function () {
        var _shareUrl = "http://www.utlcenter.com/";
        var _shareImg = "http://www.utlcenter.com/images/logo2.png";
        var _shareTitle = "下载学子易贷APP助你梦想成真。";
        var _desc = "赶快也来分享吧。。。";
        window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' +
        encodeURIComponent(_shareUrl) + '&title=' + '&pics=' + encodeURIComponent(_shareImg) + '&summary=' + encodeURIComponent(_desc) + '&desc=' +
        encodeURIComponent(_shareTitle));
    });

    $(".logo").on("click", function () {
        window.location.href = "../user/Index.aspx"
    })


})