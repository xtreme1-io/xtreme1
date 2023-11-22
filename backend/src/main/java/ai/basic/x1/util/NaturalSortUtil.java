package ai.basic.basicai.common.util.natural;

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

    public static void main(String[] args) {
        /*for (String string : strings) {
            var name = String.format("%s.jpg", string);
            System.out.println("INSERT INTO `basicai_dataset`.`test_name`(`name`, `len`,`acc`) VALUES ('" + name + "', " + convert(name).length() + ",'" + convert(name) + "');");
        }*/

        var list = Arrays.asList(strings);
        list.sort(Comparator.comparing(NaturalSortUtil::convert));
        System.out.println();
    }

    static String[] strings = new String[]{"17115327_cam_lucid_autofill_image_raw_2023_04_14_11_29_43_595",
            "1-2", "1-02", "1-20", "10-20", "fred", "jane", "pic01",
            "17115327_cam_lucid_autofill_image_raw_2023_04_14_11_29_53_85", "17115327_cam_lucid_autofill_image_raw_2023_04_14_11_29_43_85", "pic2", "pic02", "pic02a", "pic3", "pic4", "pic 4 else", "pic 5", "pic05", "pic 5",
            "pic 5 something", "pic 6", "pic   7", "pic100", "pic100a", "pic120", "pic121",
            "pic02000", "tom", "x2-g8", "x2-y7", "x2-y08", "x8-y8", "a0121a", "a111a"};
}
