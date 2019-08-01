var old_password=$('#old_password')
var password=$('#password')
var new_password=$('#new_password')

function submit() {
    if (old_password.val().length<6){
        $A.toast('密碼長度必須大於6位')
        old_password.focus()
        return true
    }
    if (password.val().length<6){
        $A.toast('新密碼-長度必須大於6位')
        password.focus()
        return true
    }
    if (new_password.val().length<6){
        $A.toast('確認密碼-長度必須大於6位')
        new_password.focus()
        return true
    }else{
        if(password.val()!=new_password.val()){
            $A.toast('確認密碼和新密碼-不壹致')
            return true
        }
    }
    var params = {
        old_pwd:old_password.val(),
        new_pwd:password.val(),
    }
    $A.request('user/change_pwd',params,function () {
        $A.toast('密碼更改成功!')
        $A.change_frame('user_setup_index')
    })
}


$('#app').height($A.get_body_height())
