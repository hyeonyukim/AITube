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
let editLog = [];
let undoLog = [];
let translated = [];
let stream = [];
let streamCut = [];
let videoLength;
let currentBlock;
let block = [];
let FILE;


function urlGenerator() {
	
}

function loadLocalVID(x)
{
    if (x)
    {
        VID.setAttribute("type", selectedLocalVID.files[0].type);
        VID.setAttribute("src", URL.createObjectURL(selectedLocalVID.files[0]));
    } else
    {
        VID.setAttribute("type", FILE.type);
        VID.setAttribute("src", URL.createObjectURL(FILE));
    }
    preProcess();
    myVideo.load();
    myVideo.pause();
    playButton.innerHTML = '<img src="images/playVideoButton.png" width=20px height=20px alt="">';
}

function preProcess()
{
    //아래 세 변수들은 canvas에 들어가는 버튼을 구현하는 데 쓰입니다.
    let wordDiv;
    let wordBtn;
    let wordBtn2;
    let wordBtnText;
    //아래 세 변수들은 canvas에 들어가는 버튼을 구현하는 데 쓰입니다.
    let wordDivPallet;
    let wordBtnPallet;
    let wordTextPallet;
    let wordBtnTextPallet;
    slider.value = 0;
    currentBlock = 1;
    translated = [];
    stream = [];
    translated.length = source.speechData[0].response.results[0].alternatives[0].words.length + 1;
    //0번째 의미 없는 블럭을 넣어서 맨앞쪽에도 블럭을 삽입할 수 있게 했습니다.-0413수정
    for (i = 0; i <= source.speechData[0].response.results[0].alternatives[0].words.length; ++i)
    {
        if (i == 0)
            translated[i] = {
                startTime: 0 * 1,
                endTime: 0 * 1,
                duration: 0 * 1,
                word: "",
                isValid: true
            };
        else
            translated[i] = {
                startTime: source.speechData[0].response.results[0].alternatives[0].words[i - 1].startTime.slice(0, -1) * 1,
                endTime: source.speechData[0].response.results[0].alternatives[0].words[i - 1].endTime.slice(0, -1) * 1,
                duration: (source.speechData[0].response.results[0].alternatives[0].words[i - 1].endTime.slice(0, -1) * 1 - source.speechData[0].response.results[0].alternatives[0].words[i - 1].startTime.slice(0, -1) * 1).toFixed(3) * 1,
                word: source.speechData[0].response.results[0].alternatives[0].words[i - 1].word,
                isValid: true
            };
        wordDiv = document.createElement('div');
        wordDivPallet = document.createElement('div');
        wordBtn2 = document.createElement('button');
        wordBtnText = document.createTextNode(translated[i].word);
        wordBtnTextPallet = document.createTextNode(translated[i].word);
        //0번째 의미 없는 블럭을 넣어서 맨앞쪽에도 블럭을 삽입할 수 있게 했습니다.-0413수정
        if (i != 0)
        {
            //canvas에 들어가는 요소들입니다.
            wordBtn = document.createElement('button');
            wordBtn.appendChild(wordBtnText);
            wordBtn.setAttribute("draggable", true);
            wordBtn.setAttribute("ondragstart", "drag(event)");
            wordBtn.setAttribute("onclick", "videoMove(this.id)");
            wordBtn.setAttribute("id", "canvas_btn" + i);
            wordDiv.appendChild(wordBtn);
            //pallet에 들어가는 요소들입니다.
            wordBtnPallet = document.createElement('button');
            wordBtnPallet.appendChild(wordBtnTextPallet);
            wordBtnPallet.setAttribute("draggable", true);
            wordBtnPallet.setAttribute("ondragstart", "drag(event)");
            wordBtnPallet.setAttribute("id", "pallet_btn" + i);
            wordTextPallet = document.createElement('span');
            wordTextPallet.innerHTML = translated[i].startTime + '~' + translated[i].endTime;
            wordDivPallet.appendChild(wordBtnPallet);
            wordDivPallet.appendChild(wordTextPallet);
        }

        wordBtn2.setAttribute("id", "canvas_gap" + i);
        wordBtn2.setAttribute("ondrop", "dropCanvas(event)");
        wordBtn2.setAttribute("ondragover", "allowDrop(event)");

        wordDiv.appendChild(wordBtn2);
        wordDiv.setAttribute("id", "canvas_div" + i);
        wordDivPallet.setAttribute("id", "pallet_div" + i);

        document.getElementById("canvas").appendChild(wordDiv);
        document.getElementById("pallet").appendChild(wordDivPallet);
    }

    for (i = 0; i < translated.length; ++i)
        stream.splice(i, 0, translated[i]);
    init();
}
//아래 세 함수들은 드래그 이벤트를 다루는 함수들입니다.
function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    ev.dataTransfer.setData("text", ev.target.id);
    ev.innerHTML = "Wow!";
}

