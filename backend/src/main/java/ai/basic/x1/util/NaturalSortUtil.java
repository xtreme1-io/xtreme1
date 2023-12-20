package ai.basic.x1.util;

import cn.hutool.core.util.NumberUtil;
import cn.hutool.core.util.StrUtil;

import java.util.Arrays;
import java.util.Comparator;

/**
 * Perform natural sorting on strings for sorting in the database
 */
public class NaturalSortUtil {

    /**
     * Determine whether the incoming string contains numbers. If there are numbers, add the length of the number in front and add 999 in the end, minus the number of 0 deletions.
     *
     * @param str String to be converted
     * @return
     */
    public static String convert(String str) {
        StringBuffer sbu = new StringBuffer();
        char[] cs = str.toCharArray();
        // Record the index position of the beginning of the number unit
        int tmp = -1;
        for (int i = 0; i < cs.length; i++) {
            char c = cs[i];
            if (Character.isDigit(c)) {
                if (tmp < 0) {
                    tmp = i;
                }
            } else {
                if (tmp >= 0) {
                    // Add the numeric part before the character to the comparison unit
                    var o = str.substring(tmp, i);
                    addNumberLength(sbu, o);
                    tmp = -1;
                }
                sbu.append(c);
            }
        }
        // If the last one is a number, add the last number to the list
        if (Character.isDigit(cs[cs.length - 1])) {
            tmp = tmp < 0 ? cs.length - 1 : tmp;
            var o = str.substring(tmp, cs.length);
            addNumberLength(sbu, o);
        }
        return sbu.toString();

    }

    /**
     * Add the length of the number before the string contains the number and add 999 after it minus delete the 0 number
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
