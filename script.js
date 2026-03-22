let userName = "";
let affection = 0;
let currentScriptIdx = 0;
let currentStep = 0;
let selectedPartner = "";

const scripts = [
    "안녕? 내 이름은 {name}. 난 요새 극심한 줘안먹통을 앓고 있다.",
    "그래서 우리 인세스트 고교에서 가장 인기가 많은, 같은 반 쌍둥이 중 하나에게 고백을 박기로 결심했다.",
    "이른바 이열치열 권법이다. 고백을 거절당한 충격 요법으로 줘안먹통을 이겨내야겠다는 그런 속셈이다.",
    "마침 내일이 화이트데이이기도 하니, 메신저로 고백해 볼까? 의외로 잘 돼서 인기인과 사귀게 될 수도 있겠다."
];

// 1. 게임 시작 로직
function startGame() {
    userName = document.getElementById('user-name-input').value || "무명";
    nextScene('script-scene');
    showNextScript();
}

function showNextScript() {
    if (currentScriptIdx < scripts.length) {
        document.getElementById('script-content').innerText = scripts[currentScriptIdx].replace("{name}", userName);
        currentScriptIdx++;
    } else {
        nextScene('select-scene');
    }
}

// 스페이스바 및 클릭 이벤트
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.getElementById('script-scene').classList.contains('active-scene')) showNextScript();
});
document.getElementById('script-scene').onclick = showNextScript;

// 2. 캐릭터 선택 배경 미리보기
function previewChar(name) {
    const bg = document.getElementById('bg-preview');
    bg.style.opacity = '1';
    bg.style.backgroundImage = `url('images/${name === '태영' ? 'ty_body.png' : 'dy_body.png'}')`;
    bg.style.backgroundSize = 'contain';
    bg.style.backgroundRepeat = 'no-repeat';
    bg.style.backgroundPosition = 'center bottom';
    bg.style.backgroundColor = 'white';
}

function clearPreview() { document.getElementById('bg-preview').style.opacity = '0'; }

// 3. 채팅 데이터
const chatData = {
    "태영": [
        { options: [
            { text: "안녕", score: 0, res: "...갑자기 뭐야? 너 누군데?" },
            { text: "야 이 개새끼야", score: -10, res: "...? 미쳤어? 누구야 너?" },
            { text: "후훗... 이곳이 내가 고교 시기 3년 동안 메모장으로 쓸 곳인가... 나랑 대화하고 싶은 사람은 손", score: -50 }
        ]},
        { options: [
            { text: "나 같은 반인 {name}이야...!", score: 0, res: "...용건이나 말해." },
            { text: "헤어지자고? 너 누군데? 밈 따라한 거야?", score: -10, res: "갑자기 뭔 소리야... 용건 없으면 차단한다." },
            { text: "그거 락 뮤지컬 <백작>에 등장하는 사령관이라는 캐릭터가 연인인 병사를 살려달라고 처들어 온 백작이라는 캐릭터한테 하는 대사인데", score: -50 }
        ]},
        { options: [
            { text: "혹시 오늘이 화이트데이인 거 알아?", score: 0, res: "화이트데이...?" },
            { text: "널 좋아해...! 나랑 사귀자!", score: -50 },
            { text: "나 고백할 게 있어. 나 너로 딸친다. (널 좋아하기도 하고) 무튼 매일매일 신세지고 있다.", score: -50 }
        ]},
        { options: [
            { text: "그래! 좋아하는 사람한테 사탕 주면서 고백하는 날!", score: 0, res: "헉...!!!" },
            { text: "경비 아저씨가 쫓아오는 공포 게임!", score: -50 },
            { text: "화이트데이의 반대말은? 이데트이화~", score: -50 }
        ]}
    ]
};

function updateAffectionDisplay() {
    document.getElementById('affection-display').innerText = '💛 ' + affection;
}

function selectCharacter(name) {
    selectedPartner = name;
    document.getElementById('partner-name').innerText = name;
    const headerPfp = document.getElementById('header-pfp');
    headerPfp.style.backgroundImage = `url('images/${name === '태영' ? 'ty_profile.png' : 'dy_profile.png'}')`;
    headerPfp.style.backgroundColor = name === '태영' ? '#bbdefb' : '#f8bbd0';

    nextScene('chat-scene');
    // 3번: 플레이어 시점 독백을 user 말풍선으로 표시
    addUserMsg("(메신저창이 깨끗하다... 당연하지 난 우리 반의 찐따니까. 이런 인기인과 시시껄렁한 농담 같은 걸 나누어 보았을 리가 없다.)");

    if (name === "다영") {
        // 4번: 다영 루트 - 첫 선택지 표시 후 '...' → 게임오버
        setTimeout(showDayoungOptions, 1000);
    } else {
        setTimeout(showOptions, 1000);
    }
}

// 4번: 다영 루트 전용 선택지 (태영 0단계와 동일)
function showDayoungOptions() {
    const container = document.getElementById('options-bar');
    container.innerHTML = '';
    chatData["태영"][0].options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `> ${opt.text.replace("{name}", userName)}`;
        btn.onclick = () => handleDayoungChoice(opt.text.replace("{name}", userName));
        container.appendChild(btn);
    });
}

