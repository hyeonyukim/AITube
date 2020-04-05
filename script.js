const slider = document.getElementById("slider");
const myVideo = document.getElementById("myVideo");
const playButton = document.getElementById("playButton");
let selectedLocalVID = document.getElementById("newlocalFILE");
let VID = document.getElementById("VID");
const tempOrder = document.getElementById("order");
const tempBlock = document.getElementById("block");
const tempEnd = document.getElementById("end");
const tempCurrent = document.getElementById("current1");
const tempCurrent2 = document.getElementById("current2");
let i;
let source;
let translated = [];
let stream = [];
let videoLength;
let currentBlock;
let block = [];
let FILE;


function loadLocalVID(x) {
    console.log(x);
    if (x) {
        VID.setAttribute("type", selectedLocalVID.files[0].type);
        VID.setAttribute("src", URL.createObjectURL(selectedLocalVID.files[0]));
    } else {
        VID.setAttribute("type", FILE.type);
        VID.setAttribute("src", URL.createObjectURL(FILE));
    }
    preProcess();
    myVideo.load();
    myVideo.pause();
    playButton.innerHTML = '<img src="images/playVideoButton.png" width=20px height=20px alt="">';
}

function preProcess() {
    slider.value = 0;
    currentBlock = 0;
    translated = [];
    stream = [];
    translated.length = source.speechData[0].response.results[0].alternatives[0].words.length;
    for (i = 0; i < source.speechData[0].response.results[0].alternatives[0].words.length; ++i) {
        translated[i] = {
            startTime: source.speechData[0].response.results[0].alternatives[0].words[i].startTime.slice(0, -1) * 1,
            endTime: source.speechData[0].response.results[0].alternatives[0].words[i].endTime.slice(0, -1) * 1,
            duration: source.speechData[0].response.results[0].alternatives[0].words[i].endTime.slice(0, -1) * 1 - source.speechData[0].response.results[0].alternatives[0].words[i].startTime.slice(0, -1) * 1,
            isValid: true
        };
    }
    for (i = 0; i < translated.length; ++i)
        stream.splice(i, 0, translated[i]);
    init();
}

function videoLengthInit() {
    let i;
    videoLength = 0;
    slider.min = 0;
    block.length = stream.length + 1;
    block[0] = 0;
    for (i = 0; i < stream.length; ++i)
        if (stream[i].isValid) {
            videoLength += stream[i].duration;
            if (i != stream.length - 1)
                block[i + 1] = block[i] + stream[i].duration;
        } else if (i != stream.length - 1)
        block[i + 1] = block[i];
    block[stream.length] = Infinity;
    tempEnd.innerHTML = slider.max = videoLength.toFixed(3);
}

function updateSlider(p) {
    let i;
    let now = 0;
    p *= 1;
    if (p) {
        tempCurrent.innerHTML = p.toFixed(3);
        i = 0;
        while (block[++i] < p);
        currentBlock = i -= 1;
        myVideo.currentTime = now = p + stream[currentBlock].startTime - block[currentBlock];
        tempCurrent2.innerHTML = myVideo.currentTime.toFixed(3);
    } else
        tempCurrent2.innerHTML = myVideo.currentTime = now = currentBlock = 0;
}

function init() {
    updateSlider();
    videoLengthInit();
}

function onPlay() {
    let numStart = 0;
    let numEnd = 0;
    cur = setInterval(() => {
        if (currentBlock >= stream.length) {
            videoStop();
            return;
        } else if (!stream[currentBlock].isValid) {
            if (currentBlock + 1 >= stream.length) {
                videoStop();
                return;
            }
            ++currentBlock;
            myVideo.currentTime = stream[currentBlock].startTime;
            slider.value = block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime;
            return;
        } else if (stream[currentBlock].endTime <= myVideo.currentTime)
            if (currentBlock + 1 >= stream.length) {
                videoStop();
                return;
            } else {
                ++currentBlock;
                if (stream[currentBlock - 1].endTime != stream[currentBlock].startTime) {
                    myVideo.currentTime = stream[currentBlock].startTime;
                    slider.value = block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime;
                }
            }
        else if (stream[currentBlock].startTime > myVideo.currentTime) {
            console.log(myVideo.currentTime, stream[currentBlock].startTime);
            myVideo.currentTime = stream[currentBlock].startTime;
            slider.value = block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime;
        } else {
            slider.value = block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime;
            tempCurrent.innerHTML = (slider.value * 1).toFixed(3);
            tempCurrent2.innerHTML = myVideo.currentTime.toFixed(3);
            if (slider.value * 1 >= slider.max * 1)
                videoStop();
        }
    }, 10);
}

