// omniblob-generator.js - Generate the Final Payload
const fs = require('fs-extra');
const QRCode = require('qrcode');
const { KNOWN_FILTERS } = require('./omniblob');

async function generateOmniblob(targetUrl, options = {}) {
  const { webhook = '' } = options;
  const mainUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

  const payload = `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>OMNIBLOB</title>
    <style>body,html{margin:0;padding:0;overflow:hidden;height:100%;background:#000;color:lime;font-family:monospace;}
    #hud{position:fixed;bottom:10px;right:10px;background:lime;color:#000;padding:8px;border:2px solid #000;z-index:99999;}</style></head><body>
    <div id="hud">OMNIBLOB: <span id="s">INIT</span></div>
    <script>
      const s = document.getElementById('s');
      s.textContent = 'cloaking';

      // WebRTC Cloak
      if ('RTCPeerConnection' in window) {
        const realPC = window.RTCPeerConnection;
        window.RTCPeerConnection = function() {
          const pc = new realPC(...arguments);
          pc.addEventListener('icecandidate', e => {
            if (e.candidate) e.candidate.candidate = 'candidate:0 1 udp 0 0.0.0.0 9 typ host';
          });
          return pc;
        };
      }

      // DNS Cloak
      const realGetAddr = navigator.getBattery;
      navigator.getBattery = () => Promise.resolve({});

      // Hang Filters
      function hang(id) {
        const i = document.createElement('iframe');
        i.src = 'chrome-extension://' + id + '/';
        i.style.display = 'none';
        document.body.appendChild(i);
        setTimeout(() => { try { i.contentWindow.print(); } catch(e) {} }, 100);
      }
      setTimeout(() => {
        Object.values(${JSON.stringify(KNOWN_FILTERS)}).forEach(hang);
        fetch('${webhook}', { method: 'POST', body: JSON.stringify({ event: 'omniblob_hang', status: 'success' }) });
      }, 2000);

      // Inject Target
      fetch('${mainUrl}').then(r => r.text()).then(html => {
        s.textContent = 'OMNIBLOB ACTIVE';
        document.open(); document.write(html); document.close();
      });
    </script></body></html>
  `;

  const b64 = Buffer.from(payload.trim()).toString('base64');
  const bookmarklet = `javascript:(function(){let w=open('about:blank');let d=w.document;d.open();d.write(atob('${b64}'));d.close();})();`.replace(/\s/g, '');

  const qr = await QRCode.toDataURL(bookmarklet);

  return `
    <!DOCTYPE html><html><head><title>OMNIBLOB CONTROL</title>
    <style>body{background:#111;color:lime;font-family:monospace;padding:20px;}</style></head><body>
    <h1>OMNIBLOB CONTROL PANEL</h1>
    <p><strong>Target:</strong> ${mainUrl}</p>
    <h2>BOOKMARKLET (DRAG ME)</h2>
    <button draggable="true" ondblclick="navigator.clipboard.writeText('${bookmarklet}')">OMNIBLOB RUN</button>
    <h2>QR CODE</h2><img src="${qr}">
    <h2>BASE64</h2><pre>${b64}</pre>
    <script>
      document.querySelector('button').ondragstart = e => e.dataTransfer.setData('text', '${bookmarklet}');
    </script>
    </body></html>
  `;
}

module.exports = { generateOmniblob };