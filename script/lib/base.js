/**
 * 基础js
 * */

$A = {};
$A.domname = 'http://api.dbsex.sg'
$A.url = $A.domname + '/aapi/';
$A.upload_url = 'http://api.dbsex.sg';
$A.dev_model = 1        //0,开发      1,上线

/**
 * 请求方法
 * @param url 请求地址
 * @param fun 回调函数
 * @param data 请求参数
 * @param pre_do_call_back 获取上次请求成功数据
 * @param file 上传的文件路径
 */
$A.isLoading = {}
$A.request = function (url, params, success_call_back, pre_do_call_back, file, is_no_tip) {
    if (!params) {
        params = {}
    }
    var cache_key = 'request_data#' + url

    // 获取上次请求数据
    var pre_data_str = $api.getStorage(cache_key);
    if (is_set(pre_data_str)) {
        var pre_data = $.parseJSON(pre_data_str)
        if (typeof pre_data !== 'undefined' && typeof pre_do_call_back === 'function') {
            pre_do_call_back(pre_data)
        }
    }

    // 还有正在获取的请求
    if ($A.isLoading[url] === true) {
        $A.toast('請勿重復操作')
        return
    }

    // 当前手机没有网络
    if (String(api.connectionType) === 'none') {
        api.toast({
            msg: '請檢查下您的手機是否聯網',
            location: 'middle'
        });
        return
    }

    var group = url.split('/')[0]
    if (group === 'finance' || group === 'user' || url === 'trade/submit' || url === 'trade/get_list' || url === 'trade/repeal') {
        var token = api.getPrefs({
            sync: true,
            key: 'token'
        });
        if (!is_set(token)) {
            $A.confirm(function () {
                $A.change_frame('login')
            }, '當前請求,必須得請先進行登錄操作!')
            return
        }
        params.token = token
    }

    //调用加载框

    if (file) {
        api.showProgress({
            style: 'default',
            animationType: 'fade',
            title: '請求中...',
            text: '',
            modal: false
        });
    }


    //$A.isLoading[url] = true
    //如果是文件上传调用文件长传接口/拼接普通业务接口
    url = $A.url + url;

    //$A.copy($api.getStorage('token'))
    // $A.alert('url: '+url)
    //$A.alert('参数是:'+JSON.stringify(params))
    api.ajax({
        url: url,
        method: 'post',
        cache: true,            //  缓存上次记录
        timeout: 30,            // 网路超时
        data: {
            values: params,
            files: file
        }
    }, function (ret, err) {
        //$A.isLoading[url] = false
        //关闭加载框
        api.hideProgress();
        //判断是否网络错误
        if (typeof (err) !== 'undefined' && typeof (err.msg) !== 'undefined') {
            api.toast({
                msg: err.msg,
                location: 'middle'
            });
            return;
        }
        //判断是否服务器返回数据异常
        if (typeof (ret) === 'undefined') {
            api.toast({
                msg: '服務器返回數據異常,請稍候再試',
                location: 'middle'
            });
            return;
        }
        ret.code = Number(ret.code)
        //服务器返回数据校验
        if (ret.code === 0) {
            $api.setStorage(cache_key, JSON.stringify(ret.data));
            // 正确返回
            if (typeof (success_call_back) === 'function') {
                success_call_back(ret.data)
            }
        } else {
            // 用户状态异常,提示并推出
            api.toast({
                msg: ret.msg,
                location: 'middle'
            });
            if (ret.code === 1001) {
                $A.login_out(true);
            }
        }
    });
}


//普通弹窗
$A.alert = function (msg) {
    api.alert({
        title: '系統提示',
        msg: msg,
        buttons: ['確定'],
    }, function (ret, err) {

    })
}

//提醒窗口
$A.toast = function (msg) {
    api.toast({
        msg: msg,
        location: 'middle'
    });
}


//确认窗
$A.confirm = function (fun, msg) {
    api.confirm({
        title: '溫馨提示',
        msg: msg ? msg : '您確認進行該嗎?',
        buttons: ['確定', '取消']
    }, function (ret, err) {
        if (ret.buttonIndex === 2) {
            return;
        }
        fun();
    })
}


