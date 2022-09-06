package ai.basic.x1.util;


import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * page
 *
 * @author fyb
 */
@Data
public class Page<T> implements Serializable {

    private static final long serialVersionUID = 5636079738558757591L;

    private final static int DEFAULT_PAGE_SIZE = 10;
    /**
     * page size
     */
    private int pageSize = DEFAULT_PAGE_SIZE;
    /**
     * Page number
     */
    private int pageNo;
    /**
     * Total number
     */
    private int total;
    /**
     * Data list
     */
    private List<T> list;

    public <D> Page<D> convert(Function<? super T, ? extends D> mapper) {
        var resultPage = new Page<D>();
        resultPage.setList(this.getList() != null ? this.getList().stream().map(mapper).collect(Collectors.toList()) : null);
        resultPage.setPageNo(this.pageNo);
        resultPage.setPageSize(this.pageSize);
        resultPage.setTotal(this.total);
        return resultPage;
    }

}
