self.onmessage = async (e) => {
    const { dir, filenames, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'getDetailFileInfo');
    params.append('dir', dir);
    params.append('filenames', filenames);

    const res = await fetch(url, { method: 'POST', body: params });

    try {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        } else {
            const payload = await res.json();

            self.postMessage({ payload });
        } 
    } catch (err) {
        self.postMessage({ error: err.message });
    }
};
