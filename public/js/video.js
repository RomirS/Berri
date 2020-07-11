'use strict'

let isInitiator = document.getElementById('isInitiator').value;
let signalTo = document.getElementById('signalTo').value;

const socket = io();
var localStream;
var pc = new RTCPeerConnection();
var remoteStream = new MediaStream();
var turnReady;

var offerAlreadyReceived = false;
var answerAlreadyReceived = false;

const pcConfig = {
  'iceServers': [{
    'url': 'stun:stun.l.google.com:19302'
  }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

var mediaConstraints = {
  video: true,
  audio: true
}

function sendMessage(message) {
  if (!message.to) message.to = signalTo;
  socket.emit('broadcast', message);
}

socket.on('broadcastReceived', async message => {
  if (message.type === 'candidate') {
  var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
  });
  pc.addIceCandidate(candidate);
  } else if (message.offer) {
      console.log('received offer');
      if (offerAlreadyReceived) return;
      offerAlreadyReceived = true;
      doAnswer(message.offer);
  } else if (message.answer) {
      if (answerAlreadyReceived) return;
      answerAlreadyReceived = true;
      await pc.setRemoteDescription(message.answer);
  } else if (message.bye) {
      handleRemoteHangup();
  } else if (message.denied) {
      stop();
  }
});

window.onload = async () => {
  socket.emit('joinRoom', signalTo);
  await setLocalVideo();
  await createPeerConnection(pcConfig);
  await addTracks();
  if (isInitiator == 'false') doOffer();
};

const hangupButton = document.getElementById('hangupButton');
hangupButton.addEventListener('click', hangupAction);
hangupButton.disabled = true;

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

async function setLocalVideo() {
  hangupButton.disabled = false;
  localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  localVideo.srcObject = localStream;
}

async function addTracks() {
  localStream.getTracks().forEach(function(track) {
    pc.addTrack(track, localStream);
  });
}

async function doOffer() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendMessage({'offer': offer});
}

async function doAnswer(offer) {
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  sendMessage({'answer': answer});
}

$('#toggleMute').click(() => {
  toggleTrack(localStream, 'audio')
})

$('#toggleVideo').click(() => {
  toggleTrack(localStream, 'video')
})

function toggleTrack(stream, type) {
  stream.getTracks().forEach((track) => {
      if (track.kind === type) {
          track.enabled = !track.enabled;
      }
  });
}

function hangupAction() {
  sendMessage({bye: true});
  closeCall();
}

function handleRemoteHangup() {
  closeCall();
}

function closeCall() {
  let to = signalTo.substring(0, signalTo.indexOf('+call'));
  sendMessage({'to': to, 'callFinished': true});
  stop();
}

function stop() {
  localStream.getTracks().forEach(function(track) {
    track.stop();
  });
  localStream = null;
  localVideo.srcObject = null;
  remoteStream.getTracks().forEach(function(track) {
    track.stop();
  });
  remoteStream = new MediaStream();
  remoteVideo.srcObject = null;

  pc.close();
  pc = null;
  window.close();
}

/////////////////////////////////////////////////////////

async function createPeerConnection(config) {
  try {
    pc = new RTCPeerConnection(config);

    pc.addEventListener('icecandidate', handleIceCandidate);
    pc.addEventListener('track', async (event) => {
      remoteStream.addTrack(event.track, remoteStream);
      remoteVideo.srcObject = remoteStream;
    });
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    return;
  }
}

function handleIceCandidate(event) {
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

////////////////////////////////////////////////////

if (location.hostname !== 'localhost') {
  console.log('requesting turn')
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

window.onbeforeunload = function() {
  hangupAction();
};