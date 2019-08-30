apiready = function () {
    $A.setStorage('FrameGroupName', '')
    $A.setStorage('FrameGroupIndex', '')

    // 初始化frame组
    $A.initGroup()

    // 版本更新提醒
    // $A.check_version(true)

    api.addEventListener({
        name: 'user_login_success'
    }, function(ret, err) {
        //$A.alert('接收到的token是:'+ret.value.token)
        $A.setStorage('token',ret.value.token);
        $A.setStorage('username',ret.value.username);
        $api.setStorage('token',ret.value.token);
    });

    if ($A.isAndroid()) {
        //绑定安卓的后退按钮事件 两秒内后退按钮点击两次 退到后台运行
        api.addEventListener({
            name: 'keyback'
        }, function (ret, err) {
            var p = $A.getStorage('curr_page')
            var list = $api.getStorage('page_history')
            if (p === '' || p === 'index' || p === 'trade_index'|| p === 'user_center_capital' || p === 'user_center_index' || typeof list === 'undefined') {
                api.closeWin();
            } else {
                if (list.length === 0) {
                    //$A.change_frame()
                } else {
                    var before_frame = list[list.length - 1]
                    list = list.splice(list.length - 2, 1)
                    $api.setStorage('page_history', list)
                    $A.change_frame(before_frame, false)
                }
            }
        });
    }

}