/**
 * 二维码扫描
 * @param callback 回调事件
 * @param is_full_screen 是否全屏相机
 */
$A.qr = function (callback, is_full_screen) {
    if (!$A.FNScanner)
        $A.FNScanner = api.require('FNScanner');

    if (is_full_screen) {
        var width = api.winWidth * 0.9
        var height = width * 0.5;
        if ($A.FNScanner.is_open === 1) {
            $A.FNScanner.is_open = 0;
            $A.FNScanner.closeView();
        }
        $A.FNScanner.openView({
            rect: {
                x: (api.winWidth - width) / 2,
                y: 150,
                w: width,
                h: height,
            },
            autorotation: true
        }, function (ret, err) {
            if (ret.eventType === 'success') {
                //防止iOS扫描速度太快无法切换界面
                setTimeout(function () {
                    callback(ret.content);
                }, 500);
            }
            if (ret.eventType === 'fail') {
                $A.toast('掃描二維碼失敗!')
            }
            if (ret.eventType !== 'show') {
                $A.FNScanner.is_open = 0;
                $A.FNScanner.closeView();
            } else {
                $A.FNScanner.is_open = 1;
            }
        });
    } else {
        $A.FNScanner.openScanner({
            autorotation: false,	//是否可以横屏
        }, function (ret, err) {
            if (ret.content) {
                //防止iOS扫描速度太快无法切换界面
                setTimeout(function () {
                    callback(ret.content);
                }, 500);

            }
        });
    }
}

/**
 * 底部添加事件
 */
$A.footer_event = function () {
    $('.footer-nav>li').on('click', function () {
        if ($(this).hasClass('selected')) {
            return;
        }
        // 主页
        if ($(this).hasClass('index_page')) {
            $A.change_frame('index')
        }
        // 交易页面
        if ($(this).hasClass('trade_page')) {
            $A.change_frame('trade_index')
        }
        // 资金中心
        if ($(this).hasClass('otc_page')) {
            // 检查用户是否登录
            $A.check_login(function () {
                $A.change_frame('user_center_capital', 'index')
            })
            /* $A.check_login(function () {
                 $A.openGroup('user_center', 'capital')
             })*/
        }
        // 用户中心
        if ($(this).hasClass('user_center_page')) {
            // 检查用户是否登录
            $A.check_login(function () {
                $A.change_frame('user_center_index')
            })
        }
    })
}


/**
 * 日期插件
 * @param node 绑定节点
 * @param type 类型
 * @param text 默认值
 */
$A.Calendar = function (node) {
    node.attr('readonly', true)
    node.on('click', function () {
        $this = $(this)
        api.openPicker({
            type: 'date_time',
            date: $A.curr_date(),
            title: '選擇時間'
        }, function (ret, err) {
            if (ret) {
                $this.val(ret.year + '-' + ret.month + '-' + ret.day)
            }
        });
    })
}
/**
 * 获取当前日期
 */
$A.curr_date = function () {
    var myDate = new Date();
    var mon = (myDate.getMonth() + 1) + '';
    var day = myDate.getDate() + '';
    if (mon.length == 1)
        mon = '0' + mon;
    if (day.length == 1)
        day = '0' + day;
    return myDate.getFullYear() + '-' + mon + '-' + day;
}

//获取键值
$A.get_key = function (e) {
    e = e ? e : window.event;
    var keyCode = e.which ? e.which : e.keyCode;
    //获取按键值
    return keyCode
}


function is_set(obj) {
    if (typeof(obj) == 'undefined' || !obj || obj == null || obj.length == 0) {
        return false;
    } else {
        return true;
    }
}


/**
 *检查用户是否登录
 */
$A.check_login = function (call_back) {
    var user = api.getPrefs({
        sync: true,
        key: 'token'
    });
    if (!is_set(user)) {
        if (call_back) {
            $A.login_out(true);
            return
        }
    } else {
        call_back();
        return user;
    }
}


/**
 * 退出登录
 * tip 是否需要提醒
 * */