function handleDayoungChoice(text) {
    const bar = document.getElementById('options-bar');
    bar.style.pointerEvents = 'none';
    bar.style.opacity = '0.5';
    addUserMsg(text);
    setTimeout(() => {
        addBotMsg("...");
        setTimeout(() => showEnding("그리고 난 다시는 그 애와 대화를 나눌 수 없었다...", false), 2000);
    }, 1000);
}

function showOptions() {
    const container = document.getElementById('options-bar');
    container.innerHTML = '';
    chatData["태영"][currentStep].options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = `> ${opt.text.replace("{name}", userName)}`;
        btn.onclick = () => handleChoice(opt);
        container.appendChild(btn);
    });
}

function handleChoice(opt) {
    const bar = document.getElementById('options-bar');
    bar.style.pointerEvents = 'none';
    bar.style.opacity = '0.5';

    addUserMsg(opt.text.replace("{name}", userName));
    affection += opt.score;
    updateAffectionDisplay(); // 5번: 호감도 표시 업데이트

    setTimeout(() => {
        // 6번: 차단 엔딩 - '...' 보낸 뒤 2초 후 게임오버
        if (affection <= -50) {
            addBotMsg("...");
            setTimeout(() => showEnding("그리고 난 다시는 그 애와 대화를 나눌 수 없었다...", false), 2000);
            return;
        }

        addBotMsg(opt.res);
        currentStep++;
        if (currentStep < 4) {
            bar.style.pointerEvents = 'auto';
            bar.style.opacity = '1';
            showOptions();
        } else {
            // True Ending 시퀀스
            setTimeout(() => {
                addUserMsg("태영아? 태영아?");
                // 7번: 트루엔딩 - ending-scene 먼저, 이후 true-chat-scene으로 전환
                setTimeout(() => {
                    showEnding("그 뒤로 태영이는 내게 다시는 답장하지 않았다...\n난 줘안먹통을 치료하는 데 실패했다.", true);
                }, 2500);
            }, 1500);
        }
    }, 1000);
}

// 메시지 추가 함수 (프로필 포함)
function addBotMsg(txt) {
    const win = document.getElementById('chat-window');
    const pfp = selectedPartner === '태영' ? 'images/ty_profile.png' : 'images/dy_profile.png';
    const color = selectedPartner === '태영' ? '#bbdefb' : '#f8bbd0';

    win.innerHTML += `
        <div class="msg-container bot">
            <div class="bot-pfp" style="background-image: url('${pfp}'); background-color: ${color};"></div>
            <div class="bot-content">
                <div class="bot-name">${selectedPartner}</div>
                <div class="bubble">${txt}</div>
            </div>
        </div>`;
    win.scrollTop = win.scrollHeight;
}

function addUserMsg(txt) {
    const win = document.getElementById('chat-window');
    win.innerHTML += `
        <div class="msg-container user">
            <div class="bubble">${txt}</div>
        </div>`;
    win.scrollTop = win.scrollHeight;
}

// true-chat-scene 메시지 추가 함수
function addTrueChatBotMsg(content) {
    const win = document.getElementById('true-chat-window');
    win.innerHTML += `
        <div class="msg-container bot">
            <div class="bot-pfp" style="background-image: url('images/ty_profile.png'); background-color: #bbdefb;"></div>
            <div class="bot-content">
                <div class="bot-name">태영</div>
                <div class="bubble">${content}</div>
            </div>
        </div>`;
    win.scrollTop = win.scrollHeight;
}

function addTrueChatReplyMsg(txt) {
    const win = document.getElementById('true-chat-window');
    win.innerHTML += `
        <div class="msg-container user">
            <div class="bubble">${txt}</div>
        </div>`;
    win.scrollTop = win.scrollHeight;
}

// 7번: 트루 엔딩 채팅 씬 시퀀스
function showTrueEndingChat() {
    nextScene('true-chat-scene');
    setTimeout(() => {
        addTrueChatBotMsg('<img src="images/candy.png" alt="사탕 기프티콘">');
        setTimeout(() => {
            addTrueChatBotMsg("누나... 해피 화이트데이.");
            setTimeout(() => {
                addTrueChatReplyMsg("너무 늦었잖아? 바보야!");
                setTimeout(() => {
                    document.getElementById('true-ending-overlay').classList.add('show');
                }, 2000);
            }, 2000);
        }, 1500);
    }, 1000);
}


function showEnding(text, isTrue) {
    nextScene('ending-scene');
    const titleEl = document.getElementById('ending-title');
    const retryBtn = document.getElementById('retry-btn');
    if (isTrue) {
        titleEl.style.display = 'none';
        retryBtn.style.display = 'none';
    } else {
        titleEl.style.display = 'block';
        titleEl.innerText = 'GAME OVER';
        retryBtn.style.display = 'block';
    }
    document.getElementById('ending-body').innerText = text;

    if (isTrue) {
        setTimeout(showTrueEndingChat, 3000);
    }
}

function nextScene(id) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active-scene'));
    document.getElementById(id).classList.add('active-scene');
}

function retryGame() { location.reload(); }
