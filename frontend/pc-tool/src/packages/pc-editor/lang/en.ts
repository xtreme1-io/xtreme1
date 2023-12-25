const en = {
    // load
    'load-resource-error': 'Load Resource Error',
    'load-object-error': 'Load Object Error',
    'load-classification-error': 'Load Classification Error',
    'load-class-error': 'Load Class Error',
    'load-model-error': 'Load Models Error',
    'load-dataset-classification-error': 'Load DataSet Classification Error',
    'load-record-error': 'Load Record Error',
    'load-frame-series-error': 'Load FrameSeries Data Error',
    'invalid-query': 'Invalid Query',
    'load-error': 'Load Error',

    // model
    'load-track': 'Tracking....',
    'track-no-data': "No Tracking object found, please check your objects' location and direction",
    'track-no-source': 'No Tracking Objects',
    'track-error': 'Track Error',
    'track-ok': 'Track Success',
    'copy-ok': 'Copy Success',

    // info
    'load-point': 'Loading....',
    'save-ok': 'Save Success',
    'save-error': 'Save Error',
    'model-run-error': 'Model Run Error',
    'model-run-no-data': 'No Model Results',
    'no-point-data': 'No PointCloud Data',
    'play-error': 'Play Error',
    'unknown-error': 'Error',
    'network-error': 'Network Error',
    'login-invalid': 'Login Invalid',
    'not-login': 'Not logged in',
    retry: 'retry',

    // msg
    'msg-not-save': "You didn't save changes?",
    'create-rect-valid': "Don't beyond the picture",

    warnNoObject: 'Please select an object',
    btnDelete: 'Delete',
    deleteTitle: 'You are going to delete this tracking object from all frames.',
    btnCancelText: 'Cancel',
    successDelete: 'Successfully Deleted',
    errorDelete: 'Delete has failed. Please try again',
    selectObject: 'Select an Object',
    noPlayData: 'No Play Data',
    autoLoad: 'Auto-load',
    speedDown: 'Speed Down({{n}} times)',
    speedUp: 'Speed Up({{n}} times)',
    replay: 'Replay',
    pre: 'Pre(←)',
    next: 'Next(→)',
    play: 'Play({{n}} times)',
    pause: 'Pause',
    delete: 'Delete in All Frames',
    timeLine: 'Timeline',
    newBadge: 'New',
    copyLeft1: 'Copy one frame backward (Alt+←)',
    copyRight1: 'Copy one frame forward (Alt+→)',
};

export type ILocale = typeof en;

export { en };