$A.login_out = function (no_tip) {
    if (!no_tip) {
        $A.confirm(function () {
            out();
        }, '您確認要退出當前登錄用戶？')
    } else {
        out();
        return;
    }

    function out() {
        //  清空当前用户的session
        api.removePrefs({
            key: 'token'
        });
        api.removePrefs({
            key: 'username'
        });
        $A.change_frame('login')
    }
}


//通用正则
var $Reg = {}, $Reg_error_info = {}
$Reg.username = RegExp(/^[a-zA-Z0-9]{5,30}$/)
$Reg.name = RegExp(/^[a-zA-Z0-9\u4e00-\u9fa5]{1,16}$/)
$Reg.address = RegExp(/^[a-zA-Z-\d\u4e00-\u9fa5]{1,200}$/)
$Reg.mobi = RegExp(/^1[3|4|5|8|7][0-9]\d{8}$/)
$Reg.email = RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)
$Reg.phone = RegExp(/^((\d{3,4})|\d{3,4}-)?\d{7,8}(-\d+)*$/i)
$Reg.idcard = RegExp(/^[1-9]\d{5}(19\d{2}|[2-9]\d{3})((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])(\d{4}|\d{3}X)$/i);
$Reg.post_code = RegExp(/^\d{6}$/i)
$Reg.county_name = RegExp(/^[a-zA-Z0-9\u4e00-\u9fa5]{2,20}$/)
$Reg.county_title = RegExp(/^[a-zA-Z0-9\u4e00-\u9fa5]{5,30}$/)


//验证码发送操作
function init_send_sms(type, button, mobi) {
    var type_arr = [0, 1, 2], seconds = 120;
    if ($.inArray(type, type_arr) < 0) {
        $A.toast('驗證碼發送類型錯誤');
        return;
    } else {
        var second_key = 'send_sms_second_' + type;
        check_second();
        button.die('click').on('click', function () {
            var params = {}
            if (!mobi.val().match($Reg.mobi)) {
                $A.toast('手機號碼錯誤');
                return;
            }
            params.mobi = mobi.val();
            params.type = type;
            $A.request('send_sms', params, function (data) {
                $A.toast('發送成功!');
                $api.setStorage(second_key, seconds)
                check_second();
            });
        })


        //检查验证码等待时间
        function check_second() {
            $A[second_key] = $api.getStorage(second_key) - 0;
            if ($A[second_key] > 0) {
                //需要等待
                function second_reduce() {
                    $A[second_key] = $A[second_key] - 1;
                    if ($A[second_key] > 0) {
                        button
                            .attr('disabled', true)
                            .html($A[second_key] + 's後再發送');
                    } else {
                        button
                            .attr('disabled', false)
                            .html('發送驗證碼');
                    }
                    $api.setStorage(second_key, $A[second_key]);
                }

                $A.timer = setInterval(function () {
                    if ($A[second_key] >= 0) {
                        second_reduce();
                    }
                }, 1000);
            }
            //不需要等待
            button
                .attr('disabled', false)
                .html('發送驗證碼');
        }

    }
}


/**
 * 检查当前应用版本
 * is_check: 是否会有提醒提醒
 * */
$A.check_version = function (is_check) {
    if (!$A.mam)
        $A.mam = api.require('mam');
    $A.mam.checkUpdate(function (ret, err) {
        if (ret) {
            var result = ret.result;
            if (result && result.update == true & result.closed == false) {
                var str = '新版本型號:' + result.version + ';\n\r更新提示語:' + result.updateTip + ';';
                api.confirm({
                    title: '有新的版本,是否下載並安裝 ',
                    msg: str,
                    buttons: ['確定', '取消']
                }, function (ret, err) {
                    if (ret.buttonIndex == 1) {
                        if (api.systemType == "android") {
                            api.download({
                                url: result.source,
                                report: true
                            }, function (ret, err) {
                                if (ret && 0 == ret.state) {/* 下载进度 */
                                    api.showProgress({
                                        style: 'default',
                                        animationType: false,
                                        title: "正在下載應用" + ret.percent + "%",
                                        modal: false
                                    });
                                    return;
                                }
                                if (ret && 1 == ret.state) {/* 下载完成 */
                                    api.hideProgress();
                                    var savePath = ret.savePath;
                                    api.installApp({
                                        appUri: savePath
                                    });
                                }
                            });
                        }
                        if (api.systemType == "ios") {
                            api.installApp({
                                appUri: result.source
                            });
                        }
                    }
                });
            } else {
                if (is_check) {
                    $A.toast('已經是最高版本');
                }
            }
        } else {
            api.alert({
                msg: err.msg
            });
        }
    });
}


