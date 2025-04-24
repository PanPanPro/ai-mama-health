let stream = null;

document.getElementById('startCamera').addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('video');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('capture').style.display = 'inline';
    document.getElementById('startCamera').style.display = 'none';
  } catch (error) {
    alert('无法访问摄像头: ' + error.message);
  }
});

document.getElementById('capture').addEventListener('click', () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  stream.getTracks().forEach(track => track.stop());
  video.style.display = 'none';
  canvas.style.display = 'block';
  document.getElementById('capture').style.display = 'none';
  document.getElementById('startCamera').style.display = 'inline';
});

document.getElementById('healthForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  document.getElementById('progress').style.display = 'block';
  document.getElementById('result').innerHTML = '';

  const formData = new FormData();
  formData.append('age', document.getElementById('age').value);
  formData.append('gender', document.getElementById('gender').value);
  formData.append('weight', document.getElementById('weight').value);
  formData.append('height', document.getElementById('height').value);

  const reportImage = document.getElementById('reportImage').files[0];
  const canvas = document.getElementById('canvas');
  if (reportImage) {
    formData.append('reportImage', reportImage);
  } else if (canvas.style.display === 'block') {
    canvas.toBlob(blob => {
      formData.append('reportImage', blob, 'capture.png');
      sendRequest(formData);
    });
    return;
  }

  sendRequest(formData);
});

async function sendRequest(formData) {
  try {
    const response = await fetch('/api/analyze-report', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    document.getElementById('progress').style.display = 'none';

    if (result.status) {
      const data = result.data;
      let html = '<h2>分析结果</h2>';
      html += '<h3>指标分析</h3><ul>';
      data['指标分析'].forEach(item => {
        html += `<li><strong>${item.指标}</strong>: ${item.状态} - ${item.说明}</li>`;
      });
      html += '</ul>';
      html += `<h3>饮食建议</h3><p>${data.饮食建议}</p>`;
      html += '<h3>营养重点</h3><ul>';
      data.营养重点.forEach(item => html += `<li>${item}</li>`);
      html += '</ul>';
      html += '<h3>忌口建议</h3><ul>';
      data.忌口建议.forEach(item => html += `<li>${item}</li>`);
      html += '</ul>';
      document.getElementById('result').innerHTML = html;
    } else {
      document.getElementById('result').innerHTML = '<p>分析失败: ' + result.message + '</p>';
    }
  } catch (error) {
    document.getElementById('progress').style.display = 'none';
    document.getElementById('result').innerHTML = '<p>错误: ' + error.message + '</p>';
  }
}
