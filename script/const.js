var image_load_error = '../../images/image_load_error.jpg'
var idcardauth_arr = [
    '未提交認證信息',
    '認證通過',
    '認證未通過',
    '待系統處理',
]
var idcardauth_class_arr=[
    'status_0',
    'status_1',
    'status_2',
    'status_3',
]
var reference_name = 'CNY'
/**
 * 浮点运算修复异常
 * @param n
 * @return {number}
 * @constructor
 */
var Fixed = function (n) {
    n -= 0
    n = n.toFixed(6)
    return n - 0
}

/**
 * 数字转为双位: 1 => 01    2 => 02
 * @param n
 * @return {*}
 * @constructor
 */
var ToDouble = function (n) {
    n = Fixed(n)
    n += ''
    var arr = n.split('.')
    if (typeof arr[1] === 'undefined') {
        if (n > 0) {
            return n + '.00'
        } else {
            return '0'
        }

    } else {
        if (arr[1].length === 1) {
            return n + '0'
        } else {
            return n
        }
    }
}