function dropCanvas(ev)
{
    ev.preventDefault();
    //new는 드래그해서 새로 삽입되려 하는 노드입니다.
    //old는 해당 div에 child로 속해있는 노드입니다.
    var data = ev.dataTransfer.getData("text");
    var newBtn = document.getElementById(data);
    //두 노드의 index를 찾아옵니다.
    var new_index = newBtn.parentElement.getAttribute('id').substring(10);
    var old_index = ev.target.parentElement.getAttribute('id').substring(10);
    new_index *= 1;
    old_index *= 1;

    //div 내부에 버튼이 있어서 그런지 버튼 내부에도 드랍이 가능한 문제가 있었습니다.
    //이를 방지하기 위해 드랍하는 target이 div인지 btn인지 id로 구분했습니다.
    if (ev.target.getAttribute('id').charAt(9) == 'p' && newBtn.getAttribute('id').charAt(0) == 'c')
    {
        //log에 추가해줍니다.
        editLog.push({
            type : "switch",
            parameter1 : old_index,
            parameter2 : new_index
        });
        streamSwitch(old_index, new_index);
    }
    //new button이 pallet의 button인 경우 다른 알고리즘을 적용합니다.
    else if (newBtn.getAttribute('id').charAt(0) == 'p')
    {
        
        editLog.push({
            type : "insert",
            parameter1 : old_index,
            parameter2 : new_index
        });
        //old_index : stream index
        //new_index : pallet index
        streamInsert(old_index, new_index);
    }
    //clearing undoLog
    undoLog = [];
}

function dropTrashbin(ev)
{
    //마지막 요소와 해당 요소의 위치를 바꿉니다.
    //마지막 요소를 삭제한 후에 마지막 요소가 맨 뒤에 위치할 때까지 swap합니다.
    //이렇게 하면 stream의 index와 canvas의 index를 보존할 수 있습니다.
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var Btn = document.getElementById(data);
    var streamIndex = Btn.parentElement.getAttribute('id').substring(10);
    for(i=0;i<translated.length; i++){
        if(stream[streamIndex].startTime==translated[i].startTime){
            break;
        }
    }
    editLog.push({
        type : "delete",
        parameter1 : streamIndex,
        parameter2 : i
    });
    //clearing undoLog
    undoLog = [];
    streamDelete(streamIndex);
}

//stream의 index를 전달해서 swap합니다.
function streamSwap(i, j)
{
    //각 index에 해당하는 btn을 불러옵니다.
    var btnI = document.getElementById("canvas_btn" + i);
    var btnJ = document.getElementById("canvas_btn" + j);
    //두 btn의 텍스트 내용을 변경합니다.
    var innerHTMLBuf = btnI.innerHTML;
    btnI.innerHTML = btnJ.innerHTML;
    btnJ.innerHTML = innerHTMLBuf;
    //stream의 내용을 서로 바꿉니다.
    var streamBuf = stream[i];
    stream[i] = stream[j];
    stream[j] = streamBuf;
    videoLengthInit();
}

function streamSwitch(old_index, new_index){
    //new 노드가 old 노드보다 뒤에 있으면 new 노드의 앞에 있는 노드들과 하나씩 swap 하며 움직입니다.
    //반대의 경우 new 노드의 뒤에 있는 노드들과 하나씩 swap하며 움직입니다.
    if (new_index != old_index)
    { //만약 자기자신의 버튼에 넣을경우 에러가 발생해서 방지하였습니다-0413추가
        var direction = (new_index > old_index) ? -1 : 1;
        while ((new_index + direction) != old_index + !!(direction + 1))
        { /*앞블럭에서 뒤블럭로 드래그 할 경우 해당 블럭의 앞까지만 이동하는 현상-0413수정*/
            streamSwap(new_index, new_index + direction);
            new_index += direction;
        }
    }
    videoLengthInit();
}