/**
 * 关闭窗口
 */
$A.closeWin = function (name) {
    api.closeWin({
        name: name
    });
}
//关闭当前页面
function closeWin(name) {
    api.closeWin({});
}
function closeFrame() {
  api.closeFrame({});
}
/**
 * 打开窗体
 * */
$A.openWin = function (name, reload) {
    !reload ? reload = false : reload = true;
    // $A.toast('打開')
    api.openWin({
        name: name,
        url: '../' + name + '.html',
        reload: reload,
        animation: {
            type: 'none'
        },
        slidBackEnabled: false,
        showProgress: true,
    });
}


//打印
function log(obj) {
    console.log(obj)
}


//下拉联动选择
$A.ui_select = function (params) {
    if (!params.data || !params.data.length) {
        return $A.alert('數據參數缺失');
    }
    if (!$A.UIActionSelector)
        $A.UIActionSelector = api.require('UIActionSelector');
    $A.UIActionSelector.open({
        datas: params.data,
        layout: {
            row: 5,
            col: 2,				//横向层级
            height: 30,
            size: 16,
            sizeActive: 18,
            rowSpacing: 5,
            colSpacing: 10,
            maskBg: 'rgba(0,0,0,0.2)',
            bg: '#fff',
            color: '#888',
            colorActive: '#f00',
            colorSelected: '#f00'
        },
        animation: true,
        cancel: {
            text: '取消',
            size: 16,
            w: 90,
            h: 35,
            bg: '#fff',
            bgActive: '#ccc',
            color: '#888',
            colorActive: '#fff'
        },
        ok: {
            text: '確定',
            size: 16,
            w: 90,
            h: 35,
            bg: '#fff',
            bgActive: '#ccc',
            color: '#888',
            colorActive: '#fff'
        },
        title: {
            text: '請選擇',
            size: 16,
            h: 44,
            bg: '#eee',
            color: '#888'
        },
    }, function (ret, err) {
        if (ret) {
            if (typeof params.call_back == 'function') {
                params.call_back(ret);
            }
        } else {
            //alert(JSON.stringify(err));
        }
    });
}

//获取屏幕宽度
function get_win_width() {
    return Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth);
}


//获取对象的第一个键值
$A.first_key = function (arr, key) {
    var a = 0, key;
    $.each(arr, function (i, obj) {
        if (a == 0) {
            key = i;
            delete arr;
        }
        a++;
    })
    return key;
}

/**
 * 添加遮罩层
 * @param params: 1.不传值,显示  2.false,隐藏
 * */
$A.mask = function (params) {
    if (params === false) {
        $('.mask').hide();
        return;
    }
    var width = Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth),
        height = Math.min(document.documentElement.clientHeight, document.documentElement.scrollHeight);
    var css = {
        width: width,
        height: height,
    };
    if ($('.mask').size() == 0) {
        $('body').append('<div class="mask"></div>');
        call_back_check();
    } else {
        if (!$('.mask').is(':visible')) {
            $('.mask').show();
        }
    }


    function call_back_check() {
        if (params && typeof(params.call_back) == 'function') {
            $('.mask').die('click').on('click', function () {
                params.call_back()
            })
        }
    }
}

//清空字符串中的空白字符
$A.clear_blank = function (str) {
    str = str.replace(/<\/?[^>]*>/gim, "");//去掉所有的html标记
    str = str.replace(/(^\s+)|(\s+$)/g, "");//去掉前后空格
    return str.replace(/\s/g, "");//去除文章中间空格
}


