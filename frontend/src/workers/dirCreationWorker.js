self.onmessage = async (e) => {
    const { dir, dirname, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'createDir');
    params.append('dir', dir);
    params.append('dirname', dirname );

    try {
        const res = await fetch(url, { method: 'POST', body: params });

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
