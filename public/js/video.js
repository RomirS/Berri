'use strict'

var isChannelReady = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream = new MediaStream();
var turnReady;

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

////////////////////////////////////////////////

function sendMessage(message) {
  // console.log('Client sending message: ', message);
  socket.emit('broadcast', message);
}

// This client receives a message
socket.on('broadcastReceived', async message => {
  // console.log('Client received message:', message);
  if (message.offer) {
    console.log('received offer')
    await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
    doAnswer();
  } else if (message.answer && isStarted) {
    await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

socket.on('isReady', () => {
  isChannelReady = true;
});

/////////////////////////////////////////////

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

callButton.disabled = true;
hangupButton.disabled = true;

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

createPeerConnection(pcConfig);

async function startAction() {
  startButton.disabled = true;
  localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  localVideo.srcObject = localStream;
  callButton.disabled = false;
}

async function callAction() {
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    isStarted = true;
    hangupButton.disabled = false;
    localStream.getTracks().forEach(function(track) {
      pc.addTrack(track, localStream);
    });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendMessage({'offer': offer});
  } else {
    console.log('channel ready:', isChannelReady);
    console.log('isStarted: ', isStarted);
  }
}

function hangupAction() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
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
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
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

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

async function doAnswer() {
  console.log('Sending answer to peer.');
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  sendMessage({'answer': answer});
  // pc.createAnswer().then(
  //   setLocalAndSendMessage,
  //   onCreateSessionDescriptionError
  // );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
}

function stop() {
  isChannelReady = false;
  isStarted = false;
  hangupButton.disabled = true;
  callButton.disabled = true;
  pc.close();
  pc = null;
}

////////////////////////////////////////////////////

if (location.hostname !== 'localhost') {
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
  sendMessage('bye');
};