import { FileLoader, Loader, LoaderUtils } from 'three';

type ICallBack = (args?: any) => void;
type PCDData = 'ascii' | 'binary_compressed' | 'binary';
type PCDFields = 'x' | 'y' | 'z' | 'i' | 'intensity' | 'rgb' | 'normal_x' | 'normal_y' | 'normal_z';
interface IPCDHeader {
    data: PCDData;
    offset: { [key in PCDFields]: number };
    headerLen: number;
    height: number;
    points: number;
    size: number[];
    rowSize: number;
}

class PCDLoader extends Loader {
    littleEndian: boolean;
    constructor() {
        super();

        this.littleEndian = true;
    }

    load(url: string, onLoad: ICallBack, onProgress?: ICallBack, onError?: ICallBack) {
        const scope = this;

        const loader = new FileLoader(scope.manager);
        loader.setPath(scope.path);
        loader.setResponseType('arraybuffer');
        loader.setRequestHeader(scope.requestHeader);
        loader.setWithCredentials(scope.withCredentials);
        loader.load(
            url,
            function (data) {
                try {
                    onLoad(scope.parse(data, url));
                } catch (e) {
                    if (onError) {
                        onError(e);
                    } else {
                        console.error(e);
                    }

                    scope.manager.itemError(url);
                }
            },
            onProgress,
            onError,
        );
    }

