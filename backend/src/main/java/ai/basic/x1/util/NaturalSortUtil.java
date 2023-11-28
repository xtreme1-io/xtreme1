package ai.basic.x1.util;

import cn.hutool.core.util.NumberUtil;
import cn.hutool.core.util.StrUtil;

import java.util.Arrays;
import java.util.Comparator;

/**
 * 对字符串进行自然排序处理 用于数据库中排序
 */
public class NaturalSortUtil {

    /**
     * 将传入的字符串判断是否有数字，如果有数字则在前加入数字的长度以及后面加入999减去删除0个数
     *
     * @param s 需要转换的字符串
     * @return
     */
    public static String convert(String s) {
        StringBuffer sbu = new StringBuffer();
        char[] cs = s.toCharArray();
        // 记录数字单元开头的索引位置
        int tmp = -1;
        for (int i = 0; i < cs.length; i++) {
            char c = cs[i];
            if (Character.isDigit(c)) {
                if (tmp < 0) {
                    tmp = i;
                }
            } else {
                if (tmp >= 0) {
                    // 将该字符之前的数字部分加入比较单元
                    var o = s.substring(tmp, i);
                    addNumberLength(sbu, o);
                    tmp = -1;
                }
                sbu.append(c);
            }
        }
        // 如果最后一个是数字,将最后的数字加入list中
        if (Character.isDigit(cs[cs.length - 1])) {
            tmp = tmp < 0 ? cs.length - 1 : tmp;
            var o = s.substring(tmp, cs.length);
            addNumberLength(sbu, o);
        }
        return sbu.toString();

    }

    /**
     * 在字符串包含数字前加入数字的长度以及后面加入999减去删除0个数
     *
     * @param stringBuffer
     * @param originalStr
     */
    private static void addNumberLength(StringBuffer stringBuffer, String originalStr) {
        var n = NumberUtil.toStr(NumberUtil.parseNumber(originalStr));
        stringBuffer.append(StrUtil.fill(String.valueOf(n.length()), '0', 3, true));
        stringBuffer.append(n);
        stringBuffer.append(StrUtil.fill(NumberUtil.toStr(NumberUtil.sub(999, NumberUtil.sub(originalStr.length(), n.length()))), '0', 3, true));
    }
}
