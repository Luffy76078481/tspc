export const regs = {
    usernameReg: '^[A-Za-z0-9]{4,10}$',
    usernameRegLong: '^[A-Za-z0-9]{4,16}$',
    passwordReg: '^[A-Za-z0-9]{6,12}$',
    moneyPasswordReg: '^[A-Za-z0-9]{6,20}$',
    verifyReg: '^[A-Za-z0-9]{4}$',
    popularizeReg: '^[A-Za-z0-9]{10}$',
    emailReg: '/^(([^<>()\[\]\\.,,:\s@"]+(\.[^<>()\[\]\\.,,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/',
    emailVerifyCodeReg: '^[0-9]{4}$',
    moneyReg: '^[0-9]{1,8}$',
    moneyReg2: '/^[0-9]{1,8}(\.[0-9]{1,2})?$/',
    moneyReg3: '/^\d{6,}$/',
    phoneNumberReg: '^[0-9]{11}$',
    phoneReg: '^((13[0-9])|(15[^4])|(18[0-9])|(17[0-8])|(147)|(145)|(198)|(166)|(199))\\d{8}$',
    recallNumberReg: '^[0-9]{7,12}$',
    realNameReg: '',
    chineseNameReg: '/(?!.*先生.*|.*小姐.*|.*男士.*|.*女士.*|.*太太.*)^([\u4e00-\u9fa5\ ]{2,4})$/',
    QQReg: '/^[1-9]\d{4,10}$/',
    WeChatReg: '/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/',
    bankCardReg: '^[0-9]{16,19}$',
    chineseReg: '/[\u4E00-\u9FA5\uF900-\uFA2D]/',   //匹配中文字符
    birthdayReg: '^[0-9]{4}[\-][0-9]{2}[\-][0-9]{2}',  //匹配生日  例如：1990-01-01
    firstSpace: '/([^\s]+)\s.*/',   //截取第一个空格之前的内容
};