    parse(data: any, url: string) {
        function parseHeader(data: string) {
            const PCDheader = {} as any;
            const result1 = data.search(/[\r\n]DATA\s(\S*)\s/i);
            const result2 = /[\r\n]DATA\s(\S*)\s/i.exec(data.substr(result1 - 1)) as any;

            PCDheader.data = result2[1];
            PCDheader.headerLen = result2[0].length + result1;
            PCDheader.str = data.substr(0, PCDheader.headerLen);

            // remove comments

            PCDheader.str = PCDheader.str.replace(/\#.*/gi, '');

            // parse

            PCDheader.version = /VERSION (.*)/i.exec(PCDheader.str);
            PCDheader.fields = /FIELDS (.*)/i.exec(PCDheader.str);
            PCDheader.size = /SIZE (.*)/i.exec(PCDheader.str);
            PCDheader.type = /TYPE (.*)/i.exec(PCDheader.str);
            PCDheader.count = /COUNT (.*)/i.exec(PCDheader.str);
            PCDheader.width = /WIDTH (.*)/i.exec(PCDheader.str);
            PCDheader.height = /HEIGHT (.*)/i.exec(PCDheader.str);
            PCDheader.viewpoint = /VIEWPOINT (.*)/i.exec(PCDheader.str);
            PCDheader.points = /POINTS (.*)/i.exec(PCDheader.str);

            // evaluate

            if (PCDheader.version !== null) PCDheader.version = parseFloat(PCDheader.version[1]);

            if (PCDheader.fields !== null) PCDheader.fields = PCDheader.fields[1].split(' ');

            if (PCDheader.type !== null) PCDheader.type = PCDheader.type[1].split(' ');

            if (PCDheader.width !== null) PCDheader.width = parseInt(PCDheader.width[1]);

            if (PCDheader.height !== null) PCDheader.height = parseInt(PCDheader.height[1]);

            if (PCDheader.viewpoint !== null) PCDheader.viewpoint = PCDheader.viewpoint[1];

            if (PCDheader.points !== null) PCDheader.points = parseInt(PCDheader.points[1], 10);

            if (PCDheader.points === null) PCDheader.points = PCDheader.width * PCDheader.height;

            if (PCDheader.size !== null) {
                PCDheader.size = PCDheader.size[1].split(' ').map(function (x: any) {
                    return parseInt(x, 10);
                });
            }

            if (PCDheader.count !== null) {
                PCDheader.count = PCDheader.count[1].split(' ').map(function (x: any) {
                    return parseInt(x, 10);
                });
            } else {
                PCDheader.count = [];

                for (let i = 0, l = PCDheader.fields.length; i < l; i++) {
                    PCDheader.count.push(1);
                }
            }

            PCDheader.offset = {};

            let sizeSum = 0;

            for (let i = 0, l = PCDheader.fields.length; i < l; i++) {
                if (PCDheader.data === 'ascii') {
                    PCDheader.offset[PCDheader.fields[i]] = i;
                } else {
                    PCDheader.offset[PCDheader.fields[i]] = sizeSum;
                    sizeSum += PCDheader.size[i] * PCDheader.count[i];
                }
            }

            // for binary only

            PCDheader.rowSize = sizeSum;

            return PCDheader;
        }

        const textData = LoaderUtils.decodeText(new Uint8Array(data));

        // parse header (always ascii format)

        function decompressLZF(inData: Uint8Array, outLength: number) {
            const inLength = inData.length;
            const outData = new Uint8Array(outLength);
            let inPtr = 0;
            let outPtr = 0;
            let ctrl;
            let len;
            let ref;
            do {
                ctrl = inData[inPtr++];
                if (ctrl < 1 << 5) {
                    ctrl++;
                    if (outPtr + ctrl > outLength)
                        throw new Error('Output buffer is not large enough');
                    if (inPtr + ctrl > inLength) throw new Error('Invalid compressed data');
                    do {
                        outData[outPtr++] = inData[inPtr++];
                    } while (--ctrl);
                } else {
                    len = ctrl >> 5;
                    ref = outPtr - ((ctrl & 0x1f) << 8) - 1;
                    if (inPtr >= inLength) throw new Error('Invalid compressed data');
                    if (len === 7) {
                        len += inData[inPtr++];
                        if (inPtr >= inLength) throw new Error('Invalid compressed data');
                    }

                    ref -= inData[inPtr++];
                    if (outPtr + len + 2 > outLength)
                        throw new Error('Output buffer is not large enough');
                    if (ref < 0) throw new Error('Invalid compressed data');
                    if (ref >= outPtr) throw new Error('Invalid compressed data');
                    do {
                        outData[outPtr++] = outData[ref++];
                    } while (--len + 2);
                }
            } while (inPtr < inLength);

            return outData;
        }

        const PCDheader = parseHeader(textData) as IPCDHeader;
        // parse data

        const position = [];
        // const normal = [];
        const color = [];
        const intensity = [];

        // ascii

        let N = 1;
        if (PCDheader.data === 'ascii') {
            const offset = PCDheader.offset;
            const pcdData = textData.substr(PCDheader.headerLen);
            const lines = pcdData.split('\n');

            for (let i = 0, l = lines.length; i < l; i++) {
                if (lines[i] === '') continue;

                const line = lines[i].split(' ');
                // const line = lines[i].split(/\s|,/);

                if (offset.x !== undefined) {
                    // [...Array(N)].forEach((e) => {
                    position.push(parseFloat(line[offset.x]));
                    position.push(parseFloat(line[offset.y]));
                    position.push(parseFloat(line[offset.z]));
                    // });
                }

                if (offset.rgb !== undefined) {
                    const rgb = parseFloat(line[offset.rgb]);
                    const r = (rgb >> 16) & 0x0000ff;
                    const g = (rgb >> 8) & 0x0000ff;
                    const b = (rgb >> 0) & 0x0000ff;

                    // [...Array(N)].forEach((e) => {
                    color.push(r / 255, g / 255, b / 255);
                    // });
                }
                if (offset.i !== undefined) {
                    // [...Array(N)].forEach((e) => {
                    intensity.push(parseFloat(line[offset.i]));
                    // });
                }
                if (offset.intensity !== undefined) {
                    // [...Array(N)].forEach((e) => {
                    intensity.push(parseFloat(line[offset.intensity]));
                    // });
                }
                // if (offset.normal_x !== undefined) {
                //     [...Array(N)].forEach((e) => {
                //         normal.push(parseFloat(line[offset.normal_x]));
                //         normal.push(parseFloat(line[offset.normal_y]));
                //         normal.push(parseFloat(line[offset.normal_z]));
                //     });
                // }
            }
        }

        if (PCDheader.data === 'binary_compressed') {
            const sizes = new Uint32Array(data.slice(PCDheader.headerLen, PCDheader.headerLen + 8));
            const compressedSize = sizes[0];
            const decompressedSize = sizes[1];
            const decompressed = decompressLZF(
                new Uint8Array(data, PCDheader.headerLen + 8, compressedSize),
                decompressedSize,
            );
            const dataview = new DataView(decompressed.buffer);

            const offset = PCDheader.offset;

            for (let i = 0; i < PCDheader.points; i++) {
                if (offset.x !== undefined) {
                    position.push(
                        dataview.getFloat32(
                            PCDheader.points * offset.x + PCDheader.size[0] * i,
                            this.littleEndian,
                        ),
                    );
                    position.push(
                        dataview.getFloat32(
                            PCDheader.points * offset.y + PCDheader.size[1] * i,
                            this.littleEndian,
                        ),
                    );
                    position.push(
                        dataview.getFloat32(
                            PCDheader.points * offset.z + PCDheader.size[2] * i,
                            this.littleEndian,
                        ),
                    );
                }

                if (offset.rgb !== undefined) {
                    color.push(
                        dataview.getUint8(
                            PCDheader.points * offset.rgb + PCDheader.size[3] * i + 0,
                        ) / 255.0,
                    );
                    color.push(
                        dataview.getUint8(
                            PCDheader.points * offset.rgb + PCDheader.size[3] * i + 1,
                        ) / 255.0,
                    );
                    color.push(
                        dataview.getUint8(
                            PCDheader.points * offset.rgb + PCDheader.size[3] * i + 2,
                        ) / 255.0,
                    );
                }

                // if (offset.normal_x !== undefined) {
                //     normal.push(
                //         dataview.getFloat32(
                //             PCDheader.points * offset.normal_x + PCDheader.size[4] * i,
                //             this.littleEndian,
                //         ),
                //     );
                //     normal.push(
                //         dataview.getFloat32(
                //             PCDheader.points * offset.normal_y + PCDheader.size[5] * i,
                //             this.littleEndian,
                //         ),
                //     );
                //     normal.push(
                //         dataview.getFloat32(
                //             PCDheader.points * offset.normal_z + PCDheader.size[6] * i,
                //             this.littleEndian,
                //         ),
                //     );
                // }
            }
        }

        if (PCDheader.data === 'binary') {
            const dataview = new DataView(data, PCDheader.headerLen);
            const offset = PCDheader.offset;

            for (let i = 0, row = 0; i < PCDheader.points; i++, row += PCDheader.rowSize) {
                if (offset.x !== undefined) {
                    position.push(dataview.getFloat32(row + offset.x, this.littleEndian));
                    position.push(dataview.getFloat32(row + offset.y, this.littleEndian));
                    position.push(dataview.getFloat32(row + offset.z, this.littleEndian));
                }

                if (offset.i !== undefined) {
                    intensity.push(dataview.getFloat32(row + offset.i, this.littleEndian));
                } else if (offset.intensity !== undefined) {
                    intensity.push(dataview.getFloat32(row + offset.intensity, this.littleEndian));
                }

                if (offset.rgb !== undefined) {
                    color.push(dataview.getUint8(row + offset.rgb + 2) / 255.0);
                    color.push(dataview.getUint8(row + offset.rgb + 1) / 255.0);
                    color.push(dataview.getUint8(row + offset.rgb + 0) / 255.0);
                }

                // if (offset.normal_x !== undefined) {
                //     normal.push(dataview.getFloat32(row + offset.normal_x, this.littleEndian));
                //     normal.push(dataview.getFloat32(row + offset.normal_y, this.littleEndian));
                //     normal.push(dataview.getFloat32(row + offset.normal_z, this.littleEndian));
                // }
            }
        }

        // build geometry
        return {
            position,
            color,
            intensity,
        };
    }
}

export default PCDLoader;
