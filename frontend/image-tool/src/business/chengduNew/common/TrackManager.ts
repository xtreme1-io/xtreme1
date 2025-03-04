import { TrackManager as BaseTrackManager } from 'image-editor';
import { historyStore } from '../stores';
export default class TrackManager extends BaseTrackManager {
  getTrackMap() {
    if (this.editor.state.isHistoryView) {
      return historyStore()._trackMap;
    }
    return super.getTrackMap();
  }
}
