self.onmessage = async (e) => {
    const { dir, pattern, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'searchItems');
    params.append('dir', dir);
    params.append('pattern', pattern);

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
