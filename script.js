let bufferCount = 0, dealerCount = 0;

// character 객체
class Character {
    constructor(ownedName, serverId, characterName, isBuffer, power) {
        this.ownedName = ownedName;
        this.serverId = serverId;
        this.characterName = characterName;
        this.isBuffer = isBuffer;
        this.power =power;
    }
}

// 카운트 업데이트 함수
const updateCount = () => {
    const buffer = document.querySelector(".buffer");
    const dealer = document.querySelector(".dealer");

    buffer.textContent = bufferCount;
    dealer.textContent = dealerCount;
}
// 서버명 -> 서버id 변환 함수
const severnameToServerid = (severName) => {
    switch (severName) {
        case "안톤" : {
            return "anton";
        }
        case "바칼" : {
            return "bakal";
        }
        case "카인" : {
            return "cain";
        }
        case "카시야스" : {
            return "casillas";
        }
        case "디레지에" : {
            return "diregie";
        }
        case "힐더" : {
            return "hilder";
        }
        case "프레이" : {
            return "prey";
        }
        case "시로코" : {
            return "siroco";
        }
        default : {
            alert("서버를 잘못 입력했습니다.");
            return false;
        }
    }
}
// 버퍼 확인 함수
const isBuffer = (jobName) => {
    return ["크루세이더", "인챈트리스", "뮤즈"].includes(jobName) ? 1 : 0;
}

async function getCharacter(serverId, characterName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://3.38.183.110:8080/api/v1/party/getCharacter?serverId=${serverId}&characterName=${characterName}`,
            method: "GET",
            dataType: "json",
            success: function(data) {
                console.log("API 응답:", data);
                resolve(data);
            },
            error: function(xhr, status, error) {
                alert("없는 캐릭터이거나, 에러가 발생했습니다.");
                console.log("에러:", error);
                reject(error);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const input_page = document.querySelector(".input");
    const output_page = document.querySelector(".output");
    const person_list = document.querySelector(".person_list");
    const add_person_btn = document.querySelector(".add_person_btn");
    const make_party_btn = document.querySelector(".make_party_btn");
    const back_btn = document.querySelector(".back_btn");

    // person 추가 이벤트
    add_person_btn.addEventListener("click", (e) => {
        e.preventDefault();

        let person = document.createElement("li");
        let personName = prompt("이름을 입력해 주세요.");

        if (personName) {
            person.textContent = personName;
            person.className = personName; /* todo : className 금지어 지정, 중복 체크 */
            person_list.appendChild(person);

            // character 추가 버튼 생성
            let addCharacterBtn = document.createElement("button");
            addCharacterBtn.textContent = "+";
            person.appendChild(addCharacterBtn);

            // character 추가 이벤트
            addCharacterBtn.addEventListener("click", async (e) => {
                e.preventDefault();

                let character = document.createElement("span");
                let id = prompt("'서버명 캐릭터명'을 입력해 주세요.").split(' ');

                if (id) {
                    if (severnameToServerid(id[0]) && id.length === 2) {
                        character.textContent = `[${id[0]}] ${id[1]}`;
                        let info = await getCharacter(severnameToServerid(id[0]), id[1]);
                        character.id = `${severnameToServerid(id[0])}_${id[1]}_${isBuffer(info.jobName)}_${info.power}`;
                        isBuffer(info.jobName) ? character.style.backgroundColor = "pink" : character.style.backgroundColor = "skyblue";
                        if (isBuffer(info.jobName)) {
                            character.style.backgroundColor = "pink";
                            bufferCount++;
                        }
                        else {
                            character.style.backgroundColor = "skyblue";
                            dealerCount++;
                        }
                        person.insertBefore(character, addCharacterBtn);
                        updateCount();

                        // character 삭제 이벤트
                        character.addEventListener("click", (e) => {
                            character.style.backgroundColor === "pink" ? bufferCount-- : dealerCount--;
                            updateCount();
                            character.remove();
                        })
                    }
                }
            })

            // person 삭제 버튼 생성
            let removeBtn = document.createElement("button");
            removeBtn.textContent = "삭제";
            person.appendChild(removeBtn);

            // person 삭제 이벤트
            removeBtn.addEventListener("click", (e) => {
                person.querySelectorAll("span").forEach(character => {
                    character.style.backgroundColor === "pink" ? bufferCount-- : dealerCount--;
                });
                updateCount();
                person.remove();
            })
        }
    })

    // 파티 짜기 이벤트
    make_party_btn.addEventListener("click", (e) => {
        e.preventDefault();

        let totalCount = bufferCount + dealerCount;

        /* todo : 한 사람이 가지고 있는 캐릭터의 개수가 파티의 개수보다 많을 때 파티 생성 안되게 수정 */
        if (totalCount && totalCount % 4 === 0) {
            if (dealerCount / bufferCount === 3) {
                let characterList = [];
                person_list.querySelectorAll("span").forEach(character => {
                    characterList.push(new Character(
                        character.parentElement.className,
                        character.id.split("_")[0],
                        character.id.split("_")[1],
                        character.id.split("_")[2],
                        character.id.split("_")[3]
                    ))
                });
                let partyList = makeParty(characterList);

                input_page.className = "input none";
                output_page.className = "output";
            }
            else {
                alert("버퍼와 딜러의 비율이 맞지 않습니다.");
            }
        }
        else {
            alert("1개의 파티를 만들 캐릭터가 부족합니다.");
        }
    })

    // 돌아가기 이벤트
    back_btn.addEventListener("click", (e) => {
        e.preventDefault();

        input_page.className = "input";
        output_page.className = "output none";
    })
})