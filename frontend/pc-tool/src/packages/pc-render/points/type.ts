import type { Points } from 'three';

export interface IPoints extends Points {
    loading: boolean;
    updateData(data: any): void;
    loadUrl(url: any): void;
}
