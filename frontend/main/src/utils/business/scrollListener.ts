import { unref, Ref } from 'vue';
export const handleScroll = (scrollRef: Ref, callback: Function) => {
  const dom = unref(scrollRef)?.getScrollWrap();
  let timer;
  dom?.addEventListener('scroll', function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (dom.clientHeight + dom.scrollTop + 50 > dom.scrollHeight) {
        callback();
      }
    }, 500);
  });
};
