const worker: Worker = self as any;

worker.addEventListener('message', async ({ data }) => {
    // const { command, params } = payload;
    console.log('data', data);
});
