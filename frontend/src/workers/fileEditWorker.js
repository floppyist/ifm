self.onmessage = async (e) => {
    const { dir, filename, newname, content, override, mime_type, url } = e.data;

    const params = new URLSearchParams();
    params.append('api', 'editFile');
    params.append('dir', dir);
    params.append('filename', filename);
    params.append('newname', newname === filename ? '' : newname);
    if (mime_type.startsWith('text') || mime_type === 'application/x-empty') params.append('content', content);
    params.append('override', override);

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