function onPause() {
    clearInterval(cur);
}

function videoPlayPause() {
    if (!myVideo.paused) {
        myVideo.pause();
        playButton.innerHTML = '<img src="images/playVideoButton.png" width=20px height=20px alt="">';
    } else if (stream.length) {
        myVideo.play();
        playButton.innerHTML = '<img src="images/stopVideoButton.png" width=20px height=20px alt="">';
    }
}

function videoStop() {
    myVideo.pause();
    playButton.innerHTML = '<img src="images/playVideoButton.png" width=20px height=20px alt="">';
    currentBlock = 0;
    slider.value = 0;
    myVideo.currentTime = 0;
    clearInterval(cur);
}


function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        if (ev.dataTransfer.items.length > 1) {
            alert("하나만");
            return;
        }
        if (ev.dataTransfer.items[0].kind === 'file') {
            blob = ev.dataTransfer.items[0].getAsFile();
            if (blob.type.substring(0, 5) === "video") {
                FILE = blob;
                loadLocalVID(false);
            }
        }
    } else {
        if (ev.dataTransfer.files.length > 1) {
            alert("하나만");
            return;
        }
        if (ev.dataTransfer.items[0].kind === 'file') {
            blob = ev.dataTransfer.items[0].getAsFile();
            if (blob.type.substring(0, 5) === "video") {
                FILE = blob;
                loadLocalVID(false);
            }
        }
    }
}

function dragOverHandler(ev) {
    ev.preventDefault();
}

myVideo.src
source = {
    "status": "ok!",
    "user": {
        "uid": "FTllieCREkh9LTHbKIWuQD67lKo1",
        "email": "sinsky1@naver.com"
    },
    "speechRes": [{
        "time": "2020-01-10T15:17:31+09:00",
        "speech_name": "861235753057941076"
    }],
    "name": "8b57f1383f071d302a35a5e4812aeaf7",
    "speechData": [{
        "name": "861235753057941076",
        "metadata": {
            "@type": "type.googleapis.com\/google.cloud.speech.v1p1beta1.LongRunningRecognizeMetadata",
            "progressPercent": 100,
            "startTime": "2020-01-10T06:17:31.014079Z",
            "lastUpdateTime": "2020-01-10T06:17:42.441891Z"
        },
        "done": true,
        "response": {
            "@type": "type.googleapis.com\/google.cloud.speech.v1p1beta1.LongRunningRecognizeResponse",
            "results": [{
                "alternatives": [{
                    "transcript": "번역 못 하지만 구글의 인공지능 번역 엔진을 사용을 해서 축하 앱을 만든 다음에 가운데 구글에 엔진을 넣어서 스피치 투 스피치 번역이 되면은 순식간에 고용 하지 않아도 나는 얼마든지 고급스러운 그런 회화 학원 영어 그거 제공할 수 있다 아니면은 그 어플리케이션 하나 만들어 놓으면은 5만 원으로 만들어본다 그럼 여러분들이 구글의 인공지능 번역 인증을 통해서 통역이 되는 모든 유튜브 영상을 언어와 상관없이 항구",
                    "confidence": 0.90789497,
                    "words": [{
                            "startTime": "0s",
                            "endTime": "1.000s",
                            "word": "번역"
                        },
                        {
                            "startTime": "1.000s",
                            "endTime": "2.000s",
                            "word": "못"
                        },
                        {
                            "startTime": "2.000s",
                            "endTime": "3.000s",
                            "word": "하지만"
                        },
                        {
                            "startTime": "3.000s",
                            "endTime": "4.000s",
                            "word": "하지만"
                        }
                    ]
                }],
                "languageCode": "ko-kr"
            }]
        }
    }],
    "uploadRes": [{
        "mediaLink": "https:\/\/storage.googleapis.com\/download\/storage\/v1\/b\/aitube_bucket\/o\/8b57f1383f071d302a35a5e4812aeaf7.000.mp3?generation=1578637050426182&alt=media",
        "timeCreated": "2020-01-10T06:17:30.426Z"
    }],
    "file": {
        "originalname": "temp_sound311400262.mp3",
        "upload_time": "2020-01-10T15:17:28+09:00",
        "path": "\/www\/uploads\/8b57f1383f071d302a35a5e4812aeaf7",
        "number": 1
    }
}


function temp(x) {
    if (!x && tempBlock.value < translated.length)
        stream.splice(tempOrder.value, 0, translated[tempBlock.value]);
    else if (x)
        stream.splice(tempOrder.value, tempBlock.value);
    init();
}