/**
 * 选择照片
 * @param type library(图片库)   camera(相机)  album(相册)
 * @param call_back(回调方法)
 * */
$A.choose_pic = function (type, call_back) {
    api.getPicture({
        sourceType: type ? type : 'camera',
        encodingType: 'jpg',
        mediaValue: 'pic',
        destinationType: 'url',
        allowEdit: true,
        quality: 80,
        targetWidth: 100,
        targetHeight: 100,
        saveToPhotoAlbum: false
    }, function (ret, err) {
        if (ret) {
            if (typeof(call_back) == 'function') {
                call_back(ret);
            }
        }
    });
}

//上传文件
$A.upload = function (params, fun) {
    $A.request('', params.values, fun, params.path);
}


//获取系统字典数据(应用打开的时候获取一次)
$A.get_dict = function (is_refresh) {
    if (is_refresh) {
        $A.request('sys_dict', {}, function (data) {
            $api.setStorage('dict', data);
        });
    }
    return $api.getStorage('dict');
}


$A.main_top = function () {
    var sysType = api.systemType, top = 0;
    if (sysType == 'ios') {
        top = 20;
    } else if (sysType == 'android') {
        var ver = api.systemVersion;
        ver = parseFloat(ver);
        top = 20;
        if (ver >= 4.4) {
            top = 25;
        }
    }
    return $('#header').height() + top;
}


$A.jpush = function () {
    /*if(!$api.getStorage('registration_id')){
     return;
     }*/
    var ajpush = api.require('ajpush');
    var ajpush_str = JSON.stringify(ajpush);
    if (!ajpush_str || ajpush_str.length == 4) {
        return;
    }
    //初始化jpush
    ajpush.init(function (ret) {
        if (ret && ret.status) {
            //$A.toast('jpush初始化成功' + JSON.stringify(ret));
            j_init();
        }
    });


    var j_init = function () {
        //消息推送
        ajpush.setListener(function (ret) {
            var extra = ret.extra;
            extra = $.parseJSON(extra);
            if (!extra.act) return;
            api.confirm({
                title: '溫馨提示',
                msg: ret.content,
                buttons: ['前去查看', '稍後處理']
            }, function (ret, err) {
                if (ret.buttonIndex == 2) {
                    return;
                }
                if (extra.act == 'order' && extra.id) {
                    $api.setStorage('order_id', extra.id);
                    if (api.winName == 'user') {
                        if (api.frameName == 'order_detail') {
                            //如果当前正处于订单详情的话
                            api.execScript({
                                name: 'user',
                                frameName: 'order_detail',
                                script: 'open_user();'
                            });
                        } else {
                            //如果当前正处于用户窗体的话,且没在订单详情
                            api.execScript({
                                name: 'user',
                                script: 'change_frame("order_detail");'
                            });
                        }
                    } else {
                        $api.setStorage('back_page', api.winName);
                        api.execScript({
                            name: 'root',
                            script: 'open_user(11);'
                        });
                    }
                }
            })

        });

        //应用到后台,提示jpush对象已经到后台
        api.addEventListener({
            name: 'pause'
        }, function (ret, err) {
            ajpush.onPause();
        });

        //设置iOS右上角数字
        /* ajpush.setBadge({
         badge : 1
         });*/

        //获取reguitID
        ajpush.getRegistrationId(function (ret) {
            //$A.toast('jpush注册ID:'+ret.id);
            $api.setStorage('registration_id', ret.id)
        });

    }
}


//base64Decode解码
$A.base64Decode = function (input) {
    var rv;
    rv = window.atob(input);
    rv = escape(rv);
    rv = decodeURIComponent(rv);
    return rv;
}

//base64Decode压缩
$A.base64Encode = function (input) {
    var rv;
    rv = encodeURIComponent(input);
    rv = unescape(rv);
    rv = window.btoa(rv);
    return rv;
}

/**
 * 倒计时插件
 * params.intDiff=76663;
 * params.obj=$('.countdown')
 * */
