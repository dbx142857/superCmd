function md5(string) {
    function md5_RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function md5_AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function md5_F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function md5_G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function md5_H(x, y, z) {
        return (x ^ y ^ z);
    }

    function md5_I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function md5_FF(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_GG(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_HH(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_II(a, b, c, d, x, s, ac) {
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    function md5_WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };
    function md5_Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = md5_Utf8Encode(string);
    x = md5_ConvertToWordArray(string);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = md5_AddUnsigned(a, AA);
        b = md5_AddUnsigned(b, BB);
        c = md5_AddUnsigned(c, CC);
        d = md5_AddUnsigned(d, DD);
    }
    return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
}


$(function () {

    var lib = {
        tpl: function (options) {
            options = $.extend({
                left_split: "{{",
                right_split: "}}",
                tpl: "",
                data: null
            }, options);
            if (options.data == null) {
                return options.tpl;
            } else {
                var reg = new RegExp(options.left_split + "(.+?)" + options.right_split, "gi");
                var strs = options.tpl.match(reg), tpl = options.tpl;
                for (var i = 0; i < strs.length; i++) {
                    var str = strs[i];
                    strs[i] = str.substring(options.left_split.length, str.length - (options.right_split.length));
                    tpl = tpl.replace(str, str.indexOf(".") == -1 ? (options.data[strs[i]] || '') : (this.getDataByModel(options.data, strs[i])) || '');
                }
                return tpl;
            }
        },
        //以下为增强数据模型的获取，修改和找寻目标scope的方法
        getDataByModel: function ($scope, modelStr, otherWiseVal) {
            otherWiseVal = otherWiseVal || null;
            var arr = modelStr.split('.'), len = arr.length, result = $scope;
            if (len === 1) {
                return $scope[arr[0]];
            } else if (len > 1) {
                var isError = false;
                for (var i in arr) {
                    if (typeof(result[arr[i]]) === 'undefined') {
                        isError = true;
                        break;
                    } else {
                        result = result[arr[i]];
                    }
                }
                if (isError) {
                    return otherWiseVal;
                } else {
                    return result;
                }
            } else if (len === 0) {
                return otherWiseVal;
            }
        },
        //冒泡排序
        bubbleSort: function (arr) {
            for (var i = 0; i < arr.length; i++) {
                //内层循环，找到第i大的元素，并将其和第i个元素交换
                for (var j = i; j < arr.length; j++) {
                    if (arr[i] > arr[j]) {
                        //交换两个元素的位置
                        var temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
        },
        //翻转map结构的key和value
        reverseMap: function (map) {
            var res = {};
            for (var i in map) {
                res[map[i] + ''] = i + '';
            }
            return res;
        },
        createRange: function (start, end) {
            var arr = [];
            for (var i = start; i <= end; i++) {
                arr.push(i);
            }
            return arr;
        },
        countMap: function (map, condition) {
            var arr = condition.split('=');
            if (arr.length !== 2) {
                throw '条件有误';
            } else {
                var count = 0;
                for (var i in map) {
                    var item = map[i];
                    if (item[arr[0]] === arr[1]) {
                        count++;
                    }
                }
                return count;
            }
        },
        selectMap: function (map, condition) {
            var arr = condition.split('=');
            if (arr.length !== 2) {
                throw '条件有误';
            } else {
                var newMap = {};
                for (var i in map) {
                    var item = map[i];
                    if (item[arr[0]] === arr[1]) {
                        newMap[i] = map[i];
                    }
                }
                return newMap;
            }
        },
        setArrEleCount2Map: function (numArr) {
            var countMap = {};
            for (var i in numArr) {
                if (countMap[numArr[i]]) {
                    countMap[numArr[i]] = countMap[numArr[i]] + 1;
                } else {
                    countMap[numArr[i]] = 1;
                }
            }
            return countMap;
        },
        //从array aRemainCards中按一对一减去array aSentCards中的元素并返回一个新数组
        arrSubtraction: function (aRemainCards, aSentCards) {
            var countMapRemain = lib.setArrEleCount2Map(aRemainCards),
                countMapSent = lib.setArrEleCount2Map(aSentCards);
            for (var i in countMapRemain) {
                if (typeof countMapSent[i] !== 'undefined') {
                    countMapRemain[i] -= countMapSent[i];
                }

            }

            var s = '';
            for (var i in countMapRemain) {
                for (var j = 0; j < countMapRemain[i]; j++) {
                    s += i;
                }
            }
            return s.split('');
        },
        arrEle2String: function (arr) {
            for (var i in arr) {
                arr[i] = '' + arr[i];
            }
        },
        isArrBInArrA: function (arrB, arrA) {

            lib.arrEle2String(arrB);
            lib.arrEle2String(arrA);
            var result = true;

            var countMapB = lib.setArrEleCount2Map(arrB), countMapA = lib.setArrEleCount2Map(arrA);
            for (var i in countMapB) {
                if ((arrA.indexOf('' + i) === -1) || (arrA.indexOf(i) !== -1 && countMapA[i] < countMapB[i])) {
                    result = false;
                    break;
                }
            }


            return result;
        }
    }
    window.lib = lib;

    var chat_server = 'http://' + location.hostname + ':3000';
    var socket = io.connect(chat_server);


    function xipai(inputArr) {
        var valArr = [], k = '';

        for (k in inputArr) { // Get key and value arrays
            if (inputArr.hasOwnProperty(k)) {
                valArr.push(inputArr[k]);
            }
        }
        valArr.sort(function () {
            return 0.5 - Math.random();
        });

        return valArr;

    }

    var cardMap = {
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "t": 10,
        "j": 11,
        "q": 12,
        "k": 13,
        "1": 14,
        "2": 15,
        "z": 16,
        "Z": 17
    }
    var reverseMap = lib.reverseMap(cardMap);

    function getCardByRange(start, end, count) {
        count = count || 1;
        var result = '';
        for (var i = start; i <= end; i++) {
            var v = reverseMap['' + i]
            //for(var j=0;j<count;j++){
            if (result.length < 20) {
                for (var j = 0; j < count; j++) {
                    result += v;
                }

            }

            //}

        }
        return result;
    }

    //除了飞机之外的所有情况的字典集合
    //var //count1++=2,count2=0;
    var allSituationExceptPlane = (function () {

        //首先列举所有的王炸
        var map = {
            'zZ': {
                value: 'zZ',
                type: 'wang_zha'
                //,
                //value:'zZ'
            },
            'Zz': {
                value: 'Zz',
                type: 'wang_zha'
                //,
                //value:'Zz'
            }
        };

        //var index=2;


        //列举所有的单
        for (var i in cardMap) {
            map['' + i] = {
                value: '' + i,
                type: 'dan',
                //value:i,
                zIndex: cardMap[i],//真实的大小
            }
            //count1++++;
            //index++;
        }


        //列举所有的对,不含王炸
        for (var i in cardMap) {
            if (i !== 'z' && i !== 'Z') {

                map[i + '' + i] = {
                    value: i + '' + i,
                    type: 'dui',
                    //value:i+''+i,
                    zIndex: cardMap[i],//真实的大小
                }
                //count1++++;
                //index++;
            }


        }

        //列举所有三不带的可能性
        for (var i in cardMap) {
            if (i !== 'z' && i !== 'Z') {

                map[i + '' + i + '' + i] = {
                    value: i + '' + i + '' + i,
                    type: 'san_bu_dai',
                    //value:i+''+i+''+i,
                    zIndex: cardMap[i],//真实的大小
                }
                //count1++++;
                //index++;
            }


        }


        //列举所有炸弹不含王炸的可能性
        for (var i in cardMap) {
            if (i !== 'z' && i !== 'Z') {

                map[i + '' + i + '' + i + '' + i] = {
                    value: i + '' + i + '' + i + '' + i,
                    type: 'zha_dan',
                    //value:i+''+i+''+i+''+i,
                    zIndex: cardMap[i],//真实的大小
                }
                //count1++++;
                //index++;
            }


        }


        //列举所有单张顺子的可能性:
        for (var i = 3; i <= 12; i++) {
            for (var step = 4; step < 15 - i; step++) {
                var val = getCardByRange(i, i + step);
                map[val] = {

                    type: 'dan_shun',
                    value: val,
                    step: step,
                    min: i
                    //,
                    //max:step+i
                }
                //count1++++;
                //index++;
            }
        }


        //列举所有连对的可能性:
        for (var i = 3; i <= 12; i++) {
            for (var step = 2; step < 15 - i; step++) {
                var val = getCardByRange(i, i + step, 2);
                if (step * 2 > 18) {
                    continue;
                }
                map[val] = {
                    type: 'lian_dui',
                    value: val,
                    step: step,
                    min: i,
                    //max:step+i
                }
                //count1++++;
                //index++;
            }
        }


        //列举所有三带一的可能性
        for (var i in cardMap) {
            if (i !== 'z' && i !== 'Z') {
                var danArr = [];
                for (var j in cardMap) {
                    if (j !== i) {
                        danArr.push(j);
                    }
                }

                for (var k in danArr) {
                    var dan = danArr[k];

                    map[i + '' + i + '' + i + '' + dan] = {
                        type: 'san_dai_yi',
                        value: i + '' + i + '' + i + '' + dan,
                        zIndex: cardMap[i],//真实的大小
                    }
                    //count1++++;


                    //index++;

                }


            }
        }


        //列举所有三代二的可能性
        for (var i in cardMap) {
            if (i !== 'z' && i !== 'Z') {
                var danArr = [];
                for (var j in cardMap) {
                    if (j !== i) {
                        danArr.push(j);
                    }
                }

                for (var k in danArr) {
                    var dan = danArr[k];
                    if (dan !== 'z' && dan !== 'Z') {
                        map[i + '' + i + '' + i + '' + dan + '' + dan] = {
                            type: 'san_dai_er',
                            value: i + '' + i + '' + i + '' + dan + '' + dan,
                            zIndex: cardMap[i],//真实的大小
                        }
                        //count1++++;
                        //index++;
                    }


                }


            }
        }

        //列举所有四带二的可能性
        for (var i in cardMap) {
            if (i !== 'z' && i !== 'Z') {

                var danArr = [];
                for (var j in cardMap) {
                    if (j !== i) {
                        danArr.push(j);
                    }
                }

                for (var k in danArr) {
                    var dan = danArr[k];

                    if (['zz', 'ZZ'].indexOf('' + dan + dan) === -1) {
                        map['' + i + i + i + i + (dan + dan)] = {
                            type: 'si_dai_er',
                            value: i + '' + i + '' + i + '' + dan,
                            zIndex: cardMap[i],//真实的大小
                        }
                        //count1++++;
                        //index++;
                    }

                    for (var p in cardMap) {
                        if ((cardMap[p] > cardMap[dan]) && (['zZ', 'Zz'].indexOf('' + dan + p) === -1)) {
                            map['' + i + i + i + i + (dan + p)] = {
                                type: 'si_dai_er',
                                value: '' + i + i + i + i + (dan + p),
                                zIndex: cardMap[i],//真实的大小
                            }
                            //count1++++;
                            //index++;
                        }

                    }


                }
            }


        }


        //不列举所有飞机的可能性,因为飞机的组合太多了，另外检查


        return map;
    })();
    console.log('allSituationExceptPlane is:', allSituationExceptPlane);
    var statusMap = {
        'NOT_BEGIN': 'not_begin',//游戏未开始
        'FA_PAI': 'fa_pai',//该发牌了
        'YAO_DI_ZHU': 'YAO_DI_ZHU',//要地主
        'CHU_PAI': 'chu_pai',//轮到某个玩家出牌了
        'END': 'end'
    }
    var getPlaneMsg = function (p) {
        var isValid = true, arr = p.split(''), numArr = [], msg = false;
        for (var i in arr) {
            if (cardMap[arr[i]]) {
                numArr.push(cardMap[arr[i]]);
            } else {
                o.error(o.nicknameList[o.playerIndex] + '出的牌里包含[' + arr[i] + ']这个字符，怎么这么二逼呢，这肯定是不合法的');
                isValid = false;
                break;
            }
        }
        if (isValid === false) {
            return false;
        } else {
            var countMap = lib.setArrEleCount2Map(numArr);


            var countMapSortByCount = {};
            for (var i in countMap) {
                if (!countMapSortByCount[countMap[i]]) {
                    countMapSortByCount[countMap[i]] = [parseInt(i, 10)];
                } else {
                    countMapSortByCount[countMap[i]].push(parseInt(i, 10));
                }
            }
            if (countMapSortByCount['4']) {
                o.error(o.nicknameList[o.playerIndex] + '出的牌是不合法[lg3-at-planeMode]');
            } else if (!countMapSortByCount['3']) {
                o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[sg3-at-planeMode]');
            }
            else {
                var threeArr = countMapSortByCount['3'];
                lib.bubbleSort(threeArr);
                var len = threeArr.length;
                if (threeArr[len - 1] - threeArr[0] + 1 !== len) {
                    o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[max reduce min not equal to step length]');
                } else {
                    var danArr = [];
                    for (var i in numArr) {
                        var n = numArr[i];
                        if (threeArr.indexOf(n) === -1) {
                            danArr.push(n);
                        }
                    }
                    if (danArr.length !== threeArr.length) {
                        o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[step not equal 2 singleCard length]');
                    } else {
                        var wangCount = 0;
                        for (var i in danArr) {
                            if ([16, 17].indexOf(danArr[i]) !== -1) {
                                wangCount++;
                            }
                        }
                        if (wangCount > 1) {
                            o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[more than 2 king]');
                        } else {
                            var step = threeArr[threeArr.length - 1] - threeArr[0];
                            if (step < 1) {
                                o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[step less than 2]');
                            }
                            else {
                                msg = {
                                    value: p,
                                    type: 'fei_ji',
                                    min: parseInt(threeArr[0], 10),
                                    step: step
                                }
                            }


                        }
                    }
                }
            }
            return msg;
        }

    }


    var o = window.aaa = {
        $underscore: $('#underscore'),
        $container: $('#container'),
        $msg: $('#message'),
        $tmpMsg: $('#tmpMsg'),
        $body: $(".body").first(),


        //这一块儿为游戏相关信息
        md5pwd: 'a420384997c8a1a93d5a84046117c2aa',//管理员命令密码
        lastWUDIer: null,//上一次出没有任何人能要的起的牌的那个人
        status: null,//记录游戏进行到的时刻，从statusMap中可以看出
        score: {},//得分管理系统
        nicknameList: [],//所有进入该控制台的人员昵称集合
        cardInfo: {},//前三个加入的斗地主的玩家的所有信息
        banker: null,//庄家，第一次随机到的庄家负责发牌，要地主的时候通过循环改变banker询问每个玩家是否要地主
        isFinalBankerConfirmed: false,//最终的地主是否确定
        firstQDZer: null,//第一个输入完成抢地主命令的人的昵称
        lastCardMsg: null,//上家出的牌的信息
        bl: 1,//倍率,没相逢1个炸弹乘以2

        playerIndex: null,//当前需要出牌的玩家索引，下标从0开始
        isBegin: false,//斗地主游戏是否开始
        lastWinnerIndex: null,//上一局的赢家

        nickname: null,//当前玩家昵称
        pre: 'c:\\Users\\USER>',//最新命令前的占位符
        isExecuteEverCmd: false,//是否是执行曾经执行过的命令
        cmds: [],//曾经执行过的所有命令都存放在这儿
        cmd_index: 0,//当前执行的命令的索引，每执行一次增加1，可用于上下箭头的命令更换
        totalMsg: '',//总消息
        lastMsg: '',//上一次回车键按下之前的总消息
        tmpMsg: '',
        lastCmd: '',//上一次执行的命令

        //广播修改属性
        broadcastModifyProp: function (k, v) {

            socket.emit('broadcastModifyProp', k, v);
        },
        fapai: function (options) {


            if (o.isBegin === false) {
                o.error('游戏没开始，无权发牌哦');
                return false;
            }
            if (o.nickname !== o.banker) {
                o.error('你不是庄家，无权发牌哦');
                return false;
            }


            var cards = '111122223333444455556666777788889999ttttjjjjqqqqkkkkzZ'.split('');
            if (options.p && md5(options.p) === o.md5pwd && options.me && lib.isArrBInArrA(options.me.split(''), cards)) {
                cards = lib.arrSubtraction(cards, options.me.split(''));
            }


            cards = xipai(cards);
            o.cardInfo[o.nicknameList[0]] = {
                initialCards: cards.slice(0, 17),//被发到的牌
                remainCards: cards.slice(0, 17),//剩余的牌
                sentCards: []//已经发出去的牌
            };
            o.cardInfo[o.nicknameList[1]] = {
                initialCards: cards.slice(17, 34),//被发到的牌
                remainCards: cards.slice(17, 34),//剩余的牌
                sentCards: []//已经发出去的牌
            };
            o.cardInfo[o.nicknameList[2]] = {
                initialCards: cards.slice(34, 51),//被发到的牌
                remainCards: cards.slice(34, 51),//剩余的牌
                sentCards: []//已经发出去的牌
            };

            if (options.p && md5(options.p) === o.md5pwd && options.me && lib.isArrBInArrA(options.me.split(''), cards.concat(options.me.split('')))) {

                console.log("hello world");
                o.cardInfo[o.banker].initialCards = o.zhengpai(o.cardInfo[o.banker].initialCards.concat(options.me.split('')));
                o.cardInfo[o.banker].remainCards = o.zhengpai(o.cardInfo[o.banker].remainCards.concat(options.me.split('')));
            }


            o.cardInfo.dipai = cards.slice(51);
            socket.emit('read_card_info', o.cardInfo);
            socket.emit('send_message', '发牌完毕,翻开的牌是:' + (o.cardInfo[o.banker].initialCards[Math.floor(Math.random() * 17)]) + '请按[wdp]显示您的牌', null, false);
            o.broadcastModifyProp('status', statusMap['YAO_DI_ZHU'])


        },
        chupai: function (options) {


            if (!options.p) {
                o.error('缺少-p命令');
                return false;
            }
            if (o.nicknameList.indexOf(o.nickname) !== o.playerIndex) {
                o.error('@' + o.nickname + ',都没轮到你出牌，你出个蛋蛋啊');
            } else {
                o.broadcastInvokeFun('broadcastChupai', [options.p, o.nickname]);
            }

        },
        //计算剩余的牌
        calculateRemainCards: function (aSentCards, aRemainCards) {

            return o.zhengpai(lib.arrSubtraction(aRemainCards, aSentCards))


            //return o.zhengpai(s.split(''));
        },
        broadcastChupai: function (p, nickname) {

            if (o.lastWUDIer === nickname) {
                o.lastWUDIer = null;
                o.buYaoPai(null);//清空不要牌的计数器
            }


            if (o.status !== statusMap.CHU_PAI) {
                o.error('@' + nickname + ',都没到出牌阶段，你出个蛋蛋啊', false);
                return false;
            }


            var obj = o.cardInfo[nickname];
            if (obj.remainCards.join('').trim() === '') {
                o.error('@' + nickname + ',牌都出完了，你赢了，你出个蛋蛋啊', false);
                return false;
            }
            //判断出的牌是否在出牌的人剩余的牌的数组里
            if (lib.isArrBInArrA(p.split(''), obj.remainCards)) {
                var nextIndex = o.getNextPlayerIndex(o.playerIndex);
                var isValid = null;//出的牌是否合法
                var pMsg;
                var currentCardMsg = null;
                if (pMsg = allSituationExceptPlane['' + p]) {
                    isValid = true;
                    currentCardMsg = pMsg;
                } else {
                    var planeMsg = getPlaneMsg(p);
                    if (planeMsg === false) {
                        isValid = false;
                    } else {
                        isValid = true;
                        currentCardMsg = planeMsg;
                    }


                }
                if (isValid === true) {
                    ////var obj= o.cardInfo[nickname];
                    ////判断出的牌是否在出牌的人剩余的牌的数组里
                    //if(lib.isArrBInArrA(p.split(''),obj.remainCards)){


                    var isBigerThanLast = o.compareCardZindex(currentCardMsg);//是否比上家的牌大


                    if (isBigerThanLast === true) {

                        var isRight = true;
                        if (currentCardMsg.type === 'san_bu_dai' && obj.remainCards.join('').trim() !== '') {
                            isRight = false;
                            o.error('@[' + nickname + ']出的牌[' + p + ']是三不带，你现在手里还有牌不能出三不带，出牌失败，请重新出牌，不要的话输入[n] pass掉', false);
                        }
                        if (isRight === true) {

                            if (currentCardMsg.type === 'wang_zha' || currentCardMsg.type === 'zha_dan') {
                                o.bl *= 2;
                            }


                            o.lastCardMsg = currentCardMsg;
                            o.lastWUDIer = null;
                            o.buYaoPai(null);//清空不要牌的计数器
                            o.notify('[' + nickname + ']出的牌是:[' + p + '],请[' + o.nicknameList[nextIndex] + ']决定是否要牌,要输入【cp -p 牌】的命令压倒它，不要的话输入[n] pass掉', false, true);

                            var _nickname = o.nicknameList[nextIndex];
                            if (_nickname === o.nickname) {
                                o.notifyWDP();
                                //o.notify('你的牌是' + o.zhengpai(o.cardInfo[o.nickname].remainCards).join(','), false);
                            }

                            //计算出牌的人手中剩余的牌

                            //添加已经出的牌到sentCards中
                            obj.remainCards = o.calculateRemainCards(p.split(''), obj.remainCards);
                            obj.sentCards = obj.sentCards.concat(p.split(''));
                            obj.sentCards = o.zhengpai(obj.sentCards);
                            o.playerIndex = nextIndex;


                            var remainLen = obj.remainCards.join('').trim().length
                            if (remainLen < 3) {
                                o.error('警告：' + nickname + '的牌只剩下' + remainLen + '张了!', false);
                            }


                        }
                        //obj.remainCards.join('').trim()===''


                    } else {
                        o.error('@[' + nickname + ']出的牌[' + p + ']都没法大过上家，出牌失败，请重新出牌，不要的话输入[n] pass掉');
                        return false;
                    }


                    if (obj.remainCards.join('').trim() === '') {
                        o.notify('@' + nickname + (o.banker === nickname ? '地主' : '农民') + ',恭喜你获胜！！！');
                        o.lastWinnerIndex = o.nicknameList.indexOf(nickname);


                        if (o.banker === nickname) {

                            o.score[o.banker] += (2 * o.bl);
                            var arr = o.nicknameList.slice(0, 3);
                            for (var i in arr) {
                                if (arr[i] !== o.banker) {
                                    o.score[arr[i]] -= (1 * o.bl);
                                }
                            }
                        }
                        else {
                            o.score[o.banker] -= (2 * o.bl);
                            o.score[nickname] += (1 * o.bl);
                            o.score[o.getAnotherFarmerNickname(nickname)] += (1 * o.bl);
                        }

                        localStorage.setItem('score', JSON.stringify(o.score));


                        o.status = statusMap.END;
                        o.viewScore();
                        o.notify([
                            '--------------',
                            ['已经出了的牌是:',
                                o.nicknameList[0] + '剩下的牌是:' + o.cardInfo[o.nicknameList[0]].remainCards.join(','),
                                o.nicknameList[1] + '剩下的牌是:' + o.cardInfo[o.nicknameList[1]].remainCards.join(','),
                                o.nicknameList[2] + '剩下的牌是:' + o.cardInfo[o.nicknameList[2]].remainCards.join(','),
                                '已经出了的所有的牌是:' + o.getRemainCards()].join(','),

                            '---------------'
                        ])

                        o.endGame();
                    }


                }
            } else {

                o.error('@[' + nickname + ']出的牌[' + p + ']都不在他手中已有的牌里面，出牌失败，请重新出牌，不要的话输入[n] pass掉');
            }


        },
        //不要上家的牌
        buYaoPai: (function () {
            //连续两次不要牌的话就清楚上一次出牌信息
            var count = 0;
            return function (nickname) {
                if (nickname === null) {
                    count = 0;
                    return false;
                }

                var nextIndex = o.getNextPlayerIndex(o.playerIndex);

                if (o.playerIndex !== o.nicknameList.indexOf(nickname)) {
                    o.error('@[' + nickname + ']没轮到你出牌，你出个毛啊');
                }
                else if (o.lastWUDIer === nickname) {
                    //count=0;
                    o.error('@[' + nickname + '],你刚刚已经无敌了，请务必要出一张牌');

                }
                else if (o.lastCardMsg === null) {
                    //count=0;
                    o.error('@[' + nickname + '],你是第一个出牌的人，或者没有人能压得过你的牌，所以请务必要出一张牌');

                }
                else {
                    if (o.lastWUDIer !== null) {
                        count++;
                    } else {
                        if (o.lastCardMsg !== null) {
                            count++;
                        }
                    }

                    if (count === 2) {
                        o.lastWUDIer = o.nicknameList[nextIndex];
                        o.lastCardMsg = null;
                        count = 0;
                        o.notify('大家都要不起上家的牌,请[' + o.nicknameList[nextIndex] + ']继续出牌');
                        var _nickname = o.nicknameList[nextIndex];
                        if (_nickname === o.nickname) {
                            o.notifyWDP();

                        }
                    }
                    else {
                        o.notify('[' + nickname + ']要不起上家的牌,请[' + o.nicknameList[nextIndex] + ']决定是否要牌,要输入【cp -p 牌】的命令压倒它，不要的话输入[n] pass掉');
                        var _nickname = o.nicknameList[nextIndex];
                        if (_nickname === o.nickname) {
                            o.notifyWDP();
                        }
                    }
                    o.playerIndex = nextIndex;

                }


            }
        })(),
        notifyWDP: function () {
            o.notify('你的牌是[<em style="color:green;">' + o.zhengpai(o.cardInfo[o.nickname].remainCards).join(',') + '</em>]');
        },
        viewScore: function () {
            o.notify([
                '--------------',
                ['现在的得分情况是:',
                    o.nicknameList[0] + '总得分:' + o.score[o.nicknameList[0]] + '分',
                    o.nicknameList[1] + '总得分:' + o.score[o.nicknameList[1]] + '分',
                    o.nicknameList[2] + '总得分:' + o.score[o.nicknameList[2]] + '分'].join(','),
                '---------------'
            ]);
        },
        //获取另一位 农民的昵称
        getAnotherFarmerNickname: function (farmer) {
            var anotherFarmer;
            for (var i in o.nicknameList) {
                var item = o.nicknameList[i];
                if (item !== o.banker && item !== farmer) {
                    anotherFarmer = item;
                    break;
                }
            }
            return anotherFarmer;
        },
        compareCardZindex: function (oCur) {
            var oLast = o.lastCardMsg;
            var isBigerThanLast = true;

            if (o.lastCardMsg !== null) {
                switch (oLast.type) {
                    case 'dan':
                    {
                        isBigerThanLast = oCur.type === 'dan' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    case 'dui':
                    {
                        isBigerThanLast = oCur.type === 'dui' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    case 'san_bu_dai':
                    {
                        isBigerThanLast = oCur.type === 'san_bu_dai' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    case 'zha_dan':
                    {
                        isBigerThanLast = oCur.type === 'zha_dan' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    case 'dan_shun':
                    {
                        isBigerThanLast = oCur.type === 'dan_shun' && oCur.min > oLast.min && oCur.step === oLast.step;
                        break;
                    }
                    case 'lian_dui':
                    {
                        isBigerThanLast = oCur.type === 'lian_dui' && oCur.min > oLast.min && oCur.step === oLast.step;
                        break;
                    }
                    case 'san_dai_yi':
                    {
                        isBigerThanLast = oCur.type === 'san_dai_yi' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    case 'san_dai_er':
                    {
                        isBigerThanLast = oCur.type === 'san_dai_er' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    case 'si_dai_er':
                    {
                        isBigerThanLast = oCur.type === 'si_dai_er' && oCur.zIndex > oLast.zIndex;
                        break;
                    }
                    default :
                    {
                        isBigerThanLast = false;
                        break;
                    }
                }


            } else {
                isBigerThanLast = true;
            }
            if (oCur.type === 'zha_dan') {
                isBigerThanLast = (['wang_zha', 'zha_dan'].indexOf(oLast.type) === -1) || (oLast.type === 'zha_dan' && oCur.zIndex > oLast.zIndex);
            }
            if (oCur.type === 'wang_zha') {
                isBigerThanLast = true;
            }


            return isBigerThanLast;
        },
        invokeCmd: function (cmd, cmdName) {
            var arr = cmd.split(' -');
            cmd = arr[0].trim();
            arr.splice(0, 1);
            var map = {};
            for (var i in arr) {
                var item = arr[i].trim().split(' '), len = item.length, first = item[0], last = item[len - 1] || '';
                map[first] = last;
            }
            cmdName = cmdName || cmd;
            o[cmdName](map);
        },
        endGame: function () {
            o.buYaoPai(null);
            o.lastWUDIer = null;
            o.lastCardMsg = null;
            o.banker = null;
            o.cardInfo = {};
            o.playerIndex = null;
            o.isBegin = false;
            o.isFinalBankerConfirmed = false;
            o.bl = 1;
            o.setBanker(null);//清空地主设置计时器
            o.notify('游戏结束啦，请管理员重新开始下一局游戏');
        },
        //整牌
        zhengpai: function (arr) {
            var aNums = [];
            for (var i in arr) {
                var val = arr[i] + '';
                aNums.push(parseInt(cardMap[val], 10));
            }
            lib.bubbleSort(aNums);


            var _aNums = [];
            var reverseMap = lib.reverseMap(cardMap);
            for (var i in aNums) {
                var val = aNums[i] + '';
                _aNums.push(reverseMap[val]);
            }
            return _aNums;
        },
        startGame: function (options) {
            if (md5(localStorage.getItem('pwd') || '') === o.md5pwd) {
                options.p = o.md5pwd;
            }
            if (!options.p) {
                o.error('缺少p这个参数,无法启动游戏');
                return false;
            }
            else if (options.p !== o.md5pwd && md5(options.p) !== o.md5pwd) {
                o.error('密码错误，无法启动游戏');
                return false;
            }
            if (o.nicknameList.length < 3) {
                socket.emit('send_message', '错误:玩家不足3人，玩个毛啊', 'error', false);
                return false;
            }
            if (o.isBegin === false) {


                o.isBegin = true;
                socket.emit('send_message', '游戏开始了', null, false);
                socket.emit('start_game', o.nicknameList.slice(0, 3));
                var index = o.lastWinnerIndex || (Math.floor(Math.random() * 3));
                o.setBanker(index, false, true, true);
                socket.emit('send_message', '请' + '庄家' + '[' + o.nicknameList[index] + ']执行[fp]命令开始发牌');

            }
            else {
                socket.emit('send_message', '@' + o.nickname + ':你傻逼啊，游戏都开始了,你敲sg有毛用啊', 'error', false);
            }

        },
        cuipai: function (options) {

            //if(o.nickname===null){
            //    socket.emit('send_message','有一个家伙昵称还没有登陆呢就像催某人费apai，我给他的操作禁止了','error');
            //    return false;
            //}
            if (o.isBegin === false) {
                socket.emit('send_message', '@' + o.nickname + ':你傻逼啊，游戏都没有开始，你催个毛线啊', 'error', false);
                return false;
            }
            var msg = options.msg || options.m || '快点儿啊，我等到花儿都谢了';
            socket.emit('send_message', '呼叫[' + o.nicknameList[o.playerIndex] + '],我是[' + o.nickname + ']:' + msg);
        },
        setBanker: (function () {
            var count = 0;
            return function (index, isSure, isReCount, isBroadCastBankerChanged) {//设置庄家,isRecount是否重新开始计算抢地主索引,isBroadCastBankerChanged是否广播地主呗切换的消息

                if (index === null) {
                    count = 0;
                    return false;
                }
                if (isReCount === true) {
                    count = 0;
                }
                o.broadcastModifyProp('playerIndex', index);
                o.broadcastModifyProp('banker', o.nicknameList[index]);
                o.playerIndex = index;
                o.banker = o.nicknameList[index];
                if (isBroadCastBankerChanged === true) {
                    socket.emit('send_message', (isSure === true ? '真正的' : '临时') + '庄家切换到了:' + o.banker, null, false);
                } else {
                    o.notify((isSure === true ? '真正的' : '临时') + '庄家切换到了:' + o.banker);
                }
//banker_set用于第一次设置临时庄家以及要地主的时候循环设置临时庄家，banker_confirm才是真正的定庄家，并且把三张底牌给庄家
                if (isSure === true) {//定庄家了
                    o.notify('最终庄家定了，是:' + o.banker + ',最后3张底牌是:' + o.cardInfo.dipai.join(',') + ',归庄家所有。现在，请地主大人出牌');
                    o.broadcastModifyProp('status', statusMap.CHU_PAI);
                    socket.emit('banker_confirm', o.banker);
                }
                else {
                    socket.emit('banker_set', o.banker);
                    count++;
                    if (count === 4) {
                        o.broadcastInvokeFun('endGame', []);
                        socket.emit('send_message', '没有一个人要地主,重新开局啦!请管理员输入sg命令开启新一轮游戏!', null, false);
                    }
                }


            }
        })(),
        clearCmd: (function () {

            var isCorporationMsgExist = true;
            return function () {
                if (isCorporationMsgExist) {
                    o.$container.prev().add(o.$container.prev().prev()).remove();
                    isCorporationMsgExist = false;
                }
                o.$container.find('div').remove();
                o.$body.scrollTop(0);
            }
        })(),
        getPrevIndex: function (index) {

            index = index - 1;
            if (index === -1) {
                index = 2;
            }
            return index;
        },
        error: function (msg, showChupai) {
            if (o.status === statusMap.CHU_PAI && showChupai !== false) {
                msg = '[轮到' + o.nicknameList[o.playerIndex] + '出牌了，' + (o.nicknameList[o.getPrevIndex(o.playerIndex)]) + '出的牌是：<b>' + (o.lastCardMsg === null ? '没有' : o.lastCardMsg.value) + '</b>]--------' + msg;
            }
            $('<div>')
                .css({
                    color: 'red'
                })
                .html(msg).insertBefore(o.$msg.find('span').last());


            o.updateScrollTop();
        },
        setMsg: function (msg) {
            $('<div>').html(o.pre + (msg || o.lastCmd) + '<br>').insertBefore(o.$msg.find('span').last());
            o.updateScrollTop();
        },
        notify: function (msg, isShowChupai, isBiggerThanLast) {

            var index = o.playerIndex;
            if (isBiggerThanLast === true) {
                index = o.getNextPlayerIndex(index);
            }

            if (!jQuery.isArray(msg)) {
                msg = [msg];
            }

            //if(jQuery.isArray(msg)){
            if (o.status === statusMap.CHU_PAI && isShowChupai !== false) {
                msg.unshift('[轮到' + o.nicknameList[index] + '出牌了，' + (o.nicknameList[o.getPrevIndex(o.playerIndex)]) + '出的牌是：<b>' + (o.lastCardMsg === null ? '没有' : o.lastCardMsg.value) + '</b>]----------');
            }

            for (var i in msg) {
                $('<div>').html('<br>' + msg[i] + '<br>').insertBefore(o.$msg.find('span').last());
            }

            o.updateScrollTop();
        },
        setMsgToLastSpan: function (msg) {
            o.$msg.find('span').last().html(o.pre + (msg || o.tmpMsg));
            o.updateScrollTop();
        },
        sendMessage: function (msg, type) {

            socket.emit('send_message', msg, type, true);
        },
        broadcastInvokeFun: function (funName, paramArr) {
            socket.emit('broadcastInvokeFun', funName, paramArr)
        },
        updateScrollTop: function () {
            var h = 0, body_h = o.$body.height(), body_inner_h = o.$body.children().first().height();
            o.$body.children().children().each(function () {
                h += $(this).outerHeight() + 20;
            })
            if (h > body_h) {
                if (h > body_inner_h) {
                    o.$body.children().first().height(h);
                }
                o.$body.scrollTop(h - body_h);

            }
        },
        help: function () {

            $.get('/help.txt', function (e) {
                o.notify(e.split('\n'));
            })
        },
        getNextPlayerIndex: function (index) {
            index = index || o.playerIndex;
            if (index === null) {
                return null;
            }
            var nextIndex = index + 1;
            if (nextIndex === 3) {
                nextIndex = 0;
            }
            return nextIndex;
        },
        getRemainCards: function () {
            return '[' + (o.zhengpai(o.cardInfo[o.nicknameList[0]].remainCards.concat(o.cardInfo[o.nicknameList[1]].remainCards).concat(o.cardInfo[o.nicknameList[2]].remainCards)).join(',')) + ']';
        },
        getSentCards: function () {
            if (!o.cardInfo[o.nicknameList[0]]) {
                o.error('牌都没法看个毛啊');
                return false;
            } else {
                return '[' + (o.zhengpai(o.cardInfo[o.nicknameList[0]].sentCards.concat(o.cardInfo[o.nicknameList[1]].sentCards).concat(o.cardInfo[o.nicknameList[2]].sentCards)).join(',')) + ']';
            }

        },
        executeCmd: function (cmd) {
            var tmpVal = cmd || o.$tmpMsg.val();
            if (o.isExecuteEverCmd === false) {//如果不是执行曾经执行过的命令
                o.lastCmd = o.tmpMsg;//更新上一次执行的命令
                o.setMsg();//设置最新信息
                o.cmds.push(o.lastCmd);//保存命令到数组
                o.lastMsg = o.lastMsg + o.tmpMsg;//更新上一次执行时的总信息
            } else {
                o.setMsg(o.$tmpMsg.val());//设置最新信息
            }

            o.$tmpMsg.val('');//清空临时命令的文本框

            o.tmpMsg = '';//清空临时信息

            if (tmpVal.substring(0, 1) === ':' || tmpVal.substring(0, 1) === '：') {
                o.sendMessage(o.lastCmd.substring(1));
            } else {

                switch (tmpVal.split(' -')[0].trim()) {
                    case 'clear':
                    case 'cls':
                    {
                        o.clearCmd();
                        break;
                    }
                    case 'y':
                    {
                        if (o.isFinalBankerConfirmed === false && o.status === statusMap['YAO_DI_ZHU'] && o.banker === o.nickname) {
                            o.broadcastInvokeFun('setBanker', [o.playerIndex, true]);
                        }
                        break;
                    }
                    case 'n':
                    {
                        //拒绝要地主
                        if (o.isFinalBankerConfirmed === false && o.status === statusMap['YAO_DI_ZHU'] && o.banker === o.nickname) {

                            var nextIndex = o.getNextPlayerIndex();


                            socket.emit('send_message', o.banker + '不要地主,请' + o.nicknameList[nextIndex] + '输入y或者n确认要不要地主', null, false);
                            o.broadcastInvokeFun('setBanker', [nextIndex, false]);
                        }
                        if (o.status === statusMap['CHU_PAI']) {
                            o.broadcastInvokeFun('buYaoPai', [o.nickname]);
                        }
                        break;
                    }
                    case 'wdp':
                    {

                        if (!o.cardInfo[o.nickname]) {
                            o.error('牌都没发，你怎么看牌啊，2b');
                            return false;
                        }
                        o.notifyWDP();
                        break;
                    }
                    case 'sg':
                    {
                        o.invokeCmd(tmpVal, 'startGame');
                        break;
                    }
                    case 'cp':
                    {
                        o.invokeCmd(tmpVal, 'chupai');
                        //o.broadcastInvokeFun('chupai')
                        break;
                    }
                    case 'score':
                    {

                        o.viewScore();
                        break;
                    }
                    case 'help':
                    {
                        o.help();
                        break;
                    }

                    case 'gscp':
                    {

                        if (o.status === statusMap.CHU_PAI) {
                            var _msg = '[轮到' + o.nicknameList[o.playerIndex] + '出牌了，' + (o.nicknameList[o.getPrevIndex(o.playerIndex)]) + '出的牌是：<b>' + (o.lastCardMsg === null ? '没有' : o.lastCardMsg.value) + '</b>]';
                            o.notify(_msg);
                        }
                        else {
                            o.error('游戏暂未开始');
                        }

                        break;
                    }
                    case 'reload':
                    {

                        location.reload();
                        break;
                    }
                    case 'clear score':
                    {
                        o.invokeCmd(tmpVal, 'clearScore');
                        break;
                    }
                    case 'cgdp':
                    {
                        var sentCards = o.getSentCards();
                        o.notify([
                            '--------------',
                            '已经出了的牌是:',
                            o.nicknameList[0] + '出过的所有牌是:' + o.cardInfo[o.nicknameList[0]].sentCards.join(','),
                            o.nicknameList[1] + '出过的所有牌是:' + o.cardInfo[o.nicknameList[1]].sentCards.join(','),
                            o.nicknameList[2] + '出过的所有牌是:' + o.cardInfo[o.nicknameList[2]].sentCards.join(','),
                            '已经出了的所有的牌是:' + sentCards,

                            '---------------'
                        ])
                        break;
                    }
                    case 'cpi':
                    {

                        o.invokeCmd(tmpVal, 'cuipai');

                        break;
                    }
                    case 'fp':
                    {

                        //o.fapai();
                        o.invokeCmd(tmpVal, 'fapai');
                        break;
                    }
                    case 'show':
                    {
                        o.notify([
                            '-----------begin--------------',
                            '当前在线所有人为：[' + o.nicknameList.join(',') + ']',
                            o.isBegin === false ? '游戏暂未开始' : '游戏正在火热进行中哦,三个玩家的昵称分别是：' + o.nicknameList.slice(0, 3) + ',观战者是：' + o.nicknameList.slice(3),
                            '阁下的身份是:' + (o.nicknameList.slice(0, 3).indexOf(o.nickname) === -1 ? '[观战者]' : '[玩家]') + ',昵称是：[' + o.nickname + ']',
                            '庄家是:' + (o.isBegin === false ? '[游戏还没开始，未分派庄家呢]' : o.banker),
                            '------------end-------------'
                        ]);
                        break;
                    }
                    default:
                    {

                        o.onCmdError(tmpVal);
                        o.updateScrollTop();
                        break;
                    }
                }
                //}

            }


            if (o.isExecuteEverCmd === false) {
                o.cmd_index = o.cmds.length - 1;
            }

            o.isExecuteEverCmd = false;


        },

        clearScore: function (options) {
            if (!options.p) {
                o.error('缺少密码');
                return false;
            }
            if (md5(options.p) !== o.md5pwd) {
                o.error('密码错误');
            } else {
                localStorage.removeItem('score');
                o.notify('恭喜，清楚成功');
            }


        },
        onCmdError: function (cmdName) {
            cmdName = cmdName || '';
            o.error(cmdName + '不是内部或外部命令，也不是可运行的程序或批处理文件。');
            o.$tmpMsg.val('');//清空临时命令的文本框
            o.tmpMsg = '';//清空临时信息
            o.setMsgToLastSpan('');
        },
        getTotalMsg: function () {
            return o.$msg.text().trim();
        },
        getLastCmd: function () {
            var msg = o.getTotalMsg();
            var index = msg.indexOf(o.lastMsg);
            if (index === -1) {
                index = 0;
            }
            return msg.substring(index + msg.length);
        },
        getTmpMsg: function () {
            return o.$tmpMsg.val().trim();
        },
        init: function () {
            o.$body.add($('body')).css({
                scrollTop: '0'
            })
            var playerName = localStorage.getItem('playerName');
            if (playerName) {
                o.nickname = playerName;
                socket.emit('new_comer', playerName);
            } else {
                $('#modalWin').modal('show');
            }

            o.setMsgToLastSpan();
            var isUnderscoreShow = true;
            setInterval(function () {
                o.$underscore.css({
                    display: isUnderscoreShow ? 'none' : 'inline'
                })
                isUnderscoreShow = !isUnderscoreShow;
            }, 700);
            $('body')
                    .keydown(function (e) {


                        if (o.nickname !== null) {
                            o.$tmpMsg.focus();
                        }

                    })
                    .keyup(function (e) {


                    var code = parseInt(e.keyCode, 10);
                    if (code === 67 && e.ctrlKey) {
                        $('<div>')
                            .html(o.$msg.find('span').last().html()).insertBefore(o.$msg.find('span').last());
                        o.$tmpMsg.val('');//清空临时命令的文本框
                        o.tmpMsg = '';//清空临时信息
                        o.setMsgToLastSpan();
                        o.updateScrollTop();
                        return false;
                    }


                    if (o.nickname === null) {
                        if (code === 13) {

                            var tmpNickname = $('#nickname-input').val().trim();
                            if (tmpNickname === '') {
                                alert('昵称不能为空');
                                return false;
                            }
                            else if (!/^\w+$/.test(tmpNickname)) {
                                alert('只允许字母数字下划线,请更换其他昵称');
                                return false;
                            }
                            $('#modalWin').modal('hide');
                            o.nickname = tmpNickname;
                            socket.emit('new_comer', o.nickname);

                        }
                    } else {
                        if (code !== 13) {
                            if ([38, 40].indexOf(code) === -1) {
                                o.tmpMsg = o.getTmpMsg();
                                o.lastCmd = o.getLastCmd();
                                o.totalMsg = o.lastMsg + o.tmpMsg;
                                o.setMsgToLastSpan();
                                o.isExecuteEverCmd = false;
                            } else {
                                o.isExecuteEverCmd = true;
                            }
                        }


                        switch (code) {
                            case 13:
                            {

                                if (o.$tmpMsg.val().trim() === '') {
                                    o.onCmdError();
                                    o.updateScrollTop();

                                } else {


                                    o.executeCmd();

                                    o.setMsgToLastSpan();
                                    o.updateScrollTop();


                                }

                                break;
                            }
                            case 38:
                            {

                                o.cmd_index--;
                                if (o.cmd_index === -1) {
                                    o.cmd_index = 0;
                                }
                                o.$tmpMsg.val(o.cmds[o.cmd_index]);
                                o.setMsgToLastSpan(o.$tmpMsg.val());
                                break;
                            }
                            case 40:
                            {
                                o.cmd_index++;
                                if (o.cmd_index === o.cmds.length) {
                                    o.cmd_index = o.cmds.length - 1;
                                }
                                o.$tmpMsg.val(o.cmds[o.cmd_index]);
                                o.setMsgToLastSpan(o.$tmpMsg.val());
                                break;
                                break;
                            }


                        }
                    }


                })
        }
    }


    //定庄家了
    socket.on('banker_confirm', function (banker) {
        //o.notify('banker confirm');


        if (o.isFinalBankerConfirmed === false) {

            o.isFinalBankerConfirmed = true;
            o.cardInfo[banker].initialCards = o.cardInfo[banker].initialCards.concat(o.cardInfo.dipai);
            o.cardInfo[banker].remainCards = o.cardInfo[banker].remainCards.concat(o.cardInfo.dipai);
        }
    })
    socket.on('broadcastInvokeFun', function (funName, paramArr) {
        o[funName].apply(o, paramArr);
    })
    socket.on('broadcastModifyProp', function (k, v) {
        o[k] = v;
        var msg = {
            'YAO_DI_ZHU': '请' + o.banker + '决定是否要地主,输入y抢地主,不要地主输入n'
        }
        if (typeof(msg[v]) !== 'undefined') {
            o.notify(msg[v])
        }

    })
    socket.on('read_card_info', function (cardInfo) {
        o.cardInfo = cardInfo;
    })
    socket.on('start_game', function () {
        o.isBegin = true;
    })
    socket.on('banker_set', function (banker) {
        o.banker = banker;
    })
    socket.on('user_quit', function (nickname, nicknameList) {

        if (o.nicknameList.slice(0, 3).indexOf(nickname) !== -1) {


            o.error('玩家：' + nickname + '离开了游戏，系统将在1秒中后重启！');
            socket.emit('restart');
            setTimeout(function () {
                location.reload();
            }, 1000);

        } else {
            o.error(nickname + '离开了群聊');
        }

        o.nicknameList = nicknameList;

    })
    socket.on('user_list', function (userList) {
        for (var i in userList) {
            o.notify(userList[i] + '加入游戏');
        }
    })
    socket.on('nickname_error', function (nickname, userList) {
        alert(nickname + '错误，可能是格式不合法或者是该昵称已被使用');
    })
    socket.on('send_message', function (msg, nickname, type, isPlayerMsg) {//isPlayerMsg是否是玩家发送的消息


        if (type === 'error') {
            if (isPlayerMsg) {
                if ($.isArray(msg)) {
                    for (var i in msg) {
                        o.error('来自' + nickname + '的操作:' + msg[i]);
                    }
                } else {
                    o.error('来自' + nickname + '的操作:' + msg);
                }

            } else {
                if ($.isArray(msg)) {
                    for (var i in msg) {
                        o.error(msg[i]);
                    }
                } else {
                    o.error(msg);
                }

            }

        } else {
            if (isPlayerMsg) {
                if ($.isArray(msg)) {
                    for (var i in msg) {
                        o.notify(nickname + '说:<label style="color:green;">' + msg[i] + '</label>');
                    }
                } else {
                    o.notify(nickname + '说:<label style=color:green;>' + msg + '<label>');
                }

            } else {
                if ($.isArray(msg)) {
                    for (var i in msg) {
                        o.notify(msg[i]);
                    }
                } else {
                    o.notify(msg);
                }

            }

        }

    })
    socket.on('join', function (nickname, nicknameList) {

        o.nicknameList = nicknameList;
        if (o.nickname === nickname) {
            o.notify('我(' + nickname + ')' + '加入游戏');
            localStorage.setItem('playerName', nickname);
        } else {
            o.notify(nickname + '加入游戏');
        }


        //当刚好够3个玩家的时候
        if (nicknameList.indexOf(nickname) === 2) {
            //给前三个玩家初始化得分
            var arr = o.nicknameList.slice(0, 3);
            var localScore = localStorage.getItem('score');
            for (var i in arr) {
                o.score[arr[i]] = 0;
            }
            if (localScore) {
                localScore = JSON.parse(localScore);
                if (localScore[nickname]) {
                    o.score[nickname] = parseInt(localScore[nickname], 10);
                }
            }
        }


    })


    o.init();

})


//})()

