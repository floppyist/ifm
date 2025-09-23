self.onmessage = async (e) => {
    const { dir, destination, files, action, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'copyMove');
    params.append('dir', dir);
    params.append('destination', destination);
    params.append('action', action);

    for (const f of files) {
        params.append('filenames[]', f);
    }

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