$A.cutdown_time = function (params) {
    var intDiff = params.intDiff
    window.setInterval(function () {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0;//时间默认值
        if (intDiff > 0) {
            day = Math.floor(intDiff / (60 * 60 * 24));
            hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        params.obj.find('.days_tag').html(day);
        params.obj.find('.hours_tag').html(hour);
        params.obj.find('.minutes_tag').html(minute);
        params.obj.find('.seconds_tag').html(second);
        intDiff--;
    }, 1000);
}


/**
 * 打电话
 * */
$A.call = function (mobi) {
    api.call({number: mobi});
}


$.fn.all_height = function () {
    if ($(this).size() == 0) {
        return
    }
    var top = ($(this).css('paddingTop').replace('px', '') - 0);
    var bottom = ($(this).css('paddingBottom').replace('px', '') - 0);
    var height = $(this).outerHeight() + top + bottom;
    return height;
}

$A.get_body_height = function () {
    var id = "get_body_height004654996611100";
    $('body').append('<div id="' + id + '" style="position: fixed; width: 100%; height: 100%; z-index: -1"></div>');
    return $('#' + id).height();
}


$A.charDemo = {}
$A.charDemo.rawData = [];
$A.charDemo.calculateMA = function (dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}


$A.timestampToTime = function (timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y + M + D + h + m + s;
}

$A.charDemo.splitData = function (rawData) {
    var categoryData = [];
    var values = []
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i])
    }
    return {
        categoryData: categoryData,
        values: values
    };
}


//设置【走势图】数据
$A.charDemo.set_data = function (rawData, dom) {
    var upColor = '#ec0000';
    var upBorderColor = '#8A0000';
    var downColor = '#00da3c';
    var downBorderColor = '#008F28';
    var myChart = echarts.init(dom);
    var data0 = this.splitData(rawData);


    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            // data: ['ETH']
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%'
        },
        xAxis: {
            type: 'category',
            data: data0.categoryData,
            scale: true,
            boundaryGap: false,
            axisLine: {onZero: false},
            splitLine: {show: false},
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
        },
        yAxis: {
            scale: true,
            splitArea: {
                show: true
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                y: '90%',
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                // name: 'ETH',
                type: 'candlestick',
                data: data0.values,
                itemStyle: {
                    normal: {
                        color: upColor,
                        color0: downColor,
                        borderColor: upBorderColor,
                        borderColor0: downBorderColor
                    }
                }
            }

        ]
    };

    myChart.setOption(option, true);
}


