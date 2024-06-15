class Camera {
  constructor(videoNode) {
    this.videoNode = videoNode;
  }

  turnOn() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: 300, height: 300 },
      }).then(stream => {
        this.videoNode.srcObject = stream;
        this.stream = stream;
      });
    }
  }

  turnOff() {
    this.videoNode.pause();

    if (!this.stream) return;
    this.stream.getTracks()[0].stop();
  }

  takePhoto() {
    let canvas = document.createElement('canvas');
    canvas.setAttribute('width', 300);
    canvas.setAttribute('height', 300);

    let ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

    this.photo = ctx.canvas.toDataURL();
    canvas = null;
    ctx = null;

    return this.photo;
  }
}
