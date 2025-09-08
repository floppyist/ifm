self.onmessage = async (e) => {
    const { api, dir, filename, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', api);
    params.append('dir', dir);
    params.append('filename', filename);

    const res = await fetch(url, { method: 'POST', body: params });
    const payload = await res.blob();

    self.postMessage({ payload });
};