$A.frames = [
    // 首页
    {
        name: 'index',
        url: '../index/home.html',
        useWKWebView: true,
        is_reload: false,
        historyGestureEnabled: false,
    },
    // 交易首页
    {
        name: 'trade_index',
        url: '../trade/index.html',
        useWKWebView: true,
        is_reload: true,
        historyGestureEnabled: true,
    },
    // 交易图表
    {
        name: 'trade_chart',
        url: '../trade/chart.html',
        useWKWebView: true,
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 个人中心首页
        name: 'user_center_index',
        url: '../user_center/index.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 资金中心
        name: 'user_center_capital',
        url: '../user_center/capital.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 资金明细
        name: 'user_center_capital_detail',
        url: '../user_center/capital_detail.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 账单列表
        name: 'user_center_coin_order_list',
        url: '../user_center/coin_order_list.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 转入-记录
        name: 'user_center_transfer_in',
        url: '../user_center/transfer_in.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 转出-操作
        name: 'user_center_transfer_out',
        url: '../user_center/transfer_out.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 转入-记录
        name: 'user_center_transfer_in_record',
        url: '../user_center/transfer_in_record.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 转出-记录
        name: 'user_center_transfer_out_record',
        url: '../user_center/transfer_out_record.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 委托单
        name: 'user_center_entrust_list',
        url: '../user_center/entrust_list.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 我的推广信息
        name: 'user_center_my_spread',
        url: '../user_center/my_spread.html',
        is_reload: false,
        historyGestureEnabled: true,
    },
    {
        // 我的推广-记录
        name: 'user_center_my_spread_record',
        url: '../user_center/my_spread_record.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 关于我们
        name: 'user_center_about_us',
        url: '../user_center/about_us.html',
        is_reload: false,
        historyGestureEnabled: true,
    },
    {
        // 公告-列表
        name: 'user_center_notice_list',
        url: '../user_center/notice_list.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 公告-详情
        name: 'user_center_notice_detail',
        url: '../user_center/notice_detail.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 选择货币
        name: 'choose_trade_pairs',
        url: '../user_center/choose_trade_pairs.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 选择货币
        name: 'choose_currency',
        url: '../user_center/choose_currency.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 设置-主页
        name: 'user_setup_index',
        url: '../user_setup/index.html',
        is_reload: false,
        historyGestureEnabled: true,
    },
    {
        // 更改交易密码
        name: 'user_setup_change_trade_password',
        url: '../user_setup/change_trade_password.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 更改密码
        name: 'user_setup_change_password',
        url: '../user_setup/change_password.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 提交认证
        name: 'user_setup_auth_submit',
        url: '../user_setup/auth_submit.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 认证结果
        name: 'user_setup_auth_result',
        url: '../user_setup/auth_result.html',
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 登录
        name: 'login',
        url: $A.domname + '/wap/app/html/login.html?version=' + Math.random(),
        useWKWebView: true,
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 注册
        name: 'reguit',
        // url: '../public/reguit.html',
        url: $A.domname + '/wap/app/html/reguit_apicloud.html?version=' + Math.random(),
        useWKWebView: true,
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
        // 找回密码
        name: 'find_password',
        url: $A.domname + '/wap/app/html/find_password.html?version=' + Math.random(),
        // url: '../public/find_password.html',
        useWKWebView: true,
        is_reload: true,
        historyGestureEnabled: true,
    },
    {
      //otc交易页面
      name: 'otc_trade',
      url: '../trade/otc_trade.html',
      is_reload: true,
      historyGestureEnabled: true,
    },
    {
      //otc订单详情
      name: 'orderdetail',
      url: '../trade/orderdetail.html',
      is_reload: true,
      historyGestureEnabled: true,
    },
    {
      //otc订单列表
      name: 'orderList',
      url: '../trade/orderList.html',
      is_reload: true,
      historyGestureEnabled: true,
    }
]


// 打开frame组
$A.initGroup = function () {
    // var statusBar = api.require('statusBar');//未使用 暂时注释
    $api.setStorage('StatusBarHeight', api.safeArea.top)
    $api.setStorage('SafeAreaBottom', api.safeArea.bottom)
    //$A.alert('底部:'+api.safeArea.bottom)

    api.setStatusBarStyle({
        color: '#081734'
    });
    api.openFrameGroup({
        rect: {
            x: 0,
            w: 'auto',
            h: api.winHeight - api.safeArea.bottom
        },
        background: 'rgba(255,255,255,1.0)',
        name: 'home',
        scrollEnabled: false,
        index: 0,
        preload: 0,
        frames: $A.frames
    }, function (ret, err) {

    });
}

// 获取-状态栏高度
$A.getStatusHeight = function () {
    return Number($api.getStorage('StatusBarHeight'))
}

// 获取-底部栏高度
$A.getSafeAreaBottomHeight = function () {
    return Number($api.getStorage('SafeAreaBottom'))
}


// 获取frame的索引
$A.get_frame_index = function (frame) {
    var index = 0
    $.each($A.frames, function (i, obj) {
        if (obj.name === frame) {
            index = i
        }
    })
    return index
}


$A.add_history = function (page) {
    var list = $api.getStorage('page_history')
    if (typeof list === 'undefined') {
        list = []
    } else {
        if (page.length === 0) {
            return
        }
        list.push(page)
        //$A.toast('历史记录增加后:'+JSON.stringify(list))
        $api.setStorage('page_history', list)
    }
}

