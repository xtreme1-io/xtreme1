const cache = {};
export const IconCache = {
    add(iconUrl) {
        return new Promise((resolve, reject) => {
            if (cache[iconUrl]) {
                resolve(cache[iconUrl]);
            } else {
                let img = new Image();
                img.onload = function() {
                    if (cache[iconUrl]) {
                        resolve(cache[iconUrl]);
                        return;
                    }
                    cache[iconUrl] = img;
                    img.onerror = img.onerror = img.onload = null;
                    resolve(img);
                };
                img.onabort = img.onerror = () => {
                    reject();
                };
                img.src = iconUrl;
            }
        });
    },
    remove(iconUrl) {
        cache[iconUrl] = null;
        delete cache[iconUrl];
    },
    getByUrl(iconUrl) {
        return cache[iconUrl];
    },
};
