const en = {
    // general
    'track-title': 'Tracking Object',
    'frame-object': 'Frame {{n}} Object',
    'mark-all-true': 'Mark All as True Value',
    'track-id': 'Tracking ID',
    'model-info': 'Model Info',
    'predict-class': 'Predict Class',
    'mark-present': 'Mark as Present',
    'mark-gone': 'Mark as Gone',
    'status-title': 'Status',
    'instances-title': 'Instances',
    'advanced-title': 'Advanced',
    'copy-title': 'Copy',
    'copy-success': 'Copied',
    'no-data': 'No Data',
    // class
    'class-title': 'Class',
    'class-tip-info':
        'Labeling this tracking object as “{{type}}” will clear its attributes in all frames. Are you sure to change?',
    'class-tip-info-standard':
        'Labeling this tracking object as “{{type}}” will rewrite all of its L, W, H. Are you sure to change?',
    'class-length': 'Length',
    'class-width': 'Width',
    'class-height': 'Height',
    'class-points': 'Points',
    'class-recent': 'Recent Classes',
    'class-other': 'Other',

    // type
    'mark-as-standard': 'Set as Standard',
    'mark-standard': 'Standard',
    'mark-no-standard': 'Cancel',
    'object-type': 'Object Type',
    'type-tip-info':
        'Labeling this tracking object as {{type}} will rewrite all of its L, W, H. Are you sure to change?',
    // instance
    'rect-title': 'Rect',
    'box-title': 'Box',
    'cloud-object': 'Cloud Point Object',
    'image-object': 'Image {{index}} Object({{type}})',
    // attributes
    'attributes-title': 'Attributes',
    'attr-copy-from': 'Copy From',
    'attr-copy-to': 'Copy To',
    'attr-from-title': 'Copy attributes from other objects in this frame',
    'attr-from-object': 'Tracking Object',
    'attr-to-title': 'Copy these attributes to other frames of this tracking object',
    'attr-to-tip': '(This will overwrite original attributes)',
    'attr-to-from': 'Frame From({{ n }})',
    'attr-to-to': 'To({{ n }})',
    'attr-from-self': 'Cannot copy from self',
    'attr-from-different-class': 'Cannot copy from different classes',
    // model
    'model-instance': 'Instances',
    'model-confidence': 'Confidence',

    // Merge
    'merge-title': 'Merge',
    'merge-to': 'Merge To',
    'merge-from': 'Merge From',
    'marge-target': 'Target',
    // Split
    'split-title': 'Split',
    'split-btn-title': 'Split from Current Frame',
    'split-new-object': 'New Tracking Object',
    'split-new-class': 'Class',
    // Delete
    'delete-title': 'Delete',
    'delete-all': 'All Frames',
    'delete-some': 'Some Frames',
    'delete-no-true': 'All Non-True Values',
    'delete-all-tip': 'You are going to delete this tracking object in all frames.',
    'delete-some-tip': 'You are going to delete this tracking object in the following frames.',
    'delete-no-true-tip': 'You are going to delete all non-True Values of this tracking object.',
    'delete-from': 'From({{ n }})',
    'delete-to': 'To({{ n }})',

    // btn
    'btn-title-cancel': 'Cancel',
    'btn-title-copy': 'Copy',
    'btn-title-merge': 'Merge',
    'btn-title-split': 'Split',
    'btn-title-delete': 'Delete',
    'btn-title-confirm': 'Confirm',

    // msg
    'msg-delete-title': 'Delete',
    'msg-delete-subtitle': 'Delete Objects?',
    'msg-merge-different-class': 'Cannot merge objects with different classes.',
    'msg-merge-conflict': 'Conflicts detected. Please check in the timeline.',
    'msg-merge-success': 'Merge success',
    'msg-split-empty': 'Cannot create empty object',
    'msg-split-success': 'Split success',
    'msg-delete-success': 'Deleted',
    'msg-copy-success': 'Copied',
    'msg-no-object': 'No Object',

    // const
    Dynamic: 'Dynamic',
    Fixed: 'Fixed',
    Standard: 'Standard',
    Copied: 'Copied',
    Predicted: 'Predicted',
    'True-Value': 'True Value',
};

export type ILocale = typeof en;

export { en };