// 获取frame的索引
$A.change_frame = function (frame, from) {
    var index = 0

    $api.setStorage('from_page', api.frameName)
    $api.setStorage('curr_page', frame)

    if (from !== false) {
        var p = api.frameName
        $A.add_history(p)
    }


    if (frame === 'index' || frame === 'index' || frame === 'trade_index' || frame === 'user_center_index') {
        $api.setStorage('page_history', [])
    }

    // 执行页面刷新操作
    $.each($A.frames, function (i, obj) {
        if (obj.name === frame) {
            index = i
        }
    })

    var curr_page = $A.frames[index]

    if (curr_page.is_reload === true) {
        api.sendEvent({
            name: frame + '_reflush',
        });
    }

    // $A.alert('返回页面为:'+JSON.stringify(curr_page))

    api.setFrameGroupIndex({
        name: 'home',
        index: index
    });
}

$A.copy = function (text) {
    var clipBoard = api.require('clipBoard');
    clipBoard.set({
        value: text
    }, function (ret, err) {
        if (ret) {
            $A.toast('復制成功')
        } else {
            $A.toast('復制失敗,請重試')
        }
    });
}


// 选择货币
$A.choose_currency = function (type) {
    $api.setStorage('choose_currency_type', type)
    $A.change_frame('choose_currency')
}

// 选择交易对数据
$A.choose_trade_pairs = function (type, from) {
    if (from) {
        $api.setStorage('choose_trade_pairs_type_from', from)
    }
    $api.setStorage('choose_trade_pairs_type', type)
    $A.change_frame('choose_trade_pairs')
}


// 设置-交易对阿虎局
$A.set_trade_pairs_data = function (data) {
    $api.setStorage('trade_pairs_data', data)
}

// 获取-设置交易对数据
$A.get_trade_pairs_data = function () {
    return $api.getStorage('trade_pairs_data')
}


$A.text_input = function (callback) {
    //$A.alert('frameName'+api.frameName)
    //$A.alert('调用打开')
    $A.inputField = api.require('inputField');
    $A.inputField.open({
        bgColor: '#EEEEEE',
        lineColor: '#AAAAAA',
        fileBgColor: '#FFFFFF',
        borderColor: '#888888',
        autoFocus: true,
        leftBtn: {
            bg: '#EEEEEE',           //字符串类型；左边按钮常态背景色
            bgHighlight: '#EEEEEE',  //字符串类型；右边按钮点击时的高亮背景色
            title: '單價',         //字符串类型；左边按钮的标题
            titleSize: 15,        //数字类型；左边按钮的标题字体大小
            titleColor: '#333333',   //字符串类型；左边按钮标题文字颜色
            corner: 5,             //数字类型；左边按钮圆角大小
            leftW: 40,              //数字类型；左边按钮的宽
            leftH: 30,              //数字类型；左边按钮的高
        },
        sendBtn: {
            bg: '#EEEEEE',          //字符串类型；发送按钮常态背景色
            inputBg: '#F1F1F1',      //(可选项)字符串类型；当输入文字发时送按钮的背景色；默认：bg的色值
            bgHighlight: '#55555', //字符串类型；发送按钮点击时的高亮背景色
            title: '確認',        //字符串类型；发送按钮的标题
            titleSize: 15,    //数字类型；发送按钮的标题字体大小
            titleColor: '#333333',  //字符串类型；发送按钮标题文字颜色
            corner: 5,            //数字类型；发送按钮圆角大小
            sendW: 40,             //数字类型；发送按钮的宽，本参数暂仅支持iOS平台
            sendH: 30,             //数字类型；发送按钮的高，本参数暂仅支持iOS平台
            marginRight: 10       //数字类型；发送按钮距离屏幕右边的距离，本参数暂仅支持iOS平台；默认：10
        },
        //fixedOn: api.frameName
    }, function (ret, err) {
        if (ret && ret.msg.length > 0) {
            $A.inputField.close()
            callback(ret.msg)
        }
    });

    $A.inputField.setInputFieldListener(function (ret, err) {
        if (ret) {
            if (ret.chatViewH === 0) {
                $A.inputField.close()
            }
        }
    });
}


// 是否为安卓
$A.isAndroid=function () {
    return  (/android/gi).test(navigator.appVersion);
}