function streamInsert(streamIndex, palletIndex)
{
    //stream과 canvas의 마지막에 해당 요소를 복사해서 넣습니다.
    //이후 streamSwap함수를 이용해 해당 자리에 버튼을 이동시킵니다.
    //이런 방식을 사용하면 stream의 index와 canvas의 index를 보존할 수 있습니다.
    let index = stream.length;
    let wordDiv = document.createElement('div');
    let wordBtn2 = document.createElement('button');
    let wordBtnText = document.createTextNode(translated[palletIndex].word);
    let wordBtn = document.createElement('button');

    wordBtn.appendChild(wordBtnText);
    wordBtn.setAttribute("draggable", true);
    wordBtn.setAttribute("ondragstart", "drag(event)");
    wordBtn.setAttribute("onclick", "videoMove(this.id)");
    wordBtn.setAttribute("id", "canvas_btn" + index);
    wordDiv.appendChild(wordBtn);

    wordBtn2.setAttribute("id", "canvas_gap" + index);
    wordBtn2.setAttribute("ondrop", "dropCanvas(event)");
    wordBtn2.setAttribute("ondragover", "allowDrop(event)");

    wordDiv.appendChild(wordBtn2);
    wordDiv.setAttribute("id", "canvas_div" + index);

    document.getElementById("canvas").appendChild(wordDiv);

    //stream 마지막에 요소 추가
    stream.splice(stream.length, 0, translated[palletIndex]);

    while ((index - 1) != streamIndex)
    {
        streamSwap(index, --index);
    }
    videoLengthInit();
    
}

function streamDelete(streamIndex)
{
    streamSwap(streamIndex, stream.length - 1);
    //swap된 마지막 요소를 삭제합니다.
    var div = document.getElementById("canvas_div" + (stream.length - 1));
    div.parentNode.removeChild(div);
    stream.splice(stream.length - 1, 1);


    while (streamIndex < stream.length)
    {
        streamSwap(streamIndex, ++streamIndex);
    }
    videoLengthInit();
}

//두 개의 로그 배열을 사용합니다.(커맨드를 저장 하는 editLog, undo 기록을 저장하는 undoLog)
//undo()는 editLog의 맨 뒤에 있는 커맨드의 역연산을 수행합니다.
//undo()는 editLog의 맨 뒤에 있는 커맨드를 삭제하고, 그 커맨드를 undoLog에 저장합니다.
//undo()를 실행한 뒤에 새로운 커맨드를 실행하면, undoLog는 사라집니다.
//redo()는 undoLog의 마지막 element를 삭제하고, 해당 커맨드를 다시 실행해줍니다.

function undo(){
    if(editLog.length>0){
        var lastCommand = editLog.pop();
        undoLog.push(lastCommand);
        if(lastCommand.type=="switch"){
            if(lastCommand.parameter1 < lastCommand.parameter2){
                streamSwitch(lastCommand.parameter2, lastCommand.parameter1+1);
            }
            else{
                streamSwitch(lastCommand.parameter2 - 1, lastCommand.parameter1);
            }
        }
        else if(lastCommand.type=="insert"){
            streamDelete(lastCommand.parameter1+1);
        }
        else if(lastCommand.type=="delete"){
            streamInsert(lastCommand.parameter1-1, lastCommand.parameter2);
        }
    }
}

function redo(){
    if(undoLog.length>0){
        var lastUndo = undoLog.pop();
        editLog.push(lastUndo);
        if(lastUndo.type=="switch"){
            streamSwitch(lastUndo.parameter1, lastUndo.parameter2);
        }
        else if(lastUndo.type=="insert"){
            streamInsert(lastUndo.parameter1, lastUndo.parameter2);
        }
        else if(lastUndo.type=="delete"){
            streamDelete(lastUndo.parameter1);
        }
    }
}

function videoLengthInit()
{
    let i;
    videoLength = 0;
    slider.min = 0;
    block.length = stream.length + 1;
    block[0] = 0;
    for (i = 0; i < stream.length; ++i)
        if (stream[i].isValid)
        {
            videoLength += stream[i].duration;
            if (i != stream.length - 1)
                block[i + 1] = block[i] + stream[i].duration;
        } else if (i != stream.length - 1)
            block[i + 1] = block[i];
    block[stream.length] = Infinity;
    tempEnd.innerHTML = slider.max = videoLength.toFixed(3);
}

