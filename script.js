document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('tiktok-url');
    const downloadBtn = document.getElementById('download-btn');
    const resultContainer = document.getElementById('result-container');
    const statusMessage = document.getElementById('status-message');
    const loader = document.getElementById('loader');

    // UI Elements for results
    const videoCover = document.getElementById('video-cover');
    const videoTitle = document.getElementById('video-title');
    const videoAuthor = document.getElementById('video-author');
    const dlNoWatermark = document.getElementById('dl-no-watermark');
    const dlMp3 = document.getElementById('dl-mp3');

    downloadBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) {
            showStatus('الرجاء إدخال رابط فيديو تيك توك', 'error');
            return;
        }

        if (!isValidTikTokUrl(url)) {
            showStatus('رابط غير صالح! تأكد من نسخ الرابط من تيك توك بشكل صحيح', 'error');
            return;
        }

        fetchVideoData(url);
    });

    function isValidTikTokUrl(url) {
        return url.includes('tiktok.com');
    }

    async function fetchVideoData(tiktokUrl) {
        setLoading(true);
        showStatus('جاري جلب بيانات الفيديو...', 'info');
        resultContainer.classList.add('hidden');

        try {
            // Using TikWM API (Public & Reliable)
            const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
            
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (result.code === 0 && result.data) {
                displayResult(result.data);
                showStatus('تم العثور على الفيديو بنجاح!', 'success');
            } else {
                throw new Error(result.msg || 'فشل جلب البيانات من السيرفر');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showStatus('عذراً، حدث خطأ أثناء جلب الفيديو. حاول مرة أخرى.', 'error');
        } finally {
            setLoading(false);
        }
    }

    function displayResult(data) {
        videoCover.src = data.cover;
        videoTitle.textContent = data.title || 'فيديو بدون عنوان';
        videoAuthor.textContent = `@${data.author.unique_id}`;
        
        // Links
        dlNoWatermark.onclick = (e) => {
            e.preventDefault();
            downloadFile(data.play, `tiktok_video_${data.id}.mp4`);
        };
        
        dlMp3.onclick = (e) => {
            e.preventDefault();
            downloadFile(data.music, `tiktok_audio_${data.id}.mp3`);
        };

        resultContainer.classList.remove('hidden');
        
        // Smooth scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function downloadFile(url, filename) {
        showStatus('جاري بدء التحميل المباشر...', 'info');
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
            showStatus('تم بدء التحميل بنجاح!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            // Fallback for CORS or other issues
            showStatus('تعذر التحميل المباشر، سيتم فتح الملف في نافذة جديدة', 'info');
            window.open(url, '_blank');
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loader.classList.remove('hidden');
            downloadBtn.disabled = true;
            downloadBtn.style.opacity = '0.7';
        } else {
            loader.classList.add('hidden');
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = '1';
        }
    }

    function showStatus(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = 'status-message ' + type;
        
        if (type === 'error') {
            statusMessage.style.color = '#ff4d4d';
        } else if (type === 'success') {
            statusMessage.style.color = '#00f2ea';
        } else {
            statusMessage.style.color = '#a0a0a0';
        }
    }
});
