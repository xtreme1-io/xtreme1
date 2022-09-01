import { get, post } from './base';

export async function invalidData(dataId:string) {
    let url = `/data/flow/markAsInvalid/${dataId}`;
    let data = await post(url);
}

export async function validData(dataId:string) {
    let url = `/data/flow/markAsValid/${dataId}`;
    let data = await post(url);
}

export async function submitData(dataId:string) {
    let url = `/data/flow/submit/${dataId}`;
    let data = await post(url);
}