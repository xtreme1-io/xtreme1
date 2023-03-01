import type { Directive, App } from 'vue';
import { debounce } from 'lodash-es';

class LazyLoader {
  imgs: HTMLImageElement[] = [];
  observer: IntersectionObserver;
  loadN = 0;
  loadMax = 4;
  constructor() {
    this.load = debounce(this.load.bind(this), 50);

    this.observer = new IntersectionObserver((changes) => {
      for (const change of changes) {
        const image = change.target as HTMLImageElement;
        image.setAttribute('data-visible', change.intersectionRatio > 0 ? '1' : '');
      }
      this.load();
    });
  }
  addImage(image: HTMLImageElement) {
    this.imgs.push(image);
    this.observer.observe(image);
  }
  removeImage(image: HTMLImageElement) {
    this.imgs = this.imgs.filter((e) => e !== image);
    this.observer.unobserve(image);
  }

  getNext() {
    const visibleImgs = [] as HTMLImageElement[];
    const others = [] as HTMLImageElement[];

    this.imgs.forEach((img) => {
      const visible = img.getAttribute('data-visible');
      const loaded = img.getAttribute('data-loaded');
      // loading
      if (loaded === '-1') return;

      if (visible) {
        visibleImgs.push(img);
      } else {
        others.push(img);
      }
    });

    return [...visibleImgs, ...others].slice(0, this.loadMax - this.loadN);
  }

  load() {
    while (this.loadN < this.loadMax) {
      const imgs = this.getNext();
      if (imgs.length === 0) return;
      imgs.forEach((img) => {
        this.loadImage(img);
      });
    }
  }

  loadImage(image: HTMLImageElement) {
    if (this.loadN >= this.loadMax) return;

    this.loadN++;

    this._loadImage(image, (image as any).dataSrc).then(() => {
      image.setAttribute('data-loaded', '1');
      image?.parentElement?.classList.remove('image-loading');
      this.loadN--;
      this.removeImage(image);
      this.load();
    });

    // loading
    image.setAttribute('data-loaded', '-1');
  }

  _loadImage(image: HTMLImageElement, src: string) {
    return new Promise((resolve) => {
      image.onload = () => {
        // console.log('onload');
        resolve();
      };

      image.onabort = () => {
        // console.log('onabort');
        resolve();
      };

      image.onerror = () => {
        // console.log('onerror');
        resolve();
      };
      image.src = src;
    });
  }
}

// eslint-disable-next-line
let loader = new LazyLoader();
window.loader = loader;

const lazyLoadDirective: Directive = {
  mounted(el, binding) {
    const value = binding.value || '';
    if (value) {
      el.dataSrc = value;
      loader.addImage(el);
    }
  },
  unmounted(el) {
    loader.removeImage(el);
  },
};

export function setupLazyLoadDirective(app: App) {
  app.directive('lazyload', lazyLoadDirective);
}

export default lazyLoadDirective;
