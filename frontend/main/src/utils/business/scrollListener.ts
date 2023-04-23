import { unref, Ref } from 'vue';
export const handleScroll = (scrollRef: Ref, callback: Function, canload?) => {
  const dom = unref(scrollRef)?.getScrollWrap();
  // console.log('scroll:', unref(scrollRef));
  let timerCount = 0;
  const load = () => {
    setTimeout(() => {
      // console.log(dom?.childNodes[0].clientHeight, dom?.clientHeight, canload);
      if (dom?.childNodes[0].clientHeight < dom?.clientHeight && canload) {
        callback();
      }
      if (canload && timerCount < 5) {
        timerCount += 1;
        load();
      }
    }, 800);
  };
  load();
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

export const initializeData = (scrollRef: Ref, callback: Function, canload?) => {
  const dom = unref(scrollRef)?.getScrollWrap();
  const load = () => {
    setTimeout(() => {
      // console.log(dom?.childNodes[0].clientHeight, dom?.clientHeight, canload);
      if (dom?.childNodes[0].clientHeight < dom?.clientHeight && canload) {
        callback();
        load();
      }
    }, 300);
  };
  load();
};
