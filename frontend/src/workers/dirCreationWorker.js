self.onmessage = async (e) => {
    const { dir, dirname, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'createDir');
    params.append('dir', dir);
    params.append('dirname', dirname );

    const res = await fetch(url, { method: 'POST', body: params });
    const payload = await res.json();

    self.postMessage({ payload });
};