function updateSlider(p)
{
    let i;
    let now = 0;
    p *= 1;
    if (p)
    {
        document.getElementById("canvas_btn" + currentBlock).style.backgroundColor = '#fdc23e';
        tempCurrent.innerHTML = p.toFixed(3);
        i = 0;
        while (block[++i] < p);
        currentBlock = i -= 1;
        setCurrentBlockColor();
        myVideo.currentTime = now = p + stream[currentBlock].startTime - block[currentBlock];
        tempCurrent2.innerHTML = myVideo.currentTime.toFixed(3);
    } else
        tempCurrent2.innerHTML = myVideo.currentTime = now = currentBlock = 1;
}

function videoMove(cliked_id)
{
    let index = cliked_id.substring(10);
    document.getElementById("canvas_btn" + currentBlock).style.backgroundColor = '#fdc23e';
    currentBlock = index * 1;
    myVideo.currentTime = stream[index].startTime;
    tempCurrent2.innerHTML = myVideo.currentTime.toFixed(3);
    setCurrentBlockColor();
    videoPlay();
}

function init()
{
    updateSlider();
    videoLengthInit();
}

function onPlay()
{
    let numStart = 0;
    let numEnd = 0;
    setCurrentBlockColor();
    cur = setInterval(() =>
    {
        //동영상의 끝에 도달했을 때
        if (currentBlock >= stream.length)
        {
            videoStop();
            return;
        } else if (!stream[currentBlock].isValid)
        {
            if (currentBlock + 1 >= stream.length)
            {
                videoStop();
                return;
            }
            ++currentBlock;
            setCurrentBlockColor();
            myVideo.currentTime = stream[currentBlock].startTime.toFixed(3) * 1;
            slider.value = (block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime).toFixed(3) * 1;
            return;
        }
        //블록의 끝에 도달했을 때
        else if (stream[currentBlock].endTime.toFixed(3) * 1 <= myVideo.currentTime.toFixed(3) * 1)
        {
            if (currentBlock + 1 >= stream.length)
            {
                videoStop();
                return;
            } else
            {
                ++currentBlock;
                setCurrentBlockColor();
                if (stream[currentBlock - 1].endTime != stream[currentBlock].startTime)
                {
                    myVideo.currentTime = stream[currentBlock].startTime;
                    slider.value = (block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime).toFixed(3) * 1;
                }
            }
        } else if (stream[currentBlock].startTime > myVideo.currentTime.toFixed(3) * 1)
        {
            myVideo.currentTime = stream[currentBlock].startTime;
            slider.value = (block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime).toFixed(3) * 1;
        } else
        {
            slider.value = (block[currentBlock] + myVideo.currentTime - stream[currentBlock].startTime).toFixed(3) * 1;
            tempCurrent.innerHTML = (slider.value * 1).toFixed(3);
            tempCurrent2.innerHTML = myVideo.currentTime.toFixed(3);
            if (slider.value * 1 >= slider.max * 1)
                videoStop();
        }
    }, 5);
}

function setCurrentBlockColor()
{
    if (currentBlock != 0)
    {
        if (currentBlock > 1)
            document.getElementById("canvas_btn" + (currentBlock * 1 - 1)).style.backgroundColor = '#fdc23e';
        document.getElementById("canvas_btn" + currentBlock).style.backgroundColor = 'rgb(236, 92, 76)';
    }
}

function onPause()
{
    clearInterval(cur);
}

function videoPlayPause()
{
    if (!myVideo.paused)
    {
        myVideo.pause();
        document.getElementById("canvas_btn" + currentBlock).style.backgroundColor = '#fdc23e';
        playButton.innerHTML = '<img src="images/playVideoButton.png" width=20px height=20px alt="">';
    } else if (stream.length)
    {
        myVideo.play();
        playButton.innerHTML = '<img src="images/stopVideoButton.png" width=20px height=20px alt="">';
    }
}

function videoPlay()
{
    myVideo.play();
    playButton.innerHTML = '<img src="images/stopVideoButton.png" width=20px height=20px alt="">';
}

