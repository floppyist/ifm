self.onmessage = async (e) => {
    const { dir, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'getFiles');
    params.append('dir', dir);

    const res = await fetch(url, { method: 'POST', body: params });
    const files = await res.json();

    self.postMessage({ files });
};

