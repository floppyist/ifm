self.onmessage = async (e) => {
    const { dir, filename, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'getContent');
    params.append('dir', dir);
    params.append('filename', filename );

    const res = await fetch(url, { method: 'POST', body: params });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();

    self.postMessage({ payload });
};