function videoStop()
{
    myVideo.pause();
    document.getElementById("canvas_btn" + currentBlock).style.backgroundColor = '#fdc23e';
    playButton.innerHTML = '<img src="images/playVideoButton.png" width=20px height=20px alt="">';
    currentBlock = 1;
    slider.value = 0;
    myVideo.currentTime = 0;
    clearInterval(cur);
}


function dropHandler(ev)
{
    ev.preventDefault();
    if (ev.dataTransfer.items)
    {
        if (ev.dataTransfer.items.length > 1)
        {
            alert("하나만");
            return;
        }
        if (ev.dataTransfer.items[0].kind === 'file')
        {
            blob = ev.dataTransfer.items[0].getAsFile();
            if (blob.type.substring(0, 5) === "video")
            {
                FILE = blob;
                loadLocalVID(false);
            }
        }
    } else
    {
        if (ev.dataTransfer.files.length > 1)
        {
            alert("하나만");
            return;
        }
        if (ev.dataTransfer.items[0].kind === 'file')
        {
            blob = ev.dataTransfer.items[0].getAsFile();
            if (blob.type.substring(0, 5) === "video")
            {
                FILE = blob;
                loadLocalVID(false);
            }
        }
    }
}

function dragOverHandler(ev)
{
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
                        "endTime": "1.200s",
                        "word": "번역"
                    },
                    {
                        "startTime": "1.200s",
                        "endTime": "1.400s",
                        "word": "못"
                    },
                    {
                        "startTime": "1.400s",
                        "endTime": "1.800s",
                        "word": "하지만"
                    },
                    {
                        "startTime": "1.800s",
                        "endTime": "2.300s",
                        "word": "구글의"
                    },
                    {
                        "startTime": "2.300s",
                        "endTime": "2.500s",
                        "word": "인공지능"
                    },
                    {
                        "startTime": "2.500s",
                        "endTime": "3.100s",
                        "word": "번역"
                    },
                    {
                        "startTime": "3.100s",
                        "endTime": "3.700s",
                        "word": "엔진을"
                    },
                    {
                        "startTime": "3.700s",
                        "endTime": "4.100s",
                        "word": "사용을"
                    },
                    {
                        "startTime": "4.100s",
                        "endTime": "4.200s",
                        "word": "해서"
                    },
                    {
                        "startTime": "4.200s",
                        "endTime": "5s",
                        "word": "축하"
                    },
                    {
                        "startTime": "5s",
                        "endTime": "5.300s",
                        "word": "앱을"
                    },
                    {
                        "startTime": "5.300s",
                        "endTime": "5.600s",
                        "word": "만든"
                    },
                    {
                        "startTime": "5.600s",
                        "endTime": "6s",
                        "word": "다음에"
                    },
                    {
                        "startTime": "6s",
                        "endTime": "6.700s",
                        "word": "가운데"
                    },
                    {
                        "startTime": "6.700s",
                        "endTime": "7.200s",
                        "word": "구글에"
                    },
                    {
                        "startTime": "7.200s",
                        "endTime": "7.900s",
                        "word": "엔진을"
                    },
                    {
                        "startTime": "7.900s",
                        "endTime": "8.200s",
                        "word": "넣어서"
                    },
                    {
                        "startTime": "8.200s",
                        "endTime": "8.800s",
                        "word": "스피치"
                    },
                    {
                        "startTime": "8.800s",
                        "endTime": "9s",
                        "word": "투"
                    },
                    {
                        "startTime": "9s",
                        "endTime": "9.200s",
                        "word": "스피치"
                    },
                    {
                        "startTime": "9.200s",
                        "endTime": "9.700s",
                        "word": "번역이"
                    },
                    {
                        "startTime": "9.700s",
                        "endTime": "10.200s",
                        "word": "되면은"
                    },
                    {
                        "startTime": "10.200s",
                        "endTime": "11.200s",
                        "word": "순식간에"
                    },
                    {
                        "startTime": "11.200s",
                        "endTime": "12.800s",
                        "word": "고용"
                    },
                    {
                        "startTime": "12.800s",
                        "endTime": "13.100s",
                        "word": "하지"
                    },
                    {
                        "startTime": "13.100s",
                        "endTime": "13.500s",
                        "word": "않아도"
                    },
                    {
                        "startTime": "13.500s",
                        "endTime": "14.300s",
                        "word": "나는"
                    },
                    {
                        "startTime": "14.300s",
                        "endTime": "15.200s",
                        "word": "얼마든지"
                    },
                    {
                        "startTime": "15.200s",
                        "endTime": "16.300s",
                        "word": "고급스러운"
                    },
                    {
                        "startTime": "16.300s",
                        "endTime": "16.700s",
                        "word": "그런"
                    },
                    {
                        "startTime": "16.700s",
                        "endTime": "17s",
                        "word": "회화"
                    },
                    {
                        "startTime": "17s",
                        "endTime": "17.100s",
                        "word": "학원"
                    },
                    {
                        "startTime": "17.100s",
                        "endTime": "17.500s",
                        "word": "영어"
                    },
                    {
                        "startTime": "17.500s",
                        "endTime": "17.900s",
                        "word": "그거"
                    },
                    {
                        "startTime": "17.900s",
                        "endTime": "18.300s",
                        "word": "제공할"
                    },
                    {
                        "startTime": "18.300s",
                        "endTime": "18.400s",
                        "word": "수"
                    },
                    {
                        "startTime": "18.400s",
                        "endTime": "18.700s",
                        "word": "있다"
                    },
                    {
                        "startTime": "18.700s",
                        "endTime": "19.300s",
                        "word": "아니면은"
                    },
                    {
                        "startTime": "19.300s",
                        "endTime": "19.400s",
                        "word": "그"
                    },
                    {
                        "startTime": "19.400s",
                        "endTime": "20.100s",
                        "word": "어플리케이션"
                    },
                    {
                        "startTime": "20.100s",
                        "endTime": "20.200s",
                        "word": "하나"
                    },
                    {
                        "startTime": "20.200s",
                        "endTime": "20.600s",
                        "word": "만들어"
                    },
                    {
                        "startTime": "20.600s",
                        "endTime": "21s",
                        "word": "놓으면은"
                    },
                    {
                        "startTime": "21s",
                        "endTime": "22s",
                        "word": "5만"
                    },
                    {
                        "startTime": "22s",
                        "endTime": "22.300s",
                        "word": "원으로"
                    },
                    {
                        "startTime": "22.300s",
                        "endTime": "22.900s",
                        "word": "만들어본다"
                    },
                    {
                        "startTime": "22.900s",
                        "endTime": "23.100s",
                        "word": "그럼"
                    },
                    {
                        "startTime": "23.100s",
                        "endTime": "23.600s",
                        "word": "여러분들이"
                    },
                    {
                        "startTime": "23.600s",
                        "endTime": "24.600s",
                        "word": "구글의"
                    },
                    {
                        "startTime": "24.600s",
                        "endTime": "24.800s",
                        "word": "인공지능"
                    },
                    {
                        "startTime": "24.800s",
                        "endTime": "25.300s",
                        "word": "번역"
                    },
                    {
                        "startTime": "25.300s",
                        "endTime": "25.800s",
                        "word": "인증을"
                    },
                    {
                        "startTime": "25.800s",
                        "endTime": "26.200s",
                        "word": "통해서"
                    },
                    {
                        "startTime": "26.200s",
                        "endTime": "26.700s",
                        "word": "통역이"
                    },
                    {
                        "startTime": "26.700s",
                        "endTime": "27.100s",
                        "word": "되는"
                    },
                    {
                        "startTime": "27.100s",
                        "endTime": "27.500s",
                        "word": "모든"
                    },
                    {
                        "startTime": "27.500s",
                        "endTime": "28.100s",
                        "word": "유튜브"
                    },
                    {
                        "startTime": "28.100s",
                        "endTime": "28.700s",
                        "word": "영상을"
                    },
                    {
                        "startTime": "28.700s",
                        "endTime": "29.300s",
                        "word": "언어와"
                    },
                    {
                        "startTime": "29.300s",
                        "endTime": "29.700s",
                        "word": "상관없이"
                    },
                    {
                        "startTime": "29.700s",
                        "endTime": "30s",
                        "word": "항구"
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


function temp(x)
{
    if (!x && tempBlock.value < translated.length)
        stream.splice(tempOrder.value, 0, translated[tempBlock.value]);
    else if (x)
        stream.splice(tempOrder.value, tempBlock.value);
    init();
}